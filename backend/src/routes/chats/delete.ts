import type { FastifyInstance } from "fastify";
import { getDB } from "../../db";
import { requireUserId } from "../../services/user";
import type { Chat } from "../../types";

export function registerDeleteChat(fastify: FastifyInstance): void {
  fastify.delete<{ Params: { id: string } }>("/chats/:id", async (req, reply) => {
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

    db.run("DELETE FROM chats WHERE id = ? AND user_id = ?", [id, userId]);
    return reply.status(204).send();
  });
}
