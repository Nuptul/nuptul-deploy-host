import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface NotificationState {
  hasNewSocialPosts: boolean;
  hasNewDirectMessages: boolean;
  socialCount: number;
  messageCount: number;
}

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationState>({
    hasNewSocialPosts: false,
    hasNewDirectMessages: false,
    socialCount: 0,
    messageCount: 0,
  });

  useEffect(() => {
    if (!user) return;

    // Real-time subscription for new social posts
    const socialChannel = supabase
      .channel('social-posts-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_posts',
          filter: `user_id.neq.${user.id}`
        },
        (payload) => {
          if (payload.new.is_published) {
            setNotifications(prev => ({
              ...prev,
              hasNewSocialPosts: true,
              socialCount: prev.socialCount + 1
            }));
          }
        }
      )
      .subscribe();

    // Real-time subscription for new direct messages
    const messagesChannel = supabase
      .channel('chat-messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id.neq.${user.id}`
        },
        async (payload) => {
          const { data: isMember } = await supabase
            .rpc('is_chat_member', {
              chat_uuid: payload.new.chat_id,
              user_uuid: user.id
            });

          if (isMember) {
            setNotifications(prev => ({
              ...prev,
              hasNewDirectMessages: true,
              messageCount: prev.messageCount + 1
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(socialChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  const getNotificationForRoute = (routeId: string) => {
    switch (routeId) {
      case 'social':
        return {
          hasNotification: notifications.hasNewSocialPosts,
          type: 'social' as const,
          count: notifications.socialCount
        };
      default:
        return {
          hasNotification: false,
          type: null,
          count: 0
        };
    }
  };

  const getGlobalMessageNotification = () => {
    return {
      hasNotification: notifications.hasNewDirectMessages,
      type: 'message' as const,
      count: notifications.messageCount
    };
  };

  return {
    notifications,
    getNotificationForRoute,
    getGlobalMessageNotification
  };
};