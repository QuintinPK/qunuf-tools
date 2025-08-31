import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { Chat } from "@/types/whatsapp";

interface ChatInterfaceProps {
  chat: Chat;
}

export const ChatInterface = ({ chat }: ChatInterfaceProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader contact={chat.contact} />
      
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-2">
          {chat.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            chat.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};