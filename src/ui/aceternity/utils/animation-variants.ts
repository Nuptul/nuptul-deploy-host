import { Variants } from 'framer-motion';

/**
 * Wedding-themed animation variants for consistent motion design
 */

// Card animations
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Modal animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Overlay animations
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

// Staggered children animations
export const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// Elegant slide animations
export const slideVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.55, 1.4],
    },
  },
};

// Wedding-specific romantic variants
export const romanticVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1], // Bounce easing for playful feel
    },
  },
};

// Hover interactions
export const hoverVariants: Variants = {
  rest: {
    scale: 1,
    filter: 'brightness(1)',
  },
  hover: {
    scale: 1.05,
    filter: 'brightness(1.1)',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// List item animations
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.4,
      ease: [0.25, 0.4, 0.55, 1.4],
    },
  }),
};

// Wedding easing functions
export const weddingEasing = {
  gentle: [0.25, 0.4, 0.55, 1],
  romantic: [0.34, 1.56, 0.64, 1],
  elegant: [0.4, 0, 0.2, 1],
  playful: [0.68, -0.55, 0.265, 1.55],
} as const;

// Wedding durations
export const weddingDurations = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  romantic: 0.8,
  dramatic: 1.2,
} as const;