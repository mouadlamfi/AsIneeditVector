"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearAllModalsAndOverlays } from '@/lib/modal-cleanup';

interface ModernColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function ModernColorPicker({ color, onColorChange, onClose, isOpen }: ModernColorPickerProps) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(100);
  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(255);
  const [blue, setBlue] = useState(255);
  const [hexValue, setHexValue] = useState('#FFFFFF');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brightnessRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const isDraggingBrightness = useRef(false);

  // Convert hex to HSL
  const hexToHSL = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 1/3) {
      r = x; g = c; b = 0;
    } else if (1/3 <= h && h < 1/2) {
      r = 0; g = c; b = x;
    } else if (1/2 <= h && h < 2/3) {
      r = 0; g = x; b = c;
    } else if (2/3 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h <= 1) {
      r = c; g = 0; b = x;
    }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  // Initialize color picker
  useEffect(() => {
    if (color) {
      const hsl = hexToHSL(color);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      setHexValue(color);
      
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      setRed(r);
      setGreen(g);
      setBlue(b);
    }
  }, [color]);

  // Draw hue-saturation canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw hue-saturation gradient
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const h = (x / width) * 360;
        const s = 100 - (y / height) * 100;
        const l = lightness;
        
        const hex = hslToHex(h, s, l);
        ctx.fillStyle = hex;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [lightness]);

  // Draw brightness slider
  useEffect(() => {
    const canvas = brightnessRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw brightness gradient
    for (let y = 0; y < height; y++) {
      const l = 100 - (y / height) * 100;
      const hex = hslToHex(hue, saturation, l);
      ctx.fillStyle = hex;
      ctx.fillRect(0, y, width, 1);
    }
  }, [hue, saturation]);

  // Handle hue-saturation canvas interaction
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    handleCanvasMouseMove(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const newHue = x * 360;
    const newSaturation = 100 - y * 100;

    setHue(newHue);
    setSaturation(newSaturation);
    updateColor(newHue, newSaturation, lightness);
  };

  const handleCanvasMouseUp = () => {
    isDragging.current = false;
  };

  // Touch support for hue-saturation canvas
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDragging.current = true;
    handleCanvasTouchMove(e);
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));

    const newHue = x * 360;
    const newSaturation = 100 - y * 100;

    setHue(newHue);
    setSaturation(newSaturation);
    updateColor(newHue, newSaturation, lightness);
  };

  const handleCanvasTouchEnd = () => {
    isDragging.current = false;
  };

  // Handle brightness slider interaction
  const handleBrightnessMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingBrightness.current = true;
    handleBrightnessMouseMove(e);
  };

  const handleBrightnessMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingBrightness.current) return;

    const canvas = brightnessRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const newLightness = 100 - y * 100;
    setLightness(newLightness);
    updateColor(hue, saturation, newLightness);
  };

  const handleBrightnessMouseUp = () => {
    isDraggingBrightness.current = false;
  };

  // Touch support for brightness slider
  const handleBrightnessTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDraggingBrightness.current = true;
    handleBrightnessTouchMove(e);
  };

  const handleBrightnessTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingBrightness.current) return;

    const canvas = brightnessRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));

    const newLightness = 100 - y * 100;
    setLightness(newLightness);
    updateColor(hue, saturation, newLightness);
  };

  const handleBrightnessTouchEnd = () => {
    isDraggingBrightness.current = false;
  };

  // Update color and notify parent
  const updateColor = (h: number, s: number, l: number) => {
    const hex = hslToHex(h, s, l);
    setHexValue(hex);
    
    const r = Math.round((h / 360) * 255);
    const g = Math.round((s / 100) * 255);
    const b = Math.round((l / 100) * 255);
    setRed(r);
    setGreen(g);
    setBlue(b);
    
    onColorChange(hex);
  };

  // Handle input changes
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexValue(value);
    
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      const hsl = hexToHSL(value);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      onColorChange(value);
    }
  };

  const handleRGBChange = (type: 'r' | 'g' | 'b', value: number) => {
    const newRed = type === 'r' ? value : red;
    const newGreen = type === 'g' ? value : green;
    const newBlue = type === 'b' ? value : blue;
    
    const hex = `#${newRed.toString(16).padStart(2, '0')}${newGreen.toString(16).padStart(2, '0')}${newBlue.toString(16).padStart(2, '0')}`;
    setHexValue(hex);
    
    const hsl = hexToHSL(hex);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    
    onColorChange(hex);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" 
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          clearAllModalsAndOverlays();
        }
      }}
    >
      <Card 
        className="w-96 bg-background/95 backdrop-blur-md border border-border shadow-2xl" 
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Color Picker</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onClose();
                clearAllModalsAndOverlays();
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Hue-Saturation Canvas */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hue & Saturation</Label>
            <div className="relative">
                             <canvas
                 ref={canvasRef}
                 width={200}
                 height={200}
                 className="w-full h-48 rounded border border-border cursor-crosshair"
                 style={{ pointerEvents: 'auto' }}
                 onMouseDown={handleCanvasMouseDown}
                 onMouseMove={handleCanvasMouseMove}
                 onMouseUp={handleCanvasMouseUp}
                 onMouseLeave={handleCanvasMouseUp}
                 onTouchStart={handleCanvasTouchStart}
                 onTouchMove={handleCanvasTouchMove}
                 onTouchEnd={handleCanvasTouchEnd}
               />
              {/* Cursor indicator */}
              <div
                className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none shadow-lg"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  top: `${(100 - saturation) / 100 * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
          </div>

          {/* Brightness Slider */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Brightness</Label>
            <div className="relative">
                             <canvas
                 ref={brightnessRef}
                 width={30}
                 height={200}
                 className="w-8 h-48 rounded border border-border cursor-crosshair"
                 style={{ pointerEvents: 'auto' }}
                 onMouseDown={handleBrightnessMouseDown}
                 onMouseMove={handleBrightnessMouseMove}
                 onMouseUp={handleBrightnessMouseUp}
                 onMouseLeave={handleBrightnessMouseUp}
                 onTouchStart={handleBrightnessTouchStart}
                 onTouchMove={handleBrightnessTouchMove}
                 onTouchEnd={handleBrightnessTouchEnd}
               />
              {/* Brightness indicator */}
              <div
                className="absolute w-6 h-2 bg-white rounded border border-gray-400 pointer-events-none shadow-lg"
                style={{
                  left: '50%',
                  top: `${(100 - lightness) / 100 * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
          </div>

          {/* Color Preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded border border-border"
              style={{ backgroundColor: hexValue }}
            />
            <div className="flex-1">
              <Label className="text-xs font-medium">Hex</Label>
              <Input
                value={hexValue}
                onChange={handleHexChange}
                className="text-xs font-mono"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          {/* RGB Inputs */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs font-medium">R</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={red}
                onChange={(e) => handleRGBChange('r', parseInt(e.target.value) || 0)}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">G</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={green}
                onChange={(e) => handleRGBChange('g', parseInt(e.target.value) || 0)}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">B</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={blue}
                onChange={(e) => handleRGBChange('b', parseInt(e.target.value) || 0)}
                className="text-xs"
              />
            </div>
          </div>

          {/* HSL Values */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs font-medium">H</Label>
              <Input
                type="number"
                min="0"
                max="360"
                value={Math.round(hue)}
                onChange={(e) => {
                  const newHue = parseInt(e.target.value) || 0;
                  setHue(newHue);
                  updateColor(newHue, saturation, lightness);
                }}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">S</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={Math.round(saturation)}
                onChange={(e) => {
                  const newSaturation = parseInt(e.target.value) || 0;
                  setSaturation(newSaturation);
                  updateColor(hue, newSaturation, lightness);
                }}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">L</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={Math.round(lightness)}
                onChange={(e) => {
                  const newLightness = parseInt(e.target.value) || 0;
                  setLightness(newLightness);
                  updateColor(hue, saturation, newLightness);
                }}
                className="text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Select Color
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}