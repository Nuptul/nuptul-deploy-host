import { supabase } from '@/integrations/supabase/client';

export interface GuestMatchResult {
  matched: boolean;
  guestId?: string;
  guestName?: string;
  confidence?: 'high' | 'medium' | 'low';
  matchType?: 'exact_email' | 'exact_phone' | 'fuzzy_name' | 'manual';
  rsvpStatus?: string;
  rsvpRespondedAt?: string;
}

export const GuestMatcher = {
  // Auto-match guest during signup
  async matchGuestOnSignup(
    email: string, 
    firstName: string, 
    lastName: string, 
    mobile?: string
  ): Promise<GuestMatchResult> {
    try {
      // First try exact email match
      const { data: emailMatch } = await supabase
        .from('guest_list')
        .select('id, name, mobile_number, rsvp_status, rsvp_responded_at')
        .eq('email_address', email)
        .is('matched_user_id', null)
        .single();

      if (emailMatch) {
        return {
          matched: true,
          guestId: emailMatch.id,
          guestName: emailMatch.name,
          confidence: 'high',
          matchType: 'exact_email',
          rsvpStatus: emailMatch.rsvp_status,
          rsvpRespondedAt: emailMatch.rsvp_responded_at
        };
      }

      // Try mobile number match
      if (mobile) {
        const cleanMobile = mobile.replace(/\D/g, '');
        const { data: phoneMatches } = await supabase
          .from('guest_list')
          .select('id, name, mobile_number, rsvp_status, rsvp_responded_at')
          .is('matched_user_id', null);

        const phoneMatch = phoneMatches?.find(guest => {
          if (!guest.mobile_number) return false;
          const cleanGuestMobile = guest.mobile_number.replace(/\D/g, '');
          return cleanGuestMobile.includes(cleanMobile.slice(-8)) || 
                 cleanMobile.includes(cleanGuestMobile.slice(-8));
        });

        if (phoneMatch) {
          return {
            matched: true,
            guestId: phoneMatch.id,
            guestName: phoneMatch.name,
            confidence: 'high',
            matchType: 'exact_phone',
            rsvpStatus: phoneMatch.rsvp_status,
            rsvpRespondedAt: phoneMatch.rsvp_responded_at
          };
        }
      }

      // Try fuzzy name matching
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const { data: allGuests } = await supabase
        .from('guest_list')
        .select('id, name, mobile_number, rsvp_status, rsvp_responded_at')
        .is('matched_user_id', null);

      const nameMatch = allGuests?.find(guest => {
        if (!guest.name) return false;
        const guestName = guest.name.toLowerCase();
        
        // Check if names are similar (simple matching)
        const similarity = this.calculateNameSimilarity(fullName, guestName);
        return similarity > 0.8;
      });

      if (nameMatch) {
        return {
          matched: true,
          guestId: nameMatch.id,
          guestName: nameMatch.name,
          confidence: 'medium',
          matchType: 'fuzzy_name',
          rsvpStatus: nameMatch.rsvp_status,
          rsvpRespondedAt: nameMatch.rsvp_responded_at
        };
      }

      return { matched: false };
    } catch (error) {
      console.error('Error matching guest:', error);
      return { matched: false };
    }
  },

  // Link user to guest list entry
  async linkUserToGuest(userId: string, guestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('guest_list')
        .update({ 
          matched_user_id: userId,
          rsvp_status: 'pending'
        })
        .eq('id', guestId);

      if (error) throw error;

      // Also update user profile with guest reference
      await supabase
        .from('user_profiles')
        .upsert({ 
          id: userId, 
          guest_list_id: guestId,
          profile_completed: true
        });

      return true;
    } catch (error) {
      console.error('Error linking user to guest:', error);
      return false;
    }
  },

  // Get unmatched guests for admin
  async getUnmatchedGuests() {
    try {
      const { data, error } = await supabase
        .from('guest_list')
        .select('*')
        .is('matched_user_id', null)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unmatched guests:', error);
      return [];
    }
  },

  // Get unlinked users for admin
  async getUnlinkedUsers() {
    try {
      // Use profiles table to get users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      const authUsers = profilesData || [];
      
      // Get guest list to see which users are already linked
      const { data: guestData } = await supabase
        .from('guest_list')
        .select('matched_user_id')
        .not('matched_user_id', 'is', null);

      const linkedUserIds = new Set(guestData?.map(g => g.matched_user_id) || []);
      
      const unlinkedUsers = authUsers.filter(user => !linkedUserIds.has(user.id)).map(user => ({
        id: user.id,
        email: user.email || 'No email',
        display_name: user.user_metadata?.display_name || user.display_name,
        first_name: user.user_metadata?.first_name || user.first_name,
        last_name: user.user_metadata?.last_name || user.last_name,
        created_at: user.created_at
      }));

      return unlinkedUsers;
    } catch (error) {
      console.error('Error fetching unlinked users:', error);
      return [];
    }
  },

  // Manual admin linking
  async adminLinkUserToGuest(userId: string, guestId: string): Promise<boolean> {
    try {
      // Link the guest to user
      await this.linkUserToGuest(userId, guestId);
      
      // Log the manual linking
      await supabase
        .from('guest_link_history')
        .insert({
          guest_id: guestId,
          user_id: userId,
          link_type: 'manual_admin',
          created_by: userId // In real scenario, this would be admin user id
        });

      return true;
    } catch (error) {
      console.error('Error in admin linking:', error);
      return false;
    }
  },

  // Calculate name similarity (simple version)
  calculateNameSimilarity(name1: string, name2: string): number {
    const words1 = name1.split(' ').filter(w => w.length > 2);
    const words2 = name2.split(' ').filter(w => w.length > 2);
    
    let matches = 0;
    let total = Math.max(words1.length, words2.length);
    
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matches++;
          break;
        }
      }
    }
    
    return total > 0 ? matches / total : 0;
  }
};