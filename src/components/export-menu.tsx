"use client";

import { useState } from 'react';
import { Download, FileText, Image, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDesign } from '@/context/design-context';
import type { Point } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Lazy load heavy dependencies
const lazyLoadPdf = () => import('jspdf');
const lazyLoadHtml2Canvas = () => import('html2canvas');

function ExportMenu() {
  const [isExporting, setIsExporting] = useState(false);
  const { layers, scale, gridUnit, getCanvasAsSvg, measurement } = useDesign();

  const addWatermark = (container: HTMLElement) => {
    const watermark = document.createElement('div');
    watermark.innerText = 'by AsIneedit.com';
    watermark.style.position = 'absolute';
    watermark.style.bottom = '10px';
    watermark.style.right = '10px';
    watermark.style.color = 'rgba(255, 255, 255, 0.7)';
    watermark.style.fontSize = '12px';
    watermark.style.pointerEvents = 'none';
    watermark.style.zIndex = '1000';
    watermark.id = 'watermark';
    container.appendChild(watermark);
    return watermark;
  };

  // Calculate measurement for any two points
  const calculateMeasurement = (p1: Point, p2: Point): { angle: number, length: number } => {
    const deltaY = p2.y - p1.y;
    const deltaX = p2.x - p1.x;
    
    // Calculate Angle
    let angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angleInDegrees = (angleInDegrees + 360) % 360;
    
    // Calculate Length
    const lengthInPixels = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const GRID_UNITS_IN_PIXELS = {
      inch: 96,
      cm: 37.795,
    };
    const lengthInUnits = lengthInPixels / GRID_UNITS_IN_PIXELS[gridUnit];

    return { angle: angleInDegrees, length: lengthInUnits };
  };

  // Create enhanced SVG with all measurements
  const createEnhancedSVG = () => {
    const svgElement = document.querySelector('#design-canvas-svg') as SVGSVGElement;
    if (!svgElement) return null;

    // Clone the SVG with all its content
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Remove preview elements
    clone.querySelector('g[data-preview-group]')?.remove();
    
    // Show all elements that should be exported
    clone.querySelectorAll('[data-export-hide="false"]').forEach(el => {
      (el as HTMLElement).classList.remove('hidden');
    });

    // Set proper dimensions - use the original canvas dimensions
    clone.setAttribute('width', '2000');
    clone.setAttribute('height', '2000');
    clone.setAttribute('viewBox', '0 0 2000 2000');
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    return clone;
  };

  const exportAsSVG = async () => {
    const svg = createEnhancedSVG();
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsPNG = async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await lazyLoadHtml2Canvas()).default;
      const canvas = document.querySelector('#design-canvas-svg') as HTMLElement;
      if (!canvas) return;

      const watermark = addWatermark(canvas);
      
      const result = await html2canvas(canvas, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
      });

      canvas.removeChild(watermark);

      const link = document.createElement('a');
      link.download = 'design.png';
      link.href = result.toDataURL();
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const [jsPDF, html2canvas] = await Promise.all([
        lazyLoadPdf(),
        lazyLoadHtml2Canvas()
      ]);
      
      const Pdf = jsPDF.default;
      const canvas = document.querySelector('#design-canvas-svg') as HTMLElement;
      if (!canvas) return;

      const watermark = addWatermark(canvas);
      
      const result = await html2canvas.default(canvas, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
      });

      canvas.removeChild(watermark);

      const imgData = result.toDataURL('image/png');
      const pdf = new Pdf('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (result.height * imgWidth) / result.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('design.pdf');
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const shareDesign = async () => {
    try {
      const svg = createEnhancedSVG();
      if (!svg) return;

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      
      if (navigator.share) {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const file = new File([blob], 'design.svg', { type: 'image/svg+xml' });
        
        await navigator.share({
          title: 'My Design',
          text: 'Check out this design I created!',
          files: [file]
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(svgString);
        alert('Design copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          Export
          {isExporting && <span className="ml-2">...</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportAsSVG} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Export as SVG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPNG} disabled={isExporting}>
          <Image className="h-4 w-4 mr-2" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPDF} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={shareDesign} disabled={isExporting}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Design
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportMenu;