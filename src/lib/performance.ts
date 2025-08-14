// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  bundleSize: number;
  loadTime: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initObservers();
  }

  private initObservers() {
    // Monitor Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const firstInputEntry = entry as PerformanceEventTiming;
          this.metrics.firstInputDelay = firstInputEntry.processingStart - firstInputEntry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Monitor Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      this.observers = [lcpObserver, fidObserver, clsObserver];
    }
  }

  public startMonitoring() {
    // Monitor First Contentful Paint
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.firstContentfulPaint = fcpEntry.startTime;
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);
    }

    // Monitor load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.metrics.loadTime = loadTime;
      this.logMetrics();
    });
  }

  public logMetrics() {
    console.log('Performance Metrics:', this.metrics);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        event_category: 'performance',
        value: this.metrics.largestContentfulPaint,
        custom_map: {
          metric1: 'first_contentful_paint',
          metric2: 'largest_contentful_paint',
          metric3: 'first_input_delay',
          metric4: 'cumulative_layout_shift',
          metric5: 'load_time'
        },
        metric1: this.metrics.firstContentfulPaint,
        metric2: this.metrics.largestContentfulPaint,
        metric3: this.metrics.firstInputDelay,
        metric4: this.metrics.cumulativeLayoutShift,
        metric5: this.metrics.loadTime
      });
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
  }
}

// Bundle size monitoring
export const getBundleSize = async (): Promise<number> => {
  if (typeof window !== 'undefined') {
    const response = await fetch('/_next/static/chunks/pages/index-*.js');
    const blob = await response.blob();
    return blob.size;
  }
  return 0;
};

// Memory usage monitoring
export const getMemoryUsage = (): { used: number; total: number } | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize
    };
  }
  return null;
};

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring();
}