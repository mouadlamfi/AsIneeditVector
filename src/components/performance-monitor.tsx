"use client";

import { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  enabled?: boolean;
}

export function PerformanceMonitor({ enabled = process.env.NODE_ENV === 'development' }: PerformanceMonitorProps) {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const fpsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    let animationId: number;

    const measureFPS = (currentTime: number) => {
      frameCountRef.current++;
      
      if (currentTime - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        
        if (fpsRef.current) {
          fpsRef.current.textContent = `FPS: ${fps}`;
          fpsRef.current.style.color = fps >= 50 ? '#10B981' : fps >= 30 ? '#F59E0B' : '#EF4444';
        }
        
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    // Monitor Core Web Vitals
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              console.log('🚀 LCP:', Math.round(entry.startTime), 'ms');
              break;
            case 'first-input':
              const firstInputEntry = entry as PerformanceEventTiming;
              console.log('⚡ FID:', Math.round(firstInputEntry.processingStart - firstInputEntry.startTime), 'ms');
              break;
            case 'layout-shift':
              const layoutShiftEntry = entry as any;
              console.log('📐 CLS:', Math.round(layoutShiftEntry.value * 1000) / 1000);
              break;
          }
        }
      });

      observer.observe({ 
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] 
      });

      // Monitor memory usage
      if ('memory' in performance) {
        setInterval(() => {
          const memory = (performance as any).memory;
          console.log('💾 Memory:', {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
          });
        }, 5000);
      }

      // Monitor network performance
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('🌐 Network Performance:', {
          dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart) + 'ms',
          tcp: Math.round(navigation.connectEnd - navigation.connectStart) + 'ms',
          ttfb: Math.round(navigation.responseStart - navigation.requestStart) + 'ms',
          domLoad: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart) + 'ms',
          windowLoad: Math.round(navigation.loadEventEnd - navigation.fetchStart) + 'ms'
        });
      }
    }

    // Start FPS monitoring
    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white px-3 py-2 rounded text-sm font-mono">
      <div ref={fpsRef}>FPS: --</div>
      <div>Build: {process.env.NODE_ENV}</div>
    </div>
  );
}