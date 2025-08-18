
"use client";

import { DesignProvider } from '@/context/design-context';
import { GarmentCanvas } from '@/components/garment-canvas';
import { PenTool, Download, Settings, HelpCircle, Zap, Layers, Palette, Ruler } from 'lucide-react';
import { DrawingToolbar } from '@/components/drawing-toolbar';
import { LayersPanel } from '@/components/layers-panel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useRef } from 'react';
import { useDesign } from '@/context/design-context';
import type { Point } from '@/lib/types';
import { ExportMenu } from '@/components/export-menu';

function addWatermark(container: HTMLElement) {
  const watermark = document.createElement('div');
  watermark.innerText = 'by AsIneedit.com';
  watermark.style.position = 'absolute';
  watermark.style.bottom = '10px';
  watermark.style.right = '10px';
  watermark.style.color = 'rgba(0, 0, 0, 0.5)';
  watermark.style.fontSize = '12px';
  watermark.style.pointerEvents = 'none';
  watermark.id = 'watermark';
  container.appendChild(watermark);
  return watermark;
}

function EnhancedExportMenu() {
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

    // Add metadata
    const metadata = document.createElementNS('http://www.w3.org/2000/svg', 'metadata');
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = 'As I need It Draw - Design Export';
    metadata.appendChild(title);
    clone.insertBefore(metadata, clone.firstChild);

    // Add measurement group for all segments
    const measurementGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    measurementGroup.setAttribute('id', 'measurements-export');
    measurementGroup.setAttribute('data-export-hide', 'false');

    // Calculate and add measurements for all layers
    layers.forEach(layer => {
      if (layer.points.length < 2) return;

      for (let i = 0; i < layer.points.length - 1; i++) {
        const p1 = layer.points[i];
        const p2 = layer.points[i + 1];
        
        // Skip if there's a break between points
        if (p1.break) continue;

        const { angle, length } = calculateMeasurement(p1, p2);
        const angleText = `${angle.toFixed(1)}°`;
        const lengthText = `${length.toFixed(2)} ${gridUnit}`;
        
        // Create measurement display
        const measurementElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        measurementElement.setAttribute('transform', `translate(${p2.x} ${p2.y})`);
        
        // Background rectangle
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', '10');
        bgRect.setAttribute('y', '-25');
        bgRect.setAttribute('width', Math.max(angleText.length * 8, lengthText.length * 8).toString());
        bgRect.setAttribute('height', '25');
        bgRect.setAttribute('fill', 'rgba(26, 26, 26, 0.8)');
        bgRect.setAttribute('rx', '4');
        measurementElement.appendChild(bgRect);
        
        // Length text
        const lengthTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lengthTextElement.setAttribute('x', '15');
        lengthTextElement.setAttribute('y', '-15');
        lengthTextElement.setAttribute('font-size', '12');
        lengthTextElement.setAttribute('fill', '#ffffff');
        lengthTextElement.setAttribute('text-anchor', 'start');
        lengthTextElement.setAttribute('font-weight', '500');
        lengthTextElement.textContent = lengthText;
        measurementElement.appendChild(lengthTextElement);
        
        // Angle text
        const angleTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        angleTextElement.setAttribute('x', '15');
        angleTextElement.setAttribute('y', '-2');
        angleTextElement.setAttribute('font-size', '12');
        angleTextElement.setAttribute('fill', '#a1a1aa');
        angleTextElement.setAttribute('text-anchor', 'start');
        angleTextElement.setAttribute('font-weight', '500');
        angleTextElement.textContent = angleText;
        measurementElement.appendChild(angleTextElement);
        
        measurementGroup.appendChild(measurementElement);
      }

      // Handle closing segment if the shape is closed
      if (layer.points.length > 2 && !layer.points[layer.points.length - 1].break) {
        const p1 = layer.points[layer.points.length - 1];
        const p2 = layer.points[0];
        
        const { angle, length } = calculateMeasurement(p1, p2);
        const angleText = `${angle.toFixed(1)}°`;
        const lengthText = `${length.toFixed(2)} ${gridUnit}`;
        
        const measurementElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        measurementElement.setAttribute('transform', `translate(${p2.x} ${p2.y})`);
        
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', '10');
        bgRect.setAttribute('y', '-25');
        bgRect.setAttribute('width', Math.max(angleText.length * 8, lengthText.length * 8).toString());
        bgRect.setAttribute('height', '25');
        bgRect.setAttribute('fill', 'rgba(26, 26, 26, 0.8)');
        bgRect.setAttribute('rx', '4');
        measurementElement.appendChild(bgRect);
        
        const lengthTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lengthTextElement.setAttribute('x', '15');
        lengthTextElement.setAttribute('y', '-15');
        lengthTextElement.setAttribute('font-size', '12');
        lengthTextElement.setAttribute('fill', '#ffffff');
        lengthTextElement.setAttribute('text-anchor', 'start');
        lengthTextElement.setAttribute('font-weight', '500');
        lengthTextElement.textContent = lengthText;
        measurementElement.appendChild(lengthTextElement);
        
        const angleTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        angleTextElement.setAttribute('x', '15');
        angleTextElement.setAttribute('y', '-2');
        angleTextElement.setAttribute('font-size', '12');
        angleTextElement.setAttribute('fill', '#a1a1aa');
        angleTextElement.setAttribute('text-anchor', 'start');
        angleTextElement.setAttribute('font-weight', '500');
        angleTextElement.textContent = angleText;
        measurementElement.appendChild(angleTextElement);
        
        measurementGroup.appendChild(measurementElement);
      }
    });

    // Add the measurement group to the SVG
    clone.appendChild(measurementGroup);

    return clone;
  };

  const exportDesign = async (format: 'png' | 'pdf' | 'svg') => {
    setIsExporting(true);
    
    try {
      if (format === 'svg') {
        // For SVG, create enhanced export with all measurements
        const enhancedSvg = createEnhancedSVG();
        if (enhancedSvg) {
          const svgString = new XMLSerializer().serializeToString(enhancedSvg);
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `design-${new Date().toISOString().split('T')[0]}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // For PNG and PDF, capture the actual canvas area with measurements
        const canvasContainer = document.querySelector('#canvas-container') as HTMLElement;
        const svgElement = document.querySelector('#design-canvas-svg') as SVGSVGElement;
        
        if (!canvasContainer || !svgElement) {
          console.error('Canvas elements not found');
          setIsExporting(false);
          return;
        }

        // Create a clean export container
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = '-9999px';
        exportContainer.style.width = '1200px';
        exportContainer.style.height = '800px';
        exportContainer.style.backgroundColor = '#1a1a1a';
        exportContainer.style.overflow = 'hidden';
        exportContainer.id = 'export-container';
        
        document.body.appendChild(exportContainer);

        try {
          // Clone the SVG with all content
          const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
          
          // Remove preview elements
          svgClone.querySelector('g[data-preview-group]')?.remove();
          
          // Show all elements that should be exported
          svgClone.querySelectorAll('[data-export-hide="false"]').forEach(el => {
            (el as HTMLElement).classList.remove('hidden');
          });

          // Set SVG dimensions
          svgClone.setAttribute('width', '1200');
          svgClone.setAttribute('height', '800');
          svgClone.setAttribute('viewBox', '0 0 1200 800');
          svgClone.style.position = 'absolute';
          svgClone.style.top = '0';
          svgClone.style.left = '0';
          svgClone.style.width = '100%';
          svgClone.style.height = '100%';
          
          exportContainer.appendChild(svgClone);

          // Add measurement elements to the SVG clone
          const measurementGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          measurementGroup.setAttribute('id', 'temp-measurements-export');
          measurementGroup.setAttribute('data-export-hide', 'false');

          // Calculate and add measurements for all layers
          layers.forEach(layer => {
            if (layer.points.length < 2) return;

            for (let i = 0; i < layer.points.length - 1; i++) {
              const p1 = layer.points[i];
              const p2 = layer.points[i + 1];
              
              // Skip if there's a break between points
              if (p1.break) continue;

              const { angle, length } = calculateMeasurement(p1, p2);
              const angleText = `${angle.toFixed(1)}°`;
              const lengthText = `${length.toFixed(2)} ${gridUnit}`;
              
              // Create measurement display
              const measurementElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              measurementElement.setAttribute('transform', `translate(${p2.x} ${p2.y})`);
              
              // Background rectangle
              const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              bgRect.setAttribute('x', '10');
              bgRect.setAttribute('y', '-25');
              bgRect.setAttribute('width', Math.max(angleText.length * 8, lengthText.length * 8).toString());
              bgRect.setAttribute('height', '25');
              bgRect.setAttribute('fill', 'rgba(26, 26, 26, 0.8)');
              bgRect.setAttribute('rx', '4');
              measurementElement.appendChild(bgRect);
              
              // Length text
              const lengthTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              lengthTextElement.setAttribute('x', '15');
              lengthTextElement.setAttribute('y', '-15');
              lengthTextElement.setAttribute('font-size', '12');
              lengthTextElement.setAttribute('fill', '#ffffff');
              lengthTextElement.setAttribute('text-anchor', 'start');
              lengthTextElement.setAttribute('font-weight', '500');
              lengthTextElement.textContent = lengthText;
              measurementElement.appendChild(lengthTextElement);
              
              // Angle text
              const angleTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              angleTextElement.setAttribute('x', '15');
              angleTextElement.setAttribute('y', '-2');
              angleTextElement.setAttribute('font-size', '12');
              angleTextElement.setAttribute('fill', '#a1a1aa');
              angleTextElement.setAttribute('text-anchor', 'start');
              angleTextElement.setAttribute('font-weight', '500');
              angleTextElement.textContent = angleText;
              measurementElement.appendChild(angleTextElement);
              
              measurementGroup.appendChild(measurementElement);
            }

            // Handle closing segment if the shape is closed
            if (layer.points.length > 2 && !layer.points[layer.points.length - 1].break) {
              const p1 = layer.points[layer.points.length - 1];
              const p2 = layer.points[0];
              
              const { angle, length } = calculateMeasurement(p1, p2);
              const angleText = `${angle.toFixed(1)}°`;
              const lengthText = `${length.toFixed(2)} ${gridUnit}`;
              
              const measurementElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              measurementElement.setAttribute('transform', `translate(${p2.x} ${p2.y})`);
              
              const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              bgRect.setAttribute('x', '10');
              bgRect.setAttribute('y', '-25');
              bgRect.setAttribute('width', Math.max(angleText.length * 8, lengthText.length * 8).toString());
              bgRect.setAttribute('height', '25');
              bgRect.setAttribute('fill', 'rgba(26, 26, 26, 0.8)');
              bgRect.setAttribute('rx', '4');
              measurementElement.appendChild(bgRect);
              
              const lengthTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              lengthTextElement.setAttribute('x', '15');
              lengthTextElement.setAttribute('y', '-15');
              lengthTextElement.setAttribute('font-size', '12');
              lengthTextElement.setAttribute('fill', '#ffffff');
              lengthTextElement.setAttribute('text-anchor', 'start');
              lengthTextElement.setAttribute('font-weight', '500');
              lengthTextElement.textContent = lengthText;
              measurementElement.appendChild(lengthTextElement);
              
              const angleTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              angleTextElement.setAttribute('x', '15');
              angleTextElement.setAttribute('y', '-2');
              angleTextElement.setAttribute('font-size', '12');
              angleTextElement.setAttribute('fill', '#a1a1aa');
              angleTextElement.setAttribute('text-anchor', 'start');
              angleTextElement.setAttribute('font-weight', '500');
              angleTextElement.textContent = angleText;
              measurementElement.appendChild(angleTextElement);
              
              measurementGroup.appendChild(measurementElement);
            }
          });

          // Add the measurement group to the SVG clone
          svgClone.appendChild(measurementGroup);

          // Add background images
          layers.forEach(layer => {
            if (layer.backgroundImage && layer.imageX && layer.imageY) {
              const img = document.createElement('img');
              img.src = layer.backgroundImage;
              img.style.position = 'absolute';
              img.style.width = `${layer.imageWidth || 100}px`;
              img.style.height = `${layer.imageHeight || 100}px`;
              img.style.transform = `
                translate(-50%, -50%) 
                translate(${layer.imageX}px, ${layer.imageY}px) 
                rotate(${layer.imageRotation || 0}deg)
              `;
              img.style.transformOrigin = 'top left';
              img.style.pointerEvents = 'none';
              img.style.objectFit = 'contain';
              img.style.zIndex = '1';
              exportContainer.appendChild(img);
            }
          });

          // Add watermark
          const watermark = addWatermark(exportContainer);

          // Wait for images and SVG to load
          await new Promise(resolve => setTimeout(resolve, 1500));

          try {
            // Lazy load html2canvas
            const { default: html2canvas } = await import('html2canvas');
            
            // Capture the clean export container
            const canvas = await html2canvas(exportContainer, {
              backgroundColor: '#1a1a1a',
              logging: false,
              useCORS: true,
              scale: 2, // Higher resolution
              allowTaint: true,
              foreignObjectRendering: true,
              width: 1200,
              height: 800,
              onclone: (doc) => {
                const clonedContainer = doc.querySelector('#export-container') as HTMLElement;
                if (clonedContainer) {
                  clonedContainer.style.transform = 'scale(1)';
                  clonedContainer.style.transformOrigin = 'top left';
                }
              }
            });

            if (format === 'png') {
              const a = document.createElement('a');
              a.href = canvas.toDataURL('image/png', 1.0);
              a.download = `design-${new Date().toISOString().split('T')[0]}.png`;
              a.click();
            } else if (format === 'pdf') {
              const imgData = canvas.toDataURL('image/png', 1.0);
              
              // Calculate PDF dimensions to preserve aspect ratio
              const imgAspectRatio = canvas.width / canvas.height;
              let pdfWidth, pdfHeight;
              
              if (imgAspectRatio > 1) {
                // Landscape
                pdfWidth = 297; // A4 width in mm
                pdfHeight = 297 / imgAspectRatio;
              } else {
                // Portrait
                pdfHeight = 210; // A4 height in mm
                pdfWidth = 210 * imgAspectRatio;
              }
              
              // Lazy load jsPDF
              const { default: jsPDF } = await import('jspdf');
              const pdf = new jsPDF({
                orientation: imgAspectRatio > 1 ? 'landscape' : 'portrait',
                unit: 'mm',
                format: 'a4'
              });
              
              // Center the image on the page
              const pageWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();
              const x = (pageWidth - pdfWidth) / 2;
              const y = (pageHeight - pdfHeight) / 2;
              
              pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
              
              // Add design information
              pdf.setFontSize(10);
              pdf.setTextColor(100, 100, 100);
              pdf.text(`Design exported on ${new Date().toLocaleDateString()}`, 10, pageHeight - 10);
              pdf.text(`Grid Unit: ${gridUnit}`, 10, pageHeight - 20);
              pdf.text(`Scale: ${Math.round(scale * 100)}%`, 10, pageHeight - 30);
              
              pdf.save(`design-${new Date().toISOString().split('T')[0]}.pdf`);
            }

            // Clean up
            exportContainer.removeChild(watermark);
          } catch (error) {
            console.error('Canvas capture failed:', error);
            // Clean up on error
            if (exportContainer.contains(watermark)) {
              exportContainer.removeChild(watermark);
            }
          }
        } finally {
          // Always clean up the export container
          document.body.removeChild(exportContainer);
        }
      }

      setIsExporting(false);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="btn-animate" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 animate-scale-in">
        <DropdownMenuItem onClick={() => exportDesign('png')} className="cursor-pointer">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            Export as PNG
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportDesign('pdf')} className="cursor-pointer">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            Export as PDF
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => exportDesign('svg')} className="cursor-pointer">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            Export as SVG
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Ready</span>
      </div>
      <Separator orientation="vertical" className="h-3" />
      <span>Click: Add Point</span>
      <Separator orientation="vertical" className="h-3" />
      <span>Double Click: New Line</span>
      <Separator orientation="vertical" className="h-3" />
      <span>Right Click: Undo</span>
      <Separator orientation="vertical" className="h-3" />
      <span>Middle Click: New Line</span>
    </div>
  );
}

export default function Home() {
  const [menusVisible, setMenusVisible] = useState(false);
  const [symmetryEnabled, setSymmetryEnabled] = useState(false);
  return (
    <DesignProvider>
      <TooltipProvider>
        <div className="flex h-screen w-full flex-col font-body bg-background text-foreground overflow-hidden">
          {/* Enhanced Header */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card/80 backdrop-blur-sm px-6 shadow-sm glass">
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-3 cursor-pointer" 
                onClick={() => setMenusVisible(!menusVisible)}
                data-ai-hint="Click to show/hide drawing tools"
              >
                <div className={`p-2 rounded-lg bg-primary/10 border border-primary/20 transition-transform duration-300 ${menusVisible ? '' : 'rotate-180'}`}>
                  <PenTool className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold font-headline text-gradient">
                    As I need It Draw
                  </h1>
                  <p className="text-xs text-muted-foreground">Professional Design Studio</p>
                </div>
              </div>
            </div>
            
            {/* This div contains the elements to be hidden */}
            <div className={`flex items-center gap-4 transition-all duration-300 ${menusVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <StatusIndicator />
 <Separator orientation="vertical" className="h-6" />
              {/* This div contains the icons and Export button */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
 <HelpCircle className={`h-4 w-4 ${menusVisible ? '' : 'pointer-events-none'}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Help & Documentation</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
 <Settings className={`h-4 w-4 ${menusVisible ? '' : 'pointer-events-none'}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
                
                <ExportMenu />
              </div>
            </div>
          </header>

          {/* Enhanced Main Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Enhanced Sidebar */}
            <aside className={`shrink-0 sidebar-enhanced p-6 flex flex-col gap-6 overflow-y-auto panel-transition ${menusVisible ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
              <div className="space-y-6">
                {/* Tools Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Drawing Tools</h2>
                  </div>
                  <DrawingToolbar />
                </div>
                
                <Separator />
                
                {/* Layers Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Layers</h2>
                  </div>
                  <LayersPanel />
                </div>
              </div>
            </aside>

            {/* Enhanced Main Canvas Area */}
            <main className="flex-1 overflow-auto canvas-enhanced">
              <GarmentCanvas />
            </main>
          </div>
        </div>
      </TooltipProvider>
    </DesignProvider>
  );
}

    