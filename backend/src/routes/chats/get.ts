import type { FastifyInstance } from "fastify";
import { getDB } from "../../db";
import { requireUserId } from "../../services/user";
import type { Chat, Message } from "../../types";

export function registerGetChat(fastify: FastifyInstance): void {
  fastify.get<{ Params: { id: string } }>("/chats/:id", async (req, reply) => {
    const userId = requireUserId(req, reply);
    if (!userId) return;

    const db = getDB();
    const { id } = req.params;

    const chat = db
      .query<Chat, [string, string]>(
        "SELECT id, user_id, title, created_at, updated_at FROM chats WHERE id = ? AND user_id = ?",
      )
      .get(id, userId);

    if (!chat) {
      return reply.status(404).send({ error: "Chat not found" });
    }

    const messages = db
      .query<Message, [string]>(
        "SELECT id, chat_id, role, content, created_at FROM messages WHERE chat_id = ? ORDER BY created_at ASC",
      )
      .all(id);

    const { user_id: _user_id, ...clientChat } = chat;
    return reply.send({ ...clientChat, messages });
  });
}
