import { useState, useEffect, useCallback, useRef } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface MobileOptimizations {
  isMobile: boolean;
  isTablet: boolean;
  touchSupport: boolean;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  viewportSize: { width: number; height: number };
}

export function useMobileOptimization() {
  const [optimizations, setOptimizations] = useState<MobileOptimizations>({
    isMobile: false,
    isTablet: false,
    touchSupport: false,
    devicePixelRatio: 1,
    orientation: 'portrait',
    viewportSize: { width: 0, height: 0 },
  });

  const [isTouch, setIsTouch] = useState(false);
  const touchStartRef = useRef<TouchPosition | null>(null);
  const lastTouchRef = useRef<number>(0);

  // Detect device capabilities
  useEffect(() => {
    const updateOptimizations = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setOptimizations({
        isMobile,
        isTablet,
        touchSupport,
        devicePixelRatio: window.devicePixelRatio || 1,
        orientation: width > height ? 'landscape' : 'portrait',
        viewportSize: { width, height },
      });
    };

    updateOptimizations();
    window.addEventListener('resize', updateOptimizations);
    window.addEventListener('orientationchange', updateOptimizations);

    return () => {
      window.removeEventListener('resize', updateOptimizations);
      window.removeEventListener('orientationchange', updateOptimizations);
    };
  }, []);

  // Optimized touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      setIsTouch(true);
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchRef.current < 300) {
      // Double tap detected
      e.preventDefault();
    }
    lastTouchRef.current = now;
    setIsTouch(false);
    touchStartRef.current = null;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1 && touchStartRef.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
      // Prevent scroll if moving horizontally (drawing gesture)
      if (deltaX > deltaY) {
        e.preventDefault();
      }
    }
  }, []);

  // Performance optimizations for mobile
  const getOptimizedSettings = useCallback(() => {
    const { isMobile, isTablet, devicePixelRatio } = optimizations;
    
    return {
      // Reduce quality on lower-end devices
      renderQuality: isMobile ? 0.75 : 1,
      // Limit maximum zoom on mobile
      maxZoom: isMobile ? 3 : 5,
      // Debounce drawing events more aggressively on mobile
      drawingDebounce: isMobile ? 16 : 8,
      // Use lower DPI for better performance
      pixelRatio: Math.min(devicePixelRatio, isMobile ? 2 : 3),
      // Reduce grid density on mobile
      gridDensity: isMobile ? 0.5 : 1,
      // Enable hardware acceleration hints
      useHardwareAcceleration: true,
      // Optimize SVG rendering
      svgOptimization: {
        useViewportCulling: true,
        batchUpdates: true,
        throttleUpdates: isMobile ? 100 : 50,
      },
    };
  }, [optimizations]);

  // CSS variables for responsive design
  const getCSSVariables = useCallback(() => {
    const { isMobile, isTablet, viewportSize } = optimizations;
    
    return {
      '--toolbar-size': isMobile ? '48px' : '40px',
      '--touch-target-size': isMobile ? '44px' : '32px',
      '--panel-width': isMobile ? '100%' : isTablet ? '320px' : '400px',
      '--canvas-padding': isMobile ? '8px' : '16px',
      '--zoom-control-size': isMobile ? '56px' : '48px',
      '--font-size-ui': isMobile ? '16px' : '14px',
      '--viewport-width': `${viewportSize.width}px`,
      '--viewport-height': `${viewportSize.height}px`,
    };
  }, [optimizations]);

  return {
    ...optimizations,
    isTouch,
    getOptimizedSettings,
    getCSSVariables,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}