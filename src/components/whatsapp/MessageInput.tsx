import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, Paperclip, Mic } from "lucide-react";
import { Message } from "@/types/whatsapp";

interface MessageInputProps {
  onSendMessage: (content: string, type?: Message['type'], isOwn?: boolean) => void;
}

export const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isOwn, setIsOwn] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, 'text', isOwn);
      setMessage("");
    }
  };

  return (
    <div className="bg-[#F0F0F0] p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs">
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