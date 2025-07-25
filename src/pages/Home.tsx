import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useRSVPStatus } from '@/hooks/useRSVPStatus';
import { useNavigate } from 'react-router-dom';
import UniversalHeader from '@/components/navigation/UniversalHeader';
import DashboardPopup from '@/components/DashboardPopup';
import HeroSection from '@/components/home/HeroSection';
import DynamicFAQSection from '@/components/home/DynamicFAQSection';
import ContactInfo from '@/components/ContactInfo';
// import SimpleRSVPPopup from '@/components/SimpleRSVPPopup'; // Removed - using comprehensive RSVP form instead

import EventsPopup from '@/components/EventsPopup';
// Debug components removed for production

const Home: React.FC = () => {
  const { userRole, user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Handle authentication redirects only (NOT RSVP redirects)
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to auth if not logged in
        navigate('/auth');
        return;
      }
      // REMOVED: Automatic RSVP redirect - users should be able to browse freely
      // RSVP prompts will be handled through user-friendly notifications instead
    }
  }, [user, loading, navigate]);

  // Show loading state while authentication is being resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy mx-auto mb-4"></div>
          <p className="text-wedding-navy">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (will be redirected)
  if (!user) {
    return null;
  }

  const { settings } = useAppSettings();
  const { needsRSVP, markRSVPComplete } = useRSVPStatus();
  const [showRSVPPopup, setShowRSVPPopup] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showEventsPopup, setShowEventsPopup] = useState(false);
  const [dismissedRSVPBanner, setDismissedRSVPBanner] = useState(false);
  
  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'couple';

  // DISABLED: Automatic RSVP popup - now using manual activation
  // useEffect(() => {
  //   if (needsRSVP && !isAdmin) {
  //     const timer = setTimeout(() => {
  //       setShowRSVPPopup(true);
  //     }, 2000); // Show after 2 seconds

  //     return () => clearTimeout(timer);
  //   }
  // }, [needsRSVP, isAdmin]);

  // Listen for dashboard and RSVP open events
  useEffect(() => {
    const handleOpenDashboard = () => {
      setShowDashboard(true);
    };

    const handleOpenRSVP = () => {
      // Navigate to comprehensive RSVP page instead of showing popup
      navigate('/rsvp');
    };

    window.addEventListener('openDashboard', handleOpenDashboard);
    window.addEventListener('openRSVP', handleOpenRSVP);
    return () => {
      window.removeEventListener('openDashboard', handleOpenDashboard);
      window.removeEventListener('openRSVP', handleOpenRSVP);
    };
  }, []);

  const handleRSVPComplete = () => {
    markRSVPComplete();
    setShowRSVPPopup(false);
  };

  const handleOpenRSVP = () => {
    // Navigate to comprehensive RSVP page instead of showing popup
    navigate('/rsvp');
  };

  const handleNotificationClick = () => {
  };

  return (
    <>
      {/* Universal Header */}
      <UniversalHeader 
        onNotificationClick={handleNotificationClick}
      />

      <div className="min-h-screen pt-20 pb-20 p-4 sm:p-6 lg:p-8 xl:p-10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <HeroSection />
          
          {/* Dynamic FAQ Section - Admin Controlled */}
          <DynamicFAQSection />

          {/* Debug components removed for production */}

          {/* Contact Info */}
          <div className="mb-6 sm:mb-8 lg:mb-10 animate-fade-up">
            <ContactInfo />
          </div>

          {/* Footer */}
          <div 
            className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 mt-8 sm:mt-10"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              paddingTop: '32px'
            }}
          >
            <div 
              className="text-center sm:text-left mb-3 sm:mb-0"
              style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                color: 'rgba(0, 0, 0, 0.6)',
                letterSpacing: '0.02em'
              }}
            >
              {settings.footer_message}
            </div>
            <div 
              className="text-center sm:text-right"
              style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                color: '#007AFF',
                fontWeight: '500',
                letterSpacing: '0.02em'
              }}
            >
              {new Date(settings.wedding_date).toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* RSVP Popup - DISABLED: Using comprehensive RSVP page instead */}
        {/* <SimpleRSVPPopup
          isOpen={showRSVPPopup}
          onClose={() => setShowRSVPPopup(false)}
          onComplete={handleRSVPComplete}
        /> */}

        {/* Dashboard Popup - Shows guest or admin based on user role */}
        <DashboardPopup
          isOpen={showDashboard}
          onClose={() => setShowDashboard(false)}
          userRole={userRole?.role || 'guest'}
        />

        {/* Events Popup */}
        <EventsPopup
          isOpen={showEventsPopup}
          onClose={() => setShowEventsPopup(false)}
        />

        {/* Debug modals and fix components removed for production */}
      </div>
    </>
  );
};

export default Home;