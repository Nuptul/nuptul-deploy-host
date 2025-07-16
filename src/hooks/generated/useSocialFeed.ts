import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Social Feed Database Schema
 */
export interface SocialFeed {
  id: string;
  wedding_id: string;
  feed_type: 'main' | 'family' | 'friends' | 'wedding_party' | 'vendors' | 'memories';
  name: string;
  description?: string;
  visibility: 'public' | 'private' | 'restricted';
  allowed_user_roles: string[];
  moderation_enabled: boolean;
  auto_approve_posts: boolean;
  require_approval: boolean;
  hashtags?: string[];
  featured_posts?: string[];
  pinned_posts?: string[];
  settings: {
    allow_photos: boolean;
    allow_videos: boolean;
    allow_polls: boolean;
    allow_comments: boolean;
    allow_reactions: boolean;
    max_post_length: number;
    media_upload_limit: number;
  };
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  post_count?: number;
  recent_activity?: string;
}

export interface SocialFeedInput {
  wedding_id: string;
  feed_type: 'main' | 'family' | 'friends' | 'wedding_party' | 'vendors' | 'memories';
  name: string;
  description?: string;
  visibility?: 'public' | 'private' | 'restricted';
  allowed_user_roles?: string[];
  moderation_enabled?: boolean;
  auto_approve_posts?: boolean;
  require_approval?: boolean;
  hashtags?: string[];
  settings?: {
    allow_photos: boolean;
    allow_videos: boolean;
    allow_polls: boolean;
    allow_comments: boolean;
    allow_reactions: boolean;
    max_post_length: number;
    media_upload_limit: number;
  };
  display_order?: number;
  is_active?: boolean;
}

