import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { Grid3X3, Flower, Music, Shapes, Eye, EyeOff, Settings, X } from 'lucide-react';
import { backgroundPatterns, BackgroundPattern, PatternOptions } from '@/lib/background-patterns';

interface BackgroundPatternSelectorProps {
  selectedPatternId?: string | null;
  onPatternSelect: (patternId: string | null, options?: PatternOptions) => void;
  onPatternOptionsChange: (options: PatternOptions) => void;
  isVisible: boolean;
  onVisibilityToggle: () => void;
}

const categoryIcons = {
  grid: Grid3X3,
  sacred: Flower,
  musical: Music,
  geometric: Shapes,
};

const categoryColors = {
  grid: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  sacred: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  musical: 'bg-green-500/10 border-green-500/20 text-green-400',
  geometric: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
};

export function BackgroundPatternSelector({
  selectedPatternId,
  onPatternSelect,
  onPatternOptionsChange,
  isVisible,
  onVisibilityToggle
}: BackgroundPatternSelectorProps) {
  const [patternOptions, setPatternOptions] = useState<PatternOptions>({
    strokeColor: '#333333',
    strokeWidth: 1,
    opacity: 0.3,
    scale: 1,
  });

  const [showOptions, setShowOptions] = useState(false);
  const selectedPattern = backgroundPatterns.find(p => p.id === selectedPatternId);

  const updatePatternOption = <K extends keyof PatternOptions>(
    key: K,
    value: PatternOptions[K]
  ) => {
    const newOptions = { ...patternOptions, [key]: value };
    setPatternOptions(newOptions);
    onPatternOptionsChange(newOptions);
  };

  const handlePatternSelect = (pattern: BackgroundPattern | null) => {
    if (pattern) {
      onPatternSelect(pattern.id, patternOptions);
    } else {
      onPatternSelect(null);
    }
  };

  const groupedPatterns = backgroundPatterns.reduce((acc, pattern) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = [];
    }
    acc[pattern.category].push(pattern);
    return acc;
  }, {} as Record<string, BackgroundPattern[]>);

  return (
    <div className="flex flex-col gap-2">
      {/* Main Toggle Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={selectedPatternId ? "default" : "outline"}
            size="sm"
            onClick={onVisibilityToggle}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Background Guides
            {selectedPatternId && (
              <Badge variant="secondary" className="ml-1">
                {selectedPattern?.name}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {selectedPatternId ? 'Hide background guide' : 'Show background guide options'}
        </TooltipContent>
      </Tooltip>

      {/* Pattern Selector Popup */}
      {isVisible && (
        <Card className="absolute top-12 left-0 z-50 w-96 max-h-[500px] overflow-y-auto shadow-xl border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Background Guides</CardTitle>
              <div className="flex items-center gap-2">
                {selectedPatternId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowOptions(!showOptions)}
                    className="h-6 w-6"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onVisibilityToggle}
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose a geometric pattern to guide your drawing
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Clear Pattern Option */}
            <Button
              variant={!selectedPatternId ? "default" : "outline"}
              size="sm"
              onClick={() => handlePatternSelect(null)}
              className="w-full justify-start"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              No Background Guide
            </Button>

            {/* Pattern Categories */}
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {Object.keys(groupedPatterns).map((category) => {
                  const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
                  return (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      <IconComponent className="h-3 w-3" />
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Object.entries(groupedPatterns).map(([category, patterns]) => (
                <TabsContent key={category} value={category} className="mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {patterns.map((pattern) => (
                      <Card
                        key={pattern.id}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          selectedPatternId === pattern.id
                            ? 'ring-2 ring-primary'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handlePatternSelect(pattern)}
                      >
                        <CardContent className="p-3">
                          <div className="flex flex-col items-center gap-2">
                            {/* Pattern Preview */}
                            <div 
                              className="w-16 h-16 flex items-center justify-center border rounded"
                              dangerouslySetInnerHTML={{ __html: pattern.preview }}
                            />
                            
                            {/* Pattern Info */}
                            <div className="text-center">
                              <h4 className="text-xs font-medium">{pattern.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {pattern.description}
                              </p>
                              <Badge 
                                variant="outline" 
                                className={`mt-1 text-xs ${categoryColors[pattern.category]}`}
                              >
                                {pattern.category}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Pattern Options */}
            {selectedPatternId && showOptions && (
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pattern Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Opacity */}
                  <div className="space-y-2">
                    <Label className="text-xs">Opacity</Label>
                    <Slider
                      value={[patternOptions.opacity || 0.3]}
                      onValueChange={([value]) => updatePatternOption('opacity', value)}
                      max={1}
                      min={0.1}
                      step={0.1}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">
                      {Math.round((patternOptions.opacity || 0.3) * 100)}%
                    </span>
                  </div>

                  {/* Scale */}
                  <div className="space-y-2">
                    <Label className="text-xs">Scale</Label>
                    <Slider
                      value={[patternOptions.scale || 1]}
                      onValueChange={([value]) => updatePatternOption('scale', value)}
                      max={3}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">
                      {Math.round((patternOptions.scale || 1) * 100)}%
                    </span>
                  </div>

                  {/* Stroke Width */}
                  <div className="space-y-2">
                    <Label className="text-xs">Line Weight</Label>
                    <Slider
                      value={[patternOptions.strokeWidth || 1]}
                      onValueChange={([value]) => updatePatternOption('strokeWidth', value)}
                      max={3}
                      min={0.5}
                      step={0.5}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">
                      {patternOptions.strokeWidth || 1}px
                    </span>
                  </div>

                  {/* Stroke Color */}
                  <div className="space-y-2">
                    <Label className="text-xs">Color</Label>
                    <div className="flex gap-2">
                      {['#333333', '#666666', '#999999', '#0066cc', '#cc6600', '#cc0066'].map((color) => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded border-2 ${
                            patternOptions.strokeColor === color ? 'border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => updatePatternOption('strokeColor', color)}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}