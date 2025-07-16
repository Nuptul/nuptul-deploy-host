import React, { useState, useCallback, useEffect } from 'react';
import DashboardPopup from './DashboardPopup';
import SocialPopup from './SocialPopup';
import GalleryPopup from './GalleryPopup';
import EventsPopup from './EventsPopup';
import ResponsiveNavigation from './navigation/ResponsiveNavigation';
import { useAuth } from '@/hooks/useAuth';
import { NAVIGATION_ROUTES } from './navigation/constants';
import type { NavigationProps } from './navigation/types';



const GlassNavigation: React.FC<NavigationProps> = ({ activeRoute, onNavigate = () => {} }) => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const { userRole } = useAuth();

  // Debug state changes
  useEffect(() => {
    
  }, [isDashboardOpen]);

  useEffect(() => {
    
    // Don't automatically close dashboard when userRole changes
    // if (userRole === null && isDashboardOpen) {
    //   
    //   setIsDashboardOpen(false);
    // }
  }, [userRole]);

  const handleRouteClick = (routeId: string) => {
    // Close all popups first
    setIsDashboardOpen(false);
    setIsSocialOpen(false);
    setIsGalleryOpen(false);
    setIsEventsOpen(false);
    
    if (routeId === 'dashboard') {
      setIsDashboardOpen(true);
    } else if (routeId === 'social') {
      // Navigate to social page instead of opening popup
      onNavigate(routeId);
    } else if (routeId === 'gallery') {
      setIsGalleryOpen(true);
    } else if (routeId === 'events') {
      setIsEventsOpen(true);
    } else if (routeId === 'gifts') {
      // Open external gift registry link
      window.open('https://mygiftregistry.com.au/id/tim-and-kirsten/', '_blank');
    } else {
      onNavigate(routeId);
    }
  };

  const handleDashboardClose = useCallback(() => {
    setIsDashboardOpen(false);
  }, []);

  const handleSocialClose = useCallback(() => {
    setIsSocialOpen(false);
  }, []);

  const handleGalleryClose = useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  const handleEventsClose = useCallback(() => {
    setIsEventsOpen(false);
  }, []);

  return (
    <>
      <ResponsiveNavigation 
        routes={NAVIGATION_ROUTES}
        activeRoute={activeRoute}
        onRouteClick={handleRouteClick}
      />

      <DashboardPopup
        isOpen={isDashboardOpen}
        onClose={handleDashboardClose}
        userRole={userRole?.role || 'guest'}
      />
      
      <SocialPopup
        isOpen={isSocialOpen}
        onClose={handleSocialClose}
      />
      
      <GalleryPopup
        isOpen={isGalleryOpen}
        onClose={handleGalleryClose}
      />
      
      <EventsPopup
        isOpen={isEventsOpen}
        onClose={handleEventsClose}
      />
    </>
  );
};

export default GlassNavigation;