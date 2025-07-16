import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Video, 
  Phone, 
  MessageSquare, 
  Bell, 
  Search,
  Settings,
  Heart,
  X
} from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';
import { useAuth } from '@/hooks/useAuth';
import { getLiquidGlassStyle } from '@/utils/styleHelpers';
import styles from '@/components/dashboard/dashboard.module.css';

interface SocialHeaderProps {
  className?: string;
  isPopup?: boolean;
  onClose?: () => void;
  onVideoCall?: () => void;
  onAudioCall?: () => void;
  onSearch?: () => void;
  onNotifications?: () => void;
  onSettings?: () => void;
  onMessage?: () => void;
}

const SocialHeader: React.FC<SocialHeaderProps> = ({
  className = '',
  isPopup = false,
  onClose,
  onVideoCall,
  onAudioCall,
  onSearch,
  onNotifications,
  onSettings,
  onMessage
}) => {
  const { onlineCount, onlineUsers, isLoading } = usePresence();
  const { profile } = useAuth();

  return (
    <header 
      className={`sticky top-0 z-50 w-full ${className} ${styles.liquidGlassContainer}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
        backdropFilter: 'blur(30px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Left Section - Wedding Social Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-wedding-gold to-yellow-500 flex items-center justify-center shadow-lg">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <h1 className="hidden sm:block" style={{
              fontFamily: '"Bodoni Moda", serif',
              fontSize: '20px',
              fontWeight: '600',
              color: '#000000'
            }}>
              Wedding Social
            </h1>
          </div>
          
          {/* Online Count Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gradient-to-r from-green-100/90 to-green-50/90 backdrop-blur-sm text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200/30 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>
                {isLoading ? '...' : `${onlineCount} online`}
              </span>
            </div>
          </div>
        </div>

        {/* Center Section - Online Users Preview */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center max-w-md">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-wedding-navy/70" />
            <span className="text-sm text-wedding-navy/70">Active now:</span>
          </div>
          <div className="flex -space-x-2 overflow-hidden">
            {onlineUsers.slice(0, 6).map((user, index) => (
              <Avatar 
                key={user.user_id} 
                className="w-8 h-8 border-2 border-white/90 relative shadow-md hover:shadow-lg transition-shadow"
                title={user.name}
              >
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-wedding-gold to-yellow-500 text-white">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </Avatar>
            ))}
            {onlineCount > 6 && (
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium text-gray-600 shadow-md">
                +{onlineCount - 6}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={onSearch}
            className={`rounded-full transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
            }}
            aria-label="Search wedding posts"
          >
            <Search className="h-5 w-5" style={{ color: 'rgba(0, 0, 0, 0.7)' }} />
          </button>

          {/* Video Call Button */}
          <button
            onClick={onVideoCall}
            className={`rounded-full transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.1) 100%)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
            }}
            aria-label="Start video call"
          >
            <Video className="h-5 w-5" style={{ color: '#3b82f6' }} />
          </button>

          {/* Audio Call Button */}
          <button
            onClick={onAudioCall}
            className={`rounded-full transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(74, 222, 128, 0.1) 100%)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
            }}
            aria-label="Start audio call"
          >
            <Phone className="h-5 w-5" style={{ color: '#22c55e' }} />
          </button>

          {/* Messages Button */}
          <button
            onClick={onMessage}
            className={`rounded-full transition-all duration-200 hover:scale-105 relative ${styles.actionButton}`}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              boxShadow: '0 2px 8px rgba(147, 51, 234, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
            }}
            aria-label="Messages"
          >
            <MessageSquare className="h-5 w-5" style={{ color: '#9333ea' }} />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 border-0 shadow-lg"
            >
              3
            </Badge>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onNotifications}
            className={`rounded-full transition-all duration-200 hover:scale-105 relative ${styles.actionButton}`}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 193, 7, 0.1) 100%)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
            }}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" style={{ color: '#ffd700' }} />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-gradient-to-r from-wedding-gold to-yellow-500 border-0 shadow-lg"
            >
              2
            </Badge>
          </button>

          {/* User Avatar & Settings */}
          <div className="flex items-center gap-2 ml-2">
            {isPopup ? (
              <button
                onClick={onClose}
                className={`rounded-full transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  backdropFilter: 'blur(20px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                }}
                aria-label="Close popup"
              >
                <X className="h-5 w-5" style={{ color: '#ef4444' }} />
              </button>
            ) : (
              <>
                <button
                  onClick={onSettings}
                  className={`rounded-full transition-all duration-200 hover:scale-105 ${styles.actionButton}`}
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(75, 85, 99, 0.1) 100%)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    boxShadow: '0 2px 8px rgba(107, 114, 128, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                  }}
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" style={{ color: '#6b7280' }} />
                </button>
                
                <Avatar className="w-8 h-8 border-2 border-white/60 shadow-lg hover:shadow-xl transition-shadow">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.first_name || 'User'} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-wedding-gold to-yellow-500 text-white font-semibold">
                    {profile?.first_name ? profile.first_name[0] : 'U'}
                  </AvatarFallback>
                </Avatar>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Online Users Strip */}
      <div className="md:hidden px-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Active:</span>
          {onlineUsers.slice(0, 8).map((user) => (
            <div key={user.user_id} className="flex items-center gap-1 whitespace-nowrap">
              <Avatar className="w-6 h-6 border border-white relative">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-xs">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full" />
              </Avatar>
              <span className="text-xs text-muted-foreground">{user.name.split(' ')[0]}</span>
            </div>
          ))}
          {onlineCount > 8 && (
            <span className="text-xs text-muted-foreground">+{onlineCount - 8} more</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default SocialHeader;