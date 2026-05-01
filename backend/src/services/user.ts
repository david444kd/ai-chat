import type { FastifyReply, FastifyRequest } from "fastify";

const USER_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export function requireUserId(req: FastifyRequest, reply: FastifyReply): string | null {
  const raw = req.headers["x-user-id"];
  const userId = typeof raw === "string" ? raw.trim() : Array.isArray(raw) ? raw[0]?.trim() : "";

  if (!userId || !USER_ID_RE.test(userId)) {
    reply.status(400).send({ error: "Invalid or missing x-user-id header" });
    return null;
  }

  return userId;
}
