import React from 'react';
import { IconHanger2, IconUserCircle, IconMan, IconMusic } from '@tabler/icons-react';

const DressCodeCard: React.FC = () => {
  

  return (
    <div 
      className="p-8 transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.15) 0%, rgba(142, 68, 173, 0.1) 50%, rgba(255, 107, 107, 0.12) 100%)',
        backdropFilter: 'blur(20px) saturate(2)',
        WebkitBackdropFilter: 'blur(20px) saturate(2)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.12),
          inset 0 1px 1px rgba(255, 255, 255, 0.35),
          inset 0 -1px 1px rgba(0, 0, 0, 0.05)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Liquid glass accent */}
      <div 
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-30%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
          }}
        >
          <IconHanger2 size={28} className="text-white" stroke={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>Attire</h2>
          <p className="text-lg font-semibold" style={{ color: '#007AFF' }}>Dapper / Cocktail</p>
        </div>
      </div>
      
      <div className="space-y-4 relative z-10">
        <p className="text-lg" style={{ color: 'rgba(0, 0, 0, 0.8)', lineHeight: '1.6' }}>
          We'd love to see our friends and family get dressed up with us!
        </p>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0, 122, 255, 0.1)' }}>
              <IconUserCircle size={20} style={{ color: '#007AFF' }} stroke={1.5} />
            </div>
            <p className="text-base" style={{ color: 'rgba(0, 0, 0, 0.75)' }}>
              <span className="font-semibold" style={{ color: '#000000' }}>Ladies:</span> Classy dress, pantsuit or jumpsuit
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0, 122, 255, 0.1)' }}>
              <IconMan size={20} style={{ color: '#007AFF' }} stroke={1.5} />
            </div>
            <p className="text-base" style={{ color: 'rgba(0, 0, 0, 0.75)' }}>
              <span className="font-semibold" style={{ color: '#000000' }}>Gentlemen:</span> Suits, dress chinos, button up shirt and optional tie. We love a pocket kerchief!
            </p>
          </div>
        </div>
        
        <div 
          className="mt-6 p-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.04) 100%)',
            border: '1px solid rgba(0, 122, 255, 0.2)'
          }}
        >
          <div className="flex items-center gap-3">
            <IconMusic size={20} style={{ color: '#007AFF' }} stroke={1.5} />
            <p className="text-base font-medium" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
              Dress to impress but keep it comfortable for dancing!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DressCodeCard;