import type { Chat } from "../model/types";
import { ChatListItem } from "./ChatListItem";

interface Props {
  label: string;
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChatListGroup({ label, chats, activeChatId, onSelect, onDelete }: Props) {
  if (chats.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
        {label}
      </div>
      <ul className="space-y-0.5">
        {chats.map((c) => (
          <ChatListItem
            key={c.id}
            chat={c}
            active={c.id === activeChatId}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}
