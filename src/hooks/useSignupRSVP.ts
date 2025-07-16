import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GuestMatcher } from '@/utils/guestMatching';

interface SignupRSVPData {
  // User data
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  
  // Address data
  addressNumber?: string;
  addressStreet?: string;
  addressType?: string;
  addressSuburb?: string;
  state?: string;
  postcode?: string;
  country?: string;
  
  // RSVP data
  attending: boolean;
  guestCount: number;
  dietaryRequirements?: string[];
  allergies?: string[];
  specialAccommodations?: string;
  
  // Plus one data
  hasPlusOne?: boolean;
  plusOneName?: string;
  plusOneEmail?: string;
  
  // Additional data
  emergencyContact?: string;
  relationshipToCouple?: string;
  transportNeeded?: boolean;
  accommodationNeeded?: boolean;
}

export const useSignupRSVP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const signupWithRSVP = async (data: SignupRSVPData) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Check for guest match
      const guestMatch = await GuestMatcher.matchGuestOnSignup(
        data.email,
        data.firstName,
        data.lastName,
        data.mobile
      );

      // Step 2: Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: `${data.firstName} ${data.lastName}`,
            phone: data.mobile,
            role: 'guest'
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user data returned');

      // Step 3: Call the signup_rsvp stored procedure
      const { data: rsvpResult, error: rsvpError } = await supabase.rpc('signup_rsvp', {
        p_user_id: authData.user.id,
        p_first_name: data.firstName,
        p_last_name: data.lastName,
        p_email: data.email,
        p_phone: data.mobile || '',
        p_attending: data.attending,
        p_guest_count: data.guestCount,
        p_dietary: data.dietaryRequirements?.join(', ') || null
      });

      if (rsvpError) throw rsvpError;

      // Step 4: Create profile with full data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: authData.user.id,
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          phone: data.mobile,
          address_number: data.addressNumber,
          address_street: data.addressStreet,
          address_type: data.addressType,
          address_suburb: data.addressSuburb,
          state: data.state,
          postcode: data.postcode,
          country: data.country,
          emergency_contact: data.emergencyContact,
          relationship_to_couple: data.relationshipToCouple,
          dietary_requirements: data.dietaryRequirements,
          allergies: data.allergies,
          special_accommodations: data.specialAccommodations,
          has_plus_one: data.hasPlusOne,
          plus_one_name: data.plusOneName,
          plus_one_email: data.plusOneEmail,
          rsvp_completed: true,
          profile_completed: true
        });

      if (profileError) throw profileError;

      // Step 5: Link to guest list if match found
      if (guestMatch.matched && guestMatch.guestId) {
        await GuestMatcher.linkUserToGuest(authData.user.id, guestMatch.guestId);
      }

      // Step 6: Create transport/accommodation requests if needed
      if (data.transportNeeded) {
        await supabase.from('transport_requests').insert({
          user_id: authData.user.id,
          guest_id: rsvpResult?.guest_id,
          seats_requested: data.guestCount,
          pickup_location: data.addressSuburb,
          status: 'pending'
        });
      }

      if (data.accommodationNeeded) {
        await supabase.from('accommodation_requests').insert({
          user_id: authData.user.id,
          guest_id: rsvpResult?.guest_id,
          rooms_needed: Math.ceil(data.guestCount / 2),
          occupants: data.guestCount,
          status: 'pending'
        });
      }

      toast({
        title: "Success!",
        description: "Your account has been created and RSVP submitted. Please check your email to confirm.",
      });

      return { success: true, userId: authData.user.id };
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    signupWithRSVP,
    loading,
    error
  };
};