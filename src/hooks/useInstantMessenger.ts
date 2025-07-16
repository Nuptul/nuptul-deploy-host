import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  media_thumbnail?: string;
  file_size?: number;
  duration_seconds?: number;
  created_at: string;
  is_read: boolean;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'call';
}

interface Chat {
  id: string;
  title?: string;
  is_group: boolean;
  created_by: string;
  created_at: string;
  participants: Array<{
    user_id: string;
    joined_at: string;
    profiles: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    };
  }>;
  last_message?: Message;
  unread_count: number;
}

interface VideoCall {
  id: string;
  chat_id: string;
  initiator_id: string;
  call_type: 'audio' | 'video';
  status: 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed';
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  offer_sdp?: any;
  answer_sdp?: any;
  ice_candidates: any[];
}

interface TypingIndicator {
  chat_id: string;
  user_id: string;
  started_at: string;
  expires_at: string;
}

export const useInstantMessenger = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [typingIndicators, setTypingIndicators] = useState<{ [chatId: string]: TypingIndicator[] }>({});
  const [activeCall, setActiveCall] = useState<VideoCall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const typingTimeoutRef = useRef<{ [chatId: string]: NodeJS.Timeout }>({});

  // Fetch user's chats
  const fetchChats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('direct_chats')
        .select(`
          *,
          chat_members!inner(
            user_id,
            joined_at,
            profiles(first_name, last_name, avatar_url)
          ),
          chat_messages(
            id,
            content,
            media_url,
            media_type,
            created_at,
            sender_id,
            message_type
          )
        `)
        .eq('chat_members.user_id', user.id)
        .is('chat_members.left_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const processedChats = data?.map(chat => ({
        ...chat,
        participants: chat.chat_members,
        last_message: chat.chat_messages?.[chat.chat_messages.length - 1],
      })) || [];

      setChats(processedChats);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats');
    }
  }, [user?.id]);

  // Fetch messages for a specific chat
  const fetchMessages = useCallback(async (chatId: string) => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [chatId]: data || []
      }));
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Send a text message
  const sendMessage = useCallback(async (chatId: string, content: string) => {
    if (!user?.id || !content.trim()) return false;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), data]
      }));

      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast]);

  // Upload and send media
  const sendMedia = useCallback(async (
    chatId: string, 
    file: File, 
    messageType: 'image' | 'video' | 'audio' | 'file'
  ) => {
    if (!user?.id) return false;

    try {
      // Upload file to Supabase storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('direct-chats')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('direct-chats')
        .getPublicUrl(fileName);

      // Create message with media
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          media_url: urlData.publicUrl,
          media_type: file.type,
          file_size: file.size,
          message_type: messageType
        })
        .select()
        .single();

      if (error) throw error;

      // Create media upload record
      await supabase
        .from('media_uploads')
        .insert({
          message_id: data.id,
          uploader_id: user.id,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: fileName,
          processing_status: 'completed'
        });

      // Update local state
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), data]
      }));

      return true;
    } catch (err) {
      console.error('Error sending media:', err);
      toast({
        title: "Error",
        description: "Failed to send media",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast]);

  // Start typing indicator
  const startTyping = useCallback(async (chatId: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('typing_indicators')
        .upsert({
          chat_id: chatId,
          user_id: user.id,
          expires_at: new Date(Date.now() + 10000).toISOString()
        });
    } catch (err) {
      console.error('Error starting typing:', err);
    }
  }, [user?.id]);

  // Stop typing indicator
  const stopTyping = useCallback(async (chatId: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('typing_indicators')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Error stopping typing:', err);
    }
  }, [user?.id]);

  // Handle typing with timeout
  const handleTyping = useCallback((chatId: string) => {
    startTyping(chatId);

    // Clear existing timeout
    if (typingTimeoutRef.current[chatId]) {
      clearTimeout(typingTimeoutRef.current[chatId]);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current[chatId] = setTimeout(() => {
      stopTyping(chatId);
      delete typingTimeoutRef.current[chatId];
    }, 3000);
  }, [startTyping, stopTyping]);

  // Start a video/audio call
  const startCall = useCallback(async (
    chatId: string, 
    callType: 'audio' | 'video'
  ) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('video_calls')
        .insert({
          chat_id: chatId,
          initiator_id: user.id,
          call_type: callType,
          status: 'ringing'
        })
        .select()
        .single();

      if (error) throw error;

      setActiveCall(data);
      return data;
    } catch (err) {
      console.error('Error starting call:', err);
      toast({
        title: "Error",
        description: "Failed to start call",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast]);

  // End active call
  const endCall = useCallback(async (callId: string) => {
    try {
      await supabase
        .from('video_calls')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', callId);

      setActiveCall(null);
    } catch (err) {
      console.error('Error ending call:', err);
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!user?.id || messageIds.length === 0) return;

    try {
      await supabase
        .from('message_status')
        .update({ read_at: new Date().toISOString() })
        .in('message_id', messageIds)
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => ({
            ...prev,
            [newMessage.chat_id]: [...(prev[newMessage.chat_id] || []), newMessage]
          }));
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingSubscription = supabase
      .channel('typing-indicators')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const indicator = payload.new as TypingIndicator;
            if (indicator.user_id !== user.id) {
              setTypingIndicators(prev => ({
                ...prev,
                [indicator.chat_id]: [
                  ...(prev[indicator.chat_id] || []).filter(t => t.user_id !== indicator.user_id),
                  indicator
                ]
              }));
            }
          } else if (payload.eventType === 'DELETE') {
            const indicator = payload.old as TypingIndicator;
            setTypingIndicators(prev => ({
              ...prev,
              [indicator.chat_id]: (prev[indicator.chat_id] || []).filter(t => t.user_id !== indicator.user_id)
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to video calls
    const callSubscription = supabase
      .channel('video-calls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_calls'
        },
        (payload) => {
          const call = payload.new as VideoCall;
          if (payload.eventType === 'INSERT' && call.initiator_id !== user.id) {
            // Incoming call
            setActiveCall(call);
          } else if (payload.eventType === 'UPDATE') {
            setActiveCall(call);
          }
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      typingSubscription.unsubscribe();
      callSubscription.unsubscribe();
    };
  }, [user?.id]);

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      fetchChats().finally(() => setLoading(false));
    }
  }, [user?.id, fetchChats]);

  // Cleanup typing timeouts
  useEffect(() => {
    return () => {
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return {
    chats,
    messages,
    typingIndicators,
    activeCall,
    loading,
    error,
    fetchMessages,
    sendMessage,
    sendMedia,
    handleTyping,
    startCall,
    endCall,
    markAsRead
  };
};