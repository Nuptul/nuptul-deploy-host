import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  media_thumbnail?: string;
  created_at: string;
  updated_at: string;
  reaction_counts: Record<string, number>;
  comment_count: number;
  user_reaction?: string;
  profiles?: {
    display_name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export const useSocialPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastPostId, setLastPostId] = useState<string | null>(null);

  const fetchPosts = useCallback(async (isLoadMore = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('social_posts')
        .select(`
          *,
          profiles!social_posts_user_id_fkey (
            display_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (isLoadMore && lastPostId) {
        query = query.lt('created_at', lastPostId);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;

      if (postsData) {
        // Get reaction counts and user reactions for each post
        const postsWithReactions = await Promise.all(
          postsData.map(async (post) => {
            // Get reaction counts
            const { data: reactions } = await supabase
              .from('social_post_reactions')
              .select('reaction_type')
              .eq('post_id', post.id);

            // Get user's reaction if logged in
            const { data: userReaction } = await supabase
              .from('social_post_reactions')
              .select('reaction_type')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single();

            // Get comment count
            const { count: commentCount } = await supabase
              .from('social_post_comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            // Calculate reaction counts
            const reactionCounts: Record<string, number> = {};
            reactions?.forEach((reaction) => {
              reactionCounts[reaction.reaction_type] = 
                (reactionCounts[reaction.reaction_type] || 0) + 1;
            });

            return {
              ...post,
              reaction_counts: reactionCounts,
              comment_count: commentCount || 0,
              user_reaction: userReaction?.reaction_type || null,
            };
          })
        );

        if (isLoadMore) {
          setPosts(prev => [...prev, ...postsWithReactions]);
        } else {
          setPosts(postsWithReactions);
        }

        if (postsWithReactions.length > 0) {
          setLastPostId(postsWithReactions[postsWithReactions.length - 1].created_at);
        }

        setHasMore(postsWithReactions.length === 10);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [user, lastPostId]);

  const createPost = useCallback(async (content: string, mediaFile?: File) => {
    if (!user || (!content.trim() && !mediaFile)) return;

    try {
      // First ensure user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !profile) {
        // Create profile if it doesn't exist
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (createProfileError) {
          throw new Error('Please complete your profile before posting');
        }
      }

      let mediaUrl = null;
      let mediaType = null;
      let mediaThumbnail = null;

      // Upload media if provided
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `post-${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `social-posts/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('social-media')
          .upload(filePath, mediaFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('social-media')
          .getPublicUrl(filePath);

        mediaUrl = urlData.publicUrl;
        mediaType = mediaFile.type;

        // Generate thumbnail for videos (placeholder for now)
        if (mediaFile.type.startsWith('video/')) {
          mediaThumbnail = mediaUrl; // In production, you'd generate an actual thumbnail
        }
      }

      // Create the post
      const { data, error } = await supabase
        .from('social_posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            media_url: mediaUrl,
            media_type: mediaType,
            media_thumbnail: mediaThumbnail,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Refresh posts to show the new one
      await fetchPosts(false);
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  }, [user, fetchPosts]);

  const addReaction = useCallback(async (postId: string, reactionType: string) => {
    if (!user) return;

    try {
      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('social_post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if same type
          await supabase
            .from('social_post_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // Update reaction type
          await supabase
            .from('social_post_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
        }
      } else {
        // Add new reaction
        await supabase
          .from('social_post_reactions')
          .insert([
            {
              post_id: postId,
              user_id: user.id,
              reaction_type: reactionType,
            },
          ]);
      }

      // Refresh posts to update reaction counts
      await fetchPosts(false);
    } catch (err) {
      console.error('Error adding reaction:', err);
      throw err;
    }
  }, [user, fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(true);
    }
  }, [loading, hasMore, fetchPosts]);

  useEffect(() => {
    fetchPosts(false);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    createPost,
    addReaction,
    loadMore,
    refresh: () => fetchPosts(false),
  };
};