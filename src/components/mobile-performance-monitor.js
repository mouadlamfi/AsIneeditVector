"use client";

import React, { useEffect, useState, useCallback } from 'react';

// Mobile performance thresholds
const MOBILE_THRESHOLDS = {
  FPS_WARNING: 25,
  FPS_CRITICAL: 15,
  MEMORY_WARNING: 50, // MB
  MEMORY_CRITICAL: 100, // MB
  BATTERY_WARNING: 0.2, // 20%
  BATTERY_CRITICAL: 0.1, // 10%
};

// Performance optimization strategies
const PERFORMANCE_STRATEGIES = {
  REDUCE_ANIMATIONS: 'reduce_animations',
  REDUCE_GRID_DENSITY: 'reduce_grid_density',
  REDUCE_PARTICLES: 'reduce_particles',
  REDUCE_BLUR_EFFECTS: 'reduce_blur_effects',
  REDUCE_SHADOWS: 'reduce_shadows',
  REDUCE_OPACITY: 'reduce_opacity',
  PAUSE_NON_ESSENTIAL: 'pause_non_essential',
};

export function MobilePerformanceMonitor({ onPerformanceUpdate, children }) {
  const [performanceData, setPerformanceData] = useState({
    fps: 60,
    memory: 0,
    battery: 1,
    isMobile: false,
    isLowPower: false,
    activeStrategies: [],
    lastUpdate: Date.now(),
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [lastFrameTime, setLastFrameTime] = useState(0);

  // Detect mobile device
  const detectMobile = useCallback(() => {
    const mobile = window.innerWidth <= 768 || 
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return mobile;
  }, []);

  // Measure FPS
  const measureFPS = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastFrameTime;
    
    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime;
      setPerformanceData(prev => ({
        ...prev,
        fps: Math.round(currentFPS),
        lastUpdate: now,
      }));
    }
    
    setFrameCount(prev => prev + 1);
    setLastFrameTime(now);
  }, [lastFrameTime]);

  // Measure memory usage (if available)
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = performance.memory;
      const usedMemoryMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
      
      setPerformanceData(prev => ({
        ...prev,
        memory: usedMemoryMB,
      }));
    }
  }, []);

  // Check battery status (if available)
  const checkBattery = useCallback(async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        setPerformanceData(prev => ({
          ...prev,
          battery: battery.level,
          isLowPower: battery.level < MOBILE_THRESHOLDS.BATTERY_WARNING,
        }));
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
  }, []);

  // Determine performance strategies
  const determineStrategies = useCallback((data) => {
    const strategies = [];
    
    // FPS-based strategies
    if (data.fps < MOBILE_THRESHOLDS.FPS_CRITICAL) {
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_ANIMATIONS);
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_GRID_DENSITY);
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_PARTICLES);
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_BLUR_EFFECTS);
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_SHADOWS);
    } else if (data.fps < MOBILE_THRESHOLDS.FPS_WARNING) {
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_ANIMATIONS);
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_GRID_DENSITY);
    }
    
    // Memory-based strategies
    if (data.memory > MOBILE_THRESHOLDS.MEMORY_CRITICAL) {
      strategies.push(PERFORMANCE_STRATEGIES.PAUSE_NON_ESSENTIAL);
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_PARTICLES);
    } else if (data.memory > MOBILE_THRESHOLDS.MEMORY_WARNING) {
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_OPACITY);
    }
    
    // Battery-based strategies
    if (data.isLowPower) {
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_ANIMATIONS);
      strategies.push(PERFORMANCE_STRATEGIES.REDUCE_BLUR_EFFECTS);
    }
    
    return strategies;
  }, []);

  // Apply performance strategies
  const applyStrategies = useCallback((strategies) => {
    const root = document.documentElement;
    
    // Remove all previous strategy classes
    Object.values(PERFORMANCE_STRATEGIES).forEach(strategy => {
      root.classList.remove(`performance-${strategy}`);
    });
    
    // Apply new strategies
    strategies.forEach(strategy => {
      root.classList.add(`performance-${strategy}`);
    });
    
    // Update CSS custom properties for dynamic optimization
    if (strategies.includes(PERFORMANCE_STRATEGIES.REDUCE_ANIMATIONS)) {
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
    }
    
    if (strategies.includes(PERFORMANCE_STRATEGIES.REDUCE_OPACITY)) {
      root.style.setProperty('--grid-opacity', '0.1');
      root.style.setProperty('--flower-opacity', '0.05');
    }
    
    if (strategies.includes(PERFORMANCE_STRATEGIES.REDUCE_BLUR_EFFECTS)) {
      root.style.setProperty('--backdrop-blur', '2px');
    }
  }, []);

  // Performance monitoring loop
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      measureFPS();
      measureMemory();
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [isMonitoring, measureFPS, measureMemory]);

  // Battery monitoring
  useEffect(() => {
    if (!isMonitoring) return;
    
    checkBattery();
    const batteryInterval = setInterval(checkBattery, 30000); // Check every 30 seconds
    
    return () => clearInterval(batteryInterval);
  }, [isMonitoring, checkBattery]);

  // Start monitoring
  useEffect(() => {
    const mobile = detectMobile();
    setPerformanceData(prev => ({ ...prev, isMobile: mobile }));
    
    if (mobile) {
      setIsMonitoring(true);
    }
  }, [detectMobile]);

  // Update strategies when performance data changes
  useEffect(() => {
    if (!performanceData.isMobile) return;
    
    const strategies = determineStrategies(performanceData);
    applyStrategies(strategies);
    
    setPerformanceData(prev => ({
      ...prev,
      activeStrategies: strategies,
    }));
    
    // Notify parent component
    if (onPerformanceUpdate) {
      onPerformanceUpdate({
        ...performanceData,
        activeStrategies: strategies,
      });
    }
  }, [performanceData.fps, performanceData.memory, performanceData.battery, performanceData.isMobile, determineStrategies, applyStrategies, onPerformanceUpdate]);

  // Request animation frame for FPS measurement
  useEffect(() => {
    if (!isMonitoring) return;
    
    let animationId;
    
    const animate = () => {
      measureFPS();
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isMonitoring, measureFPS]);

  // Performance warning component (only show on mobile)
  const PerformanceWarning = () => {
    if (!performanceData.isMobile) return null;
    
    const hasWarnings = performanceData.fps < MOBILE_THRESHOLDS.FPS_WARNING ||
                       performanceData.memory > MOBILE_THRESHOLDS.MEMORY_WARNING ||
                       performanceData.isLowPower;
    
    if (!hasWarnings) return null;
    
    return (
      <div className="fixed top-4 right-4 z-[10000] bg-yellow-500/90 text-black px-3 py-2 rounded-md text-xs font-medium backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>Performance Mode Active</span>
        </div>
        {performanceData.fps < MOBILE_THRESHOLDS.FPS_WARNING && (
          <div className="text-xs opacity-75">FPS: {performanceData.fps}</div>
        )}
        {performanceData.memory > MOBILE_THRESHOLDS.MEMORY_WARNING && (
          <div className="text-xs opacity-75">Memory: {performanceData.memory}MB</div>
        )}
        {performanceData.isLowPower && (
          <div className="text-xs opacity-75">Low Battery Mode</div>
        )}
      </div>
    );
  };

  return (
    <>
      {children}
      <PerformanceWarning />
    </>
  );
}

// Hook for accessing performance data
export function useMobilePerformance() {
  const [performanceData, setPerformanceData] = useState(null);
  
  const updatePerformance = useCallback((data) => {
    setPerformanceData(data);
  }, []);
  
  return {
    performanceData,
    updatePerformance,
  };
}