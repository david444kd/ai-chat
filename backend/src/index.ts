import cors from "@fastify/cors";
import Fastify from "fastify";
import { initDB } from "./db/schema";
import { chatsRoutes } from "./routes/chats";
import { messagesRoutes } from "./routes/messages";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Error: OPENROUTER_API_KEY environment variable is required");
  process.exit(1);
}

initDB();

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:3001",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
});

fastify.get("/health", async () => ({ status: "ok" }));

await fastify.register(chatsRoutes, { prefix: "/api" });
await fastify.register(messagesRoutes, { prefix: "/api" });

const port = Number(process.env.PORT ?? 3000);

try {
  await fastify.listen({ port, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
