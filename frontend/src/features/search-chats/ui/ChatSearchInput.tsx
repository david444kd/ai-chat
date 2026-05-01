"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function ChatSearchInput({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Поиск по чатам"
        className="h-9 w-full rounded-lg bg-surface/60 pl-8 pr-3 text-[13px] outline-none ring-0 placeholder:text-muted-foreground/70 focus:bg-surface focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}
