import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
  };
}

export const useMessageReactions = (messageId: string | null) => {
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchReactions = async () => {
    if (!messageId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReactions(data as MessageReaction[] || []);
    } catch (err) {
      console.error('Error fetching reactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (reactionType: MessageReaction['reaction_type']) => {
    if (!messageId || !user) return;

    try {
      // Check if user already reacted with this type
      const existingReaction = reactions.find(
        r => r.user_id === user.id && r.reaction_type === reactionType
      );

      if (existingReaction) {
        // Remove existing reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction_type: reactionType
          });

        if (error) throw error;
      }

      fetchReactions();
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  const getReactionCounts = () => {
    const counts: Record<string, number> = {};
    reactions.forEach(reaction => {
      counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1;
    });
    return counts;
  };

  const getUserReaction = () => {
    return reactions.find(r => r.user_id === user?.id)?.reaction_type || null;
  };

  useEffect(() => {
    fetchReactions();
  }, [messageId]);

  return {
    reactions,
    loading,
    addReaction,
    getReactionCounts,
    getUserReaction,
    refetch: fetchReactions
  };
};