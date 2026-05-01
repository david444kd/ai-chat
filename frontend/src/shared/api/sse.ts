import { API_URL } from "@/shared/config";

export type SSEEvent =
  | { type: "delta"; content: string }
  | { type: "done"; messageId: string }
  | { type: "error"; message: string };

export async function* streamMessages(
  chatId: string,
  content: string,
  signal: AbortSignal
): AsyncGenerator<SSEEvent> {
  const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
    signal,
  });

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => response.statusText);
    yield { type: "error", message: text };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (!json) continue;
        try {
          yield JSON.parse(json) as SSEEvent;
        } catch {
          // skip malformed line
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
