import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const useUserPresence = () => {
  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(new Map());
  const [allUsers, setAllUsers] = useState<UserPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch all users and their presence
  const fetchUserPresence = async () => {
    try {
      setLoading(true);
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, display_name, avatar_url');

      if (profilesError) throw profilesError;

      // Create presence entries for all users (default to offline)
      const userPresences: UserPresence[] = profiles?.map(profile => ({
        user_id: profile.user_id,
        status: 'offline' as const,
        last_seen: new Date().toISOString(),
        profile
      })) || [];

      setAllUsers(userPresences);
      
      // Create presence map for quick lookup
      const newPresenceMap = new Map();
      userPresences.forEach(presence => {
        newPresenceMap.set(presence.user_id, presence);
      });
      setPresenceMap(newPresenceMap);
      
    } catch (error) {
      console.error('Error fetching user presence:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update user status
  const updateUserStatus = (userId: string, status: 'online' | 'away' | 'offline') => {
    setPresenceMap(prev => {
      const updated = new Map(prev);
      const current = updated.get(userId);
      if (current) {
        updated.set(userId, {
          ...current,
          status,
          last_seen: new Date().toISOString()
        });
      }
      return updated;
    });

    setAllUsers(prev => 
      prev.map(u => 
        u.user_id === userId 
          ? { ...u, status, last_seen: new Date().toISOString() }
          : u
      )
    );
  };

  // Track current user's presence
  const trackCurrentUserPresence = () => {
    if (!user) return;

    const channel = supabase.channel('user_presence');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        Object.entries(presenceState).forEach(([userId, presence]) => {
          if (Array.isArray(presence) && presence.length > 0) {
            updateUserStatus(userId, 'online');
          }
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        updateUserStatus(key, 'online');
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        updateUserStatus(key, 'offline');
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  };

  // Get user status
  const getUserStatus = (userId: string): 'online' | 'away' | 'offline' => {
    return presenceMap.get(userId)?.status || 'offline';
  };

  // Get online users count
  const getOnlineUsersCount = (): number => {
    return Array.from(presenceMap.values()).filter(p => p.status === 'online').length;
  };

  // Get users by status
  const getUsersByStatus = (status: 'online' | 'away' | 'offline'): UserPresence[] => {
    return allUsers.filter(u => u.status === status);
  };

  // Get display name for user
  const getUserDisplayName = (userId: string): string => {
    const presence = presenceMap.get(userId);
    if (!presence?.profile) return 'Guest';
    
    return presence.profile.display_name || 
           `${presence.profile.first_name || ''} ${presence.profile.last_name || ''}`.trim() || 
           'Guest';
  };

  useEffect(() => {
    fetchUserPresence();
    
    if (user) {
      const cleanup = trackCurrentUserPresence();
      
      // Update own status to online
      updateUserStatus(user.id, 'online');
      
      return cleanup;
    }
  }, [user]);

  // Update away status based on activity
  useEffect(() => {
    if (!user) return;

    let inactiveTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactiveTimer);
      updateUserStatus(user.id, 'online');
      
      // Set to away after 5 minutes of inactivity
      inactiveTimer = setTimeout(() => {
        updateUserStatus(user.id, 'away');
      }, 5 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer(); // Initialize timer

    return () => {
      clearTimeout(inactiveTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [user]);

  return {
    allUsers,
    presenceMap,
    loading,
    getUserStatus,
    getOnlineUsersCount,
    getUsersByStatus,
    getUserDisplayName,
    updateUserStatus
  };
};