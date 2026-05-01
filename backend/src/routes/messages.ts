import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { nanoid } from "nanoid";
import { getDB } from "../db";
import { streamCompletion } from "../services/openrouter";
import { buildContext } from "../services/context";
import { requireUserId } from "../services/user";
import type { Chat, Message } from "../types";

export async function messagesRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Params: { id: string };
    Body: { content: string };
  }>(
    "/chats/:id/messages",
    {
      schema: {
        body: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (req: FastifyRequest<{ Params: { id: string }; Body: { content: string } }>, reply: FastifyReply) => {
      const userId = requireUserId(req, reply);
      if (!userId) return;

      const db = getDB();
      const { id } = req.params;
      const { content } = req.body;

      const chat = db
        .query<Pick<Chat, "id">, [string, string]>("SELECT id FROM chats WHERE id = ? AND user_id = ?")
        .get(id, userId);

      if (!chat) {
        return reply.status(404).send({ error: "Chat not found" });
      }

      // Count existing messages to know if this is the first
      const msgCount = db
        .query<{ count: number }, [string]>(
          "SELECT COUNT(*) as count FROM messages WHERE chat_id = ?"
        )
        .get(id);
      const isFirstMessage = (msgCount?.count ?? 0) === 0;

      // Save user message
      const userMsgId = nanoid();
      const now = Date.now();
      db.run(
        "INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
        [userMsgId, id, "user", content, now]
      );
      db.run("UPDATE chats SET updated_at = ? WHERE id = ?", [now, id]);

      // Build context
      const contextMessages = await buildContext(id);

      // Set SSE headers
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      });

      let fullContent = "";
      const assistantMsgId = nanoid();

      try {
        for await (const chunk of streamCompletion(contextMessages)) {
          fullContent += chunk;
          const event = JSON.stringify({ type: "delta", content: chunk });
          reply.raw.write(`data: ${event}\n\n`);
        }

        // Save complete assistant message
        const assistantNow = Date.now();
        db.run(
          "INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
          [assistantMsgId, id, "assistant", fullContent, assistantNow]
        );
        db.run("UPDATE chats SET updated_at = ? WHERE id = ?", [assistantNow, id]);

        const doneEvent = JSON.stringify({ type: "done", messageId: assistantMsgId });
        reply.raw.write(`data: ${doneEvent}\n\n`);

        // Generate title for first message (non-blocking)
        if (isFirstMessage) {
          generateTitle(userId, id, content).catch(() => {});
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        const errorEvent = JSON.stringify({ type: "error", message: errorMsg });
        reply.raw.write(`data: ${errorEvent}\n\n`);
      }

      reply.raw.end();
    }
  );
}

async function generateTitle(userId: string, chatId: string, firstMessage: string): Promise<void> {
  const { completion } = await import("../services/openrouter");
  const db = getDB();

  let title = "";
  try {
    title = await completion([
      {
        role: "user",
        content: `Generate a short title (max 5 words) for a conversation that starts with: ${firstMessage}. Reply with the title only, no quotes.`,
      },
    ]);
    title = title.trim().replace(/^["']|["']$/g, "");
  } catch {
    title = firstMessage.slice(0, 50);
  }

  db.run("UPDATE chats SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?", [
    title,
    Date.now(),
    chatId,
    userId,
  ]);
}
