import type { FastifyInstance } from "fastify";
import { registerCreateChat } from "./create";
import { registerDeleteChat } from "./delete";
import { registerGenerateTitle } from "./generate-title";
import { registerGetChat } from "./get";
import { registerListChats } from "./list";

export async function chatsRoutes(fastify: FastifyInstance): Promise<void> {
  registerListChats(fastify);
  registerCreateChat(fastify);
  registerGetChat(fastify);
  registerDeleteChat(fastify);
  registerGenerateTitle(fastify);
}
