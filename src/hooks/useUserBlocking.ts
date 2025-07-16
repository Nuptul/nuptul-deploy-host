import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface BlockedUser {
  id: string;
  blocked_user_id: string;
  blocked_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const useUserBlocking = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchBlockedUsers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_blocks')
        .select('*')
        .eq('user_id', user.id)
        .order('blocked_at', { ascending: false });

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (userIdToBlock: string) => {
    if (!user || userIdToBlock === user.id) return;

    try {
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          user_id: user.id,
          blocked_user_id: userIdToBlock
        });

      if (error) throw error;
      fetchBlockedUsers();
    } catch (err) {
      console.error('Error blocking user:', err);
      throw err;
    }
  };

  const unblockUser = async (userIdToUnblock: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('user_id', user.id)
        .eq('blocked_user_id', userIdToUnblock);

      if (error) throw error;
      fetchBlockedUsers();
    } catch (err) {
      console.error('Error unblocking user:', err);
      throw err;
    }
  };

  const isUserBlocked = (userId: string): boolean => {
    return blockedUsers.some(block => block.blocked_user_id === userId);
  };

  const getBlockedUserIds = (): string[] => {
    return blockedUsers.map(block => block.blocked_user_id);
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, [user]);

  return {
    blockedUsers,
    loading,
    blockUser,
    unblockUser,
    isUserBlocked,
    getBlockedUserIds,
    refetch: fetchBlockedUsers
  };
};