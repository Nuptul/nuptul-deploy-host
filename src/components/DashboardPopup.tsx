import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { DashboardRouter } from './dashboard/DashboardRouter';

interface DashboardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'guest' | 'admin' | 'couple' | null;
}

const DashboardPopup: React.FC<DashboardPopupProps> = ({ isOpen, onClose, userRole: propUserRole }) => {
  const navigate = useNavigate();
  const { userRole, user, loading } = useAuth();
  
  
  
  useKeyboardShortcuts({ isOpen, onClose });


  useEffect(() => {
    if (isOpen) {
      // For now, allow guest dashboards without authentication
      if (!user && !loading) {
        
        // Don't redirect to auth, allow guest dashboard to show
      }
      
      // Prevent body scroll when dashboard opens
      document.body.classList.add('dashboard-open');
    } else {
      // Re-enable body scroll when dashboard closes
      document.body.classList.remove('dashboard-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('dashboard-open');
    };
  }, [isOpen, userRole, user, loading, navigate, onClose]);

  if (!isOpen) {
    return null;
  }
  
  // Allow guest dashboard to show even without authentication
  if (loading) {
    return null; // Still loading, don't render yet
  }

  
  return (
    <>
      {/* Enhanced backdrop overlay with proper z-index */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        style={{ 
          zIndex: 9999,
          display: 'block',
          pointerEvents: 'auto'
        }}
        onClick={onClose}
        role="button"
        aria-label="Close dashboard"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
      />
      
      {/* Fixed positioned dashboard popup - properly centered */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ 
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      >
        <div 
          className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1f2937 0%, #111827 100%)',
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: `
              0 30px 60px rgba(0, 0, 0, 0.5),
              0 20px 40px rgba(0, 0, 0, 0.4),
              inset 0 1px 2px rgba(255, 255, 255, 0.1),
              inset 0 -1px 2px rgba(0, 0, 0, 0.5)
            `,
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dashboard-title"
        >
          {/* Use the new DashboardRouter for role-based routing */}
          <DashboardRouter onClose={onClose} />
        </div>
      </div>
    </>
  );
};

export default DashboardPopup;