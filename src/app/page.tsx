
"use client";

import { DesignProvider } from '@/context/design-context';
import { GarmentCanvas } from '@/components/garment-canvas';
import { PenTool, Settings, HelpCircle, Zap, Layers, Palette, Ruler, Minus, Plus } from 'lucide-react';
import { DrawingToolbar } from '@/components/drawing-toolbar';
import { LayersPanel } from '@/components/layers-panel';
import { MobileOptimizer } from '@/components/mobile-optimizer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useRef, lazy, Suspense } from 'react';
import { useDesign } from '@/context/design-context';
import { cn } from '@/lib/utils';

// Lazy load the export menu to reduce initial bundle size
const ExportMenu = lazy(() => import('@/components/export-menu'));

// Loading component for lazy-loaded components
const ExportMenuLoader = () => (
  <div className="flex items-center justify-center p-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
  </div>
);

function addWatermark(container: HTMLElement) {
  const watermark = document.createElement('div');
  watermark.innerText = 'by AsIneedit.com';
  watermark.style.position = 'absolute';
  watermark.style.bottom = '10px';
  watermark.style.right = '10px';
  watermark.style.color = 'rgba(0, 0, 0, 0.5)';
  watermark.style.fontSize = '12px';
  watermark.style.pointerEvents = 'none';
  watermark.id = 'watermark';
  container.appendChild(watermark);
  return watermark;
}

function MainApp() {
  const { layers, scale, gridUnit, measurement, zoomIn, zoomOut } = useDesign();
  const [showLayers, setShowLayers] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Toolbar */}
      <div className={cn(
        "flex flex-col border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300",
        showToolbar ? "w-16" : "w-0 overflow-hidden"
      )}>
        <DrawingToolbar />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">As I Need It Draw</h1>
            <Badge variant="secondary" className="text-xs">
              {layers.length} {layers.length === 1 ? 'Layer' : 'Layers'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
              
              <span className="text-sm font-mono px-2 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Export Menu - Lazy Loaded */}
            <Suspense fallback={<ExportMenuLoader />}>
              <ExportMenu />
            </Suspense>

            <Separator orientation="vertical" className="h-6" />

            {/* Toggle Buttons */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setShowToolbar(!showToolbar)}
                >
                  <PenTool className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Toolbar</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setShowLayers(!showLayers)}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Layers</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <GarmentCanvas />
        </div>

        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between p-2 border-t border-border bg-card/50 backdrop-blur-sm text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Grid: {gridUnit}</span>
            {measurement && (
              <span>
                Length: {measurement.length.toFixed(2)} {gridUnit} | 
                Angle: {measurement.angle.toFixed(1)}°
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>Ready</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Layers */}
      <div className={cn(
        "flex flex-col border-l border-border bg-card/50 backdrop-blur-sm transition-all duration-300",
        showLayers ? "w-80" : "w-0 overflow-hidden"
      )}>
        <LayersPanel />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <TooltipProvider>
      <DesignProvider>
        <MobileOptimizer>
          <MainApp />
        </MobileOptimizer>
      </DesignProvider>
    </TooltipProvider>
  );
}

    