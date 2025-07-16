import React, { useEffect, useState, useRef } from 'react';
import { FeatureFlag } from '@/components/feature-flags/FeatureFlag';

/**
 * Performance Monitor for Phase 3.1 Aceternity Components
 * 
 * Tracks FPS, memory usage, and bundle impact to ensure
 * mobile performance targets are met (60fps, <50KB delta)
 */

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  bundleSize?: number;
  animationFrames: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  children?: React.ReactNode;
}

export const AceternityPerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  onMetrics,
  children
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    animationFrames: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef<number[]>([]);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const measurePerformance = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      
      // Calculate FPS
      frameCountRef.current++;
      
      if (deltaTime >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / deltaTime);
        fpsRef.current.push(currentFps);
        
        // Keep only last 10 FPS measurements
        if (fpsRef.current.length > 10) {
          fpsRef.current.shift();
        }
        
        const avgFps = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;
        
        // Get memory usage (if available)
        const memoryUsage = (performance as any).memory 
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0;

        const newMetrics: PerformanceMetrics = {
          fps: Math.round(avgFps),
          memoryUsage,
          renderTime: Math.round(deltaTime),
          animationFrames: frameCountRef.current
        };

        setMetrics(newMetrics);
        onMetrics?.(newMetrics);
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      animationIdRef.current = requestAnimationFrame(measurePerformance);
    };

    animationIdRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [enabled, onMetrics]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <FeatureFlag name="phase3.1">
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-white text-xs p-2 rounded-lg backdrop-blur-sm font-mono">
          <div className="flex flex-col gap-1">
            <div className={`flex items-center gap-2 ${metrics.fps < 55 ? 'text-red-400' : metrics.fps < 58 ? 'text-yellow-400' : 'text-green-400'}`}>
              <span>FPS:</span>
              <span className="font-bold">{metrics.fps}</span>
              {metrics.fps < 55 && <span className="text-red-500">⚠️</span>}
            </div>
            <div className="flex items-center gap-2 text-blue-300">
              <span>MEM:</span>
              <span>{metrics.memoryUsage}MB</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span>Frames:</span>
              <span>{metrics.animationFrames}</span>
            </div>
          </div>
        </div>
      </FeatureFlag>
    </>
  );
};

/**
 * Bundle Size Analyzer
 * Reports estimated bundle impact of Aceternity components
 */
export const BundleSizeAnalyzer = () => {
  const [bundleAnalysis, setBundleAnalysis] = useState<{
    estimated: number;
    components: Record<string, number>;
  }>({
    estimated: 0,
    components: {}
  });

  useEffect(() => {
    // Simulate bundle analysis
    // In production, this would integrate with webpack-bundle-analyzer
    const estimatedSizes = {
      'glare-card': 8.5, // KB
      'text-generate': 6.2, // KB
      'animated-modal': 12.3, // KB
      'framer-motion': 15.8, // KB (shared)
      'radix-ui': 8.1, // KB (shared)
    };

    const totalEstimated = Object.values(estimatedSizes).reduce((a, b) => a + b, 0);

    setBundleAnalysis({
      estimated: Math.round(totalEstimated * 10) / 10,
      components: estimatedSizes
    });
  }, []);

  return (
    <FeatureFlag name="phase3.1">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 m-4">
        <h3 className="font-bold text-blue-900 mb-2">Phase 3.1 Bundle Analysis</h3>
        <div className="space-y-1 text-sm">
          <div className={`font-medium ${bundleAnalysis.estimated < 50 ? 'text-green-600' : 'text-red-600'}`}>
            Total Estimated: {bundleAnalysis.estimated}KB
            {bundleAnalysis.estimated < 50 ? ' ✅' : ' ⚠️ Over target'}
          </div>
          <div className="text-gray-600">
            Target: &lt;50KB for Phase 3.1
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-700 hover:text-blue-900">
              Component Breakdown
            </summary>
            <div className="mt-2 pl-4 space-y-1">
              {Object.entries(bundleAnalysis.components).map(([component, size]) => (
                <div key={component} className="flex justify-between">
                  <span>{component}:</span>
                  <span>{size}KB</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </FeatureFlag>
  );
};

/**
 * Performance Warning Component
 * Shows warnings when performance targets are not met
 */
interface PerformanceWarningProps {
  fps: number;
  memoryUsage: number;
}

export const PerformanceWarning: React.FC<PerformanceWarningProps> = ({ fps, memoryUsage }) => {
  const showFpsWarning = fps < 55;
  const showMemoryWarning = memoryUsage > 100;

  if (!showFpsWarning && !showMemoryWarning) {
    return null;
  }

  return (
    <FeatureFlag name="phase3.1">
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <div className="text-sm">
            {showFpsWarning && <div>Low FPS detected: {fps} (target: 60)</div>}
            {showMemoryWarning && <div>High memory usage: {memoryUsage}MB</div>}
          </div>
        </div>
      </div>
    </FeatureFlag>
  );
};

export default AceternityPerformanceMonitor;