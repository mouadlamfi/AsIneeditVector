"use client";

import React, { useMemo } from 'react';
import type { GridType, GridConfig } from '@/lib/types';

interface SacredGeometryGridProps {
  type: GridType;
  config: GridConfig;
  viewportBounds: { minX: number; minY: number; maxX: number; maxY: number };
  scale: number;
  offsetX: number;
  offsetY: number;
}

// Flower of Life Grid Component
const FlowerOfLifeGrid = React.memo(({ config, viewportBounds, scale, offsetX, offsetY }: Omit<SacredGeometryGridProps, 'type'>) => {
  const radius = 50; // Base radius for circles
  const strokeColor = `hsla(0, 0%, 100%, ${config.opacity})`;
  const strokeWidth = 0.5 / scale;

  const flowerPattern = useMemo(() => {
    const circles = [];
    const centerX = -offsetX / scale;
    const centerY = -offsetY / scale;

    // Main center circle
    circles.push(
      <circle
        key="center"
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        className="sacred-geometry-grid"
      />
    );

    // Six surrounding circles (Flower of Life pattern)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3; // 60 degrees each
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      circles.push(
        <circle
          key={`surrounding-${i}`}
          cx={x}
          cy={y}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="sacred-geometry-grid"
        />
      );
    }

    // Extended pattern (additional circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + 2 * radius * Math.cos(angle);
      const y = centerY + 2 * radius * Math.sin(angle);

      circles.push(
        <circle
          key={`extended-${i}`}
          cx={x}
          cy={y}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="sacred-geometry-grid"
        />
      );
    }

    // Seed of Life pattern (inner intersections)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + Math.PI / 6; // 30 degrees offset
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      circles.push(
        <circle
          key={`seed-${i}`}
          cx={x}
          cy={y}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.5}
          fill="none"
          className="sacred-geometry-grid seed-pattern"
        />
      );
    }

    return circles;
  }, [config.opacity, scale, offsetX, offsetY, strokeColor, strokeWidth]);

  return <g data-export-hide="false" className="flower-of-life-grid">{flowerPattern}</g>;
});

FlowerOfLifeGrid.displayName = 'FlowerOfLifeGrid';

// Diamond Scale Grid Component
const DiamondScaleGrid = React.memo(({ config, viewportBounds, scale, offsetX, offsetY }: Omit<SacredGeometryGridProps, 'type'>) => {
  const diamondSize = 40; // Base size for diamonds
  const strokeColor = `hsla(0, 0%, 100%, ${config.opacity})`;
  const strokeWidth = 0.5 / scale;

  const diamondPattern = useMemo(() => {
    const diamonds = [];
    const centerX = -offsetX / scale;
    const centerY = -offsetY / scale;

    // Calculate grid bounds
    const startX = Math.floor((viewportBounds.minX - centerX) / diamondSize) * diamondSize;
    const endX = Math.ceil((viewportBounds.maxX - centerX) / diamondSize) * diamondSize;
    const startY = Math.floor((viewportBounds.minY - centerY) / diamondSize) * diamondSize;
    const endY = Math.ceil((viewportBounds.maxY - centerY) / diamondSize) * diamondSize;

    // Create diamond pattern
    for (let x = startX; x <= endX; x += diamondSize) {
      for (let y = startY; y <= endY; y += diamondSize) {
        const diamondX = centerX + x;
        const diamondY = centerY + y;

        // Main diamond
        const points = [
          `${diamondX},${diamondY - diamondSize/2}`, // top
          `${diamondX + diamondSize/2},${diamondY}`, // right
          `${diamondX},${diamondY + diamondSize/2}`, // bottom
          `${diamondX - diamondSize/2},${diamondY}`, // left
        ].join(' ');

        diamonds.push(
          <polygon
            key={`diamond-${x}-${y}`}
            points={points}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            className="sacred-geometry-grid"
          />
        );

        // Inner diamond (smaller)
        const innerSize = diamondSize * 0.6;
        const innerPoints = [
          `${diamondX},${diamondY - innerSize/2}`,
          `${diamondX + innerSize/2},${diamondY}`,
          `${diamondX},${diamondY + innerSize/2}`,
          `${diamondX - innerSize/2},${diamondY}`,
        ].join(' ');

        diamonds.push(
          <polygon
            key={`inner-diamond-${x}-${y}`}
            points={innerPoints}
            stroke={strokeColor}
            strokeWidth={strokeWidth * 0.5}
            fill="none"
            className="sacred-geometry-grid inner-pattern"
          />
        );

        // Center dot
        diamonds.push(
          <circle
            key={`center-dot-${x}-${y}`}
            cx={diamondX}
            cy={diamondY}
            r={1 / scale}
            fill={strokeColor}
            className="sacred-geometry-grid center-dot"
          />
        );
      }
    }

    // Add diagonal lines for enhanced pattern
    for (let x = startX; x <= endX; x += diamondSize) {
      for (let y = startY; y <= endY; y += diamondSize) {
        const diamondX = centerX + x;
        const diamondY = centerY + y;

        // Diagonal lines
        diamonds.push(
          <line
            key={`diagonal-1-${x}-${y}`}
            x1={diamondX - diamondSize/2}
            y1={diamondY - diamondSize/2}
            x2={diamondX + diamondSize/2}
            y2={diamondY + diamondSize/2}
            stroke={strokeColor}
            strokeWidth={strokeWidth * 0.3}
            className="sacred-geometry-grid diagonal-line"
          />
        );

        diamonds.push(
          <line
            key={`diagonal-2-${x}-${y}`}
            x1={diamondX + diamondSize/2}
            y1={diamondY - diamondSize/2}
            x2={diamondX - diamondSize/2}
            y2={diamondY + diamondSize/2}
            stroke={strokeColor}
            strokeWidth={strokeWidth * 0.3}
            className="sacred-geometry-grid diagonal-line"
          />
        );
      }
    }

    return diamonds;
  }, [config.opacity, scale, offsetX, offsetY, viewportBounds, strokeColor, strokeWidth]);

  return <g data-export-hide="false" className="diamond-scale-grid">{diamondPattern}</g>;
});

