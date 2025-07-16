import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

const PerformanceMonitor: React.FC = () => {
  // Return null immediately in production
  if (import.meta.env.PROD) return null;
  
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(import.meta.env.DEV);
    
    // Only monitor in development
    if (!import.meta.env.DEV) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + (entry as any).value }));
            }
            break;
        }
      }
    });

    // Register for different entry types
    ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'].forEach(type => {
      try {
        observer.observe({ entryTypes: [type] });
      } catch (e) {
        // Some entry types might not be supported
      }
    });

    // TTFB from navigation timing
    if (window.performance && window.performance.timing) {
      const ttfb = window.performance.timing.responseStart - window.performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, ttfb }));
    }

    return () => observer.disconnect();
  }, []);

  // Only render in development
  if (!isDev || import.meta.env.PROD) return null;

  const formatTime = (time: number) => `${Math.round(time)}ms`;
  
  const getScoreColor = (metric: string, value: number) => {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 }
    };
    
    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-500';
    
    if (value <= threshold.good) return 'text-green-500';
    if (value <= threshold.poor) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 backdrop-blur-sm">
      <div className="text-yellow-400 mb-2 font-semibold">Performance Metrics</div>
      <div className="space-y-1">
        {metrics.fcp && (
          <div className={getScoreColor('fcp', metrics.fcp)}>
            FCP: {formatTime(metrics.fcp)}
          </div>
        )}
        {metrics.lcp && (
          <div className={getScoreColor('lcp', metrics.lcp)}>
            LCP: {formatTime(metrics.lcp)}
          </div>
        )}
        {metrics.fid && (
          <div className={getScoreColor('fid', metrics.fid)}>
            FID: {formatTime(metrics.fid)}
          </div>
        )}
        {metrics.cls !== undefined && (
          <div className={getScoreColor('cls', metrics.cls)}>
            CLS: {metrics.cls.toFixed(3)}
          </div>
        )}
        {metrics.ttfb && (
          <div className={getScoreColor('ttfb', metrics.ttfb)}>
            TTFB: {formatTime(metrics.ttfb)}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;