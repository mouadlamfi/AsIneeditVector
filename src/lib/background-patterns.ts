// Background pattern library for design guidance

export interface BackgroundPattern {
  id: string;
  name: string;
  description: string;
  category: 'geometric' | 'sacred' | 'musical' | 'grid';
  generateSVG: (width: number, height: number, options?: PatternOptions) => string;
  preview: string; // SVG preview for selection
}

export interface PatternOptions {
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  scale?: number;
  offset?: { x: number; y: number };
}

// Generate 9-grid squares pattern
function generateNineGrid(width: number, height: number, options: PatternOptions = {}): string {
  const {
    strokeColor = '#333333',
    strokeWidth = 1,
    opacity = 0.3,
    scale = 1
  } = options;

  const cellWidth = (width * scale) / 3;
  const cellHeight = (height * scale) / 3;
  
  let paths = '';
  
  // Vertical lines
  for (let i = 1; i < 3; i++) {
    const x = cellWidth * i;
    paths += `<line x1="${x}" y1="0" x2="${x}" y2="${height * scale}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
  }
  
  // Horizontal lines
  for (let i = 1; i < 3; i++) {
    const y = cellHeight * i;
    paths += `<line x1="0" y1="${y}" x2="${width * scale}" y2="${y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
  }
  
  return `<g id="nine-grid">${paths}</g>`;
}

// Generate flower of life pattern
function generateFlowerOfLife(width: number, height: number, options: PatternOptions = {}): string {
  const {
    strokeColor = '#333333',
    strokeWidth = 1,
    opacity = 0.3,
    scale = 1
  } = options;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.15 * scale;
  
  let circles = '';
  
  // Central circle
  circles += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
  
  // Six surrounding circles
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    circles += `<circle cx="${x}" cy="${y}" r="${radius}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
  }
  
  // Outer ring of circles
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const distance = radius * Math.sqrt(3);
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    circles += `<circle cx="${x}" cy="${y}" r="${radius}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
  }
  
  return `<g id="flower-of-life">${circles}</g>`;
}

// Generate octaves/harmonic pattern
function generateOctaves(width: number, height: number, options: PatternOptions = {}): string {
  const {
    strokeColor = '#333333',
    strokeWidth = 1,
    opacity = 0.3,
    scale = 1
  } = options;

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * 0.4 * scale;
  
  let circles = '';
  
  // Generate harmonic circles (octaves)
  for (let octave = 1; octave <= 8; octave++) {
    const radius = (maxRadius * octave) / 8;
    circles += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity * (9 - octave) / 8}" />`;
  }
  
  // Add radial lines for harmonic divisions
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const x2 = centerX + maxRadius * Math.cos(angle);
    const y2 = centerY + maxRadius * Math.sin(angle);
    circles += `<line x1="${centerX}" y1="${centerY}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="${strokeWidth * 0.5}" opacity="${opacity * 0.5}" />`;
  }
  
  return `<g id="octaves">${circles}</g>`;
}

// Generate golden ratio spiral
function generateGoldenSpiral(width: number, height: number, options: PatternOptions = {}): string {
  const {
    strokeColor = '#333333',
    strokeWidth = 1,
    opacity = 0.3,
    scale = 1
  } = options;

  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.3 * scale;
  
  let rectangles = '';
  let spiralPath = '';
  
  // Generate golden rectangles
  let currentSize = size;
  let x = centerX - size / 2;
  let y = centerY - size / 2;
  
  for (let i = 0; i < 8; i++) {
    rectangles += `<rect x="${x}" y="${y}" width="${currentSize}" height="${currentSize / phi}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity * 0.7}" />`;
    
    // Update for next rectangle
    currentSize = currentSize / phi;
    
    // Rotate position for spiral
    switch (i % 4) {
      case 0: y += currentSize; break;
      case 1: x += currentSize; break;
      case 2: y -= currentSize; break;
      case 3: x -= currentSize; break;
    }
  }
  
  return `<g id="golden-spiral">${rectangles}</g>`;
}

