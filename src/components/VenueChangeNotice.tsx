import React, { useState } from 'react';
import { AlertCircle, X, MapPin, Bus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VenueChangeNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="relative mb-6"
      >
        <div 
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 154, 0, 0.2) 0%, rgba(251, 105, 98, 0.15) 50%, rgba(255, 107, 107, 0.18) 100%)',
            backdropFilter: 'blur(30px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 149, 0, 0.25)',
            borderLeft: '4px solid #FF9500',
            boxShadow: `
              0 8px 32px rgba(255, 149, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.35),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05)
            `
          }}
        >
          <div className="flex items-start gap-3 p-4">
            <div 
              className="flex-shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 149, 0, 0.2) 0%, rgba(255, 149, 0, 0.1) 100%)',
                border: '1px solid rgba(255, 149, 0, 0.3)'
              }}
            >
              <AlertCircle className="w-5 h-5" style={{ color: '#FF9500' }} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#000000', fontSize: '18px' }}>
                <MapPin className="w-4 h-4" style={{ color: '#FF9500' }} />
                Important Venue Update
              </h3>
              
              <div className="space-y-2 text-sm" style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                <p>
                  <span className="font-medium" style={{ color: '#000000' }}>Venue changed from The Edwards to Ben Ean</span> due to the original venue going into liquidation in February 2025.
                </p>
                
                <div 
                  className="flex items-start gap-2 p-3 mt-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <Bus className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#FF9500' }} />
                  <div>
                    <p className="font-medium text-xs mb-1" style={{ color: '#000000' }}>Coach Transport Available</p>
                    <p className="text-xs" style={{ color: 'rgba(0, 0, 0, 0.7)' }}>We've arranged coach transport to help with the change. Thank you for your understanding!</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Dismiss notice"
            >
              <X className="w-5 h-5" style={{ color: 'rgba(0, 0, 0, 0.6)' }} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VenueChangeNotice;