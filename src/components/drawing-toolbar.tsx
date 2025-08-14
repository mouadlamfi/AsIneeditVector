
"use client";

import { useDesign } from '@/context/design-context';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trash2, Undo2, Spline, Palette, Settings, Zap, Eye, EyeOff } from 'lucide-react';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import type { GridUnit } from '@/lib/types';

const PROFESSIONAL_COLORS = [
  { name: 'Primary', value: '#3B82F6', category: 'blue' },
  { name: 'Success', value: '#10B981', category: 'green' },
  { name: 'Warning', value: '#F59E0B', category: 'yellow' },
  { name: 'Danger', value: '#EF4444', category: 'red' },
  { name: 'Purple', value: '#8B5CF6', category: 'purple' },
  { name: 'Pink', value: '#EC4899', category: 'pink' },
  { name: 'Orange', value: '#F97316', category: 'orange' },
  { name: 'Teal', value: '#14B8A6', category: 'teal' },
  { name: 'Gray', value: '#6B7280', category: 'gray' },
  { name: 'White', value: '#FFFFFF', category: 'white' },
  { name: 'Black', value: '#000000', category: 'black' },
];

const STROKE_PRESETS = [
  { name: 'Full Line', value: 1, icon: '—' },
  { name: 'Interlines 0.5', value: 0.5, icon: '—' },
  { name: 'Interlines 0.3', value: 0.3, icon: '—' },
  { name: 'Interlines 0.1', value: 0.1, icon: '—' },
];

const POINT_PRESETS = [
  { name: 'Small', value: 2, icon: '●' },
  { name: 'Normal', value: 4, icon: '●' },
  { name: 'Medium', value: 6, icon: '●' },
  { name: 'Large', value: 8, icon: '●' },
  { name: 'Extra Large', value: 12, icon: '●' },
];

export function DrawingToolbar() {
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
    detachLine 
  } = useDesign();
  
  const activeLayer = layers.find(l => l.id === activeLayerId);
  const isLocked = activeLayer?.isLocked;

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
    }
  };

  const handleStrokePreset = (value: number) => {
    if (activeLayer) {
      updateActiveLayer({ strokeWidth: value });
    }
  };

  const handlePointPreset = (value: number) => {
    if (activeLayer) {
      updateActiveLayer({ pointRadius: value });
    }
  };

  return (
    <div className="space-y-6">
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
            <Label className="text-sm font-medium">Color Palette</Label>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {PROFESSIONAL_COLORS.map(color => (
              <Tooltip key={color.value}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
            {/* Stroke Width Presets */}
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
            {/* Point Size Presets */}
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="btn-animate"
              onClick={removeLastPoint}
              disabled={isLocked}
            >
              <Undo2 className="mr-2 h-3 w-3" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="btn-animate"
              onClick={detachLine}
              disabled={isLocked}
            >
              <Spline className="mr-2 h-3 w-3" />
              New Line
            </Button>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            className="w-full btn-animate"
            onClick={clearPoints}
            disabled={isLocked}
          >
            <Trash2 className="mr-2 h-3 w-3" />
            Clear Active Layer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
