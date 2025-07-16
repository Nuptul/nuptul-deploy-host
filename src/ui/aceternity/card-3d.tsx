import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { BaseAceternityProps, WeddingTheme, RelativeMousePosition } from './types/aceternity';

export interface Card3DProps extends BaseAceternityProps {
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
}

const Card3D: React.FC<Card3DProps> = ({
  children,
  rotationRange = 15,
  tiltReverse = false,
  glareIntensity = 0.3,
  shadowIntensity = 0.5,
  scaleOnHover = 1.05,
  enableGlow = true,
  glassmorphism = true,
  perspective = 1000,
  resetDuration = 300,
  theme = 'romantic',
  className,
  cardClassName,
  contentClassName,
  onHover,
  onLeave,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Motion values for smooth animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animations for smooth movement
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], 
    tiltReverse ? [-rotationRange, rotationRange] : [rotationRange, -rotationRange]
  ), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], 
    tiltReverse ? [rotationRange, -rotationRange] : [-rotationRange, rotationRange]
  ), springConfig);

  // Scale and glow effects
  const scale = useSpring(1, springConfig);
  const glareOpacity = useSpring(0, springConfig);
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  // Check if device supports hover (not mobile)
  React.useEffect(() => {
    setIsMobile(window.matchMedia('(hover: none)').matches);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseXRelative = (e.clientX - centerX) / (rect.width / 2);
    const mouseYRelative = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(mouseXRelative);
    mouseY.set(mouseYRelative);
  }, [mouseX, mouseY, isMobile]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;

    setIsHovered(true);
    scale.set(scaleOnHover);
    glareOpacity.set(glareIntensity);
    onHover?.();
  }, [scale, scaleOnHover, glareOpacity, glareIntensity, onHover, isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;

    setIsHovered(false);
    
    // Reset all transformations
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
    glareOpacity.set(0);
    
    onLeave?.();
  }, [mouseX, mouseY, scale, glareOpacity, onLeave, isMobile]);

  const handleTouchStart = useCallback(() => {
    if (!isMobile) return;
    
    setIsHovered(true);
    scale.set(scaleOnHover * 0.98); // Slightly less scale for mobile
    onHover?.();
  }, [scale, scaleOnHover, onHover, isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile) return;
    
    setIsHovered(false);
    scale.set(1);
    onLeave?.();
  }, [scale, onLeave, isMobile]);

  const themeStyles = {
    romantic: {
      shadow: 'shadow-pink-500/20',
      glow: 'shadow-pink-500/30',
      glare: 'from-pink-400/30 via-purple-400/20 to-rose-400/30',
      border: 'border-pink-200/20',
      background: glassmorphism ? 'bg-white/10 backdrop-blur-md' : 'bg-gradient-to-br from-pink-50 to-purple-50'
    },
    elegant: {
      shadow: 'shadow-gray-500/20',
      glow: 'shadow-gray-400/30',
      glare: 'from-gray-400/30 via-slate-400/20 to-gray-400/30',
      border: 'border-gray-200/20',
      background: glassmorphism ? 'bg-white/10 backdrop-blur-md' : 'bg-gradient-to-br from-gray-50 to-slate-50'
    },
    modern: {
      shadow: 'shadow-blue-500/20',
      glow: 'shadow-blue-500/30',
      glare: 'from-blue-400/30 via-cyan-400/20 to-blue-400/30',
      border: 'border-blue-200/20',
      background: glassmorphism ? 'bg-white/10 backdrop-blur-md' : 'bg-gradient-to-br from-blue-50 to-cyan-50'
    },
    classic: {
      shadow: 'shadow-amber-500/20',
      glow: 'shadow-amber-500/30',
      glare: 'from-amber-400/30 via-yellow-400/20 to-amber-400/30',
      border: 'border-amber-200/20',
      background: glassmorphism ? 'bg-white/10 backdrop-blur-md' : 'bg-gradient-to-br from-amber-50 to-yellow-50'
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <div 
      className={cn("relative", className)}
      style={{ perspective: `${perspective}px` }}
    >
      <motion.div
        ref={cardRef}
        className={cn(
          "relative rounded-xl overflow-hidden cursor-pointer transition-colors duration-300",
          "border border-white/20",
          currentTheme.background,
          currentTheme.border,
          // Dynamic shadow based on hover state
          isHovered 
            ? `shadow-2xl ${enableGlow ? currentTheme.glow : currentTheme.shadow}`
            : `shadow-lg ${currentTheme.shadow}`,
          cardClassName
        )}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d"
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={onClick}
        whileTap={isMobile ? { scale: 0.98 } : {}}
      >
        {/* Content */}
        <div 
          className={cn(
            "relative z-10 p-6",
            contentClassName
          )}
          style={{
            transform: "translateZ(50px)"
          }}
        >
          {children}
        </div>

        {/* Glare effect */}
        <motion.div
          className={cn(
            "absolute inset-0 pointer-events-none",
            "bg-gradient-to-br",
            currentTheme.glare
          )}
          style={{
            opacity: glareOpacity,
            background: useTransform(
              [glareX, glareY],
              ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.8) 0%, transparent 50%)`
            )
          }}
        />

        {/* Glass reflection effect */}
        {glassmorphism && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
        )}

        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />

        {/* Enhanced shadow for depth */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-xl blur-xl"
          style={{
            backgroundColor: theme === 'romantic' ? 'rgba(236, 72, 153, 0.1)' :
                           theme === 'elegant' ? 'rgba(107, 114, 128, 0.1)' :
                           theme === 'modern' ? 'rgba(59, 130, 246, 0.1)' :
                           'rgba(245, 158, 11, 0.1)',
            opacity: useTransform(scale, [1, scaleOnHover], [0, shadowIntensity])
          }}
        />
      </motion.div>

      {/* Romantic floating particles for wedding theme */}
      {theme === 'romantic' && isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-pink-300/60 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Card3D;