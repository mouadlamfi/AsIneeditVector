
export interface Point {
  x: number;
  y: number;
  break?: boolean;
}

export interface Layer {
  id: string;
  name: string;
  points: Point[];
  isLocked?: boolean;
  strokeWidth: number;
  pointRadius: number;
  color: string;
  backgroundImage?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageX?: number;
  imageY?: number;
  imageRotation?: number;
}

export interface Measurement {
  angle: number;
  length: number;
  position: Point;
}

export type GridUnit = 'cm' | 'inch';
