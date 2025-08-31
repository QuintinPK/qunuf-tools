import { Check, CheckCheck } from "lucide-react";
import { Message } from "@/types/whatsapp";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
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

  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`
          max-w-[70%] rounded-lg px-3 py-2 shadow-sm relative
          ${message.isOwn 
            ? 'bg-[#DCF8C6] text-gray-800' 
            : 'bg-white text-gray-800'
          }
        `}
        style={{
          borderRadius: message.isOwn 
            ? '18px 18px 4px 18px' 
            : '18px 18px 18px 4px'
        }}
      >
        <div className="break-words">
          {message.content}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">
            {format(message.timestamp, 'HH:mm')}
          </span>
          {message.isOwn && (
            <div className="text-gray-500">
              {getStatusIcon()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};