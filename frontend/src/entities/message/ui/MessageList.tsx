"use client";

import { useAutoScroll } from "@/shared/hooks/useAutoScroll";
import type { Message } from "../model/types";
import { MessageBubble } from "./MessageBubble";
import { MessageSkeleton } from "./MessageSkeleton";
import { ThinkingIndicator } from "./ThinkingIndicator";

interface Props {
  messages: Message[];
  messagesLoading: boolean;
  streamingState: "idle" | "connecting" | "streaming" | "error";
  streamingContent: string;
}

export function MessageList({
  messages,
  messagesLoading,
  streamingState,
  streamingContent,
}: Props) {
  const scrollRef = useAutoScroll([messages.length, streamingContent]);

  const showThinking =
    streamingState === "connecting" || (streamingState === "streaming" && streamingContent === "");

  return (
    <div ref={scrollRef} className="scrollbar-thin relative z-10 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        {messagesLoading ? (
          <MessageSkeleton />
        ) : (
          <div className="space-y-8">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                streamingContent={streamingContent}
                isStreaming={streamingState === "streaming"}
              />
            ))}
            {showThinking && <ThinkingIndicator />}
          </div>
        )}
      </div>
    </div>
  );
}
