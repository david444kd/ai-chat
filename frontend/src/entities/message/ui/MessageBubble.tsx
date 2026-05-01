import { Sparkles } from "lucide-react";
import type { Message } from "../model/types";

interface Props {
  message: Message;
  streamingContent?: string;
  isStreaming?: boolean;
}

export function MessageBubble({ message, streamingContent, isStreaming }: Props) {
  const isPlaceholder = message.id === "__streaming__";
  const content = isPlaceholder ? (streamingContent ?? "") : message.content;
  const showCursor = isPlaceholder && isStreaming;

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md border border-border bg-surface-elevated px-4 py-2.5 text-[15px] leading-relaxed shadow-[var(--shadow-sm)]">
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
      <div className="min-w-0 flex-1 pt-0.5 text-[15px] leading-relaxed text-foreground/95">
        <Markdown text={content} />
        {showCursor && (
          <span className="animate-blink ml-0.5 inline-block h-[1.1em] w-[2px] bg-primary align-text-bottom" />
        )}
      </div>
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  const parts = text.split(/\n\n+/);
  return (
    <div className="space-y-3">
      {parts.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*\d+\.\s+/.test(l) || /^\s*[-•]\s+/.test(l));
        if (isList) {
          return (
            <ul key={i} className="ml-1 list-inside space-y-1.5">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\s*(\d+\.|[-•])\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(block)}</p>;
      })}
    </div>
  );
}

function renderInline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}
