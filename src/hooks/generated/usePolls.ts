import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Polls Database Schema
 */
export interface Poll {
  id: string;
  wedding_id: string;
  title: string;
  description?: string;
  poll_type: 'single_choice' | 'multiple_choice' | 'rating' | 'text' | 'yes_no' | 'ranking';
  status: 'draft' | 'active' | 'closed' | 'archived';
  is_anonymous: boolean;
  allow_multiple_votes: boolean;
  show_results_before_voting: boolean;
  show_results_after_voting: boolean;
  require_authentication: boolean;
  target_audience: 'all_guests' | 'family_only' | 'friends_only' | 'wedding_party' | 'custom';
  custom_audience_ids?: string[];
  start_date?: string;
  end_date?: string;
  voting_deadline?: string;
  max_votes_per_user?: number;
  results_visibility: 'public' | 'creator_only' | 'wedding_party' | 'family_only';
  notification_settings: {
    notify_on_vote: boolean;
    notify_on_milestone: boolean;
    milestone_intervals: number[];
  };
  poll_settings: {
    randomize_options: boolean;
    require_comment: boolean;
    min_rating?: number;
    max_rating?: number;
    rating_labels?: string[];
  };
  tags?: string[];
  category: 'venue' | 'catering' | 'music' | 'decoration' | 'activities' | 'general' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  created_by: string;
  total_votes?: number;
  total_participants?: number;
}

