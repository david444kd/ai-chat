export interface Chat {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: number;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SSEEvent {
  type: "delta" | "done" | "error";
  content?: string;
  messageId?: string;
  message?: string;
}
