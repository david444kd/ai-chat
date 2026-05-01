import { ChatLayout } from "@/widgets/chat-layout/ui/ChatLayout";
import { NewChatView } from "@/widgets/chat-view/ui/NewChatView";

export default function NewChatPage() {
  return (
    <ChatLayout activeChatId={null}>
      <NewChatView />
    </ChatLayout>
  );
}
