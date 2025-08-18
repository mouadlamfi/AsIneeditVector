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

// Mobile-first performance constants
const MOBILE_PERFORMANCE = {
  MAX_PARTICLES: 50, // Reduced from desktop
  MAX_GRID_LINES: 20, // Reduced grid density
  MAX_FLOWER_MOTIFS: 25, // Reduced Flower of Life complexity
  FRAME_RATE_CAP: 30, // Cap FPS on mobile
  RENDER_DISTANCE: 300, // Smaller render area
  THROTTLE_DELAY: 16, // ~60fps throttling
};

// Optimized grid rendering with mobile-first viewport culling
const GridLines = ({ width, height, scale, unit, offsetX, offsetY, viewportBounds, isMobile }) => {
    const majorGridSize = GRID_UNITS_IN_PIXELS[unit];
    const subGridSize = majorGridSize / 3;
    const strokeColor = "hsla(0, 0%, 100%, 0.2)"; // Reduced opacity for performance
    
    // Mobile: Use larger grid spacing
    const gridSpacing = isMobile ? subGridSize * 2 : subGridSize;
    
    // Calculate grid offset
    const gridOffsetX = offsetX % gridSpacing;
    const gridOffsetY = offsetY % gridSpacing;
    
    // Calculate visible grid range with mobile limits
    const startX = Math.floor((viewportBounds.minX + gridOffsetX) / gridSpacing);
    const endX = Math.ceil((viewportBounds.maxX + gridOffsetX) / gridSpacing);
    const startY = Math.floor((viewportBounds.minY + gridOffsetY) / gridSpacing);
    const endY = Math.ceil((viewportBounds.maxY + gridOffsetY) / gridSpacing);
    
    // Limit grid lines for mobile performance
    const maxLines = isMobile ? MOBILE_PERFORMANCE.MAX_GRID_LINES : 100;
    const lines = [];
    let lineCount = 0;
  
    // Vertical lines (only render visible ones with mobile limits)
    for (let i = startX; i <= endX && lineCount < maxLines; i++) {
      const isMajorGridLine = i % 3 === 0;
      const x = i * gridSpacing - gridOffsetX;
      lines.push(
        <line 
          key={`v-${i}`} 
          x1={x} 
          y1={viewportBounds.minY} 
          x2={x} 
          y2={viewportBounds.maxY} 
          stroke={strokeColor} 
          strokeWidth={(isMajorGridLine ? 0.3 : 0.15) / scale}
          className="grid-enhanced"
        />
      );
      lineCount++;
    }
    
    // Horizontal lines (only render visible ones with mobile limits)
    for (let i = startY; i <= endY && lineCount < maxLines; i++) {
      const isMajorGridLine = i % 3 === 0;
      const y = i * gridSpacing - gridOffsetY;
      lines.push(
        <line 
          key={`h-${i}`} 
          x1={viewportBounds.minX} 
          y1={y} 
          x2={viewportBounds.maxX} 
          y2={y} 
          stroke={strokeColor} 
          strokeWidth={(isMajorGridLine ? 0.3 : 0.15) / scale}
          className="grid-enhanced"
        />
      );
      lineCount++;
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
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastRenderTime, setLastRenderTime] = useState(0);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Visibility detection for performance optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Throttled render function for mobile performance
  const throttledRender = useCallback((callback) => {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime;
    const minInterval = isMobile ? MOBILE_PERFORMANCE.THROTTLE_DELAY : 8; // 30fps on mobile, 60fps on desktop
    
    if (timeSinceLastRender >= minInterval) {
      callback();
      setLastRenderTime(now);
    }
  }, [isMobile, lastRenderTime]);

  // Responsive canvas size management
  const resizeCanvas = useCallback(() => {
    try {
      if (!canvasRef.current) return;
      const container = canvasRef.current.parentElement;
      if (!container) return;
      
      // Mobile-first sizing
      const newWidth = Math.min(container.offsetWidth, isMobile ? 400 : 1200);
      const newHeight = Math.min(container.offsetHeight, isMobile ? 600 : 800);
      
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
  }, [canvasSize, isMobile]);

  // Calculate current viewport bounds for efficient rendering
  const getViewportBounds = useCallback(() => {
    try {
      if (!canvasRef.current) {
        const fallbackWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 400) : 400;
        const fallbackHeight = typeof window !== 'undefined' ? Math.min(window.innerHeight, 600) : 600;
        return { minX: 0, minY: 0, maxX: fallbackWidth, maxY: fallbackHeight };
      }
      
      const rect = canvasRef.current.getBoundingClientRect();
      const viewportWidth = rect.width / scale;
      const viewportHeight = rect.height / scale;
      
      // Mobile: Smaller padding for performance
      const padding = isMobile ? 
        Math.min(viewportWidth, viewportHeight) * 0.2 : 
        Math.max(viewportWidth, viewportHeight) * 0.5;
        
      return {
        minX: (-canvasOffset.x / scale) - padding,
        minY: (-canvasOffset.y / scale) - padding,
        maxX: ((-canvasOffset.x + rect.width) / scale) + padding,
        maxY: ((-canvasOffset.y + rect.height) / scale) + padding
      };
    } catch (error) {
      console.error('Error calculating viewport bounds:', error);
      return { minX: 0, minY: 0, maxX: 400, maxY: 600 };
    }
  }, [canvasOffset, scale, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      throttledRender(() => {
        resizeCanvas();
        getViewportBounds();
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [getViewportBounds, resizeCanvas, throttledRender]);

  const handleMouseDown = useCallback((e) => {
    if (!isVisible) return; // Don't process if tab is hidden
    
    if (canvasMode === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (canvasMode === 'draw') {
      setIsDrawing(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - canvasOffset.x) / scale;
      const y = (e.clientY - rect.top - canvasOffset.y) / scale;
      
      let point = { x, y };
      
      // Snap to Flower of Life if enabled (mobile: reduced precision)
      if (isSymmetryEnabled) {
        const snappedPoint = snapToFlowerOfLife(point, gridUnit, scale);
        point = snappedPoint;
      }
      
      addPoint(point);
      setPreviewPoint(point);
    }
  }, [canvasMode, canvasOffset, scale, isSymmetryEnabled, gridUnit, addPoint, isVisible]);

  const handleMouseMove = useCallback((e) => {
    if (!isVisible) return; // Don't process if tab is hidden
    
    throttledRender(() => {
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
        
        // Snap to Flower of Life if enabled (mobile: reduced precision)
        if (isSymmetryEnabled) {
          const snappedPoint = snapToFlowerOfLife(point, gridUnit, scale);
          point = snappedPoint;
        }
        
        setPreviewPoint(point);
      }
    });
  }, [isDragging, isDrawing, canvasMode, dragStart, canvasOffset, scale, isSymmetryEnabled, gridUnit, isVisible, throttledRender]);

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
          cursor: canvasMode === 'pan' ? 'grab' : 'crosshair',
          // Mobile: Reduce transform complexity
          willChange: isMobile ? 'auto' : 'transform'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        // Touch events for mobile
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleMouseUp();
        }}
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
            minWidth: isMobile ? '400px' : '1200px',
            minHeight: isMobile ? '600px' : '800px',
            pointerEvents: 'none'
          }}
        >
          {/* Flower of Life Grid - Mobile optimized */}
          {isVisible && (
            <FlowerOfLifeGrid
              scale={scale}
              unit={gridUnit}
              offsetX={canvasOffset.x}
              offsetY={canvasOffset.y}
              viewportBounds={viewportBounds}
              isMobile={isMobile}
            />
          )}

          {/* Grid Lines - Mobile optimized */}
          {isVisible && (
            <GridLines
              width={canvasSize.width}
              height={canvasSize.height}
              scale={scale}
              unit={gridUnit}
              offsetX={canvasOffset.x}
              offsetY={canvasOffset.y}
              viewportBounds={viewportBounds}
              isMobile={isMobile}
            />
          )}

          {/* Render Layers - Mobile optimized */}
          {layers.map(layer => (
            <g key={layer.id} data-layer-id={layer.id}>
              {/* Render points and lines for this layer */}
              {layer.points.slice(0, isMobile ? 50 : 200).map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={layer.pointRadius}
                  fill={layer.color}
                  className="point"
                />
              ))}
              
              {/* Render lines between points - Mobile: simplified */}
              {layer.points.length > 1 && (
                <polyline
                  points={layer.points.slice(0, isMobile ? 50 : 200).map(p => `${p.x},${p.y}`).join(' ')}
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
                fontSize={isMobile ? 10 : 12}
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