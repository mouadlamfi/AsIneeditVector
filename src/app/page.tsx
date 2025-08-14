
"use client";

import { useState } from 'react';
import { DesignProvider } from '@/context/design-context';
import { GarmentCanvas } from '@/components/garment-canvas';
import { CollapsibleMenu } from '@/components/collapsible-menu';
import { MeasurementDisplay } from '@/components/measurement-display';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function MainApp() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      {/* Logo Toggle Button */}
      <div className="fixed top-4 left-4 z-40">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className={cn(
                "h-10 px-3 bg-background/90 backdrop-blur-sm border border-border shadow-lg",
                "hover:bg-background/95 transition-all duration-200",
                "text-sm font-semibold"
              )}
            >
              {isMenuVisible ? (
                <X className="h-4 w-4 mr-2" />
              ) : (
                <Menu className="h-4 w-4 mr-2" />
              )}
              As I Need It Draw
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMenuVisible ? 'Hide Menu' : 'Show Menu'}</p>
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

export default function HomePage() {
  return (
    <TooltipProvider>
      <DesignProvider>
        <MainApp />
      </DesignProvider>
    </TooltipProvider>
  );
}

    