import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MessageReply {
  id: string;
  parent_message_id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const useMessageReplies = (parentMessageId: string | null) => {
  const [replies, setReplies] = useState<MessageReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const fetchReplies = async () => {
    if (!parentMessageId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('message_replies')
        .select('*')
        .eq('parent_message_id', parentMessageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (err) {
      console.error('Error fetching replies:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (content: string, chatId: string) => {
    if (!parentMessageId || !user || !content.trim()) return;

    try {
      setSending(true);
      const { error } = await supabase
        .from('message_replies')
        .insert({
          parent_message_id: parentMessageId,
          chat_id: chatId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      fetchReplies();
    } catch (err) {
      console.error('Error sending reply:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  const getReplyCount = () => replies.length;

  const getDisplayName = (reply: MessageReply) => {
    if (reply.user_id === user?.id) return 'You';
    return reply.profiles?.display_name || 
           `${reply.profiles?.first_name || ''} ${reply.profiles?.last_name || ''}`.trim() || 
           'Guest';
  };

  useEffect(() => {
    fetchReplies();
  }, [parentMessageId]);

  return {
    replies,
    loading,
    sending,
    sendReply,
    getReplyCount,
    getDisplayName,
    refetch: fetchReplies
  };
};