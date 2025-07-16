import React, { useState, useEffect } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import SocialPage from '@/pages/social/SocialPage';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';

interface SocialPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocialPopup: React.FC<SocialPopupProps> = ({ isOpen, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  useKeyboardShortcuts({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when popup opens
      document.body.classList.add('social-popup-open');
    } else {
      // Re-enable body scroll when popup closes
      document.body.classList.remove('social-popup-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('social-popup-open');
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Enhanced backdrop overlay with proper z-index */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ 
          zIndex: 9999,
          display: 'block',
          pointerEvents: 'auto'
        }}
        onClick={onClose}
        role="button"
        aria-label="Close social"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
      />
      
      {/* Fixed positioned social popup - properly centered */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ 
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      >
        <div 
          className={`bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl relative transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded
              ? 'w-[98vw] h-[98vh]'
              : 'w-[95vw] h-[90vh] max-w-6xl'
          }`}
          style={{
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="social-title"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute top-2 right-14 z-50 p-2 rounded-full bg-black/5 hover:bg-black/10 text-black/60 hover:text-black/90 transition-colors h-8 w-8"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>

          {/* Social content */}
          <div className="w-full h-full flex flex-col">
            <SocialPage isPopup={true} onClose={onClose} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialPopup;