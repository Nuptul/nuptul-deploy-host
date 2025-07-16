import { supabase } from '@/integrations/supabase/client';

// Feature flag types
export interface FeatureFlag {
  id: string;
  flag_key: string;
  flag_name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_users: string[];
  excluded_users: string[];
  conditions: Record<string, any>;
  flag_type: 'boolean' | 'string' | 'number' | 'json';
  default_value: any;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagContext {
  userId?: string;
  userRole?: string;
  userEmail?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  environment?: 'development' | 'staging' | 'production';
  version?: string;
}

// Cache for feature flags
let flagsCache: Map<string, FeatureFlag> = new Map();
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Event listeners for flag changes
const flagChangeListeners: Map<string, Set<(enabled: boolean, value: any) => void>> = new Map();

// Core feature flag functions
export class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  
  public static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }

  // Initialize and load all feature flags
  public async initialize(): Promise<void> {
    try {
      await this.refreshFlags();
      this.setupRealtimeSubscription();
    } catch (error) {
      console.error('Failed to initialize feature flags:', error);
    }
  }

  // Refresh flags from database
  public async refreshFlags(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('flag_key');

      if (error) throw error;

      flagsCache.clear();
      data?.forEach(flag => {
        flagsCache.set(flag.flag_key, flag);
      });

      cacheExpiry = Date.now() + CACHE_DURATION;
    } catch (error) {
      console.error('Error refreshing feature flags:', error);
      throw error;
    }
  }

  // Setup real-time subscription for flag changes
  private setupRealtimeSubscription(): void {
    supabase
      .channel('feature_flags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        (payload) => {
          this.handleFlagChange(payload);
        }
      )
      .subscribe();
  }

  // Handle real-time flag changes
  private handleFlagChange(payload: any): void {
    const { eventType, new: newFlag, old: oldFlag } = payload;
    
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const flag = newFlag as FeatureFlag;
      flagsCache.set(flag.flag_key, flag);
      
      // Notify listeners
      this.notifyListeners(flag.flag_key, flag.is_enabled, this.getFlagValue(flag));
    } else if (eventType === 'DELETE') {
      const flag = oldFlag as FeatureFlag;
      flagsCache.delete(flag.flag_key);
      
      // Notify listeners with default value
      this.notifyListeners(flag.flag_key, false, flag.default_value);
    }
  }

  // Notify all listeners for a specific flag
  private notifyListeners(flagKey: string, enabled: boolean, value: any): void {
    const listeners = flagChangeListeners.get(flagKey);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(enabled, value);
        } catch (error) {
          console.error(`Error in flag change listener for ${flagKey}:`, error);
        }
      });
    }
  }

  // Get flag value with context evaluation
  public async getFlagValue(flagKey: string, context?: FeatureFlagContext): Promise<any> {
    const flag = await this.getFlag(flagKey);
    if (!flag) {
      return false; // Default when flag doesn't exist
    }

    // Check if flag is globally disabled
    if (!flag.is_enabled) {
      return this.parseValue(flag.default_value, flag.flag_type);
    }

    // Evaluate user-specific conditions
    if (context?.userId) {
      // Check excluded users
      if (flag.excluded_users.includes(context.userId)) {
        return this.parseValue(flag.default_value, flag.flag_type);
      }

      // Check target users (bypasses rollout percentage)
      if (flag.target_users.includes(context.userId)) {
        return this.parseValue(flag.default_value, flag.flag_type);
      }
    }

    // Evaluate rollout percentage
    if (flag.rollout_percentage < 100) {
      const userHash = this.hashUser(context?.userId || 'anonymous', flagKey);
      if (userHash > flag.rollout_percentage) {
        return this.parseValue(flag.default_value, flag.flag_type);
      }
    }

    // Evaluate additional conditions
    if (Object.keys(flag.conditions).length > 0) {
      if (!this.evaluateConditions(flag.conditions, context)) {
        return this.parseValue(flag.default_value, flag.flag_type);
      }
    }

    // Flag is enabled for this context
    return this.parseValue(flag.default_value, flag.flag_type);
  }

  // Get flag (with caching)
  private async getFlag(flagKey: string): Promise<FeatureFlag | null> {
    // Check cache first
    if (Date.now() < cacheExpiry && flagsCache.has(flagKey)) {
      return flagsCache.get(flagKey) || null;
    }

    // Cache expired or flag not found, refresh
    try {
      await this.refreshFlags();
      return flagsCache.get(flagKey) || null;
    } catch (error) {
      console.error('Error getting flag:', error);
      return null;
    }
  }

  // Hash user ID for consistent rollout
  private hashUser(userId: string, flagKey: string): number {
    const str = `${userId}:${flagKey}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  // Parse flag value based on type
  private parseValue(value: any, type: FeatureFlag['flag_type']): any {
    if (value === null || value === undefined) {
      switch (type) {
        case 'boolean': return false;
        case 'string': return '';
        case 'number': return 0;
        case 'json': return {};
        default: return false;
      }
    }

    switch (type) {
      case 'boolean':
        return typeof value === 'boolean' ? value : value === 'true';
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'json':
        return typeof value === 'object' ? value : JSON.parse(value);
      default:
        return value;
    }
  }

  // Evaluate conditions
  private evaluateConditions(conditions: Record<string, any>, context?: FeatureFlagContext): boolean {
    if (!context) return true;

    for (const [key, expectedValue] of Object.entries(conditions)) {
      const contextValue = (context as any)[key];
      
      if (contextValue !== expectedValue) {
        return false;
      }
    }

    return true;
  }

  // Add listener for flag changes
  public addFlagListener(flagKey: string, callback: (enabled: boolean, value: any) => void): () => void {
    if (!flagChangeListeners.has(flagKey)) {
      flagChangeListeners.set(flagKey, new Set());
    }
    
    flagChangeListeners.get(flagKey)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = flagChangeListeners.get(flagKey);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          flagChangeListeners.delete(flagKey);
        }
      }
    };
  }

  // Get all flags (admin only)
  public async getAllFlags(): Promise<FeatureFlag[]> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('flag_key');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all flags:', error);
      return [];
    }
  }

  // Create or update a flag (admin only)
  public async setFlag(flagData: Partial<FeatureFlag>): Promise<FeatureFlag | null> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .upsert([flagData], { onConflict: 'flag_key' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting flag:', error);
      return null;
    }
  }

  // Delete a flag (admin only)
  public async deleteFlag(flagKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('flag_key', flagKey);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting flag:', error);
      return false;
    }
  }
}

// Convenience functions
export const featureFlags = FeatureFlagManager.getInstance();

// Hook-like function for React components
export const useFeatureFlag = (flagKey: string, context?: FeatureFlagContext) => {
  const [value, setValue] = React.useState<any>(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
  }, [flagKey, context]);

  return { value, loading };
};

// Simple boolean flag check
export const isFeatureEnabled = async (flagKey: string, context?: FeatureFlagContext): Promise<boolean> => {
  const value = await featureFlags.getFlagValue(flagKey, context);
  return Boolean(value);
};

// Get feature flag value
export const getFeatureFlagValue = async (flagKey: string, context?: FeatureFlagContext): Promise<any> => {
  return await featureFlags.getFlagValue(flagKey, context);
};

// Initialize feature flags (call this in your app startup)
export const initializeFeatureFlags = async (): Promise<void> => {
  await featureFlags.initialize();
};

// Common feature flag keys (type-safe constants)
export const FEATURE_FLAGS = {
  NEW_DASHBOARD_DESIGN: 'new_dashboard_design',
  ENHANCED_NOTIFICATIONS: 'enhanced_notifications',
  REAL_TIME_COLLABORATION: 'real_time_collaboration',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  BETA_FEATURES: 'beta_features',
  VIDEO_CALLING: 'video_calling',
  SCREEN_SHARING: 'screen_sharing',
  AI_RECOMMENDATIONS: 'ai_recommendations',
  DARK_MODE: 'dark_mode',
  GUEST_CHAT: 'guest_chat',
  PHOTO_GALLERY: 'photo_gallery',
  PAYMENT_INTEGRATION: 'payment_integration'
} as const;

export type FeatureFlagKey = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

// Development helpers
export const setDevFlag = (flagKey: string, enabled: boolean): void => {
  if (process.env.NODE_ENV === 'development') {
    localStorage.setItem(`dev_flag_${flagKey}`, enabled.toString());
  }
};

export const getDevFlag = (flagKey: string): boolean | null => {
  if (process.env.NODE_ENV === 'development') {
    const value = localStorage.getItem(`dev_flag_${flagKey}`);
    return value ? value === 'true' : null;
  }
  return null;
};

// React import (will be available when React is imported)
declare global {
  const React: typeof import('react');
}