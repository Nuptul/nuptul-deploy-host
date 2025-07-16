import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Admin Guest Stats Database Schema
 */
export interface AdminGuestStats {
  id: string;
  wedding_id: string;
  stats_date: string;
  total_guests: number;
  confirmed_guests: number;
  declined_guests: number;
  pending_guests: number;
  tentative_guests: number;
  plus_ones_total: number;
  plus_ones_confirmed: number;
  guest_categories: {
    family: number;
    friends: number;
    colleagues: number;
    plus_ones: number;
    other: number;
  };
  age_distribution: {
    under_18: number;
    age_18_30: number;
    age_31_50: number;
    age_51_65: number;
    over_65: number;
  };
  dietary_stats: {
    [dietary_restriction: string]: number;
  };
  accessibility_stats: {
    wheelchair_accessible: number;
    hearing_impaired: number;
    visual_impaired: number;
    other_needs: number;
  };
  communication_stats: {
    rsvp_via_web: number;
    rsvp_via_email: number;
    rsvp_via_phone: number;
    rsvp_via_mail: number;
  };
  geographic_stats: {
    local: number;
    out_of_state: number;
    international: number;
  };
  timeline_stats: {
    early_responders: number; // Responded within 1 week
    on_time_responders: number; // Responded within deadline
    late_responders: number; // Responded after deadline
    non_responders: number; // Haven't responded
  };
  engagement_metrics: {
    website_visits: number;
    registry_views: number;
    photo_uploads: number;
    message_interactions: number;
  };
  cost_projections: {
    estimated_catering_cost: number;
    estimated_venue_cost: number;
    estimated_total_cost: number;
    cost_per_guest: number;
  };
  trend_analysis: {
    rsvp_velocity: number; // RSVPs per day
    acceptance_rate: number; // Percentage accepting
    peak_response_day: string;
    projected_final_count: number;
  };
  generated_at: string;
  generated_by?: string;
  last_updated: string;
}

export interface AdminGuestStatsInput {
  wedding_id: string;
  stats_date: string;
  total_guests: number;
  confirmed_guests: number;
  declined_guests: number;
  pending_guests: number;
  tentative_guests: number;
  plus_ones_total: number;
  plus_ones_confirmed: number;
  guest_categories?: {
    family: number;
    friends: number;
    colleagues: number;
    plus_ones: number;
    other: number;
  };
  age_distribution?: {
    under_18: number;
    age_18_30: number;
    age_31_50: number;
    age_51_65: number;
    over_65: number;
  };
  dietary_stats?: {
    [dietary_restriction: string]: number;
  };
  accessibility_stats?: {
    wheelchair_accessible: number;
    hearing_impaired: number;
    visual_impaired: number;
    other_needs: number;
  };
  communication_stats?: {
    rsvp_via_web: number;
    rsvp_via_email: number;
    rsvp_via_phone: number;
    rsvp_via_mail: number;
  };
  geographic_stats?: {
    local: number;
    out_of_state: number;
    international: number;
  };
  timeline_stats?: {
    early_responders: number;
    on_time_responders: number;
    late_responders: number;
    non_responders: number;
  };
  engagement_metrics?: {
    website_visits: number;
    registry_views: number;
    photo_uploads: number;
    message_interactions: number;
  };
  cost_projections?: {
    estimated_catering_cost: number;
    estimated_venue_cost: number;
    estimated_total_cost: number;
    cost_per_guest: number;
  };
  trend_analysis?: {
    rsvp_velocity: number;
    acceptance_rate: number;
    peak_response_day: string;
    projected_final_count: number;
  };
}

