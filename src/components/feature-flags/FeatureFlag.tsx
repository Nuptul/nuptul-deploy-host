import React, { ReactNode } from 'react';

/**
 * Feature Flag System for Safe Aceternity Integration
 * 
 * Provides controlled rollout and instant rollback capabilities
 * for Phase 3 Aceternity UI components.
 */

interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage: number;
  userSegments?: string[];
  dependencies?: string[];
  killSwitch: boolean;
}

interface FeatureFlagProps {
  name: string;
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

// Feature flag configurations
const FEATURE_FLAGS: Record<string, FeatureFlagConfig> = {
  // Phase 3.1 Core Components
  'phase3.1': {
    enabled: true,
    rolloutPercentage: 100,
    userSegments: ['all'],
    dependencies: ['aceternity_core'],
    killSwitch: false
  },
  'aceternity_glare_card': {
    enabled: true,
    rolloutPercentage: 100,
    userSegments: ['all'],
    dependencies: ['phase3.1'],
    killSwitch: false
  },
  'aceternity_text_generate': {
    enabled: true,
    rolloutPercentage: 100,
    userSegments: ['all'],
    dependencies: ['phase3.1'],
    killSwitch: false
  },
  'aceternity_animated_modal': {
    enabled: true,
    rolloutPercentage: 100,
    userSegments: ['all'],
    dependencies: ['phase3.1'],
    killSwitch: false
  },
  
  // Phase 3.2 Advanced Components
  'phase3.2': {
    enabled: true,
    rolloutPercentage: 50, // Gradual rollout
    userSegments: ['admin', 'couple'],
    dependencies: ['phase3.1'],
    killSwitch: false
  },
  'aceternity_hero_parallax': {
    enabled: false, // Start disabled
    rolloutPercentage: 0,
    userSegments: ['admin'],
    dependencies: ['phase3.2'],
    killSwitch: false
  },
  'aceternity_sparkles': {
    enabled: false, // Start disabled
    rolloutPercentage: 0,
    userSegments: ['all'],
    dependencies: ['phase3.2'],
    killSwitch: false
  },
  'aceternity_card_3d': {
    enabled: false, // Start disabled
    rolloutPercentage: 0,
    userSegments: ['all'],
    dependencies: ['phase3.2'],
    killSwitch: false
  }
};

/**
 * Checks if a feature flag is enabled for the current context
 */
function isFeatureEnabled(name: string): boolean {
  const config = FEATURE_FLAGS[name];
  
  if (!config || config.killSwitch) {
    return false;
  }
  
  if (!config.enabled) {
    return false;
  }
  
  // Check dependencies
  if (config.dependencies) {
    for (const dependency of config.dependencies) {
      if (!isFeatureEnabled(dependency)) {
        return false;
      }
    }
  }
  
  // Simple rollout percentage check
  // In production, this would use user ID or session for consistent experience
  const random = Math.random() * 100;
  return random <= config.rolloutPercentage;
}

/**
 * Feature Flag Component
 * 
 * Wraps components to provide controlled rollout and instant rollback
 */
export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  name,
  children,
  fallback = null,
  onError
}) => {
  try {
    if (!isFeatureEnabled(name)) {
      return <>{fallback}</>;
    }
    
    return <>{children}</>;
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      console.warn(`[FeatureFlag] Error in feature "${name}":`, error);
    }
    
    return <>{fallback}</>;
  }
};

/**
 * Hook to check feature flag status
 */
export function useFeatureFlag(name: string): boolean {
  return isFeatureEnabled(name);
}

/**
 * Emergency kill switch function
 */
export function emergencyDisableFeature(name: string): void {
  if (FEATURE_FLAGS[name]) {
    FEATURE_FLAGS[name].killSwitch = true;
    console.warn(`[FeatureFlag] Emergency kill switch activated for: ${name}`);
  }
}

/**
 * Get all feature flag statuses (for admin dashboard)
 */
export function getFeatureFlagStatus(): Record<string, boolean> {
  const status: Record<string, boolean> = {};
  
  for (const [name] of Object.entries(FEATURE_FLAGS)) {
    status[name] = isFeatureEnabled(name);
  }
  
  return status;
}

export default FeatureFlag;