// Generate hexagonal grid
function generateHexGrid(width: number, height: number, options: PatternOptions = {}): string {
  const {
    strokeColor = '#333333',
    strokeWidth = 1,
    opacity = 0.3,
    scale = 1
  } = options;

  const hexSize = 40 * scale;
  const hexHeight = hexSize * Math.sqrt(3);
  const hexWidth = hexSize * 2;
  
  let hexagons = '';
  
  for (let row = 0; row * hexHeight * 0.75 < height + hexHeight; row++) {
    for (let col = 0; col * hexWidth * 0.75 < width + hexWidth; col++) {
      const x = col * hexWidth * 0.75 + (row % 2) * hexWidth * 0.375;
      const y = row * hexHeight * 0.75;
      
      if (x < width + hexWidth && y < height + hexHeight) {
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const px = x + hexSize * Math.cos(angle);
          const py = y + hexSize * Math.sin(angle);
          points.push(`${px},${py}`);
        }
        
        hexagons += `<polygon points="${points.join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      }
    }
  }
  
  return `<g id="hex-grid">${hexagons}</g>`;
}

// Generate perspective grid
function generatePerspectiveGrid(width: number, height: number, options: PatternOptions = {}): string {
  const {
    strokeColor = '#333333',
    strokeWidth = 1,
    opacity = 0.3,
    scale = 1
  } = options;

  const vanishingPointX = width / 2;
  const vanishingPointY = height * 0.3;
  const gridSpacing = 50 * scale;
  
  let lines = '';
  
  // Perspective lines to vanishing point
  for (let i = 0; i < width; i += gridSpacing) {
    lines += `<line x1="${i}" y1="${height}" x2="${vanishingPointX}" y2="${vanishingPointY}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
  }
  
  // Horizontal guidelines
  for (let i = vanishingPointY; i < height; i += gridSpacing / 2) {
    const perspective = (i - vanishingPointY) / (height - vanishingPointY);
    const leftX = vanishingPointX - (width * perspective) / 2;
    const rightX = vanishingPointX + (width * perspective) / 2;
    lines += `<line x1="${leftX}" y1="${i}" x2="${rightX}" y2="${i}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity * 0.7}" />`;
  }
  
  return `<g id="perspective-grid">${lines}</g>`;
}

// Export all available patterns
export const backgroundPatterns: BackgroundPattern[] = [
  {
    id: 'nine-grid',
    name: '9-Grid',
    description: 'Rule of thirds grid for composition',
    category: 'grid',
    generateSVG: generateNineGrid,
    preview: `<svg width="60" height="60" viewBox="0 0 60 60"><g stroke="#666" stroke-width="1" opacity="0.5"><line x1="20" y1="0" x2="20" y2="60"/><line x1="40" y1="0" x2="40" y2="60"/><line x1="0" y1="20" x2="60" y2="20"/><line x1="0" y1="40" x2="60" y2="40"/></g></svg>`
  },
  {
    id: 'flower-of-life',
    name: 'Flower of Life',
    description: 'Sacred geometry pattern for spiritual designs',
    category: 'sacred',
    generateSVG: generateFlowerOfLife,
    preview: `<svg width="60" height="60" viewBox="0 0 60 60"><g stroke="#666" stroke-width="1" opacity="0.5" fill="none"><circle cx="30" cy="30" r="8"/><circle cx="30" cy="22" r="8"/><circle cx="30" cy="38" r="8"/><circle cx="23" cy="26" r="8"/><circle cx="37" cy="26" r="8"/><circle cx="23" cy="34" r="8"/><circle cx="37" cy="34" r="8"/></g></svg>`
  },
  {
    id: 'octaves',
    name: 'Octaves',
    description: 'Harmonic circles for musical and rhythmic designs',
    category: 'musical',
    generateSVG: generateOctaves,
    preview: `<svg width="60" height="60" viewBox="0 0 60 60"><g stroke="#666" stroke-width="1" opacity="0.5" fill="none"><circle cx="30" cy="30" r="8"/><circle cx="30" cy="30" r="16"/><circle cx="30" cy="30" r="24"/><line x1="30" y1="6" x2="30" y2="54"/><line x1="6" y1="30" x2="54" y2="30"/></g></svg>`
  },
  {
    id: 'golden-spiral',
    name: 'Golden Spiral',
    description: 'Golden ratio rectangles for natural proportions',
    category: 'geometric',
    generateSVG: generateGoldenSpiral,
    preview: `<svg width="60" height="60" viewBox="0 0 60 60"><g stroke="#666" stroke-width="1" opacity="0.5" fill="none"><rect x="15" y="15" width="30" height="18.5"/><rect x="15" y="15" width="18.5" height="11.4"/><rect x="15" y="26.4" width="11.4" height="7"/></g></svg>`
  },
  {
    id: 'hex-grid',
    name: 'Hexagonal Grid',
    description: 'Honeycomb pattern for organic designs',
    category: 'geometric',
    generateSVG: generateHexGrid,
    preview: `<svg width="60" height="60" viewBox="0 0 60 60"><g stroke="#666" stroke-width="1" opacity="0.5" fill="none"><polygon points="30,10 40,20 40,30 30,40 20,30 20,20"/><polygon points="15,25 25,35 25,45 15,55 5,45 5,35"/><polygon points="45,25 55,35 55,45 45,55 35,45 35,35"/></g></svg>`
  },
  {
    id: 'perspective-grid',
    name: 'Perspective Grid',
    description: 'One-point perspective for 3D designs',
    category: 'geometric',
    generateSVG: generatePerspectiveGrid,
    preview: `<svg width="60" height="60" viewBox="0 0 60 60"><g stroke="#666" stroke-width="1" opacity="0.5"><line x1="10" y1="60" x2="30" y2="10"/><line x1="30" y1="60" x2="30" y2="10"/><line x1="50" y1="60" x2="30" y2="10"/><line x1="5" y1="40" x2="55" y2="40"/><line x1="10" y1="50" x2="50" y2="50"/></g></svg>`
  }
];

// Get pattern by ID
export function getPatternById(id: string): BackgroundPattern | undefined {
  return backgroundPatterns.find(pattern => pattern.id === id);
}

// Get patterns by category
export function getPatternsByCategory(category: string): BackgroundPattern[] {
  return backgroundPatterns.filter(pattern => pattern.category === category);
}