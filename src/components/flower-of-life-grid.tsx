"use client";

import React, { useMemo } from 'react';
import type { GridUnit } from '@/lib/types';

const GRID_UNITS_IN_PIXELS = {
  inch: 96,
  cm: 37.795,
};

interface FlowerOfLifeGridProps {
  scale: number;
  unit: GridUnit;
  offsetX: number;
  offsetY: number;
  viewportBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

// Flower of Life Geometry Math
class FlowerOfLifeGeometry {
  private radius: number;
  private unit: GridUnit;

  constructor(unit: GridUnit, scale: number) {
    this.unit = unit;
    // Calculate radius based on unit mode
    if (unit === 'cm') {
      // In cm mode: R = 1 cm
      this.radius = GRID_UNITS_IN_PIXELS.cm / scale;
    } else {
      // In inch mode: R = 1 inch × π
      this.radius = (GRID_UNITS_IN_PIXELS.inch * Math.PI) / scale;
    }
  }

  // Get the base radius
  getRadius(): number {
    return this.radius;
  }

  // Calculate the centers of all Flower of Life motifs in a grid with performance optimization
  getMotifCenters(viewportBounds: { minX: number; minY: number; maxX: number; maxY: number }) {
    const centers: Array<{ x: number; y: number }> = [];
    
    // The distance between motif centers
    const horizontalSpacing = this.radius * 2;
    const verticalSpacing = this.radius * Math.sqrt(3);

    // Calculate the range of visible motifs with padding
    const padding = this.radius * 2; // Add padding to prevent edge artifacts
    const startX = Math.floor((viewportBounds.minX - padding) / horizontalSpacing) * horizontalSpacing;
    const endX = Math.ceil((viewportBounds.maxX + padding) / horizontalSpacing) * horizontalSpacing;
    const startY = Math.floor((viewportBounds.minY - padding) / verticalSpacing) * verticalSpacing;
    const endY = Math.ceil((viewportBounds.maxY + padding) / verticalSpacing) * verticalSpacing;

    // Dynamic performance limit based on viewport size
    const viewportArea = (viewportBounds.maxX - viewportBounds.minX) * (viewportBounds.maxY - viewportBounds.minY);
    const maxMotifs = Math.min(800, Math.max(200, Math.floor(viewportArea / 10000))); // Responsive limit
    
    console.log('🌸 Flower of Life Debug:', {
      viewportBounds,
      horizontalSpacing,
      verticalSpacing,
      startX, endX, startY, endY,
      maxMotifs,
      viewportArea
    });
    
    let motifCount = 0;

    for (let y = startY; y <= endY && motifCount < maxMotifs; y += verticalSpacing) {
      // Alternate horizontal offset for hexagonal packing
      const rowOffsetX = (Math.round(y / verticalSpacing) % 2 === 0) ? 0 : this.radius;
      for (let x = startX + rowOffsetX; x <= endX && motifCount < maxMotifs; x += horizontalSpacing) {
        centers.push({ x, y });
        motifCount++;
      }
    }

    return centers;
  }

  // Generate all circles for a single Flower of Life motif
  getMotifCircles(centerX: number, centerY: number) {
    const circles: Array<{ cx: number; cy: number; r: number }> = [];
    
    // Central circle
    circles.push({ cx: centerX, cy: centerY, r: this.radius });
    
    // Six surrounding circles (petals)
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const petalX = centerX + this.radius * Math.cos(angle);
      const petalY = centerY + this.radius * Math.sin(angle);
      circles.push({ cx: petalX, cy: petalY, r: this.radius });
    }

    return circles;
  }

