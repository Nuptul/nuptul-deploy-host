import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to auth if not logged in
        navigate('/auth');
      } else if (profile && !profile.rsvp_responded_at && (!profile.rsvp_status || profile.rsvp_status === 'pending')) {
        // Redirect to RSVP if logged in but haven't completed RSVP
        navigate('/rsvp');
      } else {
        // Redirect to home if everything is complete
        navigate('/home');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
