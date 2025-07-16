import React, { useState } from 'react';
import { IconChevronDown, IconSettings, IconLogout, IconUserCog } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppSettings } from '@/hooks/useAppSettings';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '@/components/notifications/NotificationBell';

interface UniversalHeaderProps {
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
}

const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  onProfileClick,
  onNotificationClick
}) => {
  const { user, userRole, profile } = useAuth();
  const { settings } = useAppSettings();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      setShowProfileDropdown(!showProfileDropdown);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setShowProfileDropdown(false);
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEditProfile = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setShowProfileDropdown(false);
    navigate('/settings');
  };

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'G';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const getDisplayName = () => {
    return profile?.display_name || 
           profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` :
           user?.user_metadata?.full_name || 
           'Guest';
  };

  const renderAvatar = (size: 'small' | 'large' = 'small') => {
    const avatarUrl = profile?.avatar_url || profile?.profile_picture_url;
    const sizeClasses = size === 'small' ? 'w-10 h-10 text-base' : 'w-14 h-14 text-xl';
    
    if (avatarUrl) {
      return (
        <div className={`${sizeClasses} rounded-full relative`}>
          <img 
            src={avatarUrl} 
            alt="Profile"
            className={`${sizeClasses} rounded-full object-cover border-2 border-white/20`}
            onError={(e) => {
              // Hide the image and show the fallback initials
              const imgElement = e.target as HTMLImageElement;
              imgElement.style.display = 'none';
              const fallbackElement = imgElement.nextElementSibling as HTMLElement;
              if (fallbackElement) {
                fallbackElement.style.display = 'flex';
              }
            }}
          />
          <div 
            className={`avatar ${sizeClasses} rounded-full flex items-center justify-center font-semibold absolute inset-0`}
            style={{ 
              display: 'none',
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.2) 0%, rgba(0, 122, 255, 0.1) 100%)',
              backdropFilter: 'blur(20px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
              border: '2px solid rgba(0, 122, 255, 0.3)',
              color: '#007AFF',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
            }}
          >
            {getInitials(getDisplayName())}
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className={`avatar ${sizeClasses} rounded-full flex items-center justify-center font-semibold`}
        style={{
          background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.2) 0%, rgba(0, 122, 255, 0.1) 100%)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          border: '2px solid rgba(0, 122, 255, 0.3)',
          color: '#007AFF',
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0, 122, 255, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
        }}
      >
        {getInitials(getDisplayName())}
      </div>
    );
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.12) 0%, rgba(78, 205, 196, 0.08) 50%, rgba(69, 183, 209, 0.1) 100%)',
        backdropFilter: 'blur(25px) saturate(2)',
        WebkitBackdropFilter: 'blur(25px) saturate(2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Left: Profile Button */}
        <div className="flex items-center gap-4 relative">
          <button
            onClick={handleProfileClick}
            className="profile-button flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 group"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.06) 100%)',
              backdropFilter: 'blur(20px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 122, 255, 0.2) 0%, rgba(0, 122, 255, 0.1) 100%)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.06) 100%)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            {renderAvatar('small')}
            <span 
              className="text-sm hidden sm:block"
              style={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: '600',
                color: '#000000',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
              }}
            >
              {getDisplayName()}
            </span>
            <IconChevronDown size={16} style={{ color: 'rgba(0, 0, 0, 0.6)' }} stroke={1.5} className="group-hover:text-black transition-colors" />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 rounded-xl shadow-xl z-50 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                backdropFilter: 'blur(30px) saturate(1.5)',
                WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
              }}>
              <div className="p-4 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                <div className="flex items-center gap-3">
                  {renderAvatar('large')}
                  <div>
                    <div className="font-medium" style={{ color: '#000000', fontFamily: '"Montserrat", sans-serif' }}>
                      {getDisplayName()}
                    </div>
                    <div className="text-sm" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                      {userRole?.role || 'guest'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button 
                  onClick={handleEditProfile}
                  className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  style={{
                    color: 'rgba(0, 0, 0, 0.8)',
                    fontFamily: '"Montserrat", sans-serif',
                    minHeight: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 122, 255, 0.1)';
                    e.currentTarget.style.color = '#007AFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(0, 0, 0, 0.8)';
                  }}
                >
                  <IconUserCog size={18} stroke={1.5} />
                  Edit Profile
                </button>
                <button 
                  onClick={handleSettings}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                  style={{
                    color: 'rgba(0, 0, 0, 0.8)',
                    fontFamily: '"Montserrat", sans-serif',
                    minHeight: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 122, 255, 0.1)';
                    e.currentTarget.style.color = '#007AFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(0, 0, 0, 0.8)';
                  }}
                >
                  <IconSettings size={18} stroke={1.5} />
                  Settings
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                  style={{
                    color: '#FF3B30',
                    fontFamily: '"Montserrat", sans-serif',
                    minHeight: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)';
                    e.currentTarget.style.color = '#FF453A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#FF3B30';
                  }}
                >
                  <IconLogout size={18} stroke={1.5} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Wedding Title */}
        <div className="header-center absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="couple-names wedding-names text-white text-xl sm:text-2xl" style={{
            fontFamily: '"Great Vibes", cursive',
            fontWeight: '400',
            letterSpacing: '0.02em',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased'
          }} data-wedding-names="true">
            {settings.app_name || 'Tim & Kirsten'}
          </h1>
          <p className="text-white/60 text-xs sm:text-sm">
            {new Date(settings.wedding_date).toLocaleDateString('en-AU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Right: Notifications */}
        <div className="flex items-center">
          <NotificationBell />
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </header>
  );
};

export default UniversalHeader;
