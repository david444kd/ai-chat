import type { FastifyBaseLogger } from "fastify";
import { nanoid } from "nanoid";
import { getDB } from "../db";
import { buildContext } from "./context";
import { streamCompletion } from "./openrouter";
import { generateTitle } from "./title";

export async function* streamAssistantReply(
  userId: string,
  chatId: string,
  content: string,
  log: FastifyBaseLogger,
): AsyncGenerator<
  | { type: "delta"; content: string }
  | { type: "done"; messageId: string }
  | { type: "error"; message: string }
> {
  const db = getDB();

  const msgCountRow = db
    .query<{ count: number }, [string]>("SELECT COUNT(*) as count FROM messages WHERE chat_id = ?")
    .get(chatId);
  const isFirstMessage = (msgCountRow?.count ?? 0) === 0;

  const userMsgId = nanoid();
  const now = Date.now();

  db.run("INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)", [
    userMsgId,
    chatId,
    "user",
    content,
    now,
  ]);
  db.run("UPDATE chats SET updated_at = ? WHERE id = ?", [now, chatId]);

  const contextMessages = await buildContext(chatId);
  const assistantMsgId = nanoid();
  let fullContent = "";

  try {
    log.info({ chatId, model: process.env.LLM_MODEL }, "openrouter stream start");

    for await (const chunk of streamCompletion(contextMessages)) {
      fullContent += chunk;
      yield { type: "delta", content: chunk };
    }

    log.info({ chatId, chars: fullContent.length }, "openrouter stream done");

    const assistantNow = Date.now();
    db.run("INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)", [
      assistantMsgId,
      chatId,
      "assistant",
      fullContent,
      assistantNow,
    ]);
    db.run("UPDATE chats SET updated_at = ? WHERE id = ?", [assistantNow, chatId]);

    yield { type: "done", messageId: assistantMsgId };

    if (isFirstMessage) {
      generateTitle(userId, chatId, content).catch((err) =>
        log.warn({ err, chatId }, "title generation failed"),
      );
    }
  } catch (err) {
    log.error({ err, chatId }, "openrouter stream error");
    const message = err instanceof Error ? err.message : "Unknown error";
    yield { type: "error", message };
  }
}
