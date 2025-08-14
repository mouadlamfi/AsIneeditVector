"use client";

import React, { useEffect, useState } from 'react';
import { useDesign } from '@/context/design-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Grid3X3, 
  Move, 
  Layers, 
  Settings,
  Menu,
  X,
  Smartphone,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileOptimizerProps {
  children: React.ReactNode;
}

export function MobileOptimizer({ children }: MobileOptimizerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const { scale, zoomIn, zoomOut, gridUnit, setGridUnit } = useDesign();

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Add mobile-specific CSS classes
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('mobile-device');
      document.body.classList.add(`orientation-${orientation}`);
    } else {
      document.body.classList.remove('mobile-device');
      document.body.classList.remove('orientation-portrait', 'orientation-landscape');
    }
  }, [isMobile, orientation]);

  // Prevent zoom on double tap for mobile
  useEffect(() => {
    if (isMobile) {
      let lastTouchEnd = 0;
      const preventZoom = (event: TouchEvent) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      };

      document.addEventListener('touchend', preventZoom, false);
      return () => document.removeEventListener('touchend', preventZoom);
    }
  }, [isMobile]);

  if (!isMobile && !isTablet) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-optimized-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="flex items-center justify-between p-3 bg-card/90 backdrop-blur-sm border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <h1 className="text-sm font-semibold">Design App</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {orientation === 'landscape' ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {Math.round(scale * 100)}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            <div className="space-y-4 p-4">
              {/* Zoom Controls */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Zoom</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={zoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-mono min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button variant="outline" size="sm" onClick={zoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Grid Controls */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Grid</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant={gridUnit === 'inch' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGridUnit('inch')}
                  >
                    Inch
                  </Button>
                  <Button
                    variant={gridUnit === 'cm' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGridUnit('cm')}
                  >
                    CM
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm">
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                  <Button variant="outline" size="sm">
                    <Move className="h-4 w-4 mr-2" />
                    Pan
                  </Button>
                  <Button variant="outline" size="sm">
                    <Layers className="h-4 w-4 mr-2" />
                    Layers
                  </Button>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Settings</h3>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "mobile-main-content",
        showMobileMenu && "mobile-menu-open"
      )}>
        {children}
      </div>

      {/* Mobile Bottom Toolbar */}
      <div className="mobile-bottom-toolbar">
        <div className="flex items-center justify-around p-2 bg-card/90 backdrop-blur-sm border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Layers className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Layers</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Grid3X3 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Grid</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Move className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pan Mode</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset View</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-optimized-layout {
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mobile-header {
          flex-shrink: 0;
          z-index: 50;
        }

        .mobile-main-content {
          flex: 1;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .mobile-menu-open .mobile-main-content {
          transform: translateX(80%);
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .mobile-menu-content {
          width: 80%;
          max-width: 300px;
          height: 100%;
          background: hsl(var(--card));
          border-right: 1px solid hsl(var(--border));
          overflow-y: auto;
        }

        .mobile-bottom-toolbar {
          flex-shrink: 0;
          z-index: 40;
        }

        /* Touch optimizations */
        .mobile-device * {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .mobile-device button {
          min-height: 44px;
          min-width: 44px;
        }

        /* Orientation-specific styles */
        .orientation-portrait .mobile-main-content {
          height: calc(100vh - 120px);
        }

        .orientation-landscape .mobile-main-content {
          height: calc(100vh - 80px);
        }

        /* Prevent text selection on mobile */
        .mobile-device {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Optimize scrolling */
        .mobile-device {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
}