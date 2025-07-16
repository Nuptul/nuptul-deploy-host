import { ReactNode } from 'react';
import { MotionProps } from 'framer-motion';

/**
 * Common types for Aceternity UI components
 */

export type WeddingTheme = 'romantic' | 'elegant' | 'modern' | 'classic';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export type SpotlightVariant = 'subtle' | 'medium' | 'intense';

export interface BaseAceternityProps {
  children?: ReactNode;
  className?: string;
  theme?: WeddingTheme;
  disabled?: boolean;
}

export interface AnimatedProps extends BaseAceternityProps {
  animation?: AnimationSpeed;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export interface InteractiveProps extends BaseAceternityProps {
  onHover?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}

export interface SpotlightProps {
  spotlight?: boolean;
  spotlightColor?: string;
  spotlightSize?: number;
  spotlightVariant?: SpotlightVariant;
}

export interface GlareProps {
  glare?: boolean;
  glareColor?: string;
  glareIntensity?: number;
  rotationRange?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'scale' | 'slide' | 'fade';
}

export interface TextAnimationProps {
  text: string;
  staggerDelay?: number;
  filter?: boolean;
  wedding?: boolean;
}

// Wedding-specific color palette
export interface WeddingColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  romantic: string;
  elegant: string;
}

// Animation easing presets
export type WeddingEasing = 
  | 'gentle' 
  | 'romantic' 
  | 'elegant' 
  | 'playful';

// Component size variants
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Wedding-specific animation variants
export interface WeddingAnimationConfig {
  duration: number;
  ease: WeddingEasing;
  delay?: number;
  stagger?: number;
}

// Mouse tracking types
export interface MousePosition {
  x: number;
  y: number;
}

export interface RelativeMousePosition extends MousePosition {
  relativeX: number;
  relativeY: number;
}

export interface MouseEffects {
  spotlight: string;
  glare: {
    background: string;
    opacity: number;
  };
  rotation: {
    rotateX: number;
    rotateY: number;
  };
  isHovered: boolean;
}

// Component-specific prop extensions

export interface AnimatedModalProps extends 
  BaseAceternityProps, 
  ModalProps, 
  AnimatedProps {
  overlayClassName?: string;
}

export interface GlareCardProps extends 
  BaseAceternityProps, 
  GlareProps, 
  InteractiveProps {}

export interface TextGenerateProps extends 
  BaseAceternityProps, 
  TextAnimationProps, 
  AnimatedProps {}

// Utility function types
export type CreateSpotlightGradient = (
  mousePos: MousePosition,
  spotlightSize?: number,
  color?: string
) => string;

export type CreateGlareEffect = (
  relativePos: RelativeMousePosition,
  intensity?: number
) => { background: string; opacity: number };

export type CalculateRotation = (
  relativePos: RelativeMousePosition,
  maxRotation?: number
) => { rotateX: number; rotateY: number };

// Wedding theme configuration
export interface WeddingThemeConfig {
  colors: WeddingColors;
  animations: Record<string, WeddingAnimationConfig>;
  spacing: Record<ComponentSize, string>;
  shadows: Record<string, string>;
  borders: Record<string, string>;
}