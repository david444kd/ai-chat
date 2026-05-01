import type { FastifyInstance } from "fastify";
import { getDB } from "../../db";
import { requireUserId } from "../../services/user";
import type { Chat } from "../../types";

export function registerListChats(fastify: FastifyInstance): void {
  fastify.get("/chats", async (req, reply) => {
    const userId = requireUserId(req, reply);
    if (!userId) return;

    const chats = getDB()
      .query<Chat, [string]>(
        "SELECT id, user_id, title, created_at, updated_at FROM chats WHERE user_id = ? ORDER BY updated_at DESC",
      )
      .all(userId)
      .map(({ user_id: _user_id, ...chat }) => chat);

    return reply.send(chats);
  });
}
