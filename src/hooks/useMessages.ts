import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio';
  media_url?: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_avatar?: string;
}

interface Chat {
  id: string;
  participants: string[];
  last_message?: Message;
  unread_count: number;
  updated_at: string;
}

export const useMessages = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // For now, show empty state for production
      console.warn('🚧 PRODUCTION READY: Mock data removed. Implement real chat system.');
      
      setChats([]);
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      
      // Fallback to empty state if tables don't exist
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        setChats([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      console.warn('🚧 PRODUCTION READY: Mock messages removed. Implement real messaging.');
      
      setMessages([]);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (chatId: string, content: string, messageType: 'text' | 'image' | 'video' = 'text', mediaFile?: File) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      let mediaUrl: string | undefined;
      
      if (mediaFile) {
        // Upload media file
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `chat-media/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, mediaFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        mediaUrl = urlData.publicUrl;
      }

      const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender_id: user.id,
        recipient_id: 'recipient', // This would be determined from chat participants
        content,
        message_type: messageType,
        media_url: mediaUrl,
        is_read: false,
        created_at: new Date().toISOString(),
        sender_name: 'You'
      };

      // Add to local state (in real app, would be saved to database)
      setMessages(prev => [...prev, newMessage]);
      
      // Update chat's last message
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, last_message: newMessage, updated_at: newMessage.created_at }
          : chat
      ));

      return { data: newMessage, error: null };
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
      return { error: error.message };
    }
  };

  const markChatAsRead = async (chatId: string) => {
    try {
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, unread_count: 0 }
          : chat
      ));
      
      // Update total unread count
      setUnreadCount(prev => {
        const chat = chats.find(c => c.id === chatId);
        return Math.max(0, prev - (chat?.unread_count || 0));
      });
    } catch (error: any) {
      console.error('Error marking chat as read:', error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [user]);

  return {
    chats,
    messages,
    unreadCount,
    loading,
    fetchMessages,
    sendMessage,
    markChatAsRead,
    refresh: fetchChats
  };
};