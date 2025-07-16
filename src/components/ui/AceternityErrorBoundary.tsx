import React, { Component, ErrorInfo, ReactNode } from 'react';
import GlassCard from '@/components/GlassCard';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary for Aceternity Components
 * Prevents component failures from breaking the entire app
 * Falls back to glassmorphism design gracefully
 */
class AceternityErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`[Aceternity] Component error in ${this.props.componentName}:`, error, errorInfo);
    
    // In production, this could send error reports to monitoring service
    if (import.meta.env.PROD) {
      // Example: errorReportingService.report(error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default glassmorphism fallback
      return (
        <GlassCard className="p-4 border-amber-200 bg-amber-50/80">
          <div className="flex items-center gap-3 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <div className="font-medium">Component temporarily unavailable</div>
              <div className="text-sm text-amber-600">
                {this.props.componentName ? `${this.props.componentName} fell back to safe mode` : 'Using fallback display'}
              </div>
            </div>
          </div>
        </GlassCard>
      );
    }

    return this.props.children;
  }
}

export default AceternityErrorBoundary;