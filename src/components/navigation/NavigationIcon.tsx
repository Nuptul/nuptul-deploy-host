import React from 'react';
import { NavigationIconProps } from './types';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

const NavigationIcon: React.FC<NavigationIconProps> = ({ route, isActive, size = 'medium' }) => {
  const { getNotificationForRoute, getGlobalMessageNotification } = useRealTimeNotifications();
  
  const iconSizes = {
    small: { width: '18px', height: '18px' },
    medium: { width: '22px', height: '22px' },
    large: { width: '24px', height: '24px' }
  };

  const iconSize = iconSizes[size];
  const routeNotification = getNotificationForRoute(route.id);
  const globalMessageNotification = getGlobalMessageNotification();
  
  // Determine notification display (green messages override blue social)
  const showNotification = globalMessageNotification.hasNotification || routeNotification.hasNotification;
  const notificationColor = globalMessageNotification.hasNotification ? '#22C55E' : '#3B82F6'; // Green for messages, blue for social
  const notificationCount = globalMessageNotification.hasNotification ? globalMessageNotification.count : routeNotification.count;

  if (route.isCenter) {
    // Dashboard 4-dot grid
    const dotSize = size === 'small' ? '6px' : '8px';
    const gap = size === 'small' ? '3px' : '4px';
    
    return (
      <div 
        className="icon-dashboard"
        style={{
          display: 'grid',
          gridTemplateColumns: `${dotSize} ${dotSize}`,
          gridTemplateRows: `${dotSize} ${dotSize}`,
          gap: gap,
          position: 'relative',
          zIndex: 1,
          filter: isActive ? 'none' : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
        }}
      >
        {[...Array(4)].map((_, i) => (
          <span 
            key={i}
            style={{
              backgroundColor: isActive 
                ? '#ffffff'
                : 'rgba(0, 0, 0, 0.7)',
              borderRadius: '2px',
              display: 'block',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: isActive 
                ? `
                  0 1px 2px rgba(0, 0, 0, 0.2),
                  inset 0 0 8px rgba(255, 255, 255, 1),
                  inset 0 0 4px rgba(255, 255, 255, 0.9)
                `
                : `
                  0 2px 3px rgba(0, 0, 0, 0.3),
                  inset 0 1px 2px rgba(255, 255, 255, 0.6)
                `,
              backgroundImage: isActive 
                ? `radial-gradient(
                    circle at center,
                    rgba(255, 255, 255, 1) 0%,
                    rgba(255, 255, 255, 0.95) 40%,
                    rgba(255, 255, 255, 0.9) 100%
                  )`
                : 'none'
            }}
          />
        ))}
      </div>
    );
  }

  // SVG Icons for other routes
  return (
    <div style={{ position: 'relative' }}>
      <svg 
        className="svg-icon" 
        style={{
          ...iconSize,
          fill: route.id === 'venue' ? (isActive ? '#007AFF' : 'rgba(0, 0, 0, 0.7)') : 'none',
          stroke: isActive ? '#007AFF' : 'rgba(0, 0, 0, 0.7)',
          strokeWidth: route.id === 'venue' ? '0' : '1.5',
          filter: 'none',
          position: 'relative',
          zIndex: 1
        }}
        viewBox="0 0 24 24"
      >
        {route.id === 'home' && (
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        )}
        {route.id === 'events' && (
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        )}
        {route.id === 'social' && (
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        )}
        {route.id === 'gallery' && (
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        )}
      </svg>
      
      {/* Notification Badge */}
      {showNotification && (
        <div
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '12px',
            height: '12px',
            backgroundColor: notificationColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            fontWeight: 'bold',
            color: 'white',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            zIndex: 10
          }}
        >
          {notificationCount > 9 ? '9+' : notificationCount > 0 ? notificationCount : ''}
        </div>
      )}
    </div>
  );
};

export default NavigationIcon;