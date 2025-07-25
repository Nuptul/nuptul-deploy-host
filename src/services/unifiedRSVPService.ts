/**
 * Unified RSVP Service
 * Single source of truth for all RSVP operations
 * Replaces the previous triple redundancy system
 */

import { supabase } from '@/integrations/supabase/client';

export interface RSVPData {
  user_id: string;
  event_id: string;
  status: 'attending' | 'not_attending' | 'maybe' | 'pending';
  guest_count?: number;
  dietary_restrictions?: string;
  plus_one_name?: string;
  message?: string;
  meal_preference?: string;
  song_request?: string;
  accommodation_needed?: boolean;
  transportation_needed?: boolean;
}

export interface RSVPWithDetails extends RSVPData {
  id: string;
  created_at: string;
  updated_at: string;
  wedding_events?: {
    id: string;
    title: string;
    event_date: string;
    location: string;
    requires_rsvp: boolean;
    is_main_event: boolean;
  };
  profiles?: {
    email: string;
    first_name: string;
    last_name: string;
    display_name: string;
  };
}

export interface RSVPStats {
  total_responses: number;
  attending: number;
  not_attending: number;
  maybe: number;
  pending: number;
  total_guests: number;
  response_rate: number;
}

export class UnifiedRSVPService {
  /**
   * Get all RSVPs for a specific user
   */
  static async getUserRSVPs(userId: string): Promise<RSVPWithDetails[]> {
    const { data, error } = await supabase
      .from('rsvps')
      .select(`
        *,
        wedding_events (
          id,
          title,
          event_date,
          location,
          requires_rsvp,
          is_main_event
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user RSVPs:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Get RSVP for a specific user and event
   */
  static async getUserEventRSVP(userId: string, eventId: string): Promise<RSVPWithDetails | null> {
    const { data, error } = await supabase
      .from('rsvps')
      .select(`
        *,
        wedding_events (
          id,
          title,
          event_date,
          location,
          requires_rsvp,
          is_main_event
        )
      `)
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No RSVP found - this is normal
        return null;
      }
      console.error('Error fetching user event RSVP:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * Create or update an RSVP
   */
  static async createOrUpdateRSVP(rsvpData: RSVPData): Promise<RSVPWithDetails> {
    const { data, error } = await supabase
      .from('rsvps')
      .upsert({
        ...rsvpData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,event_id'
      })
      .select(`
        *,
        wedding_events (
          id,
          title,
          event_date,
          location,
          requires_rsvp,
          is_main_event
        )
      `)
      .single();
    
    if (error) {
      console.error('Error creating/updating RSVP:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * Delete an RSVP
   */
  static async deleteRSVP(userId: string, eventId: string): Promise<void> {
    const { error } = await supabase
      .from('rsvps')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId);
    
    if (error) {
      console.error('Error deleting RSVP:', error);
      throw error;
    }
  }

  /**
   * Get all RSVPs for admin dashboard
   */
  static async getAllRSVPs(): Promise<RSVPWithDetails[]> {
    const { data, error } = await supabase
      .from('rsvps')
      .select(`
        *,
        profiles (
          email,
          first_name,
          last_name,
          display_name
        ),
        wedding_events (
          id,
          title,
          event_date,
          location,
          is_main_event
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all RSVPs:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Get RSVPs for a specific event
   */
  static async getEventRSVPs(eventId: string): Promise<RSVPWithDetails[]> {
    const { data, error } = await supabase
      .from('rsvps')
      .select(`
        *,
        profiles (
          email,
          first_name,
          last_name,
          display_name
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching event RSVPs:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Get RSVP statistics
   */
  static async getRSVPStats(): Promise<RSVPStats> {
    const { data, error } = await supabase
      .from('rsvps')
      .select('status, guest_count');
    
    if (error) {
      console.error('Error fetching RSVP stats:', error);
      throw error;
    }

    // Get total registered users for response rate calculation
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const stats = {
      total_responses: data.length,
      attending: data.filter(r => r.status === 'attending').length,
      not_attending: data.filter(r => r.status === 'not_attending').length,
      maybe: data.filter(r => r.status === 'maybe').length,
      pending: data.filter(r => r.status === 'pending').length,
      total_guests: data
        .filter(r => r.status === 'attending')
        .reduce((sum, r) => sum + (r.guest_count || 1), 0),
      response_rate: totalUsers ? Math.round((data.length / totalUsers) * 100) : 0
    };
    
    return stats;
  }

  /**
   * Get RSVP statistics for a specific event
   */
  static async getEventRSVPStats(eventId: string): Promise<RSVPStats> {
    const { data, error } = await supabase
      .from('rsvps')
      .select('status, guest_count')
      .eq('event_id', eventId);
    
    if (error) {
      console.error('Error fetching event RSVP stats:', error);
      throw error;
    }

    // For event-specific stats, we calculate response rate based on total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const stats = {
      total_responses: data.length,
      attending: data.filter(r => r.status === 'attending').length,
      not_attending: data.filter(r => r.status === 'not_attending').length,
      maybe: data.filter(r => r.status === 'maybe').length,
      pending: data.filter(r => r.status === 'pending').length,
      total_guests: data
        .filter(r => r.status === 'attending')
        .reduce((sum, r) => sum + (r.guest_count || 1), 0),
      response_rate: totalUsers ? Math.round((data.length / totalUsers) * 100) : 0
    };
    
    return stats;
  }

  /**
   * Subscribe to RSVP changes for real-time updates
   */
  static subscribeToRSVPChanges(callback: (payload: any) => void) {
    return supabase
      .channel('rsvp-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rsvps'
      }, callback)
      .subscribe();
  }

  /**
   * Export RSVPs to CSV format
   */
  static async exportRSVPsToCSV(): Promise<string> {
    const rsvps = await this.getAllRSVPs();
    
    const headers = [
      'Name',
      'Email', 
      'Event',
      'Status',
      'Guest Count',
      'Plus One',
      'Dietary Restrictions',
      'Meal Preference',
      'Message',
      'RSVP Date'
    ];
    
    const rows = rsvps.map(rsvp => [
      rsvp.profiles?.display_name || `${rsvp.profiles?.first_name} ${rsvp.profiles?.last_name}`,
      rsvp.profiles?.email || '',
      rsvp.wedding_events?.title || '',
      rsvp.status,
      rsvp.guest_count || 1,
      rsvp.plus_one_name || '',
      rsvp.dietary_restrictions || '',
      rsvp.meal_preference || '',
      rsvp.message || '',
      new Date(rsvp.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  }
}

// Export default for easier imports
export default UnifiedRSVPService;
