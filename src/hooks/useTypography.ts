import { typography, typographyStyles } from '@/styles/typography';

export const useTypography = () => {
  return {
    // Direct style objects
    styles: typographyStyles,
    
    // Individual typography properties
    fonts: {
      couple: typography.coupleNames,
      heading: typography.heading,
      subheading: typography.subheading,
      body: typography.body,
      muted: typography.muted,
      button: typography.button,
      caption: typography.caption
    },
    
    // Font sizes
    sizes: typography.sizes,
    
    // Helper functions
    getCoupleNamesStyle: (size: 'xl' | 'lg' | 'md' | 'sm' = 'lg') => ({
      ...typography.coupleNames,
      fontSize: typography.sizes[`couple${size.charAt(0).toUpperCase()}${size.slice(1)}` as keyof typeof typography.sizes]
    }),
    
    getHeadingStyle: (level: 1 | 2 | 3 | 4 | 5 | 6 = 1) => ({
      ...(level <= 2 ? typography.heading : typography.subheading),
      fontSize: typography.sizes[`h${level}` as keyof typeof typography.sizes]
    }),
    
    getBodyStyle: (size: 'lg' | 'md' | 'sm' | 'xs' = 'md', muted: boolean = false) => ({
      ...(muted ? typography.muted : typography.body),
      fontSize: typography.sizes[`body${size.charAt(0).toUpperCase()}${size.slice(1)}` as keyof typeof typography.sizes]
    }),
    
    // Mobile responsive helper
    getResponsiveStyle: (desktopSize: string, mobileSize: string) => ({
      fontSize: mobileSize,
      '@media (min-width: 640px)': {
        fontSize: desktopSize
      }
    })
  };
};