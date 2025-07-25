import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, X } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { RSVPButtons } from '@/components/ui/RSVPButtons';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface RSVPAutoPromptProps {
  onClose?: () => void;
  onRSVPComplete?: () => void;
}

export const RSVPAutoPrompt: React.FC<RSVPAutoPromptProps> = ({ 
  onClose, 
  onRSVPComplete 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guestProfile, setGuestProfile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    checkRSVPStatus();
  }, [user]);

  const checkRSVPStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check if user has already seen the prompt today
      const lastPromptKey = `rsvp_prompt_${user.id}`;
      const lastPromptDate = localStorage.getItem(lastPromptKey);
      const today = new Date().toDateString();
      
      if (lastPromptDate === today) {
        setLoading(false);
        return;
      }

      // Check user's RSVP status
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (profile) {
        setGuestProfile(profile);

        // Enhanced RSVP status checking logic
        const hasResponded = profile.rsvp_responded_at ||
                           (profile.rsvp_status && profile.rsvp_status !== 'pending');

        const needsRSVP = !hasResponded &&
                         (!profile.rsvp_status || profile.rsvp_status === 'pending');

        // Additional check: Don't show to admin users who have already confirmed attendance
        const isAdminWithConfirmedStatus = profile.rsvp_status === 'attending' ||
                                         profile.rsvp_status === 'confirmed' ||
                                         profile.rsvp_status === 'not_attending' ||
                                         profile.rsvp_status === 'declined';

        // Show prompt ONLY if they need to RSVP and haven't already confirmed their status
        if (needsRSVP && !isAdminWithConfirmedStatus) {
          setShow(true);
        } else if (hasResponded || isAdminWithConfirmedStatus) {
          // Show thank you message for users who have already RSVP'd
          setShowThankYou(true);
          // Auto-hide thank you message after 3 seconds
          setTimeout(() => setShowThankYou(false), 3000);
        }

        // Debug logging for troubleshooting
        console.log('RSVP Auto Prompt Debug:', {
          userId: user.id,
          rsvpStatus: profile.rsvp_status,
          rsvpRespondedAt: profile.rsvp_responded_at,
          hasResponded,
          needsRSVP,
          isAdminWithConfirmedStatus,
          willShow: needsRSVP && !isAdminWithConfirmedStatus,
          showThankYou: hasResponded || isAdminWithConfirmedStatus
        });
      }

      // Mark that we've shown the prompt today
      localStorage.setItem(lastPromptKey, today);
    } catch (error) {
      console.error('Error checking RSVP status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRSVP = async (status: 'attending' | 'not_attending') => {
    if (!guestProfile || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          rsvp_status: status,
          rsvp_responded_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(
        status === 'attending' 
          ? 'Thank you for confirming! We\'re excited to celebrate with you!' 
          : 'Thank you for letting us know. We\'ll miss you!'
      );

      setShow(false);
      onRSVPComplete?.();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error('Failed to update RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  const handleNavigateToFullForm = () => {
    setShow(false);
    navigate('/rsvp');
  };

  if (loading || (!show && !showThankYou)) return null;

  // Thank you message for users who have already RSVP'd
  if (showThankYou && !show) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-green-500" />
              <div>
                <h4 className="font-semibold text-[#2d3f51]">Thanks for your RSVP!</h4>
                <p className="text-sm text-[#7a736b]">
                  We're excited to celebrate with you at Ben Ean.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="max-w-md w-full"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-wedding-gold" />
                <h3 className="text-xl font-semibold text-[#2d3f51]">
                  You Haven't RSVPed Yet!
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-wedding-navy mx-auto mb-3" />
                <p className="text-[#7a736b] mb-2">
                  Hi {guestProfile?.first_name || 'there'}! We noticed you haven't responded to our wedding invitation yet.
                </p>
                <p className="text-sm text-[#7a736b] mb-4">
                  Would you be able to join us for our special day?
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="font-semibold text-wedding-navy">Tim & Kirsten's Wedding</p>
                <p className="text-sm text-muted-foreground">October 5th, 2025 • Ben Ean Winery</p>
                <p className="text-sm text-muted-foreground">Arrival: 2:30 PM • Ceremony: 3:00 PM</p>
              </div>

              <RSVPButtons
                value="pending"
                onChange={handleQuickRSVP}
                disabled={submitting}
                size="large"
                className="mt-4"
              />

              <div className="text-center space-y-2">
                <Button
                  variant="link"
                  onClick={handleNavigateToFullForm}
                  className="text-wedding-navy hover:text-wedding-navy-light"
                  disabled={submitting}
                >
                  Need to add dietary requirements or a plus one? Use full form →
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="text-sm text-muted-foreground"
                  disabled={submitting}
                >
                  Remind me later
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RSVPAutoPrompt;