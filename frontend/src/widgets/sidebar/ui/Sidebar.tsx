"use client";

import { PanelLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatListGroup } from "@/entities/chat/ui/ChatListGroup";
import { ChatListSkeleton } from "@/entities/chat/ui/ChatListSkeleton";
import { NewChatButton } from "@/features/create-chat/ui/NewChatButton";
import { ChatSearchInput } from "@/features/search-chats/ui/ChatSearchInput";
import { SidebarToggle } from "@/features/toggle-sidebar/ui/SidebarToggle";
import { cn } from "@/shared/lib/cn";
import { groupChatsByDate } from "@/shared/lib/dateGroups";
import { useChatsQuery, useDeleteChatMutation } from "@/shared/queries/chats.queries";

interface SidebarProps {
  activeChatId: string | null;
}

export function Sidebar({ activeChatId }: SidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: chats = [], isPending: chatsLoading } = useChatsQuery();
  const deleteMutation = useDeleteChatMutation();

  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery.trim()
    ? chats.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;
  const groups = groupChatsByDate(filtered);

  const handleDelete = (id: string) => {
    if (activeChatId === id) {
      router.replace("/new");
    }
    deleteMutation.mutate(id);
  };
  const handleSelect = (id: string) => {
    router.push(`/chat/${id}`);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Floating trigger when collapsed */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className={cn(
          "fixed left-3 top-3 z-50 inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-surface-elevated/70 px-3 text-xs font-medium text-foreground shadow-[var(--shadow-md)] backdrop-blur transition-all duration-300 hover:border-border-strong hover:bg-surface-elevated md:hidden",
          mobileOpen && "pointer-events-none opacity-0"
        )}
        aria-label="Открыть сайдбар"
        title="Открыть сайдбар"
      >
        <PanelLeft className="h-[18px] w-[18px] text-muted-foreground" />
        <span>Меню</span>
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 h-screen shrink-0 overflow-hidden border-r border-border bg-sidebar transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:relative md:z-auto",
          mobileOpen ? "w-[280px]" : "w-0 md:w-[280px]"
        )}
      >
        <div className="flex h-full w-[280px] flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 pb-2 pt-3.5">
            <div className="flex items-center gap-2 px-1">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-primary shadow-[var(--shadow-glow)]">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-serif text-[19px] leading-none tracking-tight">Lumen</span>
            </div>
            <SidebarToggle
              variant="close"
              onClick={() => setMobileOpen(false)}
              className="md:hidden"
            />
          </div>

          {/* New chat */}
          <div className="px-3 pb-2">
            <NewChatButton />
          </div>

          {/* Search */}
          <div className="px-3 pb-3">
            <ChatSearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Chat list */}
          <div className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-2">
            {chatsLoading ? (
              <ChatListSkeleton />
            ) : (
              <>
                {Object.entries(groups).map(([label, list]) => (
                  <ChatListGroup
                    key={label}
                    label={label}
                    chats={list}
                    activeChatId={activeChatId}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                  />
                ))}
                {filtered.length === 0 && !chatsLoading && (
                  <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                    Ничего не найдено
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer profile */}
          <div className="border-t border-border px-3 py-3">
            <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 transition hover:bg-sidebar-hover">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-[13px] font-semibold text-primary-foreground">
                U
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">Пользователь</div>
                <div className="truncate text-[11px] text-muted-foreground">Free plan</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
