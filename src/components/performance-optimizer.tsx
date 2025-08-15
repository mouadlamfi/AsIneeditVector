"use client";

import { useEffect, useRef } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Preload critical resources
    const preloadResources = () => {
      // Preload Three.js for homepage animation
      if (window.location.pathname === '/') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = 'https://unpkg.com/three@0.160.0/build/three.min.js';
        document.head.appendChild(link);
      }

      // Preload critical fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      fontLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontLink);
    };

    // Optimize images and lazy load
    const optimizeImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            observerRef.current?.unobserve(img);
          }
        });
      });

      images.forEach((img) => {
        observerRef.current?.observe(img);
      });
    };

    // Optimize canvas performance
    const optimizeCanvas = () => {
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        // Set optimal canvas settings
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }
      });
    };

    // Memory management
    const cleanupMemory = () => {
      // Clear unused WebGL contexts
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        if (gl) {
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
      });
    };

    // Initialize optimizations
    preloadResources();
    optimizeImages();
    optimizeCanvas();

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      cleanupMemory();
    };
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', entry.processingStart - entry.startTime);
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });

      return () => observer.disconnect();
    }
  }, []);

  return <>{children}</>;
}