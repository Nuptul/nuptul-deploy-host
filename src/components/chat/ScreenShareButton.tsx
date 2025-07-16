import React, { useState, useCallback } from 'react';
import { Monitor, MonitorOff, Share, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ScreenShareButtonProps {
  isSharing: boolean;
  onStartShare: (stream: MediaStream) => void;
  onStopShare: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

const ScreenShareButton: React.FC<ScreenShareButtonProps> = ({
  isSharing,
  onStartShare,
  onStopShare,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'h-8 w-8',
      icon: 'w-4 h-4',
      text: 'text-xs'
    },
    md: {
      button: 'h-10 w-10',
      icon: 'w-5 h-5',
      text: 'text-sm'
    },
    lg: {
      button: 'h-12 w-12',
      icon: 'w-6 h-6',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Start screen sharing
  const handleStartShare = useCallback(async () => {
    if (isSharing || disabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if screen sharing is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser');
      }
      
      // Request screen share permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      // Handle stream ended (user stopped sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        onStopShare();
        toast.info('Screen sharing stopped');
      });
      
      onStartShare(stream);
      toast.success('Screen sharing started');
      
    } catch (error) {
      console.error('Error starting screen share:', error);
      
      let errorMessage = 'Failed to start screen sharing';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Screen sharing permission denied';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No screen available to share';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Screen sharing not supported';
        } else if (error.name === 'AbortError') {
          errorMessage = 'Screen sharing cancelled';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  }, [isSharing, disabled, onStartShare, onStopShare]);

  // Stop screen sharing
  const handleStopShare = useCallback(() => {
    if (!isSharing) return;
    
    onStopShare();
    toast.info('Screen sharing stopped');
  }, [isSharing, onStopShare]);

  // Toggle screen sharing
  const handleToggle = useCallback(() => {
    if (isSharing) {
      handleStopShare();
    } else {
      handleStartShare();
    }
  }, [isSharing, handleStartShare, handleStopShare]);

  return (
    <div className={`relative ${className}`}>
      {/* Main button */}
      <Button
        variant={variant}
        size={size}
        onClick={handleToggle}
        disabled={disabled || isLoading}
        className={`
          ${config.button} relative rounded-full transition-all duration-200
          ${isSharing 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'hover:scale-105'
          }
          ${error ? 'animate-pulse' : ''}
        `}
        title={isSharing ? 'Stop screen sharing' : 'Start screen sharing'}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`${config.icon} animate-spin`}
            >
              <Share className={config.icon} />
            </motion.div>
          ) : isSharing ? (
            <motion.div
              key="sharing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <MonitorOff className={config.icon} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Monitor className={config.icon} />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Status indicator */}
      <AnimatePresence>
        {isSharing && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-1 -right-1"
          >
            <Badge variant="secondary" className="bg-blue-500 text-white text-xs px-1 py-0.5">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
              Live
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error indicator */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-1 -right-1"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-2 h-2 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sharing pulse effect */}
      <AnimatePresence>
        {isSharing && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: [0.7, 0],
              scale: [1, 1.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className={`
              absolute inset-0 ${config.button} rounded-full
              bg-blue-400 pointer-events-none
            `}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScreenShareButton;