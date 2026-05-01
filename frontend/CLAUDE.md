# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev        # Start dev server on port 3001
bun run build      # Production build
bun run start      # Start production server on port 3001
bun run lint       # Lint with Biome
bun run lint:fix   # Lint and auto-fix
bun run format     # Format with Biome
```

Requires `BACKEND_URL` env var (default: `http://localhost:3000`) pointing to the Go backend.

## Architecture

This is a Next.js 15 (App Router) chat application using **Feature-Sliced Design (FSD)**:

```
src/
├── app/           # Next.js routes + API proxy
├── shared/        # API client, React Query hooks, Zustand stores, utils, UI primitives
├── entities/      # Domain types + UI: chat/, message/
├── features/      # Feature units: create-chat, search-chats, send-message, toggle-sidebar
└── widgets/       # Composite components: chat-layout, sidebar, chat-view
```

### Data flow

1. **API proxy** — `app/api/[...path]/route.ts` forwards all requests to `BACKEND_URL`, injects `x-user-id` header from cookie, and sets `anon_user_id` HttpOnly cookie for anonymous identity persistence.
2. **React Query** — `shared/queries/` handles server state (chats list, chat+messages). Stale time is 30s for chats.
3. **Zustand** — `shared/store/` holds ephemeral streaming state (status, content buffer, abort controller, optimistic messages).
4. **`useSendMessage`** (`shared/hooks/`) orchestrates the full send flow: optimistic insert → optional chat creation → SSE stream → cache invalidation.

### Streaming

Assistant responses stream via SSE from `POST /api/chats/:id/messages`. The proxy forwards the stream directly. `shared/api/sse.ts` parses the event stream and feeds chunks into the Zustand store.

### State shape

- `useStreamingStore`: `status` (idle/connecting/streaming/error), `content`, `abortController`, `optimisticMessages[]`
- Optimistic user message is added to the store immediately on send, then replaced once the server confirms.

## Key conventions

- **Path aliases**: `@/shared/*`, `@/entities/*`, `@/features/*`, `@/widgets/*` — use these, not relative paths.
- **Linting/formatting**: Biome (not ESLint/Prettier). 2-space indent, 100-char line width, double quotes, semicolons required. Imports are auto-organized.
- **Styling**: Tailwind CSS 4 with oklch color tokens defined in `app/globals.css`. Use `cn()` from `shared/lib` for conditional classes.
- **Package manager**: Bun — use `bun add`, not `npm install`.
