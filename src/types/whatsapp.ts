export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastSeen?: Date;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'voice' | 'video' | 'document';
  mediaUrl?: string;
  mediaName?: string;
}

export interface Chat {
  id: string;
  contact: Contact;
  messages: Message[];
  lastMessageTime: Date;
  isSaved?: boolean;
}