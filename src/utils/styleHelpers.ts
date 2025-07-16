import { typographySystem, textStyles } from '@/styles/typography-system';
import { iconSystem } from '@/styles/icon-system';
import { glassSystem, applyLiquidGlass } from '@/styles/glass-system';

// ===========================================
// TYPOGRAPHY HELPERS
// ===========================================

// Get couple names style (Great Vibes)
export const getCoupleNamesStyle = (size: 'hero' | 'large' | 'medium' | 'small' = 'large') => {
  const sizeMap = {
    hero: '60px',    // Hero sections
    large: '48px',   // Page headers
    medium: '36px',  // Section headers
    small: '28px',   // Card headers
  };

  return {
    fontFamily: '"Great Vibes", cursive',
    fontSize: sizeMap[size],
    fontWeight: 400,
    color: '#000000',
    lineHeight: 1.2,
    letterSpacing: '0.02em',
    textRendering: 'optimizeLegibility' as const,
    WebkitFontSmoothing: 'antialiased' as const,
  };
};

// Get heading style (Bodoni Moda)
export const getHeadingStyle = (level: 1 | 2 | 3 | 4 | 5 | 6 = 1) => {
  const sizeMap = {
    1: '32px',
    2: '28px',
    3: '24px',
    4: '20px',
    5: '18px',
    6: '16px',
  };

  return {
    fontFamily: '"Bodoni Moda", serif',
    fontSize: sizeMap[level],
    fontWeight: level <= 2 ? 600 : 500,
    color: '#000000',
    lineHeight: 1.3,
    letterSpacing: '0.02em',
    textRendering: 'optimizeLegibility' as const,
    WebkitFontSmoothing: 'antialiased' as const,
  };
};

// Get body text style (Montserrat)
export const getBodyStyle = (
  size: 'large' | 'medium' | 'small' = 'medium',
  muted: boolean = false
) => {
  const sizeMap = {
    large: '18px',
    medium: '16px',
    small: '14px',
  };

  return {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: sizeMap[size],
    fontWeight: 400,
    color: muted ? 'rgba(0, 0, 0, 0.6)' : '#000000',
    lineHeight: 1.6,
  };
};

// Get button text style
export const getButtonStyle = (size: 'large' | 'medium' | 'small' = 'medium') => {
  const sizeMap = {
    large: '18px',
    medium: '16px',
    small: '14px',
  };

  return {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: sizeMap[size],
    fontWeight: 600,
    letterSpacing: '0.02em',
    textTransform: 'none' as const,
  };
};

// ===========================================
// GLASS EFFECT HELPERS
// ===========================================

// Get glass background with soft pastel tint (matching screenshot)
export const getGlassStyle = (
  tint: 'light' | 'blue' | 'purple' | 'coral' | 'gradient' = 'gradient',
  intensity: 'light' | 'medium' | 'strong' = 'medium'
) => {
  const tintMap = {
    light: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
    blue: 'linear-gradient(135deg, rgba(173, 216, 230, 0.35) 0%, rgba(135, 206, 235, 0.25) 100%)',
    purple: 'linear-gradient(135deg, rgba(221, 160, 221, 0.35) 0%, rgba(216, 191, 216, 0.25) 100%)',
    coral: 'linear-gradient(135deg, rgba(255, 182, 193, 0.35) 0%, rgba(255, 192, 203, 0.25) 100%)',
    gradient: 'linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, rgba(221, 160, 221, 0.25) 25%, rgba(255, 182, 193, 0.2) 50%, rgba(255, 218, 185, 0.25) 75%, rgba(176, 224, 230, 0.3) 100%)',
  };

  const blurMap = {
    light: '20px',
    medium: '25px',
    strong: '35px',
  };

  return {
    background: tintMap[tint],
    backdropFilter: `blur(${blurMap[intensity]}) saturate(1.8)`,
    WebkitBackdropFilter: `blur(${blurMap[intensity]}) saturate(1.8)`,
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 12px 40px rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
  };
};

// Get liquid glass background with animated effects
export const getLiquidGlassStyle = (
  tint: 'light' | 'blue' | 'purple' | 'coral' | 'gradient' = 'gradient',
  liquidIntensity: 'subtle' | 'medium' | 'strong' = 'medium',
  intensity: 'light' | 'medium' | 'strong' = 'medium'
) => {
  const baseGlass = getGlassStyle(tint, intensity);
  
  const liquidMap = {
    subtle: {
      backgroundSize: '400% 400%',
      animation: 'liquidShift 20s ease-in-out infinite',
    },
    medium: {
      backgroundSize: '600% 600%',
      animation: 'liquidShift 15s ease-in-out infinite',
    },
    strong: {
      backgroundSize: '800% 800%',
      animation: 'liquidShift 10s ease-in-out infinite',
    },
  };
  
  return {
    ...baseGlass,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...liquidMap[liquidIntensity],
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at 30% 70%, rgba(221, 160, 221, 0.2) 0%, transparent 60%)',
      backgroundSize: '200% 200%',
      animation: 'liquidBubble 6s ease-in-out infinite',
      pointerEvents: 'none',
      borderRadius: 'inherit',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.15) 0%, transparent 50%)',
      backgroundSize: '180% 180%',
      animation: 'liquidBubble 7s ease-in-out infinite reverse',
      pointerEvents: 'none',
      borderRadius: 'inherit',
    },
  };
};

