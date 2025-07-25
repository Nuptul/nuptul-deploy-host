import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuroraClockProps {
  targetDate: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

interface TimeState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const AuroraClock: React.FC<AuroraClockProps> = ({ 
  targetDate, 
  className,
  size = 'medium'
}) => {
  const [timeState, setTimeState] = useState<TimeState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!targetDate || !mounted) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeState({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
          isPast: false,
        });
      } else {
        setTimeState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate, mounted]);

  if (!mounted || timeState === null) {
    return (
      <div className={cn("flex justify-center items-center", className)}>
        <div className="liquid-glass p-8 animate-pulse">
          <div className="flex items-center justify-center">
            <div className="h-16 w-64 bg-white/20 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (timeState.isPast) {
    return (
      <motion.div 
        className={cn("liquid-glass p-8 text-center", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-3xl font-bold text-wedding-navy mb-2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💍 We're Married! 💍
        </motion.h2>
        <p className="text-wedding-navy/70">Thank you for celebrating with us!</p>
      </motion.div>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeState.days },
    { label: 'Hours', value: timeState.hours },
    { label: 'Minutes', value: timeState.minutes },
    { label: 'Seconds', value: timeState.seconds }
  ];

  const sizeStyles = {
    small: {
      container: 'p-4',
      title: 'text-sm',
      number: 'text-3xl',
      label: 'text-xs',
      gap: 'gap-3'
    },
    medium: {
      container: 'p-6',
      title: 'text-base',
      number: 'text-4xl',
      label: 'text-sm',
      gap: 'gap-4'
    },
    large: {
      container: 'p-8',
      title: 'text-lg',
      number: 'text-5xl',
      label: 'text-base',
      gap: 'gap-6'
    }
  };

  const styles = sizeStyles[size];

  return (
    <motion.div 
      className={cn("liquid-glass", styles.container, className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className={cn("text-center text-wedding-navy/70 font-medium mb-6", styles.title)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Until We Say "I Do"
      </motion.h3>
      
      <div className={cn("flex justify-center items-center", styles.gap)}>
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold/20 to-wedding-gold/5 rounded-lg blur-xl"></div>
              <div className="relative bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/30 shadow-lg">
                <motion.div
                  key={unit.value}
                  className={cn("font-bold text-wedding-navy tabular-nums", styles.number)}
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {unit.value.toString().padStart(2, '0')}
                </motion.div>
              </div>
            </motion.div>
            <div className={cn("text-wedding-navy/60 font-medium mt-2", styles.label)}>
              {unit.label}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="flex justify-center mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div className="h-px w-12 bg-wedding-gold/30"></div>
          <div className="w-2 h-2 rounded-full bg-wedding-gold/50"></div>
          <div className="h-px w-12 bg-wedding-gold/30"></div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuroraClock;