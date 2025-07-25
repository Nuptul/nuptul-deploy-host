import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type NotificationType = 
  | 'mention'
  | 'comment'
  | 'like'
  | 'share'
  | 'follow'
  | 'story_reply'
  | 'story_reaction'
  | 'poll_result'
  | 'message'
  | 'rsvp'
  | 'photo_tag';

interface NotificationMetadata {
  postId?: string;
  storyId?: string;
  commentId?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  pollId?: string;
  photoId?: string;
  [key: string]: any;
}

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
}

class NotificationService {
  private static instance: NotificationService;
  private pushSubscription: PushSubscription | null = null;
  private notificationPermission: NotificationPermission = 'default';

  private constructor() {
    this.initializePushNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializePushNotifications() {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
      
      if (this.notificationPermission === 'default') {
        // We'll ask for permission when user enables notifications in settings
      }
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        this.pushSubscription = await registration.pushManager.getSubscription();
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      
      if (permission === 'granted') {
        await this.subscribeToPush();
        toast.success('Notifications enabled!');
        return true;
      } else {
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  }

  private async subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // In production, you would get this from your server
      const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || '';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      this.pushSubscription = subscription;

      // Save subscription to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('push_subscriptions').upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys
        });
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async createNotification(params: CreateNotificationParams): Promise<void> {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        metadata: params.metadata || {}
      });

      if (error) throw error;

      // Check if user has notifications enabled
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', params.userId)
        .single();

      if (preferences?.push_enabled && this.notificationPermission === 'granted') {
        this.showBrowserNotification(params.title, params.message, params.metadata);
      }

      if (preferences?.sound_enabled) {
        this.playNotificationSound();
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  private showBrowserNotification(title: string, body: string, metadata?: NotificationMetadata) {
    if (this.notificationPermission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: metadata?.postId || metadata?.storyId || 'general',
        data: metadata
      });

      notification.onclick = () => {
        window.focus();
        // Navigate to relevant content based on notification type
        if (metadata?.postId) {
          window.location.href = `/social#post-${metadata.postId}`;
        } else if (metadata?.storyId) {
          window.location.href = `/social#story-${metadata.storyId}`;
        }
        notification.close();
      };
    }
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  // Helper methods for creating specific notification types
  async notifyMention(mentionedUserId: string, mentionerName: string, postId: string) {
    await this.createNotification({
      userId: mentionedUserId,
      type: 'mention',
      title: 'You were mentioned',
      message: `${mentionerName} mentioned you in a post`,
      metadata: { postId, userName: mentionerName }
    });
  }

  async notifyComment(postOwnerId: string, commenterName: string, postId: string, commentId: string) {
    await this.createNotification({
      userId: postOwnerId,
      type: 'comment',
      title: 'New comment',
      message: `${commenterName} commented on your post`,
      metadata: { postId, commentId, userName: commenterName }
    });
  }

  async notifyLike(postOwnerId: string, likerName: string, postId: string) {
    await this.createNotification({
      userId: postOwnerId,
      type: 'like',
      title: 'New like',
      message: `${likerName} liked your post`,
      metadata: { postId, userName: likerName }
    });
  }

  async notifyShare(postOwnerId: string, sharerName: string, postId: string) {
    await this.createNotification({
      userId: postOwnerId,
      type: 'share',
      title: 'Post shared',
      message: `${sharerName} shared your post`,
      metadata: { postId, userName: sharerName }
    });
  }

  async notifyStoryReply(storyOwnerId: string, replierName: string, storyId: string) {
    await this.createNotification({
      userId: storyOwnerId,
      type: 'story_reply',
      title: 'Story reply',
      message: `${replierName} replied to your story`,
      metadata: { storyId, userName: replierName }
    });
  }

  async notifyStoryReaction(storyOwnerId: string, reactorName: string, storyId: string, reaction: string) {
    await this.createNotification({
      userId: storyOwnerId,
      type: 'story_reaction',
      title: 'Story reaction',
      message: `${reactorName} reacted ${reaction} to your story`,
      metadata: { storyId, userName: reactorName }
    });
  }
}

export const notificationService = NotificationService.getInstance();