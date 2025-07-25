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
  // Auto-match guest during signup with enhanced multi-factor matching
  async matchGuestOnSignup(
    email: string,
    firstName: string,
    lastName: string,
    mobile?: string
  ): Promise<GuestMatchResult> {
    try {
      console.log(`Attempting to match guest: ${firstName} ${lastName}, email: ${email}, mobile: ${mobile}`);

      // Get all unmatched guests for comprehensive matching (including new individual fields)
      const { data: allGuests } = await supabase
        .from('guest_list')
        .select('id, name, first_name, last_name, email_address, mobile_number, rsvp_status, rsvp_responded_at, guest_count, relationship_to_couple')
        .is('matched_user_id', null);

      if (!allGuests || allGuests.length === 0) {
        console.log('No unmatched guests found');
        return { matched: false };
      }

      // 1. EXACT EMAIL MATCH (highest priority)
      if (email) {
        const emailMatch = allGuests.find(guest =>
          guest.email_address &&
          guest.email_address.toLowerCase().trim() === email.toLowerCase().trim()
        );

        if (emailMatch) {
          console.log('Found exact email match:', emailMatch.name);
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
      }

      // 2. MOBILE NUMBER MATCHING (flexible matching for different formats)
      if (mobile) {
        const cleanMobile = mobile.replace(/\D/g, '');
        const mobileMatch = allGuests.find(guest => {
          if (!guest.mobile_number) return false;

          // Handle multiple numbers in one field (e.g., "0421467462 and 0400497439")
          const guestMobiles = guest.mobile_number.split(/\s+and\s+|\s*,\s*|\s*;\s*/);

          return guestMobiles.some(guestMobile => {
            const cleanGuestMobile = guestMobile.replace(/\D/g, '');

            // Match last 8 digits (Australian mobile without country code)
            const userLast8 = cleanMobile.slice(-8);
            const guestLast8 = cleanGuestMobile.slice(-8);

            return userLast8 === guestLast8 && userLast8.length === 8;
          });
        });

        if (mobileMatch) {
          console.log('Found mobile match:', mobileMatch.name);
          return {
            matched: true,
            guestId: mobileMatch.id,
            guestName: mobileMatch.name,
            confidence: 'high',
            matchType: 'exact_phone',
            rsvpStatus: mobileMatch.rsvp_status,
            rsvpRespondedAt: mobileMatch.rsvp_responded_at
          };
        }
      }

      // 3. ENHANCED NAME MATCHING (handle individual names and couples)
      const fullName = `${firstName} ${lastName}`.toLowerCase().trim();
      const nameMatches = allGuests.map(guest => {
        let confidence = 0;

        // Try matching with individual first_name and last_name fields first
        if (guest.first_name && guest.last_name) {
          const guestFullName = `${guest.first_name} ${guest.last_name}`.toLowerCase().trim();
          if (guestFullName === fullName) {
            confidence = 1.0; // Perfect match
          } else if (guest.first_name.toLowerCase() === firstName.toLowerCase()) {
            confidence = 0.8; // First name match
          } else if (guest.last_name.toLowerCase() === lastName.toLowerCase()) {
            confidence = 0.6; // Last name match
          }
        }

        // Fallback to original name field matching
        if (confidence < 0.6 && guest.name) {
          const guestName = guest.name.toLowerCase().trim();
          confidence = Math.max(confidence, this.calculateAdvancedNameSimilarity(fullName, guestName, firstName, lastName));
        }

        return confidence > 0.6 ? { guest, confidence } : null;
      }).filter(Boolean).sort((a, b) => b!.confidence - a!.confidence);

      if (nameMatches.length > 0) {
        const bestMatch = nameMatches[0]!;
        console.log(`Found name match: ${bestMatch.guest.name} (confidence: ${bestMatch.confidence})`);

        return {
          matched: true,
          guestId: bestMatch.guest.id,
          guestName: bestMatch.guest.name,
          confidence: bestMatch.confidence > 0.8 ? 'high' : 'medium',
          matchType: 'fuzzy_name',
          rsvpStatus: bestMatch.guest.rsvp_status,
          rsvpRespondedAt: bestMatch.guest.rsvp_responded_at
        };
      }

      console.log('No matches found for guest');
      return { matched: false };
    } catch (error) {
      console.error('Error matching guest:', error);
      return { matched: false };
    }
  },

  // Link user to guest list entry
  async linkUserToGuest(userId: string, guestId: string): Promise<boolean> {
    try {
      console.log(`Linking user ${userId} to guest ${guestId}`);

      // Update guest_list with matched user
      const { error: guestError } = await supabase
        .from('guest_list')
        .update({
          matched_user_id: userId,
          rsvp_status: 'pending'
        })
        .eq('id', guestId);

      if (guestError) {
        console.error('Error updating guest_list:', guestError);
        throw guestError;
      }

      // Also update user profile with guest reference
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          guest_list_id: guestId,
          rsvp_completed: false
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't throw here, guest linking is more important
      }

      console.log(`Successfully linked user ${userId} to guest ${guestId}`);
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
  },

  // Enhanced name matching for couples and partial names
  calculateAdvancedNameSimilarity(userFullName: string, guestName: string, firstName: string, lastName: string): number {
    const userFirst = firstName.toLowerCase().trim();
    const userLast = lastName.toLowerCase().trim();
    const guestLower = guestName.toLowerCase().trim();

    // Direct full name match
    if (guestLower === userFullName) return 1.0;

    // Check if user's first name appears in guest name
    const firstNameMatch = guestLower.includes(userFirst);
    const lastNameMatch = guestLower.includes(userLast);

    // Handle couple entries like "Tim and Kirsten" or "John & Sarah Smith"
    const couplePatterns = [
      /(\w+)\s+and\s+(\w+)/i,
      /(\w+)\s*&\s*(\w+)/i,
      /(\w+)\s*,\s*(\w+)/i
    ];

    for (const pattern of couplePatterns) {
      const match = guestName.match(pattern);
      if (match) {
        const [, name1, name2] = match;
        if (name1.toLowerCase() === userFirst || name2.toLowerCase() === userFirst) {
          return 0.9; // High confidence for couple match
        }
      }
    }

    // Check for last name + first name combinations
    if (firstNameMatch && lastNameMatch) return 0.85;
    if (firstNameMatch) return 0.7;
    if (lastNameMatch) return 0.6;

    // Fuzzy matching for typos or variations
    const similarity = this.calculateNameSimilarity(userFullName, guestLower);
    return similarity;
  }
};