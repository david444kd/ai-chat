"use client";

import { MODEL_NAME } from "@/shared/config";

interface ChatHeaderProps {
  title: string;
}

export function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <header className="relative z-10 flex h-14 items-center border-b border-border/60 px-4 backdrop-blur-sm md:px-6">
      <span className="pointer-events-none absolute left-1/2 w-full max-w-[calc(100%-8rem)] -translate-x-1/2 truncate px-14 text-center font-serif text-[17px] tracking-tight text-foreground md:max-w-[calc(100%-14rem)] md:px-6">
        {title}
      </span>

      <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2.5 py-1 animate-pulse-glow">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
          {MODEL_NAME}
        </span>
      </div>
    </header>
  );
}
