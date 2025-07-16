import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ChatMessage {
  id: string;
  chat_id: string;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  media_thumbnail: string | null;
  is_read: boolean;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface SendMessageData {
  content?: string;
  file?: File;
}

export const useChatMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch messages for a chat
  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      const { data: messagesData, error: messagesError } = await (supabase as any)
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Get unique user IDs to fetch profiles
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      
      const { data: profilesData, error: profilesError } = await (supabase as any)
        .from('profiles')
        .select('user_id, first_name, last_name, display_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Map profiles to messages
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      const messagesWithProfiles = messagesData?.map(message => ({
        ...message,
        profiles: profilesMap.get(message.user_id)
      })) || [];

      setMessages(messagesWithProfiles);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (messageData: SendMessageData) => {
    if (!chatId || !user) throw new Error('Chat ID and user required');
    if (!messageData.content && !messageData.file) throw new Error('Message content or file required');

    try {
      setSending(true);
      let mediaUrl = null;
      let mediaType = null;
      let mediaThumbnail = null;

      // Upload media file if provided
      if (messageData.file) {
        const fileExt = messageData.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${chatId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('direct-chats')
          .upload(filePath, messageData.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('direct-chats')
          .getPublicUrl(filePath);

        mediaUrl = urlData.publicUrl;
        mediaType = messageData.file.type.startsWith('image/') ? 'image' : 
                   messageData.file.type.startsWith('video/') ? 'video' : 'file';
        
        // For videos, use the same URL as thumbnail for now
        if (mediaType === 'video') {
          mediaThumbnail = mediaUrl;
        }
      }

      // Insert message
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          content: messageData.content || null,
          media_url: mediaUrl,
          media_type: mediaType,
          media_thumbnail: mediaThumbnail
        });

      if (error) throw error;

      // Update chat's updated_at timestamp
      await supabase
        .from('direct_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  // Mark messages as read
  const markAsRead = async () => {
    if (!chatId || !user) return;

    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('user_id', user.id)
        .eq('is_read', false);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  // Get display name for a message sender
  const getMessageSenderName = (message: ChatMessage) => {
    if (message.user_id === user?.id) return 'You';
    return message.profiles?.display_name || 
           `${message.profiles?.first_name || ''} ${message.profiles?.last_name || ''}`.trim() || 
           'Guest';
  };

  // Setup real-time subscription
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    fetchMessages();
    markAsRead();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        () => {
          fetchMessages();
          markAsRead();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    markAsRead,
    getMessageSenderName,
    refetch: fetchMessages
  };
};