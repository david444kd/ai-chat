# AI Chat Backend

Fastify + Bun + SQLite backend for the AI Chat platform.

## Setup

```bash
# Install dependencies
bun install

# Copy env file and fill in your API key
cp .env.example .env

# Start dev server (with hot reload)
bun run dev

# Or start production server
bun run start
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Yes | — | Your OpenRouter API key |
| `LLM_MODEL` | No | `google/gemma-3-27b-it:free` | Free LLM model to use |
| `FRONTEND_URL` | No | `http://localhost:3001` | Frontend origin for CORS |
| `PORT` | No | `3000` | Port to listen on |

## API Endpoints

### Chats

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/chats` | List all chats (ordered by updated_at DESC) |
| `POST` | `/api/chats` | Create a new empty chat |
| `GET` | `/api/chats/:id` | Get chat with all its messages |
| `DELETE` | `/api/chats/:id` | Delete chat and all its messages |
| `POST` | `/api/chats/:id/generate-title` | Generate title from first message |

### Messages

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chats/:id/messages` | Send a message, stream SSE response |

### SSE Events (`POST /api/chats/:id/messages`)

```
data: {"type":"delta","content":"..."}    — each token chunk
data: {"type":"done","messageId":"..."}   — stream complete
data: {"type":"error","message":"..."}    — on error
```

### Health

```
GET /health  →  { "status": "ok" }
```

## Docker

```bash
docker build -t ai-chat-backend .
docker run -p 3000:3000 -e OPENROUTER_API_KEY=your_key ai-chat-backend
```
