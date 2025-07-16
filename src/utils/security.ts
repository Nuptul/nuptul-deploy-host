/**
 * Security utilities for production hardening
 * OWASP-compliant security functions
 */

/**
 * Strip console logs in production
 * Prevents information disclosure through debug logs
 */
export const initializeSecurityFeatures = () => {
  if (import.meta.env.PROD) {
    // Override console methods in production
    const noop = () => {};
    
    // Preserve error and warn for critical debugging
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Strip debug information
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    console.trace = noop;
    console.group = noop;
    console.groupCollapsed = noop;
    console.groupEnd = noop;
    console.time = noop;
    console.timeEnd = noop;
    console.count = noop;
    console.countReset = noop;
    console.clear = noop;
    console.table = noop;
    console.dir = noop;
    console.dirxml = noop;
    
    // Keep essential error reporting
    console.error = originalError;
    console.warn = originalWarn;
  }
};

/**
 * Validate environment configuration
 * Ensures required security settings are in place
 */
export const validateSecurityConfig = (): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for HTTPS in production
  if (import.meta.env.PROD && window.location.protocol !== 'https:') {
    errors.push('Application must be served over HTTPS in production');
  }

  // Check for required environment variables
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  
  requiredVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Check for secure Supabase URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    errors.push('Supabase URL must use HTTPS protocol');
  }

  // Check for placeholder values
  const placeholderPatterns = ['placeholder', 'your-key-here', 'replace-me', 'localhost'];
  
  Object.entries(import.meta.env).forEach(([key, value]) => {
    if (key.startsWith('VITE_') && typeof value === 'string') {
      placeholderPatterns.forEach(pattern => {
        if (value.toLowerCase().includes(pattern) && import.meta.env.PROD) {
          warnings.push(`Potential placeholder value in ${key}: ${pattern}`);
        }
      });
    }
  });

  // Check for exposed sensitive data
  const sensitiveKeys = ['SECRET', 'PRIVATE', 'PASSWORD', 'TOKEN'];
  
  Object.keys(import.meta.env).forEach(key => {
    sensitiveKeys.forEach(sensitiveKey => {
      if (key.includes(sensitiveKey) && key.startsWith('VITE_')) {
        errors.push(`Sensitive data exposed in client bundle: ${key}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Content Security Policy configuration
 * Prevents XSS attacks and unauthorized resource loading
 */
export const getCSPDirectives = () => {
  const baseDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for React dev mode
      ...(import.meta.env.DEV ? ["'unsafe-eval'"] : []), // Only in development
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS
      'fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'fonts.gstatic.com',
      'data:',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://*.supabase.co',
      'https://maps.googleapis.com',
      'https://api.mapbox.com',
    ],
    'connect-src': [
      "'self'",
      'wss:',
      'https://*.supabase.co',
      'https://api.mapbox.com',
      ...(import.meta.env.DEV ? ['ws://localhost:*'] : []),
    ],
    'media-src': [
      "'self'",
      'blob:',
      'https://*.supabase.co',
    ],
    'object-src': ["'none'"],
    'frame-src': ["'none'"],
    'worker-src': [
      "'self'",
      'blob:',
    ],
    'manifest-src': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  return Object.entries(baseDirectives)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
};

/**
 * Security headers configuration
 * OWASP recommended headers for browser security
 */
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': getCSPDirectives(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'geolocation=(self)',
    'microphone=(self)',
    'camera=(self)',
    'payment=(self)',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'speaker=(self)',
    'vibrate=(self)',
    'fullscreen=(self)',
  ].join(', '),
  'X-XSS-Protection': '1; mode=block',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
});

/**
 * Rate limiting utilities
 * Prevents abuse and brute force attacks
 */
class SecurityRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private blockedIPs: Set<string> = new Set();

  /**
   * Check if an IP/identifier is rate limited
   */
  isRateLimited(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 60000,
    blockDurationMs: number = 300000 // 5 minutes
  ): boolean {
    const now = Date.now();
    
    // Check if currently blocked
    if (this.blockedIPs.has(identifier)) {
      return true;
    }

    const attempt = this.attempts.get(identifier);
    
    if (!attempt || now > attempt.resetTime) {
      // Reset or create new attempt record
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (attempt.count >= maxAttempts) {
      // Block the identifier
      this.blockedIPs.add(identifier);
      
      // Schedule unblock
      setTimeout(() => {
        this.blockedIPs.delete(identifier);
        this.attempts.delete(identifier);
      }, blockDurationMs);
      
      return true;
    }

    // Increment attempt count
    attempt.count++;
    return false;
  }

  /**
   * Clear attempts for an identifier
   */
  clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
    this.blockedIPs.delete(identifier);
  }

  /**
   * Get current attempt count
   */
  getAttemptCount(identifier: string): number {
    return this.attempts.get(identifier)?.count || 0;
  }
}

export const securityRateLimiter = new SecurityRateLimiter();

/**
 * Secure session management
 * Prevents session fixation and hijacking
 */
export const secureSessionUtils = {
  /**
   * Generate secure session token
   */
  generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Validate session token format
   */
  isValidSessionToken(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
  },

  /**
   * Clear all session data
   */
  clearSession(): void {
    // Clear localStorage
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Could not clear localStorage:', error);
    }

    // Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Could not clear sessionStorage:', error);
    }

    // Clear cookies (limited from client-side)
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  },

  /**
   * Check for session anomalies
   */
  validateSessionSecurity(): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Check for suspicious localStorage usage
    try {
      const localStorageSize = JSON.stringify(localStorage).length;
      if (localStorageSize > 1024 * 1024) { // 1MB
        warnings.push('Excessive localStorage usage detected');
      }

      // Check for sensitive data in localStorage
      Object.keys(localStorage).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('private')) {
          warnings.push(`Sensitive data in localStorage: ${key}`);
        }
      });
    } catch (error) {
      // localStorage not available
    }

    // Check for multiple tabs (potential session hijacking)
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('session-check');
      channel.postMessage('ping');
      
      let tabCount = 1;
      channel.addEventListener('message', () => {
        tabCount++;
      });

      setTimeout(() => {
        if (tabCount > 3) {
          warnings.push(`Multiple tabs detected (${tabCount})`);
        }
        channel.close();
      }, 1000);
    }

    return {
      isValid: warnings.length === 0,
      warnings,
    };
  },
};

/**
 * Initialize all security features
 */
export const initializeSecurity = (): void => {
  // Strip console logs in production
  initializeSecurityFeatures();

  // Validate configuration
  const configValidation = validateSecurityConfig();
  
  if (!configValidation.isValid) {
    console.error('Security configuration errors:', configValidation.errors);
  }

  if (configValidation.warnings.length > 0) {
    console.warn('Security configuration warnings:', configValidation.warnings);
  }

  // Add security event listeners
  window.addEventListener('beforeunload', () => {
    // Clear sensitive data on page unload
    if (import.meta.env.PROD) {
      sessionStorage.removeItem('debug-data');
      sessionStorage.removeItem('temp-tokens');
    }
  });

  // Detect developer tools (basic protection)
  if (import.meta.env.PROD) {
    let devToolsOpen = false;
    
    setInterval(() => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          console.warn('Developer tools detected');
          // In a real application, you might want to log this or take action
        }
      } else {
        devToolsOpen = false;
      }
    }, 1000);
  }
};

export default {
  initializeSecurity,
  validateSecurityConfig,
  getSecurityHeaders,
  securityRateLimiter,
  secureSessionUtils,
};