"use client";

import { useEffect, useState } from "react";
import { MessageComposer } from "@/features/send-message/ui/MessageComposer";
import { useSendMessage } from "@/shared/hooks/useSendMessage";
import { ChatHeader } from "./ChatHeader";
import { WelcomeScreen } from "./WelcomeScreen";

export function NewChatView() {
  const { sendMessage } = useSendMessage(null);
  const [pendingInput, setPendingInput] = useState<string | null>(null);

  useEffect(() => {
    if (pendingInput !== null) {
      const value = pendingInput;
      setPendingInput(null);
      sendMessage(value);
    }
  }, [pendingInput, sendMessage]);

  return (
    <div className="relative flex h-screen flex-1 flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-90" />

      <ChatHeader title="Новый чат" />

      <div className="scrollbar-thin relative z-10 flex-1 overflow-y-auto">
        <WelcomeScreen onPick={setPendingInput} />
      </div>

      <MessageComposer activeChatId={null} />
    </div>
  );
}
