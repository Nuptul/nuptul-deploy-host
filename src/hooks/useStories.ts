import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_thumbnail?: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  duration?: number;
  profiles?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface CreateStoryData {
  type: 'photo' | 'video' | 'text';
  file?: File;
  textContent?: string;
  backgroundColor?: string;
  textStyle?: any;
}

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch active stories
  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  // Create a new story
  const createStory = async (storyData: CreateStoryData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      let mediaUrl = '';
      let mediaThumbnail = '';
      let mediaType = 'photo';

      // Upload media file if provided
      if (storyData.file) {
        const fileExt = storyData.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('stories')
          .upload(filePath, storyData.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('stories')
          .getPublicUrl(filePath);

        mediaUrl = urlData.publicUrl;
        mediaType = storyData.file.type.startsWith('video/') ? 'video' : 'photo';

        // Generate thumbnail for videos (placeholder implementation)
        if (storyData.file.type.startsWith('video/')) {
          mediaThumbnail = mediaUrl; // In production, generate actual thumbnail
        }
      } else if (storyData.type === 'text') {
        mediaType = 'text';
        // For text stories, we'll store the text content as media_url temporarily
        mediaUrl = `data:text/plain;base64,${btoa(storyData.textContent || '')}`;
      }

      // Insert story record
      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_type: mediaType,
          media_url: mediaUrl || '',
          media_thumbnail: mediaThumbnail || undefined,
          duration: storyData.type === 'video' ? 15 : undefined // Default video duration
        });

      if (error) throw error;

      // Refresh stories
      await fetchStories();
    } catch (err) {
      console.error('Error creating story:', err);
      throw err;
    }
  };

  // View a story (track view) - placeholder for now
  const viewStory = async (storyId: string) => {
    if (!user) return;
    // This will be implemented after the migration adds story_views table
    
  };

  // Delete a story
  const deleteStory = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh stories
      await fetchStories();
    } catch (err) {
      console.error('Error deleting story:', err);
      throw err;
    }
  };

  // Get stories grouped by user
  const getStoriesByUser = () => {
    const storiesMap = new Map<string, Story[]>();
    
    stories.forEach(story => {
      const userId = story.user_id;
      if (!storiesMap.has(userId)) {
        storiesMap.set(userId, []);
      }
      storiesMap.get(userId)!.push(story);
    });

    return Array.from(storiesMap.entries()).map(([userId, userStories]) => ({
      userId,
      stories: userStories.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      latestStory: userStories[0] // Stories are already sorted by created_at desc
    }));
  };

  // Get user's own stories
  const getUserStories = () => {
    return stories.filter(story => story.user_id === user?.id);
  };

  // Setup real-time subscription
  useEffect(() => {
    fetchStories();

    // Subscribe to new stories
    const channel = supabase
      .channel('stories_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stories'
        },
        () => {
          fetchStories();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'stories'
        },
        () => {
          fetchStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stories,
    loading,
    error,
    createStory,
    viewStory,
    deleteStory,
    getStoriesByUser,
    getUserStories,
    refetch: fetchStories
  };
};