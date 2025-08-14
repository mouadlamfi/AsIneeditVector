import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  bundleSize: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDebugInfo?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  showDebugInfo = false 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    bundleSize: 0,
  });

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrame: number;

    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      // Calculate FPS every second
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Get memory usage (if available)
        const memoryUsage = (performance as any).memory 
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage,
          renderTime: currentTime - lastTime,
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrame = requestAnimationFrame(measurePerformance);
    };

    measurePerformance();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [enabled]);

  // Performance optimization suggestions
  const getOptimizationSuggestions = () => {
    const suggestions = [];
    
    if (metrics.fps < 30) {
      suggestions.push('Low FPS detected - consider reducing SVG complexity');
    }
    
    if (metrics.memoryUsage > 100) {
      suggestions.push('High memory usage - check for memory leaks');
    }
    
    return suggestions;
  };

  if (!enabled || !showDebugInfo) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 p-3 bg-black/80 text-white rounded-lg backdrop-blur-sm">
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span>FPS:</span>
          <Badge variant={metrics.fps > 45 ? 'secondary' : metrics.fps > 30 ? 'outline' : 'destructive'}>
            {metrics.fps}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Memory:</span>
          <Badge variant={metrics.memoryUsage < 50 ? 'secondary' : 'outline'}>
            {metrics.memoryUsage}MB
          </Badge>
        </div>
        
        {getOptimizationSuggestions().map((suggestion, index) => (
          <div key={index} className="text-yellow-400 text-xs">
            ⚠ {suggestion}
          </div>
        ))}
      </div>
    </div>
  );
};