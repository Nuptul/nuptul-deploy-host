import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Wedding Details Database Schema
 */
export interface WeddingDetails {
  id: string;
  wedding_id: string;
  ceremony_date?: string;
  ceremony_time?: string;
  ceremony_venue?: string;
  ceremony_address?: string;
  reception_date?: string;
  reception_time?: string;
  reception_venue?: string;
  reception_address?: string;
  dress_code?: string;
  theme?: string;
  color_palette?: string[];
  budget?: number;
  guest_count?: number;
  plus_ones_allowed?: boolean;
  rsvp_deadline?: string;
  meal_options?: string[];
  dietary_restrictions_allowed?: boolean;
  gift_registry_url?: string;
  wedding_website?: string;
  hashtag?: string;
  special_instructions?: string;
  accessibility_info?: string;
  parking_info?: string;
  accommodation_info?: string;
  weather_contingency?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface WeddingDetailsInput {
  wedding_id: string;
  ceremony_date?: string;
  ceremony_time?: string;
  ceremony_venue?: string;
  ceremony_address?: string;
  reception_date?: string;
  reception_time?: string;
  reception_venue?: string;
  reception_address?: string;
  dress_code?: string;
  theme?: string;
  color_palette?: string[];
  budget?: number;
  guest_count?: number;
  plus_ones_allowed?: boolean;
  rsvp_deadline?: string;
  meal_options?: string[];
  dietary_restrictions_allowed?: boolean;
  gift_registry_url?: string;
  wedding_website?: string;
  hashtag?: string;
  special_instructions?: string;
  accessibility_info?: string;
  parking_info?: string;
  accommodation_info?: string;
  weather_contingency?: string;
}

interface UseWeddingDetailsResult {
  weddingDetails: WeddingDetails[];
  currentDetails: WeddingDetails | null;
  loading: boolean;
  error: string | null;
  // CRUD operations
  fetchWeddingDetails: (weddingId?: string) => Promise<void>;
  createWeddingDetails: (details: WeddingDetailsInput) => Promise<WeddingDetails | null>;
  updateWeddingDetails: (id: string, details: Partial<WeddingDetailsInput>) => Promise<WeddingDetails | null>;
  deleteWeddingDetails: (id: string) => Promise<boolean>;
  // Real-time subscription
  subscribeToWeddingDetails: (weddingId: string) => () => void;
  // Utilities
  refreshWeddingDetails: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for managing wedding details with comprehensive CRUD operations and real-time updates
 * 
 * @example
 * ```tsx
 * const { 
 *   weddingDetails, 
 *   currentDetails, 
 *   loading, 
 *   createWeddingDetails,
 *   updateWeddingDetails 
 * } = useWeddingDetails();
 * 
 * // Create new wedding details
 * const details = await createWeddingDetails({
 *   wedding_id: 'wedding-123',
 *   ceremony_date: '2024-06-15',
 *   ceremony_venue: 'St. Mary\'s Cathedral'
 * });
 * ```
 */
export const useWeddingDetails = (): UseWeddingDetailsResult => {
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails[]>([]);
  const [currentDetails, setCurrentDetails] = useState<WeddingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch wedding details with optional filtering by wedding ID
   */
  const fetchWeddingDetails = useCallback(async (weddingId?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('wedding_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (weddingId) {
        query = query.eq('wedding_id', weddingId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setWeddingDetails(data || []);
      
      // Set current details to the first one if filtering by wedding ID
      if (weddingId && data && data.length > 0) {
        setCurrentDetails(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wedding details');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new wedding details
   */
  const createWeddingDetails = useCallback(async (details: WeddingDetailsInput): Promise<WeddingDetails | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('wedding_details')
        .insert([{
          ...details,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Update local state
      setWeddingDetails(prev => [data, ...prev]);
      setCurrentDetails(data);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wedding details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing wedding details
   */
  const updateWeddingDetails = useCallback(async (
    id: string, 
    details: Partial<WeddingDetailsInput>
  ): Promise<WeddingDetails | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('wedding_details')
        .update({
          ...details,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setWeddingDetails(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      
      if (currentDetails?.id === id) {
        setCurrentDetails(data);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update wedding details');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentDetails]);

  /**
   * Delete wedding details
   */
  const deleteWeddingDetails = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('wedding_details')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      setWeddingDetails(prev => prev.filter(item => item.id !== id));
      
      if (currentDetails?.id === id) {
        setCurrentDetails(null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete wedding details');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentDetails]);

  /**
   * Subscribe to real-time updates for wedding details
   */
  const subscribeToWeddingDetails = useCallback((weddingId: string) => {
    const subscription = supabase
      .channel(`wedding_details_${weddingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wedding_details',
          filter: `wedding_id=eq.${weddingId}`
        },
        (payload: RealtimePostgresChangesPayload<WeddingDetails>) => {
          if (payload.eventType === 'INSERT') {
            setWeddingDetails(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setWeddingDetails(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new : item)
            );
            if (currentDetails?.id === payload.new.id) {
              setCurrentDetails(payload.new);
            }
          } else if (payload.eventType === 'DELETE') {
            setWeddingDetails(prev => prev.filter(item => item.id !== payload.old.id));
            if (currentDetails?.id === payload.old.id) {
              setCurrentDetails(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentDetails]);

  /**
   * Refresh wedding details data
   */
  const refreshWeddingDetails = useCallback(async () => {
    await fetchWeddingDetails();
  }, [fetchWeddingDetails]);

  /**
   * Clear local cache
   */
  const clearCache = useCallback(() => {
    setWeddingDetails([]);
    setCurrentDetails(null);
    setError(null);
  }, []);

  return {
    weddingDetails,
    currentDetails,
    loading,
    error,
    fetchWeddingDetails,
    createWeddingDetails,
    updateWeddingDetails,
    deleteWeddingDetails,
    subscribeToWeddingDetails,
    refreshWeddingDetails,
    clearCache
  };
};

export default useWeddingDetails;