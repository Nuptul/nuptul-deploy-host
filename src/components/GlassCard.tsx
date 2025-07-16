import React, { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'frosted' | 'liquid' | 'neumorphic';
  className?: string;
  animate?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  variant = 'liquid', 
  className, 
  animate = true,
  onClick,
  style 
}) => {
  const baseClasses = `
    transition-all duration-300 ease-out
    ${animate ? 'hover:shadow-lg' : ''}
    ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
  `;
  
  const variantClasses = {
    primary: 'glass-primary rounded-glass-lg',
    secondary: 'glass-secondary rounded-glass-lg', 
    frosted: 'glass-frosted rounded-glass-lg',
    liquid: 'liquid-glass',
    neumorphic: 'neu-card'
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassCard;