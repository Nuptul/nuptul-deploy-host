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
    <header className={`sticky top-0 z-50 w-full ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-wedding-pearl/90 to-white/95 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/5" />
      <div className="relative flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Left Section - Nuptul Logo, Title and Online Count */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Nuptul Logo */}
            <div className="flex items-center mr-2">
              <img
                src="/nuptul-logo.png"
                alt="Nuptul"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-all duration-300 hover:scale-105"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0, 102, 204, 0.3))',
                }}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-wedding-gold to-amber-400 blur-lg opacity-60 animate-pulse" />
              <Heart className="w-8 h-8 text-wedding-gold relative z-10 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-wedding-navy to-wedding-gold bg-clip-text text-transparent">
                Wedding Social
              </h1>
              <p className="text-xs text-gray-600 -mt-1">Tim & Kirsten's Special Day</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 blur opacity-50 animate-pulse" />
            <Badge className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1 text-xs font-medium shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1.5" />
              {isLoading ? '...' : `${onlineCount} online`}
            </Badge>
          </div>
        </div>


        {/* Right Section - Premium Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSearch}
            className="relative p-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group"
          >
            <Search className="h-5 w-5 text-gray-600 group-hover:text-wedding-gold transition-colors" />
          </button>
          
          <button
            onClick={onMessage}
            className="relative p-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group"
          >
            <MessageSquare className="h-5 w-5 text-gray-600 group-hover:text-wedding-gold transition-colors" />
            <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center px-1 shadow-lg animate-bounce">
              3
            </span>
          </button>
          
          <button
            onClick={onNotifications}
            className="relative p-2.5 rounded-xl bg-white/80 hover:bg-white border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group"
          >
            <Bell className="h-5 w-5 text-gray-600 group-hover:text-wedding-gold transition-colors" />
            <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center px-1 shadow-lg animate-bounce">
              2
            </span>
          </button>
          
          {isPopup ? (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <>
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2" />
              <button
                onClick={onSettings}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-wedding-gold to-amber-400 rounded-full blur opacity-0 group-hover:opacity-60 transition-opacity" />
                <Avatar className="relative w-10 h-10 ring-2 ring-white shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.first_name || 'User'} />
                  <AvatarFallback className="bg-gradient-to-r from-wedding-gold to-amber-500 text-white font-bold">
                    {profile?.first_name ? profile.first_name[0] : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default SocialHeader;