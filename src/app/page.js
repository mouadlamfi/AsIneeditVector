"use client";

import React, { useState, useEffect } from 'react';
import { DesignProvider } from '@/context/design-context';
import { GarmentCanvas } from '@/components/garment-canvas';
import { CollapsibleMenu } from '@/components/collapsible-menu';
import { ExportMenu } from '@/components/export-menu';
import { FlowerOfLifeLogo } from '@/components/flower-of-life-logo';
import { MobilePerformanceMonitor, useMobilePerformance } from '@/components/mobile-performance-monitor';
import { clearAllModalsAndOverlays, setupGlobalEscapeHandler, setupGlobalClickOutsideHandler, debugClearModals } from '@/lib/modal-cleanup';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-gray-400">The app encountered an error. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component with Performance Monitoring
function AsINeedItArt() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { performanceData, updatePerformance } = useMobilePerformance();

  // Global modal cleanup on app initialization
  useEffect(() => {
    // Clear any existing modals/overlays
    clearAllModalsAndOverlays();
    
    // Setup global event handlers
    setupGlobalEscapeHandler();
    setupGlobalClickOutsideHandler();
    
    // Cleanup on unmount
    return () => {
      clearAllModalsAndOverlays();
    };
  }, []);

  // Handle performance updates
  const handlePerformanceUpdate = (data) => {
    updatePerformance(data);
    
    // Apply mobile-specific optimizations based on performance data
    if (data.isMobile && data.activeStrategies.length > 0) {
      console.log('Mobile performance optimizations active:', data.activeStrategies);
    }
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {/* Mobile Performance Monitor */}
      <MobilePerformanceMonitor onPerformanceUpdate={handlePerformanceUpdate}>
        {/* Main Canvas */}
        <div className="absolute inset-0">
          <GarmentCanvas />
        </div>

        {/* Menu Button - Flower of Life Logo */}
        <div className="absolute top-4 left-4 z-[9999]">
          <FlowerOfLifeLogo 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            isActive={isMenuOpen}
          />
        </div>

        {/* Collapsible Menu */}
        {isMenuOpen && (
          <CollapsibleMenu 
            isVisible={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onExportClick={() => {
              setIsMenuOpen(false);
              setIsExportOpen(true);
            }}
          />
        )}

        {/* Export Menu */}
        {isExportOpen && (
          <ExportMenu 
            onClose={() => setIsExportOpen(false)}
          />
        )}

        {/* Debug Button (temporary) */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={debugClearModals}
            className="fixed bottom-4 right-4 z-[10000] bg-red-500 text-white px-3 py-2 rounded text-xs"
          >
            Debug: Clear Modals
          </button>
        )}

        {/* Performance Status (development only) */}
        {process.env.NODE_ENV === 'development' && performanceData && (
          <div className="fixed bottom-4 left-4 z-[10000] bg-black/80 text-white px-3 py-2 rounded text-xs font-mono">
            <div>FPS: {performanceData.fps}</div>
            <div>Memory: {performanceData.memory}MB</div>
            <div>Battery: {Math.round(performanceData.battery * 100)}%</div>
            <div>Mobile: {performanceData.isMobile ? 'Yes' : 'No'}</div>
            {performanceData.activeStrategies.length > 0 && (
              <div>Strategies: {performanceData.activeStrategies.join(', ')}</div>
            )}
          </div>
        )}
      </MobilePerformanceMonitor>
    </div>
  );
}

// Root App Component
export default function HomePage() {
  return (
    <ErrorBoundary>
      <DesignProvider>
        <AsINeedItArt />
      </DesignProvider>
    </ErrorBoundary>
  );
}