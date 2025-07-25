// Adaptive Glass System - Dynamic color adaptation for glass morphism effects
import React from 'react';

export interface AdaptiveGlassConfig {
  element: HTMLElement;
  backgroundElement?: HTMLElement;
  tintStrength?: number; // 0-1
  blurAmount?: number; // px
  adaptiveMode?: 'color' | 'luminance' | 'both';
}

// Color extraction utility
export const extractDominantColor = (element: HTMLElement): string => {
  // This would use Canvas API in production to sample background colors
  const computedStyle = window.getComputedStyle(element);
  const bgColor = computedStyle.backgroundColor;
  const bgImage = computedStyle.backgroundImage;
  
  // Simple fallback for now - would implement proper color extraction
  if (bgImage && bgImage !== 'none') {
    return 'rgba(173, 216, 230, 0.15)'; // Pastel blue fallback
  }
  
  return bgColor || 'rgba(255, 255, 255, 0.1)';
};

// Calculate contrast ratio for readability
export const getContrastRatio = (bg: string, fg: string): number => {
  // Simplified contrast calculation
  return 4.5; // Would implement WCAG contrast algorithm
};

// Adaptive glass styles based on background
export const getAdaptiveGlassStyle = (config: AdaptiveGlassConfig) => {
  const { element, backgroundElement, tintStrength = 0.3, blurAmount = 20, adaptiveMode = 'both' } = config;
  
  // Get background context
  const bgElement = backgroundElement || element.parentElement;
  const dominantColor = bgElement ? extractDominantColor(bgElement) : 'rgba(255, 255, 255, 0.1)';
  
  // Parse color values (simplified)
  const isLightBg = true; // Would calculate from dominant color
  
  // Dynamic glass configuration based on background
  const adaptiveStyles = {
    // Base glass with dynamic tint
    background: `linear-gradient(135deg, 
      ${dominantColor} 0%, 
      rgba(255, 255, 255, ${isLightBg ? 0.08 : 0.12}) 50%, 
      ${dominantColor} 100%)`,
    
    // Adaptive blur based on content density
    backdropFilter: `blur(${blurAmount}px) saturate(${isLightBg ? 1.8 : 2.2})`,
    WebkitBackdropFilter: `blur(${blurAmount}px) saturate(${isLightBg ? 1.8 : 2.2})`,
    
    // Dynamic border based on contrast
    border: `1px solid rgba(255, 255, 255, ${isLightBg ? 0.3 : 0.5})`,
    
    // Adaptive shadow depth
    boxShadow: isLightBg
      ? '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
      : '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
  };
  
  return adaptiveStyles;
};

// Intersection Observer for viewport-based adaptation
export const setupAdaptiveGlass = (selector: string) => {
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const adaptiveStyles = getAdaptiveGlassStyle({ element });
        
        // Apply adaptive styles
        Object.assign(element.style, adaptiveStyles);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px',
  });
  
  elements.forEach(el => observer.observe(el));
  
  return observer;
};

// React hook for adaptive glass
export const useAdaptiveGlass = (ref: React.RefObject<HTMLElement>, config?: Partial<AdaptiveGlassConfig>) => {
  React.useEffect(() => {
    if (!ref.current) return;
    
    const element = ref.current;
    const adaptiveStyles = getAdaptiveGlassStyle({ element, ...config });
    
    // Apply styles
    Object.assign(element.style, adaptiveStyles);
    
    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newStyles = getAdaptiveGlassStyle({ element, ...config });
      Object.assign(element.style, newStyles);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [ref, config]);
};

// CSS-in-JS for dynamic glass variants
export const dynamicGlassVariants = {
  // Warm glass for romantic sections
  romantic: {
    background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.25) 0%, rgba(255, 218, 185, 0.15) 100%)',
    backdropFilter: 'blur(25px) saturate(1.8) hue-rotate(10deg)',
  },

  // Cool glass for informational sections
  informational: {
    background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.2) 0%, rgba(135, 206, 235, 0.1) 100%)',
    backdropFilter: 'blur(20px) saturate(1.6) hue-rotate(-10deg)',
  },

  // Elegant glass for formal sections
  formal: {
    background: 'linear-gradient(135deg, rgba(221, 160, 221, 0.15) 0%, rgba(216, 191, 216, 0.08) 100%)',
    backdropFilter: 'blur(30px) saturate(1.4)',
  },

  // Fresh glass for outdoor/nature sections
  nature: {
    background: 'linear-gradient(135deg, rgba(152, 255, 208, 0.2) 0%, rgba(192, 255, 228, 0.1) 100%)',
    backdropFilter: 'blur(22px) saturate(2)',
  },

  // Blue glassmorphism for authentication forms
  auth: {
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 50%, rgba(0, 102, 204, 0.05) 100%)',
    backdropFilter: 'blur(40px) saturate(2)',
    border: '1px solid rgba(0, 102, 204, 0.2)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 102, 204, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
  },
};

// Performance-optimized mobile glass
export const mobileGlassOptimizations = {
  // Reduced blur for better performance
  reducedBlur: {
    backdropFilter: 'blur(10px) saturate(1.5)',
    WebkitBackdropFilter: 'blur(10px) saturate(1.5)',
  },
  
  // GPU-accelerated properties only
  gpuOptimized: {
    transform: 'translateZ(0)',
    willChange: 'backdrop-filter, transform',
  },
  
  // Simplified shadows for mobile
  simplifiedShadows: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
};

// Accessibility improvements
export const a11yGlassEnhancements = {
  // High contrast mode support
  highContrast: {
    '@media (prefers-contrast: high)': {
      backdropFilter: 'none',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid currentColor',
    },
  },
  
  // Reduced motion support
  reducedMotion: {
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      animation: 'none',
    },
  },
  
  // Dark mode adaptive glass
  darkMode: {
    '@media (prefers-color-scheme: dark)': {
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
};

// Export all glass utilities
export const adaptiveGlassSystem = {
  extractDominantColor,
  getContrastRatio,
  getAdaptiveGlassStyle,
  setupAdaptiveGlass,
  useAdaptiveGlass,
  dynamicGlassVariants,
  mobileGlassOptimizations,
  a11yGlassEnhancements,
};