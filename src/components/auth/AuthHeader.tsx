import React from 'react';

interface AuthHeaderProps {
  mode: 'signin' | 'signup';
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ mode }) => {
  return (
    <div className="text-center mb-6 sm:mb-8">
      {/* Nuptul Logo positioned above heading - Much Larger */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <img
            src="/nuptul-logo.png"
            alt="Nuptul - Wedding Management Platform"
            className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain transition-all duration-300 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 8px 24px rgba(0, 102, 204, 0.3))',
            }}
          />
          {/* Enhanced glow effect for larger logo */}
          <div
            className="absolute inset-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full opacity-25 blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(0, 102, 204, 0.4) 0%, rgba(0, 102, 204, 0.2) 50%, transparent 70%)',
            }}
          />
        </div>
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