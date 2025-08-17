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
    format: 'svg'
  });

  const addWatermark = (container) => {
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
    const svgElement = document.querySelector('#design-canvas-svg');
    if (!svgElement) return null;

    // Clone the SVG with all content
    const clone = svgElement.cloneNode(true);
    
    // Remove preview elements
    clone.querySelector('g[data-preview-group]')?.remove();
    
    // Apply export settings filters
    if (!exportSettings.includeBackground) {
      // Remove Flower of Life grid
      clone.querySelector('.flower-of-life-grid')?.remove();
    }
    
    if (!exportSettings.includeGrid) {
      // Remove grid lines
      clone.querySelectorAll('.grid-enhanced').forEach(el => el.remove());
    }
    
    if (!exportSettings.includeMeasurements) {
      // Remove measurement elements
      clone.querySelectorAll('[data-measurement-group]').forEach(el => el.remove());
    }
    
    // Show all elements that should be exported
    clone.querySelectorAll('[data-export-hide="false"]').forEach(el => {
      el.classList.remove('hidden');
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

    return clone;
  };

  const exportDesign = async (format) => {
    setIsExporting(true);
    try {
      if (format === 'svg') {
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
        const canvasContainer = document.querySelector('#canvas-container');
        const svgElement = document.querySelector('#design-canvas-svg');
        if (!canvasContainer || !svgElement) {
          setIsExporting(false);
          return;
        }
        
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'absolute';
        exportContainer.style.top = '-9999px';
        exportContainer.style.left = '-9999px';
        exportContainer.style.width = '1200px';
        exportContainer.style.height = '800px';
        exportContainer.style.backgroundColor = '#000000';
        exportContainer.style.overflow = 'hidden';
        document.body.appendChild(exportContainer);
        
        try {
          const svgClone = svgElement.cloneNode(true);
          svgClone.querySelector('g[data-preview-group]')?.remove();
          
          // Apply export settings filters for raster
          if (!exportSettings.includeBackground) {
            svgClone.querySelector('.flower-of-life-grid')?.remove();
          }
          if (!exportSettings.includeGrid) {
            svgClone.querySelectorAll('.grid-enhanced').forEach(el => el.remove());
          }
          if (!exportSettings.includeMeasurements) {
            svgClone.querySelectorAll('[data-measurement-group]').forEach(el => el.remove());
          }
          
          svgClone.querySelectorAll('[data-export-hide="false"]').forEach(el => {
            el.classList.remove('hidden');
          });
          svgClone.setAttribute('width', '1200');
          svgClone.setAttribute('height', '800');
          svgClone.setAttribute('viewBox', '0 0 1200 800');
          svgClone.style.position = 'absolute';
          svgClone.style.top = '0';
          svgClone.style.left = '0';
          svgClone.style.width = '100%';
          svgClone.style.height = '100%';
          svgClone.style.pointerEvents = 'auto';
          exportContainer.appendChild(svgClone);
          
          const watermark = addWatermark(exportContainer);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(exportContainer, {
              backgroundColor: '#000000',
              scale: exportSettings.quality,
              useCORS: true,
              allowTaint: true,
              width: 1200,
              height: 800
            });
            
            if (format === 'png' || format === 'jpg') {
              const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
              const quality = format === 'png' ? 1.0 : 0.9;
              const a = document.createElement('a');
              a.href = canvas.toDataURL(mimeType, quality);
              a.download = `asineedit-design-${new Date().toISOString().split('T')[0]}.${format}`;
              a.click();
            } else if (format === 'pdf') {
              const imgData = canvas.toDataURL('image/png', 1.0);
              const imgWidth = 210;
              const pageHeight = 295;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              let heightLeft = imgHeight;
              let position = 0;
              
              const { default: jsPDF } = await import('jspdf');
              const pdf = new jsPDF('p', 'mm');
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
              
              while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
              }
              
              pdf.save(`asineedit-design-${new Date().toISOString().split('T')[0]}.pdf`);
            }
            
            exportContainer.removeChild(watermark);
          } catch (error) {
            console.error('Canvas capture failed:', error);
            if (exportContainer.contains(watermark)) {
              exportContainer.removeChild(watermark);
            }
          }
        } finally {
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Export Design</h3>
          <Badge variant="secondary">Ready</Badge>
        </div>

        {/* Export Settings */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Include Background</Label>
            <Switch
              checked={exportSettings.includeBackground}
              onCheckedChange={(checked) =>
                setExportSettings(prev => ({ ...prev, includeBackground: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm">Include Grid</Label>
            <Switch
              checked={exportSettings.includeGrid}
              onCheckedChange={(checked) =>
                setExportSettings(prev => ({ ...prev, includeGrid: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm">Include Measurements</Label>
            <Switch
              checked={exportSettings.includeMeasurements}
              onCheckedChange={(checked) =>
                setExportSettings(prev => ({ ...prev, includeMeasurements: checked }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Quality</Label>
            <Slider
              value={[exportSettings.quality]}
              onValueChange={(value) =>
                setExportSettings(prev => ({ ...prev, quality: value[0] }))
              }
              max={3}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              {exportSettings.quality === 1 ? 'Low' : 
               exportSettings.quality === 2 ? 'Medium' : 'High'}
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportDesign('svg')}
            disabled={isExporting}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            SVG
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportDesign('png')}
            disabled={isExporting}
            className="w-full"
          >
            <Image className="h-4 w-4 mr-2" />
            PNG
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportDesign('jpg')}
            disabled={isExporting}
            className="w-full"
          >
            <FileImage className="h-4 w-4 mr-2" />
            JPG
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportDesign('pdf')}
            disabled={isExporting}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}