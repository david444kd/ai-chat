import type { FastifyInstance } from "fastify";
import { getDB } from "../../db";
import { generateTitle } from "../../services/title";
import { requireUserId } from "../../services/user";
import type { Chat, Message } from "../../types";

export function registerGenerateTitle(fastify: FastifyInstance): void {
  fastify.post<{ Params: { id: string } }>("/chats/:id/generate-title", async (req, reply) => {
    const userId = requireUserId(req, reply);
    if (!userId) return;

    const db = getDB();
    const { id } = req.params;

    const chat = db
      .query<Pick<Chat, "id">, [string, string]>(
        "SELECT id FROM chats WHERE id = ? AND user_id = ?",
      )
      .get(id, userId);

    if (!chat) {
      return reply.status(404).send({ error: "Chat not found" });
    }

    const firstMessage = db
      .query<Pick<Message, "content">, [string]>(
        "SELECT content FROM messages WHERE chat_id = ? AND role = 'user' ORDER BY created_at ASC LIMIT 1",
      )
      .get(id);

    if (!firstMessage) {
      return reply.status(400).send({ error: "No messages in chat" });
    }

    await generateTitle(userId, id, firstMessage.content);

    const updated = db
      .query<Pick<Chat, "title">, [string]>("SELECT title FROM chats WHERE id = ?")
      .get(id);

    return reply.send({ title: updated?.title ?? "" });
  });
}
