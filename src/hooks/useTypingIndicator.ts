import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface UseTypingIndicatorOptions {
  chatId: string;
  enabled?: boolean;
  typingTimeout?: number;
  presenceKey?: string;
}

interface UseTypingIndicatorReturn {
  typingUsers: TypingUser[];
  isTyping: boolean;
  startTyping: () => void;
  stopTyping: () => void;
  setTyping: (isTyping: boolean) => void;
}

export const useTypingIndicator = ({
  chatId,
  enabled = true,
  typingTimeout = 3000,
  presenceKey = 'chat_typing'
}: UseTypingIndicatorOptions): UseTypingIndicatorReturn => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const lastTypingTimeRef = useRef<number>(0);

  // Initialize real-time channel
  useEffect(() => {
    if (!enabled || !chatId || !user) return;

    const channel = supabase.channel(`typing_${chatId}`, {
      config: {
        presence: {
          key: presenceKey
        }
      }
    });

    // Track presence changes (typing status)
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const currentTypingUsers: TypingUser[] = [];

        // Process all presence entries
        Object.values(presenceState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            // Only include users who are currently typing (not ourselves)
            if (presence.typing && 
                presence.user_id !== user.id && 
                Date.now() - presence.timestamp < typingTimeout) {
              currentTypingUsers.push({
                userId: presence.user_id,
                userName: presence.user_name || 'Unknown User',
                timestamp: presence.timestamp
              });
            }
          });
        });

        setTypingUsers(currentTypingUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Handle new users joining and typing
        newPresences.forEach((presence: any) => {
          if (presence.typing && presence.user_id !== user.id) {
            setTypingUsers(prev => {
              const existing = prev.find(u => u.userId === presence.user_id);
              if (!existing) {
                return [...prev, {
                  userId: presence.user_id,
                  userName: presence.user_name || 'Unknown User',
                  timestamp: presence.timestamp
                }];
              }
              return prev;
            });
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Handle users leaving
        leftPresences.forEach((presence: any) => {
          setTypingUsers(prev => prev.filter(u => u.userId !== presence.user_id));
        });
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [enabled, chatId, user, typingTimeout, presenceKey]);

  // Clean up expired typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => 
        prev.filter(user => Date.now() - user.timestamp < typingTimeout)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [typingTimeout]);

  // Start typing indicator
  const startTyping = useCallback(async () => {
    if (!enabled || !channelRef.current || !user || isTyping) return;

    const now = Date.now();
    
    // Throttle typing updates (don't send too frequently)
    if (now - lastTypingTimeRef.current < 1000) return;

    try {
      await channelRef.current.track({
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email || 'Unknown User',
        typing: true,
        timestamp: now
      });

      setIsTyping(true);
      lastTypingTimeRef.current = now;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Auto-stop typing after timeout
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, typingTimeout);

    } catch (error) {
      console.error('Error starting typing indicator:', error);
    }
  }, [enabled, user, isTyping, typingTimeout]);

  // Stop typing indicator
  const stopTyping = useCallback(async () => {
    if (!enabled || !channelRef.current || !user || !isTyping) return;

    try {
      await channelRef.current.track({
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email || 'Unknown User',
        typing: false,
        timestamp: Date.now()
      });

      setIsTyping(false);

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

    } catch (error) {
      console.error('Error stopping typing indicator:', error);
    }
  }, [enabled, user, isTyping]);

  // Set typing status (convenience method)
  const setTyping = useCallback((typing: boolean) => {
    if (typing) {
      startTyping();
    } else {
      stopTyping();
    }
  }, [startTyping, stopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Stop typing when component unmounts
      if (isTyping && channelRef.current && user) {
        channelRef.current.track({
          user_id: user.id,
          typing: false,
          timestamp: Date.now()
        });
      }
    };
  }, [isTyping, user]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping,
    setTyping
  };
};

// Export utility functions
export const formatTypingText = (typingUsers: TypingUser[]): string => {
  const names = typingUsers.map(user => user.userName);
  
  if (names.length === 0) return '';
  if (names.length === 1) return `${names[0]} is typing...`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
  return `${names[0]} and ${names.length - 1} others are typing...`;
};

export const getTypingUserNames = (typingUsers: TypingUser[]): string[] => {
  return typingUsers.map(user => user.userName);
};