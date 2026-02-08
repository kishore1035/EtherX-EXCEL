/**
 * COMPLETE DOCUMENT STATE SCHEMA
 * This is the SINGLE source of truth for the entire spreadsheet document.
 * Everything must be stored in this structure to be persisted to IPFS.
 */

// ============================================================================
// METADATA
// ============================================================================

export interface DocumentMetadata {
  documentId: string;
  title: string;
  owner: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  theme: 'light' | 'dark';
  sheetCount: number;
  version: string; // Schema version for future migrations
  collaborators?: string[]; // List of collaborator addresses/IDs
  permissions?: DocumentPermissions;
}

export interface DocumentPermissions {
  isPublic: boolean;
  viewers: string[];
  editors: string[];
  owner: string;
}

// ============================================================================
// CELL STYLES
// ============================================================================

export interface CellStyle {
  fontFamily?: string; // e.g., "Arial", "Times New Roman"
  fontSize?: number; // in points
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textColor?: string; // hex color
  backgroundColor?: string; // hex color
  border?: CellBorder;
  alignment?: CellAlignment;
  numberFormat?: string; // e.g., "0.00", "$#,##0.00", "dd/mm/yyyy"
  rotation?: number; // text rotation in degrees
  wrapText?: boolean;
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  indent?: number; // indentation level
}

export interface CellBorder {
  top?: BorderStyle;
  right?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
  diagonal?: BorderStyle;
  diagonalUp?: boolean;
  diagonalDown?: boolean;
}

export interface BorderStyle {
  style: 'none' | 'thin' | 'medium' | 'thick' | 'double' | 'dotted' | 'dashed' | 'dashDot' | 'dashDotDot';
  color?: string; // hex color
}

export interface CellAlignment {
  horizontal?: 'left' | 'center' | 'right' | 'justify' | 'distributed';
  vertical?: 'top' | 'middle' | 'bottom' | 'justify' | 'distributed';
  wrapText?: boolean;
  shrinkToFit?: boolean;
  textRotation?: number;
}

// ============================================================================
// CELL DATA
// ============================================================================

export interface CellData {
  value: string | number | boolean | null; // Actual cell value
  formula?: string; // Formula if cell contains one (with = prefix)
  type?: 'string' | 'number' | 'boolean' | 'date' | 'error' | 'formula';
  style?: CellStyle;
  comment?: CellComment;
  hyperlink?: string; // URL if cell is a hyperlink
  validation?: DataValidation;
  mergedWith?: string; // Cell key this is merged into (e.g., "A1")
  isMergeParent?: boolean; // True if this is the top-left of merged range
  mergeSpan?: { rows: number; cols: number }; // Span of merged cells
  locked?: boolean; // Protection status
  hidden?: boolean;
  sparkline?: SparklineConfig;
}

// ============================================================================
// SPARKLINES
// ============================================================================

export interface SparklineConfig {
  type: 'line' | 'column' | 'winLoss';
  sourceRange: string; // e.g., "A1:A10"
  color?: string;
  lineWidth?: number;
  showMarkers?: boolean;
  showHighPoint?: boolean;
  showLowPoint?: boolean;
  showFirstPoint?: boolean;
  showLastPoint?: boolean;
  showNegativePoints?: boolean;
  min?: number; // Auto if undefined
  max?: number; // Auto if undefined
  axis?: boolean; // Show axis line at zero
}

export interface CellComment {
  text: string;
  author: string;
  timestamp: string; // ISO 8601
  resolved?: boolean;
}

export interface DataValidation {
  type: 'wholeNumber' | 'decimal' | 'list' | 'date' | 'time' | 'textLength' | 'custom';
  operator?: 'between' | 'notBetween' | 'equal' | 'notEqual' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual';
  formula1?: string; // First value/formula
  formula2?: string; // Second value for between/notBetween
  allowBlank?: boolean;
  showDropDown?: boolean; // For list type
  showInputMessage?: boolean;
  inputTitle?: string;
  inputMessage?: string;
  showErrorMessage?: boolean;
  errorTitle?: string;
  errorMessage?: string;
  errorStyle?: 'stop' | 'warning' | 'information';
}

export interface SparklineConfig {
  type: 'line' | 'column' | 'winLoss';
  dataRange: string; // e.g., "A1:A10"
  color?: string;
  negativeColor?: string;
  markers?: boolean;
  highPoint?: boolean;
  lowPoint?: boolean;
  firstPoint?: boolean;
  lastPoint?: boolean;
  lineWeight?: number;
}

// ============================================================================
// GRID CONFIGURATION
// ============================================================================