  // Calculate all intersection points between circles
  getIntersectionPoints(centerX: number, centerY: number) {
    const intersections: Array<{ x: number; y: number }> = [];
    
    // Get all circles in this motif
    const circles = this.getMotifCircles(centerX, centerY);
    
    // Calculate intersections between all pairs of circles
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const circle1 = circles[i];
        const circle2 = circles[j];
        
        const intersections = this.getCircleIntersections(circle1, circle2);
        intersections.forEach(point => {
          // Check if this intersection is within the viewport
          if (this.isPointInViewport(point, { minX: -this.radius, minY: -this.radius, maxX: this.radius, maxY: this.radius })) {
            intersections.push(point);
          }
        });
      }
    }

    return intersections;
  }

  // Calculate intersection points between two circles
  private getCircleIntersections(circle1: { cx: number; cy: number; r: number }, circle2: { cx: number; cy: number; r: number }) {
    const dx = circle2.cx - circle1.cx;
    const dy = circle2.cy - circle1.cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // No intersection if circles are too far apart or one contains the other
    if (distance > circle1.r + circle2.r || distance < Math.abs(circle1.r - circle2.r)) {
      return [];
    }
    
    // If circles are identical, return empty array
    if (distance === 0 && circle1.r === circle2.r) {
      return [];
    }
    
    // Calculate intersection points
    const a = (circle1.r * circle1.r - circle2.r * circle2.r + distance * distance) / (2 * distance);
    const h = Math.sqrt(circle1.r * circle1.r - a * a);
    
    const x2 = circle1.cx + (a * dx) / distance;
    const y2 = circle1.cy + (a * dy) / distance;
    
    // If circles touch at exactly one point
    if (h === 0) {
      return [{ x: x2, y: y2 }];
    }
    
    // Two intersection points
    const rx = -dy * (h / distance);
    const ry = dx * (h / distance);
    
    return [
      { x: x2 + rx, y: y2 + ry },
      { x: x2 - rx, y: y2 - ry }
    ];
  }

  // Check if a point is within the viewport
  private isPointInViewport(point: { x: number; y: number }, viewportBounds: { minX: number; minY: number; maxX: number; maxY: number }) {
    return point.x >= viewportBounds.minX && 
           point.x <= viewportBounds.maxX && 
           point.y >= viewportBounds.minY && 
           point.y <= viewportBounds.maxY;
  }

  // Get all intersection points in the viewport
  getAllIntersectionPoints(viewportBounds: { minX: number; minY: number; maxX: number; maxY: number }) {
    const allIntersections: Array<{ x: number; y: number }> = [];
    const motifCenters = this.getMotifCenters(viewportBounds);
    
    motifCenters.forEach(center => {
      const intersections = this.getIntersectionPoints(center.x, center.y);
      intersections.forEach(point => {
        if (this.isPointInViewport(point, viewportBounds)) {
          allIntersections.push(point);
        }
      });
    });

    return allIntersections;
  }
}

// Optimized Flower of Life Grid Component
export const FlowerOfLifeGrid: React.FC<FlowerOfLifeGridProps> = React.memo(({
  scale,
  unit,
  offsetX,
  offsetY,
  viewportBounds
}) => {
  const geometry = useMemo(() => new FlowerOfLifeGeometry(unit, scale), [unit, scale]);

  const gridElements = useMemo(() => {
    const elements: JSX.Element[] = [];
    const motifCenters = geometry.getMotifCenters(viewportBounds);
    
    // Performance optimization: limit the number of rendered elements
    const maxElements = 2000; // Increased limit for better coverage
    let elementCount = 0;
    
    // Render circles with performance optimization
    motifCenters.forEach((center, index) => {
      if (elementCount >= maxElements) return;
      
      const circles = geometry.getMotifCircles(center.x, center.y);
      
      circles.forEach((circle, circleIndex) => {
        if (elementCount >= maxElements) return;
        
        // Check if circle is visible in viewport with optimized bounds checking
        const isVisible = 
          circle.cx + circle.r > viewportBounds.minX &&
          circle.cx - circle.r < viewportBounds.maxX &&
          circle.cy + circle.r > viewportBounds.minY &&
          circle.cy - circle.r < viewportBounds.maxY;
        
        if (isVisible) {
          elements.push(
            <circle
              key={`fol-circle-${index}-${circleIndex}`}
              cx={circle.cx}
              cy={circle.cy}
              r={circle.r}
              stroke="#FFFFFF"
              strokeWidth={Math.max(0.5 / scale, 0.1)} // Minimum stroke width
              fill="none"
              opacity="0.3"
              className="flower-of-life-circle"
            />
          );
          elementCount++;
        }
      });
    });

    // Render intersection points with glow effect (limited for performance)
    const intersections = geometry.getAllIntersectionPoints(viewportBounds);
    const maxIntersections = Math.min(intersections.length, 500); // Increased limit for better coverage
    
    intersections.slice(0, maxIntersections).forEach((point, index) => {
      if (elementCount >= maxElements) return;
      
      elements.push(
        <g key={`fol-intersection-${index}`}>
          {/* Glow effect */}
          <circle
            cx={point.x}
            cy={point.y}
            r={Math.max(4 / scale, 1)} // Minimum glow radius
            fill="url(#glowGradient)"
            opacity="0.6"
            className="flower-of-life-glow"
          />
          {/* Center point */}
          <circle
            cx={point.x}
            cy={point.y}
            r={Math.max(1 / scale, 0.5)} // Minimum point radius
            fill="#FFFFFF"
            opacity="0.9"
            className="flower-of-life-point"
          />
        </g>
      );
      elementCount++;
    });

    return elements;
  }, [geometry, viewportBounds, scale]);

  return (
    <g className="flower-of-life-grid" data-export-hide="false">
      {/* Define glow gradient */}
      <defs>
        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Render grid elements */}
      {gridElements}
    </g>
  );
});

FlowerOfLifeGrid.displayName = 'FlowerOfLifeGrid';

// Utility functions for snapping and measurements
export const snapToFlowerOfLife = (
  point: { x: number; y: number },
  unit: GridUnit,
  scale: number,
  snapThreshold: number = 10
) => {
  const geometry = new FlowerOfLifeGeometry(unit, scale);
  const viewportBounds = {
    minX: point.x - snapThreshold,
    minY: point.y - snapThreshold,
    maxX: point.x + snapThreshold,
    maxY: point.y + snapThreshold
  };
  
  const intersections = geometry.getAllIntersectionPoints(viewportBounds);
  
  if (intersections.length === 0) {
    return point;
  }
  
  // Find the closest intersection point
  let closestPoint = intersections[0];
  let minDistance = Math.sqrt(
    Math.pow(point.x - closestPoint.x, 2) + Math.pow(point.y - closestPoint.y, 2)
  );
  
  intersections.forEach(intersection => {
    const distance = Math.sqrt(
      Math.pow(point.x - intersection.x, 2) + Math.pow(point.y - intersection.y, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = intersection;
    }
  });
  
  // Only snap if within threshold
  if (minDistance <= snapThreshold / scale) {
    return closestPoint;
  }
  
  return point;
};

export const getFlowerOfLifeGuides = (
  point: { x: number; y: number },
  unit: GridUnit,
  scale: number
) => {
  const geometry = new FlowerOfLifeGeometry(unit, scale);
  const radius = geometry.getRadius();
  
  // Generate guide lines from the point to nearby intersections
  const guides: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  
  // Find nearby motif centers
  const nearbyCenters = geometry.getMotifCenters({
    minX: point.x - radius * 3,
    minY: point.y - radius * 3,
    maxX: point.x + radius * 3,
    maxY: point.y + radius * 3
  });
  
  nearbyCenters.forEach(center => {
    const circles = geometry.getMotifCircles(center.x, center.y);
    circles.forEach(circle => {
      // Check if point is near this circle
      const distance = Math.sqrt(
        Math.pow(point.x - circle.cx, 2) + Math.pow(point.y - circle.cy, 2)
      );
      
      if (Math.abs(distance - circle.r) < 5 / scale) {
        // Point is near the circle, add guide line
        guides.push({
          x1: point.x,
          y1: point.y,
          x2: circle.cx,
          y2: circle.cy
        });
      }
    });
  });
  
  return guides;
};