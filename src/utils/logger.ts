// Secure logging utility to replace console.log in production

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  timestamp: string;
  source?: string;
}

class SecureLogger {
  private isDevelopment = import.meta.env.DEV;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    // Remove sensitive fields
    const sensitiveKeys = [
      'password', 'token', 'key', 'secret', 'auth', 'credential',
      'session', 'cookie', 'api_key', 'private', 'sensitive'
    ];

    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    });

    return sanitized;
  }

  private createLogEntry(level: LogEntry['level'], message: string, data?: any, source?: string): LogEntry {
    return {
      level,
      message,
      data: data ? this.sanitizeData(data) : undefined,
      timestamp: new Date().toISOString(),
      source
    };
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private shouldLog(level: LogEntry['level']): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private sendToExternalService(entry: LogEntry) {
    // In production, send to monitoring service
    if (!this.isDevelopment && (entry.level === 'error' || entry.level === 'warn')) {
      // Send to error tracking service (Sentry, LogRocket, etc.)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: entry.message,
          fatal: entry.level === 'error',
        });
      }
    }
  }

  info(message: string, data?: any, source?: string) {
    const entry = this.createLogEntry('info', message, data, source);
    this.addToBuffer(entry);
    
    if (this.shouldLog('info')) {
      if (this.isDevelopment) {
        // Only use console in development
        console.log(`[${entry.timestamp}] ${source ? `[${source}] ` : ''}${message}`, data || '');
      }
    }
  }

  warn(message: string, data?: any, source?: string) {
    const entry = this.createLogEntry('warn', message, data, source);
    this.addToBuffer(entry);
    
    if (this.shouldLog('warn')) {
      if (this.isDevelopment) {
        console.warn(`[${entry.timestamp}] ${source ? `[${source}] ` : ''}${message}`, data || '');
      }
      this.sendToExternalService(entry);
    }
  }

  error(message: string, data?: any, source?: string) {
    const entry = this.createLogEntry('error', message, data, source);
    this.addToBuffer(entry);
    
    if (this.shouldLog('error')) {
      if (this.isDevelopment) {
        console.error(`[${entry.timestamp}] ${source ? `[${source}] ` : ''}${message}`, data || '');
      }
      this.sendToExternalService(entry);
    }
  }

  debug(message: string, data?: any, source?: string) {
    const entry = this.createLogEntry('debug', message, data, source);
    
    if (this.isDevelopment) {
      console.debug(`[${entry.timestamp}] ${source ? `[${source}] ` : ''}${message}`, data || '');
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  // Clear log buffer
  clearLogs() {
    this.logBuffer = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// Create singleton instance
export const logger = new SecureLogger();

// Development-only logging functions
export const devLog = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      logger.info(message, data, 'DEV');
    }
  },
  warn: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      logger.warn(message, data, 'DEV');
    }
  },
  error: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      logger.error(message, data, 'DEV');
    }
  }
};

// Production-safe error reporting
export const reportError = (error: Error | string, context?: any) => {
  const message = error instanceof Error ? error.message : error;
  const data = error instanceof Error ? { 
    stack: error.stack?.split('\n').slice(0, 5).join('\n'),
    context 
  } : { context };
  
  logger.error(message, data, 'ERROR_REPORT');
};

// Performance logging
export const perfLog = (operation: string, duration: number, details?: any) => {
  if (duration > 1000) { // Log slow operations
    logger.warn(`Slow operation: ${operation}`, { duration, details }, 'PERFORMANCE');
  } else if (import.meta.env.DEV) {
    logger.debug(`Performance: ${operation}`, { duration, details }, 'PERFORMANCE');
  }
};

export default logger;