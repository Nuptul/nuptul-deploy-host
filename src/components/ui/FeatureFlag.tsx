import React from 'react';

interface FeatureFlagProps {
  name: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Feature Flag Component for Safe Rollout
 * Allows instant enable/disable of features without code changes
 */
const FeatureFlag: React.FC<FeatureFlagProps> = ({ name, fallback = null, children }) => {
  // Feature flag configuration - can be moved to environment variables
  const featureFlags: Record<string, boolean> = {
    'phase3.1': true,  // Core Aceternity components
    'phase3.2': false, // Advanced visual features
    'aceternity.glare-card': true,
    'aceternity.text-generate': true,
    'aceternity.animated-modal': false, // Start disabled for safety
    'aceternity.hero-parallax': false,
    'aceternity.sparkles': false,
    'aceternity.card-3d': false,
  };

  const isEnabled = featureFlags[name] ?? false;

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default FeatureFlag;