export interface GridConfig {
  rows: number; // Total row count
  columns: number; // Total column count
  rowSizes: { [rowIndex: number]: number }; // Custom row heights in pixels
  columnSizes: { [colIndex: number]: number }; // Custom column widths in pixels
  frozenRows: number; // Number of frozen rows
  frozenColumns: number; // Number of frozen columns
  showGridlines: boolean;
  showRowHeaders: boolean;
  showColumnHeaders: boolean;
  defaultRowHeight: number;
  defaultColumnWidth: number;
  hiddenRows: number[]; // Indices of hidden rows
  hiddenColumns: number[]; // Indices of hidden columns
}

// ============================================================================
// IMAGES
// ============================================================================

export interface ImageObject {
  id: string; // Unique identifier
  src: string; // Base64 or IPFS CID
  x: number; // Position in pixels
  y: number; // Position in pixels
  width: number; // Size in pixels
  height: number; // Size in pixels
  rotation: number; // Rotation in degrees
  opacity: number; // 0-1
  layer: number; // Z-index
  locked?: boolean;
  name?: string;
  anchorCell?: string; // Cell to anchor to (e.g., "A1")
  moveWithCells?: boolean;
  sizeWithCells?: boolean;
}

// ============================================================================
// SHAPES
// ============================================================================

export interface ShapeObject {
  id: string;
  type: 'rectangle' | 'circle' | 'ellipse' | 'line' | 'arrow' | 'triangle' | 'polygon' | 'star' | 'callout';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string; // Fill color (hex)
  stroke?: string; // Stroke color (hex)
  strokeWidth?: number;
  opacity?: number; // 0-1
  rotation: number; // Degrees
  layer: number; // Z-index
  locked?: boolean;
  shadow?: boolean; // Drop shadow enabled
  text?: string; // Text inside shape
  textStyle?: CellStyle;
  points?: { x: number; y: number }[]; // For polygons/custom shapes
  cornerRadius?: number; // For rounded rectangles
  anchorCell?: string;
  moveWithCells?: boolean;
  sizeWithCells?: boolean;
  createdAt?: number; // Timestamp
  lastModifiedAt?: number; // Timestamp
  createdBy?: string; // User ID
  lastModifiedBy?: string; // User ID
}

// ============================================================================
// CHARTS
// ============================================================================

export interface ChartObject {
  id: string;
  chartType: 'line' | 'bar' | 'column' | 'pie' | 'scatter' | 'area' | 'radar' | 'bubble' | 'combo';
  dataRange: string; // e.g., "A1:D10"
  x: number;
  y: number;
  width: number;
  height: number;
  options: ChartOptions;
  layer: number;
  locked?: boolean;
  anchorCell?: string;
  moveWithCells?: boolean;
  sizeWithCells?: boolean;
}

export interface ChartOptions {
  title?: string;
  subtitle?: string;
  legend?: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  xAxis?: {
    title?: string;
    showGridlines?: boolean;
    min?: number;
    max?: number;
  };
  yAxis?: {
    title?: string;
    showGridlines?: boolean;
    min?: number;
    max?: number;
  };
  series?: ChartSeries[];
  colors?: string[];
  showDataLabels?: boolean;
  smooth?: boolean; // For line charts
  stacked?: boolean;
  showPercentage?: boolean; // For pie charts
}

export interface ChartSeries {
  name: string;
  range: string;
  color?: string;
  type?: 'line' | 'bar' | 'area'; // For combo charts
}

// ============================================================================
// LINKS & SYMBOLS
// ============================================================================

export interface CellLink {
  cell: string; // Cell key like "A1"
  url: string;
  text?: string; // Display text
}

export interface CellSymbol {
  cell: string; // Cell key like "A1"
  symbol: string; // Unicode symbol or icon identifier
  color?: string;
  size?: number;
}

// ============================================================================
// CONDITIONAL FORMATTING
// ============================================================================

export interface ConditionalFormat {
  id: string;
  range: string; // e.g., "A1:D10"
  rules: ConditionalFormatRule[];
  priority: number; // Lower number = higher priority
  stopIfTrue?: boolean;
}

export interface ConditionalFormatRule {
  type: 'cellValue' | 'formula' | 'colorScale' | 'dataBar' | 'iconSet' | 'topBottom' | 'aboveAverage' | 'duplicate' | 'unique';
  operator?: 'equal' | 'notEqual' | 'greaterThan' | 'lessThan' | 'between' | 'notBetween' | 'contains' | 'notContains' | 'beginsWith' | 'endsWith';
  value1?: string | number;
  value2?: string | number;
  formula?: string;
  style?: CellStyle; // Style to apply when rule matches
  colorScale?: {
    minColor: string;
    midColor?: string;
    maxColor: string;
  };
  dataBar?: {
    color: string;
    showValue: boolean;
  };
  iconSet?: {
    icons: string[];
    reverse?: boolean;
  };
}

// ============================================================================
// SHEET STRUCTURE
// ============================================================================

export interface SheetData {
  sheetId: string;
  name: string;
  color?: string; // Tab color
  visible: boolean;
  protected?: boolean;
  protectionPassword?: string; // Hashed
  cellLocks?: { [cellKey: string]: boolean }; // Individual cell locks

