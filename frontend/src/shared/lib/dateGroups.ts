import type { Chat } from "@/entities/chat/model/types";

const DAY = 86_400_000;

export function groupChatsByDate(chats: Chat[]): Record<string, Chat[]> {
  const now = Date.now();
  const groups: Record<string, Chat[]> = {
    Сегодня: [],
    Вчера: [],
    "На этой неделе": [],
    Ранее: [],
  };

  for (const c of [...chats].sort((a, b) => b.updated_at - a.updated_at)) {
    const diff = now - c.updated_at;
    if (diff < DAY) groups["Сегодня"].push(c);
    else if (diff < DAY * 2) groups["Вчера"].push(c);
    else if (diff < DAY * 7) groups["На этой неделе"].push(c);
    else groups["Ранее"].push(c);
  }

  return groups;
}
