import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Poll Options Database Schema
 */
export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  option_description?: string;
  option_image_url?: string;
  option_value?: string | number;
  display_order: number;
  is_active: boolean;
  metadata?: {
    color?: string;
    icon?: string;
    category?: string;
    price?: number;
    rating?: number;
    tags?: string[];
  };
  vote_count?: number;
  percentage?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PollOptionInput {
  poll_id: string;
  option_text: string;
  option_description?: string;
  option_image_url?: string;
  option_value?: string | number;
  display_order?: number;
  is_active?: boolean;
  metadata?: {
    color?: string;
    icon?: string;
    category?: string;
    price?: number;
    rating?: number;
    tags?: string[];
  };
}

interface UsePollOptionsResult {
  pollOptions: PollOption[];
  currentOption: PollOption | null;
  loading: boolean;
  error: string | null;
  // CRUD operations
  fetchPollOptions: (pollId: string) => Promise<void>;
  createPollOption: (option: PollOptionInput) => Promise<PollOption | null>;
  updatePollOption: (id: string, option: Partial<PollOptionInput>) => Promise<PollOption | null>;
  deletePollOption: (id: string) => Promise<boolean>;
  // Bulk operations
  createMultiplePollOptions: (options: PollOptionInput[]) => Promise<PollOption[]>;
  updateOptionOrder: (optionUpdates: Array<{ id: string; display_order: number }>) => Promise<boolean>;
  duplicateOption: (id: string) => Promise<PollOption | null>;
  // Option management
  toggleOptionStatus: (id: string) => Promise<boolean>;
  moveOptionUp: (id: string) => Promise<boolean>;
  moveOptionDown: (id: string) => Promise<boolean>;
  // Analytics
  getOptionAnalytics: (pollId: string) => Promise<any>;
  // Real-time subscription
  subscribeToPollOptions: (pollId: string) => () => void;
  // Utilities
  refreshPollOptions: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for managing poll options with comprehensive ordering and analytics
 * 
 * @example
 * ```tsx
 * const { 
 *   pollOptions, 
 *   loading, 
 *   createPollOption,
 *   updateOptionOrder,
 *   getOptionAnalytics 
 * } = usePollOptions();
 * 
 * // Create poll options
 * const options = await createMultiplePollOptions([
 *   { poll_id: 'poll-123', option_text: 'Chocolate Cake', display_order: 1 },
 *   { poll_id: 'poll-123', option_text: 'Vanilla Cake', display_order: 2 },
 *   { poll_id: 'poll-123', option_text: 'Red Velvet Cake', display_order: 3 }
 * ]);
 * ```
 */
export const usePollOptions = (): UsePollOptionsResult => {
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [currentOption, setCurrentOption] = useState<PollOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch poll options for a specific poll
   */
  const fetchPollOptions = useCallback(async (pollId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('poll_options')
        .select(`
          *,
          poll_votes:poll_votes(count)
        `)
        .eq('poll_id', pollId)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      // Calculate vote counts and percentages
      const totalVotes = data?.reduce((sum, option) => sum + (option.poll_votes?.[0]?.count || 0), 0) || 0;
      
      const processedOptions = data?.map(option => ({
        ...option,
        vote_count: option.poll_votes?.[0]?.count || 0,
        percentage: totalVotes > 0 ? ((option.poll_votes?.[0]?.count || 0) / totalVotes) * 100 : 0
      })) || [];

      setPollOptions(processedOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch poll options');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new poll option
   */
  const createPollOption = useCallback(async (option: PollOptionInput): Promise<PollOption | null> => {
    try {
      setLoading(true);
      setError(null);

      // Get the next display order if not provided
      let displayOrder = option.display_order;
      if (displayOrder === undefined) {
        const { data: existingOptions } = await supabase
          .from('poll_options')
          .select('display_order')
          .eq('poll_id', option.poll_id)
          .order('display_order', { ascending: false })
          .limit(1);
        
        displayOrder = existingOptions && existingOptions.length > 0 ? existingOptions[0].display_order + 1 : 1;
      }

      const { data, error: createError } = await supabase
        .from('poll_options')
        .insert([{
          ...option,
          display_order: displayOrder,
          is_active: option.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      const processedOption = { ...data, vote_count: 0, percentage: 0 };
      setPollOptions(prev => [...prev, processedOption].sort((a, b) => a.display_order - b.display_order));
      setCurrentOption(processedOption);

      return processedOption;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll option');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing poll option
   */
  const updatePollOption = useCallback(async (
    id: string, 
    option: Partial<PollOptionInput>
  ): Promise<PollOption | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('poll_options')
        .update({
          ...option,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const existingOption = pollOptions.find(opt => opt.id === id);
      const processedOption = { 
        ...data, 
        vote_count: existingOption?.vote_count || 0,
        percentage: existingOption?.percentage || 0
      };

      setPollOptions(prev => 
        prev.map(item => item.id === id ? processedOption : item)
      );
      
      if (currentOption?.id === id) {
        setCurrentOption(processedOption);
      }

      return processedOption;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update poll option');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentOption, pollOptions]);

  /**
   * Delete poll option
   */
  const deletePollOption = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('poll_options')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setPollOptions(prev => prev.filter(item => item.id !== id));
      
      if (currentOption?.id === id) {
        setCurrentOption(null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete poll option');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOption]);

  /**
   * Create multiple poll options at once
   */
  const createMultiplePollOptions = useCallback(async (options: PollOptionInput[]): Promise<PollOption[]> => {
    try {
      setLoading(true);
      setError(null);

      // Assign display orders if not provided
      const optionsWithOrder = options.map((option, index) => ({
        ...option,
        display_order: option.display_order ?? index + 1,
        is_active: option.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error: createError } = await supabase
        .from('poll_options')
        .insert(optionsWithOrder)
        .select();

      if (createError) throw createError;

      const processedOptions = data.map(option => ({
        ...option,
        vote_count: 0,
        percentage: 0
      }));

      setPollOptions(prev => [...prev, ...processedOptions].sort((a, b) => a.display_order - b.display_order));

      return processedOptions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create multiple poll options');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update display order for multiple options
   */
  const updateOptionOrder = useCallback(async (
    optionUpdates: Array<{ id: string; display_order: number }>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const promises = optionUpdates.map(({ id, display_order }) =>
        supabase
          .from('poll_options')
          .update({ 
            display_order,
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`${errors.length} order updates failed`);
      }

      // Update local state
      setPollOptions(prev => {
        const updated = [...prev];
        optionUpdates.forEach(({ id, display_order }) => {
          const index = updated.findIndex(option => option.id === id);
          if (index !== -1) {
            updated[index] = { ...updated[index], display_order };
          }
        });
        return updated.sort((a, b) => a.display_order - b.display_order);
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update option order');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Duplicate an existing option
   */
  const duplicateOption = useCallback(async (id: string): Promise<PollOption | null> => {
    try {
      const originalOption = pollOptions.find(opt => opt.id === id);
      if (!originalOption) {
        throw new Error('Original option not found');
      }

      const { id: _, created_at, updated_at, vote_count, percentage, ...optionData } = originalOption;

      const duplicatedOption = await createPollOption({
        ...optionData,
        option_text: `${originalOption.option_text} (Copy)`,
        display_order: originalOption.display_order + 1
      });

      return duplicatedOption;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate option');
      return null;
    }
  }, [pollOptions, createPollOption]);

  /**
   * Toggle option active status
   */
  const toggleOptionStatus = useCallback(async (id: string): Promise<boolean> => {
    const option = pollOptions.find(opt => opt.id === id);
    if (!option) return false;

    const result = await updatePollOption(id, { is_active: !option.is_active });
    return result !== null;
  }, [pollOptions, updatePollOption]);

  /**
   * Move option up in display order
   */
  const moveOptionUp = useCallback(async (id: string): Promise<boolean> => {
    const currentIndex = pollOptions.findIndex(opt => opt.id === id);
    if (currentIndex <= 0) return false;

    const currentOption = pollOptions[currentIndex];
    const previousOption = pollOptions[currentIndex - 1];

    return await updateOptionOrder([
      { id: currentOption.id, display_order: previousOption.display_order },
      { id: previousOption.id, display_order: currentOption.display_order }
    ]);
  }, [pollOptions, updateOptionOrder]);

  /**
   * Move option down in display order
   */
  const moveOptionDown = useCallback(async (id: string): Promise<boolean> => {
    const currentIndex = pollOptions.findIndex(opt => opt.id === id);
    if (currentIndex >= pollOptions.length - 1) return false;

    const currentOption = pollOptions[currentIndex];
    const nextOption = pollOptions[currentIndex + 1];

    return await updateOptionOrder([
      { id: currentOption.id, display_order: nextOption.display_order },
      { id: nextOption.id, display_order: currentOption.display_order }
    ]);
  }, [pollOptions, updateOptionOrder]);

  /**
   * Get analytics for poll options
   */
  const getOptionAnalytics = useCallback(async (pollId: string) => {
    try {
      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select(`
          *,
          poll_votes:poll_votes(
            *,
            created_at
          )
        `)
        .eq('poll_id', pollId)
        .order('display_order', { ascending: true });

      if (optionsError) throw optionsError;

      const totalVotes = optionsData.reduce((sum, option) => sum + (option.poll_votes?.length || 0), 0);

      const analytics = {
        total_options: optionsData.length,
        total_votes: totalVotes,
        options_analytics: optionsData.map(option => {
          const votes = option.poll_votes || [];
          return {
            option_id: option.id,
            option_text: option.option_text,
            vote_count: votes.length,
            percentage: totalVotes > 0 ? (votes.length / totalVotes) * 100 : 0,
            vote_timeline: votes.map(vote => vote.created_at).sort(),
            is_winning: votes.length > 0 && votes.length === Math.max(...optionsData.map(opt => opt.poll_votes?.length || 0)),
            metadata: option.metadata
          };
        }),
        winner: optionsData.reduce((winner, option) => 
          (option.poll_votes?.length || 0) > (winner.poll_votes?.length || 0) ? option : winner,
          optionsData[0]
        ),
        close_race: (() => {
          const sortedByVotes = optionsData.sort((a, b) => (b.poll_votes?.length || 0) - (a.poll_votes?.length || 0));
          if (sortedByVotes.length < 2) return false;
          const diff = (sortedByVotes[0].poll_votes?.length || 0) - (sortedByVotes[1].poll_votes?.length || 0);
          return diff <= 3; // Close if within 3 votes
        })()
      };

      return analytics;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get option analytics');
      return null;
    }
  }, []);

  /**
   * Subscribe to real-time updates for poll options
   */
  const subscribeToPollOptions = useCallback((pollId: string) => {
    const subscription = supabase
      .channel(`poll_options_${pollId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_options',
          filter: `poll_id=eq.${pollId}`
        },
        (payload: RealtimePostgresChangesPayload<PollOption>) => {
          if (payload.eventType === 'INSERT') {
            const newOption = { ...payload.new, vote_count: 0, percentage: 0 };
            setPollOptions(prev => [...prev, newOption].sort((a, b) => a.display_order - b.display_order));
          } else if (payload.eventType === 'UPDATE') {
            setPollOptions(prev => 
              prev.map(item => item.id === payload.new.id ? 
                { ...payload.new, vote_count: item.vote_count, percentage: item.percentage } : item
              )
            );
            if (currentOption?.id === payload.new.id) {
              setCurrentOption(prev => prev ? 
                { ...payload.new, vote_count: prev.vote_count, percentage: prev.percentage } : null
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setPollOptions(prev => prev.filter(item => item.id !== payload.old.id));
            if (currentOption?.id === payload.old.id) {
              setCurrentOption(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentOption]);

  /**
   * Refresh poll options data
   */
  const refreshPollOptions = useCallback(async () => {
    if (pollOptions.length > 0) {
      await fetchPollOptions(pollOptions[0].poll_id);
    }
  }, [fetchPollOptions, pollOptions]);

  /**
   * Clear local cache
   */
  const clearCache = useCallback(() => {
    setPollOptions([]);
    setCurrentOption(null);
    setError(null);
  }, []);

  return {
    pollOptions,
    currentOption,
    loading,
    error,
    fetchPollOptions,
    createPollOption,
    updatePollOption,
    deletePollOption,
    createMultiplePollOptions,
    updateOptionOrder,
    duplicateOption,
    toggleOptionStatus,
    moveOptionUp,
    moveOptionDown,
    getOptionAnalytics,
    subscribeToPollOptions,
    refreshPollOptions,
    clearCache
  };
};

export default usePollOptions;