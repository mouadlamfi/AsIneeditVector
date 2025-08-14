import { useMemo } from 'react';
import { getPatternById, PatternOptions } from '@/lib/background-patterns';

interface UseBackgroundPatternProps {
  patternId: string | null;
  options: PatternOptions;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
}

export function useBackgroundPattern({
  patternId,
  options,
  canvasWidth,
  canvasHeight,
  scale
}: UseBackgroundPatternProps) {
  
  // Memoize the pattern SVG generation for performance
  const patternSVG = useMemo(() => {
    if (!patternId) return null;
    
    const pattern = getPatternById(patternId);
    if (!pattern) return null;

    // Optimize pattern options based on scale
    const optimizedOptions: PatternOptions = {
      ...options,
      strokeWidth: (options.strokeWidth || 1) / Math.max(scale, 0.5),
      opacity: Math.max((options.opacity || 0.3) * (scale > 2 ? 0.5 : 1), 0.1),
    };

    try {
      return pattern.generateSVG(canvasWidth, canvasHeight, optimizedOptions);
    } catch (error) {
      console.warn('Failed to generate background pattern:', error);
      return null;
    }
  }, [patternId, options, canvasWidth, canvasHeight, scale]);

  // Memoize pattern metadata
  const patternInfo = useMemo(() => {
    if (!patternId) return null;
    return getPatternById(patternId);
  }, [patternId]);

  // Check if pattern should be visible based on scale
  const shouldRenderPattern = useMemo(() => {
    if (!patternSVG) return false;
    
    // Hide very faint patterns
    if ((options.opacity || 0.3) < 0.05) return false;
    
    // Hide at very high zoom levels for performance
    if (scale > 5) return false;
    
    return true;
  }, [patternSVG, options.opacity, scale]);

  return {
    patternSVG: shouldRenderPattern ? patternSVG : null,
    patternInfo,
    shouldRender: shouldRenderPattern,
    isLoading: false,
  };
}