interface UseAdminGuestStatsResult {
  guestStats: AdminGuestStats[];
  currentStats: AdminGuestStats | null;
  loading: boolean;
  error: string | null;
  // CRUD operations
  fetchGuestStats: (weddingId?: string, dateRange?: { start: string; end: string }) => Promise<void>;
  createGuestStats: (stats: AdminGuestStatsInput) => Promise<AdminGuestStats | null>;
  updateGuestStats: (id: string, stats: Partial<AdminGuestStatsInput>) => Promise<AdminGuestStats | null>;
  deleteGuestStats: (id: string) => Promise<boolean>;
  // Analytics operations
  generateLatestStats: (weddingId: string) => Promise<AdminGuestStats | null>;
  getTrendAnalysis: (weddingId: string, days: number) => Promise<any>;
  exportStatsReport: (weddingId: string, format: 'csv' | 'pdf' | 'json') => Promise<string | null>;
  getComparisonStats: (weddingIds: string[]) => Promise<any>;
  // Real-time subscription
  subscribeToGuestStats: (weddingId: string) => () => void;
  // Utilities
  refreshGuestStats: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for managing admin guest statistics with comprehensive analytics and reporting
 * 
 * @example
 * ```tsx
 * const { 
 *   guestStats, 
 *   loading, 
 *   generateLatestStats,
 *   getTrendAnalysis 
 * } = useAdminGuestStats();
 * 
 * // Generate latest stats for a wedding
 * const stats = await generateLatestStats('wedding-123');
 * 
 * // Get trend analysis for the past 30 days
 * const trends = await getTrendAnalysis('wedding-123', 30);
 * ```
 */
export const useAdminGuestStats = (): UseAdminGuestStatsResult => {
  const [guestStats, setGuestStats] = useState<AdminGuestStats[]>([]);
  const [currentStats, setCurrentStats] = useState<AdminGuestStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch guest stats with optional filtering
   */
  const fetchGuestStats = useCallback(async (weddingId?: string, dateRange?: { start: string; end: string }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('admin_guest_stats')
        .select('*')
        .order('generated_at', { ascending: false });

      if (weddingId) {
        query = query.eq('wedding_id', weddingId);
      }

      if (dateRange) {
        query = query
          .gte('stats_date', dateRange.start)
          .lte('stats_date', dateRange.end);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setGuestStats(data || []);
      
      if (weddingId && data && data.length > 0) {
        setCurrentStats(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch guest stats');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new guest stats
   */
  const createGuestStats = useCallback(async (stats: AdminGuestStatsInput): Promise<AdminGuestStats | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('admin_guest_stats')
        .insert([{
          ...stats,
          generated_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      setGuestStats(prev => [data, ...prev]);
      setCurrentStats(data);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guest stats');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing guest stats
   */
  const updateGuestStats = useCallback(async (
    id: string, 
    stats: Partial<AdminGuestStatsInput>
  ): Promise<AdminGuestStats | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('admin_guest_stats')
        .update({
          ...stats,
          last_updated: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setGuestStats(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      
      if (currentStats?.id === id) {
        setCurrentStats(data);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guest stats');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentStats]);

  /**
   * Delete guest stats
   */
  const deleteGuestStats = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('admin_guest_stats')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setGuestStats(prev => prev.filter(item => item.id !== id));
      
      if (currentStats?.id === id) {
        setCurrentStats(null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guest stats');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentStats]);

  /**
   * Generate latest statistics for a wedding by analyzing all guest data
   */
  const generateLatestStats = useCallback(async (weddingId: string): Promise<AdminGuestStats | null> => {
    try {
      setLoading(true);
      setError(null);

      // This would typically call multiple queries to aggregate guest data
      // For now, we'll create a comprehensive placeholder implementation
      
      // Fetch RSVP data
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('guest_rsvp_details')
        .select('*');

      if (rsvpError) throw rsvpError;

      // Aggregate the data into comprehensive stats
      const totalGuests = rsvpData.length;
      const confirmedGuests = rsvpData.filter(r => r.rsvp_status === 'accepted').length;
      const declinedGuests = rsvpData.filter(r => r.rsvp_status === 'declined').length;
      const pendingGuests = rsvpData.filter(r => r.rsvp_status === 'pending').length;
      const tentativeGuests = rsvpData.filter(r => r.rsvp_status === 'tentative').length;

      const stats: AdminGuestStatsInput = {
        wedding_id: weddingId,
        stats_date: new Date().toISOString().split('T')[0],
        total_guests: totalGuests,
        confirmed_guests: confirmedGuests,
        declined_guests: declinedGuests,
        pending_guests: pendingGuests,
        tentative_guests: tentativeGuests,
        plus_ones_total: rsvpData.reduce((sum, r) => sum + (r.plus_one_count || 0), 0),
        plus_ones_confirmed: rsvpData
          .filter(r => r.rsvp_status === 'accepted')
          .reduce((sum, r) => sum + (r.plus_one_count || 0), 0),
        guest_categories: {
          family: Math.floor(totalGuests * 0.4),
          friends: Math.floor(totalGuests * 0.4),
          colleagues: Math.floor(totalGuests * 0.1),
          plus_ones: rsvpData.reduce((sum, r) => sum + (r.plus_one_count || 0), 0),
          other: Math.floor(totalGuests * 0.1)
        },
        age_distribution: {
          under_18: Math.floor(totalGuests * 0.05),
          age_18_30: Math.floor(totalGuests * 0.3),
          age_31_50: Math.floor(totalGuests * 0.4),
          age_51_65: Math.floor(totalGuests * 0.2),
          over_65: Math.floor(totalGuests * 0.05)
        },
        dietary_stats: {
          vegetarian: rsvpData.filter(r => r.dietary_restrictions?.includes('vegetarian')).length,
          vegan: rsvpData.filter(r => r.dietary_restrictions?.includes('vegan')).length,
          gluten_free: rsvpData.filter(r => r.dietary_restrictions?.includes('gluten-free')).length,
          allergies: rsvpData.filter(r => r.dietary_restrictions?.some(d => d.includes('allergy'))).length
        },
        accessibility_stats: {
          wheelchair_accessible: rsvpData.filter(r => r.accessibility_needs?.includes('wheelchair')).length,
          hearing_impaired: rsvpData.filter(r => r.accessibility_needs?.includes('hearing')).length,
          visual_impaired: rsvpData.filter(r => r.accessibility_needs?.includes('visual')).length,
          other_needs: rsvpData.filter(r => r.accessibility_needs && !r.accessibility_needs.includes('wheelchair') && !r.accessibility_needs.includes('hearing') && !r.accessibility_needs.includes('visual')).length
        },
        timeline_stats: {
          early_responders: rsvpData.filter(r => r.response_date && new Date(r.response_date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
          on_time_responders: rsvpData.filter(r => r.response_date).length,
          late_responders: 0, // Would need RSVP deadline comparison
          non_responders: rsvpData.filter(r => !r.response_date).length
        },
        cost_projections: {
          estimated_catering_cost: confirmedGuests * 75, // $75 per person estimate
          estimated_venue_cost: 5000, // Fixed venue cost
          estimated_total_cost: (confirmedGuests * 75) + 5000,
          cost_per_guest: confirmedGuests > 0 ? ((confirmedGuests * 75) + 5000) / confirmedGuests : 0
        },
        trend_analysis: {
          rsvp_velocity: rsvpData.filter(r => r.response_date).length / 30, // Responses per day over 30 days
          acceptance_rate: totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0,
          peak_response_day: new Date().toISOString().split('T')[0],
          projected_final_count: Math.round(totalGuests * 0.85) // 85% acceptance rate projection
        }
      };

      return await createGuestStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate latest stats');
      return null;
    } finally {
      setLoading(false);
    }
  }, [createGuestStats]);

  /**
   * Get trend analysis for a specific number of days
   */
  const getTrendAnalysis = useCallback(async (weddingId: string, days: number) => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const { data, error: trendError } = await supabase
        .from('admin_guest_stats')
        .select('*')
        .eq('wedding_id', weddingId)
        .gte('stats_date', startDate.toISOString().split('T')[0])
        .lte('stats_date', endDate.toISOString().split('T')[0])
        .order('stats_date', { ascending: true });

      if (trendError) throw trendError;

      // Process trend data
      const trends = {
        daily_stats: data,
        growth_trends: {
          confirmed_guests_growth: data.length > 1 ? data[data.length - 1].confirmed_guests - data[0].confirmed_guests : 0,
          rsvp_velocity_trend: data.map(d => d.trend_analysis?.rsvp_velocity || 0),
          acceptance_rate_trend: data.map(d => d.trend_analysis?.acceptance_rate || 0)
        },
        projections: {
          estimated_final_count: data.length > 0 ? data[data.length - 1].trend_analysis?.projected_final_count : 0,
          days_to_deadline: 30, // This would come from wedding details
          current_velocity: data.length > 0 ? data[data.length - 1].trend_analysis?.rsvp_velocity : 0
        }
      };

      return trends;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get trend analysis');
      return null;
    }
  }, []);

  /**
   * Export stats report in different formats
   */
  const exportStatsReport = useCallback(async (weddingId: string, format: 'csv' | 'pdf' | 'json'): Promise<string | null> => {
    try {
      const { data, error: exportError } = await supabase
        .from('admin_guest_stats')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      if (exportError) throw exportError;

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else if (format === 'csv') {
        // Flatten nested objects for CSV
        const flattened = {
          ...data,
          ...data.guest_categories,
          ...data.age_distribution,
          ...data.accessibility_stats,
          ...data.cost_projections
        };
        delete flattened.guest_categories;
        delete flattened.age_distribution;
        delete flattened.accessibility_stats;
        delete flattened.cost_projections;

        const headers = Object.keys(flattened).join(',');
        const values = Object.values(flattened).map(v => 
          typeof v === 'object' ? JSON.stringify(v) : v
        ).join(',');
        return `${headers}\n${values}`;
      } else if (format === 'pdf') {
        // For PDF, return a formatted text that could be converted to PDF
        return `Wedding Guest Statistics Report\n\nTotal Guests: ${data.total_guests}\nConfirmed: ${data.confirmed_guests}\nDeclined: ${data.declined_guests}\nPending: ${data.pending_guests}\n\nGenerated: ${data.generated_at}`;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export stats report');
      return null;
    }
  }, []);

  /**
   * Get comparison stats for multiple weddings
   */
  const getComparisonStats = useCallback(async (weddingIds: string[]) => {
    try {
      const { data, error: comparisonError } = await supabase
        .from('admin_guest_stats')
        .select('*')
        .in('wedding_id', weddingIds)
        .order('generated_at', { ascending: false });

      if (comparisonError) throw comparisonError;

      // Group by wedding_id and get latest stats for each
      const latestStatsPerWedding = weddingIds.map(weddingId => {
        const weddingStats = data.filter(stat => stat.wedding_id === weddingId);
        return weddingStats.length > 0 ? weddingStats[0] : null;
      }).filter(Boolean) as AdminGuestStats[];

      const comparison = {
        weddings: latestStatsPerWedding,
        averages: {
          avg_total_guests: latestStatsPerWedding.reduce((sum, w) => sum + w.total_guests, 0) / latestStatsPerWedding.length,
          avg_acceptance_rate: latestStatsPerWedding.reduce((sum, w) => sum + (w.confirmed_guests / w.total_guests), 0) / latestStatsPerWedding.length,
          avg_cost_per_guest: latestStatsPerWedding.reduce((sum, w) => sum + (w.cost_projections?.cost_per_guest || 0), 0) / latestStatsPerWedding.length
        },
        benchmarks: {
          highest_attendance: latestStatsPerWedding.reduce((max, w) => 
            (w.confirmed_guests / w.total_guests) > (max.confirmed_guests / max.total_guests) ? w : max
          ),
          largest_wedding: latestStatsPerWedding.reduce((max, w) => w.total_guests > max.total_guests ? w : max),
          most_cost_effective: latestStatsPerWedding.reduce((min, w) => 
            (w.cost_projections?.cost_per_guest || Infinity) < (min.cost_projections?.cost_per_guest || Infinity) ? w : min
          )
        }
      };

      return comparison;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get comparison stats');
      return null;
    }
  }, []);

  /**
   * Subscribe to real-time updates for guest stats
   */
  const subscribeToGuestStats = useCallback((weddingId: string) => {
    const subscription = supabase
      .channel(`admin_guest_stats_${weddingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_guest_stats',
          filter: `wedding_id=eq.${weddingId}`
        },
        (payload: RealtimePostgresChangesPayload<AdminGuestStats>) => {
          if (payload.eventType === 'INSERT') {
            setGuestStats(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setGuestStats(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new : item)
            );
            if (currentStats?.id === payload.new.id) {
              setCurrentStats(payload.new);
            }
          } else if (payload.eventType === 'DELETE') {
            setGuestStats(prev => prev.filter(item => item.id !== payload.old.id));
            if (currentStats?.id === payload.old.id) {
              setCurrentStats(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentStats]);

  /**
   * Refresh guest stats data
   */
  const refreshGuestStats = useCallback(async () => {
    await fetchGuestStats();
  }, [fetchGuestStats]);

  /**
   * Clear local cache
   */
  const clearCache = useCallback(() => {
    setGuestStats([]);
    setCurrentStats(null);
    setError(null);
  }, []);

  return {
    guestStats,
    currentStats,
    loading,
    error,
    fetchGuestStats,
    createGuestStats,
    updateGuestStats,
    deleteGuestStats,
    generateLatestStats,
    getTrendAnalysis,
    exportStatsReport,
    getComparisonStats,
    subscribeToGuestStats,
    refreshGuestStats,
    clearCache
  };
};

export default useAdminGuestStats;