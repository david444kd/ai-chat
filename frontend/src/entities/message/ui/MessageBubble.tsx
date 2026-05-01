import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { STREAMING_PLACEHOLDER_ID } from "@/shared/store/streaming.store";
import type { Message } from "../model/types";

interface Props {
  message: Message;
  streamingContent?: string;
  isStreaming?: boolean;
}

export function MessageBubble({ message, streamingContent, isStreaming }: Props) {
  const isPlaceholder = message.id === STREAMING_PLACEHOLDER_ID;
  const content = isPlaceholder ? (streamingContent ?? "") : message.content;
  const showCursor = isPlaceholder && isStreaming;

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md border border-border bg-surface-elevated px-4 py-2.5 text-[16px] leading-relaxed shadow-[var(--shadow-sm)]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-primary shadow-[var(--shadow-glow)]">
        <Sparkles className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="prose prose-base dark:prose-invert min-w-0 max-w-none flex-1 pt-0.5 text-[16px] leading-relaxed text-foreground/95">
        <ReactMarkdown>{content}</ReactMarkdown>
        {showCursor && (
          <span className="animate-blink ml-0.5 inline-block h-[1.1em] w-[2px] bg-primary align-text-bottom" />
        )}
      </div>
    </div>
  );
}
