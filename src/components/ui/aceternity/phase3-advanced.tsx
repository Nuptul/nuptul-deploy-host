import React, { lazy, Suspense } from 'react';
import { FeatureFlag } from '@/components/feature-flags/FeatureFlag';
import { cn } from '@/lib/utils';

// Performance optimized lazy loading for Phase 3.2 advanced components
const HeroParallax = lazy(() => import('@/ui/aceternity/hero-parallax'));
const Sparkles = lazy(() => import('@/ui/aceternity/sparkles'));
const Card3D = lazy(() => import('@/ui/aceternity/card-3d'));

// Advanced loading fallback with wedding theme
const AdvancedWeddingLoader = ({ className, type }: { className?: string; type: 'hero' | 'sparkles' | 'card' }) => {
  const loaderContent = {
    hero: {
      height: 'min-h-screen',
      content: 'Loading magical wedding gallery...'
    },
    sparkles: {
      height: 'h-full',
      content: 'Preparing sparkle effects...'
    },
    card: {
      height: 'min-h-[200px]',
      content: 'Loading 3D experience...'
    }
  };

  const config = loaderContent[type];

  return (
    <div className={cn(
      'animate-pulse bg-gradient-to-br from-pink-100/50 to-purple-100/50',
      'border border-pink-200/30 backdrop-blur-sm rounded-xl',
      'flex items-center justify-center',
      config.height,
      className
    )}>
      <div className="text-center">
        <div className="text-pink-500/70 text-sm font-medium mb-2">
          {config.content}
        </div>
        <div className="flex space-x-1 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-pink-400/60 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Phase 3.2 Advanced Components with Feature Flag Protection
 * 
 * These components are wrapped with FeatureFlag "phase3.2" for gradual rollout
 * and include advanced mobile optimizations for complex visual effects.
 */

/**
 * Phase 3.2 Hero Parallax - Wedding venue showcase with parallax scrolling
 * Mobile optimized with reduced layer complexity and disabled blur effects
 */
export interface Phase32HeroParallaxProps {
  images: Array<{
    src: string;
    alt: string;
    className?: string;
  }>;
  title?: string;
  subtitle?: string;
  coupleNames?: {
    bride: string;
    groom: string;
  };
  weddingDate?: string;
  scrollSpeed?: number;
  overlayOpacity?: number;
  enableBlur?: boolean;
  parallaxIntensity?: number;
  className?: string;
  children?: React.ReactNode;
  mobileOptimized?: boolean;
}

export const Phase32HeroParallax: React.FC<Phase32HeroParallaxProps> = ({ 
  mobileOptimized = true,
  enableBlur = true,
  parallaxIntensity = 200,
  scrollSpeed = 0.5,
  ...props 
}) => {
  // Mobile performance optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const optimizedProps = mobileOptimized && isMobile ? {
    enableBlur: false, // Disable blur for performance
    parallaxIntensity: parallaxIntensity * 0.5, // Reduce parallax intensity
    scrollSpeed: scrollSpeed * 0.7, // Smoother scrolling
    ...props
  } : { enableBlur, parallaxIntensity, scrollSpeed, ...props };

  return (
    <FeatureFlag 
      name="phase3.2" 
      fallback={
        // Enhanced fallback with basic parallax effect
        <div className={cn(
          'relative min-h-screen bg-gradient-to-br from-pink-100 to-purple-100',
          'flex items-center justify-center',
          props.className
        )}>
          <div className="text-center z-10">
            {props.coupleNames && (
              <h1 className="text-4xl md:text-6xl font-light text-gray-800 mb-4">
                <span className="text-pink-600">{props.coupleNames.bride}</span>
                <span className="text-gray-600 mx-4">&</span>
                <span className="text-purple-600">{props.coupleNames.groom}</span>
              </h1>
            )}
            {props.title && (
              <h2 className="text-2xl md:text-4xl text-gray-700 mb-6">{props.title}</h2>
            )}
            {props.weddingDate && (
              <p className="text-lg md:text-xl text-gray-600">{props.weddingDate}</p>
            )}
            {props.children}
          </div>
          
          {/* Simple image grid fallback */}
          <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-4 p-8 opacity-20">
            {props.images.slice(0, 6).map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <Suspense fallback={<AdvancedWeddingLoader type="hero" className={props.className} />}>
        <HeroParallax {...optimizedProps} />
      </Suspense>
    </FeatureFlag>
  );
};

/**
 * Phase 3.2 Sparkles - Interactive sparkle effects for romantic moments
 * Mobile optimized with reduced particle count and simplified animations
 */
export interface Phase32SparklesProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  colors?: string[];
  mouseBehavior?: 'follow' | 'ambient' | 'burst' | 'trail';
  animationSpeed?: 'slow' | 'medium' | 'fast';
  density?: 'sparse' | 'normal' | 'dense';
  className?: string;
  trigger?: 'hover' | 'always' | 'click';
  burstIntensity?: number;
  particleLifetime?: number;
  enablePhysics?: boolean;
  children?: React.ReactNode;
  mobileOptimized?: boolean;
}

export const Phase32Sparkles: React.FC<Phase32SparklesProps> = ({ 
  mobileOptimized = true,
  count = 20,
  density = 'normal',
  animationSpeed = 'medium',
  enablePhysics = false,
  ...props 
}) => {
  // Mobile performance optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const optimizedProps = mobileOptimized && isMobile ? {
    count: Math.floor(count * 0.6), // 40% fewer particles
    density: 'sparse' as const, // Reduce density
    animationSpeed: 'fast' as const, // Faster for smoother feel
    enablePhysics: false, // Disable physics
    ...props
  } : { count, density, animationSpeed, enablePhysics, ...props };

  return (
    <FeatureFlag 
      name="phase3.2" 
      fallback={
        <div className={cn('relative w-full h-full', props.className)}>
          {props.children}
          {/* Subtle CSS-only sparkle effect as fallback */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-400/30 rounded-full animate-ping" />
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-yellow-400/30 rounded-full animate-bounce" />
          </div>
        </div>
      }
    >
      <Suspense fallback={
        <div className={cn('relative w-full h-full', props.className)}>
          {props.children}
          <AdvancedWeddingLoader type="sparkles" className="absolute inset-0" />
        </div>
      }>
        <Sparkles {...optimizedProps} />
      </Suspense>
    </FeatureFlag>
  );
};

/**
 * Phase 3.2 Card 3D - Advanced 3D card with tilt and lighting effects
 * Mobile optimized with reduced rotation range and simplified effects
 */
export interface Phase32Card3DProps {
  rotationRange?: number;
  tiltReverse?: boolean;
  glareIntensity?: number;
  shadowIntensity?: number;
  scaleOnHover?: number;
  enableGlow?: boolean;
  glassmorphism?: boolean;
  perspective?: number;
  resetDuration?: number;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
  onHover?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
  children?: React.ReactNode;
  mobileOptimized?: boolean;
}

export const Phase32Card3D: React.FC<Phase32Card3DProps> = ({ 
  mobileOptimized = true,
  rotationRange = 15,
  glareIntensity = 0.3,
  shadowIntensity = 0.5,
  enableGlow = true,
  perspective = 1000,
  ...props 
}) => {
  // Mobile performance optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const optimizedProps = mobileOptimized && isMobile ? {
    rotationRange: rotationRange * 0.4, // Reduce rotation for performance
    glareIntensity: glareIntensity * 0.6, // Reduce glare intensity
    shadowIntensity: shadowIntensity * 0.7, // Reduce shadow complexity
    enableGlow: false, // Disable glow on mobile
    perspective: perspective * 0.8, // Reduce perspective for smoother animation
    ...props
  } : { rotationRange, glareIntensity, shadowIntensity, enableGlow, perspective, ...props };

  return (
    <FeatureFlag 
      name="phase3.2" 
      fallback={
        // Enhanced glass card fallback
        <div className={cn(
          'relative rounded-xl overflow-hidden cursor-pointer',
          'bg-white/10 backdrop-blur-md border border-white/20',
          'shadow-lg hover:shadow-xl transition-all duration-300',
          'hover:scale-105 transform-gpu',
          props.className
        )}>
          <div className={cn('relative z-10 p-6', props.contentClassName)}>
            {props.children}
          </div>
          
          {/* Simple glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
        </div>
      }
    >
      <Suspense fallback={
        <AdvancedWeddingLoader type="card" className={cn('rounded-xl', props.className)} />
      }>
        <Card3D {...optimizedProps} />
      </Suspense>
    </FeatureFlag>
  );
};

/**
 * Wedding-specific variants for common use cases
 */

// Wedding venue showcase with parallax
export const WeddingVenueHero: React.FC<Omit<Phase32HeroParallaxProps, 'theme'>> = (props) => (
  <Phase32HeroParallax 
    {...props}
    className={cn(
      'bg-gradient-to-br from-pink-900/30 via-purple-900/20 to-rose-900/30',
      props.className
    )}
  />
);

// Interactive vendor card with 3D effects
export const VendorCard3D: React.FC<Omit<Phase32Card3DProps, 'theme'>> = (props) => (
  <Phase32Card3D 
    {...props}
    glassmorphism={true}
    enableGlow={true}
    className={cn(
      'bg-gradient-to-br from-white/10 to-white/5',
      'border-pink-200/30 shadow-pink-500/10',
      props.className
    )}
  />
);

// Romantic page wrapper with ambient sparkles
export const RomanticPageWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <Phase32Sparkles
    mouseBehavior="ambient"
    density="sparse"
    trigger="always"
    count={15}
    className={cn('min-h-screen', className)}
  >
    {children}
  </Phase32Sparkles>
);

// Gallery hero with multiple venue images
export const WeddingGalleryHero: React.FC<{
  images: Array<{ src: string; alt: string }>;
  coupleNames: { bride: string; groom: string };
  weddingDate: string;
  className?: string;
}> = ({ images, coupleNames, weddingDate, className }) => (
  <WeddingVenueHero
    images={images}
    coupleNames={coupleNames}
    weddingDate={weddingDate}
    title="Our Wedding Gallery"
    subtitle="Moments captured in time, love preserved forever"
    parallaxIntensity={150}
    className={className}
  >
    <div className="mt-8">
      <button className="px-8 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-300">
        View All Photos
      </button>
    </div>
  </WeddingVenueHero>
);

export default {
  Phase32HeroParallax,
  Phase32Sparkles,
  Phase32Card3D,
  WeddingVenueHero,
  VendorCard3D,
  RomanticPageWrapper,
  WeddingGalleryHero
};