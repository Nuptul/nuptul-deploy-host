import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Event Attendance Summary Database Schema
 */
export interface EventAttendanceSummary {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  event_type: 'ceremony' | 'reception' | 'rehearsal' | 'brunch' | 'bachelor_party' | 'bachelorette_party' | 'engagement' | 'shower' | 'other';
  total_invited: number;
  total_confirmed: number;
  total_declined: number;
  total_pending: number;
  total_tentative: number;
  plus_ones_invited: number;
  plus_ones_confirmed: number;
  meal_breakdown: {
    [meal_option: string]: number;
  };
  dietary_restrictions_count: number;
  accessibility_needs_count: number;
  transportation_needed_count: number;
  accommodation_needed_count: number;
  check_in_stats: {
    checked_in: number;
    late_arrivals: number;
    no_shows: number;
  };
  age_demographics: {
    under_18: number;
    adults_18_65: number;
    seniors_65_plus: number;
  };
  relationship_breakdown: {
    family: number;
    friends: number;
    colleagues: number;
    other: number;
  };
  geographic_distribution: {
    [region: string]: number;
  };
  communication_preferences: {
    email_only: number;
    sms_only: number;
    app_notifications: number;
    multiple_channels: number;
  };
  last_updated: string;
  generated_at: string;
  generated_by?: string;
}

export interface EventAttendanceSummaryInput {
  event_id: string;
  event_name: string;
  event_date: string;
  event_type: 'ceremony' | 'reception' | 'rehearsal' | 'brunch' | 'bachelor_party' | 'bachelorette_party' | 'engagement' | 'shower' | 'other';
  total_invited: number;
  total_confirmed: number;
  total_declined: number;
  total_pending: number;
  total_tentative: number;
  plus_ones_invited: number;
  plus_ones_confirmed: number;
  meal_breakdown?: {
    [meal_option: string]: number;
  };
  dietary_restrictions_count?: number;
  accessibility_needs_count?: number;
  transportation_needed_count?: number;
  accommodation_needed_count?: number;
  check_in_stats?: {
    checked_in: number;
    late_arrivals: number;
    no_shows: number;
  };
  age_demographics?: {
    under_18: number;
    adults_18_65: number;
    seniors_65_plus: number;
  };
  relationship_breakdown?: {
    family: number;
    friends: number;
    colleagues: number;
    other: number;
  };
  geographic_distribution?: {
    [region: string]: number;
  };
  communication_preferences?: {
    email_only: number;
    sms_only: number;
    app_notifications: number;
    multiple_channels: number;
  };
}

