import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CellValidation } from '../types/spreadsheet';
import { validateCellValue, applyValidationRule, removeValidation, getValidationForCell, ValidationResult } from '../utils/validationBackend';
import { updateCollaboratorActivity } from '../utils/collaborationSystem';
import { measureCellContent, AUTO_FIT_CONSTANTS } from '../utils/autoFit';
import { toast } from 'sonner';

// Grid dimensions - matching SpreadsheetGrid constants
const MAX_COLS = 52; // Support up to 52 columns (A-AZ) - expandable to 16384
const MAX_ROWS = 100; // Support up to 100 rows - expandable to 1048576

interface CellFormat {
  fontFamily?: string;
  fontSize?: string | number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  isLink?: boolean;
  linkUrl?: string;
  textDecoration?: string;
}

interface FloatingImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  zIndex?: number;
  style?: {
    border?: { width: number; style: 'solid' | 'dashed' | 'dotted'; color: string };
    shadow?: { offsetX: number; offsetY: number; blur: number; color: string };
    borderRadius?: number;
    filter?: string;
  };
}

interface FloatingShape {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

interface FloatingChart {
  id: string;
  type: 'column' | 'line' | 'pie';
  x: number;
  y: number;
  width: number;
  height: number;
  data: { label: string; value: number }[];
  dataRange?: string;
  config?: any;
  chartData?: any;
}

interface FloatingTextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textAlign: 'left' | 'center' | 'right';
  padding: number;
  drawPath?: { x: number; y: number }[];
}

interface SpreadsheetContextType {
  selectedCell: { row: number; col: number } | null;
  setSelectedCell: (cell: { row: number; col: number } | null) => void;
  selectedRange: { startRow: number; startCol: number; endRow: number; endCol: number } | null;
  setSelectedRange: (range: { startRow: number; startCol: number; endRow: number; endCol: number } | null) => void;
  cellData: { [key: string]: string };
  setCellData: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  cellFormats: { [key: string]: CellFormat };
  setCellFormats: React.Dispatch<React.SetStateAction<{ [key: string]: CellFormat }>>;
  cellValidations: { [key: string]: CellValidation };
  setCellValidations: React.Dispatch<React.SetStateAction<{ [key: string]: CellValidation }>>;
  floatingImages: FloatingImage[];
  setFloatingImages: React.Dispatch<React.SetStateAction<FloatingImage[]>>;
  floatingTextBoxes: FloatingTextBox[];
  setFloatingTextBoxes: React.Dispatch<React.SetStateAction<FloatingTextBox[]>>;

  selectedImage: string | null;
  setSelectedImage: (id: string | null) => void;
  hasTextSelection: boolean;
  setHasTextSelection: (hasSelection: boolean) => void;
  isTextBoxMode: boolean;
  setIsTextBoxMode: (mode: boolean) => void;
  isShapeDrawMode: boolean;
  setIsShapeDrawMode: (mode: boolean) => void;
  selectedShapeType: string | null;
  setSelectedShapeType: (type: string | null) => void;
  selectedShape: string | null;
  setSelectedShape: (id: string | null) => void;
  
  // AutoFit state and functions
  columnWidths: Map<number, number>;
  rowHeights: Map<number, number>;
  getColumnWidth: (col: number) => number;
  getRowHeight: (row: number) => number;
  setColumnWidth: (col: number, width: number) => void;
  setRowHeight: (row: number, height: number) => void;
  autoFitColumn: (col: number) => void;
  autoFitRow: (row: number) => void;
  getCellKey: (row: number, col: number) => string;
  insertCells: (option: 'shift-right' | 'shift-down' | 'shift-left' | 'shift-up' | 'entire-row' | 'entire-column') => void;
  deleteCells: (option: 'shift-left' | 'shift-up' | 'entire-row' | 'entire-column') => void;
  insertTable: (columns: number, rows: number) => void;
  moveColumnLeft: () => void;
  validateCell: (cellId: string, value: string) => ValidationResult;
  applyValidation: (range: string, validation: CellValidation) => void;
  removeValidationFromRange: (range: string) => void;
  getValidation: (cellId: string) => CellValidation | null;
  isFormulaMode: boolean;
  setIsFormulaMode: (mode: boolean) => void;
  formulaSelectionCells: string[];
  setFormulaSelectionCells: React.Dispatch<React.SetStateAction<string[]>>;
  activeFormula: string | null;
  setActiveFormula: (formula: string | null) => void;
  inputMessage: { title?: string; message?: string } | null;
  setInputMessage: (message: { title?: string; message?: string } | null) => void;
  // Formatting functions
  applyFormatToSelection: (formatKey: keyof CellFormat, value: any) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  setTextAlign: (align: 'left' | 'center' | 'right') => void;
  setFontFamily: (family: string) => void;
  setFontSize: (size: string) => void;
  // View state
  showGridlines: boolean;
  setShowGridlines: (show: boolean) => void;
  showFormulaBar: boolean;
  setShowFormulaBar: (show: boolean) => void;
  showHeadings: boolean;
  setShowHeadings: (show: boolean) => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  freezePanes: { row: number; col: number } | null;
  setFreezePanes: (panes: { row: number; col: number } | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  // Data operations
  sortData: (column: number, direction: 'asc' | 'desc') => void;
  filterData: (column: number, criteria: any) => void;
  removeDuplicates: (columns: number[]) => void;
  textToColumns: (column: number, delimiter: string) => void;
  // Clipboard operations  
  copySelection: () => void;
  cutSelection: () => void;
  pasteSelection: () => void;
  clearSelection: () => void;
  // Conditional formatting
  conditionalFormattingRules: any[];
  addConditionalFormattingRule: (rule: any) => void;
  updateConditionalFormattingRule: (id: string, rule: any) => void;
  deleteConditionalFormattingRule: (id: string) => void;
  reorderConditionalFormattingRule: (id: string, direction: 'up' | 'down') => void;
  toggleConditionalFormattingRule: (id: string, enabled: boolean) => void;
  evaluateConditionalFormatting: (cellKey: string, value: string) => any;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

export const SpreadsheetProvider: React.FC<{ children: React.ReactNode; initialData?: any }> = ({ children, initialData }) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  const [cellData, setCellData] = useState<{ [key: string]: string }>(initialData || {});
  const [cellFormats, setCellFormats] = useState<{ [key: string]: CellFormat }>({});
  const [cellValidations, setCellValidations] = useState<{ [key: string]: CellValidation }>({});
  const [inputMessage, setInputMessage] = useState<{ title?: string; message?: string } | null>(null);
  const [floatingImages, setFloatingImages] = useState<FloatingImage[]>([]);
  const [floatingTextBoxes, setFloatingTextBoxes] = useState<FloatingTextBox[]>([]);

  // AutoFit state
  const [columnWidths, setColumnWidths] = useState<Map<number, number>>(new Map());
  const [rowHeights, setRowHeights] = useState<Map<number, number>>(new Map());

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasTextSelection, setHasTextSelection] = useState(false);
  const [isTextBoxMode, setIsTextBoxMode] = useState(false);
  const [isShapeDrawMode, setIsShapeDrawMode] = useState(false);
  const [selectedShapeType, setSelectedShapeType] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [isFormulaMode, setIsFormulaMode] = useState(false);
  const [formulaSelectionCells, setFormulaSelectionCells] = useState<string[]>([]);
  const [activeFormula, setActiveFormula] = useState<string | null>(null);
  
