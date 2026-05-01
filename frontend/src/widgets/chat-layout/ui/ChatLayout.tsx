import type { ReactNode } from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";

interface ChatLayoutProps {
  activeChatId: string | null;
  children: ReactNode;
}

export function ChatLayout({ activeChatId, children }: ChatLayoutProps) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      <Sidebar activeChatId={activeChatId} />
      {children}
    </div>
  );
}
