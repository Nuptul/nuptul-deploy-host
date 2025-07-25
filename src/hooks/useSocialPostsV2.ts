import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notificationService';

interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  media_types?: string[];
  media_thumbnails?: string[];
  location?: string;
  tags?: string[];
  visibility: string;
  is_pinned: boolean;
  share_count: number;
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
  poll?: {
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
    }>;
    expires_at: string;
    allow_multiple: boolean;
    user_voted: boolean;
    user_votes?: string[];
  };
  shared_post?: SocialPost;
  mentions?: Array<{
    user_id: string;
    display_name: string;
  }>;
}

export const useSocialPostsV2 = () => {
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
          ),
          polls (
            id,
            question,
            options,
            expires_at,
            allow_multiple
          ),
          post_mentions (
            mentioned_user_id,
            profiles:mentioned_user_id (
              display_name
            )
          ),
          shared_post:original_post_id (
            *,
            profiles!social_posts_user_id_fkey (
              display_name,
              first_name,
              last_name,
              avatar_url
            )
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
        // Get reaction counts, comments, and user interactions for each post
        const postsWithInteractions = await Promise.all(
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

            // Get poll votes if post has a poll
            let pollData = null;
            if (post.polls) {
              const { data: userVotes } = await supabase
                .from('poll_votes')
                .select('option_ids')
                .eq('poll_id', post.polls.id)
                .eq('user_id', user.id)
                .single();

              pollData = {
                ...post.polls,
                user_voted: !!userVotes,
                user_votes: userVotes?.option_ids
              };
            }

            // Calculate reaction counts
            const reactionCounts: Record<string, number> = {};
            reactions?.forEach((reaction) => {
              reactionCounts[reaction.reaction_type] = 
                (reactionCounts[reaction.reaction_type] || 0) + 1;
            });

            // Format mentions
            const mentions = post.post_mentions?.map((mention: any) => ({
              user_id: mention.mentioned_user_id,
              display_name: mention.profiles?.display_name || 'Unknown User'
            }));

            return {
              ...post,
              reaction_counts: reactionCounts,
              comment_count: commentCount || 0,
              user_reaction: userReaction?.reaction_type || null,
              poll: pollData,
              mentions: mentions || []
            };
          })
        );

        if (isLoadMore) {
          setPosts(prev => [...prev, ...postsWithInteractions]);
        } else {
          setPosts(postsWithInteractions);
        }

        if (postsWithInteractions.length > 0) {
          setLastPostId(postsWithInteractions[postsWithInteractions.length - 1].created_at);
        }

        setHasMore(postsWithInteractions.length === 10);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [user, lastPostId]);

  const createPost = useCallback(async (
    content: string, 
    mediaFiles: File[] = [],
    location?: string,
    tags: string[] = [],
    poll?: {
      question: string;
      options: string[];
      allowMultiple: boolean;
      duration: number;
    }
  ) => {
    if (!user || (!content.trim() && mediaFiles.length === 0 && !poll)) return;

    try {
      // Extract mentions from content
      const mentionRegex = /@(\w+(?:\s+\w+)?)/g;
      const mentions = [...content.matchAll(mentionRegex)];
      
      // Extract hashtags from content
      const hashtagRegex = /#(\w+)/g;
      const hashtags = [...content.matchAll(hashtagRegex)].map(match => match[1]);
      const allTags = [...new Set([...tags, ...hashtags])];

      // Upload media files
      let mediaUrls: string[] = [];
      let mediaTypes: string[] = [];
      let mediaThumbnails: string[] = [];

      if (mediaFiles.length > 0) {
        const uploadPromises = mediaFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `post-${user.id}-${Date.now()}-${Math.random()}.${fileExt}`;
          const filePath = `social-posts/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('social-media')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('social-media')
            .getPublicUrl(filePath);

          return {
            url: urlData.publicUrl,
            type: file.type,
            thumbnail: file.type.startsWith('video/') ? urlData.publicUrl : null
          };
        });

        const uploadedMedia = await Promise.all(uploadPromises);
        mediaUrls = uploadedMedia.map(m => m.url);
        mediaTypes = uploadedMedia.map(m => m.type);
        mediaThumbnails = uploadedMedia.map(m => m.thumbnail || m.url);
      }

      // Create the post
      const { data: postData, error: postError } = await supabase
        .from('social_posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            media_urls: mediaUrls.length > 0 ? mediaUrls : null,
            media_types: mediaTypes.length > 0 ? mediaTypes : null,
            media_thumbnails: mediaThumbnails.length > 0 ? mediaThumbnails : null,
            location: location || null,
            tags: allTags.length > 0 ? allTags : null,
            visibility: 'public'
          },
        ])
        .select()
        .single();

      if (postError) throw postError;

      // Create poll if provided
      if (poll && postData) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + poll.duration);

        const pollOptions = poll.options.map((text, index) => ({
          id: `option-${index}`,
          text,
          votes: 0
        }));

        const { error: pollError } = await supabase
          .from('polls')
          .insert({
            post_id: postData.id,
            question: poll.question,
            options: pollOptions,
            expires_at: expiresAt.toISOString(),
            allow_multiple: poll.allowMultiple
          });

        if (pollError) throw pollError;
      }

      // Handle mentions
      if (mentions.length > 0 && postData) {
        for (const mention of mentions) {
          const mentionedName = mention[1];
          
          // Find the mentioned user
          const { data: mentionedUser } = await supabase
            .from('profiles')
            .select('user_id, display_name')
            .or(`display_name.ilike.%${mentionedName}%,first_name.ilike.%${mentionedName}%`)
            .limit(1)
            .single();

          if (mentionedUser) {
            // Insert mention record
            await supabase
              .from('post_mentions')
              .insert({
                post_id: postData.id,
                mentioned_user_id: mentionedUser.user_id
              });

            // Send notification
            await notificationService.notifyMention(
              mentionedUser.user_id,
              user.user_metadata?.full_name || 'Someone',
              postData.id
            );
          }
        }
      }

      // Handle hashtags
      if (allTags.length > 0) {
        for (const tag of allTags) {
          // Insert or update hashtag
          const { data: hashtagData } = await supabase
            .from('hashtags')
            .select('id')
            .eq('tag', tag.toLowerCase())
            .single();

          let hashtagId;
          if (hashtagData) {
            hashtagId = hashtagData.id;
          } else {
            const { data: newHashtag } = await supabase
              .from('hashtags')
              .insert({ tag: tag.toLowerCase() })
              .select('id')
              .single();
            hashtagId = newHashtag?.id;
          }

          if (hashtagId && postData) {
            await supabase
              .from('post_hashtags')
              .insert({
                post_id: postData.id,
                hashtag_id: hashtagId
              });
          }
        }
      }

      // Refresh posts to show the new one
      await fetchPosts(false);
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  }, [user, fetchPosts]);

  const sharePost = useCallback(async (postId: string, comment?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('post_shares')
        .insert({
          original_post_id: postId,
          shared_by_user_id: user.id,
          share_comment: comment
        })
        .select()
        .single();

      if (error) throw error;

      // Increment share count
      await supabase.rpc('increment_share_count', { post_id: postId });

      // Get post owner for notification
      const { data: post } = await supabase
        .from('social_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (post && post.user_id !== user.id) {
        await notificationService.notifyShare(
          post.user_id,
          user.user_metadata?.full_name || 'Someone',
          postId
        );
      }

      // Refresh posts
      await fetchPosts(false);
    } catch (err) {
      console.error('Error sharing post:', err);
      throw err;
    }
  }, [user, fetchPosts]);

  const voteOnPoll = useCallback(async (pollId: string, optionIds: string[]) => {
    if (!user) return;

    try {
      // Check if already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        throw new Error('You have already voted on this poll');
      }

      // Insert vote
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_ids: optionIds
        });

      if (error) throw error;

      // Update vote counts
      for (const optionId of optionIds) {
        await supabase.rpc('increment_poll_option_votes', { 
          poll_id: pollId, 
          option_id: optionId 
        });
      }

      // Refresh posts
      await fetchPosts(false);
    } catch (err) {
      console.error('Error voting on poll:', err);
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

        // Send notification to post owner
        const { data: post } = await supabase
          .from('social_posts')
          .select('user_id')
          .eq('id', postId)
          .single();

        if (post && post.user_id !== user.id) {
          await notificationService.notifyLike(
            post.user_id,
            user.user_metadata?.full_name || 'Someone',
            postId
          );
        }
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

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('social_posts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'social_posts' },
        () => {
          fetchPosts(false);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    createPost,
    addReaction,
    sharePost,
    voteOnPoll,
    loadMore,
    refresh: () => fetchPosts(false),
  };
};