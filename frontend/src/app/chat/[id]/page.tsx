import { ChatLayout } from "@/widgets/chat-layout/ui/ChatLayout";
import { ChatThreadView } from "@/widgets/chat-view/ui/ChatThreadView";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;

  return (
    <ChatLayout activeChatId={id}>
      <ChatThreadView chatId={id} />
    </ChatLayout>
  );
}
