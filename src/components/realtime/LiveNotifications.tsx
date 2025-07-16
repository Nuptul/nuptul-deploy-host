import React, { useEffect, useState } from 'react';
import { Bell, Heart, MessageCircle, Users, Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { HapticFeedback } from '@/components/mobile/HapticFeedback';
import { Button } from '@/components/ui/button';

interface LiveNotification {
  id: string;
  type: 'like' | 'comment' | 'message' | 'rsvp' | 'photo' | 'mention';
  title: string;
  message: string;
  avatar?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface LiveNotificationsProps {
  onNotificationClick?: (notification: LiveNotification) => void;
}

export const LiveNotifications: React.FC<LiveNotificationsProps> = ({
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return Heart;
      case 'comment': return MessageCircle;
      case 'message': return MessageCircle;
      case 'rsvp': return Users;
      case 'photo': return Camera;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like': return 'text-red-500';
      case 'comment': return 'text-blue-500';
      case 'message': return 'text-green-500';
      case 'rsvp': return 'text-purple-500';
      case 'photo': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = async (notification: LiveNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      HapticFeedback.notification('success');
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    HapticFeedback.impact('light');
  };

  useEffect(() => {
    if (!user) return;

    // Set up real-time listeners for different notification types
    const channels = [
      // Photo likes
      supabase
        .channel('photo-likes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'photo_likes'
        }, async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          const newNotification: LiveNotification = {
            id: payload.new.id,
            type: 'like',
            title: 'Photo Liked',
            message: `${profile?.first_name || 'Someone'} liked your photo`,
            avatar: profile?.avatar_url,
            timestamp: new Date(),
            read: false
          };

          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
          HapticFeedback.notification('success');
        }),

      // Comments
      supabase
        .channel('comments')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'photo_comments'
        }, async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          const newNotification: LiveNotification = {
            id: payload.new.id,
            type: 'comment',
            title: 'New Comment',
            message: `${profile?.first_name || 'Someone'} commented on your photo`,
            avatar: profile?.avatar_url,
            timestamp: new Date(),
            read: false
          };

          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
          HapticFeedback.notification('warning');
        }),

      // RSVPs
      supabase
        .channel('rsvps')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'rsvps'
        }, async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          const newNotification: LiveNotification = {
            id: payload.new.id,
            type: 'rsvp',
            title: 'New RSVP',
            message: `${profile?.first_name || 'Someone'} responded to the wedding invitation`,
            avatar: profile?.avatar_url,
            timestamp: new Date(),
            read: false
          };

          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
          HapticFeedback.impact('medium');
        })
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user]);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="relative p-2 rounded-full glass-card hover:scale-105 transition-all duration-200"
      >
        <Bell className="w-5 h-5 text-wedding-navy" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isVisible && (
        <div className="absolute top-12 right-0 w-80 max-h-96 overflow-y-auto glass-card rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-wedding-navy">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 border-b border-white/5 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                      !notification.read ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-1.5 rounded-full bg-white/10 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-wedding-navy truncate">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {notification.message}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};