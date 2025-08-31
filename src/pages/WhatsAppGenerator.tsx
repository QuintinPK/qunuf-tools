import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChatInterface } from "@/components/whatsapp/ChatInterface";
import { MessageInput } from "@/components/whatsapp/MessageInput";
import { ContactSelector } from "@/components/whatsapp/ContactSelector";
import { ExportOptions } from "@/components/whatsapp/ExportOptions";
import { Chat, Contact, Message } from "@/types/whatsapp";

const WhatsAppGenerator = () => {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "John Doe",
      isOnline: true,
    },
    {
      id: "2", 
      name: "Jane Smith",
      lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    }
  ]);

  const addMessage = (content: string, type: Message['type'] = 'text', isOwn: boolean = true, customTime?: Date) => {
    if (!currentChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: customTime || new Date(),
      isOwn,
      status: 'read',
      type,
    };

    setCurrentChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessageTime: new Date(),
    } : null);
  };

  const updateMessageTime = (messageId: string, newTime: Date) => {
    if (!currentChat) return;

    setCurrentChat(prev => prev ? {
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, timestamp: newTime } : msg
      ),
    } : null);
  };

  const createNewChat = (contact: Contact) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      contact,
      messages: [],
      lastMessageTime: new Date(),
    };
    setCurrentChat(newChat);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">WhatsApp Chat Generator</h1>
          <p className="text-muted-foreground">Create realistic WhatsApp conversations</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <ContactSelector 
              contacts={contacts}
              onContactSelect={createNewChat}
              onContactAdd={setContacts}
            />
            {currentChat && (
              <ExportOptions chat={currentChat} />
            )}
          </div>

          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col overflow-hidden bg-[#ECE5DD] border-0 shadow-lg">
              {currentChat ? (
                <>
                  <ChatInterface chat={currentChat} onUpdateMessageTime={updateMessageTime} />
                  <MessageInput onSendMessage={addMessage} />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <p>Select a contact to start creating a chat</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppGenerator;