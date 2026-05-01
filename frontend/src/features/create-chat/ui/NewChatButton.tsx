"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewChatButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/new")}
      className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface-elevated/50 px-3 py-2.5 text-sm font-medium transition-all hover:border-border-strong hover:bg-surface-elevated hover:shadow-[var(--shadow-md)]"
    >
      <Plus className="h-4 w-4 text-primary transition-transform group-hover:rotate-90" />
      <span>Новый чат</span>
      <span className="ml-auto text-[10.5px] tracking-wider text-muted-foreground">⌘K</span>
    </button>
  );
}
