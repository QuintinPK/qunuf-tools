import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Phone, Video } from "lucide-react";
import { Contact } from "@/types/whatsapp";
import { formatDistanceToNow } from "date-fns";

interface ChatHeaderProps {
  contact: Contact;
}

export const ChatHeader = ({ contact }: ChatHeaderProps) => {
  const getStatusText = () => {
    if (contact.isOnline) return "online";
    if (contact.lastSeen) {
      return `last seen ${formatDistanceToNow(contact.lastSeen, { addSuffix: true })}`;
    }
    return "last seen recently";
  };

  return (
    <div className="bg-[#075E54] text-white p-3 flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={contact.avatar} />
        <AvatarFallback className="bg-[#25D366] text-white">
          {contact.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{contact.name}</h3>
        <p className="text-xs text-white/80">{getStatusText()}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <Video className="h-5 w-5 cursor-pointer hover:text-white/80" />
        <Phone className="h-5 w-5 cursor-pointer hover:text-white/80" />
        <MoreVertical className="h-5 w-5 cursor-pointer hover:text-white/80" />
      </div>
    </div>
  );
};