import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Guest RSVP Details Database Schema
 */
export interface GuestRSVPDetails {
  id: string;
  guest_id: string;
  event_id: string;
  rsvp_status: 'pending' | 'accepted' | 'declined' | 'tentative';
  response_date?: string;
  meal_choice?: string;
  dietary_restrictions?: string[];
  accessibility_needs?: string;
  plus_one_count?: number;
  plus_one_names?: string[];
  plus_one_meals?: string[];
  transportation_needed?: boolean;
  accommodation_needed?: boolean;
  special_requests?: string;
  attendance_confirmation?: boolean;
  check_in_time?: string;
  table_assignment?: string;
  gift_registry_viewed?: boolean;
  communication_preferences?: {
    email: boolean;
    sms: boolean;
    app_notifications: boolean;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  created_at?: string;
  updated_at?: string;
  responded_by?: string;
}

export interface GuestRSVPDetailsInput {
  guest_id: string;
  event_id: string;
  rsvp_status: 'pending' | 'accepted' | 'declined' | 'tentative';
  response_date?: string;
  meal_choice?: string;
  dietary_restrictions?: string[];
  accessibility_needs?: string;
  plus_one_count?: number;
  plus_one_names?: string[];
  plus_one_meals?: string[];
  transportation_needed?: boolean;
  accommodation_needed?: boolean;
  special_requests?: string;
  attendance_confirmation?: boolean;
  table_assignment?: string;
  communication_preferences?: {
    email: boolean;
    sms: boolean;
    app_notifications: boolean;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

interface UseGuestRSVPDetailsResult {
  rsvpDetails: GuestRSVPDetails[];
  currentRSVP: GuestRSVPDetails | null;
  loading: boolean;
  error: string | null;
  // CRUD operations
  fetchRSVPDetails: (eventId?: string, guestId?: string) => Promise<void>;
  createRSVPDetails: (details: GuestRSVPDetailsInput) => Promise<GuestRSVPDetails | null>;
  updateRSVPDetails: (id: string, details: Partial<GuestRSVPDetailsInput>) => Promise<GuestRSVPDetails | null>;
  deleteRSVPDetails: (id: string) => Promise<boolean>;
  // Bulk operations
  bulkUpdateRSVP: (updates: Array<{ id: string; updates: Partial<GuestRSVPDetailsInput> }>) => Promise<boolean>;
  // Analytics
  getRSVPSummary: (eventId: string) => Promise<{
    total: number;
    accepted: number;
    declined: number;
    pending: number;
    tentative: number;
  } | null>;
  // Real-time subscription
  subscribeToRSVPDetails: (eventId: string) => () => void;
  // Utilities
  refreshRSVPDetails: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for managing guest RSVP details with comprehensive tracking and analytics
 * 
 * @example
 * ```tsx
 * const { 
 *   rsvpDetails, 
 *   loading, 
 *   createRSVPDetails,
 *   getRSVPSummary 
 * } = useGuestRSVPDetails();
 * 
 * // Create RSVP response
 * const rsvp = await createRSVPDetails({
 *   guest_id: 'guest-123',
 *   event_id: 'event-456',
 *   rsvp_status: 'accepted',
 *   meal_choice: 'vegetarian'
 * });
 * ```
 */
export const useGuestRSVPDetails = (): UseGuestRSVPDetailsResult => {
  const [rsvpDetails, setRSVPDetails] = useState<GuestRSVPDetails[]>([]);
  const [currentRSVP, setCurrentRSVP] = useState<GuestRSVPDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch RSVP details with optional filtering
   */
  const fetchRSVPDetails = useCallback(async (eventId?: string, guestId?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('guest_rsvp_details')
        .select('*')
        .order('response_date', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      if (guestId) {
        query = query.eq('guest_id', guestId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setRSVPDetails(data || []);
      
      // Set current RSVP if filtering by guest
      if (guestId && data && data.length > 0) {
        setCurrentRSVP(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RSVP details');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new RSVP details
   */
  const createRSVPDetails = useCallback(async (details: GuestRSVPDetailsInput): Promise<GuestRSVPDetails | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('guest_rsvp_details')
        .insert([{
          ...details,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Update local state
      setRSVPDetails(prev => [data, ...prev]);
      setCurrentRSVP(data);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create RSVP details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing RSVP details
   */
  const updateRSVPDetails = useCallback(async (
    id: string, 
    details: Partial<GuestRSVPDetailsInput>
  ): Promise<GuestRSVPDetails | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('guest_rsvp_details')
        .update({
          ...details,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setRSVPDetails(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      
      if (currentRSVP?.id === id) {
        setCurrentRSVP(data);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update RSVP details');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentRSVP]);

  /**
   * Delete RSVP details
   */
  const deleteRSVPDetails = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('guest_rsvp_details')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      setRSVPDetails(prev => prev.filter(item => item.id !== id));
      
      if (currentRSVP?.id === id) {
        setCurrentRSVP(null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete RSVP details');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentRSVP]);

  /**
   * Bulk update multiple RSVP records
   */
  const bulkUpdateRSVP = useCallback(async (
    updates: Array<{ id: string; updates: Partial<GuestRSVPDetailsInput> }>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const promises = updates.map(({ id, updates: updateData }) =>
        supabase
          .from('guest_rsvp_details')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`${errors.length} updates failed`);
      }

      // Update local state with successful updates
      const updatedData = results.map(result => result.data).filter(Boolean) as GuestRSVPDetails[];
      
      setRSVPDetails(prev => {
        const updated = [...prev];
        updatedData.forEach(newData => {
          const index = updated.findIndex(item => item.id === newData.id);
          if (index !== -1) {
            updated[index] = newData;
          }
        });
        return updated;
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update RSVP details');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get RSVP summary statistics for an event
   */
  const getRSVPSummary = useCallback(async (eventId: string) => {
    try {
      const { data, error: summaryError } = await supabase
        .from('guest_rsvp_details')
        .select('rsvp_status')
        .eq('event_id', eventId);

      if (summaryError) throw summaryError;

      const summary = {
        total: data.length,
        accepted: data.filter(item => item.rsvp_status === 'accepted').length,
        declined: data.filter(item => item.rsvp_status === 'declined').length,
        pending: data.filter(item => item.rsvp_status === 'pending').length,
        tentative: data.filter(item => item.rsvp_status === 'tentative').length
      };

      return summary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get RSVP summary');
      return null;
    }
  }, []);

  /**
   * Subscribe to real-time updates for RSVP details
   */
  const subscribeToRSVPDetails = useCallback((eventId: string) => {
    const subscription = supabase
      .channel(`guest_rsvp_details_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guest_rsvp_details',
          filter: `event_id=eq.${eventId}`
        },
        (payload: RealtimePostgresChangesPayload<GuestRSVPDetails>) => {
          if (payload.eventType === 'INSERT') {
            setRSVPDetails(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRSVPDetails(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new : item)
            );
            if (currentRSVP?.id === payload.new.id) {
              setCurrentRSVP(payload.new);
            }
          } else if (payload.eventType === 'DELETE') {
            setRSVPDetails(prev => prev.filter(item => item.id !== payload.old.id));
            if (currentRSVP?.id === payload.old.id) {
              setCurrentRSVP(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentRSVP]);

  /**
   * Refresh RSVP details data
   */
  const refreshRSVPDetails = useCallback(async () => {
    await fetchRSVPDetails();
  }, [fetchRSVPDetails]);

  /**
   * Clear local cache
   */
  const clearCache = useCallback(() => {
    setRSVPDetails([]);
    setCurrentRSVP(null);
    setError(null);
  }, []);

  return {
    rsvpDetails,
    currentRSVP,
    loading,
    error,
    fetchRSVPDetails,
    createRSVPDetails,
    updateRSVPDetails,
    deleteRSVPDetails,
    bulkUpdateRSVP,
    getRSVPSummary,
    subscribeToRSVPDetails,
    refreshRSVPDetails,
    clearCache
  };
};

export default useGuestRSVPDetails;