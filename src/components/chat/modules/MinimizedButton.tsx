import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HapticFeedback } from '@/components/mobile/HapticFeedback';

interface Chat {
  id: string;
  participants: any[];
  lastMessage?: any;
  unreadCount: number;
  isActive: boolean;
  isTyping?: boolean;
}

interface MinimizedButtonProps {
  chats: Chat[];
  isMobileView: boolean;
  isCenter: boolean;
  isDashboardActive: boolean;
  className: string;
  onMinimize?: () => void;
}

export const MinimizedButton: React.FC<MinimizedButtonProps> = ({
  chats,
  isMobileView,
  isCenter,
  isDashboardActive,
  className,
  onMinimize,
}) => {
  const getPositionClasses = () => {
    if (isCenter) {
      return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[200]';
    }
    
    return isMobileView 
      ? 'fixed bottom-24 right-6 z-[200]'
      : 'fixed bottom-6 right-6 z-[200]';
  };

  const buttonPosition = getPositionClasses();
  const buttonClasses = isMobileView 
    ? 'rounded-full w-16 h-16 p-0' 
    : 'rounded-t-2xl rounded-b-none h-14 px-6';
  
  const unreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className={`${buttonPosition} ${className} ${isDashboardActive ? 'opacity-30' : ''}`}>
      <HapticFeedback type="light">
        <Button
          onClick={onMinimize}
          className={`glass-card bg-gradient-to-br from-wedding-navy/95 via-wedding-navy-light/90 to-wedding-navy/95 backdrop-blur-xl border border-white/30 text-wedding-cream shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${buttonClasses}`}
          style={{
            background: 'linear-gradient(135deg, rgba(44, 62, 80, 0.95) 0%, rgba(52, 73, 94, 0.9) 50%, rgba(44, 62, 80, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 40px rgba(44, 62, 80, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2), 6px 6px 12px rgba(44, 62, 80, 0.15), -1px -1px 3px rgba(255, 255, 255, 0.1)'
          }}
        >
          <MessageCircle className={`${isMobileView ? 'w-7 h-7' : 'w-6 h-6 mr-3'} text-wedding-gold drop-shadow-sm`} />
          {!isMobileView && <span className="font-bold text-base font-dolly drop-shadow-sm">Instant Chat</span>}
          {unreadCount > 0 && (
            <div className={`bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse border-2 border-white/30 ${
              isMobileView 
                ? 'absolute -top-2 -right-2 w-6 h-6' 
                : 'w-6 h-6 ml-3'
            }`}
             style={{
               boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
             }}>
              {unreadCount}
            </div>
          )}
        </Button>
      </HapticFeedback>
    </div>
  );
};