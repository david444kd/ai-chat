import { getDB } from "../db";
import { completion } from "./openrouter";
import type { OpenRouterMessage, Message } from "../types";

const TOKEN_LIMIT = 3000;
const KEEP_LAST = 6;

function estimateTokens(messages: Message[]): number {
  return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
}

export async function buildContext(chatId: string): Promise<OpenRouterMessage[]> {
  const db = getDB();

  const messages = db
    .query<Message, [string]>(
      "SELECT id, chat_id, role, content, created_at FROM messages WHERE chat_id = ? ORDER BY created_at ASC"
    )
    .all(chatId);

  if (estimateTokens(messages) < TOKEN_LIMIT) {
    return messages.map((m) => ({ role: m.role, content: m.content }));
  }

  const lastSix = messages.slice(-KEEP_LAST);
  const oldMessages = messages.slice(0, -KEEP_LAST);

  const conversationText = oldMessages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

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
