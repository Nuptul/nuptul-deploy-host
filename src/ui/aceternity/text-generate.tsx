import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TextGenerateProps {
  text: string;
  className?: string;
  duration?: number;
  staggerDelay?: number;
  once?: boolean;
  filter?: boolean;
  wedding?: boolean; // Wedding-specific styling
}

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
};

const weddingWordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
};

/**
 * Wedding-themed text generation animation
 * Perfect for announcements, loading states, and romantic reveals
 */
export const TextGenerate: React.FC<TextGenerateProps> = ({
  text,
  className,
  duration = 0.8,
  staggerDelay = 0.05,
  once = true,
  filter = true,
  wedding = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const words = text.split(' ');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const selectedVariants = wedding ? weddingWordVariants : wordVariants;

  return (
    <motion.div
      className={cn('font-bold', className)}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {words.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          variants={selectedVariants}
          className={cn(
            'inline-block mr-1',
            wedding && 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600'
          )}
          transition={{
            duration: duration,
            ease: [0.25, 0.4, 0.55, 1.4], // Wedding-appropriate easing
            delay: idx * staggerDelay,
          }}
          style={{
            filter: filter ? undefined : 'none',
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

/**
 * Wedding announcement variant with special styling
 */
export const WeddingAnnouncement: React.FC<Omit<TextGenerateProps, 'wedding'>> = (props) => (
  <TextGenerate 
    {...props} 
    wedding={true}
    className={cn(
      'text-2xl md:text-4xl lg:text-6xl font-bold text-center',
      'drop-shadow-lg',
      props.className
    )}
    duration={1.2}
    staggerDelay={0.08}
  />
);

/**
 * Loading text variant
 */
export const LoadingText: React.FC<Omit<TextGenerateProps, 'duration' | 'staggerDelay'>> = (props) => (
  <TextGenerate 
    {...props}
    className={cn('text-lg text-gray-600', props.className)}
    duration={0.6}
    staggerDelay={0.03}
  />
);

/**
 * Subtitle variant for elegant reveals
 */
export const SubtitleReveal: React.FC<Omit<TextGenerateProps, 'wedding'>> = (props) => (
  <TextGenerate 
    {...props}
    wedding={true}
    className={cn(
      'text-lg md:text-xl text-center',
      'text-gray-700 font-medium',
      props.className
    )}
    duration={0.9}
    staggerDelay={0.04}
  />
);

export default TextGenerate;