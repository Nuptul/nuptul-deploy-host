import React, { useState, useRef, MouseEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlareCardProps {
  children: ReactNode;
  className?: string;
  glareColor?: string;
  glareSize?: number;
  glareOpacity?: number;
  rotationRange?: number;
  disabled?: boolean;
}

/**
 * Wedding-themed glare card with sophisticated hover effects
 * Perfect for venue photos, vendor showcases, and gallery items
 */
export const GlareCard: React.FC<GlareCardProps> = ({
  children,
  className,
  glareColor = 'rgba(255, 255, 255, 0.3)',
  glareSize = 400,
  glareOpacity = 0.6,
  rotationRange = 20,
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Mouse position relative to card
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Rotation calculation
    const rotateX = ((e.clientY - centerY) / rect.height) * rotationRange;
    const rotateY = ((e.clientX - centerX) / rect.width) * rotationRange * -1;
    
    setMousePosition({ x: mouseX, y: mouseY });
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden',
        'rounded-xl',
        'transform-gpu perspective-1000',
        !disabled && 'cursor-pointer',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{
        duration: 0.1,
        ease: 'easeOut'
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Glare Effect */}
      {!disabled && (
        <div
          className={cn(
            'absolute inset-0 pointer-events-none',
            'transition-opacity duration-300 ease-out',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            background: `radial-gradient(${glareSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glareColor}, transparent 70%)`,
            opacity: glareOpacity,
          }}
        />
      )}

      {/* Subtle Border Highlight */}
      {!disabled && (
        <div
          className={cn(
            'absolute inset-0 rounded-[inherit]',
            'bg-gradient-to-br from-white/20 to-transparent',
            'transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-50'
          )}
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 255, 255, 0.1) 0%, 
              transparent 25%, 
              transparent 75%, 
              rgba(255, 255, 255, 0.1) 100%
            )`,
          }}
        />
      )}

      {/* Wedding-specific shimmer effect */}
      {!disabled && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              45deg,
              transparent 30%,
              rgba(255, 215, 0, 0.1) 50%,
              transparent 70%
            )`,
            transform: `translateX(${(mousePosition.x / 300) * 100 - 50}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      )}
    </motion.div>
  );
};

export default GlareCard;