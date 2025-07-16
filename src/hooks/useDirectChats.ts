import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ChatMember {
  user_id: string;
  joined_at: string;
  left_at: string | null;
  profiles?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface DirectChat {
  id: string;
  title: string | null;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  members?: ChatMember[];
  last_message?: {
    content: string | null;
    created_at: string;
    user_id: string;
  };
}

export const useDirectChats = () => {
  const [chats, setChats] = useState<DirectChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch user's chats
  const fetchChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get chats where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('chat_members')
        .select(`
          chat_id,
          direct_chats(
            id,
            title,
            is_group,
            created_at,
            updated_at,
            created_by
          )
        `)
        .eq('user_id', user.id)
        .is('left_at', null);

      if (memberError) throw memberError;

      // Get chat details with members
      const chatIds = memberData.map(m => m.chat_id);
      if (chatIds.length === 0) {
        setChats([]);
        return;
      }

      const { data: chatData, error: chatError } = await supabase
        .from('direct_chats')
        .select(`
          *,
          chat_members(
            user_id,
            joined_at,
            left_at,
            profiles(
              first_name,
              last_name,
              display_name,
              avatar_url
            )
          )
        `)
        .in('id', chatIds)
        .order('updated_at', { ascending: false });

      if (chatError) throw chatError;

      // Get last message for each chat
      const chatsWithMessages = await Promise.all(
        chatData.map(async (chat) => {
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('content, created_at, user_id')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...chat,
            last_message: lastMessage
          };
        })
      );

      setChats(chatsWithMessages);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  // Create a new direct chat
  const createDirectChat = async (participantIds: string[]) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create the chat
      const { data: chatData, error: chatError } = await supabase
        .from('direct_chats')
        .insert({
          created_by: user.id,
          is_group: participantIds.length > 1,
          title: participantIds.length > 1 ? 'Group Chat' : null
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add members (including the creator)
      const allMembers = [user.id, ...participantIds];
      const memberInserts = allMembers.map(userId => ({
        chat_id: chatData.id,
        user_id: userId
      }));

      const { error: memberError } = await supabase
        .from('chat_members')
        .insert(memberInserts);

      if (memberError) throw memberError;

      // Refresh chats
      await fetchChats();
      
      return chatData.id;
    } catch (err) {
      console.error('Error creating chat:', err);
      throw err;
    }
  };

  // Leave a chat
  const leaveChat = async (chatId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_members')
        .update({ left_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh chats
      await fetchChats();
    } catch (err) {
      console.error('Error leaving chat:', err);
      throw err;
    }
  };

  // Get display name for a chat
  const getChatDisplayName = (chat: DirectChat) => {
    if (chat.title) return chat.title;
    
    if (chat.is_group) {
      const memberNames = chat.members
        ?.filter(m => m.user_id !== user?.id)
        .map(m => m.profiles?.display_name || 
                  `${m.profiles?.first_name || ''} ${m.profiles?.last_name || ''}`.trim() || 
                  'Guest')
        .join(', ');
      return memberNames || 'Group Chat';
    }

    // For direct chats, show the other person's name
    const otherMember = chat.members?.find(m => m.user_id !== user?.id);
    return otherMember?.profiles?.display_name || 
           `${otherMember?.profiles?.first_name || ''} ${otherMember?.profiles?.last_name || ''}`.trim() || 
           'Direct Chat';
  };

  // Setup real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchChats();

    // Subscribe to chat changes
    const channel = supabase
      .channel('chat_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_chats'
        },
        () => {
          fetchChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_members'
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    chats,
    loading,
    error,
    createDirectChat,
    leaveChat,
    getChatDisplayName,
    refetch: fetchChats
  };
};