import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Poll Votes Database Schema
 */
export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  selected_options: string[];
  rating_value?: number;
  text_response?: string;
  ranking_order?: number[];
  comment?: string;
  is_anonymous: boolean;
  vote_weight: number;
  ip_address?: string;
  user_agent?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  metadata?: {
    time_spent?: number;
    referrer?: string;
    device_type?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PollVoteInput {
  poll_id: string;
  user_id: string;
  selected_options?: string[];
  rating_value?: number;
  text_response?: string;
  ranking_order?: number[];
  comment?: string;
  is_anonymous?: boolean;
  vote_weight?: number;
  metadata?: {
    time_spent?: number;
    referrer?: string;
    device_type?: string;
  };
}

interface UsePollVotesResult {
  pollVotes: PollVote[];
  currentVote: PollVote | null;
  loading: boolean;
  error: string | null;
  // CRUD operations
  fetchPollVotes: (pollId: string, userId?: string) => Promise<void>;
  submitVote: (vote: PollVoteInput) => Promise<PollVote | null>;
  updateVote: (id: string, vote: Partial<PollVoteInput>) => Promise<PollVote | null>;
  deleteVote: (id: string) => Promise<boolean>;
  // Vote validation
  canUserVote: (pollId: string, userId: string) => Promise<boolean>;
  getUserVote: (pollId: string, userId: string) => Promise<PollVote | null>;
  // Analytics
  getVoteAnalytics: (pollId: string) => Promise<any>;
  getVotingTrends: (pollId: string, timeframe: 'hour' | 'day' | 'week') => Promise<any>;
  // Real-time subscription
  subscribeToPollVotes: (pollId: string) => () => void;
  // Utilities
  refreshPollVotes: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for managing poll votes with comprehensive validation and analytics
 * 
 * @example
 * ```tsx
 * const { 
 *   pollVotes, 
 *   loading, 
 *   submitVote,
 *   canUserVote,
 *   getVoteAnalytics 
 * } = usePollVotes();
 * 
 * // Check if user can vote
 * const canVote = await canUserVote('poll-123', 'user-456');
 * 
 * // Submit a vote
 * if (canVote) {
 *   const vote = await submitVote({
 *     poll_id: 'poll-123',
 *     user_id: 'user-456',
 *     selected_options: ['option-1']
 *   });
 * }
 * ```
 */
export const usePollVotes = (): UsePollVotesResult => {
  const [pollVotes, setPollVotes] = useState<PollVote[]>([]);
  const [currentVote, setCurrentVote] = useState<PollVote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch poll votes with optional user filtering
   */
  const fetchPollVotes = useCallback(async (pollId: string, userId?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('poll_votes')
        .select(`
          *,
          polls:polls(title, poll_type, is_anonymous),
          users:users(name, email)
        `)
        .eq('poll_id', pollId)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPollVotes(data || []);
      
      if (userId && data && data.length > 0) {
        setCurrentVote(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch poll votes');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit a new vote
   */
  const submitVote = useCallback(async (vote: PollVoteInput): Promise<PollVote | null> => {
    try {
      setLoading(true);
      setError(null);

      // First, check if user can vote
      const canVote = await canUserVote(vote.poll_id, vote.user_id);
      if (!canVote) {
        throw new Error('User cannot vote on this poll');
      }

      // Get browser/device info
      const userAgent = navigator.userAgent;
      const deviceType = /Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/.test(userAgent) ? 'mobile' : 'desktop';

      const { data, error: submitError } = await supabase
        .from('poll_votes')
        .insert([{
          ...vote,
          is_anonymous: vote.is_anonymous ?? false,
          vote_weight: vote.vote_weight ?? 1,
          user_agent: userAgent,
          metadata: {
            ...vote.metadata,
            device_type: deviceType,
            referrer: document.referrer || undefined
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (submitError) throw submitError;

      setPollVotes(prev => [data, ...prev]);
      setCurrentVote(data);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing vote
   */
  const updateVote = useCallback(async (
    id: string, 
    vote: Partial<PollVoteInput>
  ): Promise<PollVote | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('poll_votes')
        .update({
          ...vote,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setPollVotes(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      
      if (currentVote?.id === id) {
        setCurrentVote(data);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vote');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentVote]);

  /**
   * Delete vote
   */
  const deleteVote = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('poll_votes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setPollVotes(prev => prev.filter(item => item.id !== id));
      
      if (currentVote?.id === id) {
        setCurrentVote(null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vote');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentVote]);

  /**
   * Check if user can vote on a poll
   */
  const canUserVote = useCallback(async (pollId: string, userId: string): Promise<boolean> => {
    try {
      // First, get poll details
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('status, allow_multiple_votes, max_votes_per_user, voting_deadline')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      // Check if poll is active
      if (pollData.status !== 'active') {
        return false;
      }

      // Check if voting deadline has passed
      if (pollData.voting_deadline && new Date(pollData.voting_deadline) < new Date()) {
        return false;
      }

      // Check existing votes for this user
      const { data: existingVotes, error: votesError } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId);

      if (votesError) throw votesError;

      // Check if multiple votes are allowed
      if (!pollData.allow_multiple_votes && existingVotes.length > 0) {
        return false;
      }

      // Check max votes per user
      if (pollData.max_votes_per_user && existingVotes.length >= pollData.max_votes_per_user) {
        return false;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check voting eligibility');
      return false;
    }
  }, []);

  /**
   * Get user's existing vote for a poll
   */
  const getUserVote = useCallback(async (pollId: string, userId: string): Promise<PollVote | null> => {
    try {
      const { data, error: voteError } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (voteError && voteError.code !== 'PGRST116') throw voteError;

      return data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user vote');
      return null;
    }
  }, []);

  /**
   * Get comprehensive vote analytics for a poll
   */
  const getVoteAnalytics = useCallback(async (pollId: string) => {
    try {
      const { data: votesData, error: votesError } = await supabase
        .from('poll_votes')
        .select(`
          *,
          poll_options:poll_options(option_text)
        `)
        .eq('poll_id', pollId);

      if (votesError) throw votesError;

      const analytics = {
        total_votes: votesData.length,
        unique_voters: new Set(votesData.map(v => v.user_id)).size,
        anonymous_votes: votesData.filter(v => v.is_anonymous).length,
        vote_timeline: votesData.map(v => ({
          date: v.created_at,
          count: 1
        })).reduce((acc, curr) => {
          const date = curr.date.split('T')[0];
          acc[date] = (acc[date] || 0) + curr.count;
          return acc;
        }, {} as Record<string, number>),
        device_breakdown: votesData.reduce((acc, vote) => {
          const device = vote.metadata?.device_type || 'unknown';
          acc[device] = (acc[device] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        geographic_distribution: votesData.reduce((acc, vote) => {
          const country = vote.location?.country || 'unknown';
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        engagement_metrics: {
          avg_time_spent: votesData
            .filter(v => v.metadata?.time_spent)
            .reduce((sum, v) => sum + (v.metadata?.time_spent || 0), 0) / 
            votesData.filter(v => v.metadata?.time_spent).length || 0,
          votes_with_comments: votesData.filter(v => v.comment).length,
          comment_rate: votesData.length > 0 ? 
            (votesData.filter(v => v.comment).length / votesData.length) * 100 : 0
        },
        option_breakdown: votesData.reduce((acc, vote) => {
          vote.selected_options?.forEach(optionId => {
            acc[optionId] = (acc[optionId] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>)
      };

      return analytics;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get vote analytics');
      return null;
    }
  }, []);

  /**
   * Get voting trends over time
   */
  const getVotingTrends = useCallback(async (pollId: string, timeframe: 'hour' | 'day' | 'week') => {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'hour':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
          break;
        case 'day':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
          break;
        case 'week':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
          break;
      }

      const { data: trendsData, error: trendsError } = await supabase
        .from('poll_votes')
        .select('created_at')
        .eq('poll_id', pollId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (trendsError) throw trendsError;

      // Group votes by time intervals
      const trends = trendsData.reduce((acc, vote) => {
        let timeKey: string;
        const voteDate = new Date(vote.created_at);

        switch (timeframe) {
          case 'hour':
            timeKey = `${voteDate.getFullYear()}-${voteDate.getMonth() + 1}-${voteDate.getDate()}-${voteDate.getHours()}`;
            break;
          case 'day':
            timeKey = `${voteDate.getFullYear()}-${voteDate.getMonth() + 1}-${voteDate.getDate()}`;
            break;
          case 'week':
            const weekStart = new Date(voteDate.getTime() - (voteDate.getDay() * 24 * 60 * 60 * 1000));
            timeKey = `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
            break;
          default:
            timeKey = vote.created_at.split('T')[0];
        }

        acc[timeKey] = (acc[timeKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        timeframe,
        trends,
        peak_time: Object.keys(trends).reduce((peak, time) => 
          trends[time] > (trends[peak] || 0) ? time : peak, 
          Object.keys(trends)[0]
        ),
        total_votes_in_period: Object.values(trends).reduce((sum, count) => sum + count, 0),
        average_votes_per_interval: Object.values(trends).reduce((sum, count) => sum + count, 0) / Object.keys(trends).length
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get voting trends');
      return null;
    }
  }, []);

  /**
   * Subscribe to real-time updates for poll votes
   */
  const subscribeToPollVotes = useCallback((pollId: string) => {
    const subscription = supabase
      .channel(`poll_votes_${pollId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes',
          filter: `poll_id=eq.${pollId}`
        },
        (payload: RealtimePostgresChangesPayload<PollVote>) => {
          if (payload.eventType === 'INSERT') {
            setPollVotes(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPollVotes(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new : item)
            );
            if (currentVote?.id === payload.new.id) {
              setCurrentVote(payload.new);
            }
          } else if (payload.eventType === 'DELETE') {
            setPollVotes(prev => prev.filter(item => item.id !== payload.old.id));
            if (currentVote?.id === payload.old.id) {
              setCurrentVote(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentVote]);

  /**
   * Refresh poll votes data
   */
  const refreshPollVotes = useCallback(async () => {
    if (pollVotes.length > 0) {
      await fetchPollVotes(pollVotes[0].poll_id);
    }
  }, [fetchPollVotes, pollVotes]);

  /**
   * Clear local cache
   */
  const clearCache = useCallback(() => {
    setPollVotes([]);
    setCurrentVote(null);
    setError(null);
  }, []);

  return {
    pollVotes,
    currentVote,
    loading,
    error,
    fetchPollVotes,
    submitVote,
    updateVote,
    deleteVote,
    canUserVote,
    getUserVote,
    getVoteAnalytics,
    getVotingTrends,
    subscribeToPollVotes,
    refreshPollVotes,
    clearCache
  };
};

export default usePollVotes;