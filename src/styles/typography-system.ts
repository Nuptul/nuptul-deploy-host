// Nuptily Complete Typography System with Accessibility Standards
// Matching the auth form style from the screenshot

export const typographySystem = {
  // ===========================================
  // FONT FAMILIES
  // ===========================================
  fonts: {
    // Calligraphy/Script Fonts
    wedding: '"Great Vibes", cursive',        // For couple names (Tim & Kirsten)
    script: '"Pinyon Script", cursive',       // Alternative script font
    
    // Elegant Serif Font - For all headings
    serif: '"Bodoni Moda", serif',            // Premium wedding headings
    serifDisplay: '"Playfair Display", serif', // Alternative display font
    
    // Sans-serif Font - For body text, buttons, UI elements
    sans: '"Montserrat", sans-serif',         // Clean, modern body text
    sansAlt: '"Inter", sans-serif',           // Alternative sans-serif
  },

  // ===========================================
  // STANDARDIZED FONT SIZES (rem-based for accessibility)
  // ===========================================
  sizes: {
    // Display sizes (only for hero sections)
    display: {
      xl: '3.5rem',    // 56px - Hero couple names
      lg: '3rem',      // 48px - Large hero text
      md: '2.5rem',    // 40px - Medium hero text
      sm: '2rem',      // 32px - Small hero text
    },
    
    // Heading sizes (consistent hierarchy)
    heading: {
      h1: '2rem',      // 32px - Page titles
      h2: '1.75rem',   // 28px - Section titles
      h3: '1.5rem',    // 24px - Card titles
      h4: '1.25rem',   // 20px - Sub-sections
      h5: '1.125rem',  // 18px - Small headings
      h6: '1rem',      // 16px - Tiny headings
    },
    
    // Body text sizes
    body: {
      xl: '1.125rem',  // 18px - Large body text
      lg: '1rem',      // 16px - Default body text
      md: '0.875rem',  // 14px - Small body text
      sm: '0.813rem',  // 13px - Caption text
      xs: '0.75rem',   // 12px - Tiny text
    },
    
    // Mobile sizes (reduced by 10-15%)
    mobile: {
      display: {
        xl: '3rem',    // 48px
        lg: '2.5rem',  // 40px
        md: '2rem',    // 32px
        sm: '1.75rem', // 28px
      },
      heading: {
        h1: '1.75rem', // 28px
        h2: '1.5rem',  // 24px
        h3: '1.25rem', // 20px
        h4: '1.125rem',// 18px
        h5: '1rem',    // 16px
        h6: '0.875rem',// 14px
      },
      body: {
        xl: '1rem',    // 16px
        lg: '0.875rem',// 14px
        md: '0.813rem',// 13px
        sm: '0.75rem', // 12px
        xs: '0.688rem',// 11px
      }
    }
  },

  // ===========================================
  // FONT WEIGHTS (consistent across the app)
  // ===========================================
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // ===========================================
  // LINE HEIGHTS (for readability)
  // ===========================================
  lineHeights: {
    tight: 1.2,      // Headings
    snug: 1.4,       // Sub-headings
    normal: 1.6,     // Body text
    relaxed: 1.8,    // Long-form content
    loose: 2,        // Extra spacing
  },

  // ===========================================
  // LETTER SPACING
  // ===========================================
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.02em',
    wider: '0.04em',
    widest: '0.08em',
  },

  // ===========================================
  // COLOR CONTRAST (WCAG AA/AAA compliance)
  // ===========================================
  colors: {
    // High contrast (AAA compliant)
    primary: '#000000',           // Pure black
    primaryLight: 'rgba(0, 0, 0, 0.87)', // 87% black
    
    // Medium contrast (AA compliant)
    secondary: 'rgba(0, 0, 0, 0.7)',     // 70% black
    tertiary: 'rgba(0, 0, 0, 0.6)',      // 60% black
    
    // Low contrast (decorative only)
    muted: 'rgba(0, 0, 0, 0.5)',         // 50% black
    disabled: 'rgba(0, 0, 0, 0.38)',     // 38% black
    
    // White text on dark backgrounds
    inverse: '#FFFFFF',
    inverseLight: 'rgba(255, 255, 255, 0.9)',
    inverseMuted: 'rgba(255, 255, 255, 0.7)',
  },

  // ===========================================
  // MINIMUM SIZES (Accessibility)
  // ===========================================
  minimums: {
    // Minimum font sizes
    bodyText: '14px',      // Never go below 14px for body
    captionText: '12px',   // Never go below 12px for captions
    touchTarget: '44px',   // Minimum touch target size
    
    // Minimum contrast ratios (WCAG)
    contrastAA: 4.5,       // Normal text
    contrastAALarge: 3,    // Large text (18px+ or 14px+ bold)
    contrastAAA: 7,        // Enhanced contrast
  },

  // ===========================================
  // SPACING SCALE (consistent vertical rhythm)
  // ===========================================
  spacing: {
    // Paragraph spacing
    paragraphGap: '1rem',        // 16px between paragraphs
    sectionGap: '2rem',          // 32px between sections
    
    // List spacing
    listItemGap: '0.5rem',       // 8px between list items
    nestedListIndent: '1.5rem',  // 24px indent for nested lists
    
    // Heading spacing
    headingMarginTop: '1.5em',   // Relative to heading size
    headingMarginBottom: '0.5em', // Relative to heading size
  },

  // ===========================================
  // RESPONSIVE BREAKPOINTS
  // ===========================================
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },

  // ===========================================
  // Z-INDEX SCALE (for consistent layering)
  // ===========================================
  zIndex: {
    base: 0,
    elevated: 10,
    dropdown: 100,
    modal: 1000,
    popover: 2000,
    tooltip: 3000,
    notification: 4000,
    maximum: 9999,
  }
};

