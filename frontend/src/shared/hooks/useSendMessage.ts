"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import type { Chat, ChatWithMessages } from "@/entities/chat/model/types";
import type { Message } from "@/entities/message/model/types";
import { chatsApi } from "@/shared/api/chats";
import { streamMessages } from "@/shared/api/sse";
import { chatKeys, useGenerateTitleMutation } from "@/shared/queries/chats.queries";
import { STREAMING_PLACEHOLDER_ID, useStreamingStore } from "@/shared/store/streaming.store";

export function useSendMessage(activeChatId: string | null) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const generateTitle = useGenerateTitleMutation();
  const streamingState = useStreamingStore((s) => s.streamingState);
  const setStreaming = useStreamingStore((s) => s.setStreaming);
  const appendContent = useStreamingStore((s) => s.appendContent);
  const updateOptimisticMessages = useStreamingStore((s) => s.updateOptimisticMessages);
  const stopStreaming = useStreamingStore((s) => s.stopStreaming);

  const resetStreaming = useCallback(() => {
    setStreaming({
      optimisticMessages: [],
      streamingState: "idle",
      streamingContent: "",
      abortController: null,
    });
  }, [setStreaming]);

  const removePlaceholderAndReset = useCallback(() => {
    updateOptimisticMessages((msgs) => msgs.filter((m) => m.id !== STREAMING_PLACEHOLDER_ID));
    setStreaming({ streamingState: "idle", streamingContent: "", abortController: null });
  }, [setStreaming, updateOptimisticMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || streamingState !== "idle") return;
      const trimmed = content.trim();
      let chatId = activeChatId;

      // Seed optimistic list from TQ cache so existing messages stay visible
      const cached = queryClient.getQueryData<{ messages: Message[] }>(
        chatId ? chatKeys.detail(chatId) : ["__none__"]
      );
      const optimisticUserMsg: Message = {
        id: `opt_${Date.now()}`,
        chat_id: chatId ?? "",
        role: "user",
        content: trimmed,
        created_at: Date.now(),
      };
      setStreaming({ optimisticMessages: [...(cached?.messages ?? []), optimisticUserMsg] });

      // Create chat if this is a new conversation
      if (!chatId) {
        try {
          const newChat = await chatsApi.create();
          chatId = newChat.id;
          router.replace(`/chat/${chatId}`);
          queryClient.setQueryData(chatKeys.all, (old: (typeof newChat)[] | undefined) =>
            old ? [newChat, ...old] : [newChat]
          );
          // Patch the optimistic user message with the real chat_id
          const resolvedId = chatId;
          updateOptimisticMessages((msgs) =>
            msgs.map((m) => (m.id === optimisticUserMsg.id ? { ...m, chat_id: resolvedId } : m))
          );
        } catch (err) {
          toast.error("Не удалось создать чат");
          resetStreaming();
          console.error(err);
          return;
        }
      }

      // Add placeholder and arm the abort controller
      const placeholder: Message = {
        id: STREAMING_PLACEHOLDER_ID,
        chat_id: chatId,
        role: "assistant",
        content: "",
        created_at: Date.now(),
      };
      const controller = new AbortController();
      updateOptimisticMessages((msgs) => [...msgs, placeholder]);
      setStreaming({
        streamingState: "connecting",
        streamingContent: "",
        abortController: controller,
      });

      // SSE loop — accumulate content via store action to avoid stale closures
      let accumulatedContent = "";
      try {
        for await (const event of streamMessages(chatId, trimmed, controller.signal)) {
          if (event.type === "delta") {
            accumulatedContent += event.content;
            appendContent(event.content);
            setStreaming({ streamingState: "streaming" });
          } else if (event.type === "done") {
            const realMsg: Message = {
              id: event.messageId,
              chat_id: chatId!,
              role: "assistant",
              content: accumulatedContent,
              created_at: Date.now(),
            };

            // Write final messages into TQ cache before clearing the optimistic overlay
            // so the switch from optimisticMessages → chatData is seamless (no flash)
            updateOptimisticMessages((msgs) => {
              const finalMessages = msgs
                .filter((m) => m.id !== STREAMING_PLACEHOLDER_ID)
                .concat(realMsg);
              queryClient.setQueryData<ChatWithMessages>(chatKeys.detail(chatId!), (old) =>
                old
                  ? { ...old, messages: finalMessages }
                  : {
                      ...(queryClient
                        .getQueryData<Chat[]>(chatKeys.all)
                        ?.find((chat) => chat.id === chatId) ?? {
                        id: chatId!,
                        title: "Новый чат",
                        created_at: Date.now(),
                        updated_at: Date.now(),
                      }),
                      messages: finalMessages,
                    }
              );
              return finalMessages;
            });
            resetStreaming();
            generateTitle.mutate(chatId!);
          } else if (event.type === "error") {
            removePlaceholderAndReset();
            toast.error(event.message || "Ошибка при получении ответа");
          }
        }
      } catch (err) {
        removePlaceholderAndReset();
        if ((err as Error).name !== "AbortError") {
          toast.error("Соединение прервано");
          console.error(err);
        }
      }
    },
    [
      streamingState,
      activeChatId,
      queryClient,
      generateTitle,
      router,
      setStreaming,
      appendContent,
      updateOptimisticMessages,
      resetStreaming,
      removePlaceholderAndReset,
    ]
  );

  return { sendMessage, stopStreaming };
}
