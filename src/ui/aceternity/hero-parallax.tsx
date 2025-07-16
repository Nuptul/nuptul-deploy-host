import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { BaseAceternityProps, WeddingTheme } from './types/aceternity';

export interface ParallaxImage {
  src: string;
  alt: string;
  className?: string;
}

export interface HeroParallaxProps extends BaseAceternityProps {
  images: ParallaxImage[];
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
}

const useParallax = (value: MotionValue<number>, distance: number) => {
  return useTransform(value, [0, 1], [-distance, distance]);
};

const HeroParallax: React.FC<HeroParallaxProps> = ({
  images,
  title = "Our Wedding",
  subtitle,
  coupleNames,
  weddingDate,
  scrollSpeed = 0.5,
  overlayOpacity = 0.4,
  enableBlur = true,
  parallaxIntensity = 200,
  theme = 'romantic',
  className,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Create smooth spring animations
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Multiple parallax layers for depth
  const y1 = useParallax(smoothProgress, parallaxIntensity * 0.3);
  const y2 = useParallax(smoothProgress, parallaxIntensity * 0.6);
  const y3 = useParallax(smoothProgress, parallaxIntensity);
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const blur = useTransform(scrollYProgress, [0, 1], [0, enableBlur ? 8 : 0]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const themeClasses = {
    romantic: 'from-pink-900/30 via-purple-900/20 to-rose-900/30',
    elegant: 'from-gray-900/40 via-slate-800/30 to-gray-900/40',
    modern: 'from-blue-900/30 via-indigo-900/20 to-purple-900/30',
    classic: 'from-amber-900/30 via-yellow-900/20 to-orange-900/30'
  };

  const getImageGridPosition = (index: number, total: number) => {
    if (isMobile) {
      return {
        gridColumn: '1',
        top: `${(index * 60) % 200}vh`,
        left: index % 2 === 0 ? '5%' : '55%',
        width: '40%',
        height: '45vh'
      };
    }
    
    // Desktop grid layout
    const columns = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    return {
      gridColumn: `${col + 1}`,
      gridRow: `${row + 1}`,
      top: `${(row * 30) + (col * 10)}vh`,
      left: `${(col * 25) + 10}%`,
      width: `${20 + (index % 3) * 5}%`,
      height: `${40 + (index % 2) * 20}vh`
    };
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-[200vh] overflow-hidden",
        "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
        className
      )}
    >
      {/* Background Images with Parallax */}
      <div className="absolute inset-0">
        {images.map((image, index) => {
          const yTransform = index % 3 === 0 ? y1 : index % 3 === 1 ? y2 : y3;
          const imageStyle = getImageGridPosition(index, images.length);
          
          return (
            <motion.div
              key={index}
              className="absolute"
              style={{
                ...imageStyle,
                y: isMobile ? 0 : yTransform,
                scale: isMobile ? 1 : scale,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { 
                  delay: index * 0.1,
                  duration: 0.8,
                  ease: [0.25, 0.4, 0.55, 1.4]
                }
              }}
            >
              <motion.img
                src={image.src}
                alt={image.alt}
                className={cn(
                  "w-full h-full object-cover rounded-xl shadow-2xl",
                  "border border-white/10",
                  image.className
                )}
                style={{
                  filter: blur,
                }}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              
              {/* Glass overlay on each image */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple/10 rounded-xl" />
            </motion.div>
          );
        })}
      </div>

      {/* Gradient Overlay */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-b",
          themeClasses[theme]
        )}
        style={{ opacity }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <motion.div
          className="text-center max-w-4xl mx-auto px-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: {
              duration: 1,
              delay: 0.5,
              ease: [0.25, 0.4, 0.55, 1.4]
            }
          }}
          style={{ opacity }}
        >
          {/* Couple Names */}
          {coupleNames && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: 0.8, duration: 0.8 }
              }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-light text-white mb-4">
                <span className="bg-gradient-to-r from-pink-200 via-purple-200 to-rose-200 bg-clip-text text-transparent">
                  {coupleNames.bride}
                </span>
                <span className="text-white/80 mx-4 text-3xl md:text-4xl lg:text-6xl">&</span>
                <span className="bg-gradient-to-r from-rose-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  {coupleNames.groom}
                </span>
              </h1>
            </motion.div>
          )}

          {/* Title */}
          {title && (
            <motion.h2
              className="text-2xl md:text-4xl lg:text-5xl font-light text-white/90 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 1, duration: 0.8 }
              }}
            >
              {title}
            </motion.h2>
          )}

          {/* Wedding Date */}
          {weddingDate && (
            <motion.div
              className="text-lg md:text-xl lg:text-2xl text-white/70 mb-8 font-light tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 1.2, duration: 0.8 }
              }}
            >
              {weddingDate}
            </motion.div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              className="text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 1.4, duration: 0.8 }
              }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Children content */}
          {children && (
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 1.6, duration: 0.8 }
              }}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { delay: 2, duration: 1 }
        }}
        style={{ opacity }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
            animate={{
              height: [12, 6, 12],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroParallax;