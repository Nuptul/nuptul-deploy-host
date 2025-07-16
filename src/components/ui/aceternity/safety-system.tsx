import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { FeatureFlag, emergencyDisableFeature } from '@/components/feature-flags/FeatureFlag';
import { cn } from '@/lib/utils';

/**
 * Comprehensive Safety System for Phase 3 Aceternity Components
 * 
 * Provides error boundaries, fallback components, and emergency protocols
 * to ensure the wedding app remains functional even if Aceternity components fail.
 */

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  timestamp: number;
}

interface AceternityErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName: string;
  featureFlag?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableReporting?: boolean;
  autoRecover?: boolean;
  maxRetries?: number;
}

/**
 * Enhanced Error Boundary specifically designed for Aceternity components
 * Provides automatic fallback to legacy GlassCard and error reporting
 */
export class AceternityErrorBoundary extends Component<
  AceternityErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCount = 0;
  private recoverTimer?: NodeJS.Timeout;

  constructor(props: AceternityErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      errorId: '',
      timestamp: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `aceternity_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      timestamp: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName, featureFlag, onError, enableReporting = true } = this.props;

    this.setState({
      error,
      errorInfo
    });

    // Report error for monitoring
    if (enableReporting) {
      this.reportError(error, errorInfo);
    }

    // Emergency disable feature flag if critical error
    if (featureFlag && this.isCriticalError(error)) {
      console.warn(`[Safety] Emergency disabling feature flag: ${featureFlag}`);
      emergencyDisableFeature(featureFlag);
    }

    // Custom error handler
    onError?.(error, errorInfo);

    // Auto-recovery attempt
    if (this.props.autoRecover && this.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRecovery();
    }
  }

  private isCriticalError(error: Error): boolean {
    const criticalPatterns = [
      /ChunkLoadError/i,
      /Loading chunk \d+ failed/i,
      /NetworkError/i,
      /Memory/i,
      /Maximum call stack/i
    ];

    return criticalPatterns.some(pattern => pattern.test(error.message));
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    const errorReport = {
      errorId: this.state.errorId,
      timestamp: this.state.timestamp,
      componentName: this.props.componentName,
      featureFlag: this.props.featureFlag,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    // Send to monitoring service (replace with actual service)
    console.error('[Aceternity Safety] Error Report:', errorReport);
    
    // In production, send to actual error reporting service
    // Example: Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // window.errorReportingService?.captureException(error, errorReport);
    }
  }

  private scheduleRecovery() {
    this.retryCount++;
    
    this.recoverTimer = setTimeout(() => {
      
      
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: '',
        timestamp: 0
      });
    }, 2000 * this.retryCount); // Exponential backoff
  }

  componentWillUnmount() {
    if (this.recoverTimer) {
      clearTimeout(this.recoverTimer);
    }
  }

  render() {
    if (this.state.hasError) {
      // Use provided fallback or default legacy fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <LegacyGlassCardFallback 
        componentName={this.props.componentName}
        error={this.state.error}
        errorId={this.state.errorId}
        retryCount={this.retryCount}
        maxRetries={this.props.maxRetries || 3}
        onRetry={() => this.scheduleRecovery()}
      />;
    }

    return this.props.children;
  }
}

/**
 * Legacy GlassCard Fallback Component
 * Provides a graceful degradation when Aceternity components fail
 */
interface LegacyGlassCardFallbackProps {
  componentName: string;
  error?: Error;
  errorId: string;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  children?: ReactNode;
}

export const LegacyGlassCardFallback: React.FC<LegacyGlassCardFallbackProps> = ({
  componentName,
  error,
  errorId,
  retryCount,
  maxRetries,
  onRetry,
  children
}) => {
  const showRetryButton = retryCount < maxRetries;
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden",
      "bg-white/10 backdrop-blur-md border border-white/20",
      "shadow-lg hover:shadow-xl transition-all duration-300",
      "p-6 min-h-[100px]"
    )}>
      {/* Glass overlay for luxury feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
      
      <div className="relative z-10">
        {children || (
          <div className="text-center">
            <div className="text-gray-600 mb-3">
              <div className="text-sm font-medium mb-1">Wedding Experience</div>
              <div className="text-xs text-gray-500">
                Enhanced mode temporarily unavailable
              </div>
            </div>
            
            {/* Elegant loading indicator */}
            <div className="flex justify-center space-x-1 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-pink-400/60 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>

            {showRetryButton && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-300/30 rounded-lg text-sm text-pink-700 transition-colors"
              >
                Retry Enhancement ({retryCount}/{maxRetries})
              </button>
            )}
            
            {/* Development error details */}
            {isDevelopment && error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                  Debug Info (Dev Only)
                </summary>
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs">
                  <div className="font-medium text-red-800">Component: {componentName}</div>
                  <div className="text-red-600 mt-1">Error ID: {errorId}</div>
                  <div className="text-red-600 mt-1">
                    {error.name}: {error.message}
                  </div>
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Safe Aceternity Component Wrapper
 * Combines ErrorBoundary, FeatureFlag, and Suspense for complete safety
 */
interface SafeAceternityWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  componentName: string;
  featureFlag: string;
  className?: string;
  enableAutoRecover?: boolean;
  onError?: (error: Error) => void;
}

export const SafeAceternityWrapper: React.FC<SafeAceternityWrapperProps> = ({
  children,
  fallback,
  loadingFallback,
  componentName,
  featureFlag,
  className,
  enableAutoRecover = true,
  onError
}) => {
  const defaultLoadingFallback = (
    <div className={cn(
      "animate-pulse rounded-xl bg-gradient-to-br from-pink-100/50 to-purple-100/50",
      "border border-pink-200/30 backdrop-blur-sm",
      "flex items-center justify-center min-h-[100px]",
      className
    )}>
      <div className="text-pink-500/70 text-sm font-medium">
        Loading wedding experience...
      </div>
    </div>
  );

  return (
    <FeatureFlag 
      name={featureFlag}
      fallback={fallback || <LegacyGlassCardFallback 
        componentName={componentName}
        errorId="feature_disabled"
        retryCount={0}
        maxRetries={0}
        onRetry={() => {}}
      />}
    >
      <AceternityErrorBoundary
        componentName={componentName}
        featureFlag={featureFlag}
        autoRecover={enableAutoRecover}
        onError={onError}
        fallback={fallback}
      >
        <Suspense fallback={loadingFallback || defaultLoadingFallback}>
          {children}
        </Suspense>
      </AceternityErrorBoundary>
    </FeatureFlag>
  );
};

/**
 * Lazy Loading Router for Aceternity Components
 * Conditionally loads components based on feature flags
 */
interface AceternityRouterProps {
  phase31Enabled: boolean;
  phase32Enabled: boolean;
  children: (components: {
    GlareCard?: React.ComponentType<any>;
    TextGenerate?: React.ComponentType<any>;
    AnimatedModal?: React.ComponentType<any>;
    HeroParallax?: React.ComponentType<any>;
    Sparkles?: React.ComponentType<any>;
    Card3D?: React.ComponentType<any>;
  }) => ReactNode;
}

export const AceternityRouter: React.FC<AceternityRouterProps> = ({
  phase31Enabled,
  phase32Enabled,
  children
}) => {
  // Lazy load components based on feature flags
  const components = React.useMemo(() => {
    const loadedComponents: any = {};

    if (phase31Enabled) {
      // Dynamic imports for Phase 3.1 components
      const { Phase31GlareCard, Phase31TextGenerate, Phase31AnimatedModal } = 
        require('@/components/ui/aceternity/phase3-core');
      
      loadedComponents.GlareCard = Phase31GlareCard;
      loadedComponents.TextGenerate = Phase31TextGenerate;
      loadedComponents.AnimatedModal = Phase31AnimatedModal;
    }

    if (phase32Enabled) {
      // Dynamic imports for Phase 3.2 components
      const { Phase32HeroParallax, Phase32Sparkles, Phase32Card3D } = 
        require('@/components/ui/aceternity/phase3-advanced');
      
      loadedComponents.HeroParallax = Phase32HeroParallax;
      loadedComponents.Sparkles = Phase32Sparkles;
      loadedComponents.Card3D = Phase32Card3D;
    }

    return loadedComponents;
  }, [phase31Enabled, phase32Enabled]);

  return <>{children(components)}</>;
};

/**
 * Safety Monitoring Hook
 * Tracks component health and performance
 */
interface SafetyMetrics {
  errorCount: number;
  lastError?: Date;
  performanceIssues: number;
  featureFlags: Record<string, boolean>;
}

export const useSafetyMonitoring = () => {
  const [metrics, setMetrics] = React.useState<SafetyMetrics>({
    errorCount: 0,
    performanceIssues: 0,
    featureFlags: {}
  });

  const reportError = React.useCallback((componentName: string, error: Error) => {
    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
      lastError: new Date()
    }));

    console.warn(`[Safety Monitor] Error in ${componentName}:`, error);
  }, []);

  const reportPerformanceIssue = React.useCallback((componentName: string, fps: number) => {
    if (fps < 55) {
      setMetrics(prev => ({
        ...prev,
        performanceIssues: prev.performanceIssues + 1
      }));

      console.warn(`[Safety Monitor] Performance issue in ${componentName}: ${fps}fps`);
    }
  }, []);

  const emergencyShutdown = React.useCallback((reason: string) => {
    console.error(`[Safety Monitor] Emergency shutdown: ${reason}`);
    
    // Disable all Aceternity features
    emergencyDisableFeature('phase3.1');
    emergencyDisableFeature('phase3.2');
    
    // Show user notification
    // Could integrate with toast/notification system
  }, []);

  return {
    metrics,
    reportError,
    reportPerformanceIssue,
    emergencyShutdown
  };
};

/**
 * Safety Dashboard Component (for admin monitoring)
 */
export const SafetyDashboard: React.FC = () => {
  const { metrics, emergencyShutdown } = useSafetyMonitoring();

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Aceternity Safety Monitor</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Total Errors</div>
          <div className="text-2xl font-bold text-red-600">{metrics.errorCount}</div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Performance Issues</div>
          <div className="text-2xl font-bold text-yellow-600">{metrics.performanceIssues}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Last Error</div>
        <div className="text-sm text-gray-600">
          {metrics.lastError ? metrics.lastError.toLocaleString() : 'None'}
        </div>
      </div>

      <button
        onClick={() => emergencyShutdown('Manual admin shutdown')}
        className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Emergency Shutdown
      </button>
    </div>
  );
};

export default {
  AceternityErrorBoundary,
  LegacyGlassCardFallback,
  SafeAceternityWrapper,
  AceternityRouter,
  useSafetyMonitoring,
  SafetyDashboard
};