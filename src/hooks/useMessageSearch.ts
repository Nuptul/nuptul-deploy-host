import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SearchResult {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
  chat_title?: string;
  sender_name?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
  };
}

export const useMessageSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const search = useCallback(async (query: string) => {
    if (!query.trim() || !user) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Search messages in chats where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', user.id)
        .is('left_at', null);

      if (memberError) throw memberError;

      const chatIds = memberData.map(m => m.chat_id);
      if (chatIds.length === 0) {
        setResults([]);
        return;
      }

      // Search messages with text matching query
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .select('id, chat_id, user_id, content, created_at')
        .in('chat_id', chatIds)
        .ilike('content', `%${query}%`)
        .not('content', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (messageError) throw messageError;

      // Get chat titles
      const { data: chatData, error: chatError } = await supabase
        .from('direct_chats')
        .select('id, title, is_group')
        .in('id', chatIds);

      if (chatError) throw chatError;

      const chatMap = new Map(chatData?.map(c => [c.id, c]) || []);

      const searchResults: SearchResult[] = messageData?.map(message => ({
        ...message,
        chat_title: chatMap.get(message.chat_id)?.title || 
                   (chatMap.get(message.chat_id)?.is_group ? 'Group Chat' : 'Direct Chat'),
        sender_name: message.user_id === user.id ? 'You' : 'Guest'
      })) || [];

      setResults(searchResults);
    } catch (err) {
      console.error('Error searching messages:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearSearch
  };
};