import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  overlayClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'scale' | 'slide' | 'fade';
}

const modalVariants: Record<string, Variants> = {
  scale: {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },
  slide: {
    hidden: { 
      opacity: 0, 
      y: 50
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: 30,
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.15 }
    }
  }
};

const overlayVariants: Variants = {
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

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg', 
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

/**
 * Wedding-themed animated modal with glassmorphism styling
 * Integrates Framer Motion animations with Radix UI accessibility
 */
export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  overlayClassName,
  size = 'md',
  animation = 'scale'
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Animated Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                className={cn(
                  'fixed inset-0 z-50',
                  'bg-black/40 backdrop-blur-md',
                  'flex items-center justify-center p-4',
                  overlayClassName
                )}
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            </Dialog.Overlay>

            {/* Animated Content */}
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  'fixed left-1/2 top-1/2 z-50',
                  'w-full max-h-[90vh] overflow-hidden',
                  sizeClasses[size],
                  'bg-white/25 backdrop-blur-xl',
                  'rounded-2xl border border-white/30',
                  'shadow-2xl shadow-purple-500/20',
                  className
                )}
                style={{
                  x: '-50%',
                  y: '-50%',
                }}
                variants={modalVariants[animation]}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Header */}
                {(title || description) && (
                  <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <div>
                      {title && (
                        <Dialog.Title className="text-xl font-bold text-gray-800">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="text-sm text-gray-600 mt-1">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    
                    <Dialog.Close asChild>
                      <button
                        className={cn(
                          'w-8 h-8 rounded-full',
                          'bg-white/20 hover:bg-white/30',
                          'backdrop-blur-sm border border-white/30',
                          'flex items-center justify-center',
                          'transition-all duration-200',
                          'hover:scale-110 active:scale-95'
                        )}
                        aria-label="Close modal"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </Dialog.Close>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {children}
                </div>

                {/* Subtle Inner Glow */}
                <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 to-transparent rounded-[inherit] pointer-events-none" />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default AnimatedModal;