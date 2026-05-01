import type { FastifyInstance } from "fastify";
import { getDB } from "../../db";
import { streamAssistantReply } from "../../services/messages";
import { requireUserId } from "../../services/user";
import type { Chat } from "../../types";

const MAX_CONTENT_LENGTH = 32_000;

export function registerSendMessage(fastify: FastifyInstance): void {
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
            content: { type: "string", minLength: 1, maxLength: MAX_CONTENT_LENGTH },
          },
        },
      },
    },
    async (req, reply) => {
      const userId = requireUserId(req, reply);
      if (!userId) return;

      const db = getDB();
      const { id } = req.params;
      const { content } = req.body;

      const chat = db
        .query<Pick<Chat, "id">, [string, string]>(
          "SELECT id FROM chats WHERE id = ? AND user_id = ?",
        )
        .get(id, userId);

      if (!chat) {
        return reply.status(404).send({ error: "Chat not found" });
      }

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      for await (const event of streamAssistantReply(userId, id, content, req.log)) {
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
      }

      reply.raw.end();
    },
  );
}
