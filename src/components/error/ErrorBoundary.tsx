import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error securely without sensitive data
    const sanitizedError = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'), // Limit stack trace
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Report to error tracking service (without console.log)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Store error info for debugging
    this.setState({
      error,
      errorInfo,
    });

    // Report to external monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: sanitizedError.message,
        fatal: false,
      });
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
          <div className="max-w-md w-full">
            {/* Glass card with error UI */}
            <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-8">
                We're sorry, but something unexpected happened. Please try refreshing the page or return to the home page.
              </p>

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>

              {/* Error details for development */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-32">
                    <div className="font-semibold">Error:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    {this.state.error.stack && (
                      <>
                        <div className="font-semibold">Stack:</div>
                        <pre className="whitespace-pre-wrap">
                          {this.state.error.stack.split('\n').slice(0, 10).join('\n')}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for route components
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Error</h1>
            <p className="text-gray-600 mb-4">This page encountered an error.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Component-specific error boundary
export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: ReactNode;
  componentName: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">{componentName} Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">
            This component failed to load. Please refresh the page.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}