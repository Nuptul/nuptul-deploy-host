/**
 * Nuptul Design System
 *
 * A comprehensive design system inspired by the actual Nuptul logo:
 * - Red heart (romantic, warm red tones)
 * - Glossy black "nuptul" text (sophisticated black with shine effects)
 * - Two glass-looking rings (translucent, crystal-like elements)
 *
 * This system embraces the logo's romantic, elegant, and glass-like aesthetic.
 */

// Color Palette - Directly inspired by the Nuptul logo elements
export const nuptulColors = {
  // Heart Red - The deep, glossy red from the logo's heart
  heart: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#dc2626', // Main heart red (deep, rich red like logo)
    600: '#b91c1c',
    700: '#991b1b',
    800: '#7f1d1d',
    900: '#651818',
    950: '#450a0a'
  },

  // Ring Gray - The sophisticated charcoal/metallic from the interlocking rings
  ring: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569', // Main ring color (sophisticated charcoal like logo)
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },

  // Script Black - The elegant black from the "Nuptul" typography
  script: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717', // Main script black (elegant like logo text)
    950: '#0a0a0a'
  },

  // Supporting Colors - Elegant neutrals and accents
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  },

  // Romantic accent - Soft complement to the heart red
  romantic: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724'
  }
};

// Glass Effects - Sophisticated glassmorphism inspired by the logo's metallic rings
export const glassEffects = {
  // Primary glass card - main content areas (inspired by the logo's ring metallic finish)
  primary: {
    background: 'rgba(71, 85, 105, 0.15)', // Ring gray with transparency
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
  },

  // Secondary glass - lighter elements
  secondary: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
  },

  // Heart accent glass - special highlights with heart red
  heart: {
    background: 'rgba(220, 38, 38, 0.12)', // Heart red tint
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(220, 38, 38, 0.25)',
    borderRadius: '14px',
    boxShadow: '0 6px 24px rgba(220, 38, 38, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
  },

  // Ring metallic - sophisticated charcoal glass effect
  ring: {
    background: 'rgba(51, 65, 85, 0.18)',
    backdropFilter: 'blur(18px)',
    border: '1px solid rgba(51, 65, 85, 0.35)',
    borderRadius: '14px',
    boxShadow: '0 6px 28px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
  }
};

// Typography System - Inspired by Nuptul logo's clean, modern aesthetic
export const nuptulTypography = {
  fontFamilies: {
    heading: '"Inter", "SF Pro Display", -apple-system, sans-serif', // Clean, modern sans-serif
    body: '"Inter", "SF Pro Text", -apple-system, sans-serif', // Consistent with heading
    script: '"Great Vibes", "Dancing Script", "Brush Script MT", cursive', // Elegant script like logo "Nuptul" text
    accent: '"Playfair Display", "Georgia", serif', // Sophisticated serif for special content
    display: '"Poppins", "Inter", sans-serif', // Bold display font for impact
    mono: '"JetBrains Mono", "SF Mono", monospace' // Monospace for code/data
  },
  
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },
  
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  
  lineHeights: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

// Spacing System
export const nuptulSpacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
  '4xl': '6rem',  // 96px
  '5xl': '8rem',  // 128px
};

// Border Radius System
export const nuptulBorderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

// Shadow System - Elegant, not glass-like
export const nuptulShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Brand-specific shadows with color
  brand: '0 10px 25px -5px rgba(59, 130, 246, 0.15), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
  accent: '0 10px 25px -5px rgba(236, 72, 153, 0.15), 0 4px 6px -2px rgba(236, 72, 153, 0.05)'
};

// Card Variants - Different styles for different content types
export const nuptulCardVariants = {
  // Primary card - for main content (using heart and ring colors)
  primary: {
    background: `linear-gradient(135deg, ${nuptulColors.neutral[50]} 0%, ${nuptulColors.heart[50]} 100%)`,
    border: `1px solid ${nuptulColors.heart[200]}`,
    borderRadius: nuptulBorderRadius['2xl'],
    boxShadow: nuptulShadows.brand,
    padding: nuptulSpacing.xl,
  },

  // Secondary card - for supporting content (using ring colors)
  secondary: {
    background: `linear-gradient(135deg, ${nuptulColors.neutral[50]} 0%, ${nuptulColors.ring[50]} 100%)`,
    border: `1px solid ${nuptulColors.ring[200]}`,
    borderRadius: nuptulBorderRadius['2xl'],
    boxShadow: nuptulShadows.lg,
    padding: nuptulSpacing.lg,
  },

  // Accent card - for special highlights (using romantic colors)
  accent: {
    background: `linear-gradient(135deg, ${nuptulColors.romantic[50]} 0%, ${nuptulColors.neutral[50]} 100%)`,
    border: `1px solid ${nuptulColors.romantic[200]}`,
    borderRadius: nuptulBorderRadius['2xl'],
    boxShadow: nuptulShadows.accent,
    padding: nuptulSpacing.xl,
  },

  // Minimal card - for clean, simple content
  minimal: {
    background: nuptulColors.neutral[50],
    border: `1px solid ${nuptulColors.neutral[200]}`,
    borderRadius: nuptulBorderRadius.xl,
    boxShadow: nuptulShadows.md,
    padding: nuptulSpacing.lg,
  }
};

// Animation System
export const nuptulAnimations = {
  transition: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out'
  },
  
  hover: {
    scale: 'transform: scale(1.02)',
    lift: 'transform: translateY(-4px)',
    glow: 'box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.2)'
  }
};

// Component-specific styles
export const nuptulComponents = {
  button: {
    primary: {
      background: `linear-gradient(135deg, ${nuptulColors.heart[600]} 0%, ${nuptulColors.heart[700]} 100%)`,
      color: nuptulColors.neutral[50],
      border: 'none',
      borderRadius: nuptulBorderRadius.lg,
      padding: `${nuptulSpacing.sm} ${nuptulSpacing.lg}`,
      fontFamily: nuptulTypography.fontFamilies.body,
      fontWeight: nuptulTypography.fontWeights.medium,
      boxShadow: nuptulShadows.brand,
      transition: nuptulAnimations.transition.normal
    },

    secondary: {
      background: 'transparent',
      color: nuptulColors.ring[600],
      border: `2px solid ${nuptulColors.ring[300]}`,
      borderRadius: nuptulBorderRadius.lg,
      padding: `${nuptulSpacing.sm} ${nuptulSpacing.lg}`,
      fontFamily: nuptulTypography.fontFamilies.body,
      fontWeight: nuptulTypography.fontWeights.medium,
      transition: nuptulAnimations.transition.normal
    }
  }
};

// Utility function to create consistent card styles
export const createNuptulCard = (variant: keyof typeof nuptulCardVariants = 'primary') => {
  return nuptulCardVariants[variant];
};

// Utility function to create consistent text styles
export const createNuptulText = (
  size: keyof typeof nuptulTypography.fontSizes,
  weight: keyof typeof nuptulTypography.fontWeights = 'normal',
  family: keyof typeof nuptulTypography.fontFamilies = 'body'
) => {
  return {
    fontSize: nuptulTypography.fontSizes[size],
    fontWeight: nuptulTypography.fontWeights[weight],
    fontFamily: nuptulTypography.fontFamilies[family],
    lineHeight: nuptulTypography.lineHeights.normal
  };
};
