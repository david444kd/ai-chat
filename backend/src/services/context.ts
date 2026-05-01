import { getDB } from "../db";
import type { Message, OpenRouterMessage } from "../types";
import { completion } from "./openrouter";

const TOKEN_LIMIT = 3000;
const KEEP_LAST = 6;

function estimateTokens(messages: Message[]): number {
  // count UTF-16 code units; non-BMP chars cost 2 each, avg ~3 chars/token
  return messages.reduce((sum, m) => {
    let bytes = 0;
    for (const ch of m.content) bytes += (ch.codePointAt(0) ?? 0) > 0xffff ? 2 : 1;
    return sum + Math.ceil(bytes / 3);
  }, 0);
}

export async function buildContext(chatId: string): Promise<OpenRouterMessage[]> {
  const db = getDB();

  const messages = db
    .query<Message, [string]>(
      "SELECT id, chat_id, role, content, created_at FROM messages WHERE chat_id = ? ORDER BY created_at ASC",
    )
    .all(chatId);

  if (estimateTokens(messages) < TOKEN_LIMIT) {
    return messages.map((m) => ({ role: m.role, content: m.content }));
  }

  const lastSix = messages.slice(-KEEP_LAST);
  const oldMessages = messages.slice(0, -KEEP_LAST);

  const conversationText = oldMessages.map((m) => `${m.role}: ${m.content}`).join("\n");

  let summary = "";
  try {
    summary = await completion([
      {
        role: "user",
        content: `Briefly summarize this conversation in 3-5 sentences:\n\n${conversationText}`,
      },
    ]);
  } catch {
    // if summarization fails, just use the last messages
  }

  const result: OpenRouterMessage[] = [];

  if (summary) {
    result.push({
      role: "system",
      content: `Previous conversation summary: ${summary}`,
    });
  }

  result.push(...lastSix.map((m) => ({ role: m.role, content: m.content })));

  return result;
}
