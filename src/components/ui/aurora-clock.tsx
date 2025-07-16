import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Heart, Sparkles } from 'lucide-react';

interface AuroraClockProps {
  targetDate: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showRings?: boolean;
  theme?: 'wedding' | 'glass' | 'luxury';
}

interface TimeState {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
}

const AuroraClock: React.FC<AuroraClockProps> = ({ 
  targetDate, 
  className,
  size = 'medium',
  showRings = true,
  theme = 'wedding'
}) => {
  const [timeState, setTimeState] = useState<TimeState | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Size configurations for wedding theme
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'small':
        return {
          container: 'p-4',
          number: 'text-2xl sm:text-3xl',
          label: 'text-xs',
          spacing: 'gap-3 sm:gap-4',
          cardSize: 'w-16 h-20 sm:w-20 sm:h-24',
          padding: 'p-3'
        };
      case 'large':
        return {
          container: 'p-8',
          number: 'text-4xl sm:text-6xl',
          label: 'text-sm sm:text-base',
          spacing: 'gap-6 sm:gap-8',
          cardSize: 'w-24 h-32 sm:w-32 sm:h-40',
          padding: 'p-6'
        };
      default: // medium
        return {
          container: 'p-6',
          number: 'text-3xl sm:text-4xl',
          label: 'text-xs sm:text-sm',
          spacing: 'gap-4 sm:gap-6',
          cardSize: 'w-20 h-24 sm:w-24 sm:h-28',
          padding: 'p-4'
        };
    }
  }, [size]);

  // Wedding theme configurations
  const themeConfig = useMemo(() => {
    switch (theme) {
      case 'glass':
        return {
          cardBg: 'bg-white/10 backdrop-blur-md border border-white/20',
          numberColor: 'text-wedding-navy',
          labelColor: 'text-wedding-navy/70',
          accentColor: 'text-wedding-gold',
          shadowColor: 'rgba(212, 175, 55, 0.2)'
        };
      case 'luxury':
        return {
          cardBg: 'bg-gradient-to-br from-wedding-navy/5 to-wedding-gold/10 backdrop-blur-sm border border-wedding-gold/20',
          numberColor: 'text-wedding-navy',
          labelColor: 'text-wedding-navy/60',
          accentColor: 'text-wedding-gold',
          shadowColor: 'rgba(212, 175, 55, 0.3)'
        };
      default: // wedding
        return {
          cardBg: 'glass-card',
          numberColor: 'text-wedding-navy',
          labelColor: 'text-wedding-navy/70',
          accentColor: 'text-wedding-gold',
          shadowColor: 'rgba(44, 62, 80, 0.1)'
        };
    }
  }, [theme]);

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeState({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          isPast: false,
        });
      } else {
        setTimeState({ days: 0, hours: 0, minutes: 0, isPast: true });
      }
    }, 1000);

    // Trigger visibility animation
    setIsVisible(true);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Wedding sparkle effects
  const WeddingSparkles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gold sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-3 h-3 text-wedding-gold" />
        </motion.div>
      ))}
      
      {/* Floating hearts */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute text-wedding-gold/30"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [-10, -20, -10],
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        >
          <Heart className="w-2 h-2 fill-current" />
        </motion.div>
      ))}
    </div>
  );

  // Wedding card time unit
  const TimeUnit = ({ value, label, index }: { value: number; label: string; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.15,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      className="relative flex flex-col items-center"
    >
      {/* Glass card container */}
      <motion.div
        className={cn(
          "relative rounded-2xl shadow-lg overflow-hidden",
          themeConfig.cardBg,
          sizeConfig.cardSize,
          sizeConfig.padding
        )}
        style={{
          boxShadow: `0 8px 32px ${themeConfig.shadowColor}, 0 4px 16px rgba(0, 0, 0, 0.1)`
        }}
        whileHover={{ 
          scale: 1.05,
          y: -2,
          transition: { type: "spring", stiffness: 400, damping: 17 }
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold/5 to-transparent rounded-2xl" />
        
        {/* Number display */}
        <motion.div
          className={cn(
            "relative z-10 font-bold tabular-nums text-center flex items-center justify-center h-full",
            sizeConfig.number,
            themeConfig.numberColor
          )}
          style={{
            fontFamily: "'Playfair Display', serif"
          }}
          key={value} // Force re-render on value change
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {value.toString().padStart(2, '0')}
        </motion.div>
        
        {/* Gold accent line */}
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-wedding-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '60%' }}
          transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
        />
      </motion.div>
      
      {/* Label */}
      <motion.div
        className={cn(
          "font-medium uppercase tracking-wider mt-3 text-center",
          sizeConfig.label,
          themeConfig.labelColor
        )}
        style={{
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.1em'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.15 + 0.4 }}
      >
        {label}
      </motion.div>

      {/* Floating ring animation (if enabled) */}
      {showRings && (
        <motion.div
          className="absolute -inset-2 rounded-3xl border border-wedding-gold/20"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 0.5,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );

  if (timeState === null) {
    return (
      <div className={cn("flex justify-center items-center", className)}>
        <div className="animate-pulse flex space-x-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className={cn("bg-gray-300 rounded", sizeConfig.ringSize)} />
              <div className="bg-gray-300 h-4 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (timeState.isPast) {
    return (
      <motion.div 
        className={cn("relative glass-card rounded-3xl overflow-hidden", sizeConfig.container, className)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <WeddingSparkles />
        <div className="relative z-10 text-center">
          <motion.div
            className={cn("font-bold mb-4", sizeConfig.number, themeConfig.numberColor)}
            style={{
              fontFamily: "'Playfair Display', serif",
            }}
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            💍 We're Married! 💍
          </motion.div>
          <motion.div
            className={cn("font-medium", sizeConfig.label, themeConfig.labelColor)}
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Thank you for celebrating with us!
          </motion.div>
          
          {/* Celebration hearts */}
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-4 h-4 text-wedding-gold fill-current" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const timeParts = [
    { label: 'Days', value: timeState.days },
    { label: 'Hours', value: timeState.hours },
    { label: 'Minutes', value: timeState.minutes },
    // Note: Seconds removed as per requirements
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={cn("relative glass-card rounded-3xl overflow-hidden", sizeConfig.container, className)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <WeddingSparkles />
          
          {/* Wedding title */}
          <motion.div 
            className="relative z-10 text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={cn("font-medium text-wedding-navy/70 tracking-wider uppercase", sizeConfig.label)}>
              Until We Say "I Do"
            </h3>
          </motion.div>
          
          {/* Main countdown display */}
          <div className={cn("relative z-10 flex justify-center items-end", sizeConfig.spacing)}>
            {timeParts.map((part, index) => (
              <TimeUnit 
                key={part.label}
                value={part.value} 
                label={part.label} 
                index={index}
              />
            ))}
          </div>
          
          {/* Bottom decoration */}
          <motion.div 
            className="relative z-10 text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex justify-center items-center gap-3">
              <div className="h-px bg-wedding-gold/30 flex-1 max-w-12"></div>
              <Heart className="w-3 h-3 text-wedding-gold fill-current" />
              <div className="h-px bg-wedding-gold/30 flex-1 max-w-12"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuroraClock;