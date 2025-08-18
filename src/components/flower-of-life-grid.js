"use client";

import React, { useMemo } from 'react';

const GRID_UNITS_IN_PIXELS = {
  inch: 96,
  cm: 37.795,
};

// Mobile-first performance constants
const MOBILE_PERFORMANCE = {
  MAX_MOTIFS: 25, // Reduced from desktop
  MAX_CIRCLES: 150, // Reduced circle count
  MAX_INTERSECTIONS: 100, // Reduced intersection points
  RENDER_DISTANCE: 200, // Smaller render area
  MIN_MOTIF_SPACING: 2, // Larger spacing for performance
};

// Flower of Life Geometry Math - Mobile optimized
class FlowerOfLifeGeometry {
  constructor(unit, scale, isMobile = false) {
    this.unit = unit;
    this.isMobile = isMobile;
    
    // Calculate radius based on unit mode
    if (unit === 'cm') {
      // In cm mode: R = 1 cm
      this.radius = GRID_UNITS_IN_PIXELS.cm / scale;
    } else {
      // In inch mode: R = 1 inch × π
      this.radius = (GRID_UNITS_IN_PIXELS.inch * Math.PI) / scale;
    }
    
    // Mobile: Increase spacing for performance
    if (isMobile) {
      this.radius *= MOBILE_PERFORMANCE.MIN_MOTIF_SPACING;
    }
  }

  // Get the base radius
  getRadius() {
    return this.radius;
  }

  // Calculate the centers of all Flower of Life motifs in a grid with mobile-first optimization
  getMotifCenters(viewportBounds) {
    const centers = [];
    
    // The distance between motif centers
    const horizontalSpacing = this.radius * 2;
    const verticalSpacing = this.radius * Math.sqrt(3);

    // Calculate the range of visible motifs with mobile-optimized padding
    const padding = this.isMobile ? 
      this.radius * 1.5 : // Smaller padding for mobile
      this.radius * 2; // Desktop padding
    
    const startX = Math.floor((viewportBounds.minX - padding) / horizontalSpacing) * horizontalSpacing;
    const endX = Math.ceil((viewportBounds.maxX + padding) / horizontalSpacing) * horizontalSpacing;
    const startY = Math.floor((viewportBounds.minY - padding) / verticalSpacing) * verticalSpacing;
    const endY = Math.ceil((viewportBounds.maxY + padding) / verticalSpacing) * verticalSpacing;

    // Mobile-first performance limit
    const maxMotifs = this.isMobile ? 
      MOBILE_PERFORMANCE.MAX_MOTIFS : 
      Math.min(400, Math.max(100, Math.floor((viewportBounds.maxX - viewportBounds.minX) * (viewportBounds.maxY - viewportBounds.minY) / 20000)));
    
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

  // Generate all circles for a single Flower of Life motif - Mobile optimized
  getMotifCircles(centerX, centerY) {
    const circles = [];
    
    // Central circle
    circles.push({ cx: centerX, cy: centerY, r: this.radius });
    
    // Six surrounding circles (petals) - Mobile: reduced complexity
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const petalX = centerX + this.radius * Math.cos(angle);
      const petalY = centerY + this.radius * Math.sin(angle);
      circles.push({ cx: petalX, cy: petalY, r: this.radius });
    }

    return circles;
  }

  // Calculate all intersection points between circles - Mobile optimized
  getIntersectionPoints(centerX, centerY) {
    const intersections = [];
    
    // Calculate intersections between central circle and petals
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const intersectionX = centerX + this.radius * Math.cos(angle);
      const intersectionY = centerY + this.radius * Math.sin(angle);
      intersections.push({ x: intersectionX, y: intersectionY });
    }

    return intersections;
  }

  // Get all intersection points for the entire grid - Mobile optimized
  getAllIntersectionPoints(viewportBounds) {
    const allIntersections = [];
    const motifCenters = this.getMotifCenters(viewportBounds);
    
    // Mobile: Limit intersection calculations
    const maxMotifs = this.isMobile ? 
      Math.min(motifCenters.length, 10) : 
      motifCenters.length;
    
    motifCenters.slice(0, maxMotifs).forEach(center => {
      const intersections = this.getIntersectionPoints(center.x, center.y);
      allIntersections.push(...intersections);
    });

    return allIntersections;
  }
}

