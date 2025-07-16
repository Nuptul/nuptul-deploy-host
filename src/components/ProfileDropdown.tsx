import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = async (action: string) => {
    setIsOpen(false);
    
    switch (action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'help':
        navigate('/help');
        break;
      case 'signout':
        await signOut();
        navigate('/auth');
        break;
    }
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.display_name) {
      const names = profile.display_name.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const renderProfileAvatar = () => {
    const avatarUrl = profile?.avatar_url || profile?.profile_picture_url;
    
    if (avatarUrl) {
      return (
        <div style={{ position: 'relative', width: '32px', height: '32px' }}>
          <img 
            src={avatarUrl} 
            alt="Profile"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
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
            className="profile-avatar"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            {getInitials()}
          </div>
        </div>
      );
    }
    
    return (
      <div
        className="profile-avatar"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600',
          fontSize: '14px'
        }}
      >
        {getInitials()}
      </div>
    );
  };

  return (
    <>
      {/* Profile Button */}
      <button
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #f5ede4, #e8e0d7)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isOpen
            ? 'inset 2px 2px 5px rgba(163, 155, 146, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.7)'
            : '6px 6px 12px rgba(163, 155, 146, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.7), inset 1px 1px 3px rgba(255, 255, 255, 0.6), inset -1px -1px 3px rgba(163, 155, 146, 0.2)',
          transition: 'all 0.2s ease',
          zIndex: 1001,
          transform: isOpen ? 'scale(0.95)' : 'scale(1)'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {renderProfileAvatar()}
      </button>

      {/* Profile Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div
            className="profile-dropdown"
            style={{
              position: 'fixed',
              top: '70px',
              right: '20px',
              background: 'linear-gradient(145deg, #f5ede4, #e8e0d7)',
              borderRadius: '16px',
              padding: '6px',
              boxShadow: `
                8px 8px 16px rgba(163, 155, 146, 0.4),
                -8px -8px 16px rgba(255, 255, 255, 0.7),
                inset 1px 1px 2px rgba(255, 255, 255, 0.6),
                inset -1px -1px 2px rgba(163, 155, 146, 0.2)
              `,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              zIndex: 1000,
              minWidth: '180px',
              maxWidth: 'calc(100vw - 40px)',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            {/* Arrow */}
            <div
              style={{
                position: 'absolute',
                top: '-6px',
                right: '18px',
                width: '12px',
                height: '12px',
                background: 'linear-gradient(135deg, #f5ede4 0%, #e8e0d7 50%)',
                transform: 'rotate(45deg)',
                borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            />
            
            {/* Profile Info */}
            <div
              className="profile-info"
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid rgba(163, 155, 146, 0.2)',
                textAlign: 'center'
              }}
            >
              <div
                className="profile-name"
                style={{
                  fontWeight: '600',
                  color: '#2d3f51',
                  fontSize: '14px',
                  marginBottom: '4px',
                  lineHeight: '1.2'
                }}
              >
                {getDisplayName()}
              </div>
              <div
                className="profile-email"
                style={{
                  fontSize: '11px',
                  color: '#7a736b',
                  wordBreak: 'break-all'
                }}
              >
                {user?.email}
              </div>
            </div>

            {/* Menu Items */}
            <div className="profile-menu" style={{ padding: '4px 0' }}>
              <button
                className="profile-menu-item touch-target"
                onClick={() => handleMenuClick('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  color: '#5a5651',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  minHeight: '44px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                My Profile
              </button>

              <button
                className="profile-menu-item"
                onClick={() => handleMenuClick('settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  color: '#5a5651',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                </svg>
                Settings
              </button>

              <button
                className="profile-menu-item"
                onClick={() => handleMenuClick('help')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  color: '#5a5651',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                Help & Support
              </button>

              <button
                className="profile-menu-item"
                onClick={() => handleMenuClick('signout')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  color: '#5a5651',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  marginTop: '4px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(163, 155, 146, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

    </>
  );
};

export default ProfileDropdown;