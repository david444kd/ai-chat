import type { OpenRouterMessage } from "../types";

const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 30_000;

function getHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.FRONTEND_URL ?? "http://localhost:3001",
  };
}

function getModel(): string {
  return process.env.LLM_MODEL ?? "google/gemma-3-27b-it:free";
}

function getSystemPrompt(): string {
  return process.env.SYSTEM_PROMPT ?? "You are a helpful assistant.";
}

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

export async function* streamCompletion(messages: OpenRouterMessage[]): AsyncGenerator<string> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    signal: withTimeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: getModel(),
      messages: [{ role: "system", content: getSystemPrompt() }, ...messages],
      stream: true,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  if (!response.body) throw new Error("OpenRouter returned no response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // skip malformed SSE lines
      }
    }
  }
}

export async function completion(messages: OpenRouterMessage[]): Promise<string> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    signal: withTimeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: getModel(),
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content ?? "";
}
