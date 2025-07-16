import React from 'react';

interface HapticFeedbackProps {
  type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  disabled?: boolean;
}

// Static methods for programmatic haptic feedback
const HapticFeedbackAPI = {
  impact: (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrator' in navigator || 'vibrate' in navigator) {
      const patterns: Record<string, number> = {
        light: 10,
        medium: 20,
        heavy: 30
      };
      navigator.vibrate(patterns[intensity]);
    }
  },
  
  notification: (type: 'success' | 'warning' | 'error') => {
    if ('vibrator' in navigator || 'vibrate' in navigator) {
      const patterns: Record<string, number[]> = {
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [50, 100, 50, 100, 50]
      };
      navigator.vibrate(patterns[type]);
    }
  }
};

const HapticFeedbackComponent: React.FC<HapticFeedbackProps> = ({
  type = 'light',
  children,
  disabled = false
}) => {
  const triggerHaptic = (event?: any) => {
    if (disabled) return;
    
    // Web Vibration API simulation for mobile devices
    if ('vibrator' in navigator || 'vibrate' in navigator) {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [50, 100, 50, 100, 50]
      };
      
      const pattern = patterns[type];
      if (Array.isArray(pattern)) {
        navigator.vibrate(pattern);
      } else {
        navigator.vibrate(pattern);
      }
    }
    
    // Visual feedback animation
    const element = event?.currentTarget as HTMLElement;
    if (element) {
      element.style.transform = 'scale(0.98)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 100);
    }
  };

  return (
    <div
      onClick={triggerHaptic}
      onTouchStart={triggerHaptic}
      className="transition-transform duration-100"
    >
      {children}
    </div>
  );
};

// Combine component with static methods
export const HapticFeedback = Object.assign(HapticFeedbackComponent, HapticFeedbackAPI);