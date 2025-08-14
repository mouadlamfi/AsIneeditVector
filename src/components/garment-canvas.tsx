
"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDesign } from '@/context/design-context';
import type { Point, GridUnit, Measurement, Layer } from '@/lib/types';
import { Button } from './ui/button';
import { Plus, Minus, Maximize2, RotateCcw, Grid3X3, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useMobileOptimization } from '@/hooks/use-mobile-optimization';
import { OptimizedSVGRenderer } from './optimized-svg-renderer';
import { FlowerOfLifeGrid, snapToFlowerOfLife, getFlowerOfLifeGuides } from './flower-of-life-grid';

const GRID_UNITS_IN_PIXELS = {
  inch: 96,
  cm: 37.795,
};

// Optimized grid rendering with viewport culling
const GridLines = ({ width, height, scale, unit, offsetX, offsetY, viewportBounds }: { 
  width: number; 
  height: number; 
  scale: number; 
  unit: GridUnit;
  offsetX: number;
  offsetY: number;
  viewportBounds: { minX: number; minY: number; maxX: number; maxY: number };
}) => {
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

    // 45-degree diagonal lines for major grid squares (only visible ones)
    const majorStartX = Math.floor((viewportBounds.minX + (offsetX % majorGridSize)) / majorGridSize);
    const majorEndX = Math.ceil((viewportBounds.maxX + (offsetX % majorGridSize)) / majorGridSize);
    const majorStartY = Math.floor((viewportBounds.minY + (offsetY % majorGridSize)) / majorGridSize);
    const majorEndY = Math.ceil((viewportBounds.maxY + (offsetY % majorGridSize)) / majorGridSize);
    
    for (let i = majorStartX; i <= majorEndX; i++) {
        for (let j = majorStartY; j <= majorEndY; j++) {
            const x = i * majorGridSize - (offsetX % majorGridSize);
            const y = j * majorGridSize - (offsetY % majorGridSize);
            
            lines.push(
              <line 
                key={`d1-${i}-${j}`} 
                x1={x} 
                y1={y} 
                x2={x + majorGridSize} 
                y2={y + majorGridSize} 
                stroke={strokeColor} 
                strokeWidth={0.25 / scale} 
                strokeDasharray={`${2/scale} ${2/scale}`}
                className="grid-enhanced"
              />
            );
            lines.push(
              <line 
                key={`d2-${i}-${j}`} 
                x1={x + majorGridSize} 
                y1={y} 
                x2={x} 
                y2={y + majorGridSize} 
                stroke={strokeColor} 
                strokeWidth={0.25 / scale} 
                strokeDasharray={`${2/scale} ${2/scale}`}
                className="grid-enhanced"
              />
            );
        }
    }
  
    return <g data-export-hide="false" className="grid-enhanced">{lines}</g>;
};



type TransformMode = 'move' | 'rotate' | 'resize' | null;
type CanvasMode = 'draw' | 'pan';

export function GarmentCanvas() {
  const { layers, activeLayerId, addPoint, removeLastPoint, updatePoint, scale, setScale, zoomIn, zoomOut, detachLine, isSymmetryEnabled, measurement, setMeasurement, gridUnit, updateActiveLayer } = useDesign();
  const mobileOpt = useMobileOptimization();
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);
  const [currentMousePosition, setCurrentMousePosition] = useState<Point | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('draw');
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number, y: number } | null>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  
  const [transformMode, setTransformMode] = useState<TransformMode>(null);
  const [transformStart, setTransformStart] = useState<{ x: number, y: number, layer: any } | null>(null);
  const [guideLines, setGuideLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);
  
  // Get mobile-optimized settings
  const optimizedSettings = mobileOpt.getOptimizedSettings();
  const cssVariables = mobileOpt.getCSSVariables();

  const activeLayer = layers.find(l => l.id === activeLayerId);

  // Calculate the full design bounds
  const getDesignBounds = useCallback(() => {
    let minX = 0, minY = 0, maxX = 0, maxY = 0;
    let hasPoints = false;

    layers.forEach(layer => {
      layer.points.forEach(point => {
        if (!hasPoints) {
          minX = maxX = point.x;
          minY = maxY = point.y;
          hasPoints = true;
        } else {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        }
      });
    });

    // Add padding
    const padding = 200;
    return {
      minX: hasPoints ? minX - padding : -padding,
      minY: hasPoints ? minY - padding : -padding,
      maxX: hasPoints ? maxX + padding : padding,
      maxY: hasPoints ? maxY + padding : padding,
      width: hasPoints ? maxX - minX + 2 * padding : 2 * padding,
      height: hasPoints ? maxY - minY + 2 * padding : 2 * padding
    };
  }, [layers]);

  // Calculate current viewport bounds for efficient rendering
  const getViewportBounds = useCallback(() => {
    if (!canvasRef.current) return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const viewportWidth = rect.width / scale;
    const viewportHeight = rect.height / scale;
    
    return {
      minX: -canvasOffset.x / scale,
      minY: -canvasOffset.y / scale,
      maxX: (-canvasOffset.x + rect.width) / scale,
      maxY: (-canvasOffset.y + rect.height) / scale
    };
  }, [canvasOffset, scale]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optimized scroll-to-zoom functionality
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Zoom with scroll wheel
      const zoomFactor = -e.deltaY * 0.001;
      const newScale = Math.max(0.1, Math.min(scale + zoomFactor, 5));
      
      if (newScale !== scale) {
        // Calculate zoom center (mouse position)
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          // Calculate new offset to zoom towards mouse position
          const scaleRatio = newScale / scale;
          const newOffsetX = mouseX - (mouseX - canvasOffset.x) * scaleRatio;
          const newOffsetY = mouseY - (mouseY - canvasOffset.y) * scaleRatio;
          
          setCanvasOffset({ x: newOffsetX, y: newOffsetY });
        }
        
        setScale(newScale);
      }
    };
    
    const currentCanvasRef = canvasRef.current;
    currentCanvasRef?.addEventListener('wheel', handleWheel, { passive: false });
    return () => currentCanvasRef?.removeEventListener('wheel', handleWheel);
  }, [scale, canvasOffset, setScale]);

  const getRelativeCoords = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent | { clientX: number; clientY: number }): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasOffset.x) / scale;
    const y = (e.clientY - rect.top - canvasOffset.y) / scale;

    // Apply Flower of Life snapping
    const snappedPoint = snapToFlowerOfLife(
      { x, y },
      gridUnit,
      scale,
      10 // snap threshold
    );

    // Update guide lines for visual feedback
    const guides = getFlowerOfLifeGuides(
      snappedPoint,
      gridUnit,
      scale
    );
    setGuideLines(guides);

    return snappedPoint;
  }, [canvasOffset, scale, gridUnit]);
  
  const handlePointMouseDown = (e: React.MouseEvent<SVGCircleElement>, index: number) => {
    e.stopPropagation();
    if (canvasMode === 'draw') {
      setDraggingPointIndex(index);
      setMeasurement(null);
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (transformMode) return;

    if (canvasMode === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTransformMouseDown = (e: React.MouseEvent, mode: TransformMode) => {
    e.stopPropagation();
    if (!activeLayer || !activeLayer.backgroundImage) return;
    
    setTransformMode(mode);
    const startPoint = getRelativeCoords(e);
    setTransformStart({
        x: startPoint.x,
        y: startPoint.y,
        layer: {
            imageX: activeLayer.imageX,
            imageY: activeLayer.imageY,
            imageWidth: activeLayer.imageWidth,
            imageHeight: activeLayer.imageHeight,
            imageRotation: activeLayer.imageRotation,
        }
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    if (isPanning && panStart) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const currentPoint = getRelativeCoords(e);
    setCurrentMousePosition(currentPoint);

    // Handle Image Transform
    if (transformMode && transformStart) {
        const dx = currentPoint.x - transformStart.x;
        const dy = currentPoint.y - transformStart.y;

        if (transformMode === 'move') {
            updateActiveLayer({ 
                imageX: transformStart.layer.imageX + dx,
                imageY: transformStart.layer.imageY + dy,
            });
        } else if (transformMode === 'resize') {
            const originalWidth = transformStart.layer.imageWidth || 1;
            const originalHeight = transformStart.layer.imageHeight || 1;
            const aspectRatio = originalWidth / originalHeight;

            const newWidth = originalWidth + dx * 2;
            const newHeight = newWidth / aspectRatio;
            
            updateActiveLayer({
                imageWidth: Math.max(20, newWidth),
                imageHeight: Math.max(20 / aspectRatio, newHeight)
            });
        } else if (transformMode === 'rotate') {
            const centerX = transformStart.layer.imageX;
            const centerY = transformStart.layer.imageY;
            const startAngle = Math.atan2(transformStart.y - centerY, transformStart.x - centerX);
            const currentAngle = Math.atan2(currentPoint.y - centerY, currentPoint.x - centerX);
            const angleDiff = currentAngle - startAngle;
            
            const newRotation = (transformStart.layer.imageRotation || 0) + angleDiff * (180 / Math.PI);
            updateActiveLayer({ imageRotation: newRotation });
        }
        return;
    }

    if (draggingPointIndex !== null && activeLayer) {
      updatePoint(draggingPointIndex, currentPoint);
      if (activeLayer) {
        // Update angle for the segment before the dragged point
        if (draggingPointIndex > 0) {
            const prevPoint = activeLayer.points[draggingPointIndex - 1];
            updateMeasurementDisplay(prevPoint, currentPoint);
        } else if (activeLayer.points.length > 1 && !activeLayer.points[activeLayer.points.length - 1].break) { // Closing segment for first point
            const prevPoint = activeLayer.points[activeLayer.points.length - 1];
            updateMeasurementDisplay(prevPoint, currentPoint);
        }
        // Update angle for the segment after the dragged point
        if (draggingPointIndex < activeLayer.points.length - 1 && !activeLayer.points[draggingPointIndex].break) {
            const nextPoint = activeLayer.points[draggingPointIndex + 1];
            updateMeasurementDisplay(currentPoint, nextPoint);
        } else if (activeLayer.points.length > 1 && draggingPointIndex === activeLayer.points.length-1 && !activeLayer.points[draggingPointIndex].break) { // Closing segment for last point
            const nextPoint = activeLayer.points[0];
            updateMeasurementDisplay(currentPoint, nextPoint);
        }
      }
    } else {
      if (!activeLayer) return;
      const lastPoint = activeLayer.points[activeLayer.points.length - 1];
      if (lastPoint && !lastPoint.break) {
        updateMeasurementDisplay(lastPoint, currentPoint);
      } else {
        setMeasurement(null);
      }
    }
  }, [isPanning, panStart, getRelativeCoords, transformMode, transformStart, updateActiveLayer, draggingPointIndex, activeLayer, updatePoint, setMeasurement]);

  const handleMouseUp = () => {
    setDraggingPointIndex(null);
    setTransformMode(null);
    setTransformStart(null);
    setIsPanning(false);
    setPanStart(null);
  }
  
  const handleMouseLeave = () => {
    setDraggingPointIndex(null);
    setTransformMode(null);
    setTransformStart(null);
    setMeasurement(null);
    setCurrentMousePosition(null);
    setIsPanning(false);
    setPanStart(null);
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeLayer || activeLayer.isLocked) return;
    if (transformMode) return;
    if (draggingPointIndex !== null) return;
    if (canvasMode !== 'draw') return;

    if (e.detail === 1) { // Single click
      addPoint(getRelativeCoords(e));
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!activeLayer || activeLayer.isLocked) return;
    if (canvasMode !== 'draw') return;
    detachLine();
    setMeasurement(null);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!activeLayer || activeLayer.isLocked) return;
    if (canvasMode !== 'draw') return;

    if (draggingPointIndex === null) {
      removeLastPoint();
    }
    setMeasurement(null);
  };

  const getMirroredX = useCallback((x: number) => {
    if (!svgRef.current) return x;
    const svgWidth = svgRef.current.getBoundingClientRect().width / scale;
    const centerX = svgWidth / 2;
    return centerX + (centerX - x);
  }, [scale]);

  const calculateMeasurement = (p1: Point, p2: Point): { angle: number, length: number } => {
    const deltaY = p2.y - p1.y;
    const deltaX = p2.x - p1.x;
    
    // Calculate Angle
    let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angleInDegrees = (angleInDegrees + 360) % 360;
    
    // Calculate Length
    const lengthInPixels = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const lengthInUnits = lengthInPixels / GRID_UNITS_IN_PIXELS[gridUnit];

    return { angle: angleInDegrees, length: lengthInUnits };
  };
  
  const updateMeasurementDisplay = (p1: Point, p2: Point) => {
    const { angle, length } = calculateMeasurement(p1, p2);
    setMeasurement({ angle, length, position: p2 });
  }

  const getPathData = (pointSet: Point[]): string => {
    if (pointSet.length < 1) return '';
    
    let pathData = `M ${pointSet[0].x} ${pointSet[0].y}`;
    
    for (let i = 1; i < pointSet.length; i++) {
        if (pointSet[i-1].break) {
            pathData += ` M ${pointSet[i].x} ${pointSet[i].y}`;
            } else {
            pathData += ` L ${pointSet[i].x} ${pointSet[i].y}`;
        }
    }

    if (pointSet.length > 2 && !pointSet[pointSet.length - 1].break) {
        pathData += ' Z';
    }
    return pathData;
  }

  const renderPath = (layer: Layer, mirror: boolean) => {
    if (layer.points.length < 2) return null;
    
    const transformedPoints = layer.points.map(p => ({ 
        ...p, 
        x: mirror ? getMirroredX(p.x) : p.x,
    }));
    const pathData = getPathData(transformedPoints);
    
    return (
      <path 
        d={pathData} 
        stroke={layer.color} 
        strokeWidth={layer.strokeWidth / scale} 
        fill="none"
        className="transition-all duration-200"
        style={{
          filter: layer.id !== activeLayerId ? 'opacity(0.7)' : 'none'
        }}
      />
    );
  }

  const gridStyle = {
    backgroundColor: '#FFFFFF', // Set canvas background to white
    minHeight: '100%',
  };

  const renderPoints = (layer: Layer, mirror: boolean, canDrag: boolean) => {
    return layer.points.map((p, i) => {
      const cx = mirror ? getMirroredX(p.x) : p.x;
      const cy = p.y;
      const radius = layer.pointRadius / scale;
      const isDraggable = !mirror && canDrag && canvasMode === 'draw';
      const isActive = layer.id === activeLayerId;
      
      return (
         <circle 
            key={`${mirror ? 'mirror-' : ''}point-${i}`}
            cx={cx} 
            cy={cy} 
            r={radius} 
            fill={layer.color}
            stroke={isActive ? 'hsl(var(--primary))' : 'transparent'}
            strokeWidth={isActive ? 1 / scale : 0}
            onMouseDown={isDraggable ? (e) => handlePointMouseDown(e, i) : undefined}
            className={cn(
              "transition-all duration-200",
              isDraggable ? 'cursor-grab hover:scale-110' : 'cursor-default'
            )}
            pointerEvents={isDraggable ? 'all' : 'none'}
          />
      )
    });
  }

  const renderMeasurement = (measurementInfo: Measurement | null, mirror: boolean) => {
    if (!measurementInfo) return null;

    const x = mirror ? getMirroredX(measurementInfo.position.x) : measurementInfo.position.x;
    const y = measurementInfo.position.y;
    
    const angleText = `${measurementInfo.angle.toFixed(1)}°`;
    const lengthText = `${measurementInfo.length.toFixed(2)} ${gridUnit}`;
    
    const textTransform = mirror ? `scale(-1, 1)` : ``;

    return (
      <g transform={`translate(${x} ${y}) ${textTransform}`} >
        {/* Background for better readability */}
        <rect
          x={10}
          y={-25}
          width={Math.max(angleText.length * 8, lengthText.length * 8)}
          height={25}
          fill="hsl(var(--background) / 0.8)"
          rx={4 / scale}
          className="backdrop-blur-sm"
        />
        <text
          x={15}
          y={-15}
          fontSize={12 / scale}
          fill="hsl(var(--foreground))"
          textAnchor="start"
          transform={`scale(${mirror ? -1 : 1}, 1)`}
          className="font-medium"
        >
          {lengthText}
        </text>
        <text
          x={15}
          y={-2}
          fontSize={12 / scale}
          fill="hsl(var(--muted-foreground))"
          textAnchor="start"
          transform={`scale(${mirror ? -1 : 1}, 1)`}
          className="font-medium"
        >
          {angleText}
        </text>
      </g>
    );
  };
  
  const renderPreview = () => {
    if (!activeLayer || activeLayer.isLocked || draggingPointIndex !== null || !currentMousePosition || canvasMode !== 'draw') return null;
    const lastPoint = activeLayer.points[activeLayer.points.length - 1];
    if (!lastPoint || lastPoint.break) return null;
    
    const previewLine = (
      <line 
        x1={lastPoint.x} 
        y1={lastPoint.y} 
        x2={currentMousePosition.x} 
        y2={currentMousePosition.y} 
        stroke={activeLayer.color} 
        strokeWidth={activeLayer.strokeWidth / scale} 
        strokeDasharray={`${4/scale} ${2/scale}`}
        opacity={0.6}
      />
    );
    
    let mirroredPreviewLine = null;
    if (isSymmetryEnabled) {
        const mirroredLastPointX = getMirroredX(lastPoint.x);
        const mirroredMouseX = getMirroredX(currentMousePosition.x);
        mirroredPreviewLine = (
          <line 
            x1={mirroredLastPointX} 
            y1={lastPoint.y} 
            x2={mirroredMouseX} 
            y2={currentMousePosition.y} 
            stroke={activeLayer.color} 
            strokeWidth={activeLayer.strokeWidth / scale} 
            strokeDasharray={`${4/scale} ${2/scale}`}
            opacity={0.6}
          />
        );
    }
    
    return <g data-preview-group>{previewLine}{mirroredPreviewLine}</g>;
  }

  const renderImageTransformHandles = () => {
    if (!activeLayer || !activeLayer.backgroundImage || activeLayer.isLocked) return null;
    const { imageX, imageY, imageWidth, imageHeight, imageRotation } = activeLayer;
    if (!imageX || !imageY || !imageWidth || !imageHeight) return null;

    const handleSize = 10 / scale;
    const halfHandle = handleSize / 2;

    const transform = `translate(${imageX} ${imageY}) rotate(${imageRotation || 0})`;
    
    const corners = [
        { x: -imageWidth/2, y: -imageHeight/2 }, // top-left
        { x: imageWidth/2, y: -imageHeight/2 }, // top-right
        { x: imageWidth/2, y: imageHeight/2 }, // bottom-right
        { x: -imageWidth/2, y: imageHeight/2 }, // bottom-left
    ];

    return (
      <g transform={transform} style={{ transformOrigin: `${imageX}px ${imageY}px` }}>
        <rect 
            x={-imageWidth/2} 
            y={-imageHeight/2} 
            width={imageWidth} 
            height={imageHeight}
            fill="none" 
            stroke="hsl(var(--primary))"
            strokeWidth={1/scale}
            strokeDasharray={`${4/scale} ${4/scale}`}
            className="cursor-move"
            onMouseDown={(e) => handleTransformMouseDown(e, 'move')}
            pointerEvents="all"
        />
        {/* Resize Handle (bottom-right) */}
        <rect
            x={corners[2].x - halfHandle}
            y={corners[2].y - halfHandle}
            width={handleSize}
            height={handleSize}
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth={1/scale}
            className="cursor-se-resize hover:scale-110 transition-transform"
            onMouseDown={(e) => handleTransformMouseDown(e, 'resize')}
            pointerEvents="all"
        />
        {/* Rotation Handle (top-center) */}
        <line
            x1={0}
            y1={-imageHeight/2}
            x2={0}
            y2={-imageHeight/2 - 20/scale}
            stroke="hsl(var(--primary))"
            strokeWidth={1/scale}
            pointerEvents="none"
        />
        <circle
            cx={0}
            cy={-imageHeight/2 - 20/scale}
            r={handleSize/2}
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth={1/scale}
            className="cursor-alias hover:scale-110 transition-transform"
            onMouseDown={(e) => handleTransformMouseDown(e, 'rotate')}
            pointerEvents="all"
        />
      </g>
    )
  }

  const resetView = () => {
    setCanvasOffset({ x: 0, y: 0 });
    setScale(1);
  };

  const fitToDesign = () => {
    const bounds = getDesignBounds();
    const canvasWidth = canvasSize.width;
    const canvasHeight = canvasSize.height;
    
    const scaleX = canvasWidth / bounds.width;
    const scaleY = canvasHeight / bounds.height;
    const newScale = Math.min(scaleX, scaleY, 1) * 0.9; // 90% to add some padding
    
    setScale(newScale);
    
    // Center the design
    const centerX = (canvasWidth - bounds.width * newScale) / 2;
    const centerY = (canvasHeight - bounds.height * newScale) / 2;
    setCanvasOffset({
      x: centerX - bounds.minX * newScale,
      y: centerY - bounds.minY * newScale
    });
  };

  const viewportBounds = getViewportBounds();

  return (
    <div
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "w-full h-full relative overflow-hidden group canvas-enhanced",
        !transformMode && canvasMode === 'draw' && "custom-cursor-thin",
        canvasMode === 'pan' && "cursor-grab",
        isPanning && "cursor-grabbing"
       )}
      style={{
        ...gridStyle,
        backgroundColor: '#000000' // Black background for Flower of Life
      }}
      data-ai-hint="flower of life sacred geometry"
    >
      {/* Optimized Canvas Container */}
      <div 
        className="absolute top-0 left-0 w-full h-full" 
        style={{ 
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`,
          transformOrigin: 'top left',
          minWidth: '2000px',
          minHeight: '2000px'
        }}
      >
        {/* Background Images */}
        <div id="canvas-container" className="absolute top-0 left-0 w-full h-full">
          {layers.map(layer => (
            layer.backgroundImage && (
              <img
                key={`img-${layer.id}`}
                src={layer.backgroundImage}
                className={cn(
                    "absolute top-0 left-0 object-contain pointer-events-none select-none transition-opacity duration-200",
                    layer.id !== activeLayerId && 'opacity-50'
                )}
                style={{
                  width: layer.imageWidth,
                  height: layer.imageHeight,
                  transform: `
                    translate(-50%, -50%) 
                    translate(${layer.imageX || 0}px, ${layer.imageY || 0}px) 
                    rotate(${layer.imageRotation || 0}deg)
                  `,
                  transformOrigin: 'top left',
                }}
              />
            )
          ))}
        </div>

        {/* SVG Canvas */}
        <svg 
          id="design-canvas-svg" 
          ref={svgRef} 
          className="w-full h-full absolute top-0 left-0" 
          style={{ 
            minWidth: '2000px',
            minHeight: '2000px'
          }}
          pointerEvents="none"
        >
          {/* Flower of Life Grid - Always Active */}
          <FlowerOfLifeGrid
            scale={scale}
            unit={gridUnit}
            offsetX={canvasOffset.x}
            offsetY={canvasOffset.y}
            viewportBounds={viewportBounds}
          />

          {/* Guide Lines for Flower of Life */}
          {guideLines.length > 0 && (
            <g className="guide-lines">
              {guideLines.map((guide, index) => (
                <line
                  key={`guide-${index}`}
                  x1={guide.x1}
                  y1={guide.y1}
                  x2={guide.x2}
                  y2={guide.y2}
                  stroke="#FFFFFF"
                  strokeWidth={0.5 / scale}
                  opacity="0.6"
                  strokeDasharray={`${4/scale} ${2/scale}`}
                />
              ))}
            </g>
          )}
          {/* Symmetry Line */}
          <line
            data-export-hide="false"
            className={cn(
              "transition-opacity duration-300",
              !isSymmetryEnabled ? 'opacity-0' : 'opacity-100'
            )}
            x1={1000}
            y1="0"
            x2={1000}
            y2="2000"
            stroke="hsl(var(--primary) / 0.6)"
            strokeWidth={1 / scale}
            strokeDasharray={`${8/scale} ${4/scale}`}
          />
          
          {layers.map(layer => {
            const isLayerActive = layer.id === activeLayerId;
            const canDrag = isLayerActive && !layer.isLocked;

            return (
              <g key={layer.id} data-layer-id={layer.id}>
                {/* Original Drawing */}
                {renderPath(layer, false)}
                {renderPoints(layer, false, canDrag)}

                {/* Mirrored Drawing */}
                {isSymmetryEnabled && renderPath(layer, true)}
                {isSymmetryEnabled && renderPoints(layer, true, false)}
              </g>
            )
          })}
          
          {renderPreview()}
          
          {measurement && (
              <g data-measurement-group data-export-hide="false" className="">
                  {renderMeasurement(measurement, false)}
                  {isSymmetryEnabled && renderMeasurement(measurement, true)}
              </g>
          )}
          
          {renderImageTransformHandles()}
        </svg>
      </div>

      {/* Enhanced Canvas Controls */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 border border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {e.stopPropagation(); zoomOut();}} 
                className='h-8 w-8'
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
          
          <Badge variant="secondary" className="text-xs min-w-[3rem] justify-center">
            {Math.round(scale * 100)}%
          </Badge>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {e.stopPropagation(); zoomIn();}} 
                className='h-8 w-8'
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {e.stopPropagation(); resetView();}} 
                className='h-8 w-8'
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset View</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Canvas Mode Toggle */}
        <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 border border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={canvasMode === 'draw' ? 'default' : 'ghost'} 
                size="icon" 
                onClick={(e) => {e.stopPropagation(); setCanvasMode('draw');}} 
                className='h-8 w-8'
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Draw Mode</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={canvasMode === 'pan' ? 'default' : 'ghost'} 
                size="icon" 
                onClick={(e) => {e.stopPropagation(); setCanvasMode('pan');}} 
                className='h-8 w-8'
              >
                <Move className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pan Mode</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Fit to Design Button */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {e.stopPropagation(); fitToDesign();}} 
              className='h-8'
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Fit Design
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fit Design to View</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

    