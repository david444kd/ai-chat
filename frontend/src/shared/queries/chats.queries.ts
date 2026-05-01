import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Chat, ChatWithMessages } from "@/entities/chat/model/types";
import { chatsApi } from "@/shared/api/chats";

export const chatKeys = {
  all: ["chats"] as const,
  detail: (id: string) => ["chat", id] as const,
};

export function useChatsQuery(initialData?: Chat[]) {
  return useQuery({
    queryKey: chatKeys.all,
    queryFn: () => chatsApi.getAll(),
    initialData,
  });
}

export function useChatMessagesQuery(chatId: string | null, initialData?: ChatWithMessages) {
  return useQuery({
    queryKey: chatKeys.detail(chatId ?? ""),
    queryFn: () => chatsApi.getById(chatId!),
    enabled: chatId != null,
    initialData,
  });
}

export function useDeleteChatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }),
    onError: () => toast.error("Не удалось удалить чат"),
  });
}

export function useGenerateTitleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatsApi.generateTitle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }),
  });
}
