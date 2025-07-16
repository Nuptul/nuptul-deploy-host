import React from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';

const DynamicHeroSection: React.FC = () => {
  const { settings, loading } = useAppSettings();

  if (loading) {
    return (
      <div className="glass-card mb-6 sm:mb-8 lg:mb-10 text-center relative overflow-hidden animate-fade-up"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          borderRadius: '20px',
          padding: '40px 20px',
          boxShadow: '20px 20px 40px rgba(163, 155, 146, 0.3), -20px -20px 40px rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.4)'
        }}>
        <div className="animate-pulse">
          <div className="h-16 bg-glass-blue/20 rounded mb-4"></div>
          <div className="h-8 bg-glass-blue/20 rounded mb-2"></div>
          <div className="h-4 bg-glass-blue/20 rounded"></div>
        </div>
      </div>
    );
  }

  const weddingDate = new Date(settings.wedding_date);
  const formattedDate = weddingDate.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="glass-card mb-6 sm:mb-8 lg:mb-10 text-center relative overflow-hidden animate-fade-up"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderRadius: '20px',
        padding: '40px 20px',
        boxShadow: '20px 20px 40px rgba(163, 155, 146, 0.3), -20px -20px 40px rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}>
      <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-5 flex justify-center gap-2">
        💕
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-dolly font-bold text-wedding-navy mb-3 sm:mb-4 tracking-tight bg-gradient-to-r from-glass-blue to-glass-purple bg-clip-text text-transparent">
        {settings.app_name}
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-glass-blue mb-3 sm:mb-4 font-dolly font-medium">
        {formattedDate}
      </p>
      <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        {settings.hero_subtitle}
      </p>
    </div>
  );
};

export default DynamicHeroSection;