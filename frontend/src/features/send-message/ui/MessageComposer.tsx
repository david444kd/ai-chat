"use client";

import { ArrowUp, Paperclip, Square } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { useSendMessage } from "@/shared/hooks/useSendMessage";
import { cn } from "@/shared/lib/cn";
import { useStreamingStore } from "@/shared/store/streaming.store";

interface MessageComposerProps {
  activeChatId: string | null;
}

export function MessageComposer({ activeChatId }: MessageComposerProps) {
  const [input, setInput] = useState("");
  const streamingState = useStreamingStore((s) => s.streamingState);
  const { sendMessage, stopStreaming } = useSendMessage(activeChatId);

  const isStreaming = streamingState !== "idle";

  const handleSend = async () => {
    if (isStreaming) {
      stopStreaming();
      return;
    }
    if (!input.trim()) return;
    const value = input;
    setInput("");
    await sendMessage(value);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 || isStreaming;

  return (
    <div className="relative z-10 px-4 pb-6 pt-2">
      <div className="mx-auto w-full max-w-3xl">
        <div
          className={cn(
            "group relative rounded-2xl border border-border bg-surface-elevated/80 p-2 shadow-[var(--shadow-lg)] backdrop-blur-xl transition-all",
            "focus-within:border-primary/40 focus-within:shadow-[0_0_0_4px_oklch(0.78_0.13_55_/_0.08),var(--shadow-lg)]"
          )}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={isStreaming}
            placeholder={activeChatId ? "Продолжите диалог…" : "Спросите что угодно…"}
            rows={1}
            className="block max-h-48 min-h-[48px] w-full resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <div className="flex items-center justify-between px-1.5 pt-1">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-surface hover:text-foreground"
              aria-label="Прикрепить файл"
              disabled={isStreaming}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              aria-label={isStreaming ? "Остановить" : "Отправить"}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-lg transition-all",
                canSend
                  ? "bg-gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 active:scale-95"
                  : "bg-surface text-muted-foreground"
              )}
            >
              {isStreaming ? (
                <Square className="h-3.5 w-3.5 fill-current" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <p className="mt-2.5 text-center text-[11px] text-muted-foreground/70">
          Lumen может ошибаться. Проверяйте важную информацию.
        </p>
      </div>
    </div>
  );
}
