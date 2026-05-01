"use client";

import { MessageList } from "@/entities/message/ui/MessageList";
import { MessageComposer } from "@/features/send-message/ui/MessageComposer";
import { useChatMessagesQuery } from "@/shared/queries/chats.queries";
import { useStreamingStore } from "@/shared/store/streaming.store";
import { ChatHeader } from "./ChatHeader";

interface ChatThreadViewProps {
  chatId: string;
}

export function ChatThreadView({ chatId }: ChatThreadViewProps) {
  const streamingState = useStreamingStore((s) => s.streamingState);
  const streamingContent = useStreamingStore((s) => s.streamingContent);
  const optimisticMessages = useStreamingStore((s) => s.optimisticMessages);

  const { data: chatData, isPending: messagesLoading } = useChatMessagesQuery(chatId);

  const activeMessages =
    streamingState !== "idle" && optimisticMessages.length > 0
      ? optimisticMessages
      : (chatData?.messages ?? []);

  return (
    <div className="relative flex h-[100dvh] flex-1 flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-90" />

      <ChatHeader title={chatData?.title || (messagesLoading ? "Загрузка…" : "Новый чат")} />
      <MessageList
        messages={activeMessages}
        messagesLoading={messagesLoading}
        streamingState={streamingState}
        streamingContent={streamingContent}
      />
      <MessageComposer activeChatId={chatId} />
    </div>
  );
}
