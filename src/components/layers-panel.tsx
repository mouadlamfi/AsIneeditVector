
"use client";

import { useDesign } from '@/context/design-context';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Lock, PenLine, Plus, Trash2, Download, Image as ImageIcon, X, RefreshCw, Eye, EyeOff, Copy, Star, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import React from 'react';
// Lazy load heavy libraries
const loadExportLibraries = () => Promise.all([
  import('jspdf'),
  import('html2canvas')
]);
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import type { Layer } from '@/lib/types';

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

export function LayersPanel() {
  const { layers, activeLayerId, addLayer, removeLayer, setActiveLayer, updateActiveLayer, getCanvasAsSvg, updateLayerBackgroundImage, resetImageTransform } = useDesign();
  const [editingLayerId, setEditingLayerId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLayerNameEdit = (layerId: string, currentName: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer?.isLocked) return;
    setEditingLayerId(layerId);
    setEditingName(currentName);
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  }

  const handleNameSubmit = () => {
    if (editingLayerId && editingName.trim() !== '') {
        updateActiveLayer({ name: editingName.trim() });
    }
    setEditingLayerId(null);
    setEditingName('');
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditingLayerId(null);
      setEditingName('');
    }
  }

  const exportLayer = async (layer: Layer, format: 'png' | 'pdf') => {
    const svgString = getCanvasAsSvg(layer.id);
    if (!svgString) return;
  
    const canvasContainer = document.querySelector('#canvas-container');
    if (!canvasContainer) return;
  
    // Create a temporary element to render the layer's SVG for capture
    const tempSvgContainer = document.createElement('div');
    tempSvgContainer.style.position = 'absolute';
    tempSvgContainer.style.left = '-9999px'; // Position off-screen
    tempSvgContainer.style.width = `${canvasContainer.clientWidth}px`;
    tempSvgContainer.style.height = `${canvasContainer.clientHeight}px`;
    tempSvgContainer.style.backgroundColor = 'hsl(var(--paper-background))';
    
    // If there is a background image, add it
    if (layer.backgroundImage) {
      const img = document.createElement('img');
      img.src = layer.backgroundImage;
      img.style.position = 'absolute';
      img.style.width = `${layer.imageWidth}px`;
      img.style.height = `${layer.imageHeight}px`;
      img.style.top = '0';
      img.style.left = '0';
      img.style.transform = `translate(-50%, -50%) translate(${layer.imageX}px, ${layer.imageY}px) rotate(${layer.imageRotation}deg)`;
      img.style.transformOrigin = 'top left';
      tempSvgContainer.appendChild(img);
    }
    
    tempSvgContainer.innerHTML += svgString;
    document.body.appendChild(tempSvgContainer);

    const watermark = addWatermark(tempSvgContainer);
  
    // Give browser time to render
    await new Promise(resolve => setTimeout(resolve, 100));
  
    const elementToCapture = tempSvgContainer;
  
    loadExportLibraries().then(([{ default: jsPDF }, { default: html2canvas }]) => {
      return html2canvas(elementToCapture, { backgroundColor: null, useCORS: true });
    }).then((canvas) => {
      if (format === 'png') {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `${layer.name}.png`;
        a.click();
      } else {
        loadExportLibraries().then(([{ default: jsPDF }]) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`${layer.name}.pdf`);
        });
      }
      // Clean up the temporary element
      document.body.removeChild(tempSvgContainer);
    });
  };

  React.useEffect(() => {
    if (editingLayerId && inputRef.current) {
        inputRef.current.focus();
    }
  }, [editingLayerId]);

  const handleImageUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLayerId) {
      const activeLayer = layers.find(l => l.id === activeLayerId);
      if (activeLayer?.isLocked) return;
      fileInputRef.current?.click();
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeLayerId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if(event.target?.result) {
          const image = new Image();
          image.onload = () => {
            updateLayerBackgroundImage(activeLayerId, event.target?.result as string, image.width, image.height);
          };
          image.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow uploading the same file again
    if(e.target) {
      e.target.value = '';
    }
  }

  const handleRemoveImage = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if(layer?.isLocked) return;
    updateLayerBackgroundImage(layerId, undefined, 0, 0);
  }

  const handleResetImage = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if(layer?.isLocked) return;
    resetImageTransform(layerId);
  }

  const handleDuplicateLayer = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      const newLayer = {
        ...layer,
        id: `layer-${Date.now()}`,
        name: `${layer.name} (Copy)`,
        points: [...layer.points],
      };
      addLayer(newLayer);
    }
  };

  const getLayerInfo = (layer: Layer) => {
    const pointCount = layer.points.length;
    const hasImage = !!layer.backgroundImage;
    const isLocked = layer.isLocked;
    
    return { pointCount, hasImage, isLocked };
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {layers.length} {layers.length === 1 ? 'Layer' : 'Layers'}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleImageUploadClick}>
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">Upload Image</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload Background Image</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 btn-animate" onClick={() => addLayer()}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Layer</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add New Layer</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Layers List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {layers.map((layer) => {
          const { pointCount, hasImage, isLocked } = getLayerInfo(layer);
          const isActive = layer.id === activeLayerId;
          
          return (
            <Card 
              key={layer.id} 
              className={cn(
                "card-enhanced transition-all duration-200 hover-lift cursor-pointer group",
                isActive && "ring-2 ring-primary/50 bg-primary/5"
              )}
              onClick={() => setActiveLayer(layer.id)}
              onDoubleClick={() => handleLayerNameEdit(layer.id, layer.name)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  {/* Layer Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Status Indicators */}
                    <div className="flex flex-col items-center gap-1">
                      {isLocked && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                      {hasImage && (
                        <ImageIcon className="h-3 w-3 text-blue-500" />
                      )}
                      {isActive && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                    </div>

                    {/* Layer Name */}
                    <div className="min-w-0 flex-1">
                      {editingLayerId === layer.id ? (
                        <Input
                          ref={inputRef}
                          type="text"
                          value={editingName}
                          onChange={handleNameChange}
                          onBlur={handleNameSubmit}
                          onKeyDown={handleKeyDown}
                          className="h-6 p-1 text-sm bg-transparent"
                        />
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm font-medium truncate">{layer.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{pointCount} points</span>
                            {hasImage && <span>• Image</span>}
                            {isLocked && <span>• Locked</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Layer Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Image Controls */}
                    {hasImage && !isLocked && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={(e) => handleResetImage(e, layer.id)}
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span className="sr-only">Reset Image</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reset Image Transform</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={(e) => handleRemoveImage(e, layer.id)}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove Image</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remove Image</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    {/* Export Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="h-3 w-3" />
                          <span className="sr-only">Export Layer</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="w-48">
                        <DropdownMenuItem onClick={() => exportLayer(layer, 'png')} className="cursor-pointer">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                            Export as PNG
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportLayer(layer, 'pdf')} className="cursor-pointer">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                            Export as PDF
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Layer Actions */}
                    {!isLocked && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateLayer(e, layer.id);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                              <span className="sr-only">Duplicate Layer</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Duplicate Layer</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLayerNameEdit(layer.id, layer.name);
                              }}
                            >
                              <PenLine className="h-3 w-3" />
                              <span className="sr-only">Rename Layer</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Rename Layer</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeLayer(layer.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="sr-only">Remove Layer</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remove Layer</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {layers.length === 0 && (
          <Card className="card-enhanced">
            <CardContent className="p-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted/20 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No layers yet</p>
                <p className="text-xs text-muted-foreground">Click the + button to add your first layer</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
