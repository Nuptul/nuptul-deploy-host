import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PresenceUser {
  user_id: string;
  name: string;
  avatar?: string;
  last_seen: string;
  status: 'online' | 'away' | 'offline';
}

interface PresenceContextType {
  onlineUsers: PresenceUser[];
  onlineCount: number;
  isLoading: boolean;
  updateStatus: (status: 'online' | 'away' | 'offline') => void;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

interface PresenceProviderProps {
  children: ReactNode;
}

export const PresenceProvider: React.FC<PresenceProviderProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [presenceChannel, setPresenceChannel] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel('presence_social', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track presence state
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users: PresenceUser[] = [];
        
        Object.entries(presenceState).forEach(([userId, presences]: [string, any]) => {
          const presence = presences[0];
          if (presence) {
            users.push({
              user_id: userId,
              name: presence.name || 'Unknown User',
              avatar: presence.avatar,
              last_seen: new Date().toISOString(),
              status: 'online'
            });
          }
        });
        
        setOnlineUsers(users);
        setIsLoading(false);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Send initial presence
          await channel.track({
            user_id: user.id,
            name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Guest',
            avatar: profile?.avatar_url,
            online_at: new Date().toISOString(),
            status: 'online'
          });
        }
      });

    setPresenceChannel(channel);

    // Heartbeat to maintain presence
    const heartbeat = setInterval(async () => {
      if (channel && channel.state === 'joined') {
        await channel.track({
          user_id: user.id,
          name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Guest',
          avatar: profile?.avatar_url,
          online_at: new Date().toISOString(),
          status: 'online'
        });
      }
    }, 25000); // 25 second heartbeat

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeat);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user?.id, profile]);

  // Handle browser visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!presenceChannel) return;

      if (document.hidden) {
        // User went away
        await presenceChannel.track({
          user_id: user?.id,
          name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Guest',
          avatar: profile?.avatar_url,
          online_at: new Date().toISOString(),
          status: 'away'
        });
      } else {
        // User came back
        await presenceChannel.track({
          user_id: user?.id,
          name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Guest',
          avatar: profile?.avatar_url,
          online_at: new Date().toISOString(),
          status: 'online'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [presenceChannel, user?.id, profile]);

  const updateStatus = async (status: 'online' | 'away' | 'offline') => {
    if (!presenceChannel || !user?.id) return;

    if (status === 'offline') {
      await presenceChannel.untrack();
    } else {
      await presenceChannel.track({
        user_id: user.id,
        name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Guest',
        avatar: profile?.avatar_url,
        online_at: new Date().toISOString(),
        status
      });
    }
  };

  const value: PresenceContextType = {
    onlineUsers,
    onlineCount: onlineUsers.length,
    isLoading,
    updateStatus,
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = (): PresenceContextType => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
};