import { useState, useEffect } from 'react';
import { featureFlags, FeatureFlagContext } from '@/utils/featureFlags';
import { useAuth } from './useAuth';

// Hook to use a single feature flag
export const useFeatureFlag = (
  flagKey: string, 
  customContext?: Partial<FeatureFlagContext>
) => {
  const { user, userRole } = useAuth();
  const [value, setValue] = useState<any>(false);
  const [loading, setLoading] = useState(true);

  // Build context from auth and custom context
  const context: FeatureFlagContext = {
    userId: user?.id,
    userRole: userRole?.role,
    userEmail: user?.email,
    environment: process.env.NODE_ENV as 'development' | 'production',
    ...customContext
  };

  useEffect(() => {
    let mounted = true;

    const loadFlag = async () => {
      try {
        const flagValue = await featureFlags.getFlagValue(flagKey, context);
        if (mounted) {
          setValue(flagValue);
          setLoading(false);
        }
      } catch (error) {
        console.error(`Error loading flag ${flagKey}:`, error);
        if (mounted) {
          setValue(false);
          setLoading(false);
        }
      }
    };

    loadFlag();

    // Subscribe to flag changes
    const unsubscribe = featureFlags.addFlagListener(flagKey, (enabled, newValue) => {
      if (mounted) {
        setValue(newValue);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [flagKey, user?.id, userRole?.role, JSON.stringify(customContext)]);

  return { 
    value, 
    loading, 
    enabled: Boolean(value),
    disabled: !Boolean(value)
  };
};

// Hook to use multiple feature flags at once
export const useFeatureFlags = (
  flagKeys: string[], 
  customContext?: Partial<FeatureFlagContext>
) => {
  const { user, userRole } = useAuth();
  const [flags, setFlags] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Build context from auth and custom context
  const context: FeatureFlagContext = {
    userId: user?.id,
    userRole: userRole?.role,
    userEmail: user?.email,
    environment: process.env.NODE_ENV as 'development' | 'production',
    ...customContext
  };

  useEffect(() => {
    let mounted = true;

    const loadFlags = async () => {
      try {
        const flagValues: Record<string, any> = {};
        
        // Load all flags in parallel
        const promises = flagKeys.map(async (key) => {
          const value = await featureFlags.getFlagValue(key, context);
          flagValues[key] = value;
        });

        await Promise.all(promises);

        if (mounted) {
          setFlags(flagValues);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading flags:', error);
        if (mounted) {
          // Set all flags to false on error
          const defaultFlags = flagKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {});
          setFlags(defaultFlags);
          setLoading(false);
        }
      }
    };

    loadFlags();

    // Subscribe to changes for all flags
    const unsubscribers = flagKeys.map(flagKey => 
      featureFlags.addFlagListener(flagKey, (enabled, newValue) => {
        if (mounted) {
          setFlags(prev => ({ ...prev, [flagKey]: newValue }));
        }
      })
    );

    return () => {
      mounted = false;
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [JSON.stringify(flagKeys), user?.id, userRole?.role, JSON.stringify(customContext)]);

  // Helper functions
  const isEnabled = (flagKey: string): boolean => Boolean(flags[flagKey]);
  const getValue = (flagKey: string): any => flags[flagKey];
  const isDisabled = (flagKey: string): boolean => !Boolean(flags[flagKey]);

  return { 
    flags, 
    loading,
    isEnabled,
    getValue,
    isDisabled
  };
};

// Hook for admin flag management
export const useFeatureFlagAdmin = () => {
  const [allFlags, setAllFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const flags = await featureFlags.getAllFlags();
      setAllFlags(flags);
    } catch (error) {
      console.error('Error loading admin flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFlag = async (flagData: any) => {
    const result = await featureFlags.setFlag(flagData);
    if (result) {
      await loadFlags(); // Refresh list
    }
    return result;
  };

  const updateFlag = async (flagData: any) => {
    const result = await featureFlags.setFlag(flagData);
    if (result) {
      await loadFlags(); // Refresh list
    }
    return result;
  };

  const deleteFlag = async (flagKey: string) => {
    const result = await featureFlags.deleteFlag(flagKey);
    if (result) {
      await loadFlags(); // Refresh list
    }
    return result;
  };

  useEffect(() => {
    loadFlags();
  }, []);

  return {
    flags: allFlags,
    loading,
    loadFlags,
    createFlag,
    updateFlag,
    deleteFlag
  };
};

// Conditional component wrapper based on feature flag
interface FeatureGateProps {
  flagKey: string;
  context?: Partial<FeatureFlagContext>;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  flagKey,
  context,
  fallback = null,
  children
}) => {
  const { enabled, loading } = useFeatureFlag(flagKey, context);

  if (loading) {
    return <>{fallback}</>;
  }

  return enabled ? <>{children}</> : <>{fallback}</>;
};

// HOC for feature flag gating
export const withFeatureFlag = (
  flagKey: string, 
  context?: Partial<FeatureFlagContext>,
  fallback?: React.ComponentType
) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    const WrappedComponent: React.FC<P> = (props) => {
      const { enabled, loading } = useFeatureFlag(flagKey, context);

      if (loading) {
        return fallback ? <fallback /> : null;
      }

      if (!enabled) {
        return fallback ? <fallback /> : null;
      }

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withFeatureFlag(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };
};

// Utility hooks for common patterns
export const useNewDashboard = () => useFeatureFlag('new_dashboard_design');
export const useEnhancedNotifications = () => useFeatureFlag('enhanced_notifications');
export const useRealTimeCollaboration = () => useFeatureFlag('real_time_collaboration');
export const useAdvancedAnalytics = () => useFeatureFlag('advanced_analytics');
export const useBetaFeatures = () => useFeatureFlag('beta_features');
export const useVideoCalling = () => useFeatureFlag('video_calling');
export const useScreenSharing = () => useFeatureFlag('screen_sharing');
export const useAIRecommendations = () => useFeatureFlag('ai_recommendations');
export const useDarkMode = () => useFeatureFlag('dark_mode');
export const useGuestChat = () => useFeatureFlag('guest_chat');
export const usePhotoGallery = () => useFeatureFlag('photo_gallery');
export const usePaymentIntegration = () => useFeatureFlag('payment_integration');