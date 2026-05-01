import type { FastifyRequest, FastifyReply } from "fastify";

export function requireUserId(req: FastifyRequest, reply: FastifyReply): string | null {
  const raw = req.headers["x-user-id"];
  const userId = typeof raw === "string" ? raw.trim() : Array.isArray(raw) ? raw[0]?.trim() : "";

  if (!userId) {
    reply.status(400).send({ error: "Missing x-user-id header" });
    return null;
  }

  return userId;
}

