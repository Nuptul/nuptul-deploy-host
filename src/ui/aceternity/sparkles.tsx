import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { BaseAceternityProps, WeddingTheme, MousePosition } from './types/aceternity';

export interface SparkleConfig {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  opacity: number;
}

export interface SparklesProps extends BaseAceternityProps {
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
}

const defaultColors = {
  romantic: ['#FFD700', '#FFC0CB', '#DDA0DD', '#F0E68C', '#FFB6C1'],
  elegant: ['#C0C0C0', '#D3D3D3', '#E6E6FA', '#F5F5F5', '#DCDCDC'],
  modern: ['#00CED1', '#87CEEB', '#B0E0E6', '#ADD8E6', '#E0FFFF'],
  classic: ['#FFD700', '#DAA520', '#B8860B', '#CD853F', '#DEB887']
};

const Sparkles: React.FC<SparklesProps> = ({
  count = 20,
  minSize = 4,
  maxSize = 8,
  colors,
  mouseBehavior = 'ambient',
  animationSpeed = 'medium',
  density = 'normal',
  theme = 'romantic',
  className,
  trigger = 'always',
  burstIntensity = 10,
  particleLifetime = 3000,
  enablePhysics = false,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sparkles, setSparkles] = useState<SparkleConfig[]>([]);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(trigger === 'always');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const sparkleColors = colors || defaultColors[theme];
  
  const densityMultiplier = {
    sparse: 0.5,
    normal: 1,
    dense: 1.5
  };

  const speedMultiplier = {
    slow: 1.5,
    medium: 1,
    fast: 0.6
  };

  // Update container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Generate random sparkle
  const generateSparkle = useCallback((
    x?: number, 
    y?: number, 
    customSize?: number
  ): SparkleConfig => {
    const size = customSize || (minSize + Math.random() * (maxSize - minSize));
    const baseLifetime = particleLifetime * speedMultiplier[animationSpeed];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: x ?? Math.random() * dimensions.width,
      y: y ?? Math.random() * dimensions.height,
      size,
      delay: Math.random() * 1000,
      duration: baseLifetime * (0.5 + Math.random() * 0.5),
      color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
      opacity: 0.6 + Math.random() * 0.4
    };
  }, [minSize, maxSize, sparkleColors, animationSpeed, particleLifetime, dimensions]);

  // Mouse tracking
  useEffect(() => {
    if (mouseBehavior === 'follow' || mouseBehavior === 'burst' || mouseBehavior === 'trail') {
      const handleMouseMove = (e: MouseEvent) => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
        }
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener('mousemove', handleMouseMove);
        return () => container.removeEventListener('mousemove', handleMouseMove);
      }
    }
  }, [mouseBehavior]);

  // Generate burst effect
  const generateBurst = useCallback((x: number, y: number) => {
    const burstSparkles = Array.from({ length: burstIntensity }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50;
      return generateSparkle(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        minSize + Math.random() * 2
      );
    });
    
    setSparkles(prev => [...prev, ...burstSparkles]);
  }, [generateSparkle, burstIntensity, minSize]);

  // Handle click for burst
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (trigger === 'click' || mouseBehavior === 'burst') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        generateBurst(x, y);
      }
    }
  }, [trigger, mouseBehavior, generateBurst]);

  // Generate trail effect
  useEffect(() => {
    if (mouseBehavior === 'trail' && isHovered) {
      const interval = setInterval(() => {
        const trailSparkle = generateSparkle(
          mousePosition.x + (Math.random() - 0.5) * 20,
          mousePosition.y + (Math.random() - 0.5) * 20,
          minSize
        );
        setSparkles(prev => [...prev, trailSparkle]);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [mouseBehavior, isHovered, mousePosition, generateSparkle, minSize]);

  // Generate follow effect
  useEffect(() => {
    if (mouseBehavior === 'follow' && isHovered) {
      const followSparkles = Array.from({ length: 3 }, () => 
        generateSparkle(
          mousePosition.x + (Math.random() - 0.5) * 40,
          mousePosition.y + (Math.random() - 0.5) * 40
        )
      );
      setSparkles(prev => [...prev, ...followSparkles]);
    }
  }, [mousePosition, mouseBehavior, isHovered, generateSparkle]);

  // Generate ambient sparkles
  useEffect(() => {
    if (!isActive && trigger !== 'always') return;

    const interval = setInterval(() => {
      if (mouseBehavior === 'ambient' || (!isHovered && mouseBehavior !== 'follow')) {
        const newSparkles = Array.from(
          { length: Math.ceil(count * densityMultiplier[density] * 0.1) },
          () => generateSparkle()
        );
        setSparkles(prev => [...prev, ...newSparkles]);
      }
    }, 500 * speedMultiplier[animationSpeed]);

    return () => clearInterval(interval);
  }, [count, density, animationSpeed, mouseBehavior, isHovered, isActive, generateSparkle, trigger]);

  // Clean up expired sparkles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSparkles(prev => prev.filter(sparkle => 
        Date.now() - parseInt(sparkle.id, 36) < sparkle.duration
      ));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  // Handle trigger states
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (trigger === 'hover') {
      setIsActive(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (trigger === 'hover') {
      setIsActive(false);
    }
  };

  const getSparkleAnimation = (sparkle: SparkleConfig) => {
    const baseAnimation = {
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      opacity: [0, sparkle.opacity, 0]
    };

    if (enablePhysics) {
      return {
        ...baseAnimation,
        y: [sparkle.y, sparkle.y - 20, sparkle.y + 10],
        x: [sparkle.x, sparkle.x + (Math.random() - 0.5) * 30, sparkle.x]
      };
    }

    return baseAnimation;
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute"
              style={{
                left: sparkle.x,
                top: sparkle.y,
                width: sparkle.size,
                height: sparkle.size,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={getSparkleAnimation(sparkle)}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                duration: sparkle.duration / 1000,
                delay: sparkle.delay / 1000,
                ease: [0.25, 0.4, 0.55, 1.4]
              }}
            >
              {/* Star shape sparkle */}
              <svg
                width={sparkle.size}
                height={sparkle.size}
                viewBox="0 0 24 24"
                fill="none"
                className="drop-shadow-sm"
              >
                <path
                  d="M12 2L14.09 8.26L20 9L15 14L16.18 20L12 17L7.82 20L9 14L4 9L9.91 8.26L12 2Z"
                  fill={sparkle.color}
                  style={{ opacity: sparkle.opacity }}
                />
              </svg>
              
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-full blur-sm"
                style={{
                  background: sparkle.color,
                  opacity: sparkle.opacity * 0.3,
                  transform: 'scale(1.5)'
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Ambient glow overlay for romantic theme */}
      {theme === 'romantic' && isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full h-full bg-gradient-radial from-pink-500/10 via-purple-500/5 to-transparent" />
        </motion.div>
      )}
    </div>
  );
};

export default Sparkles;