// Get glass button style
export const getGlassButtonStyle = (
  variant: 'primary' | 'secondary' | 'ghost' = 'primary',
  size: 'large' | 'medium' | 'small' = 'medium'
) => {
  const sizeMap = {
    large: { minHeight: '52px', padding: '14px 24px', fontSize: '18px' },
    medium: { minHeight: '48px', padding: '12px 20px', fontSize: '16px' },
    small: { minHeight: '36px', padding: '8px 16px', fontSize: '14px' },
  };

  const variantMap = {
    primary: {
      background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.8) 0%, rgba(152, 255, 208, 0.7) 50%, rgba(255, 182, 193, 0.75) 100%)',
      color: '#FFFFFF',
      boxShadow: '0 4px 16px rgba(135, 206, 235, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    },
    secondary: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
      color: '#000000',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
    },
    ghost: {
      background: 'transparent',
      color: '#000000',
      boxShadow: 'none',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  };

  return {
    ...sizeMap[size],
    ...variantMap[variant],
    ...getButtonStyle(size),
    backdropFilter: 'blur(10px) saturate(2)',
    WebkitBackdropFilter: 'blur(10px) saturate(2)',
    border: variant !== 'ghost' ? '1px solid rgba(255, 255, 255, 0.3)' : undefined,
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };
};

// ===========================================
// ICON HELPERS
// ===========================================

// Get icon style with consistent sizing
export const getIconStyle = (
  size: keyof typeof iconSystem.sizes = 'md',
  color: 'primary' | 'muted' | 'inverse' | 'brand' = 'primary',
  brandColor?: keyof typeof iconSystem.colors
) => {
  const colorMap = {
    primary: iconSystem.colors.primary,
    muted: iconSystem.colors.primaryMuted,
    inverse: iconSystem.colors.inverse,
    brand: brandColor ? iconSystem.colors[brandColor as keyof typeof iconSystem.colors] : iconSystem.colors.primary,
  };

  return {
    width: iconSystem.sizes[size],
    height: iconSystem.sizes[size],
    color: colorMap[color],
    flexShrink: 0,
  };
};

// ===========================================
// RESPONSIVE HELPERS
// ===========================================

// Get responsive text size
export const getResponsiveTextSize = (desktop: string, mobile: string) => ({
  fontSize: mobile,
  '@media (min-width: 640px)': {
    fontSize: desktop,
  },
});

// ===========================================
// COMPONENT STYLE PRESETS
// ===========================================

export const stylePresets = {
  // Page container with glass effect
  pageContainer: {
    minHeight: '100vh',
    padding: '24px',
    ...getGlassStyle('gradient', 'light'),
  },

  // Card with glass effect
  glassCard: {
    padding: '24px',
    borderRadius: '24px',
    ...getGlassStyle('light', 'medium'),
  },
  
  // Card with liquid glass effect
  liquidGlassCard: {
    padding: '24px',
    borderRadius: '24px',
    ...getLiquidGlassStyle('gradient', 'medium', 'medium'),
  },

  // Modal/Dialog styling
  glassModal: {
    padding: '32px',
    borderRadius: '24px',
    ...getGlassStyle('gradient', 'strong'),
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
  
  // Modal with liquid effect
  liquidGlassModal: {
    padding: '32px',
    borderRadius: '24px',
    ...getLiquidGlassStyle('gradient', 'medium', 'strong'),
    maxWidth: '90vw',
    maxHeight: '90vh',
  },

  // Input field styling
  glassInput: {
    ...getBodyStyle('medium'),
    padding: '12px 16px',
    borderRadius: '12px',
    minHeight: '48px',
    ...getGlassStyle('light', 'light'),
  },

  // Navigation item
  navItem: {
    ...getBodyStyle('small'),
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  
  // Liquid glass button
  liquidGlassButton: {
    ...getButtonStyle('medium'),
    padding: '12px 24px',
    borderRadius: '12px',
    minHeight: '48px',
    ...getLiquidGlassStyle('gradient', 'subtle', 'medium'),
  },
};