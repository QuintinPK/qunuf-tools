import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, MessageSquare } from "lucide-react";
import { Chat } from "@/types/whatsapp";
import { whatsappService } from "@/services/whatsappService";
import { useToast } from "@/hooks/use-toast";

interface ChatHistoryProps {
  onChatSelect: (chat: Chat) => void;
  currentChatId?: string;
}

export const ChatHistory = ({ onChatSelect, currentChatId }: ChatHistoryProps) => {
  const [savedChats, setSavedChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const chats = await whatsappService.getChats();
      setSavedChats(chats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Error",
        description: "Failed to load saved chats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      await whatsappService.deleteChat(chatId);
      setSavedChats(prev => prev.filter(chat => chat.id !== chatId));
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const formatLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return "No messages";
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage.content.length > 30 
      ? lastMessage.content.substring(0, 30) + "..."
      : lastMessage.content;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Saved Chats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Loading chats...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Saved Chats
          <Badge variant="secondary">{savedChats.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {savedChats.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 px-4">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No saved chats yet</p>
              <p className="text-sm">Create and save a chat to see it here</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {savedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    currentChatId === chat.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onChatSelect(chat)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={chat.contact.avatar} />
                    <AvatarFallback>
                      {chat.contact.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">
                        {chat.contact.name}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {chat.lastMessageTime.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatLastMessage(chat)}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};