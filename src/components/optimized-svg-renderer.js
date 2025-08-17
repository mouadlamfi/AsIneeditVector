import React, { useMemo, useCallback } from 'react';

// Memoized Path component for individual paths
const MemoizedPath = React.memo(({ 
  points, 
  strokeWidth, 
  color, 
  isActive 
}) => {
  const pathData = useMemo(() => {
    if (points.length === 0) return '';
    
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const prevPoint = points[i - 1];
      
      if (prevPoint.break) {
        d += ` M ${point.x} ${point.y}`;
      } else {
        d += ` L ${point.x} ${point.y}`;
      }
    }
    
    return d;
  }, [points]);

  if (!pathData) return null;

  return (
    <path
      d={pathData}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={isActive ? 1 : 0.7}
      style={{
        vectorEffect: 'non-scaling-stroke'
      }}
    />
  );
});

MemoizedPath.displayName = 'MemoizedPath';

// Memoized Points component for individual points
const MemoizedPoints = React.memo(({ 
  points, 
  pointRadius, 
  color, 
  layerId, 
  isActive,
  onPointClick,
  viewportBounds
}) => {
  // Only render points that are visible in the viewport
  const visiblePoints = useMemo(() => {
    return points.filter((point, index) => 
      point.x >= viewportBounds.minX - pointRadius &&
      point.x <= viewportBounds.maxX + pointRadius &&
      point.y >= viewportBounds.minY - pointRadius &&
      point.y <= viewportBounds.maxY + pointRadius
    ).map((point, filteredIndex) => {
      const originalIndex = points.indexOf(point);
      return { point, originalIndex };
    });
  }, [points, pointRadius, viewportBounds]);

  return (
    <>
      {visiblePoints.map(({ point, originalIndex }) => (
        <circle
          key={originalIndex}
          cx={point.x}
          cy={point.y}
          r={pointRadius}
          fill={color}
          stroke="#ffffff"
          strokeWidth={1}
          opacity={isActive ? 1 : 0.6}
          style={{ cursor: 'pointer' }}
          onClick={onPointClick ? () => onPointClick(layerId, originalIndex) : undefined}
        />
      ))}
    </>
  );
});

MemoizedPoints.displayName = 'MemoizedPoints';

// Memoized Layer component
const MemoizedLayer = React.memo(({ 
  layer, 
  isActive,
  viewportBounds,
  onPointClick
}) => {
  // Check if layer is visible in viewport
  const isLayerVisible = useMemo(() => {
    if (layer.points.length === 0) return false;
    
    const bounds = layer.points.reduce(
      (acc, point) => ({
        minX: Math.min(acc.minX, point.x),
        minY: Math.min(acc.minY, point.y),
        maxX: Math.max(acc.maxX, point.x),
        maxY: Math.max(acc.maxY, point.y),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    return !(
      bounds.maxX < viewportBounds.minX ||
      bounds.minX > viewportBounds.maxX ||
      bounds.maxY < viewportBounds.minY ||
      bounds.minY > viewportBounds.maxY
    );
  }, [layer.points, viewportBounds]);

  if (!isLayerVisible) return null;

  return (
    <g data-layer-id={layer.id}>
      {/* Background Image */}
      {layer.backgroundImage && (
        <image
          href={layer.backgroundImage}
          x={layer.imageX || 0}
          y={layer.imageY || 0}
          width={layer.imageWidth || 100}
          height={layer.imageHeight || 100}
          transform={`rotate(${layer.imageRotation || 0} ${(layer.imageX || 0) + (layer.imageWidth || 100) / 2} ${(layer.imageY || 0) + (layer.imageHeight || 100) / 2})`}
          opacity={0.7}
        />
      )}
      
      {/* Path */}
      <MemoizedPath
        points={layer.points}
        strokeWidth={layer.strokeWidth}
        color={layer.color}
        isActive={isActive}
      />
      
      {/* Points */}
      <MemoizedPoints
        points={layer.points}
        pointRadius={layer.pointRadius}
        color={layer.color}
        layerId={layer.id}
        isActive={isActive}
        onPointClick={onPointClick}
        viewportBounds={viewportBounds}
      />
    </g>
  );
});

MemoizedLayer.displayName = 'MemoizedLayer';

export const OptimizedSVGRenderer = ({
  layers,
  activeLayerId,
  scale,
  viewportBounds,
  onPointClick
}) => {
  // Only render layers that have content and are potentially visible
  const visibleLayers = useMemo(() => {
    return layers.filter(layer => layer.points.length > 0);
  }, [layers]);

  return (
    <>
      {visibleLayers.map(layer => (
        <MemoizedLayer
          key={layer.id}
          layer={layer}
          isActive={layer.id === activeLayerId}
          viewportBounds={viewportBounds}
          onPointClick={onPointClick}
        />
      ))}
    </>
  );
};