import React from 'react';
import { usePresence } from '@/hooks/usePresence';
import AnimatedTooltip from '@/ui/aceternity/animated-tooltip';

interface PresenceUser {
  user_id: string;
  name: string;
  avatar?: string;
  last_seen: string;
  status: 'online' | 'away' | 'offline';
}

interface PresenceAvatarStackProps {
  className?: string;
  maxVisible?: number;
}

// No dummy users - use only real presence data

const PresenceAvatarStack: React.FC<PresenceAvatarStackProps> = ({ 
  className, 
  maxVisible = 5 
}) => {
  const { onlineUsers, isLoading } = usePresence();

  // Use only real presence data
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, onlineUsers.length - maxVisible);

  const tooltipItems = visibleUsers.map(user => ({
    id: user.user_id,
    name: user.name,
    designation: user.status === 'online' ? 'Online now' : 'Away',
    image: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
  }));

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-gray-200 animate-pulse border-2 border-white"
            />
          ))}
        </div>
      </div>
    );
  }

  // Don't render anything if no users are online
  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center -space-x-2">
        <AnimatedTooltip items={tooltipItems} />
        {remainingCount > 0 && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresenceAvatarStack;