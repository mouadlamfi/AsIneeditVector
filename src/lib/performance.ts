// Performance utilities for the design platform

// Debounce function for high-frequency events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function for continuous events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Optimized viewport calculations
export function isInViewport(
  element: { x: number; y: number; width?: number; height?: number },
  viewport: { minX: number; minY: number; maxX: number; maxY: number },
  buffer = 50
): boolean {
  const elementRight = element.x + (element.width || 0);
  const elementBottom = element.y + (element.height || 0);
  
  return !(
    elementRight < viewport.minX - buffer ||
    element.x > viewport.maxX + buffer ||
    elementBottom < viewport.minY - buffer ||
    element.y > viewport.maxY + buffer
  );
}

// Memory-efficient array operations
export function batchUpdate<T>(
  array: T[],
  updates: Array<{ index: number; value: T }>,
  batchSize = 100
): Promise<T[]> {
  return new Promise((resolve) => {
    const result = [...array];
    let processedCount = 0;
    
    function processBatch() {
      const endIndex = Math.min(processedCount + batchSize, updates.length);
      
      for (let i = processedCount; i < endIndex; i++) {
        const update = updates[i];
        if (update.index >= 0 && update.index < result.length) {
          result[update.index] = update.value;
        }
      }
      
      processedCount = endIndex;
      
      if (processedCount < updates.length) {
        requestAnimationFrame(processBatch);
      } else {
        resolve(result);
      }
    }
    
    processBatch();
  });
}

// SVG optimization utilities
export function optimizeSVGPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  
  // Remove duplicate points
  const optimizedPoints = points.filter((point, index) => {
    if (index === 0) return true;
    const prevPoint = points[index - 1];
    return Math.abs(point.x - prevPoint.x) > 0.5 || Math.abs(point.y - prevPoint.y) > 0.5;
  });
  
  if (optimizedPoints.length === 0) return '';
  
  let pathData = `M ${optimizedPoints[0].x.toFixed(2)} ${optimizedPoints[0].y.toFixed(2)}`;
  
  for (let i = 1; i < optimizedPoints.length; i++) {
    const point = optimizedPoints[i];
    pathData += ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }
  
  return pathData;
}

// Canvas performance monitoring
export class PerformanceTracker {
  private frameCount = 0;
  private lastTime = 0;
  private fpsHistory: number[] = [];
  private memoryHistory: number[] = [];
  
  constructor(private maxHistoryLength = 60) {}
  
  startFrame(): number {
    return performance.now();
  }
  
  endFrame(startTime: number): void {
    const endTime = performance.now();
    const frameTime = endTime - startTime;
    
    this.frameCount++;
    
    // Calculate FPS
    if (endTime - this.lastTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (endTime - this.lastTime));
      this.fpsHistory.push(fps);
      
      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }
      
      this.frameCount = 0;
      this.lastTime = endTime;
    }
    
    // Track memory if available
    if ((performance as any).memory) {
      const memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      this.memoryHistory.push(memoryUsage);
      
      if (this.memoryHistory.length > this.maxHistoryLength) {
        this.memoryHistory.shift();
      }
    }
  }
  
  getAverageFPS(): number {
    return this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
      : 0;
  }
  
  getAverageMemory(): number {
    return this.memoryHistory.length > 0 
      ? this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length 
      : 0;
  }
  
  getMetrics() {
    return {
      avgFPS: this.getAverageFPS(),
      avgMemory: this.getAverageMemory(),
      fpsHistory: [...this.fpsHistory],
      memoryHistory: [...this.memoryHistory],
    };
  }
}