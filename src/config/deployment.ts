/**
 * Deployment Configuration System
 * 
 * Automatically switches between development and production environments
 * based on build mode and environment variables.
 */

export type Environment = 'development' | 'production' | 'staging';

export interface DeploymentConfig {
  environment: Environment;
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
    storageUrl: string;
  };
  features: {
    debugMode: boolean;
    mockData: boolean;
    performanceMonitor: boolean;
    storageLogging: boolean;
    adminDashboard: boolean;
    videoCallging: boolean;
    realTimeChat: boolean;
    photoUploads: boolean;
  };
  storage: {
    buckets: {
      avatars: string;
      socialMedia: string;
      userContent: string;
      publicAssets: string;
    };
    maxFileSizes: {
      avatar: number;
      socialMedia: number;
      userContent: number;
      publicAssets: number;
    };
    allowedMimeTypes: {
      images: string[];
      videos: string[];
      documents: string[];
    };
  };
  urls: {
    app: string;
    cdn?: string;
    api?: string;
  };
  security: {
    enableCSP: boolean;
    enableCORS: boolean;
    reportUri?: string;
  };
  analytics: {
    googleAnalytics?: string;
    sentryDsn?: string;
    enableTracking: boolean;
  };
}

/**
 * Get current environment
 */
export const getCurrentEnvironment = (): Environment => {
  // Check if we're in production build
  if (import.meta.env.PROD) {
    return 'production';
  }
  
  // Check for staging environment
  if (import.meta.env.VITE_APP_ENV === 'staging') {
    return 'staging';
  }
  
  // Default to development
  return 'development';
};

/**
 * Base configuration that applies to all environments
 */
const baseConfig = {
  storage: {
    buckets: {
      avatars: 'avatars',
      socialMedia: 'social-media',
      userContent: 'user-content',
      publicAssets: 'public-assets'
    },
    maxFileSizes: {
      avatar: 10 * 1024 * 1024, // 10MB
      socialMedia: 50 * 1024 * 1024, // 50MB
      userContent: 25 * 1024 * 1024, // 25MB
      publicAssets: 5 * 1024 * 1024 // 5MB
    },
    allowedMimeTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      videos: ['video/mp4', 'video/webm', 'video/quicktime'],
      documents: ['application/pdf', 'text/plain']
    }
  }
};

/**
 * Development configuration
 */
const developmentConfig: DeploymentConfig = {
  environment: 'development',
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    storageUrl: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/`
  },
  features: {
    debugMode: true,
    mockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
    performanceMonitor: true,
    storageLogging: true,
    adminDashboard: true,
    videoCallging: true,
    realTimeChat: true,
    photoUploads: true
  },
  urls: {
    app: import.meta.env.VITE_APP_URL || 'https://nuptul.com',
    cdn: undefined,
    api: undefined
  },
  security: {
    enableCSP: false,
    enableCORS: true,
    reportUri: undefined
  },
  analytics: {
    googleAnalytics: undefined,
    sentryDsn: undefined,
    enableTracking: false
  },
  ...baseConfig
};

/**
 * Production configuration
 */
const productionConfig: DeploymentConfig = {
  environment: 'production',
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    serviceRoleKey: undefined, // Never expose service role key in production frontend
    storageUrl: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/`
  },
  features: {
    debugMode: false,
    mockData: false,
    performanceMonitor: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITOR === 'true',
    storageLogging: false,
    adminDashboard: import.meta.env.VITE_ENABLE_ADMIN_DASHBOARD === 'true',
    videoCallging: import.meta.env.VITE_ENABLE_VIDEO_CALLING === 'true',
    realTimeChat: import.meta.env.VITE_ENABLE_REAL_TIME_CHAT === 'true',
    photoUploads: import.meta.env.VITE_ENABLE_PHOTO_UPLOADS === 'true'
  },
  urls: {
    app: import.meta.env.VITE_APP_URL || 'https://nuptul.com',
    cdn: import.meta.env.VITE_CDN_URL,
    api: import.meta.env.VITE_API_URL
  },
  security: {
    enableCSP: true,
    enableCORS: false,
    reportUri: import.meta.env.VITE_CSP_REPORT_URI
  },
  analytics: {
    googleAnalytics: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    enableTracking: true
  },
  ...baseConfig
};

/**
 * Staging configuration (hybrid of dev and prod)
 */
const stagingConfig: DeploymentConfig = {
  ...productionConfig,
  environment: 'staging',
  features: {
    ...productionConfig.features,
    debugMode: true,
    performanceMonitor: true,
    storageLogging: true
  },
  urls: {
    app: import.meta.env.VITE_STAGING_URL || 'https://staging.nuptul.com',
    cdn: import.meta.env.VITE_CDN_URL,
    api: import.meta.env.VITE_API_URL
  },
  analytics: {
    ...productionConfig.analytics,
    enableTracking: false // Disable tracking in staging
  }
};

/**
 * Get deployment configuration based on current environment
 */
export const getDeploymentConfig = (): DeploymentConfig => {
  const environment = getCurrentEnvironment();
  
  switch (environment) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return developmentConfig;
  }
};

/**
 * Validate deployment configuration
 */
export const validateDeploymentConfig = (config: DeploymentConfig): string[] => {
  const errors: string[] = [];
  
  // Check required Supabase configuration
  if (!config.supabase.url) {
    errors.push('Missing VITE_SUPABASE_URL');
  }
  
  if (!config.supabase.anonKey) {
    errors.push('Missing VITE_SUPABASE_ANON_KEY');
  }
  
  // Check production-specific requirements
  if (config.environment === 'production') {
    if (!config.urls.app || config.urls.app.includes('localhost')) {
      errors.push('Production requires a valid VITE_APP_URL');
    }
    
    if (config.supabase.serviceRoleKey) {
      errors.push('Service role key should not be exposed in production frontend');
    }
  }
  
  return errors;
};

/**
 * Get storage URL for a specific bucket and file
 */
export const getStorageUrl = (bucket: string, filePath: string): string => {
  const config = getDeploymentConfig();
  return `${config.supabase.storageUrl}${bucket}/${filePath}`;
};

/**
 * Get CDN URL if available, otherwise return app URL
 */
export const getCDNUrl = (path: string = ''): string => {
  const config = getDeploymentConfig();
  const baseUrl = config.urls.cdn || config.urls.app;
  return path ? `${baseUrl}/${path}` : baseUrl;
};

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (feature: keyof DeploymentConfig['features']): boolean => {
  const config = getDeploymentConfig();
  return config.features[feature];
};

/**
 * Get environment-specific console logger
 */
export const getLogger = () => {
  const config = getDeploymentConfig();
  
  if (config.features.debugMode) {
    return console;
  }
  
  // Return no-op logger for production
  return {
    log: () => {},
    warn: () => {},
    error: console.error, // Always log errors
    debug: () => {},
    info: () => {}
  };
};

// Export the current configuration
export const deploymentConfig = getDeploymentConfig();
export const currentEnvironment = getCurrentEnvironment();

// Validate configuration on import
const configErrors = validateDeploymentConfig(deploymentConfig);
if (configErrors.length > 0) {
  console.error('❌ Deployment configuration errors:', configErrors);
  
  if (deploymentConfig.environment === 'production') {
    throw new Error(`Production deployment blocked due to configuration errors: ${configErrors.join(', ')}`);
  }
}