// ===========================================
// PRE-COMPOSED STYLES
// ===========================================
export const textStyles = {
  // Couple Names (Great Vibes)
  coupleNamesHero: {
    fontFamily: typographySystem.fonts.wedding,
    fontSize: typographySystem.sizes.display.xl,
    fontWeight: typographySystem.weights.regular,
    lineHeight: typographySystem.lineHeights.tight,
    color: typographySystem.colors.primary,
    letterSpacing: typographySystem.letterSpacing.normal,
  },
  
  coupleNamesLarge: {
    fontFamily: typographySystem.fonts.wedding,
    fontSize: typographySystem.sizes.display.lg,
    fontWeight: typographySystem.weights.regular,
    lineHeight: typographySystem.lineHeights.tight,
    color: typographySystem.colors.primary,
  },
  
  coupleNamesMedium: {
    fontFamily: typographySystem.fonts.wedding,
    fontSize: typographySystem.sizes.display.md,
    fontWeight: typographySystem.weights.regular,
    lineHeight: typographySystem.lineHeights.tight,
    color: typographySystem.colors.primary,
  },

  // Page Headers (Bodoni Moda)
  pageTitle: {
    fontFamily: typographySystem.fonts.serif,
    fontSize: typographySystem.sizes.heading.h1,
    fontWeight: typographySystem.weights.semibold,
    lineHeight: typographySystem.lineHeights.tight,
    letterSpacing: typographySystem.letterSpacing.wide,
    color: typographySystem.colors.primary,
  },
  
  sectionTitle: {
    fontFamily: typographySystem.fonts.serif,
    fontSize: typographySystem.sizes.heading.h2,
    fontWeight: typographySystem.weights.semibold,
    lineHeight: typographySystem.lineHeights.tight,
    letterSpacing: typographySystem.letterSpacing.wide,
    color: typographySystem.colors.primary,
  },
  
  cardTitle: {
    fontFamily: typographySystem.fonts.serif,
    fontSize: typographySystem.sizes.heading.h3,
    fontWeight: typographySystem.weights.medium,
    lineHeight: typographySystem.lineHeights.snug,
    color: typographySystem.colors.primary,
  },
  
  subheading: {
    fontFamily: typographySystem.fonts.serif,
    fontSize: typographySystem.sizes.heading.h4,
    fontWeight: typographySystem.weights.medium,
    lineHeight: typographySystem.lineHeights.snug,
    color: typographySystem.colors.primary,
  },

  // Body Text (Montserrat)
  bodyLarge: {
    fontFamily: typographySystem.fonts.sans,
    fontSize: typographySystem.sizes.body.xl,
    fontWeight: typographySystem.weights.regular,
    lineHeight: typographySystem.lineHeights.normal,
    color: typographySystem.colors.primaryLight,
  },
  
  body: {
    fontFamily: typographySystem.fonts.sans,
    fontSize: typographySystem.sizes.body.lg,
    fontWeight: typographySystem.weights.regular,
    lineHeight: typographySystem.lineHeights.normal,
    color: typographySystem.colors.primaryLight,
  },
  
  bodySmall: {
    fontFamily: typographySystem.fonts.sans,
    fontSize: typographySystem.sizes.body.md,
    fontWeight: typographySystem.weights.regular,
    lineHeight: typographySystem.lineHeights.normal,
    color: typographySystem.colors.secondary,
  },
  
  caption: {
    fontFamily: typographySystem.fonts.sans,
    fontSize: typographySystem.sizes.body.sm,
    fontWeight: typographySystem.weights.regular,
    lineHeight: typographySystem.lineHeights.normal,
    color: typographySystem.colors.tertiary,
  },
  
  tiny: {
    fontFamily: typographySystem.fonts.sans,
    fontSize: typographySystem.sizes.body.xs,
    fontWeight: typographySystem.weights.regular,
    lineHeight: typographySystem.lineHeights.normal,
    color: typographySystem.colors.muted,
  },

  // UI Elements
  button: {
    fontFamily: typographySystem.fonts.sans,
    fontSize: typographySystem.sizes.body.lg,
    fontWeight: typographySystem.weights.semibold,
    lineHeight: typographySystem.lineHeights.tight,
    letterSpacing: typographySystem.letterSpacing.wide,
    textTransform: 'none' as const,
  },
  
  buttonSmall: {
    fontFamily: typographySystem.fonts.sans,
    fontSize: typographySystem.sizes.body.md,
    fontWeight: typographySystem.weights.semibold,
    lineHeight: typographySystem.lineHeights.tight,
    letterSpacing: typographySystem.letterSpacing.wide,
  },
  
  label: {
    fontFamily: typographySystem.fonts.sans,
    fontSize: typographySystem.sizes.body.md,
    fontWeight: typographySystem.weights.medium,
    lineHeight: typographySystem.lineHeights.tight,
    color: typographySystem.colors.primary,
  },
  
  input: {
    fontFamily: typographySystem.fonts.sans,
    fontSize: typographySystem.sizes.body.lg,
    fontWeight: typographySystem.weights.regular,
    lineHeight: typographySystem.lineHeights.normal,
    color: typographySystem.colors.primary,
  },
  
  navigation: {
    fontFamily: typographySystem.fonts.sans,
    fontSize: typographySystem.sizes.body.md,
    fontWeight: typographySystem.weights.medium,
    letterSpacing: typographySystem.letterSpacing.wide,
    color: typographySystem.colors.primary,
  }
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
export const getResponsiveTextStyle = (
  desktopStyle: any,
  mobileOverrides?: Partial<typeof desktopStyle>
) => ({
  ...desktopStyle,
  '@media (max-width: 640px)': {
    ...desktopStyle,
    ...mobileOverrides,
  }
});

export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - in production, use a proper library
  return backgroundColor === '#FFFFFF' || backgroundColor === 'white' 
    ? typographySystem.colors.primary 
    : typographySystem.colors.inverse;
};