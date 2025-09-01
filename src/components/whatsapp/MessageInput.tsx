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
    <div className="bg-whatsapp-input-bg border-t border-gray-200 p-4">
      {/* Sender Selection */}
      <div className="flex gap-2 mb-3">
        <Button
          variant={isOwn ? "default" : "outline"}
          size="sm"
          onClick={() => setIsOwn(true)}
          className={`text-xs ${isOwn ? 'bg-whatsapp-primary hover:bg-whatsapp-primary/90' : ''}`}
        >
          Me
        </Button>
        <Button
          variant={!isOwn ? "default" : "outline"}
          size="sm"
          onClick={() => setIsOwn(false)}
          className={`text-xs ${!isOwn ? 'bg-whatsapp-primary hover:bg-whatsapp-primary/90' : ''}`}
        >
          Contact
        </Button>
        
        <Button
          variant={useCustomTime ? "default" : "outline"}
          size="sm"
          onClick={() => setUseCustomTime(!useCustomTime)}
          className={`text-xs ml-auto ${useCustomTime ? 'bg-whatsapp-secondary hover:bg-whatsapp-secondary/90' : ''}`}
        >
          <Clock className="h-3 w-3 mr-1" />
          Custom Time
        </Button>
      </div>
      
      {/* Custom Time Input */}
      {useCustomTime && (
        <div className="mb-3">
          <Input
            type="datetime-local"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="w-full border-gray-300 focus:border-whatsapp-primary focus:ring-whatsapp-primary"
            placeholder="Select date and time"
          />
        </div>
      )}
      
      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="w-full rounded-full border-gray-300 focus:border-whatsapp-primary focus:ring-whatsapp-primary pr-12 py-3"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 p-1"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        <Button 
          type="submit" 
          className={`rounded-full p-3 transition-all ${
            message.trim() 
              ? 'bg-whatsapp-primary hover:bg-whatsapp-primary/90' 
              : 'bg-whatsapp-secondary hover:bg-whatsapp-secondary/90'
          }`}
          disabled={!message.trim() && !useCustomTime}
        >
          {message.trim() ? (
            <Send className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};