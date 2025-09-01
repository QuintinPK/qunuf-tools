import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreVertical, Phone, Video, Edit3 } from "lucide-react";
import { Contact } from "@/types/whatsapp";
import { formatDistanceToNow } from "date-fns";

interface ChatHeaderProps {
  contact: Contact;
  onUpdateContact?: (contact: Contact) => void;
}

export const ChatHeader = ({ contact, onUpdateContact }: ChatHeaderProps) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const getStatusText = () => {
    if (contact.isOnline) return "online";
    if (contact.lastSeen) {
      return `last seen ${formatDistanceToNow(contact.lastSeen, { addSuffix: true })}`;
    }
    return "last seen recently";
  };

  const handleStatusChange = (value: string) => {
    if (!onUpdateContact) return;
    
    const now = new Date();
    let updatedContact: Contact;
    
    switch (value) {
      case 'online':
        updatedContact = { ...contact, isOnline: true, lastSeen: undefined };
        break;
      case 'recently':
        updatedContact = { ...contact, isOnline: false, lastSeen: undefined };
        break;
      case '5min':
        updatedContact = { ...contact, isOnline: false, lastSeen: new Date(now.getTime() - 5 * 60 * 1000) };
        break;
      case '1hour':
        updatedContact = { ...contact, isOnline: false, lastSeen: new Date(now.getTime() - 60 * 60 * 1000) };
        break;
      case '1day':
        updatedContact = { ...contact, isOnline: false, lastSeen: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        break;
      case '1week':
        updatedContact = { ...contact, isOnline: false, lastSeen: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      default:
        return;
    }
    
    onUpdateContact(updatedContact);
    setIsEditingStatus(false);
  };

  return (
    <div className="bg-whatsapp-header text-white p-4 flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={contact.avatar} />
        <AvatarFallback className="bg-whatsapp-primary-light text-white">
          {contact.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate text-base">{contact.name}</h3>
        <div className="flex items-center gap-1 group">
          {isEditingStatus ? (
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger className="h-5 w-auto text-xs bg-transparent border-0 text-white/80 p-0">
                <SelectValue placeholder={getStatusText()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">online</SelectItem>
                <SelectItem value="recently">last seen recently</SelectItem>
                <SelectItem value="5min">last seen 5 minutes ago</SelectItem>
                <SelectItem value="1hour">last seen 1 hour ago</SelectItem>
                <SelectItem value="1day">last seen yesterday</SelectItem>
                <SelectItem value="1week">last seen 1 week ago</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <>
              <p 
                className="text-xs text-white/80 cursor-pointer hover:text-white/60"
                onClick={() => setIsEditingStatus(true)}
              >
                {getStatusText()}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingStatus(true)}
                className="h-3 w-3 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="h-2 w-2 text-white/60" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <Video className="h-6 w-6 cursor-pointer hover:text-white/80 transition-colors" />
        <Phone className="h-6 w-6 cursor-pointer hover:text-white/80 transition-colors" />
        <MoreVertical className="h-6 w-6 cursor-pointer hover:text-white/80 transition-colors" />
      </div>
    </div>
  );
};