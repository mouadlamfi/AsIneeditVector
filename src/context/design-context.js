"use client";

import React, { createContext, useCallback, useContext, useState } from 'react';

// Simple UUID generator for better compatibility
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const DesignContext = createContext(undefined);

const initialLayer = {
  id: 'default-layer-1',
  name: 'Layer 1',
  points: [],
  strokeWidth: 1,
  pointRadius: 3,
  color: '#FFFFFF', // Default to white
};

export function DesignProvider({ children }) {
  const [layers, setLayers] = useState([initialLayer]);
  const [activeLayerId, setActiveLayerId] = useState(initialLayer.id);
  const [scale, setScale] = useState(1);
  const [isSymmetryEnabled, setIsSymmetryEnabled] = useState(false);
  const [measurement, setMeasurement] = useState(null);
  const [gridUnit, setGridUnit] = useState('cm');
  const [canvasMode, setCanvasMode] = useState('draw');

  const toggleSymmetry = useCallback(() => setIsSymmetryEnabled(prev => !prev), []);
  const zoomIn = useCallback(() => setScale(s => Math.min(s + 0.1, 5)), []);
  const zoomOut = useCallback(() => setScale(s => Math.max(s - 0.1, 0.2)), []);

  const getCanvasAsSvg = (layerId) => {
    const svgElement = document.querySelector('#design-canvas-svg');
    if (!svgElement) return null;
  
    const clone = svgElement.cloneNode(true);
  
    // If a specific layerId is provided, remove all other layers.
    if (layerId) {
      clone.querySelectorAll('g[data-layer-id]').forEach(g => {
        if (g.getAttribute('data-layer-id') !== layerId) {
          g.remove();
        }
      });
    }
    
    // Always remove preview for exports
    clone.querySelector('g[data-preview-group]')?.remove();
    
    // Show elements that are normally hidden
    clone.querySelectorAll('[data-export-hide="false"]').forEach(el => {
        el.classList.remove('hidden');
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(clone);
  };
  

  const addLayer = useCallback((existingLayer) => {
    const newLayer = existingLayer || {
      id: generateId(),
      name: `Layer ${layers.length + 1}`,
      points: [],
      strokeWidth: 1,
      pointRadius: 3,
      color: '#000000',
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  }, [layers.length]);

  const removeLayer = useCallback((layerId) => {
    const layerToRemove = layers.find(l => l.id === layerId);
    if (layerToRemove?.isLocked) return;

    setLayers(prev => {
      const newLayers = prev.filter(l => l.id !== layerId);
      if (activeLayerId === layerId) {
        setActiveLayerId(newLayers[newLayers.length - 1]?.id || null);
      }
      return newLayers;
    });
  }, [activeLayerId, layers]);

  const setActiveLayer = useCallback((layerId) => {
    setActiveLayerId(layerId);
    setMeasurement(null);
  }, []);

  const updateLayer = (layerId, updates) => {
    setLayers(prev =>
      prev.map(l =>
        l.id === layerId ? { ...l, ...updates } : l
      )
    );
  }

  const updateActiveLayer = useCallback((updates) => {
    if (!activeLayerId) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (activeLayer?.isLocked) return;
    updateLayer(activeLayerId, updates);
  }, [activeLayerId, layers]);

  const updateLayerPoints = (layerId, updateFn) => {
    setLayers(prev =>
      prev.map(l => {
        if (l.id === layerId) {
            const newPoints = updateFn(l.points);
            return { ...l, points: newPoints };
        }
        return l;
      })
    );
  };
  
  const addPoint = useCallback((point) => {
    if (!activeLayerId) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (activeLayer?.isLocked) return;
    updateLayerPoints(activeLayerId, (points) => [...points, point]);
  }, [activeLayerId, layers]);

  const detachLine = useCallback(() => {
    if (!activeLayerId) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (activeLayer?.isLocked) return;
    updateLayerPoints(activeLayerId, (points) => {
        if(points.length > 0) {
            const lastPoint = points[points.length-1];
            return [...points.slice(0, -1), {...lastPoint, break: true}];
        }
        return points;
    });
  }, [activeLayerId, layers]);

  const clearPoints = useCallback(() => {
    if (!activeLayerId) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (activeLayer?.isLocked) return;
    updateLayerPoints(activeLayerId, () => []);
    setMeasurement(null);
  }, [activeLayerId, layers]);

  const removeLastPoint = useCallback(() => {
    if (!activeLayerId) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (activeLayer?.isLocked) return;
    updateLayerPoints(activeLayerId, (points) => points.slice(0, -1));
    setMeasurement(null);
  }, [activeLayerId, layers]);

  const updatePoint = useCallback((index, newPosition) => {
    if (!activeLayerId) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (activeLayer?.isLocked) return;
    updateLayerPoints(activeLayerId, (points) =>
      points.map((p, i) => (i === index ? { ...p, ...newPosition } : p))
    );
  }, [activeLayerId, layers]);
  
  const updateLayerBackgroundImage = useCallback((layerId, image, width, height) => {
    const canvas = document.getElementById('canvas-container');
    const canvasWidth = canvas?.clientWidth || 500;
    const canvasHeight = canvas?.clientHeight || 500;
    
    const aspectRatio = width / height;
    let newWidth = canvasWidth * 0.5;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > canvasHeight * 0.8) {
        newHeight = canvasHeight * 0.8;
        newWidth = newHeight * aspectRatio;
    }

    updateLayer(layerId, { 
        backgroundImage: image,
        imageWidth: newWidth,
        imageHeight: newHeight,
        imageX: canvasWidth / 2,
        imageY: canvasHeight / 2,
        imageRotation: 0,
    });
  }, []);

  const resetImageTransform = useCallback((layerId) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || !layer.backgroundImage) return;

    const image = new Image();
    image.onload = () => {
        const canvas = document.getElementById('canvas-container');
        const canvasWidth = canvas?.clientWidth || 500;
        const canvasHeight = canvas?.clientHeight || 500;
        
        const aspectRatio = image.width / image.height;
        let newWidth = canvasWidth * 0.5;
        let newHeight = newWidth / aspectRatio;
    
        if (newHeight > canvasHeight * 0.8) {
            newHeight = canvasHeight * 0.8;
            newWidth = newHeight * aspectRatio;
        }

        updateLayer(layerId, {
            imageWidth: newWidth,
            imageHeight: newHeight,
            imageX: canvasWidth / 2,
            imageY: canvasHeight / 2,
            imageRotation: 0,
        });
    }
    image.src = layer.backgroundImage;
}, [layers]);

  return (
    <DesignContext.Provider
      value={{
            layers,
    activeLayerId,
    scale,
    isSymmetryEnabled,
    measurement,
    gridUnit,
    canvasMode,
    setGridUnit,
    setCanvasMode,
    setMeasurement,
    toggleSymmetry,
    addLayer,
    removeLayer,
    setActiveLayer,
    updateActiveLayer,
    addPoint,
    clearPoints,
    removeLastPoint,
    updatePoint,
    zoomIn,
    zoomOut,
    setScale,
    detachLine,
    getCanvasAsSvg,
    updateLayerBackgroundImage,
    resetImageTransform,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
}