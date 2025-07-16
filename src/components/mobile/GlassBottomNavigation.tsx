import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, MapPin, Users, Camera, Grid3X3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { HapticFeedback } from './HapticFeedback';

interface GlassBottomNavigationProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

const GlassBottomNavigation: React.FC<GlassBottomNavigationProps> = ({ 
  activeRoute, 
  onNavigate 
}) => {
  const [isDashboardActive, setIsDashboardActive] = useState(false);
  const { userRole } = useAuth();
  const location = useLocation();

  const routes = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'venue', icon: MapPin, label: 'Venue', path: '/venue' },
    { id: 'dashboard', icon: Grid3X3, label: 'Dashboard', isCenter: true },
    { id: 'social', icon: Users, label: 'Social', path: '/social' },
    { id: 'gallery', icon: Camera, label: 'Gallery', path: '/gallery' },
  ];

  const handleRouteClick = async (routeId: string) => {
    await HapticFeedback.impact('medium');
    
    if (routeId === 'dashboard') {
      setIsDashboardActive(true);
      // Dashboard opens as popup, doesn't navigate
      onNavigate(routeId);
    } else {
      setIsDashboardActive(false);
      onNavigate(routeId);
    }
  };

  useEffect(() => {
    // Update dashboard state based on current route
    const currentRoute = routes.find(route => route.path === location.pathname);
    if (currentRoute?.id !== 'dashboard') {
      setIsDashboardActive(false);
    }
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
      <div className="relative mx-auto max-w-md">
        {/* Glass Navigation Container with Curved Shape - 2024-2025 Optimized */}
        <div className="glass-nav-container relative h-20 rounded-[32px] backdrop-blur-xl border border-white/20 min-w-[360px] max-w-[440px] w-full">
          {/* Background Gradient */}
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-white/10 via-white/5 to-white/10" />
          
          {/* Center Elevation for Dashboard */}
          {isDashboardActive && (
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-3">
              <div className="w-14 h-14 rounded-full bg-wedding-navy shadow-lg flex items-center justify-center">
                <Grid3X3 className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          
          {/* Navigation Items - 2024-2025 Touch Standards */}
          <div className="relative flex items-center justify-between h-full px-4">
            {routes.map((route) => {
              const isActive = route.isCenter ? isDashboardActive : activeRoute === route.id;
              const Icon = route.icon;
              
              if (route.isCenter) {
                return (
                  <button
                    key={route.id}
                    onClick={() => handleRouteClick(route.id)}
                    className={`flex flex-col items-center justify-center min-w-[60px] min-h-[60px] transition-all duration-300 ${
                      isDashboardActive ? '-mt-6' : 'mt-0'
                    }`}
                  >
                    {!isDashboardActive && (
                      <>
                        <div className="w-12 h-12 rounded-full bg-wedding-navy/20 backdrop-blur flex items-center justify-center mb-1 transition-all duration-300 hover:bg-wedding-navy/30">
                          <Icon className="w-6 h-6 text-wedding-navy" />
                        </div>
                        <span className="text-[9px] text-wedding-navy font-medium whitespace-nowrap max-w-[64px] overflow-hidden text-ellipsis">{route.label}</span>
                      </>
                    )}
                  </button>
                );
              }
              
              return (
                <button
                  key={route.id}
                  onClick={() => handleRouteClick(route.id)}
                  className="flex flex-col items-center justify-center min-w-[60px] min-h-[60px] transition-all duration-300 hover:scale-105"
                >
                  <div className={`transition-all duration-300 ${
                    isActive 
                      ? 'text-wedding-navy scale-110' 
                      : 'text-wedding-navy/60 hover:text-wedding-navy/80'
                  }`}>
                    <Icon className="w-6 h-6 mb-1" />
                  </div>
                  <span className={`text-[9px] font-medium transition-all duration-300 whitespace-nowrap max-w-[64px] overflow-hidden text-ellipsis ${
                    isActive 
                      ? 'text-wedding-navy opacity-100' 
                      : 'text-wedding-navy/60 opacity-70'
                  }`}>
                    {route.label}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Active Route Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <div className="flex space-x-1">
              {routes.filter(r => !r.isCenter).map((route, index) => (
                <div
                  key={route.id}
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    activeRoute === route.id
                      ? 'bg-wedding-navy w-6'
                      : 'bg-wedding-navy/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassBottomNavigation;