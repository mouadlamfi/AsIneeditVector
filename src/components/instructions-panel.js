import React from 'react';

const InstructionsPanel = () => {
  return (
    <div className="fixed top-20 left-4 z-50 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 max-w-sm shadow-lg">
      <h3 className="text-sm font-semibold text-foreground mb-2">Quick Guide</h3>
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>Click: Add Point</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Double Click: New Line</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <span>Right Click: Undo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          <span>Middle Click: New Line</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          <span>Scroll: Zoom In/Out</span>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPanel;