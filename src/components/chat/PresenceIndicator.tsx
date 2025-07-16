import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

interface PresenceIndicatorProps {
  status: PresenceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showLastSeen?: boolean;
  lastSeen?: Date;
  isTyping?: boolean;
  className?: string;
}

interface TypingIndicatorProps {
  isVisible: boolean;
  userNames?: string[];
  className?: string;
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  showLastSeen = false,
  lastSeen,
  isTyping = false,
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Size configurations
  const sizeConfig = {
    sm: {
      dot: 'w-2 h-2',
      ring: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      dot: 'w-3 h-3',
      ring: 'w-4 h-4', 
      text: 'text-sm'
    },
    lg: {
      dot: 'w-4 h-4',
      ring: 'w-5 h-5',
      text: 'text-base'
    }
  };

  // Status configurations
  const statusConfig = {
    online: {
      color: 'bg-green-500',
      borderColor: 'border-green-400',
      label: 'Online',
      animate: true
    },
    away: {
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-400',
      label: 'Away',
      animate: false
    },
    busy: {
      color: 'bg-red-500',
      borderColor: 'border-red-400',
      label: 'Busy',
      animate: false
    },
    offline: {
      color: 'bg-gray-400',
      borderColor: 'border-gray-300',
      label: 'Offline',
      animate: false
    }
  };

  const config = statusConfig[status];
  const sizes = sizeConfig[size];

  // Format last seen time
  const formatLastSeen = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Override status if user is offline
  const effectiveStatus = !isOnline ? 'offline' : status;
  const effectiveConfig = statusConfig[effectiveStatus];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status indicator */}
      <div className="relative">
        <motion.div
          className={`${sizes.dot} ${effectiveConfig.color} rounded-full border-2 border-white shadow-sm`}
          animate={effectiveConfig.animate ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Pulse ring for online status */}
        {effectiveStatus === 'online' && (
          <motion.div
            className={`absolute inset-0 ${sizes.ring} ${effectiveConfig.borderColor} border rounded-full`}
            animate={{
              scale: [1, 1.5],
              opacity: [0.7, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}

        {/* Network status overlay */}
        {!isOnline && (
          <div className="absolute -top-1 -right-1">
            <WifiOff className="w-3 h-3 text-red-500" />
          </div>
        )}
      </div>

      {/* Status label and last seen */}
      {(showLabel || showLastSeen) && (
        <div className="flex flex-col">
          {showLabel && (
            <span className={`${sizes.text} font-medium text-gray-700`}>
              {effectiveConfig.label}
            </span>
          )}
          
          {showLastSeen && lastSeen && effectiveStatus !== 'online' && (
            <span className={`${sizes.text} text-gray-500`}>
              Last seen {formatLastSeen(lastSeen)}
            </span>
          )}
        </div>
      )}

      {/* Typing indicator */}
      {isTyping && (
        <Badge variant="secondary" className="animate-pulse">
          typing...
        </Badge>
      )}
    </div>
  );
};

// Typing indicator component
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
  userNames = [],
  className = ''
}) => {
  const formatTypingText = (): string => {
    if (userNames.length === 0) return 'Someone is typing...';
    if (userNames.length === 1) return `${userNames[0]} is typing...`;
    if (userNames.length === 2) return `${userNames[0]} and ${userNames[1]} are typing...`;
    return `${userNames[0]} and ${userNames.length - 1} others are typing...`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`flex items-center gap-2 px-4 py-2 text-sm text-gray-500 ${className}`}
        >
          {/* Animated dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          <span>{formatTypingText()}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Network status indicator
export const NetworkStatusIndicator: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showOfflineMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
        >
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              You're offline. Messages will be sent when connection is restored.
            </span>
          </div>
        </motion.div>
      )}
      
      {isOnline && showOfflineMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
        >
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">
              Back online!
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Connection quality indicator
export const ConnectionQualityIndicator: React.FC<{
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  className?: string;
}> = ({ quality, className = '' }) => {
  const qualityConfig = {
    excellent: { bars: 4, color: 'text-green-500', label: 'Excellent' },
    good: { bars: 3, color: 'text-green-400', label: 'Good' },
    fair: { bars: 2, color: 'text-yellow-500', label: 'Fair' },
    poor: { bars: 1, color: 'text-red-500', label: 'Poor' }
  };

  const config = qualityConfig[quality];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-sm ${
              bar <= config.bars ? config.color.replace('text-', 'bg-') : 'bg-gray-300'
            }`}
            style={{
              height: `${bar * 3 + 2}px`
            }}
          />
        ))}
      </div>
      
      <span className={`text-xs ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

export default PresenceIndicator;