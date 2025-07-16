import React, { lazy, Suspense } from 'react';
import { FeatureFlag } from '@/components/feature-flags/FeatureFlag';
import { cn } from '@/lib/utils';

// Performance optimized lazy loading for mobile
const GlareCard = lazy(() => import('@/ui/aceternity/glare-card').then(module => ({ 
  default: module.GlareCard 
})));

const TextGenerate = lazy(() => import('@/ui/aceternity/text-generate').then(module => ({ 
  default: module.TextGenerate 
})));

const AnimatedModal = lazy(() => import('@/ui/aceternity/animated-modal').then(module => ({ 
  default: module.AnimatedModal 
})));

// Loading fallback optimized for wedding context
const WeddingLoader = ({ className }: { className?: string }) => (
  <div className={cn(
    'animate-pulse rounded-xl bg-gradient-to-br from-pink-100 to-purple-100',
    'border border-pink-200/50 backdrop-blur-sm',
    'flex items-center justify-center min-h-[100px]',
    className
  )}>
    <div className="text-pink-500/70 text-sm font-medium">
      Loading...
    </div>
  </div>
);

/**
 * Phase 3.1 Core Components with Feature Flag Protection
 * 
 * These components are wrapped with FeatureFlag "phase3.1" for safe rollout
 * and performance optimization for mobile 60fps target.
 */

/**
 * Phase 3.1 Glare Card - Wedding venue and vendor showcase
 * Mobile optimized with reduced animation complexity on small screens
 */
export interface Phase31GlareCardProps {
  children: React.ReactNode;
  className?: string;
  glareColor?: string;
  glareSize?: number;
  glareOpacity?: number;
  rotationRange?: number;
  disabled?: boolean;
  mobileOptimized?: boolean;
}

export const Phase31GlareCard: React.FC<Phase31GlareCardProps> = ({ 
  mobileOptimized = true,
  rotationRange = 20,
  glareSize = 400,
  ...props 
}) => {
  // Mobile performance optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const optimizedProps = mobileOptimized && isMobile ? {
    rotationRange: rotationRange * 0.5, // Reduce rotation for mobile
    glareSize: glareSize * 0.7, // Smaller glare effect
    ...props
  } : { rotationRange, glareSize, ...props };

  return (
    <FeatureFlag 
      name="phase3.1" 
      fallback={
        <div className={cn(
          'rounded-xl bg-white/10 backdrop-blur-sm border border-white/20',
          'p-6 shadow-lg',
          props.className
        )}>
          {props.children}
        </div>
      }
    >
      <Suspense fallback={<WeddingLoader className={props.className} />}>
        <GlareCard {...optimizedProps} />
      </Suspense>
    </FeatureFlag>
  );
};

/**
 * Phase 3.1 Text Generate - Wedding announcements and reveals
 * Optimized animation timing for mobile performance
 */
export interface Phase31TextGenerateProps {
  text: string;
  className?: string;
  duration?: number;
  staggerDelay?: number;
  once?: boolean;
  filter?: boolean;
  wedding?: boolean;
  mobileOptimized?: boolean;
}

export const Phase31TextGenerate: React.FC<Phase31TextGenerateProps> = ({ 
  mobileOptimized = true,
  duration = 0.8,
  staggerDelay = 0.05,
  filter = true,
  ...props 
}) => {
  // Mobile performance optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const optimizedProps = mobileOptimized && isMobile ? {
    duration: duration * 0.8, // Faster on mobile
    staggerDelay: staggerDelay * 0.8, // Reduce stagger
    filter: false, // Disable blur filter on mobile for performance
    ...props
  } : { duration, staggerDelay, filter, ...props };

  return (
    <FeatureFlag 
      name="phase3.1" 
      fallback={
        <div className={cn('font-bold', props.className)}>
          {props.text}
        </div>
      }
    >
      <Suspense fallback={
        <div className={cn('font-bold animate-pulse bg-gray-200 rounded', props.className)}>
          {props.text}
        </div>
      }>
        <TextGenerate {...optimizedProps} />
      </Suspense>
    </FeatureFlag>
  );
};

/**
 * Phase 3.1 Animated Modal - Enhanced modal experience
 * Mobile-first responsive sizing and touch optimization
 */
export interface Phase31AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  overlayClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'scale' | 'slide' | 'fade';
  mobileOptimized?: boolean;
}

export const Phase31AnimatedModal: React.FC<Phase31AnimatedModalProps> = ({ 
  mobileOptimized = true,
  animation = 'scale',
  size = 'md',
  ...props 
}) => {
  // Mobile performance optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const optimizedProps = mobileOptimized && isMobile ? {
    animation: 'fade' as const, // Simpler animation on mobile
    size: 'sm' as const, // Smaller modal on mobile
    ...props
  } : { animation, size, ...props };

  return (
    <FeatureFlag 
      name="phase3.1" 
      fallback={
        // Legacy modal fallback with basic glassmorphism
        <div className={cn(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm',
          'flex items-center justify-center p-4',
          !props.isOpen && 'hidden'
        )}>
          <div className={cn(
            'bg-white rounded-xl shadow-2xl max-w-md w-full p-6',
            props.className
          )}>
            {props.title && (
              <h2 className="text-xl font-bold mb-4">{props.title}</h2>
            )}
            {props.children}
          </div>
        </div>
      }
    >
      <Suspense fallback={null}>
        <AnimatedModal {...optimizedProps} />
      </Suspense>
    </FeatureFlag>
  );
};

/**
 * Wedding-specific variants for common use cases
 */

// Venue showcase card
export const VenueGlareCard: React.FC<Omit<Phase31GlareCardProps, 'glareColor'>> = (props) => (
  <Phase31GlareCard 
    {...props}
    glareColor="rgba(255, 215, 0, 0.2)" // Wedding gold
    className={cn(
      'bg-gradient-to-br from-white/20 to-white/5',
      'border border-white/30 shadow-xl',
      props.className
    )}
  />
);

// Wedding announcement text
export const WeddingAnnouncementText: React.FC<Omit<Phase31TextGenerateProps, 'wedding'>> = (props) => (
  <Phase31TextGenerate 
    {...props}
    wedding={true}
    className={cn(
      'text-2xl md:text-4xl font-bold text-center',
      'bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent',
      props.className
    )}
  />
);

// RSVP modal
export const RSVPModal: React.FC<Omit<Phase31AnimatedModalProps, 'title'>> = (props) => (
  <Phase31AnimatedModal 
    {...props}
    title="RSVP to Our Wedding"
    size="lg"
    className={cn(
      'bg-gradient-to-br from-pink-50/90 to-purple-50/90',
      'border border-pink-200/50',
      props.className
    )}
  />
);

export default {
  Phase31GlareCard,
  Phase31TextGenerate,
  Phase31AnimatedModal,
  VenueGlareCard,
  WeddingAnnouncementText,
  RSVPModal
};