// Snap point to nearest Flower of Life intersection
export function snapToFlowerOfLife(point, unit, scale) {
  const GRID_UNITS_IN_PIXELS = {
    inch: 96,
    cm: 37.795,
  };

  let radius;
  if (unit === 'cm') {
    radius = GRID_UNITS_IN_PIXELS.cm / scale;
  } else {
    radius = (GRID_UNITS_IN_PIXELS.inch * Math.PI) / scale;
  }

  // Calculate the nearest motif center
  const horizontalSpacing = radius * 2;
  const verticalSpacing = radius * Math.sqrt(3);
  
  const motifX = Math.round(point.x / horizontalSpacing) * horizontalSpacing;
  const motifY = Math.round(point.y / verticalSpacing) * verticalSpacing;
  
  // Calculate intersection points for this motif
  const intersections = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    const intersectionX = motifX + radius * Math.cos(angle);
    const intersectionY = motifY + radius * Math.sin(angle);
    intersections.push({ x: intersectionX, y: intersectionY });
  }
  
  // Find the closest intersection
  let closestPoint = point;
  let minDistance = Infinity;
  
  intersections.forEach(intersection => {
    const distance = Math.sqrt(
      Math.pow(point.x - intersection.x, 2) + 
      Math.pow(point.y - intersection.y, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = intersection;
    }
  });
  
  return closestPoint;
}

// Get guide lines for Flower of Life snapping
export function getFlowerOfLifeGuides(point, unit, scale) {
  const GRID_UNITS_IN_PIXELS = {
    inch: 96,
    cm: 37.795,
  };

  let radius;
  if (unit === 'cm') {
    radius = GRID_UNITS_IN_PIXELS.cm / scale;
  } else {
    radius = (GRID_UNITS_IN_PIXELS.inch * Math.PI) / scale;
  }

  const guides = [];
  
  // Add horizontal and vertical guides through the point
  guides.push({
    x1: point.x - 1000,
    y1: point.y,
    x2: point.x + 1000,
    y2: point.y,
    type: 'horizontal'
  });
  
  guides.push({
    x1: point.x,
    y1: point.y - 1000,
    x2: point.x,
    y2: point.y + 1000,
    type: 'vertical'
  });
  
  // Add diagonal guides at 60° intervals
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    const dx = Math.cos(angle) * 1000;
    const dy = Math.sin(angle) * 1000;
    
    guides.push({
      x1: point.x - dx,
      y1: point.y - dy,
      x2: point.x + dx,
      y2: point.y + dy,
      type: 'diagonal'
    });
  }
  
  return guides;
}

export const FlowerOfLifeGrid = React.memo(({
  scale, unit, offsetX, offsetY, viewportBounds, isMobile = false
}) => {
  const geometry = useMemo(() => new FlowerOfLifeGeometry(unit, scale, isMobile), [unit, scale, isMobile]);
  
  const gridElements = useMemo(() => {
    const elements = [];
    const motifCenters = geometry.getMotifCenters(viewportBounds);
    
    // Mobile-first performance limits
    const maxElements = isMobile ? MOBILE_PERFORMANCE.MAX_CIRCLES : 1000;
    const maxMotifs = isMobile ? MOBILE_PERFORMANCE.MAX_MOTIFS : 400;
    let elementCount = 0;

    // Render Flower of Life motifs - Mobile optimized
    motifCenters.slice(0, maxMotifs).forEach(center => {
      if (elementCount >= maxElements) return;
      
      const circles = geometry.getMotifCircles(center.x, center.y);
      circles.forEach(circle => {
        if (elementCount >= maxElements) return;
        
        elements.push(
          <circle
            key={`circle-${center.x}-${center.y}-${circle.cx}-${circle.cy}`}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            fill="none"
            stroke={isMobile ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)"} // Reduced opacity for mobile
            strokeWidth={isMobile ? "0.3" : "0.5"} // Thinner strokes for mobile
            className="flower-of-life-circle"
          />
        );
        elementCount++;
      });
    });

    // Render intersection points - Mobile optimized
    const intersections = geometry.getAllIntersectionPoints(viewportBounds);
    const maxIntersections = isMobile ? 
      Math.min(intersections.length, MOBILE_PERFORMANCE.MAX_INTERSECTIONS) : 
      Math.min(intersections.length, 250);
    
    intersections.slice(0, maxIntersections).forEach((point, index) => {
      if (elementCount >= maxElements) return;
      
      elements.push(
        <circle
          key={`intersection-${index}`}
          cx={point.x}
          cy={point.y}
          r={isMobile ? "0.5" : "1"} // Smaller points for mobile
          fill={isMobile ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.3)"} // Reduced opacity for mobile
          className="flower-of-life-point"
        />
      );
      elementCount++;
    });

    return elements;
  }, [geometry, viewportBounds, scale, isMobile]);

  return (
    <g className="flower-of-life-grid">
      {gridElements}
    </g>
  );
});