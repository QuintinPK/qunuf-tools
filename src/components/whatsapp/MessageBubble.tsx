import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, CheckCheck, Edit3, Save, X } from "lucide-react";
import { Message } from "@/types/whatsapp";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  onUpdateTime?: (messageId: string, newTime: Date) => void;
}

export const MessageBubble = ({ message, onUpdateTime }: MessageBubbleProps) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editTime, setEditTime] = useState(() => 
    format(message.timestamp, "yyyy-MM-dd'T'HH:mm")
  );

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-[#53BDEB]" />;
      default:
        return null;
    }
  };

  const handleSaveTime = () => {
    if (onUpdateTime) {
      const newTime = new Date(editTime);
      onUpdateTime(message.id, newTime);
    }
    setIsEditingTime(false);
  };

  const handleCancelEdit = () => {
    setEditTime(format(message.timestamp, "yyyy-MM-dd'T'HH:mm"));
    setIsEditingTime(false);
  };

  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-0.5 group`}>
      <div
        className={`
          max-w-[70%] px-3 py-1.5 relative
          ${message.isOwn 
            ? 'bg-whatsapp-own-message text-foreground rounded-lg rounded-br-sm' 
            : 'bg-whatsapp-received-message text-foreground rounded-lg rounded-bl-sm shadow-sm'
          }
        `}
      >
        <div className="break-words text-[14px] leading-[1.35] pr-12">
          {message.content}
        </div>
        
        <div className="absolute bottom-1 right-2 flex items-center gap-0.5">
          {isEditingTime ? (
            <div className="flex items-center gap-1 bg-background rounded p-1">
              <Input
                type="datetime-local"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="h-5 text-[10px] border-0 bg-transparent p-0 w-28"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveTime}
                className="h-4 w-4 p-0"
              >
                <Save className="h-2.5 w-2.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-4 w-4 p-0"
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </div>
          ) : (
            <>
              <span 
                className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setIsEditingTime(true)}
              >
                {format(message.timestamp, 'HH:mm')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingTime(true)}
                className="h-3 w-3 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="h-2 w-2" />
              </Button>
              {message.isOwn && (
                <span className="text-whatsapp-primary ml-0.5">
                  {getStatusIcon()}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};