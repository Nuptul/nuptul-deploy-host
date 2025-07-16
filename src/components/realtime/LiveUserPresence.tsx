import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/avatar';

interface UserPresence {
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  online_at: string;
  status?: 'online' | 'idle' | 'away';
  current_page?: string;
}

interface LiveUserPresenceProps {
  roomId: string;
  maxVisible?: number;
  showStatus?: boolean;
  className?: string;
}

export const LiveUserPresence: React.FC<LiveUserPresenceProps> = ({
  roomId,
  maxVisible = 5,
  showStatus = true,
  className = ''
}) => {
  const [presences, setPresences] = useState<Record<string, UserPresence[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`presence-${roomId}`);

    // Set up presence tracking
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState<UserPresence>();
        setPresences(newState);
        
        // Flatten presences to get unique users
        const users = Object.values(newState).flat();
        const uniqueUsers = users.reduce((acc, curr) => {
          const existing = acc.find(u => u.user_id === curr.user_id);
          if (!existing) {
            acc.push(curr);
          }
          return acc;
        }, [] as UserPresence[]);
        
        setOnlineUsers(uniqueUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('user_id', user.id)
            .single();

          // Track current user presence
          const userStatus: UserPresence = {
            user_id: user.id,
            first_name: profile?.first_name,
            last_name: profile?.last_name,
            avatar_url: profile?.avatar_url,
            online_at: new Date().toISOString(),
            status: 'online',
            current_page: window.location.pathname
          };

          await channel.track(userStatus);
        }
      });

    // Update status periodically
    const statusInterval = setInterval(async () => {
      if (channel.state === 'joined') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('user_id', user.id)
          .single();

        const userStatus: UserPresence = {
          user_id: user.id,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          avatar_url: profile?.avatar_url,
          online_at: new Date().toISOString(),
          status: document.hidden ? 'away' : 'online',
          current_page: window.location.pathname
        };

        await channel.track(userStatus);
      }
    }, 30000); // Update every 30 seconds

    // Handle page visibility changes
    const handleVisibilityChange = async () => {
      if (channel.state === 'joined') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('user_id', user.id)
          .single();

        const userStatus: UserPresence = {
          user_id: user.id,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          avatar_url: profile?.avatar_url,
          online_at: new Date().toISOString(),
          status: document.hidden ? 'away' : 'online',
          current_page: window.location.pathname
        };

        await channel.track(userStatus);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(statusInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [user, roomId]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getDisplayName = (presence: UserPresence) => {
    if (presence.first_name || presence.last_name) {
      return `${presence.first_name || ''} ${presence.last_name || ''}`.trim();
    }
    return 'Anonymous User';
  };

  const visibleUsers = onlineUsers
    .filter(u => u.user_id !== user?.id) // Don't show current user
    .slice(0, maxVisible);
  
  const hiddenCount = Math.max(0, onlineUsers.length - maxVisible - 1); // -1 for current user

  if (visibleUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Online Users Avatars */}
      <div className="flex -space-x-2">
        {visibleUsers.map((presence) => (
          <div key={presence.user_id} className="relative">
            <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
              {presence.avatar_url ? (
                <img 
                  src={presence.avatar_url} 
                  alt={getDisplayName(presence)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-wedding-navy/10 flex items-center justify-center text-xs font-medium text-wedding-navy">
                  {getDisplayName(presence).charAt(0).toUpperCase()}
                </div>
              )}
            </Avatar>
            
            {/* Status Indicator */}
            {showStatus && (
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(presence.status)}`} />
            )}
          </div>
        ))}
        
        {/* Show count if more users are online */}
        {hiddenCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              +{hiddenCount}
            </span>
          </div>
        )}
      </div>

      {/* Online Count Text */}
      <span className="text-xs text-gray-500">
        {onlineUsers.length === 1 ? '1 person' : `${onlineUsers.length} people`} online
      </span>
    </div>
  );
};