import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { getDB } from "../../db";
import { requireUserId } from "../../services/user";
import type { Chat } from "../../types";

export function registerCreateChat(fastify: FastifyInstance): void {
  fastify.post("/chats", async (req, reply) => {
    const userId = requireUserId(req, reply);
    if (!userId) return;

    const db = getDB();
    const id = nanoid();
    const now = Date.now();

    db.run(
      "INSERT INTO chats (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      [id, userId, "", now, now],
    );

    const chat = db
      .query<Chat, [string, string]>(
        "SELECT id, user_id, title, created_at, updated_at FROM chats WHERE id = ? AND user_id = ?",
      )
      .get(id, userId);

    if (!chat) {
      return reply.status(500).send({ error: "Failed to create chat" });
    }

    const { user_id: _user_id, ...clientChat } = chat;
    return reply.status(201).send(clientChat);
  });
}
