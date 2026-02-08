/**
 * AutoFit Types and Interfaces
 * Type definitions for the automatic cell-sizing system
 */

export interface AutoFitConfig {
  /** Enable/disable AutoFit globally for this sheet */
  enabled: boolean;
  
  /** Auto-resize columns when content changes */
  autoFitColumns: boolean;
  
  /** Auto-resize rows when content changes */
  autoFitRows: boolean;
  
  /** Minimum column width in pixels */
  minColumnWidth: number;
  
  /** Maximum column width in pixels (soft limit, can be exceeded manually) */
  maxColumnWidth: number;
  
  /** Minimum row height in pixels */
  minRowHeight: number;
  
  /** Maximum row height in pixels (soft limit, can be exceeded manually) */
  maxRowHeight: number;
  
  /** Debounce delay for auto-resize in milliseconds */
  debounceDelay: number;
  
  /** Show warning when dimension exceeds this threshold */
  largeSizeWarningThreshold: number;
}

export interface ColumnWidth {
  /** Column index */
  col: number;
  
  /** Width in pixels */
  width: number;
  
  /** Whether this was manually set by user (prevents auto-resize) */
  isManual: boolean;
  
  /** Timestamp of last resize */
  lastModified?: number;
}

export interface RowHeight {
  /** Row index */
  row: number;
  
  /** Height in pixels */
  height: number;
  
  /** Whether this was manually set by user (prevents auto-resize) */
  isManual: boolean;
  
  /** Timestamp of last resize */
  lastModified?: number;
}

export interface CellSizeRequirement {
  /** Required width in pixels */
  requiredWidth: number;
  
  /** Required height in pixels */
  requiredHeight: number;
  
  /** Whether cell has wrap text enabled */
  isWrapped: boolean;
  
  /** Number of lines if wrapped */
  lineCount?: number;
  
  /** Has inline image */
  hasImage?: boolean;
}

export interface AutoFitMeasurement {
  /** Cell key (row,col) */
  cellKey: string;
  
  /** Measured dimensions */
  measurement: CellSizeRequirement;
  
  /** Timestamp of measurement */
  timestamp: number;
}

export interface AutoFitOperation {
  /** Operation type */
  type: 'column' | 'row' | 'range' | 'sheet';
  
  /** Affected columns (if type is column or range) */
  columns?: number[];
  
  /** Affected rows (if type is row or range) */
  rows?: number[];
  
  /** Range if type is range */
  range?: {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  };
  
  /** Previous sizes (for undo) */
  previousSizes?: {
    columnWidths?: Map<number, number>;
    rowHeights?: Map<number, number>;
  };
  
  /** New sizes */
  newSizes?: {
    columnWidths?: Map<number, number>;
    rowHeights?: Map<number, number>;
  };
}

export interface MergedCell {
  /** Starting row */
  startRow: number;
  
  /** Starting column */
  startCol: number;
  
  /** Ending row */
  endRow: number;
  
  /** Ending column */
  endCol: number;
  
  /** Total required width */
  requiredWidth?: number;
  
  /** Total required height */
  requiredHeight?: number;
}

export interface AutoFitProgress {
  /** Total cells to measure */
  total: number;
  
  /** Cells measured so far */
  completed: number;
  
  /** Currently processing */
  current?: string;
  
  /** Operation description */
  operation: string;
}

/**
 * AutoFit API Interface
 */
export interface IAutoFitAPI {
  /** Enable/disable AutoFit for the current sheet */
  enableAutoFit(config: Partial<AutoFitConfig>): void;
  
  /** Get current AutoFit configuration */
  getAutoFitConfig(): AutoFitConfig;
  
  /** Manually trigger AutoFit for specific column */
  autoFitColumn(columnIndex: number): void;
  
  /** Manually trigger AutoFit for specific row */
  autoFitRow(rowIndex: number): void;
  
  /** AutoFit a range of cells */
  autoFitRange(startRow: number, startCol: number, endRow: number, endCol: number): void;
  
  /** AutoFit all columns in the sheet */
  autoFitAllColumns(): void;
  
  /** AutoFit all rows in the sheet */
  autoFitAllRows(): void;
  
  /** Get measured size for a specific cell */
  getMeasuredSizeForCell(row: number, col: number): CellSizeRequirement | null;
  
  /** Get current column width */
  getColumnWidth(col: number): number;
  
  /** Get current row height */
  getRowHeight(row: number): number;
  
  /** Set column width manually (prevents auto-resize for this column) */
  setColumnWidth(col: number, width: number, isManual?: boolean): void;
  
  /** Set row height manually (prevents auto-resize for this row) */
  setRowHeight(row: number, height: number, isManual?: boolean): void;
  
  /** Reset column to auto-fit mode */
  resetColumnToAuto(col: number): void;
  
  /** Reset row to auto-fit mode */
  resetRowToAuto(row: number): void;
  
  /** Clear all manual overrides */
  clearManualOverrides(): void;
  
  /** Batch measure cells (for performance) */
  batchMeasureCells(cellKeys: string[]): Promise<Map<string, CellSizeRequirement>>;
}

/**
 * Sheet size metadata for persistence
 */
export interface SheetSizeMetadata {
  /** Sheet ID */
  sheetId: string;
  
  /** Column widths map (col index -> width in px) */
  columnWidths: Record<number, ColumnWidth>;
  
  /** Row heights map (row index -> height in px) */
  rowHeights: Record<number, RowHeight>;
  
  /** AutoFit configuration */
  autoFitConfig: AutoFitConfig;
  
  /** Last modified timestamp */
  lastModified: number;
}

/**
 * Default AutoFit configuration
 */
export const DEFAULT_AUTOFIT_CONFIG: AutoFitConfig = {
  enabled: true,
  autoFitColumns: true,
  autoFitRows: true,
  minColumnWidth: 40,
  maxColumnWidth: 1000,
  minRowHeight: 24,
  maxRowHeight: 500,
  debounceDelay: 150,
  largeSizeWarningThreshold: 10000
};
