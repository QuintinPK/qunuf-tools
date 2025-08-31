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
    <div className="bg-[#F0F0F0] p-3 space-y-3">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span>Send as:</span>
          <Button
            variant={isOwn ? "default" : "outline"}
            size="sm"
            onClick={() => setIsOwn(true)}
            className="h-6 px-2 text-xs"
          >
            Me
          </Button>
          <Button
            variant={!isOwn ? "default" : "outline"}
            size="sm"
            onClick={() => setIsOwn(false)}
            className="h-6 px-2 text-xs"
          >
            Contact
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={useCustomTime ? "default" : "outline"}
            size="sm"
            onClick={() => setUseCustomTime(!useCustomTime)}
            className="h-6 px-2 text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            Custom Time
          </Button>
        </div>
      </div>
      
      {useCustomTime && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground min-w-0">Time:</span>
          <Input
            type="datetime-local"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="h-8 text-xs bg-white"
          />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:bg-gray-200"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:bg-gray-200"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
        
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1 bg-white border-0 rounded-full px-4 focus-visible:ring-1 focus-visible:ring-[#25D366]"
        />
        
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:bg-gray-200"
          disabled={!message.trim()}
        >
          {message.trim() ? <Send className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};