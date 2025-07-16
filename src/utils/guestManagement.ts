import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Guest {
  id: string;
  user_id?: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string;
  phone: string | null;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  rsvp_responded_at: string | null;
  plus_one_name: string | null;
  plus_one_email: string | null;
  dietary_needs: string[] | null;
  allergies: string[] | null;
  contact_details: any | null;
  table_assignment: string | null;
  invitation_sent_at: string | null;
  rsvp_deadline: string | null;
  special_requests: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface RSVPData {
  guest_id: string;
  rsvp_status: 'confirmed' | 'declined';
  plus_one_name?: string;
  plus_one_email?: string;
  dietary_needs?: string[];
  allergies?: string[];
  special_requests?: string;
  contact_updates?: {
    phone?: string;
    address?: string;
    emergency_contact?: string;
  };
  new_guests?: {
    first_name: string;
    last_name: string;
    email: string;
    relationship: string;
  }[];
}

/**
 * Central guest management utility class
 * This serves as the backbone for all guest-related operations in the app
 */
export class GuestManager {
  /**
   * Fetch all guests with optional filters
   */
  static async getAllGuests(options: {
    includeArchived?: boolean;
    linkedOnly?: boolean;
    status?: 'pending' | 'confirmed' | 'declined' | 'all';
  } = {}): Promise<Guest[]> {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          display_name,
          email,
          phone,
          rsvp_status,
          rsvp_responded_at,
          plus_one_name,
          plus_one_email,
          dietary_needs,
          allergies,
          contact_details,
          table_assignment,
          invitation_sent_at,
          rsvp_deadline,
          special_requests,
          is_archived,
          created_at,
          updated_at,
          user_roles (role)
        `);

      // Apply filters
      if (!options.includeArchived) {
        query = query.or('is_archived.is.null,is_archived.eq.false');
      }

      if (options.linkedOnly) {
        query = query.not('user_id', 'is', null);
      }

      if (options.status && options.status !== 'all') {
        query = query.eq('rsvp_status', options.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(guest => ({
        ...guest,
        is_archived: guest.is_archived || false,
        rsvp_status: guest.rsvp_status || 'pending'
      })) || [];
    } catch (error) {
      console.error('Error fetching guests:', error);
      throw error;
    }
  }

  /**
   * Get guest by user ID (for current user's guest record)
   */
  static async getGuestByUserId(userId: string): Promise<Guest | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data || null;
    } catch (error) {
      console.error('Error fetching guest by user ID:', error);
      return null;
    }
  }

  /**
   * Process RSVP response - the central function for handling all RSVP logic
   */
  static async processRSVP(rsvpData: RSVPData): Promise<{ success: boolean; addedGuests?: number }> {
    try {
      // Update main guest record
      const updateData = {
        rsvp_status: rsvpData.rsvp_status,
        rsvp_responded_at: new Date().toISOString(),
        plus_one_name: rsvpData.plus_one_name || null,
        plus_one_email: rsvpData.plus_one_email || null,
        dietary_needs: rsvpData.dietary_needs || [],
        allergies: rsvpData.allergies || [],
        special_requests: rsvpData.special_requests || null
      };

      // Add contact updates if provided
      if (rsvpData.contact_updates) {
        updateData['phone'] = rsvpData.contact_updates.phone;
        
        // Get current contact details and merge
        const { data: currentGuest } = await supabase
          .from('profiles')
          .select('contact_details')
          .eq('id', rsvpData.guest_id)
          .single();

        updateData['contact_details'] = {
          ...currentGuest?.contact_details,
          address: rsvpData.contact_updates.address,
          emergency_contact: rsvpData.contact_updates.emergency_contact
        };
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', rsvpData.guest_id);

      if (updateError) throw updateError;

      let addedGuestsCount = 0;

      // Add new guests if provided
      if (rsvpData.new_guests && rsvpData.new_guests.length > 0) {
        const newGuestInserts = rsvpData.new_guests
          .filter(guest => guest.first_name && guest.last_name && guest.email)
          .map(guest => ({
            first_name: guest.first_name,
            last_name: guest.last_name,
            email: guest.email,
            rsvp_status: 'confirmed',
            rsvp_responded_at: new Date().toISOString(),
            contact_details: { 
              relationship: guest.relationship,
              added_by_guest: rsvpData.guest_id
            }
          }));

        if (newGuestInserts.length > 0) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newGuestInserts);

          if (insertError) throw insertError;
          addedGuestsCount = newGuestInserts.length;
        }
      }

      // Archive guest if declined (cleanup)
      if (rsvpData.rsvp_status === 'declined') {
        await this.archiveGuest(rsvpData.guest_id, 'Declined RSVP');
      }

      // Log RSVP change in history
      await supabase
        .from('rsvp_history')
        .insert([{
          guest_id: rsvpData.guest_id,
          new_status: rsvpData.rsvp_status,
          change_method: 'online_form',
          change_reason: 'RSVP submission'
        }]);

      // Log communication
      await supabase
        .from('guest_communications')
        .insert([{
          guest_id: rsvpData.guest_id,
          communication_type: 'email',
          subject: `RSVP ${rsvpData.rsvp_status === 'confirmed' ? 'Confirmation' : 'Decline'} Received`,
          content: JSON.stringify({
            status: rsvpData.rsvp_status,
            plus_one: rsvpData.plus_one_name,
            dietary_needs: rsvpData.dietary_needs,
            allergies: rsvpData.allergies,
            added_guests: addedGuestsCount
          }),
          direction: 'inbound',
          status: 'received'
        }]);

      return { success: true, addedGuests: addedGuestsCount };
    } catch (error) {
      console.error('Error processing RSVP:', error);
      throw error;
    }
  }

  /**
   * Link guest record to user account
   */
  static async linkGuestToUser(guestId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_id: userId })
        .eq('id', guestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error linking guest to user:', error);
      throw error;
    }
  }

  /**
   * Unlink guest from user account
   */
  static async unlinkGuestFromUser(guestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_id: null })
        .eq('id', guestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unlinking guest from user:', error);
      throw error;
    }
  }

  /**
   * Archive guest (remove from active list)
   */
  static async archiveGuest(guestId: string, reason?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_archived: true,
          archived_at: new Date().toISOString(),
          archive_reason: reason
        })
        .eq('id', guestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error archiving guest:', error);
      throw error;
    }
  }

  /**
   * Restore guest from archive
   */
  static async restoreGuest(guestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_archived: false,
          archived_at: null,
          archive_reason: null
        })
        .eq('id', guestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error restoring guest:', error);
      throw error;
    }
  }

  /**
   * Bulk archive multiple guests
   */
  static async bulkArchiveGuests(guestIds: string[], reason?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_archived: true,
          archived_at: new Date().toISOString(),
          archive_reason: reason || 'Bulk archive operation'
        })
        .in('id', guestIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk archiving guests:', error);
      throw error;
    }
  }

  /**
   * Sync user accounts with guest records
   * Creates guest profiles for users who don't have them
   */
  static async syncUserAccountsToGuests(): Promise<{ synced: number; errors: number }> {
    try {
      // Get all existing user profiles
      const { data: existingProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id')
        .not('user_id', 'is', null);

      if (profilesError) throw profilesError;

      const existingUserIds = new Set(existingProfiles?.map(p => p.user_id) || []);

      // Get all auth users (admin only operation)
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) throw usersError;

      // Find users without guest profiles
      const usersWithoutProfiles = users.filter(user => !existingUserIds.has(user.id));

      if (usersWithoutProfiles.length === 0) {
        return { synced: 0, errors: 0 };
      }

      // Create guest profiles for users
      const newProfiles = usersWithoutProfiles.map(user => ({
        user_id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || null,
        last_name: user.user_metadata?.last_name || null,
        display_name: user.user_metadata?.display_name || null,
        phone: user.user_metadata?.phone || null,
        rsvp_status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from('profiles')
        .insert(newProfiles);

      if (insertError) throw insertError;

      return { synced: newProfiles.length, errors: 0 };
    } catch (error) {
      console.error('Error syncing user accounts to guests:', error);
      return { synced: 0, errors: 1 };
    }
  }

  /**
   * Get guest statistics
   */
  static async getGuestStats(): Promise<{
    total: number;
    linked: number;
    confirmed: number;
    pending: number;
    declined: number;
    archived: number;
    withDietaryNeeds: number;
    withPlusOnes: number;
  }> {
    try {
      const guests = await this.getAllGuests({ includeArchived: true });
      
      return {
        total: guests.filter(g => !g.is_archived).length,
        linked: guests.filter(g => g.user_id && !g.is_archived).length,
        confirmed: guests.filter(g => g.rsvp_status === 'confirmed' && !g.is_archived).length,
        pending: guests.filter(g => g.rsvp_status === 'pending' && !g.is_archived).length,
        declined: guests.filter(g => g.rsvp_status === 'declined' && !g.is_archived).length,
        archived: guests.filter(g => g.is_archived).length,
        withDietaryNeeds: guests.filter(g => 
          !g.is_archived && (g.dietary_needs?.length || g.allergies?.length)
        ).length,
        withPlusOnes: guests.filter(g => !g.is_archived && g.plus_one_name).length
      };
    } catch (error) {
      console.error('Error getting guest stats:', error);
      throw error;
    }
  }

  /**
   * Search guests by multiple criteria
   */
  static searchGuests(guests: Guest[], searchTerm: string): Guest[] {
    if (!searchTerm.trim()) return guests;
    
    const term = searchTerm.toLowerCase();
    
    return guests.filter(guest => 
      guest.email.toLowerCase().includes(term) ||
      guest.display_name?.toLowerCase().includes(term) ||
      `${guest.first_name || ''} ${guest.last_name || ''}`.toLowerCase().includes(term) ||
      guest.plus_one_name?.toLowerCase().includes(term) ||
      guest.contact_details?.relationship?.toLowerCase().includes(term) ||
      guest.phone?.includes(term)
    );
  }

  /**
   * Export guest list to CSV format
   */
  static exportToCSV(guests: Guest[]): string {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'RSVP Status',
      'Plus One',
      'Dietary Needs',
      'Allergies',
      'Table Assignment',
      'Relationship',
      'Responded At',
      'Is Linked',
      'Is Archived'
    ];

    const rows = guests.map(guest => [
      guest.display_name || `${guest.first_name || ''} ${guest.last_name || ''}`.trim(),
      guest.email,
      guest.phone || '',
      guest.rsvp_status,
      guest.plus_one_name || '',
      guest.dietary_needs?.join('; ') || '',
      guest.allergies?.join('; ') || '',
      guest.table_assignment || '',
      guest.contact_details?.relationship || '',
      guest.rsvp_responded_at ? new Date(guest.rsvp_responded_at).toLocaleDateString() : '',
      guest.user_id ? 'Yes' : 'No',
      guest.is_archived ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

/**
 * Hook for using guest management functionality in React components
 */
export const useGuestManager = () => {
  return {
    getAllGuests: GuestManager.getAllGuests,
    getGuestByUserId: GuestManager.getGuestByUserId,
    processRSVP: GuestManager.processRSVP,
    linkGuestToUser: GuestManager.linkGuestToUser,
    unlinkGuestFromUser: GuestManager.unlinkGuestFromUser,
    archiveGuest: GuestManager.archiveGuest,
    restoreGuest: GuestManager.restoreGuest,
    bulkArchiveGuests: GuestManager.bulkArchiveGuests,
    syncUserAccountsToGuests: GuestManager.syncUserAccountsToGuests,
    getGuestStats: GuestManager.getGuestStats,
    searchGuests: GuestManager.searchGuests,
    exportToCSV: GuestManager.exportToCSV
  };
};

// Global event emitter for guest list updates
export const guestListEvents = {
  emit: (event: string, data?: any) => {
    window.dispatchEvent(new CustomEvent(`guestList:${event}`, { detail: data }));
  },
  
  on: (event: string, callback: (data?: any) => void) => {
    const handler = (e: CustomEvent) => callback(e.detail);
    window.addEventListener(`guestList:${event}`, handler as EventListener);
    return () => window.removeEventListener(`guestList:${event}`, handler as EventListener);
  }
};

// Emit events for guest list updates to keep the app in sync
export const emitGuestListUpdate = (type: 'rsvp' | 'archive' | 'link' | 'sync', data?: any) => {
  guestListEvents.emit('update', { type, data, timestamp: new Date().toISOString() });
};