import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useDesign } from '@/context/design-context';
import { usePDFExport } from '@/hooks/use-pdf-export';

function addWatermark(container) {
  const watermark = document.createElement('div');
  watermark.innerText = 'by AsIneedit.com';
  watermark.style.position = 'absolute';
  watermark.style.bottom = '10px';
  watermark.style.right = '10px';
  watermark.style.color = 'rgba(255, 255, 255, 0.7)';
  watermark.style.fontSize = '12px';
  watermark.style.pointerEvents = 'none';
  watermark.id = 'watermark';
  container.appendChild(watermark);
  return watermark;
}

export function ExportMenu() {
  const { layers, scale, gridUnit, getCanvasAsSvg, measurement } = useDesign();
  const { exportToPDF, isExporting } = usePDFExport();

  const exportSVG = (layerId) => {
    const svgData = getCanvasAsSvg(layerId);
    if (!svgData) return;

    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = layerId ? `layer-${layerId}.svg` : 'design.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPNG = async (layerId) => {
    try {
      // Lazy load html2canvas
      const { default: html2canvas } = await import('html2canvas');
      
      const canvas = document.querySelector('#design-canvas');
      if (!canvas) return;

      const canvasSnapshot = await html2canvas(canvas, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = layerId ? `layer-${layerId}.png` : 'design.png';
      link.href = canvasSnapshot.toDataURL();
      link.click();
    } catch (error) {
      console.error('PNG export failed:', error);
    }
  };

  const exportPDF = async () => {
    const canvas = document.querySelector('#design-canvas');
    if (!canvas) return;

    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.background = 'white';
    exportContainer.style.padding = '20px';
    document.body.appendChild(exportContainer);

    const canvasClone = canvas.cloneNode(true);
    exportContainer.appendChild(canvasClone);

    const watermark = addWatermark(exportContainer);

    try {
      await exportToPDF(exportContainer, { filename: 'design.pdf' });
    } finally {
      document.body.removeChild(exportContainer);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
          <Badge variant="secondary" className="ml-2">
            {layers.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => exportSVG()}>
          Export as SVG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportPNG()}>
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF} disabled={isExporting}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => exportSVG(layers[0]?.id)}>
          Export Active Layer (SVG)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}