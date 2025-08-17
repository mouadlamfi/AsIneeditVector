"use client";

import React from 'react';
import { useDesign } from '@/context/design-context';
import { getMeasurements, formatDistance, formatAngle } from '@/lib/measurement-utils';
import { cn } from '@/lib/utils';

export function MeasurementDisplay({ className }) {
  const { layers, activeLayerId, gridUnit } = useDesign();
  
  const activeLayer = layers.find(l => l.id === activeLayerId);
  const points = activeLayer?.points || [];
  
  // Get measurements for all line segments
  const measurements = getMeasurements(points);
  
  if (measurements.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "fixed top-4 right-4 z-30 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg",
      "transition-all duration-200 ease-in-out",
      className
    )}>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground/80">Measurements</h3>
        
        {measurements.map((measurement, index) => (
          <div key={index} className="text-xs space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Segment {index + 1}:</span>
              <span className="font-mono text-foreground">
                {formatDistance(measurement.distance, gridUnit)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Angle:</span>
              <span className="font-mono text-foreground">
                {formatAngle(measurement.angle)}
              </span>
            </div>
            {index < measurements.length - 1 && (
              <div className="border-t border-border/50 my-2" />
            )}
          </div>
        ))}
        
        {measurements.length > 1 && (
          <>
            <div className="border-t border-border/50 my-2" />
            <div className="text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Total Length:</span>
                <span className="font-mono text-foreground font-medium">
                  {formatDistance(
                    measurements.reduce((sum, m) => sum + m.distance, 0),
                    gridUnit
                  )}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}