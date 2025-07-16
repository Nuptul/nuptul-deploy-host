// Nuptily Premium Wedding Typography System

export const typography = {
  // For couple names (Tim & Kirsten)
  coupleNames: {
    fontFamily: '"Great Vibes", cursive',
    fontWeight: '400',
    color: '#000000'
  },
  
  // Main headings (h1, h2)
  heading: {
    fontFamily: '"Bodoni Moda", serif',
    fontWeight: '600',
    color: '#000000',
    letterSpacing: '0.02em'
  },
  
  // Sub-headings (h3, h4)
  subheading: {
    fontFamily: '"Bodoni Moda", serif',
    fontWeight: '500',
    color: '#000000'
  },
  
  // Body text
  body: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: '400',
    color: '#000000',
    lineHeight: '1.6'
  },
  
  // Secondary/muted text
  muted: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.6)'
  },
  
  // Button text
  button: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: '600',
    letterSpacing: '0.02em'
  },
  
  // Small/caption text
  caption: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '13px'
  },
  
  // Sizes
  sizes: {
    // Couple names
    coupleXl: '48px',
    coupleLg: '40px',
    coupleMd: '32px',
    coupleSm: '28px',
    
    // Headings
    h1: '32px',
    h2: '28px',
    h3: '24px',
    h4: '20px',
    h5: '18px',
    h6: '16px',
    
    // Body
    bodyLg: '18px',
    bodyMd: '16px',
    bodySm: '14px',
    bodyXs: '12px',
    
    // Mobile sizes (reduced by ~15%)
    mobile: {
      coupleXl: '40px',
      coupleLg: '34px',
      coupleMd: '28px',
      coupleSm: '24px',
      h1: '28px',
      h2: '24px',
      h3: '20px',
      h4: '18px',
      h5: '16px',
      h6: '14px',
      bodyLg: '16px',
      bodyMd: '14px',
      bodySm: '13px',
      bodyXs: '11px'
    }
  }
};

// Helper function to get responsive font size
export const getResponsiveSize = (desktopSize: string, mobileSize: string) => ({
  fontSize: mobileSize,
  '@media (min-width: 640px)': {
    fontSize: desktopSize
  }
});

// Pre-composed styles for common use cases
export const typographyStyles = {
  coupleNamesLarge: {
    ...typography.coupleNames,
    fontSize: typography.sizes.coupleXl
  },
  
  coupleNamesMedium: {
    ...typography.coupleNames,
    fontSize: typography.sizes.coupleMd
  },
  
  pageTitle: {
    ...typography.heading,
    fontSize: typography.sizes.h1
  },
  
  sectionTitle: {
    ...typography.heading,
    fontSize: typography.sizes.h2
  },
  
  cardTitle: {
    ...typography.subheading,
    fontSize: typography.sizes.h3
  },
  
  bodyText: {
    ...typography.body,
    fontSize: typography.sizes.bodyMd
  },
  
  smallText: {
    ...typography.body,
    fontSize: typography.sizes.bodySm
  },
  
  mutedText: {
    ...typography.muted,
    fontSize: typography.sizes.bodyMd
  },
  
  buttonText: {
    ...typography.button,
    fontSize: typography.sizes.bodyMd
  }
};