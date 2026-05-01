import type { Chat, ChatWithMessages } from "@/entities/chat/model/types";
import { apiClient } from "./client";

export const chatsApi = {
  getAll: () => apiClient.get<Chat[]>("/api/chats"),

  create: () => apiClient.post<Chat>("/api/chats"),

  getById: (id: string) => apiClient.get<ChatWithMessages>(`/api/chats/${id}`),

  delete: (id: string) => apiClient.delete(`/api/chats/${id}`),

  generateTitle: (id: string) =>
    apiClient.post<{ title: string }>(`/api/chats/${id}/generate-title`),
};
