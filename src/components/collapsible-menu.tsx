"use client";

import React from 'react';
import { useDesign } from '@/context/design-context';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Trash2, Undo2, Palette, Settings, Zap, Eye, Move, PenTool, Download, X } from 'lucide-react';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from './ui/input';
import { useState } from 'react';
import type { GridUnit } from '@/lib/types';
import { ExportMenu } from './export-menu';

const PROFESSIONAL_COLORS = [
  { name: 'White', value: '#FFFFFF', category: 'white' },
  { name: 'Primary', value: '#3B82F6', category: 'blue' },
  { name: 'Success', value: '#10B981', category: 'green' },
  { name: 'Warning', value: '#F59E0B', category: 'yellow' },
  { name: 'Danger', value: '#EF4444', category: 'red' },
  { name: 'Purple', value: '#8B5CF6', category: 'purple' },
  { name: 'Pink', value: '#EC4899', category: 'pink' },
  { name: 'Orange', value: '#F97316', category: 'orange' },
  { name: 'Teal', value: '#14B8A6', category: 'teal' },
  { name: 'Gray', value: '#6B7280', category: 'gray' },
  { name: 'Black', value: '#000000', category: 'black' },
];

interface CollapsibleMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CollapsibleMenu({ isVisible, onClose }: CollapsibleMenuProps) {
  const {
    clearPoints,
    scale,
    layers,
    activeLayerId,
    updateActiveLayer,
    isSymmetryEnabled,
    toggleSymmetry,
    removeLastPoint,
    gridUnit,
    setGridUnit,
    canvasMode,
    setCanvasMode
  } = useDesign();

  const activeLayer = layers.find(l => l.id === activeLayerId);
  const isLocked = activeLayer?.isLocked;
  const [customColor, setCustomColor] = useState(activeLayer?.color || '#FFFFFF');

  const handleStrokeWidthChange = (value: number[]) => {
    if (activeLayer) {
      updateActiveLayer({ strokeWidth: value[0] });
    }
  };

  const handlePointRadiusChange = (value: number[]) => {
    if (activeLayer) {
      updateActiveLayer({ pointRadius: value[0] });
    }
  };

  const handleColorChange = (color: string) => {
    if (activeLayer) {
      updateActiveLayer({ color });
      setCustomColor(color);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (activeLayer && /^#[0-9A-F]{6}$/i.test(color)) {
      updateActiveLayer({ color });
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out",
        isVisible ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Backdrop */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Menu Panel */}
      <div className="relative h-full w-80 bg-background/95 backdrop-blur-md border-r border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Drawing Tools</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Menu Content */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
          {/* Canvas Mode Toggle */}
          <Card className="card-enhanced">
            <CardContent className="p-4 space-y-4">
              <Label className="text-sm font-medium">Canvas Mode</Label>

              <div className="grid grid-cols-2 gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={canvasMode === 'draw' ? 'default' : 'outline'}
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setCanvasMode('draw')}
                    >
                      <PenTool className="h-4 w-4" />
                      <span className="text-xs">Draw</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Drawing Mode - Click to add points</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={canvasMode === 'pan' ? 'default' : 'outline'}
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setCanvasMode('pan')}
                    >
                      <Move className="h-4 w-4" />
                      <span className="text-xs">Pan</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pan Mode - Click to navigate canvas</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* Zoom and View Controls */}
          <Card className="card-enhanced">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Canvas Zoom</Label>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(scale * 100)}%
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <Label htmlFor="symmetry-mode" className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Symmetry Mode
                  </Label>
                  <Switch
                    id="symmetry-mode"
                    checked={isSymmetryEnabled}
                    onCheckedChange={toggleSymmetry}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Grid Unit</Label>
                  <RadioGroup
                    value={gridUnit}
                    onValueChange={(value) => setGridUnit(value as GridUnit)}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inch" id="inch" />
                      <Label htmlFor="inch" className="text-xs font-normal">Inch</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cm" id="cm" />
                      <Label htmlFor="cm" className="text-xs font-normal">Centimeter</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Palette */}
          <Card className="card-enhanced">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Color</Label>
              </div>

              {/* Color Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 flex items-center gap-2"
                    disabled={isLocked}
                  >
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: activeLayer?.color || '#FFFFFF' }}
                    />
                    <span className="text-xs font-mono">
                      {activeLayer?.color || '#FFFFFF'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {/* Custom Color Input */}
                  <div className="p-3 border-b">
                    <Label className="text-xs font-medium mb-2 block">Custom Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        className="w-12 h-8 p-1 border rounded"
                        disabled={isLocked}
                      />
                      <Input
                        type="text"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        placeholder="#FFFFFF"
                        className="flex-1 text-xs font-mono"
                        disabled={isLocked}
                      />
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Color Presets */}
                  <div className="p-3">
                    <Label className="text-xs font-medium mb-2 block">Preset Colors</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {PROFESSIONAL_COLORS.map(color => (
                        <Tooltip key={color.value}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                "h-8 w-8 rounded border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                activeLayer?.color === color.value
                                  ? 'border-primary ring-2 ring-primary/20'
                                  : 'border-border hover:border-primary/50',
                                isLocked && 'cursor-not-allowed opacity-50'
                              )}
                              style={{ backgroundColor: color.value }}
                              onClick={() => handleColorChange(color.value)}
                              disabled={isLocked}
                              aria-label={`Set color to ${color.name}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{color.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          {/* Stroke Settings */}
          <Card className="card-enhanced">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Stroke Settings</Label>
              </div>

              <div className="space-y-4">
                {/* Stroke Width Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <Label htmlFor="stroke-width">Line Thickness</Label>
                    <span className="text-muted-foreground">{activeLayer?.strokeWidth.toFixed(1)}px</span>
                  </div>
                  <Slider
                    id="stroke-width"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={[activeLayer?.strokeWidth ?? 1]}
                    onValueChange={handleStrokeWidthChange}
                    disabled={isLocked}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Point Settings */}
          <Card className="card-enhanced">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Point Settings</Label>
              </div>

              <div className="space-y-4">
                {/* Point Size Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <Label htmlFor="point-radius">Point Size</Label>
                    <span className="text-muted-foreground">{activeLayer?.pointRadius.toFixed(1)}px</span>
                  </div>
                  <Slider
                    id="point-radius"
                    min={1}
                    max={15}
                    step={0.5}
                    value={[activeLayer?.pointRadius ?? 3]}
                    onValueChange={handlePointRadiusChange}
                    disabled={isLocked}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="card-enhanced">
            <CardContent className="p-4 space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full btn-animate"
                onClick={removeLastPoint}
                disabled={isLocked}
              >
                <Undo2 className="mr-2 h-3 w-3" />
                Undo Last Point
              </Button>

              <Button
                variant="destructive"
                size="sm"
                className="w-full btn-animate"
                onClick={clearPoints}
                disabled={isLocked}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Clear Layer
              </Button>
            </CardContent>
          </Card>

          {/* Export Section */}
          <Card className="card-enhanced">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Export</Label>
              </div>
              
              <ExportMenu />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}