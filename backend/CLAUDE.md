# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install          # install dependencies
bun run dev          # start dev server with hot reload
bun run start        # start production server
```

No test runner is configured. No lint script is defined.

## Environment

Copy `.env.example` to `.env` and set `OPENROUTER_API_KEY` before running. The SQLite database (`chat.db`) is created automatically on first run.

## Architecture

Fastify + Bun + SQLite backend (no ORM). Entry point is `src/index.ts`, which registers CORS, the two route files under `/api`, and a `/health` endpoint.

**Database** (`src/db/`): Bun's built-in `bun:sqlite` driver. `src/db/index.ts` exposes a lazy singleton `getDB()` with WAL mode and foreign keys enabled. Schema is created at startup via `initDB()` in `src/db/schema.ts`. Two tables: `chats` and `messages` (timestamps are Unix ms integers).

**Routes** (`src/routes/`):
- `chats.ts` — CRUD for chats plus `POST /chats/:id/generate-title`
- `messages.ts` — `POST /chats/:id/messages` streams an SSE response: saves the user message, calls OpenRouter, streams `delta` events back as tokens arrive, saves the complete assistant message, then emits `done`. Auto-generates a chat title after the first message (non-blocking fire-and-forget).

**Services** (`src/services/`):
- `openrouter.ts` — wraps the OpenRouter API. `streamCompletion()` is an async generator that parses the SSE stream from OpenRouter and yields string chunks. `completion()` is a non-streaming call used for title generation.
- `context.ts` — `buildContext()` fetches all messages for a chat. If estimated token count (chars/4) exceeds 3000, it summarizes the older messages with a `completion()` call and keeps only the last 6 messages verbatim, prepending the summary as a system message.

**SSE protocol** (client-facing):
```
data: {"type":"delta","content":"..."}   — token chunk
data: {"type":"done","messageId":"..."}  — stream complete
data: {"type":"error","message":"..."}   — error
```

## Key conventions

- Use `bun` as the runtime and package manager, never `node`/`npm`/`pnpm`/`vite`.
- All IDs are `nanoid()` strings.
- Timestamps are `Date.now()` (Unix milliseconds), stored as `INTEGER`.
- Route handlers access the DB directly via `getDB()` — no repository layer.
