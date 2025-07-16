import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRSVPStatus } from '@/hooks/useRSVPStatus';
import { IconCalendar, IconHeart, IconCheck } from '@tabler/icons-react';

interface RSVPCallToActionProps {
  onRSVPClick?: () => void;
}

const RSVPCallToAction: React.FC<RSVPCallToActionProps> = ({ onRSVPClick }) => {
  const { user, userRole } = useAuth();
  const { needsRSVP, loading } = useRSVPStatus();
  
  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'couple';
  
  // Don't show for admins or if user is not logged in
  if (!user || isAdmin || loading) {
    return null;
  }
  
  const handleRSVPClick = () => {
    onRSVPClick?.();
  };
  
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
      {needsRSVP ? (
        // Show RSVP button for guests who haven't RSVP'd
        <div className="text-center">
          <p 
            className="text-sm sm:text-base mb-4"
            style={{
              fontFamily: '"Montserrat", sans-serif',
              color: 'rgba(0, 0, 0, 0.7)',
              letterSpacing: '0.02em'
            }}
          >
            We can't wait to celebrate with you!
          </p>
          <button
            onClick={handleRSVPClick}
            className="group relative px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
              color: '#FFFFFF',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: '600',
              fontSize: '18px',
              letterSpacing: '0.05em',
              minHeight: '56px',
              boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0051D5 0%, #003D9D 100%)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)';
            }}
          >
            <div className="flex items-center gap-3 relative z-10">
              <IconCalendar size={20} stroke={1.5} />
              <span>RSVP Now</span>
              <IconHeart size={20} stroke={1.5} className="animate-pulse" style={{ color: '#FF6B6B' }} />
            </div>
            
            {/* Glass shimmer effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.2) 50%, transparent 60%)',
                animation: 'shimmer 1.5s ease-out'
              }}
            />
          </button>
        </div>
      ) : (
        // Show confirmation for guests who have RSVP'd
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <IconCheck size={20} style={{ color: '#34C759' }} stroke={1.5} />
            <span 
              className="text-sm sm:text-base"
              style={{
                fontFamily: '"Montserrat", sans-serif',
                color: 'rgba(0, 0, 0, 0.7)',
                fontWeight: '500'
              }}
            >
              Thank you for your RSVP!
            </span>
          </div>
          <p 
            className="text-xs sm:text-sm"
            style={{
              fontFamily: '"Montserrat", sans-serif',
              color: 'rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.02em'
            }}
          >
            We look forward to celebrating with you
          </p>
        </div>
      )}
    </div>
  );
};

export default RSVPCallToAction;