"use client";

import { useState } from 'react';
import { DesignProvider } from '@/context/design-context';
import { GarmentCanvas } from '@/components/garment-canvas';
import { CollapsibleMenu } from '@/components/collapsible-menu';
import { MeasurementDisplay } from '@/components/measurement-display';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pen, X, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function ArtApp() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      {/* Home Button */}
      <div className="fixed top-4 right-4 z-[9999]">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 bg-background/90 backdrop-blur-sm border border-border shadow-lg",
                  "hover:bg-background/95 transition-all duration-200",
                  "rounded-full"
                )}
                style={{ pointerEvents: 'auto' }}
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Back to Home</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Pen Icon Toggle Button */}
      <div className="fixed top-4 left-4 z-[9999]">
        <Tooltip>
          <TooltipTrigger asChild>
                          <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className={cn(
                  "h-12 w-12 bg-background/90 backdrop-blur-sm border border-border shadow-lg",
                  "hover:bg-background/95 transition-all duration-200",
                  "rounded-full"
                )}
                style={{ pointerEvents: 'auto' }}
              >
              {isMenuVisible ? (
                <X className="h-5 w-5" />
              ) : (
                <Pen className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMenuVisible ? 'Hide Tools' : 'Show Tools'}</p>
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
      <div className={cn(
        "h-full w-full transition-all duration-300 ease-in-out",
        isMenuVisible ? "pl-80" : "pl-0"
      )}>
        <GarmentCanvas />
      </div>
    </div>
  );
}

export default function ArtPage() {
  return (
    <TooltipProvider>
      <DesignProvider>
        <ArtApp />
      </DesignProvider>
    </TooltipProvider>
  );
}