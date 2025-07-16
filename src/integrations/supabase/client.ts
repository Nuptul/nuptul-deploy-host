// Secure Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/config/environment';
import { logger } from '@/utils/logger';

// Get configuration from environment
const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_PUBLISHABLE_KEY = getSupabaseAnonKey();

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const error = 'Missing Supabase configuration. Check environment variables.';
  logger.error(error, {}, 'SUPABASE_CONFIG');
  throw new Error(error);
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Admin client for server-side operations (development only)
export const supabaseAdmin = (() => {
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    logger.warn('Service role key not available - admin client disabled', {}, 'SUPABASE_ADMIN');
    return null;
  }

  // Allow in development for testing user management
  return createClient<Database>(
    SUPABASE_URL, 
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
})();