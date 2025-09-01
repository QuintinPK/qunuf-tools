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
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div
        className={`
          max-w-[75%] px-4 py-2 shadow-md relative transition-all duration-200
          ${message.isOwn 
            ? 'bg-whatsapp-own-message text-gray-900' 
            : 'bg-whatsapp-received-message text-gray-900'
          }
        `}
        style={{
          borderRadius: message.isOwn 
            ? '20px 20px 6px 20px' 
            : '20px 20px 20px 6px'
        }}
      >
        <div className="break-words text-sm leading-relaxed">
          {message.content}
        </div>
        
        <div className={`flex items-center mt-1 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
          {isEditingTime ? (
            <div className="flex items-center gap-1">
              <Input
                type="datetime-local"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="h-6 text-xs border-0 bg-transparent p-0 w-32"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveTime}
                className="h-5 w-5 p-0"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-5 w-5 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 ml-auto">
              <span 
                className="text-xs text-gray-600 cursor-pointer hover:text-gray-800"
                onClick={() => setIsEditingTime(true)}
              >
                {format(message.timestamp, 'HH:mm')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingTime(true)}
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="h-2 w-2" />
              </Button>
              {message.isOwn && (
                <div className="text-gray-600 ml-1">
                  {getStatusIcon()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};