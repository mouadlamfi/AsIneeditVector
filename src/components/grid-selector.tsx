"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  Grid3X3, 
  Flower, 
  Diamond, 
  Settings,
  Eye,
  EyeOff,
  Magnet
} from 'lucide-react';
import { useDesign } from '@/context/design-context';
import type { GridType } from '@/lib/types';
import { cn } from '@/lib/utils';

const gridOptions = [
  {
    type: 'standard' as GridType,
    name: 'Standard Grid',
    description: 'Traditional square grid with measurements',
    icon: Grid3X3,
    color: 'text-blue-500',
  },
  {
    type: 'flower-of-life' as GridType,
    name: 'Flower of Life',
    description: 'Sacred geometry pattern for organic designs',
    icon: Flower,
    color: 'text-purple-500',
  },
  {
    type: 'diamond-scale' as GridType,
    name: 'Diamond Scale',
    description: 'Geometric diamond pattern for precise alignment',
    icon: Diamond,
    color: 'text-emerald-500',
  },
];

export function GridSelector() {
  const { gridType, gridConfig, setGridType, setGridConfig } = useDesign();

  const currentGrid = gridOptions.find(option => option.type === gridType);
  const CurrentIcon = currentGrid?.icon || Grid3X3;

  const toggleGridVisibility = () => {
    setGridConfig({ showGuides: !gridConfig.showGuides });
  };

  const toggleSnapToGrid = () => {
    setGridConfig({ snapToGrid: !gridConfig.snapToGrid });
  };

  const adjustOpacity = (increment: number) => {
    const newOpacity = Math.max(0.1, Math.min(1, gridConfig.opacity + increment));
    setGridConfig({ opacity: newOpacity });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Grid Type Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <CurrentIcon className={cn("h-4 w-4", currentGrid?.color)} />
            <span className="hidden sm:inline">{currentGrid?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Grid Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {gridOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.type}
                onClick={() => setGridType(option.type)}
                className={cn(
                  "flex items-center gap-3 cursor-pointer",
                  gridType === option.type && "bg-accent"
                )}
              >
                <Icon className={cn("h-4 w-4", option.color)} />
                <div className="flex flex-col">
                  <span className="font-medium">{option.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Grid Controls */}
      <div className="flex items-center gap-1">
        {/* Visibility Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleGridVisibility}
            >
              {gridConfig.showGuides ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{gridConfig.showGuides ? 'Hide' : 'Show'} Grid Guides</p>
          </TooltipContent>
        </Tooltip>

        {/* Snap to Grid Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                gridConfig.snapToGrid && "bg-primary/10 text-primary"
              )}
              onClick={toggleSnapToGrid}
            >
              <Magnet className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{gridConfig.snapToGrid ? 'Disable' : 'Enable'} Grid Snapping</p>
          </TooltipContent>
        </Tooltip>

        {/* Opacity Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => adjustOpacity(-0.1)}
              >
                <span className="text-xs font-bold">-</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Decrease Grid Opacity</p>
            </TooltipContent>
          </Tooltip>

          <Badge variant="outline" className="text-xs min-w-[40px] justify-center">
            {Math.round(gridConfig.opacity * 100)}%
          </Badge>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => adjustOpacity(0.1)}
              >
                <span className="text-xs font-bold">+</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Increase Grid Opacity</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Grid Settings */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Advanced Grid Settings</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// Grid Info Component
export function GridInfo() {
  const { gridType, gridConfig } = useDesign();

  const getGridDescription = () => {
    switch (gridType) {
      case 'flower-of-life':
        return 'Sacred geometry pattern with circular intersections for organic designs';
      case 'diamond-scale':
        return 'Geometric diamond pattern for precise alignment and scaling';
      default:
        return 'Traditional square grid with measurement units';
    }
  };

  const getSnapPoints = () => {
    switch (gridType) {
      case 'flower-of-life':
        return 'Circle centers and intersections';
      case 'diamond-scale':
        return 'Diamond centers and vertices';
      default:
        return 'Grid intersections';
    }
  };

  return (
    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {gridType === 'standard' ? 'Standard' : 'Sacred Geometry'}
        </Badge>
        {gridConfig.snapToGrid && (
          <Badge variant="outline" className="text-xs">
            Snapping Active
          </Badge>
        )}
      </div>
      
      <div className="text-xs space-y-1">
        <p className="text-muted-foreground">{getGridDescription()}</p>
        <p className="text-muted-foreground">
          <strong>Snap Points:</strong> {getSnapPoints()}
        </p>
        <p className="text-muted-foreground">
          <strong>Opacity:</strong> {Math.round(gridConfig.opacity * 100)}%
        </p>
      </div>
    </div>
  );
}