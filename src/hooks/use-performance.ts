import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domLoad: number; // DOM Content Loaded
  windowLoad: number; // Window Load
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  fps: number;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  const measurePerformance = () => {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const lcp = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0;
    
    // Measure memory usage if available
    const memory = (performance as any).memory ? {
      used: Math.round((performance as any).memory.usedJSHeapSize / 1048576),
      total: Math.round((performance as any).memory.totalJSHeapSize / 1048576),
      limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576),
    } : { used: 0, total: 0, limit: 0 };

    const newMetrics: PerformanceMetrics = {
      fcp,
      lcp,
      fid: 0, // Will be measured on first interaction
      cls: 0, // Will be measured over time
      ttfb: navigation.responseStart - navigation.requestStart,
      domLoad: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      windowLoad: navigation.loadEventEnd - navigation.fetchStart,
      memory,
      fps: 0, // Will be measured continuously
    };

    setMetrics(newMetrics);
  };

  const startFPSMonitoring = () => {
    if (typeof window === 'undefined') return;

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        
        setMetrics(prev => prev ? { ...prev, fps } : null);
        
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    measureFPS();
  };

  const stopFPSMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    measurePerformance();
    startFPSMonitoring();

    // Measure CLS over time
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          const layoutShift = entry as any;
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
            setMetrics(prev => prev ? { ...prev, cls: clsValue } : null);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });

    // Measure FID on first interaction
    const measureFID = () => {
      const fid = performance.now() - navigationStart;
      setMetrics(prev => prev ? { ...prev, fid } : null);
      document.removeEventListener('click', measureFID);
      document.removeEventListener('keydown', measureFID);
    };

    const navigationStart = performance.now();
    document.addEventListener('click', measureFID, { once: true });
    document.addEventListener('keydown', measureFID, { once: true });

    return () => {
      observer.disconnect();
      stopFPSMonitoring();
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    stopFPSMonitoring();
  };

  const logMetrics = () => {
    if (metrics) {
      console.group('🚀 Performance Metrics');
      console.log('First Contentful Paint:', `${metrics.fcp.toFixed(2)}ms`);
      console.log('Largest Contentful Paint:', `${metrics.lcp.toFixed(2)}ms`);
      console.log('First Input Delay:', `${metrics.fid.toFixed(2)}ms`);
      console.log('Cumulative Layout Shift:', metrics.cls.toFixed(3));
      console.log('Time to First Byte:', `${metrics.ttfb.toFixed(2)}ms`);
      console.log('DOM Load Time:', `${metrics.domLoad.toFixed(2)}ms`);
      console.log('Window Load Time:', `${metrics.windowLoad.toFixed(2)}ms`);
      console.log('FPS:', metrics.fps);
      console.log('Memory Usage:', `${metrics.memory.used}MB / ${metrics.memory.total}MB (${metrics.memory.limit}MB limit)`);
      console.groupEnd();
    }
  };

  const getPerformanceScore = () => {
    if (!metrics) return 0;

    let score = 100;

    // FCP scoring (0-25 points)
    if (metrics.fcp > 1800) score -= 25;
    else if (metrics.fcp > 1000) score -= 15;
    else if (metrics.fcp > 500) score -= 5;

    // LCP scoring (0-25 points)
    if (metrics.lcp > 2500) score -= 25;
    else if (metrics.lcp > 1500) score -= 15;
    else if (metrics.lcp > 800) score -= 5;

    // FID scoring (0-25 points)
    if (metrics.fid > 300) score -= 25;
    else if (metrics.fid > 100) score -= 15;
    else if (metrics.fid > 50) score -= 5;

    // CLS scoring (0-25 points)
    if (metrics.cls > 0.25) score -= 25;
    else if (metrics.cls > 0.1) score -= 15;
    else if (metrics.cls > 0.05) score -= 5;

    return Math.max(0, score);
  };

  useEffect(() => {
    return () => {
      stopFPSMonitoring();
    };
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    logMetrics,
    getPerformanceScore,
  };
}