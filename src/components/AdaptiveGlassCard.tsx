import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAdaptiveGlass, dynamicGlassVariants, mobileGlassOptimizations } from '@/styles/adaptive-glass-system';

interface AdaptiveGlassCardProps {
  children: React.ReactNode;
  variant?: 'auto' | 'romantic' | 'informational' | 'formal' | 'nature' | 'auth';
  className?: string;
  adaptToBackground?: boolean;
  mobileOptimized?: boolean;
  onClick?: () => void;
  backgroundImageUrl?: string;
  tintColor?: string;
  glowOnHover?: boolean;
}

const AdaptiveGlassCard: React.FC<AdaptiveGlassCardProps> = ({
  children,
  variant = 'auto',
  className,
  adaptToBackground = true,
  mobileOptimized = true,
  onClick,
  backgroundImageUrl,
  tintColor,
  glowOnHover = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dominantColor, setDominantColor] = useState<string>('rgba(255, 255, 255, 0.1)');
  const [isInView, setIsInView] = useState(false);

  // Use adaptive glass hook
  useAdaptiveGlass(cardRef, {
    adaptiveMode: 'both',
    tintStrength: 0.3,
  });

  // Intersection observer for performance
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Extract colors from background if provided
  useEffect(() => {
    if (backgroundImageUrl && isInView) {
      // In production, this would use Canvas API to extract colors
      // For now, we'll use predefined tints based on image characteristics
      const imageTints = {
        'nature': 'rgba(152, 255, 208, 0.15)',
        'romantic': 'rgba(255, 182, 193, 0.15)',
        'formal': 'rgba(221, 160, 221, 0.15)',
        'auth': 'rgba(0, 102, 204, 0.15)',
        'default': 'rgba(173, 216, 230, 0.15)',
      };
      
      setDominantColor(imageTints[variant] || imageTints.default);
    }
  }, [backgroundImageUrl, variant, isInView]);

  // Dynamic styles based on variant and adaptability
  const getVariantStyles = () => {
    if (variant === 'auto' && adaptToBackground) {
      return {
        background: `linear-gradient(135deg, 
          ${dominantColor} 0%, 
          rgba(255, 255, 255, 0.08) 50%, 
          ${dominantColor} 100%)`,
      };
    }
    
    return variant !== 'auto' ? dynamicGlassVariants[variant] : {};
  };

  // Mobile optimizations
  const getMobileStyles = () => {
    if (!mobileOptimized) return {};
    
    const isMobile = window.innerWidth <= 768;
    return isMobile ? mobileGlassOptimizations.reducedBlur : {};
  };

  // Glow effect on hover
  const glowStyles = glowOnHover ? {
    '--glow-color': tintColor || dominantColor,
    '--glow-spread': '20px',
    '--glow-opacity': '0',
  } as React.CSSProperties : {};

  return (
    <div
      ref={cardRef}
      className={cn(
        // Base classes
        'relative overflow-hidden rounded-2xl transition-all duration-300',
        
        // Glass effect base
        'backdrop-blur-xl border border-white/20',
        
        // Performance optimizations
        'will-change-[backdrop-filter,transform] transform-gpu',
        
        // Hover effects
        glowOnHover && 'hover:shadow-[0_0_var(--glow-spread)_var(--glow-color)] hover:[--glow-opacity:0.3]',
        
        // Click effects
        onClick && 'cursor-pointer active:scale-[0.98]',
        
        // Custom className
        className
      )}
      onClick={onClick}
      style={{
        ...getVariantStyles(),
        ...getMobileStyles(),
        ...glowStyles,
      }}
    >
      {/* Animated gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, ${dominantColor} 0%, transparent 70%)`,
          animation: isInView ? 'float 20s ease-in-out infinite' : 'none',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle inner border for depth */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
    </div>
  );
};

export default AdaptiveGlassCard;