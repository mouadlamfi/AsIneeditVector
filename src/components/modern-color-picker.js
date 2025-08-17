"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearAllModalsAndOverlays } from '@/lib/modal-cleanup';

export function ModernColorPicker({ color, onColorChange, onClose, isOpen }) {
  const [hexValue, setHexValue] = useState('#FFFFFF');
  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(255);
  const [blue, setBlue] = useState(255);

  // Initialize color picker
  useEffect(() => {
    if (color) {
      setHexValue(color);
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      setRed(r);
      setGreen(g);
      setBlue(b);
    }
  }, [color]);

  // Handle hex input change
  const handleHexChange = (e) => {
    const value = e.target.value;
    setHexValue(value);
    
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onColorChange(value);
    }
  };

  // Handle RGB input changes
  const handleRGBChange = (type, value) => {
    const newRed = type === 'r' ? value : red;
    const newGreen = type === 'g' ? value : green;
    const newBlue = type === 'b' ? value : blue;
    
    const hex = `#${newRed.toString(16).padStart(2, '0')}${newGreen.toString(16).padStart(2, '0')}${newBlue.toString(16).padStart(2, '0')}`;
    setHexValue(hex);
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