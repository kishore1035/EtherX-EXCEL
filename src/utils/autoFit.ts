/**
 * AutoFit Utility - Pixel-accurate text and content measurement for automatic cell sizing
 * Measures text using Canvas API with actual font settings and handles wrapping, images, and formatting
 */

// Constants
const DEFAULT_CELL_PADDING = 8; // px horizontal padding per side
const DEFAULT_VERTICAL_PADDING = 4; // px vertical padding per side
const DEFAULT_FONT_FAMILY = 'Inter, system-ui, sans-serif';
const DEFAULT_FONT_SIZE = '14px';
const DEFAULT_LINE_HEIGHT = 1.5;
const MAX_SAFE_DIMENSION = 50000; // Maximum px to prevent overflow
const MIN_COLUMN_WIDTH = 40; // Minimum column width in px
const MIN_ROW_HEIGHT = 24; // Minimum row height in px
const DEFAULT_COLUMN_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 25;

// Shared canvas for measurements (reused for performance)
let measurementCanvas: HTMLCanvasElement | null = null;

function getMeasurementCanvas(): CanvasRenderingContext2D {
  if (!measurementCanvas) {
    measurementCanvas = document.createElement('canvas');
  }
  const ctx = measurementCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context for text measurement');
  }
  return ctx;
}

/**
 * Get font string for canvas context from cell format
 */
function getFontString(format?: {
  fontFamily?: string;
  fontSize?: string;
  bold?: boolean;
  italic?: boolean;
}): string {
  const family = format?.fontFamily || DEFAULT_FONT_FAMILY;
  const size = format?.fontSize || DEFAULT_FONT_SIZE;
  const bold = format?.bold ? 'bold' : 'normal';
  const italic = format?.italic ? 'italic' : 'normal';
  
  return `${italic} ${bold} ${size} ${family}`;
}

/**
 * Measure single line of text width in pixels
 */
export function measureTextWidth(
  text: string,
  format?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    italic?: boolean;
  }
): number {
  if (!text) return 0;
  
  const ctx = getMeasurementCanvas();
  ctx.font = getFontString(format);
  const metrics = ctx.measureText(text);
  
  return Math.ceil(metrics.width);
}

/**
 * Measure text height for a single line
 */
export function measureTextHeight(
  format?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    italic?: boolean;
  }
): number {
  const ctx = getMeasurementCanvas();
  ctx.font = getFontString(format);
  const metrics = ctx.measureText('Mgy'); // Use chars with ascenders and descenders
  
  // Try to get actual height, fallback to approximate
  const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  
  if (height > 0) {
    return Math.ceil(height * DEFAULT_LINE_HEIGHT);
  }
  
  // Fallback: parse font size
  const fontSize = format?.fontSize || DEFAULT_FONT_SIZE;
  const sizeMatch = fontSize.match(/(\d+)/);
  const size = sizeMatch ? parseInt(sizeMatch[1]) : 14;
  
  return Math.ceil(size * DEFAULT_LINE_HEIGHT);
}

/**
 * Break text into lines based on maximum width (for wrapping)
 */
export function wrapText(
  text: string,
  maxWidth: number,
  format?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    italic?: boolean;
  }
): string[] {
  if (!text) return [''];
  
  const ctx = getMeasurementCanvas();
  ctx.font = getFontString(format);
  
  // Handle explicit line breaks
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    
    const words = paragraph.split(/(\s+)/); // Keep whitespace
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + word;
      const width = ctx.measureText(testLine).width;
      
      if (width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine.trimEnd());
        currentLine = word.trimStart();
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine.trimEnd());
    }
  }
  
  return lines.length > 0 ? lines : [''];
}

/**
 * Measure wrapped text dimensions
 */
export function measureWrappedText(
  text: string,
  maxWidth: number,
  format?: {
    fontFamily?: string;
    fontSize?: string;
    bold?: boolean;
    italic?: boolean;
  }
): { width: number; height: number; lines: string[] } {
  if (!text) {
    return { width: 0, height: measureTextHeight(format), lines: [''] };
  }
  
  const lines = wrapText(text, maxWidth, format);
  const lineHeight = measureTextHeight(format);
  
  // Measure actual width of widest line
  const ctx = getMeasurementCanvas();
  ctx.font = getFontString(format);
  let maxLineWidth = 0;
  
  for (const line of lines) {
    const width = ctx.measureText(line).width;
    if (width > maxLineWidth) {
      maxLineWidth = width;
    }
  }
  
  return {
    width: Math.ceil(maxLineWidth),
    height: Math.ceil(lineHeight * lines.length),
    lines
  };
}

/**
 * Measure cell content including padding
 */
export interface CellMeasurement {
  contentWidth: number;
  contentHeight: number;
  totalWidth: number;
  totalHeight: number;
  lines?: string[];
}

