import { supabase } from "@/integrations/supabase/client";
import { Contact, Chat, Message } from "@/types/whatsapp";

export interface DatabaseContact {
  id: string;
  name: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface DatabaseChat {
  id: string;
  contact_id: string;
  title?: string;
  last_message_time?: string;
  whatsapp_contacts: DatabaseContact;
}

export interface DatabaseMessage {
  id: string;
  chat_id: string;
  content: string;
  timestamp: string;
  is_own: boolean;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'voice' | 'video' | 'document';
  media_url?: string;
  media_name?: string;
}

export const whatsappService = {
  // Contact operations
  async createContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .insert({
        name: contact.name,
        avatar: contact.avatar,
        is_online: contact.isOnline,
        last_seen: contact.lastSeen?.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      avatar: data.avatar,
      isOnline: data.is_online,
      lastSeen: data.last_seen ? new Date(data.last_seen) : undefined,
    };
  },

  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map(contact => ({
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
      isOnline: contact.is_online,
      lastSeen: contact.last_seen ? new Date(contact.last_seen) : undefined,
    }));
  },

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const { data, error } = await supabase
      .from('whatsapp_contacts')
      .update({
        name: updates.name,
        avatar: updates.avatar,
        is_online: updates.isOnline,
        last_seen: updates.lastSeen?.toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      avatar: data.avatar,
      isOnline: data.is_online,
      lastSeen: data.last_seen ? new Date(data.last_seen) : undefined,
    };
  },

  // Chat operations
  async createChat(contactId: string, title?: string): Promise<string> {
    const { data, error } = await supabase
      .from('whatsapp_chats')
      .insert({
        contact_id: contactId,
        title,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async getChats(): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('whatsapp_chats')
      .select(`
        *,
        whatsapp_contacts (
          id,
          name,
          avatar,
          is_online,
          last_seen
        )
      `)
      .order('last_message_time', { ascending: false });

    if (error) throw error;

    const chats: Chat[] = [];
    for (const dbChat of data) {
      const messages = await this.getMessages(dbChat.id);
      chats.push({
        id: dbChat.id,
        contact: {
          id: dbChat.whatsapp_contacts.id,
          name: dbChat.whatsapp_contacts.name,
          avatar: dbChat.whatsapp_contacts.avatar,
          isOnline: dbChat.whatsapp_contacts.is_online,
          lastSeen: dbChat.whatsapp_contacts.last_seen 
            ? new Date(dbChat.whatsapp_contacts.last_seen) 
            : undefined,
        },
        messages,
        lastMessageTime: new Date(dbChat.last_message_time || dbChat.updated_at),
      });
    }

    return chats;
  },

  async updateChatLastMessageTime(chatId: string): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_chats')
      .update({ last_message_time: new Date().toISOString() })
      .eq('id', chatId);

    if (error) throw error;
  },

  async deleteChat(chatId: string): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_chats')
      .delete()
      .eq('id', chatId);

    if (error) throw error;
  },

  // Message operations
  async addMessage(chatId: string, message: Omit<Message, 'id'>): Promise<Message> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        chat_id: chatId,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        is_own: message.isOwn,
        status: message.status,
        type: message.type,
        media_url: message.mediaUrl,
        media_name: message.mediaName,
      })
      .select()
      .single();

    if (error) throw error;

    // Update chat last message time
    await this.updateChatLastMessageTime(chatId);

    return {
      id: data.id,
      content: data.content,
      timestamp: new Date(data.timestamp),
      isOwn: data.is_own,
      status: data.status as 'sent' | 'delivered' | 'read',
      type: data.type as 'text' | 'image' | 'voice' | 'video' | 'document',
      mediaUrl: data.media_url,
      mediaName: data.media_name,
    };
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp');

    if (error) throw error;

    return data.map(msg => ({
      id: msg.id,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      isOwn: msg.is_own,
      status: msg.status as 'sent' | 'delivered' | 'read',
      type: msg.type as 'text' | 'image' | 'voice' | 'video' | 'document',
      mediaUrl: msg.media_url,
      mediaName: msg.media_name,
    }));
  },

  async updateMessageTime(messageId: string, newTime: Date): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_messages')
      .update({ timestamp: newTime.toISOString() })
      .eq('id', messageId);

    if (error) throw error;
  },
};