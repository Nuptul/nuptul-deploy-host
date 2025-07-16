import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useRSVPStatus } from '@/hooks/useRSVPStatus';
import UniversalHeader from '@/components/navigation/UniversalHeader';
import DashboardPopup from '@/components/DashboardPopup';
import HeroSection from '@/components/home/HeroSection';
import DynamicFAQSection from '@/components/home/DynamicFAQSection';
import DressCodeCard from '@/components/DressCodeCard';
import ContactInfo from '@/components/ContactInfo';
import SimpleRSVPPopup from '@/components/SimpleRSVPPopup';
import RSVPCallToAction from '@/components/home/RSVPCallToAction';
import VenueChangeNotice from '@/components/VenueChangeNotice';
import EventsPopup from '@/components/EventsPopup';
// Debug components removed for production
import MessengerTestButton from '@/components/test/MessengerTestButton';

const Home: React.FC = () => {
  const { userRole, user } = useAuth();
  
  const { settings } = useAppSettings();
  const { needsRSVP, markRSVPComplete } = useRSVPStatus();
  const [showRSVPPopup, setShowRSVPPopup] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showEventsPopup, setShowEventsPopup] = useState(false);
  
  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'couple';

  // Show RSVP popup after a short delay for guests who need to RSVP
  useEffect(() => {
    if (needsRSVP && !isAdmin) {
      const timer = setTimeout(() => {
        setShowRSVPPopup(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [needsRSVP, isAdmin]);

  // Listen for dashboard and RSVP open events
  useEffect(() => {
    const handleOpenDashboard = () => {
      setShowDashboard(true);
    };

    const handleOpenRSVP = () => {
      setShowRSVPPopup(true);
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
    setShowRSVPPopup(true);
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
          <VenueChangeNotice />
          <HeroSection onRSVPClick={handleOpenRSVP} />
          
          {/* Dynamic FAQ Section - Admin Controlled */}
          <DynamicFAQSection />
          
          {/* RSVP Call to Action */}
          <RSVPCallToAction onRSVPClick={handleOpenRSVP} />
          
          {/* Debug components removed for production */}
          
          {/* Dress Code */}
          <div className="mb-6 sm:mb-8 lg:mb-10 animate-fade-up">
            <DressCodeCard />
          </div>

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

        {/* RSVP Popup for guests who haven't RSVP'd */}
        <SimpleRSVPPopup
          isOpen={showRSVPPopup}
          onClose={() => setShowRSVPPopup(false)}
          onComplete={handleRSVPComplete}
        />

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
        
        {/* Temporary messenger test button */}
        <MessengerTestButton />
      </div>
    </>
  );
};

export default Home;