interface UseEventAttendanceSummaryResult {
  attendanceSummaries: EventAttendanceSummary[];
  currentSummary: EventAttendanceSummary | null;
  loading: boolean;
  error: string | null;
  // CRUD operations
  fetchAttendanceSummaries: (eventId?: string) => Promise<void>;
  createAttendanceSummary: (summary: EventAttendanceSummaryInput) => Promise<EventAttendanceSummary | null>;
  updateAttendanceSummary: (id: string, summary: Partial<EventAttendanceSummaryInput>) => Promise<EventAttendanceSummary | null>;
  deleteAttendanceSummary: (id: string) => Promise<boolean>;
  // Analytics and reporting
  generateSummaryForEvent: (eventId: string) => Promise<EventAttendanceSummary | null>;
  getComparisonReport: (eventIds: string[]) => Promise<any>;
  exportSummaryData: (eventId: string, format: 'csv' | 'json') => Promise<string | null>;
  // Real-time subscription
  subscribeToAttendanceSummary: (eventId: string) => () => void;
  // Utilities
  refreshAttendanceSummaries: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for managing event attendance summaries with analytics and reporting capabilities
 * 
 * @example
 * ```tsx
 * const { 
 *   attendanceSummaries, 
 *   loading, 
 *   generateSummaryForEvent,
 *   getComparisonReport 
 * } = useEventAttendanceSummary();
 * 
 * // Generate summary for an event
 * const summary = await generateSummaryForEvent('event-123');
 * 
 * // Compare multiple events
 * const comparison = await getComparisonReport(['event-1', 'event-2']);
 * ```
 */
export const useEventAttendanceSummary = (): UseEventAttendanceSummaryResult => {
  const [attendanceSummaries, setAttendanceSummaries] = useState<EventAttendanceSummary[]>([]);
  const [currentSummary, setCurrentSummary] = useState<EventAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch attendance summaries with optional filtering
   */
  const fetchAttendanceSummaries = useCallback(async (eventId?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('event_attendance_summary')
        .select('*')
        .order('generated_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAttendanceSummaries(data || []);
      
      if (eventId && data && data.length > 0) {
        setCurrentSummary(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance summaries');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new attendance summary
   */
  const createAttendanceSummary = useCallback(async (summary: EventAttendanceSummaryInput): Promise<EventAttendanceSummary | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('event_attendance_summary')
        .insert([{
          ...summary,
          generated_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      setAttendanceSummaries(prev => [data, ...prev]);
      setCurrentSummary(data);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create attendance summary');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing attendance summary
   */
  const updateAttendanceSummary = useCallback(async (
    id: string, 
    summary: Partial<EventAttendanceSummaryInput>
  ): Promise<EventAttendanceSummary | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('event_attendance_summary')
        .update({
          ...summary,
          last_updated: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setAttendanceSummaries(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      
      if (currentSummary?.id === id) {
        setCurrentSummary(data);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update attendance summary');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentSummary]);

  /**
   * Delete attendance summary
   */
  const deleteAttendanceSummary = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('event_attendance_summary')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setAttendanceSummaries(prev => prev.filter(item => item.id !== id));
      
      if (currentSummary?.id === id) {
        setCurrentSummary(null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attendance summary');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentSummary]);

  /**
   * Generate attendance summary for an event by analyzing RSVP data
   */
  const generateSummaryForEvent = useCallback(async (eventId: string): Promise<EventAttendanceSummary | null> => {
    try {
      setLoading(true);
      setError(null);

      // This would typically call a database function or aggregate query
      // For now, we'll create a placeholder implementation
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('guest_rsvp_details')
        .select('*')
        .eq('event_id', eventId);

      if (rsvpError) throw rsvpError;

      // Aggregate the data
      const summary: EventAttendanceSummaryInput = {
        event_id: eventId,
        event_name: `Event ${eventId}`, // This should come from events table
        event_date: new Date().toISOString().split('T')[0],
        event_type: 'ceremony',
        total_invited: rsvpData.length,
        total_confirmed: rsvpData.filter(r => r.rsvp_status === 'accepted').length,
        total_declined: rsvpData.filter(r => r.rsvp_status === 'declined').length,
        total_pending: rsvpData.filter(r => r.rsvp_status === 'pending').length,
        total_tentative: rsvpData.filter(r => r.rsvp_status === 'tentative').length,
        plus_ones_invited: rsvpData.reduce((sum, r) => sum + (r.plus_one_count || 0), 0),
        plus_ones_confirmed: rsvpData
          .filter(r => r.rsvp_status === 'accepted')
          .reduce((sum, r) => sum + (r.plus_one_count || 0), 0),
        dietary_restrictions_count: rsvpData.filter(r => r.dietary_restrictions && r.dietary_restrictions.length > 0).length,
        accessibility_needs_count: rsvpData.filter(r => r.accessibility_needs).length,
        transportation_needed_count: rsvpData.filter(r => r.transportation_needed).length,
        accommodation_needed_count: rsvpData.filter(r => r.accommodation_needed).length
      };

      return await createAttendanceSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate attendance summary');
      return null;
    } finally {
      setLoading(false);
    }
  }, [createAttendanceSummary]);

  /**
   * Get comparison report for multiple events
   */
  const getComparisonReport = useCallback(async (eventIds: string[]) => {
    try {
      const { data, error: comparisonError } = await supabase
        .from('event_attendance_summary')
        .select('*')
        .in('event_id', eventIds);

      if (comparisonError) throw comparisonError;

      // Process comparison data
      const comparison = {
        events: data,
        totals: {
          total_invited: data.reduce((sum, event) => sum + event.total_invited, 0),
          total_confirmed: data.reduce((sum, event) => sum + event.total_confirmed, 0),
          total_declined: data.reduce((sum, event) => sum + event.total_declined, 0),
          average_attendance_rate: data.reduce((sum, event) => sum + (event.total_confirmed / event.total_invited), 0) / data.length
        },
        trends: {
          highest_attendance: data.reduce((max, event) => 
            (event.total_confirmed / event.total_invited) > (max.total_confirmed / max.total_invited) ? event : max
          ),
          lowest_attendance: data.reduce((min, event) => 
            (event.total_confirmed / event.total_invited) < (min.total_confirmed / min.total_invited) ? event : min
          )
        }
      };

      return comparison;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get comparison report');
      return null;
    }
  }, []);

  /**
   * Export summary data in different formats
   */
  const exportSummaryData = useCallback(async (eventId: string, format: 'csv' | 'json'): Promise<string | null> => {
    try {
      const { data, error: exportError } = await supabase
        .from('event_attendance_summary')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (exportError) throw exportError;

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else if (format === 'csv') {
        // Convert to CSV format
        const headers = Object.keys(data).join(',');
        const values = Object.values(data).map(v => 
          typeof v === 'object' ? JSON.stringify(v) : v
        ).join(',');
        return `${headers}\n${values}`;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export summary data');
      return null;
    }
  }, []);

  /**
   * Subscribe to real-time updates for attendance summaries
   */
  const subscribeToAttendanceSummary = useCallback((eventId: string) => {
    const subscription = supabase
      .channel(`event_attendance_summary_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_attendance_summary',
          filter: `event_id=eq.${eventId}`
        },
        (payload: RealtimePostgresChangesPayload<EventAttendanceSummary>) => {
          if (payload.eventType === 'INSERT') {
            setAttendanceSummaries(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAttendanceSummaries(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new : item)
            );
            if (currentSummary?.id === payload.new.id) {
              setCurrentSummary(payload.new);
            }
          } else if (payload.eventType === 'DELETE') {
            setAttendanceSummaries(prev => prev.filter(item => item.id !== payload.old.id));
            if (currentSummary?.id === payload.old.id) {
              setCurrentSummary(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentSummary]);

  /**
   * Refresh attendance summaries data
   */
  const refreshAttendanceSummaries = useCallback(async () => {
    await fetchAttendanceSummaries();
  }, [fetchAttendanceSummaries]);

  /**
   * Clear local cache
   */
  const clearCache = useCallback(() => {
    setAttendanceSummaries([]);
    setCurrentSummary(null);
    setError(null);
  }, []);

  return {
    attendanceSummaries,
    currentSummary,
    loading,
    error,
    fetchAttendanceSummaries,
    createAttendanceSummary,
    updateAttendanceSummary,
    deleteAttendanceSummary,
    generateSummaryForEvent,
    getComparisonReport,
    exportSummaryData,
    subscribeToAttendanceSummary,
    refreshAttendanceSummaries,
    clearCache
  };
};

export default useEventAttendanceSummary;