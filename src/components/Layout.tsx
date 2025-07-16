import React, { ReactNode, useState, useEffect } from 'react';
import UniversalHeader from './navigation/UniversalHeader';
import GlassNavigation from './GlassNavigation';
import InstantMessenger from './chat/InstantMessenger';

interface LayoutProps {
  children: ReactNode;
  activeRoute: string;
  onNavigate: (route: string) => void;
  showNavigation?: boolean;
}

interface MessengerState {
  isOpen: boolean;
  isMinimized: boolean;
  isCenter: boolean;
}

interface MessengerEventDetail {
  center?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeRoute, 
  onNavigate, 
  showNavigation = true 
}) => {
  const [messengerState, setMessengerState] = useState<MessengerState>({
    isOpen: false,
    isMinimized: false,
    isCenter: false
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleOpenMessenger = (event: CustomEvent<MessengerEventDetail>) => {
      setMessengerState({
        isOpen: true,
        isMinimized: false,
        isCenter: event.detail?.center ?? true
      });
    };

    window.addEventListener('openMessenger', handleOpenMessenger as EventListener);
    return () => window.removeEventListener('openMessenger', handleOpenMessenger as EventListener);
  }, []);

  const handleMessengerMinimize = () => {
    setMessengerState(prev => ({ ...prev, isMinimized: !prev.isMinimized, isCenter: false }));
  };

  const handleMessengerClose = () => {
    setMessengerState({ isOpen: false, isMinimized: false, isCenter: false });
  };


  return (
    <div className="min-h-screen relative">
      {showNavigation && <UniversalHeader />}

      <main className={`relative ${showNavigation ? 'pt-16 pb-24' : ''}`}>
        {children}
      </main>

      {showNavigation && (
        <GlassNavigation 
          activeRoute={activeRoute}
          onNavigate={onNavigate}
        />
      )}
      
      {(messengerState.isOpen || messengerState.isMinimized) && (
        <InstantMessenger
          isMinimized={messengerState.isMinimized}
          isMobile={isMobile}
          isCenter={messengerState.isCenter}
          isDashboardActive={false}
          onMinimize={handleMessengerMinimize}
          onClose={handleMessengerClose}
        />
      )}
    </div>
  );
};

export default Layout;