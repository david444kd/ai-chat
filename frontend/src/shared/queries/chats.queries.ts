import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Chat, ChatWithMessages } from "@/entities/chat/model/types";
import { chatsApi } from "@/shared/api/chats";

export const chatKeys = {
  all: ["chats"] as const,
  lists: () => [...chatKeys.all, "list"] as const,
  details: () => [...chatKeys.all, "detail"] as const,
  detail: (id: string) => [...chatKeys.details(), id] as const,
  messages: (id: string) => [...chatKeys.detail(id), "messages"] as const,
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
    queryKey: chatId ? chatKeys.detail(chatId) : chatKeys.all,
    queryFn: () => chatsApi.getById(chatId!),
    enabled: chatId != null,
    initialData,
  });
}

export function useDeleteChatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.all });
      const previous = queryClient.getQueryData<Chat[]>(chatKeys.all);
      queryClient.setQueryData<Chat[]>(chatKeys.all, (old) =>
        old ? old.filter((c) => c.id !== id) : []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(chatKeys.all, context.previous);
      }
      toast.error("Не удалось удалить чат");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }),
  });
}

export function useGenerateTitleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatsApi.generateTitle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }),
  });
}
