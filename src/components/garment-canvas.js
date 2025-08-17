"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDesign } from '@/context/design-context';
import { Button } from './ui/button';
import { Plus, Minus, Maximize2, RotateCcw, Grid3X3, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { FlowerOfLifeGrid, snapToFlowerOfLife, getFlowerOfLifeGuides } from './flower-of-life-grid';

const GRID_UNITS_IN_PIXELS = {
  inch: 96,
  cm: 37.795,
};

// Optimized grid rendering with viewport culling
const GridLines = ({ width, height, scale, unit, offsetX, offsetY, viewportBounds }) => {
    const majorGridSize = GRID_UNITS_IN_PIXELS[unit];
    const subGridSize = majorGridSize / 3;
    const strokeColor = "hsla(0, 0%, 100%, 0.3)";
  
    // Calculate grid offset
    const gridOffsetX = offsetX % subGridSize;
    const gridOffsetY = offsetY % subGridSize;
    
    // Calculate visible grid range
    const startX = Math.floor((viewportBounds.minX + gridOffsetX) / subGridSize);
    const endX = Math.ceil((viewportBounds.maxX + gridOffsetX) / subGridSize);
    const startY = Math.floor((viewportBounds.minY + gridOffsetY) / subGridSize);
    const endY = Math.ceil((viewportBounds.maxY + gridOffsetY) / subGridSize);
  
    const lines = [];
  
    // Vertical lines (only render visible ones)
    for (let i = startX; i <= endX; i++) {
      const isMajorGridLine = i % 3 === 0;
      const x = i * subGridSize - gridOffsetX;
      lines.push(
        <line 
          key={`v-${i}`} 
          x1={x} 
          y1={viewportBounds.minY} 
          x2={x} 
          y2={viewportBounds.maxY} 
          stroke={strokeColor} 
          strokeWidth={(isMajorGridLine ? 0.5 : 0.25) / scale}
          className="grid-enhanced"
        />
      );
    }
    
    // Horizontal lines (only render visible ones)
    for (let i = startY; i <= endY; i++) {
      const isMajorGridLine = i % 3 === 0;
      const y = i * subGridSize - gridOffsetY;
      lines.push(
        <line 
          key={`h-${i}`} 
          x1={viewportBounds.minX} 
          y1={y} 
          x2={viewportBounds.maxX} 
          y2={y} 
          stroke={strokeColor} 
          strokeWidth={(isMajorGridLine ? 0.5 : 0.25) / scale}
          className="grid-enhanced"
        />
      );
    }

    return <g className="guide-lines">{lines}</g>;
};

export function GarmentCanvas() {
  const {
    layers,
    activeLayerId,
    scale,
    isSymmetryEnabled,
    measurement,
    gridUnit,
    canvasMode,
    addPoint,
    updatePoint,
    setMeasurement,
    zoomIn,
    zoomOut,
    setScale,
    detachLine
  } = useDesign();

  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [previewPoint, setPreviewPoint] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Responsive canvas size management
  const resizeCanvas = useCallback(() => {
    try {
      if (!canvasRef.current) return;
      const container = canvasRef.current.parentElement;
      if (!container) return;
      const newWidth = container.offsetWidth;
      const newHeight = container.offsetHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      if (canvasRef.current) {
        canvasRef.current.style.width = `${newWidth}px`;
        canvasRef.current.style.height = `${newHeight}px`;
        canvasRef.current.style.minWidth = `${newWidth}px`;
        canvasRef.current.style.minHeight = `${newHeight}px`;
      }
    } catch (error) {
      console.error('Error resizing canvas:', error);
    }
  }, [canvasSize]);

  // Calculate current viewport bounds for efficient rendering
  const getViewportBounds = useCallback(() => {
    try {
      if (!canvasRef.current) {
        const fallbackWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const fallbackHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        return { minX: 0, minY: 0, maxX: fallbackWidth, maxY: fallbackHeight };
      }
      const rect = canvasRef.current.getBoundingClientRect();
      const viewportWidth = rect.width / scale;
      const viewportHeight = rect.height / scale;
      const padding = Math.max(viewportWidth, viewportHeight) * 0.5;
      return {
        minX: (-canvasOffset.x / scale) - padding,
        minY: (-canvasOffset.y / scale) - padding,
        maxX: ((-canvasOffset.x + rect.width) / scale) + padding,
        maxY: ((-canvasOffset.y + rect.height) / scale) + padding
      };
    } catch (error) {
      console.error('Error calculating viewport bounds:', error);
      return { minX: 0, minY: 0, maxX: 1200, maxY: 800 };
    }
  }, [canvasOffset, scale]);

  useEffect(() => {
    const handleResize = () => {
      try {
        resizeCanvas();
        getViewportBounds();
      } catch (error) {
        console.error('Error handling resize:', error);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleResize();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getViewportBounds, resizeCanvas]);

  const handleMouseDown = useCallback((e) => {
    if (canvasMode === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (canvasMode === 'draw') {
      setIsDrawing(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - canvasOffset.x) / scale;
      const y = (e.clientY - rect.top - canvasOffset.y) / scale;
      
      let point = { x, y };
      
      // Snap to Flower of Life if enabled
      if (isSymmetryEnabled) {
        const snappedPoint = snapToFlowerOfLife(point, gridUnit, scale);
        point = snappedPoint;
      }
      
      addPoint(point);
      setPreviewPoint(point);
    }
  }, [canvasMode, canvasOffset, scale, isSymmetryEnabled, gridUnit, addPoint]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && canvasMode === 'pan') {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDrawing && canvasMode === 'draw') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - canvasOffset.x) / scale;
      const y = (e.clientY - rect.top - canvasOffset.y) / scale;
      
      let point = { x, y };
      
      // Snap to Flower of Life if enabled
      if (isSymmetryEnabled) {
        const snappedPoint = snapToFlowerOfLife(point, gridUnit, scale);
        point = snappedPoint;
      }
      
      setPreviewPoint(point);
    }
  }, [isDragging, isDrawing, canvasMode, dragStart, canvasOffset, scale, isSymmetryEnabled, gridUnit]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDrawing(false);
    setPreviewPoint(null);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (canvasMode === 'draw') {
      detachLine();
    }
  }, [canvasMode, detachLine]);

  const activeLayer = layers.find(l => l.id === activeLayerId);
  const viewportBounds = getViewportBounds();

  return (
    <div className="h-full w-full">
      {/* Optimized Canvas Container */}
      <div 
        ref={canvasRef}
        className="relative w-full h-full overflow-hidden bg-black"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          cursor: canvasMode === 'pan' ? 'grab' : 'crosshair'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Background Images */}
        <div id="canvas-container" className="absolute top-0 left-0 w-full h-full">
          {/* Background images would go here */}
        </div>

        {/* SVG Canvas */}
        <svg 
          id="design-canvas-svg" 
          ref={svgRef} 
          className="w-full h-full absolute top-0 left-0" 
          style={{ 
            minWidth: typeof window !== 'undefined' ? `${Math.max(2000, window.innerWidth)}px` : '2000px',
            minHeight: typeof window !== 'undefined' ? `${Math.max(2000, window.innerHeight)}px` : '2000px',
            pointerEvents: 'none'
          }}
        >
          {/* Flower of Life Grid */}
          <FlowerOfLifeGrid
            scale={scale}
            unit={gridUnit}
            offsetX={canvasOffset.x}
            offsetY={canvasOffset.y}
            viewportBounds={viewportBounds}
          />

          {/* Grid Lines */}
          <GridLines
            width={canvasSize.width}
            height={canvasSize.height}
            scale={scale}
            unit={gridUnit}
            offsetX={canvasOffset.x}
            offsetY={canvasOffset.y}
            viewportBounds={viewportBounds}
          />

          {/* Render Layers */}
          {layers.map(layer => (
            <g key={layer.id} data-layer-id={layer.id}>
              {/* Render points and lines for this layer */}
              {layer.points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={layer.pointRadius}
                  fill={layer.color}
                  className="point"
                />
              ))}
              
              {/* Render lines between points */}
              {layer.points.length > 1 && (
                <polyline
                  points={layer.points.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={layer.color}
                  strokeWidth={layer.strokeWidth}
                  className="line"
                />
              )}
            </g>
          ))}

          {/* Preview Point */}
          {previewPoint && (
            <circle
              cx={previewPoint.x}
              cy={previewPoint.y}
              r={activeLayer?.pointRadius || 3}
              fill={activeLayer?.color || '#FFFFFF'}
              opacity={0.5}
              className="preview-point"
            />
          )}

          {/* Measurement Display */}
          {measurement && (
            <g data-measurement-group>
              <line
                x1={measurement.position.x}
                y1={measurement.position.y}
                x2={measurement.position.x + 50}
                y2={measurement.position.y}
                stroke="#FFFFFF"
                strokeWidth={1}
                opacity={0.6}
              />
              <text
                x={measurement.position.x + 60}
                y={measurement.position.y}
                fill="#FFFFFF"
                fontSize={12}
                opacity={0.8}
              >
                {measurement.length.toFixed(2)} {gridUnit}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}