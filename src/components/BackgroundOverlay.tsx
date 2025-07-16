import React from 'react';

const BackgroundOverlay: React.FC = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        pointerEvents: 'none',
        zIndex: -1
      }}
    />
  );
};

export default BackgroundOverlay;