export function measureCellContent(
  content: string,
  options: {
    format?: {
      fontFamily?: string;
      fontSize?: string;
      bold?: boolean;
      italic?: boolean;
    };
    wrap?: boolean;
    maxWidth?: number;
    padding?: { horizontal: number; vertical: number };
    hasImage?: boolean;
    imageSize?: { width: number; height: number };
  } = {}
): CellMeasurement {
  const padding = options.padding || {
    horizontal: DEFAULT_CELL_PADDING,
    vertical: DEFAULT_VERTICAL_PADDING
  };
  
  // Handle images
  if (options.hasImage && options.imageSize) {
    return {
      contentWidth: options.imageSize.width,
      contentHeight: options.imageSize.height,
      totalWidth: options.imageSize.width + (padding.horizontal * 2),
      totalHeight: options.imageSize.height + (padding.vertical * 2)
    };
  }
  
  // Handle wrapped text
  if (options.wrap && options.maxWidth) {
    const availableWidth = options.maxWidth - (padding.horizontal * 2);
    const wrapped = measureWrappedText(content, availableWidth, options.format);
    
    return {
      contentWidth: wrapped.width,
      contentHeight: wrapped.height,
      totalWidth: wrapped.width + (padding.horizontal * 2),
      totalHeight: wrapped.height + (padding.vertical * 2),
      lines: wrapped.lines
    };
  }
  
  // Handle single-line text
  const width = measureTextWidth(content, options.format);
  const height = measureTextHeight(options.format);
  
  return {
    contentWidth: width,
    contentHeight: height,
    totalWidth: width + (padding.horizontal * 2),
    totalHeight: height + (padding.vertical * 2)
  };
}

/**
 * Calculate optimal column width for an array of cell values
 */
export function calculateOptimalColumnWidth(
  cellContents: Array<{
    content: string;
    format?: any;
    wrap?: boolean;
    hasImage?: boolean;
    imageSize?: { width: number; height: number };
  }>,
  options: {
    minWidth?: number;
    maxWidth?: number;
  } = {}
): number {
  const minWidth = options.minWidth || MIN_COLUMN_WIDTH;
  const maxWidth = options.maxWidth || MAX_SAFE_DIMENSION;
  
  let maxRequiredWidth = minWidth;
  
  for (const cell of cellContents) {
    if (!cell.wrap) {
      const measurement = measureCellContent(cell.content, {
        format: cell.format,
        wrap: false,
        hasImage: cell.hasImage,
        imageSize: cell.imageSize
      });
      
      maxRequiredWidth = Math.max(maxRequiredWidth, measurement.totalWidth);
    }
  }
  
  return Math.min(Math.ceil(maxRequiredWidth), maxWidth);
}

/**
 * Calculate optimal row height for an array of cell values
 */
export function calculateOptimalRowHeight(
  cellContents: Array<{
    content: string;
    format?: any;
    wrap?: boolean;
    columnWidth?: number;
    hasImage?: boolean;
    imageSize?: { width: number; height: number };
  }>,
  options: {
    minHeight?: number;
    maxHeight?: number;
  } = {}
): number {
  const minHeight = options.minHeight || MIN_ROW_HEIGHT;
  const maxHeight = options.maxHeight || MAX_SAFE_DIMENSION;
  
  let maxRequiredHeight = minHeight;
  
  for (const cell of cellContents) {
    const measurement = measureCellContent(cell.content, {
      format: cell.format,
      wrap: cell.wrap,
      maxWidth: cell.columnWidth,
      hasImage: cell.hasImage,
      imageSize: cell.imageSize
    });
    
    maxRequiredHeight = Math.max(maxRequiredHeight, measurement.totalHeight);
  }
  
  return Math.min(Math.ceil(maxRequiredHeight), maxHeight);
}

/**
 * Batch measurement for performance
 */
export function batchMeasureCells(
  cells: Array<{
    row: number;
    col: number;
    content: string;
    format?: any;
    wrap?: boolean;
    columnWidth?: number;
  }>
): Map<string, CellMeasurement> {
  const results = new Map<string, CellMeasurement>();
  
  for (const cell of cells) {
    const key = `${cell.row},${cell.col}`;
    const measurement = measureCellContent(cell.content, {
      format: cell.format,
      wrap: cell.wrap,
      maxWidth: cell.columnWidth
    });
    results.set(key, measurement);
  }
  
  return results;
}

/**
 * Debounced measurement function factory
 */
export function createDebouncedMeasure<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 150
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Export constants for use in other modules
export const AUTO_FIT_CONSTANTS = {
  DEFAULT_CELL_PADDING,
  DEFAULT_VERTICAL_PADDING,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_LINE_HEIGHT,
  MAX_SAFE_DIMENSION,
  MIN_COLUMN_WIDTH,
  MIN_ROW_HEIGHT,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT
};