DiamondScaleGrid.displayName = 'DiamondScaleGrid';

// Main Sacred Geometry Grid Component
export const SacredGeometryGrid = React.memo(({ type, config, viewportBounds, scale, offsetX, offsetY }: SacredGeometryGridProps) => {
  if (type === 'flower-of-life') {
    return (
      <FlowerOfLifeGrid
        config={config}
        viewportBounds={viewportBounds}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
      />
    );
  }

  if (type === 'diamond-scale') {
    return (
      <DiamondScaleGrid
        config={config}
        viewportBounds={viewportBounds}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
      />
    );
  }

  return null;
});

SacredGeometryGrid.displayName = 'SacredGeometryGrid';

// Grid snapping utility functions
export const snapToSacredGeometry = (
  point: { x: number; y: number },
  type: GridType,
  config: GridConfig,
  offsetX: number,
  offsetY: number
): { x: number; y: number } => {
  if (!config.snapToGrid) return point;

  const centerX = -offsetX / config.scale;
  const centerY = -offsetY / config.scale;

  if (type === 'flower-of-life') {
    const radius = 50;
    const threshold = config.snapThreshold / config.scale;

    // Snap to circle intersections
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const circleX = centerX + radius * Math.cos(angle);
      const circleY = centerY + radius * Math.sin(angle);

      const distance = Math.sqrt((point.x - circleX) ** 2 + (point.y - circleY) ** 2);
      if (distance < threshold) {
        return { x: circleX, y: circleY };
      }
    }

    // Snap to center
    const centerDistance = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2);
    if (centerDistance < threshold) {
      return { x: centerX, y: centerY };
    }
  }

  if (type === 'diamond-scale') {
    const diamondSize = 40;
    const threshold = config.snapThreshold / config.scale;

    // Snap to diamond centers
    const gridX = Math.round((point.x - centerX) / diamondSize) * diamondSize + centerX;
    const gridY = Math.round((point.y - centerY) / diamondSize) * diamondSize + centerY;

    const distance = Math.sqrt((point.x - gridX) ** 2 + (point.y - gridY) ** 2);
    if (distance < threshold) {
      return { x: gridX, y: gridY };
    }
  }

  return point;
};

// Grid guide lines for enhanced drawing assistance
export const getSacredGeometryGuides = (
  point: { x: number; y: number },
  type: GridType,
  config: GridConfig,
  offsetX: number,
  offsetY: number
): Array<{ x1: number; y1: number; x2: number; y2: number }> => {
  if (!config.showGuides) return [];

  const guides = [];
  const centerX = -offsetX / config.scale;
  const centerY = -offsetY / config.scale;

  if (type === 'flower-of-life') {
    const radius = 50;
    const threshold = config.snapThreshold / config.scale;

    // Guide lines from center to nearby circles
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const circleX = centerX + radius * Math.cos(angle);
      const circleY = centerY + radius * Math.sin(angle);

      const distance = Math.sqrt((point.x - circleX) ** 2 + (point.y - circleY) ** 2);
      if (distance < threshold * 2) {
        guides.push({
          x1: centerX,
          y1: centerY,
          x2: circleX,
          y2: circleY,
        });
      }
    }
  }

  if (type === 'diamond-scale') {
    const diamondSize = 40;
    const threshold = config.snapThreshold / config.scale;

    // Guide lines to nearby diamond centers
    const nearbyCenters = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const gridX = centerX + dx * diamondSize;
        const gridY = centerY + dy * diamondSize;
        const distance = Math.sqrt((point.x - gridX) ** 2 + (point.y - gridY) ** 2);
        
        if (distance < threshold * 2) {
          nearbyCenters.push({ x: gridX, y: gridY });
        }
      }
    }

    // Add guide lines to nearby centers
    nearbyCenters.forEach(center => {
      guides.push({
        x1: point.x,
        y1: point.y,
        x2: center.x,
        y2: center.y,
      });
    });
  }

  return guides;
};