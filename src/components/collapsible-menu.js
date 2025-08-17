"use client";

import React from 'react';
import { useDesign } from '@/context/design-context';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Trash2, Undo2, Palette, Settings, Zap, Eye, Move, PenTool, Download, X, Pen } from 'lucide-react';
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
import { useState, useEffect } from 'react';
import { ExportMenu } from './export-menu';
import { ModernColorPicker } from './modern-color-picker';
import { clearAllModalsAndOverlays } from '@/lib/modal-cleanup';

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

export function CollapsibleMenu({ isVisible, onClose }) {
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
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  // Close color picker when menu closes to prevent backdrop issues
  useEffect(() => {
    if (!isVisible) {
      setIsColorPickerOpen(false);
      // Clear any stuck modals when menu closes
      clearAllModalsAndOverlays();
    }
  }, [isVisible]);

  const handleStrokeWidthChange = (value) => {
    if (activeLayer) {
      updateActiveLayer({ strokeWidth: value[0] });
    }
  };

  const handlePointRadiusChange = (value) => {
    if (activeLayer) {
      updateActiveLayer({ pointRadius: value[0] });
    }
  };

  const handleColorChange = (color) => {
    if (activeLayer) {
      updateActiveLayer({ color });
      setCustomColor(color);
    }
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    handleColorChange(color);
  };

  const toggleMenu = () => {
    try {
      onClose();
    } catch (error) {
      console.error('Error toggling menu:', error);
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-full z-[9998] transition-transform duration-300 ease-in-out",
        isVisible ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Backdrop */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9997]"
          onClick={onClose}
          style={{ pointerEvents: 'auto' }}
        />
      )}
      
      {/* Menu Panel */}
      <div className="relative h-full w-80 bg-background/95 backdrop-blur-md border-r border-border shadow-2xl" style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Drawing Tools</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Layer Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Active Layer</Label>
                <Badge variant="secondary">{activeLayer?.name || 'Layer 1'}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {activeLayer?.points?.length || 0} points
              </div>
            </CardContent>
          </Card>

          {/* Color Picker */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Color</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsColorPickerOpen(true)}
                  className="h-8 w-8"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Color Swatches */}
              <div className="grid grid-cols-6 gap-2 mb-3">
                {PROFESSIONAL_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={cn(
                      "w-8 h-8 rounded border-2 transition-all",
                      activeLayer?.color === color.value
                        ? "border-white shadow-lg scale-110"
                        : "border-border hover:scale-105"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color.value)}
                    title={color.name}
                  />
                ))}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stroke Width */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Stroke Width</Label>
                <span className="text-xs text-muted-foreground">
                  {activeLayer?.strokeWidth || 1}px
                </span>
              </div>
              <Slider
                value={[activeLayer?.strokeWidth || 1]}
                onValueChange={handleStrokeWidthChange}
                max={10}
                min={0.5}
                step={0.5}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Point Radius */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Point Radius</Label>
                <span className="text-xs text-muted-foreground">
                  {activeLayer?.pointRadius || 3}px
                </span>
              </div>
              <Slider
                value={[activeLayer?.pointRadius || 3]}
                onValueChange={handlePointRadiusChange}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Grid Unit */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-3 block">Grid Unit</Label>
              <RadioGroup
                value={gridUnit}
                onValueChange={setGridUnit}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cm" id="cm" />
                  <Label htmlFor="cm" className="text-sm">Centimeters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inch" id="inch" />
                  <Label htmlFor="inch" className="text-sm">Inches</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Symmetry Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Symmetry</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable mirror drawing
                  </p>
                </div>
                <Switch
                  checked={isSymmetryEnabled}
                  onCheckedChange={toggleSymmetry}
                />
              </div>
            </CardContent>
          </Card>

          {/* Canvas Mode */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-3 block">Canvas Mode</Label>
              <RadioGroup
                value={canvasMode}
                onValueChange={setCanvasMode}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draw" id="draw" />
                  <Label htmlFor="draw" className="text-sm">Draw</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pan" id="pan" />
                  <Label htmlFor="pan" className="text-sm">Pan</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearPoints}
                  disabled={isLocked}
                  className="w-full justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Points
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeLastPoint}
                  disabled={isLocked}
                  className="w-full justify-start"
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  Undo Last Point
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export */}
          <ExportMenu />
        </div>
      </div>

      {/* Modern Color Picker Modal - Rendered outside menu structure */}
      {isColorPickerOpen && (
        <ModernColorPicker
          color={activeLayer?.color || '#FFFFFF'}
          onColorChange={handleColorPickerChange}
          onClose={() => setIsColorPickerOpen(false)}
          isOpen={isColorPickerOpen}
        />
      )}
    </div>
  );
}