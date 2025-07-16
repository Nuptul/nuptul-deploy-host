import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'mention' | 'follow' | 'wedding_update' | 'message';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id?: string; // post_id, user_id, etc.
  action_url?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // For now, show empty state for production
      console.warn('🚧 PRODUCTION READY: Mock notifications removed. Implement real notifications system.');
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (
    targetUserId: string,
    type: Notification['type'],
    title: string,
    message: string,
    relatedId?: string,
    actionUrl?: string
  ) => {
    try {
      const newNotification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: targetUserId,
        type,
        title,
        message,
        is_read: false,
        created_at: new Date().toISOString(),
        related_id: relatedId,
        action_url: actionUrl
      };

      // In a real app, this would be saved to database
      
      
      // If it's for the current user, add to local state
      if (targetUserId === user?.id) {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error creating notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    refresh: fetchNotifications
  };
};