interface UseSocialFeedResult {
  socialFeeds: SocialFeed[];
  currentFeed: SocialFeed | null;
  loading: boolean;
  error: string | null;
  // CRUD operations
  fetchSocialFeeds: (weddingId?: string, feedType?: string) => Promise<void>;
  createSocialFeed: (feed: SocialFeedInput) => Promise<SocialFeed | null>;
  updateSocialFeed: (id: string, feed: Partial<SocialFeedInput>) => Promise<SocialFeed | null>;
  deleteSocialFeed: (id: string) => Promise<boolean>;
  // Feed management
  toggleFeedStatus: (id: string) => Promise<boolean>;
  updateFeedOrder: (feedUpdates: Array<{ id: string; display_order: number }>) => Promise<boolean>;
  pinPost: (feedId: string, postId: string) => Promise<boolean>;
  unpinPost: (feedId: string, postId: string) => Promise<boolean>;
  featurePost: (feedId: string, postId: string) => Promise<boolean>;
  unfeaturePost: (feedId: string, postId: string) => Promise<boolean>;
  // Analytics
  getFeedAnalytics: (feedId: string) => Promise<any>;
  getFeedsOverview: (weddingId: string) => Promise<any>;
  // Real-time subscription
  subscribeToSocialFeeds: (weddingId: string) => () => void;
  // Utilities
  refreshSocialFeeds: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for managing social feeds with comprehensive moderation and analytics
 * 
 * @example
 * ```tsx
 * const { 
 *   socialFeeds, 
 *   loading, 
 *   createSocialFeed,
 *   getFeedAnalytics 
 * } = useSocialFeed();
 * 
 * // Create a new social feed
 * const feed = await createSocialFeed({
 *   wedding_id: 'wedding-123',
 *   feed_type: 'family',
 *   name: 'Family Updates',
 *   visibility: 'private'
 * });
 * ```
 */
export const useSocialFeed = (): UseSocialFeedResult => {
  const [socialFeeds, setSocialFeeds] = useState<SocialFeed[]>([]);
  const [currentFeed, setCurrentFeed] = useState<SocialFeed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch social feeds with optional filtering
   */
  const fetchSocialFeeds = useCallback(async (weddingId?: string, feedType?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('social_feed')
        .select(`
          *,
          social_posts:social_posts(count)
        `)
        .order('display_order', { ascending: true });

      if (weddingId) {
        query = query.eq('wedding_id', weddingId);
      }

      if (feedType) {
        query = query.eq('feed_type', feedType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const processedFeeds = data?.map(feed => ({
        ...feed,
        post_count: feed.social_posts?.[0]?.count || 0,
        recent_activity: new Date().toISOString() // This would come from latest post
      })) || [];

      setSocialFeeds(processedFeeds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch social feeds');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new social feed
   */
  const createSocialFeed = useCallback(async (feed: SocialFeedInput): Promise<SocialFeed | null> => {
    try {
      setLoading(true);
      setError(null);

      // Get the next display order if not provided
      let displayOrder = feed.display_order;
      if (displayOrder === undefined) {
        const { data: existingFeeds } = await supabase
          .from('social_feed')
          .select('display_order')
          .eq('wedding_id', feed.wedding_id)
          .order('display_order', { ascending: false })
          .limit(1);
        
        displayOrder = existingFeeds && existingFeeds.length > 0 ? existingFeeds[0].display_order + 1 : 1;
      }

      const { data, error: createError } = await supabase
        .from('social_feed')
        .insert([{
          ...feed,
          visibility: feed.visibility || 'public',
          allowed_user_roles: feed.allowed_user_roles || ['guest', 'family', 'friend'],
          moderation_enabled: feed.moderation_enabled ?? true,
          auto_approve_posts: feed.auto_approve_posts ?? true,
          require_approval: feed.require_approval ?? false,
          settings: feed.settings || {
            allow_photos: true,
            allow_videos: true,
            allow_polls: true,
            allow_comments: true,
            allow_reactions: true,
            max_post_length: 1000,
            media_upload_limit: 10
          },
          display_order: displayOrder,
          is_active: feed.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      const processedFeed = { ...data, post_count: 0, recent_activity: data.created_at };
      setSocialFeeds(prev => [...prev, processedFeed].sort((a, b) => a.display_order - b.display_order));
      setCurrentFeed(processedFeed);

      return processedFeed;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create social feed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing social feed
   */
  const updateSocialFeed = useCallback(async (
    id: string, 
    feed: Partial<SocialFeedInput>
  ): Promise<SocialFeed | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('social_feed')
        .update({
          ...feed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const existingFeed = socialFeeds.find(f => f.id === id);
      const processedFeed = { 
        ...data, 
        post_count: existingFeed?.post_count || 0,
        recent_activity: existingFeed?.recent_activity || data.updated_at
      };

      setSocialFeeds(prev => 
        prev.map(item => item.id === id ? processedFeed : item)
      );
      
      if (currentFeed?.id === id) {
        setCurrentFeed(processedFeed);
      }

      return processedFeed;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update social feed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentFeed, socialFeeds]);

  /**
   * Delete social feed
   */
  const deleteSocialFeed = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('social_feed')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSocialFeeds(prev => prev.filter(item => item.id !== id));
      
      if (currentFeed?.id === id) {
        setCurrentFeed(null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete social feed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentFeed]);

  /**
   * Toggle feed active status
   */
  const toggleFeedStatus = useCallback(async (id: string): Promise<boolean> => {
    const feed = socialFeeds.find(f => f.id === id);
    if (!feed) return false;

    const result = await updateSocialFeed(id, { is_active: !feed.is_active });
    return result !== null;
  }, [socialFeeds, updateSocialFeed]);

  /**
   * Update display order for multiple feeds
   */
  const updateFeedOrder = useCallback(async (
    feedUpdates: Array<{ id: string; display_order: number }>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const promises = feedUpdates.map(({ id, display_order }) =>
        supabase
          .from('social_feed')
          .update({ 
            display_order,
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`${errors.length} order updates failed`);
      }

      setSocialFeeds(prev => {
        const updated = [...prev];
        feedUpdates.forEach(({ id, display_order }) => {
          const index = updated.findIndex(feed => feed.id === id);
          if (index !== -1) {
            updated[index] = { ...updated[index], display_order };
          }
        });
        return updated.sort((a, b) => a.display_order - b.display_order);
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feed order');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Pin a post to the feed
   */
  const pinPost = useCallback(async (feedId: string, postId: string): Promise<boolean> => {
    const feed = socialFeeds.find(f => f.id === feedId);
    if (!feed) return false;

    const pinnedPosts = [...(feed.pinned_posts || []), postId];
    const result = await updateSocialFeed(feedId, { pinned_posts: pinnedPosts });
    return result !== null;
  }, [socialFeeds, updateSocialFeed]);

  /**
   * Unpin a post from the feed
   */
  const unpinPost = useCallback(async (feedId: string, postId: string): Promise<boolean> => {
    const feed = socialFeeds.find(f => f.id === feedId);
    if (!feed) return false;

    const pinnedPosts = (feed.pinned_posts || []).filter(id => id !== postId);
    const result = await updateSocialFeed(feedId, { pinned_posts: pinnedPosts });
    return result !== null;
  }, [socialFeeds, updateSocialFeed]);

  /**
   * Feature a post in the feed
   */
  const featurePost = useCallback(async (feedId: string, postId: string): Promise<boolean> => {
    const feed = socialFeeds.find(f => f.id === feedId);
    if (!feed) return false;

    const featuredPosts = [...(feed.featured_posts || []), postId];
    const result = await updateSocialFeed(feedId, { featured_posts: featuredPosts });
    return result !== null;
  }, [socialFeeds, updateSocialFeed]);

  /**
   * Unfeature a post from the feed
   */
  const unfeaturePost = useCallback(async (feedId: string, postId: string): Promise<boolean> => {
    const feed = socialFeeds.find(f => f.id === feedId);
    if (!feed) return false;

    const featuredPosts = (feed.featured_posts || []).filter(id => id !== postId);
    const result = await updateSocialFeed(feedId, { featured_posts: featuredPosts });
    return result !== null;
  }, [socialFeeds, updateSocialFeed]);

  /**
   * Get analytics for a specific feed
   */
  const getFeedAnalytics = useCallback(async (feedId: string) => {
    try {
      const { data: feedData, error: feedError } = await supabase
        .from('social_feed')
        .select(`
          *,
          social_posts:social_posts(
            *,
            post_comments:post_comments(count),
            post_reactions:post_reactions(count)
          )
        `)
        .eq('id', feedId)
        .single();

      if (feedError) throw feedError;

      const posts = feedData.social_posts || [];
      
      const analytics = {
        feed: feedData,
        post_metrics: {
          total_posts: posts.length,
          posts_today: posts.filter(p => 
            new Date(p.created_at).toDateString() === new Date().toDateString()
          ).length,
          posts_this_week: posts.filter(p => 
            new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length,
          average_posts_per_day: posts.length / 30 // Assuming 30 day history
        },
        engagement_metrics: {
          total_comments: posts.reduce((sum, post) => sum + (post.post_comments?.[0]?.count || 0), 0),
          total_reactions: posts.reduce((sum, post) => sum + (post.post_reactions?.[0]?.count || 0), 0),
          avg_comments_per_post: posts.length > 0 ? 
            posts.reduce((sum, post) => sum + (post.post_comments?.[0]?.count || 0), 0) / posts.length : 0,
          avg_reactions_per_post: posts.length > 0 ? 
            posts.reduce((sum, post) => sum + (post.post_reactions?.[0]?.count || 0), 0) / posts.length : 0
        },
        content_breakdown: {
          text_posts: posts.filter(p => !p.media_urls || p.media_urls.length === 0).length,
          photo_posts: posts.filter(p => p.media_urls && p.media_urls.some(url => url.includes('image'))).length,
          video_posts: posts.filter(p => p.media_urls && p.media_urls.some(url => url.includes('video'))).length
        },
        top_contributors: {} // Would need user data aggregation
      };

      return analytics;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get feed analytics');
      return null;
    }
  }, []);

  /**
   * Get overview of all feeds for a wedding
   */
  const getFeedsOverview = useCallback(async (weddingId: string) => {
    try {
      const { data, error: overviewError } = await supabase
        .from('social_feed')
        .select(`
          *,
          social_posts:social_posts(count)
        `)
        .eq('wedding_id', weddingId);

      if (overviewError) throw overviewError;

      const overview = {
        total_feeds: data.length,
        active_feeds: data.filter(f => f.is_active).length,
        total_posts: data.reduce((sum, feed) => sum + (feed.social_posts?.[0]?.count || 0), 0),
        feed_types: {
          main: data.filter(f => f.feed_type === 'main').length,
          family: data.filter(f => f.feed_type === 'family').length,
          friends: data.filter(f => f.feed_type === 'friends').length,
          wedding_party: data.filter(f => f.feed_type === 'wedding_party').length,
          vendors: data.filter(f => f.feed_type === 'vendors').length,
          memories: data.filter(f => f.feed_type === 'memories').length
        },
        most_active_feed: data.reduce((max, feed) => 
          (feed.social_posts?.[0]?.count || 0) > (max.social_posts?.[0]?.count || 0) ? feed : max, 
          data[0]
        ),
        moderation_stats: {
          moderated_feeds: data.filter(f => f.moderation_enabled).length,
          auto_approve_feeds: data.filter(f => f.auto_approve_posts).length,
          require_approval_feeds: data.filter(f => f.require_approval).length
        }
      };

      return overview;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get feeds overview');
      return null;
    }
  }, []);

  /**
   * Subscribe to real-time updates for social feeds
   */
  const subscribeToSocialFeeds = useCallback((weddingId: string) => {
    const subscription = supabase
      .channel(`social_feed_${weddingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_feed',
          filter: `wedding_id=eq.${weddingId}`
        },
        (payload: RealtimePostgresChangesPayload<SocialFeed>) => {
          if (payload.eventType === 'INSERT') {
            const newFeed = { ...payload.new, post_count: 0, recent_activity: payload.new.created_at };
            setSocialFeeds(prev => [...prev, newFeed].sort((a, b) => a.display_order - b.display_order));
          } else if (payload.eventType === 'UPDATE') {
            setSocialFeeds(prev => 
              prev.map(item => item.id === payload.new.id ? 
                { ...payload.new, post_count: item.post_count, recent_activity: item.recent_activity } : item
              )
            );
            if (currentFeed?.id === payload.new.id) {
              setCurrentFeed(prev => prev ? 
                { ...payload.new, post_count: prev.post_count, recent_activity: prev.recent_activity } : null
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setSocialFeeds(prev => prev.filter(item => item.id !== payload.old.id));
            if (currentFeed?.id === payload.old.id) {
              setCurrentFeed(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentFeed]);

  /**
   * Refresh social feeds data
   */
  const refreshSocialFeeds = useCallback(async () => {
    await fetchSocialFeeds();
  }, [fetchSocialFeeds]);

  /**
   * Clear local cache
   */
  const clearCache = useCallback(() => {
    setSocialFeeds([]);
    setCurrentFeed(null);
    setError(null);
  }, []);

  return {
    socialFeeds,
    currentFeed,
    loading,
    error,
    fetchSocialFeeds,
    createSocialFeed,
    updateSocialFeed,
    deleteSocialFeed,
    toggleFeedStatus,
    updateFeedOrder,
    pinPost,
    unpinPost,
    featurePost,
    unfeaturePost,
    getFeedAnalytics,
    getFeedsOverview,
    subscribeToSocialFeeds,
    refreshSocialFeeds,
    clearCache
  };
};

export default useSocialFeed;