"use client";

import { MessageSquare, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { IconButton } from "@/shared/ui/icon-button";
import type { Chat } from "../model/types";

interface Props {
  chat: Chat;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChatListItem({ chat, active, onSelect, onDelete }: Props) {
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onSelect(chat.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors",
          active
            ? "bg-sidebar-hover text-foreground"
            : "text-sidebar-foreground/85 hover:bg-sidebar-hover/70 hover:text-foreground"
        )}
      >
        <MessageSquare
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-colors",
            active ? "text-primary" : "text-muted-foreground"
          )}
        />
        <span className="truncate pr-6">{chat.title || "Новый чат"}</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            size="sm"
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 opacity-0 hover:bg-surface-elevated group-hover:opacity-100",
              active && "opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
            aria-label="Действия с чатом"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={() => onDelete(chat.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
