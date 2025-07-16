import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface RSVPStatus {
  hasRSVPd: boolean;
  rsvpData: any;
  loading: boolean;
  needsRSVP: boolean;
}

export const useRSVPStatus = () => {
  const { user, profile } = useAuth();
  const [rsvpStatus, setRSVPStatus] = useState<RSVPStatus>({
    hasRSVPd: false,
    rsvpData: null,
    loading: true,
    needsRSVP: false
  });

  useEffect(() => {
    if (user && profile) {
      checkRSVPStatus();
    } else {
      setRSVPStatus(prev => ({ ...prev, loading: false, needsRSVP: false }));
    }
  }, [user, profile]);

  const checkRSVPStatus = async () => {
    try {
      setRSVPStatus(prev => ({ ...prev, loading: true }));

      // Check if user has completed RSVP
      const { data: rsvpData, error } = await supabase
        .from('rsvps')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        // Check if it's an RLS/permission error
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          console.warn('RSVP check blocked by RLS policy. User may need to complete RSVP manually.');
          // Assume they need to RSVP if we can't check
          setRSVPStatus({
            hasRSVPd: false,
            rsvpData: null,
            loading: false,
            needsRSVP: true
          });
          return;
        }
        throw error;
      }

      const hasRSVPd = !!rsvpData || profile?.rsvp_completed;
      const needsRSVP = !hasRSVPd && !!user; // Only authenticated users need to RSVP

      setRSVPStatus({
        hasRSVPd,
        rsvpData,
        loading: false,
        needsRSVP
      });
    } catch (error) {
      console.error('Error checking RSVP status:', error);
      setRSVPStatus(prev => ({ 
        ...prev, 
        loading: false, 
        needsRSVP: false 
      }));
    }
  };

  const markRSVPComplete = () => {
    setRSVPStatus(prev => ({
      ...prev,
      hasRSVPd: true,
      needsRSVP: false
    }));
  };

  return {
    ...rsvpStatus,
    refreshRSVPStatus: checkRSVPStatus,
    markRSVPComplete
  };
};

export default useRSVPStatus;