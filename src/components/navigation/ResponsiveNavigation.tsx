
import React from 'react';
import NavigationIcon from './NavigationIcon';
import { HapticFeedback } from '@/components/mobile/HapticFeedback';
import { NavigationRoute } from './types';
import { getLiquidGlassStyle } from '@/utils/styleHelpers';
import styles from '../dashboard/dashboard.module.css';

interface ResponsiveNavigationProps {
  routes: NavigationRoute[];
  activeRoute: string;
  onRouteClick: (routeId: string) => void;
}

const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  routes,
  activeRoute,
  onRouteClick
}) => {
  // Add styles to hide scrollbar
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .responsive-nav::-webkit-scrollbar {
        display: none;
      }
      .responsive-nav {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div 
      className="fixed"
      style={{
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 12px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      <nav 
        className={`responsive-nav ${styles.liquidGlassSubtle}`}
        style={{
          ...getLiquidGlassStyle('gradient', 'subtle', 'medium'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(4px, 1.5vw, 12px)',
          width: 'auto',
          maxWidth: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          transition: 'all 0.3s ease',
          padding: '6px 10px',
          height: 'auto',
          borderRadius: '24px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          pointerEvents: 'auto'
        }}
      >
      {routes.map((route) => {
        const isActive = activeRoute === route.id;
        const isCenter = route.isCenter;
        
        return (
          <HapticFeedback key={route.id} type="light">
            <button
              onClick={() => {
                
                
                
                onRouteClick(route.id);
              }}
              className={`nav-item ${isCenter ? 'dashboard' : ''} ${isActive ? 'active' : ''} touch-target`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'hsl(var(--wedding-navy) / 0.7)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                padding: 'clamp(4px, 1vw, 6px)',
                background: 'none',
                border: 'none',
                fontFamily: 'inherit',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: '12px',
                pointerEvents: 'all',
                flex: '0 0 auto'
              }}
            >
            {/* Enhanced Neumorphic Icon with Glass Capping */}
            <div 
              className="nav-icon"
              onMouseEnter={(e) => {
                if (isActive && isCenter) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 122, 255, 0.2) 0%, rgba(0, 122, 255, 0.1) 100%)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                if (isActive && isCenter) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
                }
              }}
              style={{
                background: isActive && isCenter 
                  ? 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%)'
                  : route.id === 'home' ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.25) 0%, rgba(78, 205, 196, 0.15) 50%, rgba(69, 183, 209, 0.2) 100%)'
                  : route.id === 'events' ? 'linear-gradient(135deg, rgba(255, 154, 0, 0.25) 0%, rgba(251, 105, 98, 0.15) 50%, rgba(255, 107, 107, 0.2) 100%)'
                  : route.id === 'social' ? 'linear-gradient(135deg, rgba(155, 89, 182, 0.25) 0%, rgba(142, 68, 173, 0.15) 50%, rgba(69, 183, 209, 0.2) 100%)'
                  : route.id === 'gallery' ? 'linear-gradient(135deg, rgba(46, 213, 115, 0.25) 0%, rgba(78, 205, 196, 0.15) 50%, rgba(69, 183, 209, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                width: 'clamp(36px, 9vw, 48px)',
                height: 'clamp(36px, 9vw, 48px)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                top: 'clamp(-6px, -1.5vw, -8px)',
                marginBottom: 'clamp(-4px, -1vw, -6px)',
                boxShadow: isActive && isCenter
                  ? '0 4px 16px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive && isCenter ? 'scale(1)' : 'scale(1)',
                cursor: 'pointer'
              }}
            >
              {/* Liquid Glass Capping Layer */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: `linear-gradient(
                    135deg,
                    rgba(255, 255, 255, 0.25) 0%,
                    rgba(255, 255, 255, 0.1) 40%,
                    rgba(255, 255, 255, 0.05) 60%,
                    transparent 100%
                  )`,
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
              
              {/* Enhanced Glass bubble effect overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '-30%',
                  left: '-30%',
                  width: '160%',
                  height: '160%',
                  background: `radial-gradient(
                    ellipse at 30% 20%,
                    rgba(255, 255, 255, 0.3) 0%,
                    rgba(255, 255, 255, 0.15) 20%,
                    rgba(255, 255, 255, 0.08) 40%,
                    rgba(255, 255, 255, 0.03) 60%,
                    transparent 80%
                  )`,
                  borderRadius: '50%',
                  transform: 'rotate(-15deg)',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              />
              
              {/* Premium Glass reflection highlight */}
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '70%',
                  height: '40%',
                  background: `linear-gradient(
                    to bottom,
                    rgba(255, 255, 255, 0.4) 0%,
                    rgba(255, 255, 255, 0.25) 30%,
                    rgba(255, 255, 255, 0.15) 50%,
                    rgba(255, 255, 255, 0.05) 70%,
                    transparent 100%
                  )`,
                  borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
                  filter: 'blur(1px)',
                  pointerEvents: 'none',
                  zIndex: 3
                }}
              />
              
              {/* Inner glass rim light */}
              <div
                style={{
                  position: 'absolute',
                  inset: '2px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  pointerEvents: 'none',
                  zIndex: 4
                }}
              />

              <div style={{ position: 'relative', zIndex: 5 }}>
                <NavigationIcon 
                  route={route} 
                  isActive={isActive} 
                  size={window.innerWidth < 768 ? 'small' : 'medium'} 
                />
              </div>
            </div>
            
            {/* Enhanced Responsive Label */}
            <span 
              className="nav-label"
              style={{
                fontSize: 'clamp(10px, 2.2vw, 12px)',
                marginTop: 'clamp(2px, 0.5vw, 4px)',
                fontWeight: '600',
                letterSpacing: '0.2px',
                textShadow: 'none',
                color: isActive && isCenter 
                  ? '#FFFFFF'
                  : isActive 
                    ? '#007AFF' 
                    : 'rgba(0, 0, 0, 0.7)',
                fontFamily: '"Montserrat", sans-serif',
                textAlign: 'center',
                lineHeight: '1.1',
                maxWidth: isCenter ? '80px' : '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                padding: '0 2px',
                transition: 'all 0.3s ease'
              }}
            >
              {route.label}
            </span>
          </button>
        </HapticFeedback>
        );
      })}
    </nav>
    </div>
  );
};

export default ResponsiveNavigation;
