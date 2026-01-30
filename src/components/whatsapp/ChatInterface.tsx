import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { Chat, Contact } from "@/types/whatsapp";

interface ChatInterfaceProps {
  chat: Chat;
  onUpdateMessageTime?: (messageId: string, newTime: Date) => void;
  onUpdateContact?: (contact: Contact) => void;
}

export const ChatInterface = ({ chat, onUpdateMessageTime, onUpdateContact }: ChatInterfaceProps) => {
  return (
    <div className="flex-1 flex flex-col bg-whatsapp-bg">
      <ChatHeader contact={chat.contact} onUpdateContact={onUpdateContact} />
      
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-1">
          {chat.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <p className="text-sm">Start een gesprek</p>
            </div>
          ) : (
            chat.messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                onUpdateTime={onUpdateMessageTime}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};