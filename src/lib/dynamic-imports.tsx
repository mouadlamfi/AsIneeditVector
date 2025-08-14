import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import heavy components with loading fallbacks
export const DynamicGarmentCanvas = dynamic(
  () => import('@/components/garment-canvas').then(mod => ({ default: mod.GarmentCanvas })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false,
  }
);

export const DynamicLayersPanel = dynamic(
  () => import('@/components/layers-panel').then(mod => ({ default: mod.LayersPanel })),
  {
    loading: () => (
      <div className="animate-pulse bg-muted rounded-lg h-64"></div>
    ),
  }
);

export const DynamicDrawingToolbar = dynamic(
  () => import('@/components/drawing-toolbar').then(mod => ({ default: mod.DrawingToolbar })),
  {
    loading: () => (
      <div className="animate-pulse bg-muted rounded-lg h-16"></div>
    ),
  }
);

// Lazy load heavy libraries with proper async handling
export const DynamicJsPDF = async () => {
  const jsPDF = await import('jspdf');
  return jsPDF.default;
};

export const DynamicHtml2Canvas = async (options: any) => {
  const html2canvas = await import('html2canvas');
  return html2canvas.default(options);
};