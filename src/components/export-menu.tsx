"use client";

import React, { useState } from 'react';
import { useDesign } from '@/context/design-context';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Download, FileText, Image, FileImage, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export function ExportMenu() {
  const { layers, scale, gridUnit, getCanvasAsSvg } = useDesign();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    includeBackground: true,
    includeGrid: true,
    includeMeasurements: true,
    quality: 2,
    format: 'svg' as 'svg' | 'png' | 'pdf' | 'jpg'
  });

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

  const createEnhancedSVG = () => {
    const svgElement = document.querySelector('#design-canvas-svg') as SVGSVGElement;
    if (!svgElement) return null;

    // Clone the SVG with all content
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Remove preview elements
    clone.querySelector('g[data-preview-group]')?.remove();
    
    // Show all elements that should be exported
    clone.querySelectorAll('[data-export-hide="false"]').forEach(el => {
      (el as HTMLElement).classList.remove('hidden');
    });

    // Set proper dimensions
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

    // Add background if enabled
    if (exportSettings.includeBackground) {
      const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      background.setAttribute('width', '100%');
      background.setAttribute('height', '100%');
      background.setAttribute('fill', '#000000');
      clone.insertBefore(background, clone.firstChild);
    }

    // Add grid if enabled
    if (exportSettings.includeGrid) {
      const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      gridGroup.setAttribute('id', 'export-grid');
      gridGroup.setAttribute('data-export-hide', 'false');
      
      // Add Flower of Life grid elements here
      // This would include the grid circles and intersection points
      
      clone.appendChild(gridGroup);
    }

    return clone;
  };

  const exportDesign = async (format: 'png' | 'pdf' | 'svg' | 'jpg') => {
    setIsExporting(true);
    
    try {
      if (format === 'svg') {
        // For SVG, create enhanced export with all layers
        const enhancedSvg = createEnhancedSVG();
        if (enhancedSvg) {
          const svgString = new XMLSerializer().serializeToString(enhancedSvg);
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `asineedit-design-${new Date().toISOString().split('T')[0]}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // For raster formats, capture the canvas area
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
        exportContainer.style.backgroundColor = exportSettings.includeBackground ? '#000000' : 'transparent';
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

          // Add watermark
          const watermark = addWatermark(exportContainer);

          // Wait for images and SVG to load
          await new Promise(resolve => setTimeout(resolve, 1000));

          try {
            // Lazy load html2canvas
            const { default: html2canvas } = await import('html2canvas');
            
            // Capture the clean export container
            const canvas = await html2canvas(exportContainer, {
              backgroundColor: exportSettings.includeBackground ? '#000000' : 'transparent',
              logging: false,
              useCORS: true,
              scale: exportSettings.quality,
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

            if (format === 'png' || format === 'jpg') {
              const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
              const quality = format === 'jpg' ? 0.9 : 1.0;
              
              const a = document.createElement('a');
              a.href = canvas.toDataURL(mimeType, quality);
              a.download = `asineedit-design-${new Date().toISOString().split('T')[0]}.${format}`;
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
              pdf.text(`Layers: ${layers.length}`, 10, pageHeight - 40);
              
              pdf.save(`asineedit-design-${new Date().toISOString().split('T')[0]}.pdf`);
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
    <div className="space-y-4">
      {/* Export Settings */}
      <Card className="card-enhanced">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium">Export Settings</Label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="include-background">Include Background</Label>
              <Switch
                id="include-background"
                checked={exportSettings.includeBackground}
                onCheckedChange={(checked) => 
                  setExportSettings(prev => ({ ...prev, includeBackground: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="include-grid">Include Grid</Label>
              <Switch
                id="include-grid"
                checked={exportSettings.includeGrid}
                onCheckedChange={(checked) => 
                  setExportSettings(prev => ({ ...prev, includeGrid: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="include-measurements">Include Measurements</Label>
              <Switch
                id="include-measurements"
                checked={exportSettings.includeMeasurements}
                onCheckedChange={(checked) => 
                  setExportSettings(prev => ({ ...prev, includeMeasurements: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <Label htmlFor="export-quality">Quality</Label>
                <Badge variant="secondary" className="text-xs">
                  {exportSettings.quality}x
                </Badge>
              </div>
              <Slider
                id="export-quality"
                min={1}
                max={4}
                step={1}
                value={[exportSettings.quality]}
                onValueChange={(value) => 
                  setExportSettings(prev => ({ ...prev, quality: value[0] }))
                }
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="card-enhanced">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium">Export Format</Label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => exportDesign('svg')}
              disabled={isExporting}
            >
              <FileText className="h-4 w-4" />
              SVG
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => exportDesign('png')}
              disabled={isExporting}
            >
              <Image className="h-4 w-4" />
              PNG
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => exportDesign('pdf')}
              disabled={isExporting}
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => exportDesign('jpg')}
              disabled={isExporting}
            >
              <FileImage className="h-4 w-4" />
              JPG
            </Button>
          </div>

          {isExporting && (
            <div className="text-center text-sm text-muted-foreground">
              Exporting...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}