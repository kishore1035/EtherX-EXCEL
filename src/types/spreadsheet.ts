export interface CellBorderSide {
  style: 'none' | 'thin' | 'thick' | 'double';
  color?: string;
}

export interface CellBorders {
  top?: CellBorderSide;
  right?: CellBorderSide;
  bottom?: CellBorderSide;
  left?: CellBorderSide;
}

export interface Cell {
  value: string;
  formula?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  numberFormat?: 'currency' | 'percentage' | 'number' | 'decimal';
  borders?: CellBorders;
  // New properties
  validation?: CellValidation;
  hyperlink?: string;
  mergedWith?: string; // Cell ID this is merged into
  isMergeParent?: boolean; // True if this is the top-left of merged cells
  mergeSpan?: { rows: number; cols: number };
  locked?: boolean;
  sparkline?: SparklineData;
}

export interface CellValidation {
  type: 'wholeNumber' | 'decimal' | 'list' | 'date' | 'time' | 'textLength' | 'custom';
  // For list validation
  options?: string[]; // Dropdown list items
  // For number validation (whole or decimal)
  min?: number;
  max?: number;
  // For date validation
  startDate?: string; // ISO format
  endDate?: string; // ISO format
  // For time validation
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  // For text length validation
  minLength?: number;
  maxLength?: number;
  // For custom formula validation
  formula?: string; // Boolean expression
  // Messages
  inputMessage?: string; // Shown when cell is selected
  inputTitle?: string;
  errorMessage?: string; // Shown when validation fails
  errorTitle?: string;
  errorStyle?: 'stop' | 'warning' | 'information'; // Error alert type
  allowBlank?: boolean; // Whether blank cells are allowed
}

export interface SparklineData {
  type: 'line' | 'bar' | 'winloss';
  range: string; // e.g., "A1:A10"
  color?: string;
}

export interface Sheet {
  id: string;
  name: string;
  color?: string;
  cells: Map<string, Cell>;
  frozenRows?: number;
  frozenCols?: number;
  namedRanges?: Map<string, string>; // name -> range (e.g., "Sales" -> "A1:A10")
  protected?: boolean;
  protectionPassword?: string;
  sortState?: SortState;
  filterState?: FilterState;
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
  columns?: Array<{ column: string; direction: 'asc' | 'desc' }>;
}

export interface FilterState {
  column: string;
  criteria: string[];
}

export interface SpreadsheetData {
  sheets: Sheet[];
  activeSheetId: string;
  wasEdited?: boolean;
  wasReopened?: boolean;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
}

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontFamily?: string;
  borders?: CellBorders;
}
