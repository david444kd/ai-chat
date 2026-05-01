import type { Message } from "@/entities/message/model/types";

export interface Chat {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}