  // View state
  const [showGridlines, setShowGridlines] = useState(true);
  const [showFormulaBar, setShowFormulaBar] = useState(true);
  const [showHeadings, setShowHeadings] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [freezePanes, setFreezePanes] = useState<{ row: number; col: number } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  
  // Clipboard state
  const [clipboardData, setClipboardData] = useState<{ data: { [key: string]: string }, formats: { [key: string]: any }, rows: number, cols: number } | null>(null);
  
  // Conditional formatting state
  const [conditionalFormattingRules, setConditionalFormattingRules] = useState<any[]>([]);

  // Auto-save effect - saves every 30 seconds
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        const { autoSaveSpreadsheet } = await import('../utils/spreadsheetBackend');
        await autoSaveSpreadsheet(
          {
            cellData,
            cellFormats,
            cellValidations,
            floatingImages,
            floatingTextBoxes,
          },
          userEmail
        );
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [cellData, cellFormats, cellValidations, floatingImages, floatingTextBoxes]);

  // Periodic activity update for collaboration (every 2 minutes)
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const currentSpreadsheetId = localStorage.getItem('currentSpreadsheetId');
    
    if (!userEmail || !currentSpreadsheetId) return;

    const activityInterval = setInterval(() => {
      updateCollaboratorActivity(currentSpreadsheetId, userEmail);
    }, 120000); // 2 minutes

    return () => clearInterval(activityInterval);
  }, []);

  // Update activity on cell changes
  const updateActivity = useCallback(() => {
    const userEmail = localStorage.getItem('userEmail');
    const currentSpreadsheetId = localStorage.getItem('currentSpreadsheetId');
    
    if (userEmail && currentSpreadsheetId) {
      updateCollaboratorActivity(currentSpreadsheetId, userEmail);
    }
  }, []);

  // Validation methods
  const validateCell = useCallback((cellId: string, value: string): ValidationResult => {
    const validation = cellValidations[cellId];
    if (!validation) {
      return { valid: true };
    }
    return validateCellValue(value, validation);
  }, [cellValidations]);

  const applyValidation = useCallback((range: string, validation: CellValidation) => {
    setCellValidations(prev => {
      const updated = { ...prev };
      const cells = parseRangeHelper(range);
      cells.forEach(cellId => {
        updated[cellId] = validation;
      });
      return updated;
    });
  }, []);

  const removeValidationFromRange = useCallback((range: string) => {
    setCellValidations(prev => {
      const updated = { ...prev };
      const cells = parseRangeHelper(range);
      cells.forEach(cellId => {
        delete updated[cellId];
      });
      return updated;
    });
  }, []);

  const getValidation = useCallback((cellId: string): CellValidation | null => {
    return cellValidations[cellId] || null;
  }, [cellValidations]);

  // Helper function to parse range
  const parseRangeHelper = (range: string): string[] => {
    if (!range.includes(':')) {
      return [range];
    }
    const [start, end] = range.split(':');
    const startCol = start.charCodeAt(0) - 65;
    const startRow = parseInt(start.substring(1));
    const endCol = end.charCodeAt(0) - 65;
    const endRow = parseInt(end.substring(1));
    const cells: string[] = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        cells.push(String.fromCharCode(65 + col) + row);
      }
    }
    return cells;
  };

  const getCellKey = (row: number, col: number) => {
    const getColumnLabel = (index: number) => {
      let label = '';
      let num = index;
      while (num >= 0) {
        label = String.fromCharCode(65 + (num % 26)) + label;
        num = Math.floor(num / 26) - 1;
      }
      return label;
    };
    return `${getColumnLabel(col)}${row + 1}`;
  };



  const insertCells = (option: 'shift-right' | 'shift-down' | 'shift-left' | 'shift-up' | 'entire-row' | 'entire-column') => {
    if (!selectedCell && !selectedRange) return;
    
    // Use range if available, otherwise use selected cell
    const startRow = selectedRange ? selectedRange.startRow : selectedCell!.row;
    const endRow = selectedRange ? selectedRange.endRow : selectedCell!.row;
    const startCol = selectedRange ? selectedRange.startCol : selectedCell!.col;
    const endCol = selectedRange ? selectedRange.endCol : selectedCell!.col;
    
    const row = startRow;
    const col = startCol;
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    
    if (option === 'shift-right') {
      for (let c = 25; c > col; c--) {
        const oldKey = getCellKey(row, c - 1);
        const newKey = getCellKey(row, c);
        if (newCellData[oldKey]) {
          newCellData[newKey] = newCellData[oldKey];
          delete newCellData[oldKey];
        }
        if (newCellFormats[oldKey]) {
          newCellFormats[newKey] = newCellFormats[oldKey];
          delete newCellFormats[oldKey];
        }
      }
    } else if (option === 'shift-down') {
      for (let r = 29; r > row; r--) {
        const oldKey = getCellKey(r - 1, col);
        const newKey = getCellKey(r, col);
        if (newCellData[oldKey]) {
          newCellData[newKey] = newCellData[oldKey];
          delete newCellData[oldKey];
        }
        if (newCellFormats[oldKey]) {
          newCellFormats[newKey] = newCellFormats[oldKey];
          delete newCellFormats[oldKey];
        }
      }
    } else if (option === 'shift-left') {
      for (let c = col; c < 25; c++) {
        const oldKey = getCellKey(row, c + 1);
        const newKey = getCellKey(row, c);
        if (newCellData[oldKey]) {
          newCellData[newKey] = newCellData[oldKey];
          delete newCellData[oldKey];
        }
        if (newCellFormats[oldKey]) {
          newCellFormats[newKey] = newCellFormats[oldKey];
          delete newCellFormats[oldKey];
        }
      }
    } else if (option === 'shift-up') {
      for (let r = row; r < 29; r++) {
        const oldKey = getCellKey(r + 1, col);
        const newKey = getCellKey(r, col);
        if (newCellData[oldKey]) {
          newCellData[newKey] = newCellData[oldKey];
          delete newCellData[oldKey];
        }
        if (newCellFormats[oldKey]) {
          newCellFormats[newKey] = newCellFormats[oldKey];
          delete newCellFormats[oldKey];
        }
      }
    } else if (option === 'entire-row') {
      for (let r = MAX_ROWS - 1; r > row; r--) {
        for (let c = 0; c < MAX_COLS; c++) {
          const oldKey = getCellKey(r - 1, c);
          const newKey = getCellKey(r, c);
          if (newCellData[oldKey]) {
            newCellData[newKey] = newCellData[oldKey];
            delete newCellData[oldKey];
          }
          if (newCellFormats[oldKey]) {
            newCellFormats[newKey] = newCellFormats[oldKey];
            delete newCellFormats[oldKey];
          }
        }
      }
    } else if (option === 'entire-column') {
      for (let c = MAX_COLS - 1; c > col; c--) {
        for (let r = 0; r < MAX_ROWS; r++) {
          const oldKey = getCellKey(r, c - 1);
          const newKey = getCellKey(r, c);
          if (newCellData[oldKey]) {
            newCellData[newKey] = newCellData[oldKey];
            delete newCellData[oldKey];
          }
          if (newCellFormats[oldKey]) {
            newCellFormats[newKey] = newCellFormats[oldKey];
            delete newCellFormats[oldKey];
          }
        }
      }
    }
    
    setCellData(newCellData);
    setCellFormats(newCellFormats);
    updateActivity(); // Update collaboration activity
  };

  const deleteCells = (option: 'shift-left' | 'shift-up' | 'entire-row' | 'entire-column') => {
    if (!selectedCell && !selectedRange) return;
    
    // Use range if available, otherwise use selected cell
    const startRow = selectedRange ? selectedRange.startRow : selectedCell!.row;
    const endRow = selectedRange ? selectedRange.endRow : selectedCell!.row;
    const startCol = selectedRange ? selectedRange.startCol : selectedCell!.col;
    const endCol = selectedRange ? selectedRange.endCol : selectedCell!.col;
    
    const row = startRow;
    const col = startCol;
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    
    if (option === 'shift-left') {
      // Clear current cell and shift cells from right
      const currentKey = getCellKey(row, col);
      delete newCellData[currentKey];
      delete newCellFormats[currentKey];
      
      for (let c = col + 1; c < MAX_COLS; c++) {
        const oldKey = getCellKey(row, c);
        const newKey = getCellKey(row, c - 1);
        if (newCellData[oldKey]) {
          newCellData[newKey] = newCellData[oldKey];
          delete newCellData[oldKey];
        }
        if (newCellFormats[oldKey]) {
          newCellFormats[newKey] = newCellFormats[oldKey];
          delete newCellFormats[oldKey];
        }
      }
    } else if (option === 'shift-up') {
      // Clear current cell and shift cells from below
      const currentKey = getCellKey(row, col);
      delete newCellData[currentKey];
      delete newCellFormats[currentKey];
      
      for (let r = row + 1; r < MAX_ROWS; r++) {
        const oldKey = getCellKey(r, col);
        const newKey = getCellKey(r - 1, col);
        if (newCellData[oldKey]) {
          newCellData[newKey] = newCellData[oldKey];
          delete newCellData[oldKey];
        }
        if (newCellFormats[oldKey]) {
          newCellFormats[newKey] = newCellFormats[oldKey];
          delete newCellFormats[oldKey];
        }
      }
    } else if (option === 'entire-row') {
      // Delete entire row and shift rows up
      for (let c = 0; c < MAX_COLS; c++) {
        const currentKey = getCellKey(row, c);
        delete newCellData[currentKey];
        delete newCellFormats[currentKey];
        
        for (let r = row + 1; r < MAX_ROWS; r++) {
          const oldKey = getCellKey(r, c);
          const newKey = getCellKey(r - 1, c);
          if (newCellData[oldKey]) {
            newCellData[newKey] = newCellData[oldKey];
            delete newCellData[oldKey];
          }
          if (newCellFormats[oldKey]) {
            newCellFormats[newKey] = newCellFormats[oldKey];
            delete newCellFormats[oldKey];
          }
        }
      }
    } else if (option === 'entire-column') {
      // Delete entire column and shift columns left
      for (let r = 0; r < MAX_ROWS; r++) {
        const currentKey = getCellKey(r, col);
        delete newCellData[currentKey];
        delete newCellFormats[currentKey];
        
        for (let c = col + 1; c < MAX_COLS; c++) {
          const oldKey = getCellKey(r, c);
          const newKey = getCellKey(r, c - 1);
          if (newCellData[oldKey]) {
            newCellData[newKey] = newCellData[oldKey];
            delete newCellData[oldKey];
          }
          if (newCellFormats[oldKey]) {
            newCellFormats[newKey] = newCellFormats[oldKey];
            delete newCellFormats[oldKey];
          }
        }
      }
    }
    
    setCellData(newCellData);
    setCellFormats(newCellFormats);
  };

  const insertTable = (columns: number, rows: number) => {
    // Guard against non-positive inputs - ensure at least 1 column and 2 rows (1 header + 1 data)
    const validColumns = Math.max(1, Math.floor(columns));
    const validRows = Math.max(2, Math.floor(rows)); // Minimum 2 rows: 1 header + 1 data

    // Determine starting position (use selected cell or A1)
    const startRow = selectedCell?.row ?? selectedRange?.startRow ?? 0;
    const startCol = selectedCell?.col ?? selectedRange?.startCol ?? 0;

    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };

    // Create header row with bold formatting and Excel-like styling
    for (let c = 0; c < validColumns; c++) {
      const cellKey = getCellKey(startRow, startCol + c);
      newCellData[cellKey] = `Column ${c + 1}`;
      newCellFormats[cellKey] = {
        ...newCellFormats[cellKey],
        bold: true,
        backgroundColor: '#4472C4', // Excel-like blue
        color: '#FFFFFF', // White text
        textAlign: 'center'
      };
    }

    // Create data rows with alternating background colors for better readability
    for (let r = 1; r < validRows; r++) {
      for (let c = 0; c < validColumns; c++) {
        const cellKey = getCellKey(startRow + r, startCol + c);
        // Initialize with empty string to make cells editable
        newCellData[cellKey] = '';
        // Apply alternating row colors (Excel-like banded rows)
        newCellFormats[cellKey] = {
          ...newCellFormats[cellKey],
          backgroundColor: r % 2 === 1 ? '#FFFFFF' : '#F2F2F2' // Odd rows white, even rows light gray
        };
      }
    }

    setCellData(newCellData);
    setCellFormats(newCellFormats);

    // Select the entire table range for immediate visibility
    setSelectedRange({
      startRow: startRow,
      startCol: startCol,
      endRow: startRow + validRows - 1,
      endCol: startCol + validColumns - 1
    });

    // Set active cell to first data cell (below header) for better UX
    setSelectedCell({
      row: startRow + 1,
      col: startCol
    });
  };

  const moveColumnLeft = () => {
    if (!selectedCell) return;
    
    const { col } = selectedCell;
    
    // Find the first empty column to the left
    let targetCol = -1;
    for (let c = 0; c < col; c++) {
      let isEmpty = true;
      for (let r = 0; r < 30; r++) {
        const key = getCellKey(r, c);
        if (cellData[key] && cellData[key].trim() !== '') {
          isEmpty = false;
          break;
        }
      }
      if (isEmpty) {
        targetCol = c;
        break;
      }
    }
    
    // If no empty column found to the left, do nothing
    if (targetCol === -1) return;
    
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    
    // Move entire column data and formats
    for (let r = 0; r < 30; r++) {
      const sourceKey = getCellKey(r, col);
      const targetKey = getCellKey(r, targetCol);
      
      if (newCellData[sourceKey]) {
        newCellData[targetKey] = newCellData[sourceKey];
        delete newCellData[sourceKey];
      }
      
      if (newCellFormats[sourceKey]) {
        newCellFormats[targetKey] = newCellFormats[sourceKey];
        delete newCellFormats[sourceKey];
      }
    }
    
    setCellData(newCellData);
    setCellFormats(newCellFormats);
    setSelectedCell({ row: selectedCell.row, col: targetCol });
  };

  // Formatting Functions - Apply to selected range or single cell
  const applyFormatToSelection = useCallback((formatKey: keyof CellFormat, value: any) => {
    const newFormats = { ...cellFormats };
    
    if (selectedRange) {
      // Apply to all cells in the range
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const key = getCellKey(row, col);
          newFormats[key] = { ...newFormats[key], [formatKey]: value };
        }
      }
    } else if (selectedCell) {
      // Apply to single cell
      const key = getCellKey(selectedCell.row, selectedCell.col);
      newFormats[key] = { ...newFormats[key], [formatKey]: value };
    }
    
    setCellFormats(newFormats);
  }, [cellFormats, selectedRange, selectedCell, getCellKey]);

  const toggleBold = useCallback(() => {
    if (!selectedCell && !selectedRange) return;
    
    const newFormats = { ...cellFormats };
    
    if (selectedRange) {
      // Check if all cells are bold to determine toggle state
      let allBold = true;
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const key = getCellKey(row, col);
          if (!newFormats[key]?.bold) {
            allBold = false;
            break;
          }
        }
        if (!allBold) break;
      }
      
      // Apply opposite state to all cells
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const key = getCellKey(row, col);
          newFormats[key] = { ...newFormats[key], bold: !allBold };
        }
      }
    } else if (selectedCell) {
      const key = getCellKey(selectedCell.row, selectedCell.col);
      const currentBold = newFormats[key]?.bold || false;
      newFormats[key] = { ...newFormats[key], bold: !currentBold };
    }
    
    setCellFormats(newFormats);
  }, [cellFormats, selectedRange, selectedCell, getCellKey]);

  const toggleItalic = useCallback(() => {
    if (!selectedCell && !selectedRange) return;
    
    const newFormats = { ...cellFormats };
    
    if (selectedRange) {
      let allItalic = true;
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const key = getCellKey(row, col);
          if (!newFormats[key]?.italic) {
            allItalic = false;
            break;
          }
        }
        if (!allItalic) break;
      }
      
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const key = getCellKey(row, col);
          newFormats[key] = { ...newFormats[key], italic: !allItalic };
        }
      }
    } else if (selectedCell) {
      const key = getCellKey(selectedCell.row, selectedCell.col);
      const currentItalic = newFormats[key]?.italic || false;
      newFormats[key] = { ...newFormats[key], italic: !currentItalic };
    }
    
    setCellFormats(newFormats);
  }, [cellFormats, selectedRange, selectedCell, getCellKey]);

  const toggleUnderline = useCallback(() => {
    if (!selectedCell && !selectedRange) return;
    
    const newFormats = { ...cellFormats };
    
    if (selectedRange) {
      let allUnderline = true;
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const key = getCellKey(row, col);
          if (!newFormats[key]?.underline) {
            allUnderline = false;
            break;
          }
        }
        if (!allUnderline) break;
      }
      
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const key = getCellKey(row, col);
          newFormats[key] = { ...newFormats[key], underline: !allUnderline };
        }
      }
    } else if (selectedCell) {
      const key = getCellKey(selectedCell.row, selectedCell.col);
      const currentUnderline = newFormats[key]?.underline || false;
      newFormats[key] = { ...newFormats[key], underline: !currentUnderline };
    }
    
    setCellFormats(newFormats);
  }, [cellFormats, selectedRange, selectedCell, getCellKey]);

  const setTextAlign = useCallback((align: 'left' | 'center' | 'right') => {
    applyFormatToSelection('textAlign', align);
  }, [applyFormatToSelection]);

  const setFontFamily = useCallback((family: string) => {
    applyFormatToSelection('fontFamily', family);
  }, [applyFormatToSelection]);

  const setFontSize = useCallback((size: string) => {
    applyFormatToSelection('fontSize', size);
  }, [applyFormatToSelection]);

  // Data Operations
  const sortData = useCallback((column: number, direction: 'asc' | 'desc') => {
    console.log('🔄 sortData called:', { column, direction, selectedRange, selectedCell });
    
    if (!selectedRange && !selectedCell) {
      console.log('❌ No selection - returning');
      return;
    }
    
    const startRow = selectedRange ? selectedRange.startRow : selectedCell!.row;
    const endRow = selectedRange ? selectedRange.endRow : selectedCell!.row;
    const startCol = selectedRange ? selectedRange.startCol : 0;
    const endCol = selectedRange ? selectedRange.endCol : MAX_COLS - 1;
    
    console.log('📊 Sort range:', { startRow, endRow, startCol, endCol, sortColumn: column });
    
    // Column parameter is the actual column to sort by (not offset)
    // Make sure it's within the selection range
    if (column < startCol || column > endCol) {
      console.warn('⚠️ Sort column outside selection range, using first column');
      column = startCol;
    }
    
    // Calculate offset within the selection
    const sortColumnOffset = column - startCol;
    
    console.log('📍 Sort column offset:', sortColumnOffset);
    
    // Collect rows with data and their original formats
    const rows: Array<{ 
      rowIndex: number; 
      values: string[]; 
      formats: any[] 
    }> = [];
    
    for (let r = startRow; r <= endRow; r++) {
      const rowValues: string[] = [];
      const rowFormats: any[] = [];
      
      for (let c = startCol; c <= endCol; c++) {
        const key = getCellKey(r, c);
        rowValues.push(cellData[key] || '');
        rowFormats.push(cellFormats[key] || {});
      }
      
      rows.push({ rowIndex: r, values: rowValues, formats: rowFormats });
    }
    
    console.log('📝 Rows before sort:', rows.map(r => ({ row: r.rowIndex, sortValue: r.values[sortColumnOffset], allValues: r.values })));
    
    // Sort rows based on the specified column
    rows.sort((a, b) => {
      const aVal = a.values[sortColumnOffset] || '';
      const bVal = b.values[sortColumnOffset] || '';
      
      // Try numeric comparison first
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        console.log(`Comparing numbers: ${aNum} vs ${bNum}`);
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Fall back to string comparison (case-insensitive)
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      console.log(`Comparing strings: "${aStr}" vs "${bStr}"`);
      
      if (direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
    
    console.log('✅ Rows after sort:', rows.map(r => ({ row: r.rowIndex, sortValue: r.values[sortColumnOffset], allValues: r.values })));
    
    // Apply sorted data back to cells
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    
    rows.forEach((row, index) => {
      const targetRow = startRow + index;
      
      row.values.forEach((value, colOffset) => {
        const targetCol = startCol + colOffset;
        const key = getCellKey(targetRow, targetCol);
        
        // Set the sorted value
        newCellData[key] = value;
        
        // Copy the format from the original position
        if (row.formats[colOffset] && Object.keys(row.formats[colOffset]).length > 0) {
          newCellFormats[key] = { ...row.formats[colOffset] };
        } else {
          delete newCellFormats[key];
        }
      });
    });
    
    console.log('💾 Setting new cell data and formats');
    setCellData(newCellData);
    setCellFormats(newCellFormats);
    
    // Force a re-render notification
    toast.success(`Sorted ${direction === 'asc' ? 'A→Z' : 'Z→A'} on column ${String.fromCharCode(65 + column)}`);
  }, [selectedRange, selectedCell, cellData, cellFormats, getCellKey]);

  const filterData = useCallback((column: number, criteria: any) => {
    // Placeholder for filter implementation
    console.log('Filter data:', column, criteria);
  }, []);

  const removeDuplicates = useCallback((columns: number[]) => {
    if (!selectedRange && !selectedCell) return;
    
    const startRow = selectedRange ? selectedRange.startRow : selectedCell!.row;
    const endRow = selectedRange ? selectedRange.endRow : selectedCell!.row + 10; // Default to 10 rows
    const startCol = selectedRange ? selectedRange.startCol : 0;
    const endCol = selectedRange ? selectedRange.endCol : 25;
    
    // Track unique row signatures
    const seen = new Set<string>();
    const rowsToKeep: number[] = [];
    
    for (let r = startRow; r <= endRow; r++) {
      // Create signature from specified columns
      const signature = columns.map(col => {
        const key = getCellKey(r, col);
        return cellData[key] || '';
      }).join('|');
      
      if (!seen.has(signature)) {
        seen.add(signature);
        rowsToKeep.push(r);
      }
    }
    
    // Create new data with only unique rows
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    
    // Clear all rows in range
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const key = getCellKey(r, c);
        delete newCellData[key];
        delete newCellFormats[key];
      }
    }
    
    // Re-add unique rows
    rowsToKeep.forEach((sourceRow, index) => {
      const targetRow = startRow + index;
      for (let c = startCol; c <= endCol; c++) {
        const sourceKey = getCellKey(sourceRow, c);
        const targetKey = getCellKey(targetRow, c);
        
        if (cellData[sourceKey]) {
          newCellData[targetKey] = cellData[sourceKey];
        }
        if (cellFormats[sourceKey]) {
          newCellFormats[targetKey] = { ...cellFormats[sourceKey] };
        }
      }
    });
    
    setCellData(newCellData);
    setCellFormats(newCellFormats);
  }, [selectedRange, selectedCell, cellData, cellFormats, getCellKey]);

  const textToColumns = useCallback((column: number, delimiter: string) => {
    if (!selectedRange && !selectedCell) return;
    
    const startRow = selectedRange ? selectedRange.startRow : selectedCell!.row;
    const endRow = selectedRange ? selectedRange.endRow : selectedCell!.row + 10;
    
    const newCellData = { ...cellData };
    
    for (let r = startRow; r <= endRow; r++) {
      const sourceKey = getCellKey(r, column);
      const sourceValue = cellData[sourceKey] || '';
      
      if (sourceValue) {
        const parts = sourceValue.split(delimiter);
        parts.forEach((part, index) => {
          const targetKey = getCellKey(r, column + index);
          newCellData[targetKey] = part.trim();
        });
      }
    }
    
    setCellData(newCellData);
  }, [selectedRange, selectedCell, cellData, getCellKey]);

  // Clipboard operations
  const copySelection = useCallback(() => {
    if (selectedRange) {
      const data: { [key: string]: string } = {};
      const formats: { [key: string]: any } = {};
      const { startRow, endRow, startCol, endCol } = selectedRange;
      
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cellKey = getCellKey(row, col);
          data[cellKey] = cellData[cellKey] || '';
          formats[cellKey] = cellFormats[cellKey] || {};
        }
      }
      
      const rows = endRow - startRow + 1;
      const cols = endCol - startCol + 1;
      setClipboardData({ data, formats, rows, cols });
    } else if (selectedCell) {
      const cellKey = getCellKey(selectedCell.row, selectedCell.col);
      setClipboardData({
        data: { [cellKey]: cellData[cellKey] || '' },
        formats: { [cellKey]: cellFormats[cellKey] || {} },
        rows: 1,
        cols: 1
      });
    }
  }, [selectedRange, selectedCell, cellData, cellFormats, getCellKey]);

  const cutSelection = useCallback(() => {
    copySelection();
    clearSelection();
  }, [copySelection]);

  const pasteSelection = useCallback(() => {
    if (!clipboardData) return;
    
    const targetRow = selectedCell?.row || selectedRange?.startRow || 0;
    const targetCol = selectedCell?.col || selectedRange?.startCol || 0;
    
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    const entries = Object.entries(clipboardData.data);
    
    if (entries.length === 0) return;
    
    const [firstKey] = entries[0];
    const [firstRow, firstCol] = firstKey.split('-').map(Number);
    
    entries.forEach(([cellKey, value]) => {
      const [origRow, origCol] = cellKey.split('-').map(Number);
      const offsetRow = origRow - firstRow;
      const offsetCol = origCol - firstCol;
      
      const newRow = targetRow + offsetRow;
      const newCol = targetCol + offsetCol;
      const newCellKey = getCellKey(newRow, newCol);
      
      newCellData[newCellKey] = value;
      newCellFormats[newCellKey] = clipboardData.formats[cellKey] || {};
    });
    
    setCellData(newCellData);
    setCellFormats(newCellFormats);
  }, [clipboardData, selectedCell, selectedRange, cellData, cellFormats, getCellKey]);

  const clearSelection = useCallback(() => {
    if (selectedRange) {
      const { startRow, endRow, startCol, endCol } = selectedRange;
      const newCellData = { ...cellData };
      
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cellKey = getCellKey(row, col);
          delete newCellData[cellKey];
        }
      }
      
      setCellData(newCellData);
    } else if (selectedCell) {
      const cellKey = getCellKey(selectedCell.row, selectedCell.col);
      const newCellData = { ...cellData };
      delete newCellData[cellKey];
      setCellData(newCellData);
    }
  }, [selectedRange, selectedCell, cellData, getCellKey]);

  // Conditional Formatting functions
  const addConditionalFormattingRule = useCallback((rule: any) => {
    setConditionalFormattingRules(prev => [...prev, rule]);
  }, []);

  const updateConditionalFormattingRule = useCallback((id: string, updatedRule: any) => {
    setConditionalFormattingRules(prev =>
      prev.map(rule => (rule.id === id ? updatedRule : rule))
    );
  }, []);

  const deleteConditionalFormattingRule = useCallback((id: string) => {
    setConditionalFormattingRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  const reorderConditionalFormattingRule = useCallback((id: string, direction: 'up' | 'down') => {
    setConditionalFormattingRules(prev => {
      const index = prev.findIndex(rule => rule.id === id);
      if (index === -1) return prev;
      
      const newRules = [...prev];
      if (direction === 'up' && index > 0) {
        [newRules[index - 1], newRules[index]] = [newRules[index], newRules[index - 1]];
      } else if (direction === 'down' && index < newRules.length - 1) {
        [newRules[index], newRules[index + 1]] = [newRules[index + 1], newRules[index]];
      }
      
      // Update priorities
      return newRules.map((rule, i) => ({ ...rule, priority: i }));
    });
  }, []);

  const toggleConditionalFormattingRule = useCallback((id: string, enabled: boolean) => {
    setConditionalFormattingRules(prev =>
      prev.map(rule => (rule.id === id ? { ...rule, enabled } : rule))
    );
  }, []);

  // Helper function to interpolate between two colors
  const interpolateColor = (color1: string, color2: string, ratio: number): string => {
    const hex = (color: string) => {
      const c = color.replace('#', '');
      return {
        r: parseInt(c.substring(0, 2), 16),
        g: parseInt(c.substring(2, 4), 16),
        b: parseInt(c.substring(4, 6), 16)
      };
    };
    
    const c1 = hex(color1);
    const c2 = hex(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const evaluateConditionalFormatting = useCallback((cellKey: string, value: string) => {
    const [row, col] = cellKey.split('-').map(Number);
    let appliedFormat: any = {};

    // Get enabled rules sorted by priority
    const enabledRules = conditionalFormattingRules
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of enabledRules) {
      // Check if cell is in range
      const rangeMatch = rule.range.match(/([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?/);
      if (!rangeMatch) continue;

      const startCol = rangeMatch[1].charCodeAt(0) - 65;
      const startRow = parseInt(rangeMatch[2]) - 1;
      const endCol = rangeMatch[3] ? rangeMatch[3].charCodeAt(0) - 65 : startCol;
      const endRow = rangeMatch[4] ? parseInt(rangeMatch[4]) - 1 : startRow;

      if (row < startRow || row > endRow || col < startCol || col > endCol) {
        continue;
      }

      let matches = false;

      // Evaluate rule based on type
      switch (rule.ruleType) {
        case 'highlight':
          const numValue = parseFloat(value);
          const compareValue = parseFloat(rule.criteria.value1);
          
          if (!isNaN(numValue) && !isNaN(compareValue)) {
            switch (rule.criteria.operator) {
              case 'greaterThan':
                matches = numValue > compareValue;
                break;
              case 'lessThan':
                matches = numValue < compareValue;
                break;
              case 'equalTo':
                matches = numValue === compareValue;
                break;
              case 'between':
                const compareValue2 = parseFloat(rule.criteria.value2);
                matches = numValue >= Math.min(compareValue, compareValue2) && 
                          numValue <= Math.max(compareValue, compareValue2);
                break;
            }
          } else if (rule.criteria.operator === 'contains') {
            matches = value.toLowerCase().includes((rule.criteria.value1 || '').toLowerCase());
          }
          break;

        case 'topBottom':
          // Collect all numeric values in range
          const rangeValues: { value: number; key: string }[] = [];
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const key = getCellKey(r, c);
              const val = parseFloat(cellData[key]);
              if (!isNaN(val)) {
                rangeValues.push({ value: val, key });
              }
            }
          }
          
          // Sort descending and check if current cell is in top N
          rangeValues.sort((a, b) => b.value - a.value);
          const topN = rule.criteria.topN || 10;
          const topValues = rangeValues.slice(0, topN);
          matches = topValues.some(item => item.key === cellKey);
          
          // Apply default formatting for top/bottom rules
          if (matches && !rule.format.bgColor) {
            appliedFormat.bgColor = '#dcfce7'; // Light green
            appliedFormat.textColor = '#166534'; // Dark green
          }
          break;

        case 'aboveBelow':
          // Calculate average of range
          const avgValues: number[] = [];
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const key = getCellKey(r, c);
              const val = parseFloat(cellData[key]);
              if (!isNaN(val)) avgValues.push(val);
            }
          }
          
          if (avgValues.length > 0) {
            const average = avgValues.reduce((a, b) => a + b, 0) / avgValues.length;
            const cellNum = parseFloat(value);
            if (!isNaN(cellNum)) {
              matches = rule.criteria.aboveAverage 
                ? cellNum > average 
                : cellNum < average;
                
              // Apply default formatting
              if (matches && !rule.format.bgColor) {
                appliedFormat.bgColor = '#dcfce7'; // Light green
                appliedFormat.textColor = '#166534'; // Dark green
              }
            }
          }
          break;

        case 'dataBars':
          // Data bars always apply to numeric values
          const dataBarValue = parseFloat(value);
          if (!isNaN(dataBarValue)) {
            // Collect all values to determine scale
            const allValues: number[] = [];
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startCol; c <= endCol; c++) {
                const key = getCellKey(r, c);
                const val = parseFloat(cellData[key]);
                if (!isNaN(val)) allValues.push(val);
              }
            }
            
            if (allValues.length > 0) {
              const minVal = Math.min(...allValues);
              const maxVal = Math.max(...allValues);
              const percentage = maxVal > minVal 
                ? ((dataBarValue - minVal) / (maxVal - minVal)) * 100 
                : 50;
              
              // Apply data bar as gradient background
              const barColor = rule.format.dataBarColor || '#3b82f6';
              appliedFormat.bgColor = `linear-gradient(to right, ${barColor} ${percentage}%, transparent ${percentage}%)`;
              matches = true;
            }
          }
          break;

        case 'colorScales':
          // Color scales apply gradient colors based on value position
          const scaleValue = parseFloat(value);
          if (!isNaN(scaleValue)) {
            const scaleValues: number[] = [];
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startCol; c <= endCol; c++) {
                const key = getCellKey(r, c);
                const val = parseFloat(cellData[key]);
                if (!isNaN(val)) scaleValues.push(val);
              }
            }
            
            if (scaleValues.length > 0) {
              const minVal = Math.min(...scaleValues);
              const maxVal = Math.max(...scaleValues);
              const scale = rule.format.colorScale;
              
              if (scale) {
                if (scale.type === '2color') {
                  // Interpolate between min and max colors
                  const ratio = maxVal > minVal ? (scaleValue - minVal) / (maxVal - minVal) : 0.5;
                  appliedFormat.bgColor = interpolateColor(scale.minColor, scale.maxColor, ratio);
                } else if (scale.type === '3color' && scale.midColor) {
                  // Three-way interpolation
                  const midVal = (minVal + maxVal) / 2;
                  if (scaleValue <= midVal) {
                    const ratio = maxVal > minVal ? (scaleValue - minVal) / (midVal - minVal) : 0.5;
                    appliedFormat.bgColor = interpolateColor(scale.minColor, scale.midColor, ratio);
                  } else {
                    const ratio = maxVal > midVal ? (scaleValue - midVal) / (maxVal - midVal) : 0.5;
                    appliedFormat.bgColor = interpolateColor(scale.midColor, scale.maxColor, ratio);
                  }
                }
                matches = true;
              }
            }
          }
          break;

        case 'iconSets':
          // Icon sets - apply different colored backgrounds based on value terciles
          const iconValue = parseFloat(value);
          if (!isNaN(iconValue)) {
            const iconValues: number[] = [];
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startCol; c <= endCol; c++) {
                const key = getCellKey(r, c);
                const val = parseFloat(cellData[key]);
                if (!isNaN(val)) iconValues.push(val);
              }
            }
            
            if (iconValues.length > 0) {
              iconValues.sort((a, b) => a - b);
              const tercile1 = iconValues[Math.floor(iconValues.length / 3)];
              const tercile2 = iconValues[Math.floor((iconValues.length * 2) / 3)];
              
              if (iconValue < tercile1) {
                appliedFormat.bgColor = '#fee2e2'; // Red tint
                appliedFormat.textColor = '#991b1b';
              } else if (iconValue < tercile2) {
                appliedFormat.bgColor = '#fef3c7'; // Yellow tint
                appliedFormat.textColor = '#92400e';
              } else {
                appliedFormat.bgColor = '#dcfce7'; // Green tint
                appliedFormat.textColor = '#166534';
              }
              matches = true;
            }
          }
          break;

        case 'duplicates':
          // Check if value appears more than once in the range
          let count = 0;
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const key = getCellKey(r, c);
              if (cellData[key] === value) count++;
            }
          }
          matches = count > 1;
          
          // Apply default formatting for duplicates
          if (matches && !rule.format.bgColor) {
            appliedFormat.bgColor = '#fed7aa'; // Light orange
            appliedFormat.textColor = '#9a3412'; // Dark orange
          }
          break;

        case 'unique':
          // Check if value appears only once in the range
          let uniqueCount = 0;
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const key = getCellKey(r, c);
              if (cellData[key] === value) uniqueCount++;
            }
          }
          matches = uniqueCount === 1;
          
          // Apply default formatting for unique values
          if (matches && !rule.format.bgColor) {
            appliedFormat.bgColor = '#dbeafe'; // Light blue
            appliedFormat.textColor = '#1e3a8a'; // Dark blue
          }
          break;

        case 'customFormula':
          // Simple formula evaluation (basic implementation)
          try {
            const formula = rule.criteria.formula;
            if (formula && formula.startsWith('=')) {
              const expr = formula.substring(1).replace(/([A-Z]+\d+)/g, (match) => {
                // Replace cell references with their values
                const refCol = match.match(/[A-Z]+/)[0].charCodeAt(0) - 65;
                const refRow = parseInt(match.match(/\d+/)[0]) - 1;
                const refKey = getCellKey(refRow, refCol);
                return cellData[refKey] || '0';
              });
              matches = eval(expr);
            }
          } catch (e) {
            console.error('Formula evaluation error:', e);
          }
          break;
      }

      if (matches) {
        // Merge format (higher priority wins for conflicts)
        appliedFormat = { ...appliedFormat, ...rule.format };
      }
    }

    return appliedFormat;
  }, [conditionalFormattingRules, cellData, getCellKey]);

  // AutoFit functions
  const getColumnWidth = useCallback((col: number): number => {
    return columnWidths.get(col) || AUTO_FIT_CONSTANTS.DEFAULT_COLUMN_WIDTH;
  }, [columnWidths]);

  const getRowHeight = useCallback((row: number): number => {
    return rowHeights.get(row) || AUTO_FIT_CONSTANTS.DEFAULT_ROW_HEIGHT;
  }, [rowHeights]);

  const setColumnWidth = useCallback((col: number, width: number) => {
    setColumnWidths(prev => {
      const next = new Map(prev);
      next.set(col, Math.max(width, AUTO_FIT_CONSTANTS.MIN_COLUMN_WIDTH));
      return next;
    });
  }, []);

  const setRowHeight = useCallback((row: number, height: number) => {
    setRowHeights(prev => {
      const next = new Map(prev);
      next.set(row, Math.max(height, AUTO_FIT_CONSTANTS.MIN_ROW_HEIGHT));
      return next;
    });
  }, []);

  const autoFitColumn = useCallback((col: number) => {
    let maxWidth = AUTO_FIT_CONSTANTS.MIN_COLUMN_WIDTH;
    
    // Measure all cells in this column
    for (let row = 0; row < MAX_ROWS; row++) {
      const key = getCellKey(row, col);
      const content = cellData[key];
      
      if (content) {
        const format = cellFormats[key];
        const measurement = measureCellContent(content, {
          format: {
            fontFamily: format?.fontFamily,
            fontSize: typeof format?.fontSize === 'number' ? String(format.fontSize) : format?.fontSize,
            bold: format?.bold,
            italic: format?.italic
          },
          wrap: false
        });
        
        maxWidth = Math.max(maxWidth, measurement.totalWidth);
      }
    }
    
    setColumnWidth(col, Math.min(maxWidth, 1000)); // Cap at 1000px
  }, [cellData, cellFormats, getCellKey, setColumnWidth]);

  const autoFitRow = useCallback((row: number) => {
    let maxHeight = AUTO_FIT_CONSTANTS.MIN_ROW_HEIGHT;
    
    // Measure all cells in this row
    for (let col = 0; col < MAX_COLS; col++) {
      const key = getCellKey(row, col);
      const content = cellData[key];
      
      if (content) {
        const format = cellFormats[key];
        const colWidth = getColumnWidth(col);
        const measurement = measureCellContent(content, {
          format: {
            fontFamily: format?.fontFamily,
            fontSize: typeof format?.fontSize === 'number' ? String(format.fontSize) : format?.fontSize,
            bold: format?.bold,
            italic: format?.italic
          },
          wrap: true,
          maxWidth: colWidth
        });
        
        maxHeight = Math.max(maxHeight, measurement.totalHeight);
      }
    }
    
    setRowHeight(row, Math.min(maxHeight, 500)); // Cap at 500px
  }, [cellData, cellFormats, getCellKey, getColumnWidth, setRowHeight]);

  // Auto-fit on cell data change
  useEffect(() => {
    const changedCells = new Map<number, Set<number>>(); // col -> Set of rows
    
    Object.keys(cellData).forEach(key => {
      const [rowStr, colStr] = key.split(',');
      const row = parseInt(rowStr);
      const col = parseInt(colStr);
      
      if (!isNaN(row) && !isNaN(col)) {
        if (!changedCells.has(col)) {
          changedCells.set(col, new Set());
        }
        changedCells.get(col)!.add(row);
      }
    });
    
    // Auto-fit changed columns
    requestAnimationFrame(() => {
      changedCells.forEach((rows, col) => {
        autoFitColumn(col);
        rows.forEach(row => autoFitRow(row));
      });
    });
  }, [cellData, autoFitColumn, autoFitRow]);

  return (
    <SpreadsheetContext.Provider value={{ 
      selectedCell, 
      setSelectedCell,
      selectedRange,
      setSelectedRange, 
      cellData, 
      setCellData,
      cellFormats,
      setCellFormats,
      cellValidations,
      setCellValidations,
      inputMessage,
      setInputMessage,
      floatingImages,
      setFloatingImages,
      floatingTextBoxes,
      setFloatingTextBoxes,
      selectedImage,
      setSelectedImage,
      hasTextSelection,
      setHasTextSelection,
      isTextBoxMode,
      setIsTextBoxMode,
      isShapeDrawMode,
      setIsShapeDrawMode,
      selectedShapeType,
      setSelectedShapeType,
      selectedShape,
      setSelectedShape,
      getCellKey,
      insertCells,
      deleteCells,
      insertTable,
      moveColumnLeft,
      validateCell,
      applyValidation,
      removeValidationFromRange,
      getValidation,
      isFormulaMode,
      setIsFormulaMode,
      formulaSelectionCells,
      setFormulaSelectionCells,
      activeFormula,
      setActiveFormula,
      applyFormatToSelection,
      toggleBold,
      toggleItalic,
      toggleUnderline,
      setTextAlign,
      setFontFamily,
      setFontSize,
      showGridlines,
      setShowGridlines,
      showFormulaBar,
      setShowFormulaBar,
      showHeadings,
      setShowHeadings,
      zoomLevel,
      setZoomLevel,
      freezePanes,
      setFreezePanes,
      theme,
      setTheme,
      sortData,
      filterData,
      removeDuplicates,
      textToColumns,
      copySelection,
      cutSelection,
      pasteSelection,
      clearSelection,
      conditionalFormattingRules,
      addConditionalFormattingRule,
      updateConditionalFormattingRule,
      deleteConditionalFormattingRule,
      reorderConditionalFormattingRule,
      toggleConditionalFormattingRule,
      evaluateConditionalFormatting,
      columnWidths,
      rowHeights,
      getColumnWidth,
      getRowHeight,
      setColumnWidth,
      setRowHeight,
      autoFitColumn,
      autoFitRow
    }}>
      {children}
    </SpreadsheetContext.Provider>
  );
};

export const useSpreadsheet = () => {
  const ctx = useContext(SpreadsheetContext);
  if (!ctx) throw new Error('useSpreadsheet must be used within SpreadsheetProvider');
  return ctx;
};