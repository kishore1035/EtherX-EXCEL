import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSpreadsheet } from './SpreadsheetContext';

// Cell data structure matching SpreadsheetContext
interface CellData {
  value: string;
  format?: {
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
  };
}

// Clipboard payload representing a rectangular range
interface ClipboardPayload {
  rows: number;
  cols: number;
  startRow: number;
  startCol: number;
  cells: CellData[][]; // 2D array [row][col]
  isCut: boolean;
}

interface ClipboardContextType {
  copySelection: () => void;
  cutSelection: () => void;
  pasteClipboard: () => void;
  hasClipboardData: () => boolean;
  clearClipboard: () => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const ClipboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clipboard, setClipboard] = useState<ClipboardPayload | null>(null);
  const spreadsheet = useSpreadsheet();

  // Helper to get column label from index
  const getColumnLabel = useCallback((index: number): string => {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  }, []);

  // Helper to get cell key
  const getCellKey = useCallback((row: number, col: number): string => {
    return `${getColumnLabel(col)}${row + 1}`;
  }, [getColumnLabel]);

  // Copy selected range to clipboard
  const copySelection = useCallback(() => {
    const { selectedRange, selectedCell, cellData, cellFormats } = spreadsheet;
    
    // Determine the range to copy
    let startRow: number, startCol: number, endRow: number, endCol: number;
    
    if (selectedRange) {
      startRow = selectedRange.startRow;
      startCol = selectedRange.startCol;
      endRow = selectedRange.endRow;
      endCol = selectedRange.endCol;
    } else if (selectedCell) {
      startRow = endRow = selectedCell.row;
      startCol = endCol = selectedCell.col;
    } else {
      return; // Nothing selected
    }

    const rows = endRow - startRow + 1;
    const cols = endCol - startCol + 1;
    
    // Extract cell data into 2D array
    const cells: CellData[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: CellData[] = [];
      for (let c = 0; c < cols; c++) {
        const cellKey = getCellKey(startRow + r, startCol + c);
        const value = cellData[cellKey] || '';
        const format = cellFormats[cellKey] ? { ...cellFormats[cellKey] } : undefined;
        
        row.push({ value, format });
      }
      cells.push(row);
    }

    // Create clipboard payload
    const payload: ClipboardPayload = {
      rows,
      cols,
      startRow,
      startCol,
      cells,
      isCut: false
    };

    setClipboard(payload);

    // Also copy to system clipboard as TSV (tab-separated values)
    try {
      const tsvData = cells
        .map(row => row.map(cell => cell.value).join('\t'))
        .join('\n');
      navigator.clipboard.writeText(tsvData);
    } catch (err) {
      console.warn('Could not write to system clipboard:', err);
    }
  }, [spreadsheet, getCellKey]);

  // Cut selected range to clipboard
  const cutSelection = useCallback(() => {
    const { selectedRange, selectedCell, cellData, cellFormats, setCellData, setCellFormats } = spreadsheet;
    
    // First, copy the selection
    copySelection();
    
    if (!clipboard && !selectedRange && !selectedCell) return;

    // Mark clipboard as cut
    if (clipboard) {
      setClipboard({ ...clipboard, isCut: true });
    }

    // Determine the range to clear
    let startRow: number, startCol: number, endRow: number, endCol: number;
    
    if (selectedRange) {
      startRow = selectedRange.startRow;
      startCol = selectedRange.startCol;
      endRow = selectedRange.endRow;
      endCol = selectedRange.endCol;
    } else if (selectedCell) {
      startRow = endRow = selectedCell.row;
      startCol = endCol = selectedCell.col;
    } else {
      return;
    }

    // Clear cell data and formats in the selected range
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cellKey = getCellKey(r, c);
        delete newCellData[cellKey];
        delete newCellFormats[cellKey];
      }
    }

    setCellData(newCellData);
    setCellFormats(newCellFormats);
  }, [spreadsheet, clipboard, copySelection, getCellKey]);

  // Paste clipboard data at active cell
  const pasteClipboard = useCallback(() => {
    if (!clipboard) return;

    const { selectedCell, cellData, cellFormats, setCellData, setCellFormats } = spreadsheet;
    
    if (!selectedCell) return; // No active cell to paste to

    const targetRow = selectedCell.row;
    const targetCol = selectedCell.col;

    // Clone current state
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };

    // Paste each cell from clipboard
    for (let r = 0; r < clipboard.rows; r++) {
      for (let c = 0; c < clipboard.cols; c++) {
        const cellData_item = clipboard.cells[r][c];
        const pasteRow = targetRow + r;
        const pasteCol = targetCol + c;
        const pasteKey = getCellKey(pasteRow, pasteCol);

        // Paste value
        if (cellData_item.value) {
          newCellData[pasteKey] = cellData_item.value;
        } else {
          delete newCellData[pasteKey];
        }

        // Paste format (deep clone to avoid shared objects)
        if (cellData_item.format) {
          newCellFormats[pasteKey] = { ...cellData_item.format };
        }
      }
    }

    // Update spreadsheet state
    setCellData(newCellData);
    setCellFormats(newCellFormats);

    // If it was a cut operation, clear the clipboard
    if (clipboard.isCut) {
      setClipboard(null);
    }
  }, [clipboard, spreadsheet, getCellKey]);

  // Check if clipboard has data
  const hasClipboardData = useCallback(() => {
    return clipboard !== null;
  }, [clipboard]);

  // Clear clipboard
  const clearClipboard = useCallback(() => {
    setClipboard(null);
  }, []);

  return (
    <ClipboardContext.Provider value={{ 
      copySelection, 
      cutSelection, 
      pasteClipboard, 
      hasClipboardData, 
      clearClipboard 
    }}>
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboard = () => {
  const ctx = useContext(ClipboardContext);
  if (!ctx) throw new Error('useClipboard must be used within ClipboardProvider');
  return ctx;
};

export default ClipboardContext;
