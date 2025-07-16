import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================================================
// CONVERSATION SETTINGS HOOK
// ============================================================================

export interface ConversationSettings {
  id: string;
  conversation_id: string;
  theme: string;
  notifications_enabled: boolean;
  read_receipts_enabled: boolean;
  typing_indicators_enabled: boolean;
  message_deletion_allowed: boolean;
  file_sharing_enabled: boolean;
  emoji_reactions_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationSettingsInput {
  conversation_id: string;
  theme?: string;
  notifications_enabled?: boolean;
  read_receipts_enabled?: boolean;
  typing_indicators_enabled?: boolean;
  message_deletion_allowed?: boolean;
  file_sharing_enabled?: boolean;
  emoji_reactions_enabled?: boolean;
}

export const useConversationSettings = () => {
  const [settings, setSettings] = useState<ConversationSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (conversationId?: string) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('conversation_settings').select('*');
      if (conversationId) query = query.eq('conversation_id', conversationId);
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setSettings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (id: string, updates: Partial<ConversationSettingsInput>) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('conversation_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      setSettings(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { settings, loading, error, fetchSettings, updateSettings };
};

// ============================================================================
// GIFT REGISTRY REDIRECTS HOOK
// ============================================================================

export interface GiftRegistryRedirect {
  id: string;
  wedding_id: string;
  registry_name: string;
  registry_url: string;
  redirect_url: string;
  click_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GiftRegistryRedirectInput {
  wedding_id: string;
  registry_name: string;
  registry_url: string;
  redirect_url: string;
  is_active?: boolean;
}

export const useGiftRegistryRedirects = () => {
  const [redirects, setRedirects] = useState<GiftRegistryRedirect[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRedirects = useCallback(async (weddingId?: string) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('gift_registry_redirects').select('*').order('created_at');
      if (weddingId) query = query.eq('wedding_id', weddingId);
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setRedirects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch redirects');
    } finally {
      setLoading(false);
    }
  }, []);

  const trackClick = useCallback(async (id: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('gift_registry_redirects')
        .update({ click_count: supabase.sql`click_count + 1` })
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      setRedirects(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track click');
      return null;
    }
  }, []);

  return { redirects, loading, error, fetchRedirects, trackClick };
};

// ============================================================================
// GUEST LINK HISTORY HOOK
// ============================================================================

export interface GuestLinkHistory {
  id: string;
  guest_id: string;
  link_url: string;
  link_type: string;
  visited_at: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
}

export const useGuestLinkHistory = () => {
  const [history, setHistory] = useState<GuestLinkHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (guestId?: string) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('guest_link_history').select('*').order('visited_at', { ascending: false });
      if (guestId) query = query.eq('guest_id', guestId);
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, []);

  const trackVisit = useCallback(async (guestId: string, linkUrl: string, linkType: string) => {
    try {
      const { data, error: insertError } = await supabase
        .from('guest_link_history')
        .insert([{
          guest_id: guestId,
          link_url: linkUrl,
          link_type: linkType,
          visited_at: new Date().toISOString(),
          ip_address: '', // Would be populated server-side
          user_agent: navigator.userAgent,
          referrer: document.referrer
        }])
        .select()
        .single();
      if (insertError) throw insertError;
      setHistory(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track visit');
      return null;
    }
  }, []);

  return { history, loading, error, fetchHistory, trackVisit };
};

// ============================================================================
// MESSAGE REPORTS HOOK
// ============================================================================

export interface MessageReport {
  id: string;
  message_id: string;
  reported_by: string;
  report_reason: string;
  report_description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useMessageReports = () => {
  const [reports, setReports] = useState<MessageReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('message_reports').select('*').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setReports(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (messageId: string, reason: string, description?: string) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('message_reports')
        .insert([{
          message_id: messageId,
          reported_by: 'current_user', // Would get from auth context
          report_reason: reason,
          report_description: description,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (createError) throw createError;
      setReports(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reports, loading, error, fetchReports, createReport };
};

// ============================================================================
// PHOTO COMMENTS HOOK
// ============================================================================

export interface PhotoComment {
  id: string;
  photo_id: string;
  user_id: string;
  comment_text: string;
  parent_comment_id?: string;
  likes_count: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export const usePhotoComments = () => {
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async (photoId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('photo_comments')
        .select('*')
        .eq('photo_id', photoId)
        .order('created_at');
      if (fetchError) throw fetchError;
      setComments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (photoId: string, commentText: string, parentId?: string) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('photo_comments')
        .insert([{
          photo_id: photoId,
          user_id: 'current_user', // Would get from auth context
          comment_text: commentText,
          parent_comment_id: parentId,
          likes_count: 0,
          is_approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (createError) throw createError;
      setComments(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { comments, loading, error, fetchComments, addComment };
};

// ============================================================================
// POLL NOTIFICATIONS HOOK
// ============================================================================

export interface PollNotification {
  id: string;
  poll_id: string;
  user_id: string;
  notification_type: 'new_poll' | 'poll_closed' | 'poll_reminder' | 'milestone_reached';
  title: string;
  message: string;
  is_read: boolean;
  sent_at: string;
  read_at?: string;
}

export const usePollNotifications = () => {
  const [notifications, setNotifications] = useState<PollNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (userId?: string) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('poll_notifications').select('*').order('sent_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setNotifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('poll_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      setNotifications(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
      return null;
    }
  }, []);

  return { notifications, loading, error, fetchNotifications, markAsRead };
};

// ============================================================================
// POST COMMENTS HOOK
// ============================================================================

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  parent_comment_id?: string;
  likes_count: number;
  replies_count: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export const usePostComments = () => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at');
      if (fetchError) throw fetchError;
      setComments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (postId: string, commentText: string, parentId?: string) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('post_comments')
        .insert([{
          post_id: postId,
          user_id: 'current_user',
          comment_text: commentText,
          parent_comment_id: parentId,
          likes_count: 0,
          replies_count: 0,
          is_approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (createError) throw createError;
      setComments(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { comments, loading, error, fetchComments, addComment };
};

// ============================================================================
// POST REACTIONS HOOK
// ============================================================================

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  created_at: string;
}

export const usePostReactions = () => {
  const [reactions, setReactions] = useState<PostReaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReactions = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId);
      if (fetchError) throw fetchError;
      setReactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const addReaction = useCallback(async (postId: string, reactionType: string) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('post_reactions')
        .insert([{
          post_id: postId,
          user_id: 'current_user',
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (createError) throw createError;
      setReactions(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reaction');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reactions, loading, error, fetchReactions, addReaction };
};

// ============================================================================
// SOCIAL FEED LIKES HOOK
// ============================================================================

export interface SocialFeedLike {
  id: string;
  feed_id: string;
  user_id: string;
  created_at: string;
}

export const useSocialFeedLikes = () => {
  const [likes, setLikes] = useState<SocialFeedLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLikes = useCallback(async (feedId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('social_feed_likes')
        .select('*')
        .eq('feed_id', feedId);
      if (fetchError) throw fetchError;
      setLikes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch likes');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleLike = useCallback(async (feedId: string) => {
    try {
      setLoading(true);
      const userId = 'current_user';
      const existingLike = likes.find(like => like.feed_id === feedId && like.user_id === userId);
      
      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('social_feed_likes')
          .delete()
          .eq('id', existingLike.id);
        if (deleteError) throw deleteError;
        setLikes(prev => prev.filter(like => like.id !== existingLike.id));
      } else {
        const { data, error: createError } = await supabase
          .from('social_feed_likes')
          .insert([{
            feed_id: feedId,
            user_id: userId,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
        if (createError) throw createError;
        setLikes(prev => [...prev, data]);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle like');
      return false;
    } finally {
      setLoading(false);
    }
  }, [likes]);

  return { likes, loading, error, fetchLikes, toggleLike };
};

// ============================================================================
// TRANSPORTATION CATEGORIES HOOK
// ============================================================================

export interface TransportationCategory {
  id: string;
  wedding_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTransportationCategories = () => {
  const [categories, setCategories] = useState<TransportationCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (weddingId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('transportation_categories')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('name');
      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  return { categories, loading, error, fetchCategories };
};

// ============================================================================
// TRANSPORTATION SCHEDULES HOOK
// ============================================================================

export interface TransportationSchedule {
  id: string;
  category_id: string;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  arrival_time: string;
  capacity: number;
  available_spots: number;
  driver_name?: string;
  driver_contact?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTransportationSchedules = () => {
  const [schedules, setSchedules] = useState<TransportationSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (categoryId?: string) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('transportation_schedules').select('*').order('departure_time');
      if (categoryId) query = query.eq('category_id', categoryId);
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setSchedules(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  return { schedules, loading, error, fetchSchedules };
};

export default {
  useConversationSettings,
  useGiftRegistryRedirects,
  useGuestLinkHistory,
  useMessageReports,
  usePhotoComments,
  usePollNotifications,
  usePostComments,
  usePostReactions,
  useSocialFeedLikes,
  useTransportationCategories,
  useTransportationSchedules
};