  grid: GridConfig;
  
  // Cells stored as object with cell keys (e.g., "A1", "B2")
  cells: { [cellKey: string]: CellData };
  
  images: ImageObject[];
  shapes: ShapeObject[];
  charts: ChartObject[];
  links: CellLink[];
  symbols: CellSymbol[];
  
  conditionalFormatting: ConditionalFormat[];
  
  // Named ranges
  namedRanges?: { [name: string]: string }; // e.g., "TotalSales" -> "A1:A10"
  
  // Sorting and filtering
  sortState?: {
    column: string;
    direction: 'asc' | 'desc';
    caseSensitive?: boolean;
  };
  
  filterState?: {
    column: string;
    criteria: string[];
    showBlanks?: boolean;
  };
  
  // View settings
  zoom?: number; // Zoom level percentage
  scrollPosition?: { x: number; y: number };
}

// ============================================================================
// DOCUMENT STATE (ROOT)
// ============================================================================

export interface DocumentState {
  documentId: string;
  metadata: DocumentMetadata;
  sheets: SheetData[];
  activeSheetId: string; // ID of currently active sheet
  
  // Global settings
  settings?: {
    autoSave: boolean;
    autoSaveInterval: number; // in seconds
    showFormulaBar: boolean;
    calculationMode: 'auto' | 'manual';
    r1c1ReferenceStyle: boolean;
  };
  
  // Version history tracking
  versionHistory?: {
    cid: string; // IPFS CID of this version
    timestamp: string;
    author: string;
    description?: string;
  }[];
}

// ============================================================================
// IPFS STORAGE
// ============================================================================

export interface IPFSDocument {
  state: DocumentState;
  cid?: string; // Current CID after upload
  previousCid?: string; // Previous version CID
}

// ============================================================================
// ACTION TYPES FOR STATE UPDATES
// ============================================================================

export type DocumentAction =
  | { type: 'SET_DOCUMENT'; payload: DocumentState }
  | { type: 'UPDATE_METADATA'; payload: Partial<DocumentMetadata> }
  | { type: 'ADD_SHEET'; payload: SheetData }
  | { type: 'REMOVE_SHEET'; payload: string }
  | { type: 'RENAME_SHEET'; payload: { sheetId: string; name: string } }
  | { type: 'SET_ACTIVE_SHEET'; payload: string }
  | { type: 'UPDATE_CELL'; payload: { sheetId: string; cellKey: string; data: Partial<CellData> } }
  | { type: 'UPDATE_CELLS'; payload: { sheetId: string; cells: { [cellKey: string]: Partial<CellData> } } }
  | { type: 'SET_CELL_STYLE'; payload: { sheetId: string; cellKey: string; style: Partial<CellStyle> } }
  | { type: 'ADD_IMAGE'; payload: { sheetId: string; image: ImageObject } }
  | { type: 'UPDATE_IMAGE'; payload: { sheetId: string; imageId: string; updates: Partial<ImageObject> } }
  | { type: 'REMOVE_IMAGE'; payload: { sheetId: string; imageId: string } }
  | { type: 'ADD_SHAPE'; payload: { sheetId: string; shape: ShapeObject } }
  | { type: 'UPDATE_SHAPE'; payload: { sheetId: string; shapeId: string; updates: Partial<ShapeObject> } }
  | { type: 'REMOVE_SHAPE'; payload: { sheetId: string; shapeId: string } }
  | { type: 'ADD_CHART'; payload: { sheetId: string; chart: ChartObject } }
  | { type: 'UPDATE_CHART'; payload: { sheetId: string; chartId: string; updates: Partial<ChartObject> } }
  | { type: 'REMOVE_CHART'; payload: { sheetId: string; chartId: string } }
  | { type: 'UPDATE_GRID_CONFIG'; payload: { sheetId: string; config: Partial<GridConfig> } }
  | { type: 'SET_ROW_SIZE'; payload: { sheetId: string; rowIndex: number; size: number } }
  | { type: 'SET_COLUMN_SIZE'; payload: { sheetId: string; colIndex: number; size: number } }
  | { type: 'ADD_CONDITIONAL_FORMAT'; payload: { sheetId: string; format: ConditionalFormat } }
  | { type: 'REMOVE_CONDITIONAL_FORMAT'; payload: { sheetId: string; formatId: string } }
  | { type: 'SET_DATA_VALIDATION'; payload: { sheetId: string; cellKey: string; validation: DataValidation } }
  | { type: 'SET_SPARKLINE'; payload: { sheetId: string; cellKey: string; sparkline: SparklineConfig | null } }
  | { type: 'PROTECT_SHEET'; payload: { sheetId: string; protected: boolean; password?: string } }
  | { type: 'LOCK_CELLS'; payload: { sheetId: string; cellKeys: string[]; locked: boolean } }
  | { type: 'RESTORE_FROM_IPFS'; payload: DocumentState };
