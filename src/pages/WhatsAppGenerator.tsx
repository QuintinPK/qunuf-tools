import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/whatsapp/ChatInterface";
import { MessageInput } from "@/components/whatsapp/MessageInput";
import { ContactSelector } from "@/components/whatsapp/ContactSelector";
import { ExportOptions } from "@/components/whatsapp/ExportOptions";
import { ChatHistory } from "@/components/whatsapp/ChatHistory";
import { Chat, Contact, Message } from "@/types/whatsapp";
import { whatsappService } from "@/services/whatsappService";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const WhatsAppGenerator = () => {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const loadedContacts = await whatsappService.getContacts();
      setContacts(loadedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const addMessage = async (content: string, type: Message['type'] = 'text', isOwn: boolean = true, customTime?: Date) => {
    if (!currentChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: customTime || new Date(),
      isOwn,
      status: 'read',
      type,
    };

    // Update local state immediately for responsiveness
    setCurrentChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessageTime: new Date(),
    } : null);

    // Auto-save chat if it's the first message and not saved yet
    if (!currentChat.isSaved && currentChat.messages.length === 0) {
      try {
        await saveCurrentChat();
      } catch (error) {
        console.error('Error auto-saving chat:', error);
        toast({
          title: "Warning",
          description: "Chat could not be auto-saved",
          variant: "destructive",
        });
      }
    } else if (currentChat.isSaved && isValidUUID(currentChat.id)) {
      // Save message to existing chat
      try {
        await whatsappService.addMessage(currentChat.id, newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
        toast({
          title: "Warning",
          description: "Message not saved to database",
          variant: "destructive",
        });
      }
    }
  };

  const updateMessageTime = async (messageId: string, newTime: Date) => {
    if (!currentChat) return;

    // Update local state
    setCurrentChat(prev => prev ? {
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, timestamp: newTime } : msg
      ),
    } : null);

    // Update in database if chat is saved
    if (currentChat.isSaved && isValidUUID(currentChat.id)) {
      try {
        await whatsappService.updateMessageTime(messageId, newTime);
      } catch (error) {
        console.error('Error updating message time:', error);
      }
    }
  };

  const updateContact = async (updatedContact: Contact) => {
    if (!currentChat) return;

    // Update local state
    setCurrentChat(prev => prev ? {
      ...prev,
      contact: updatedContact,
    } : null);

    setContacts(prev => prev.map(contact => 
      contact.id === updatedContact.id ? updatedContact : contact
    ));

    // Update in database if contact exists
    if (updatedContact.id && isValidUUID(updatedContact.id)) {
      try {
        await whatsappService.updateContact(updatedContact.id, updatedContact);
      } catch (error) {
        console.error('Error updating contact:', error);
      }
    }
  };

  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const createNewChat = async (contact: Contact) => {
    // If contact doesn't exist in DB, create it
    let dbContact = contact;
    if (!contact.id || !isValidUUID(contact.id)) {
      try {
        dbContact = await whatsappService.createContact(contact);
        setContacts(prev => [...prev.filter(c => c.id !== contact.id), dbContact]);
      } catch (error) {
        console.error('Error creating contact:', error);
      }
    }

    const newChat: Chat = {
      id: Date.now().toString(), // Temporary ID for new chats
      contact: dbContact,
      messages: [],
      lastMessageTime: new Date(),
      isSaved: false,
    };
    setCurrentChat(newChat);
  };

  const saveCurrentChat = async () => {
    if (!currentChat || !currentChat.contact) return;

    setIsSaving(true);
    try {
      // Create chat in database
      const chatId = await whatsappService.createChat(currentChat.contact.id);
      
      // Save all messages
      for (const message of currentChat.messages) {
        await whatsappService.addMessage(chatId, message);
      }

      // Update current chat with the database ID
      setCurrentChat(prev => prev ? { ...prev, id: chatId, isSaved: true } : null);
      
      toast({
        title: "Success",
        description: "Chat saved successfully!",
      });
    } catch (error) {
      console.error('Error saving chat:', error);
      toast({
        title: "Error",
        description: "Failed to save chat",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedChat = (chat: Chat) => {
    setCurrentChat(chat);
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
            
            <ChatHistory 
              onChatSelect={loadSavedChat}
              currentChatId={currentChat?.id}
            />
            
            {currentChat && (
              <>
                {!currentChat.isSaved && (
                  <Button 
                    onClick={saveCurrentChat}
                    disabled={isSaving || currentChat.messages.length === 0}
                    className="w-full"
                    variant="outline"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Chat"}
                  </Button>
                )}
                {currentChat.isSaved && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    Chat auto-saved ✓
                  </div>
                )}
                <ExportOptions chat={currentChat} />
              </>
            )}
          </div>

          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col overflow-hidden bg-whatsapp-bg border-0 shadow-lg whatsapp-chat-interface">
              {currentChat ? (
                <>
                  <ChatInterface chat={currentChat} onUpdateMessageTime={updateMessageTime} onUpdateContact={updateContact} />
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