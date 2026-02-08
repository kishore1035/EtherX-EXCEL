// Shape type definitions for EtherX Excel

export type ShapeType = 
  // Basic Shapes
  | 'rectangle'
  | 'rounded-rectangle'
  | 'oval'
  | 'circle'      // Alias for oval (perfect circle)
  | 'ellipse'     // Explicit ellipse
  | 'line'
  | 'arrow'
  | 'double-arrow'
  | 'right-arrow'
  | 'left-arrow'
  | 'up-arrow'
  | 'down-arrow'
  // Geometric Shapes
  | 'triangle'
  | 'isosceles-triangle'
  | 'diamond'
  | 'parallelogram'
  | 'trapezoid'
  // Callouts
  | 'rounded-callout'
  | 'cloud-callout'
  | 'oval-callout'
  // Flowchart
  | 'flowchart-process'
  | 'flowchart-decision'
  | 'flowchart-terminator'
  | 'flowchart-data'
  | 'flowchart-predefined'
  // Stars & Banners
  | 'star-5'
  | 'star'        // Alias for star-5
  | 'ribbon-banner';

export interface ShapeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  opacity: number;
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
  cornerRadius?: number;
  arrowHead?: 'none' | 'triangle' | 'circle' | 'diamond';
}

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  style: ShapeStyle;
  text?: string;
  zIndex: number;
}

export interface ShapeCategory {
  name: string;
  shapes: Array<{
    type: ShapeType;
    label: string;
    icon: string;
  }>;
}

export const SHAPE_CATEGORIES: ShapeCategory[] = [
  {
    name: 'Basic Shapes',
    shapes: [
      { type: 'rectangle', label: 'Rectangle', icon: '▭' },
      { type: 'rounded-rectangle', label: 'Rounded Rectangle', icon: '▢' },
      { type: 'oval', label: 'Oval', icon: '○' },
      { type: 'line', label: 'Line', icon: '─' },
      { type: 'arrow', label: 'Arrow', icon: '→' },
      { type: 'double-arrow', label: 'Double Arrow', icon: '↔' },
      { type: 'right-arrow', label: 'Right Arrow', icon: '⇨' },
      { type: 'left-arrow', label: 'Left Arrow', icon: '⇦' },
      { type: 'up-arrow', label: 'Up Arrow', icon: '⇧' },
      { type: 'down-arrow', label: 'Down Arrow', icon: '⇩' },
    ]
  },
  {
    name: 'Geometric',
    shapes: [
      { type: 'triangle', label: 'Right Triangle', icon: '◿' },
      { type: 'isosceles-triangle', label: 'Triangle', icon: '△' },
      { type: 'diamond', label: 'Diamond', icon: '◇' },
      { type: 'parallelogram', label: 'Parallelogram', icon: '▱' },
      { type: 'trapezoid', label: 'Trapezoid', icon: '⏢' },
    ]
  },
  {
    name: 'Callouts',
    shapes: [
      { type: 'rounded-callout', label: 'Rounded Callout', icon: '▢' },
      { type: 'cloud-callout', label: 'Cloud Callout', icon: '☁' },
      { type: 'oval-callout', label: 'Oval Callout', icon: '○' },
    ]
  },
  {
    name: 'Flowchart',
    shapes: [
      { type: 'flowchart-process', label: 'Process', icon: '▭' },
      { type: 'flowchart-decision', label: 'Decision', icon: '◇' },
      { type: 'flowchart-terminator', label: 'Terminator', icon: '▢' },
      { type: 'flowchart-data', label: 'Data', icon: '▱' },
      { type: 'flowchart-predefined', label: 'Predefined', icon: '▯' },
    ]
  },
  {
    name: 'Stars & Banners',
    shapes: [
      { type: 'star-5', label: '5-Point Star', icon: '★' },
      { type: 'ribbon-banner', label: 'Ribbon', icon: '⌒' },
    ]
  }
];

export const DEFAULT_SHAPE_STYLE: ShapeStyle = {
  fill: '#4472C4',
  stroke: '#2F5597',
  strokeWidth: 2,
  strokeStyle: 'solid',
  opacity: 1,
  cornerRadius: 8,
};
