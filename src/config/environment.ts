// Environment configuration and validation
// This file is deprecated - use src/config/deployment.ts instead
import { getDeploymentConfig, validateDeploymentConfig } from './deployment';

export const getEnvironmentConfig = () => {
  const config = getDeploymentConfig();
  return {
    supabaseUrl: config.supabase.url,
    supabaseAnonKey: config.supabase.anonKey,
    isDevelopment: config.environment === 'development',
    isProduction: config.environment === 'production',
  };
};

export const getSupabaseUrl = () => {
  return getDeploymentConfig().supabase.url;
};

export const getSupabaseAnonKey = () => {
  return getDeploymentConfig().supabase.anonKey;
};

export const validateEnvironment = () => {
  const config = getDeploymentConfig();
  const errors = validateDeploymentConfig(config);
  
  if (errors.length > 0) {
    console.warn('Environment validation warnings:', errors);
  }
  
  return {
    supabaseUrl: config.supabase.url,
    supabaseAnonKey: config.supabase.anonKey,
    isDevelopment: config.environment === 'development',
    isProduction: config.environment === 'production',
  };
};

export default getEnvironmentConfig();