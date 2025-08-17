
"use client";

import { DesignProvider } from '@/context/design-context';
import { GarmentCanvas } from '@/components/garment-canvas';
import { CollapsibleMenu } from '@/components/collapsible-menu';
import { MeasurementDisplay } from '@/components/measurement-display';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { 
  clearAllModalsAndOverlays, 
  setupGlobalEscapeHandler, 
  setupGlobalClickOutsideHandler,
  debugClearModals 
} from '@/lib/modal-cleanup';
import { FlowerOfLifeLogo } from '@/components/flower-of-life-logo';

function ArtApp() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Global modal cleanup on app initialization
  useEffect(() => {
    console.log('🚀 App initialized - setting up global modal cleanup');
    
    // Clear any existing modals on app load
    clearAllModalsAndOverlays();
    
    // Setup global handlers
    const cleanupEscape = setupGlobalEscapeHandler();
    const cleanupClick = setupGlobalClickOutsideHandler();
    
    // Cleanup on unmount
    return () => {
      cleanupEscape();
      cleanupClick();
    };
  }, []);

  const toggleMenu = () => {
    // Clear any existing modals before opening menu
    clearAllModalsAndOverlays();
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      {/* Flower of Life Logo Menu Button */}
      <div className="fixed top-4 left-4 z-[9999]">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "h-16 w-16 bg-background/90 backdrop-blur-sm border border-border shadow-lg",
                "hover:bg-background/95 transition-all duration-300",
                "rounded-full flex items-center justify-center",
                "hover:shadow-xl hover:shadow-gold/20"
              )}
              style={{ pointerEvents: 'auto' }}
            >
              <FlowerOfLifeLogo
                onClick={toggleMenu}
                size={48}
                animated={true}
                className="flower-logo-button"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMenuVisible ? 'Hide Drawing Tools' : 'Show Drawing Tools'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Debug Button - Temporary for testing */}
      <div className="fixed top-4 right-4 z-[9999]">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={debugClearModals}
              className={cn(
                "h-12 w-12 bg-red-500/90 backdrop-blur-sm border border-red-600 shadow-lg",
                "hover:bg-red-600/95 transition-all duration-200",
                "rounded-full"
              )}
              style={{ pointerEvents: 'auto' }}
            >
              <Bug className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear Stuck Modals (Debug)</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Measurement Display */}
      <MeasurementDisplay />

      {/* Collapsible Menu */}
      <CollapsibleMenu 
        isVisible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)} 
      />

      {/* Full-Screen Canvas */}
      <div className="h-full w-full">
        <GarmentCanvas />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <TooltipProvider>
      <DesignProvider>
        <ArtApp />
      </DesignProvider>
    </TooltipProvider>
  );
}

    