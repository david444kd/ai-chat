import type { FastifyInstance } from "fastify";
import { registerSendMessage } from "./send";

export async function messagesRoutes(fastify: FastifyInstance): Promise<void> {
  registerSendMessage(fastify);
}
