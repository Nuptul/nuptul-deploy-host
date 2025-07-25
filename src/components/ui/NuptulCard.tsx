import React from 'react';
import { cn } from '@/lib/utils';
import { 
  nuptulCardVariants, 
  nuptulAnimations, 
  nuptulColors,
  nuptulTypography 
} from '@/styles/nuptul-design-system';

interface NuptulCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'minimal';
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * NuptulCard - A card component that embodies the Nuptul design system
 * 
 * This component replaces glassmorphism cards with elegant, branded designs
 * that complement the Nuptul logo's aesthetic.
 */
export const NuptulCard: React.FC<NuptulCardProps> = ({
  children,
  variant = 'primary',
  className,
  hover = true,
  onClick,
  style
}) => {
  const cardStyle = nuptulCardVariants[variant];
  
  const hoverStyles = hover ? {
    transition: nuptulAnimations.transition.normal,
    cursor: onClick ? 'pointer' : 'default',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: variant === 'primary' 
        ? '0 20px 40px -10px rgba(59, 130, 246, 0.25), 0 8px 16px -4px rgba(59, 130, 246, 0.1)'
        : variant === 'accent'
        ? '0 20px 40px -10px rgba(236, 72, 153, 0.25), 0 8px 16px -4px rgba(236, 72, 153, 0.1)'
        : '0 15px 30px -5px rgba(0, 0, 0, 0.15), 0 6px 12px -2px rgba(0, 0, 0, 0.08)'
    }
  } : {};

  return (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        hover && "hover:-translate-y-1",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        ...cardStyle,
        ...hoverStyles,
        ...style
      }}
      onClick={onClick}
    >
      {/* Subtle pattern overlay for texture */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/**
 * NuptulHeroCard - Special card variant for hero sections
 */
export const NuptulHeroCard: React.FC<NuptulCardProps> = ({
  children,
  className,
  style,
  ...props
}) => {
  return (
    <NuptulCard
      variant="primary"
      className={cn("text-center", className)}
      style={{
        background: `linear-gradient(135deg,
          ${nuptulColors.neutral[50]} 0%,
          ${nuptulColors.heart[50]} 30%,
          ${nuptulColors.ring[50]} 70%,
          ${nuptulColors.neutral[50]} 100%)`,
        border: `1px solid ${nuptulColors.heart[200]}`,
        boxShadow: `
          0 25px 50px -12px rgba(220, 38, 38, 0.15),
          0 10px 20px -5px rgba(71, 85, 105, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.6)
        `,
        ...style
      }}
      {...props}
    >
      {children}
    </NuptulCard>
  );
};

/**
 * NuptulFAQCard - Special card variant for FAQ items
 */
export const NuptulFAQCard: React.FC<NuptulCardProps & {
  title: string;
  content: string;
  icon?: React.ReactNode;
}> = ({
  title,
  content,
  icon,
  className,
  style,
  ...props
}) => {
  return (
    <NuptulCard
      variant="minimal"
      className={cn("group", className)}
      style={{
        background: `linear-gradient(135deg, 
          ${nuptulColors.neutral[50]} 0%, 
          ${nuptulColors.primary[25]} 100%)`,
        border: `1px solid ${nuptulColors.neutral[200]}`,
        borderLeft: `4px solid ${nuptulColors.primary[400]}`,
        ...style
      }}
      {...props}
    >
      <div className="space-y-3">
        {/* Header with icon and title */}
        <div className="flex items-start gap-3">
          {icon && (
            <div 
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
              style={{
                background: `linear-gradient(135deg, ${nuptulColors.primary[100]} 0%, ${nuptulColors.primary[200]} 100%)`,
                color: nuptulColors.primary[600]
              }}
            >
              {icon}
            </div>
          )}
          <h3 
            className="font-semibold leading-tight group-hover:text-blue-700 transition-colors duration-200"
            style={{
              ...nuptulTypography.fontFamilies.heading && { fontFamily: nuptulTypography.fontFamilies.heading },
              fontSize: nuptulTypography.fontSizes.lg,
              fontWeight: nuptulTypography.fontWeights.semibold,
              color: nuptulColors.neutral[800],
              lineHeight: nuptulTypography.lineHeights.tight
            }}
          >
            {title}
          </h3>
        </div>
        
        {/* Content */}
        <p 
          className="leading-relaxed"
          style={{
            fontFamily: nuptulTypography.fontFamilies.body,
            fontSize: nuptulTypography.fontSizes.base,
            color: nuptulColors.neutral[600],
            lineHeight: nuptulTypography.lineHeights.relaxed
          }}
        >
          {content}
        </p>
      </div>
    </NuptulCard>
  );
};

/**
 * NuptulContactCard - Special card variant for contact information
 */
export const NuptulContactCard: React.FC<NuptulCardProps> = ({
  children,
  className,
  style,
  ...props
}) => {
  return (
    <NuptulCard
      variant="secondary"
      className={cn("text-center", className)}
      style={{
        background: `linear-gradient(135deg,
          ${nuptulColors.ring[50]} 0%,
          ${nuptulColors.neutral[50]} 50%,
          ${nuptulColors.romantic[50]} 100%)`,
        border: `1px solid ${nuptulColors.ring[200]}`,
        ...style
      }}
      {...props}
    >
      {children}
    </NuptulCard>
  );
};

export default NuptulCard;