export interface PollInput {
  wedding_id: string;
  title: string;
  description?: string;
  poll_type: 'single_choice' | 'multiple_choice' | 'rating' | 'text' | 'yes_no' | 'ranking';
  status?: 'draft' | 'active' | 'closed' | 'archived';
  is_anonymous?: boolean;
  allow_multiple_votes?: boolean;
  show_results_before_voting?: boolean;
  show_results_after_voting?: boolean;
  require_authentication?: boolean;
  target_audience?: 'all_guests' | 'family_only' | 'friends_only' | 'wedding_party' | 'custom';
  custom_audience_ids?: string[];
  start_date?: string;
  end_date?: string;
  voting_deadline?: string;
  max_votes_per_user?: number;
  results_visibility?: 'public' | 'creator_only' | 'wedding_party' | 'family_only';
  notification_settings?: {
    notify_on_vote: boolean;
    notify_on_milestone: boolean;
    milestone_intervals: number[];
  };
  poll_settings?: {
    randomize_options: boolean;
    require_comment: boolean;
    min_rating?: number;
    max_rating?: number;
    rating_labels?: string[];
  };
  tags?: string[];
  category?: 'venue' | 'catering' | 'music' | 'decoration' | 'activities' | 'general' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface UsePollsResult {
  polls: Poll[];
  currentPoll: Poll | null;
  loading: boolean;
  error: string | null;
  // CRUD operations
  fetchPolls: (weddingId?: string, filters?: { status?: string; category?: string; target_audience?: string }) => Promise<void>;
  createPoll: (poll: PollInput) => Promise<Poll | null>;
  updatePoll: (id: string, poll: Partial<PollInput>) => Promise<Poll | null>;
  deletePoll: (id: string) => Promise<boolean>;
  // Poll management
  activatePoll: (id: string) => Promise<boolean>;
  closePoll: (id: string) => Promise<boolean>;
  archivePoll: (id: string) => Promise<boolean>;
  duplicatePoll: (id: string, newTitle?: string) => Promise<Poll | null>;
  // Analytics
  getPollAnalytics: (pollId: string) => Promise<any>;
  getPollsOverview: (weddingId: string) => Promise<any>;
  // Real-time subscription
  subscribeToPollUpdates: (weddingId: string) => () => void;
  // Utilities
  refreshPolls: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for managing wedding polls with comprehensive features and analytics
 * 
 * @example
 * ```tsx
 * const { 
 *   polls, 
 *   loading, 
 *   createPoll,
 *   activatePoll,
 *   getPollAnalytics 
 * } = usePolls();
 * 
 * // Create a new poll
 * const poll = await createPoll({
 *   wedding_id: 'wedding-123',
 *   title: 'Choose the wedding cake flavor',
 *   poll_type: 'single_choice',
 *   category: 'catering'
 * });
 * 
 * // Activate the poll
 * await activatePoll(poll.id);
 * ```
 */
export const usePolls = (): UsePollsResult => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch polls with optional filtering
   */
  const fetchPolls = useCallback(async (
    weddingId?: string, 
    filters?: { status?: string; category?: string; target_audience?: string }
  ) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('polls')
        .select(`
          *,
          poll_votes:poll_votes(count),
          poll_options:poll_options(*)
        `)
        .order('created_at', { ascending: false });

      if (weddingId) {
        query = query.eq('wedding_id', weddingId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.target_audience) {
        query = query.eq('target_audience', filters.target_audience);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Process the data to include vote counts
      const processedPolls = data?.map(poll => ({
        ...poll,
        total_votes: poll.poll_votes?.[0]?.count || 0,
        total_participants: poll.poll_votes?.[0]?.count || 0 // This would need more complex aggregation
      })) || [];

      setPolls(processedPolls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch polls');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new poll
   */
  const createPoll = useCallback(async (poll: PollInput): Promise<Poll | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('polls')
        .insert([{
          ...poll,
          status: poll.status || 'draft',
          is_anonymous: poll.is_anonymous ?? false,
          allow_multiple_votes: poll.allow_multiple_votes ?? false,
          show_results_before_voting: poll.show_results_before_voting ?? false,
          show_results_after_voting: poll.show_results_after_voting ?? true,
          require_authentication: poll.require_authentication ?? true,
          target_audience: poll.target_audience || 'all_guests',
          results_visibility: poll.results_visibility || 'public',
          category: poll.category || 'general',
          priority: poll.priority || 'medium',
          notification_settings: poll.notification_settings || {
            notify_on_vote: true,
            notify_on_milestone: true,
            milestone_intervals: [10, 25, 50, 100]
          },
          poll_settings: poll.poll_settings || {
            randomize_options: false,
            require_comment: false
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      setPolls(prev => [data, ...prev]);
      setCurrentPoll(data);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing poll
   */
  const updatePoll = useCallback(async (
    id: string, 
    poll: Partial<PollInput>
  ): Promise<Poll | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('polls')
        .update({
          ...poll,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setPolls(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      
      if (currentPoll?.id === id) {
        setCurrentPoll(data);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update poll');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentPoll]);

  /**
   * Delete poll
   */
  const deletePoll = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('polls')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setPolls(prev => prev.filter(item => item.id !== id));
      
      if (currentPoll?.id === id) {
        setCurrentPoll(null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete poll');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentPoll]);

  /**
   * Activate a poll
   */
  const activatePoll = useCallback(async (id: string): Promise<boolean> => {
    const result = await updatePoll(id, { 
      status: 'active',
      start_date: new Date().toISOString()
    });
    return result !== null;
  }, [updatePoll]);

  /**
   * Close a poll
   */
  const closePoll = useCallback(async (id: string): Promise<boolean> => {
    const result = await updatePoll(id, { 
      status: 'closed',
      end_date: new Date().toISOString()
    });
    return result !== null;
  }, [updatePoll]);

  /**
   * Archive a poll
   */
  const archivePoll = useCallback(async (id: string): Promise<boolean> => {
    const result = await updatePoll(id, { status: 'archived' });
    return result !== null;
  }, [updatePoll]);

  /**
   * Duplicate an existing poll
   */
  const duplicatePoll = useCallback(async (id: string, newTitle?: string): Promise<Poll | null> => {
    try {
      const originalPoll = polls.find(p => p.id === id);
      if (!originalPoll) {
        throw new Error('Original poll not found');
      }

      const { id: _, created_at, updated_at, total_votes, total_participants, ...pollData } = originalPoll;

      const duplicatedPoll = await createPoll({
        ...pollData,
        title: newTitle || `${originalPoll.title} (Copy)`,
        status: 'draft'
      });

      return duplicatedPoll;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate poll');
      return null;
    }
  }, [polls, createPoll]);

  /**
   * Get analytics for a specific poll
   */
  const getPollAnalytics = useCallback(async (pollId: string) => {
    try {
      // Fetch poll with detailed vote information
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options:poll_options(*),
          poll_votes:poll_votes(
            *,
            poll_options:poll_options(option_text)
          )
        `)
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      // Calculate analytics
      const analytics = {
        poll: pollData,
        participation: {
          total_votes: pollData.poll_votes?.length || 0,
          unique_voters: new Set(pollData.poll_votes?.map(v => v.user_id)).size || 0,
          participation_rate: 0 // Would need total invited count
        },
        timeline: {
          created_date: pollData.created_at,
          first_vote: pollData.poll_votes?.[0]?.created_at,
          last_vote: pollData.poll_votes?.slice(-1)[0]?.created_at,
          voting_duration: pollData.start_date && pollData.end_date ? 
            new Date(pollData.end_date).getTime() - new Date(pollData.start_date).getTime() : null
        },
        results: pollData.poll_options?.map(option => ({
          option_id: option.id,
          option_text: option.option_text,
          vote_count: pollData.poll_votes?.filter(v => v.selected_options?.includes(option.id)).length || 0,
          percentage: pollData.poll_votes?.length ? 
            ((pollData.poll_votes?.filter(v => v.selected_options?.includes(option.id)).length || 0) / pollData.poll_votes.length) * 100 : 0
        })) || []
      };

      return analytics;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get poll analytics');
      return null;
    }
  }, []);

  /**
   * Get overview of all polls for a wedding
   */
  const getPollsOverview = useCallback(async (weddingId: string) => {
    try {
      const { data, error: overviewError } = await supabase
        .from('polls')
        .select(`
          *,
          poll_votes:poll_votes(count)
        `)
        .eq('wedding_id', weddingId);

      if (overviewError) throw overviewError;

      const overview = {
        total_polls: data.length,
        active_polls: data.filter(p => p.status === 'active').length,
        draft_polls: data.filter(p => p.status === 'draft').length,
        closed_polls: data.filter(p => p.status === 'closed').length,
        total_votes: data.reduce((sum, poll) => sum + (poll.poll_votes?.[0]?.count || 0), 0),
        categories: {
          venue: data.filter(p => p.category === 'venue').length,
          catering: data.filter(p => p.category === 'catering').length,
          music: data.filter(p => p.category === 'music').length,
          decoration: data.filter(p => p.category === 'decoration').length,
          activities: data.filter(p => p.category === 'activities').length,
          general: data.filter(p => p.category === 'general').length,
          other: data.filter(p => p.category === 'other').length
        },
        most_voted_poll: data.reduce((max, poll) => 
          (poll.poll_votes?.[0]?.count || 0) > (max.poll_votes?.[0]?.count || 0) ? poll : max, 
          data[0]
        ),
        recent_activity: data
          .filter(p => p.updated_at)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 5)
      };

      return overview;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get polls overview');
      return null;
    }
  }, []);

  /**
   * Subscribe to real-time updates for polls
   */
  const subscribeToPollUpdates = useCallback((weddingId: string) => {
    const subscription = supabase
      .channel(`polls_${weddingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls',
          filter: `wedding_id=eq.${weddingId}`
        },
        (payload: RealtimePostgresChangesPayload<Poll>) => {
          if (payload.eventType === 'INSERT') {
            setPolls(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPolls(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new : item)
            );
            if (currentPoll?.id === payload.new.id) {
              setCurrentPoll(payload.new);
            }
          } else if (payload.eventType === 'DELETE') {
            setPolls(prev => prev.filter(item => item.id !== payload.old.id));
            if (currentPoll?.id === payload.old.id) {
              setCurrentPoll(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentPoll]);

  /**
   * Refresh polls data
   */
  const refreshPolls = useCallback(async () => {
    await fetchPolls();
  }, [fetchPolls]);

  /**
   * Clear local cache
   */
  const clearCache = useCallback(() => {
    setPolls([]);
    setCurrentPoll(null);
    setError(null);
  }, []);

  return {
    polls,
    currentPoll,
    loading,
    error,
    fetchPolls,
    createPoll,
    updatePoll,
    deletePoll,
    activatePoll,
    closePoll,
    archivePoll,
    duplicatePoll,
    getPollAnalytics,
    getPollsOverview,
    subscribeToPollUpdates,
    refreshPolls,
    clearCache
  };
};

export default usePolls;