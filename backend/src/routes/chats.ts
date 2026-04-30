import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { getDB } from "../db";
import { completion } from "../services/openrouter";
import type { Chat, Message } from "../types";

export async function chatsRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/chats
  fastify.get("/chats", async (_req, reply) => {
    const db = getDB();
    const chats = db
      .query<Chat, []>(
        "SELECT id, title, created_at, updated_at FROM chats ORDER BY updated_at DESC"
      )
      .all();
    return reply.send(chats);
  });

  // POST /api/chats
  fastify.post("/chats", async (_req, reply) => {
    const db = getDB();
    const id = nanoid();
    const now = Date.now();

    db.run(
      "INSERT INTO chats (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
      [id, "", now, now]
    );

    const chat = db
      .query<Chat, [string]>("SELECT id, title, created_at, updated_at FROM chats WHERE id = ?")
      .get(id);

    return reply.status(201).send(chat);
  });

  // GET /api/chats/:id
  fastify.get<{ Params: { id: string } }>("/chats/:id", async (req, reply) => {
    const db = getDB();
    const { id } = req.params;

    const chat = db
      .query<Chat, [string]>("SELECT id, title, created_at, updated_at FROM chats WHERE id = ?")
      .get(id);

    if (!chat) {
      return reply.status(404).send({ error: "Chat not found" });
    }

    const messages = db
      .query<Message, [string]>(
        "SELECT id, chat_id, role, content, created_at FROM messages WHERE chat_id = ? ORDER BY created_at ASC"
      )
      .all(id);

    return reply.send({ ...chat, messages });
  });

  // DELETE /api/chats/:id
  fastify.delete<{ Params: { id: string } }>("/chats/:id", async (req, reply) => {
    const db = getDB();
    const { id } = req.params;

    const chat = db
      .query<Chat, [string]>("SELECT id FROM chats WHERE id = ?")
      .get(id);

    if (!chat) {
      return reply.status(404).send({ error: "Chat not found" });
    }

    db.run("DELETE FROM chats WHERE id = ?", [id]);
    return reply.status(204).send();
  });

  // POST /api/chats/:id/generate-title
  fastify.post<{ Params: { id: string } }>("/chats/:id/generate-title", async (req, reply) => {
    const db = getDB();
    const { id } = req.params;

    const firstMessage = db
      .query<Message, [string]>(
        "SELECT content FROM messages WHERE chat_id = ? AND role = 'user' ORDER BY created_at ASC LIMIT 1"
      )
      .get(id);

    if (!firstMessage) {
      return reply.status(400).send({ error: "No messages in chat" });
    }

    let title = "";
    try {
      title = await completion([
        {
          role: "user",
          content: `Generate a short title (max 5 words) for a conversation that starts with: ${firstMessage.content}. Reply with the title only, no quotes.`,
        },
      ]);
      title = title.trim().replace(/^["']|["']$/g, "");
    } catch {
      title = firstMessage.content.slice(0, 50);
    }

    db.run("UPDATE chats SET title = ?, updated_at = ? WHERE id = ?", [title, Date.now(), id]);

    return reply.send({ title });
  });
}
