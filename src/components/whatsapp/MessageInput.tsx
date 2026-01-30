import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, Paperclip, Mic, Clock } from "lucide-react";
import { Message } from "@/types/whatsapp";
import { format } from "date-fns";

interface MessageInputProps {
  onSendMessage: (content: string, type?: Message['type'], isOwn?: boolean, customTime?: Date) => void;
}

export const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isOwn, setIsOwn] = useState(true);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState(() => 
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const messageTime = useCustomTime ? new Date(customTime) : new Date();
      onSendMessage(message, 'text', isOwn, messageTime);
      setMessage("");
      if (!useCustomTime) {
        setCustomTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      }
    }
  };

  return (
    <div className="bg-whatsapp-input-bg border-t border-border px-3 py-2">
      {/* Sender Selection */}
      <div className="flex gap-1.5 mb-2">
        <Button
          variant={isOwn ? "default" : "outline"}
          size="sm"
          onClick={() => setIsOwn(true)}
          className={`text-xs h-7 px-3 ${isOwn ? 'bg-whatsapp-primary hover:bg-whatsapp-primary/90 text-white' : ''}`}
        >
          Ik
        </Button>
        <Button
          variant={!isOwn ? "default" : "outline"}
          size="sm"
          onClick={() => setIsOwn(false)}
          className={`text-xs h-7 px-3 ${!isOwn ? 'bg-whatsapp-primary hover:bg-whatsapp-primary/90 text-white' : ''}`}
        >
          Contact
        </Button>
        
        <Button
          variant={useCustomTime ? "default" : "outline"}
          size="sm"
          onClick={() => setUseCustomTime(!useCustomTime)}
          className={`text-xs h-7 px-2 ml-auto ${useCustomTime ? 'bg-whatsapp-primary hover:bg-whatsapp-primary/90 text-white' : ''}`}
        >
          <Clock className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Custom Time Input */}
      {useCustomTime && (
        <div className="mb-2">
          <Input
            type="datetime-local"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="w-full h-8 text-sm border-input"
          />
        </div>
      )}
      
      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Typ een bericht"
            className="w-full rounded-full border-input h-9 text-sm pr-10"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-7 w-7 p-0"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          type="submit" 
          size="sm"
          className="rounded-full h-9 w-9 p-0 bg-whatsapp-primary hover:bg-whatsapp-primary/90"
          disabled={!message.trim()}
        >
          {message.trim() ? (
            <Send className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};