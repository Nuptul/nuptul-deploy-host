import React from 'react';

interface AuthHeaderProps {
  mode: 'signin' | 'signup';
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ mode }) => {
  return (
    <div className="text-center mb-6 sm:mb-8">
      {/* Logo positioned above heading */}
      <div className="flex justify-center mb-4">
        <img 
          src="https://iwmfxcrzzwpmxomydmuq.storage.supabase.co/v1/object/public/home-hero//logo.png" 
          alt="Wedding Logo" 
          className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
        />
      </div>
      
      {/* Main couple heading - Premium Calligraphy Style */}
      <h1 className="couple-names wedding-names text-5xl sm:text-6xl mb-4" style={{ 
        fontFamily: '"Great Vibes", cursive',
        color: '#000000',
        fontWeight: '400',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        letterSpacing: '0.02em',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased'
      }} data-wedding-names="true">
        Tim & Kirsten
      </h1>
      
      {/* Welcome text */}
      <h2 className="text-xl sm:text-2xl mb-2" style={{
        fontFamily: '"Bodoni Moda", serif',
        fontWeight: '600',
        color: '#000000'
      }}>
        Welcome To Our Wedding
      </h2>
      <p className="text-base max-w-md mx-auto" style={{
        color: 'rgba(0, 0, 0, 0.6)',
        fontFamily: '"Montserrat", sans-serif'
      }}>
        Sign in to interact with Tim, Kirsten, and their guests.
      </p>
    </div>
  );
};