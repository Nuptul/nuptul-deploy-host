import React from 'react';
import { typographySystem, textStyles } from '@/styles/typography-system';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Couple Names Component - Always uses Great Vibes
export const CoupleNames: React.FC<TypographyProps & { size?: 'xl' | 'lg' | 'md' | 'sm' }> = ({ 
  children, 
  size = 'lg',
  className = '',
  style = {}
}) => {
  const sizeMap = {
    xl: typographySystem.sizes.display.xl,
    lg: typographySystem.sizes.display.lg,
    md: typographySystem.sizes.display.md,
    sm: typographySystem.sizes.display.sm,
  };

  return (
    <span 
      className={`couple-names ${className}`}
      style={{
        fontFamily: '"Great Vibes", cursive',
        fontSize: sizeMap[size],
        fontWeight: 400,
        color: '#000000',
        lineHeight: 1.2,
        ...style
      }}
      data-wedding-names="true"
    >
      {children}
    </span>
  );
};

// Page Title Component - Always uses Bodoni Moda
export const PageTitle: React.FC<TypographyProps> = ({ children, className = '', style = {} }) => {
  return (
    <h1 
      className={`page-title ${className}`}
      style={{
        ...textStyles.pageTitle,
        ...style
      }}
    >
      {children}
    </h1>
  );
};

// Section Title Component - Always uses Bodoni Moda
export const SectionTitle: React.FC<TypographyProps> = ({ children, className = '', style = {} }) => {
  return (
    <h2 
      className={`section-title ${className}`}
      style={{
        ...textStyles.sectionTitle,
        ...style
      }}
    >
      {children}
    </h2>
  );
};

// Card Title Component - Always uses Bodoni Moda
export const CardTitle: React.FC<TypographyProps> = ({ children, className = '', style = {} }) => {
  return (
    <h3 
      className={`card-title ${className}`}
      style={{
        ...textStyles.cardTitle,
        ...style
      }}
    >
      {children}
    </h3>
  );
};

// Body Text Component - Always uses Montserrat
export const BodyText: React.FC<TypographyProps & { size?: 'lg' | 'md' | 'sm'; muted?: boolean }> = ({ 
  children, 
  size = 'md',
  muted = false,
  className = '',
  style = {}
}) => {
  const styleMap = {
    lg: textStyles.bodyLarge,
    md: textStyles.body,
    sm: textStyles.bodySmall,
  };

  return (
    <p 
      className={`body-text ${muted ? 'text-muted' : ''} ${className}`}
      style={{
        ...styleMap[size],
        ...(muted && { color: typographySystem.colors.tertiary }),
        ...style
      }}
    >
      {children}
    </p>
  );
};

// Caption Component - Small Montserrat text
export const Caption: React.FC<TypographyProps> = ({ children, className = '', style = {} }) => {
  return (
    <span 
      className={`caption ${className}`}
      style={{
        ...textStyles.caption,
        ...style
      }}
    >
      {children}
    </span>
  );
};

// Button Text Component - Montserrat semibold
export const ButtonText: React.FC<TypographyProps & { size?: 'lg' | 'md' }> = ({ 
  children, 
  size = 'md',
  className = '',
  style = {}
}) => {
  return (
    <span 
      className={`button-text ${className}`}
      style={{
        ...(size === 'lg' ? textStyles.button : textStyles.buttonSmall),
        ...style
      }}
    >
      {children}
    </span>
  );
};

// Label Component - Montserrat medium
export const Label: React.FC<TypographyProps> = ({ children, className = '', style = {} }) => {
  return (
    <label 
      className={`label-text ${className}`}
      style={{
        ...textStyles.label,
        ...style
      }}
    >
      {children}
    </label>
  );
};

// Export all typography components
export const Typography = {
  CoupleNames,
  PageTitle,
  SectionTitle,
  CardTitle,
  BodyText,
  Caption,
  ButtonText,
  Label
};