import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface CellFormat {
  fontFamily?: string;
  fontSize?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
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
  floatingImages: FloatingImage[];
  setFloatingImages: React.Dispatch<React.SetStateAction<FloatingImage[]>>;
  floatingShapes: FloatingShape[];
  setFloatingShapes: React.Dispatch<React.SetStateAction<FloatingShape[]>>;
  floatingCharts: FloatingChart[];
  setFloatingCharts: React.Dispatch<React.SetStateAction<FloatingChart[]>>;
  floatingTextBoxes: FloatingTextBox[];
  setFloatingTextBoxes: React.Dispatch<React.SetStateAction<FloatingTextBox[]>>;
  selectedImage: string | null;
  setSelectedImage: (id: string | null) => void;
  hasTextSelection: boolean;
  setHasTextSelection: (hasSelection: boolean) => void;
  isTextBoxMode: boolean;
  setIsTextBoxMode: (mode: boolean) => void;
  getCellKey: (row: number, col: number) => string;
  insertCells: (option: 'shift-right' | 'shift-down' | 'shift-left' | 'shift-up' | 'entire-row' | 'entire-column') => void;
  deleteCells: (option: 'shift-left' | 'shift-up' | 'entire-row' | 'entire-column') => void;
  moveColumnLeft: () => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

export const SpreadsheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  const [cellData, setCellData] = useState<{ [key: string]: string }>({});
  const [cellFormats, setCellFormats] = useState<{ [key: string]: CellFormat }>({});
  const [floatingImages, setFloatingImages] = useState<FloatingImage[]>([]);
  const [floatingShapes, setFloatingShapes] = useState<FloatingShape[]>([]);
  const [floatingCharts, setFloatingCharts] = useState<FloatingChart[]>([]);
  const [floatingTextBoxes, setFloatingTextBoxes] = useState<FloatingTextBox[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasTextSelection, setHasTextSelection] = useState(false);
  const [isTextBoxMode, setIsTextBoxMode] = useState(false);

  const getCellKey = (row: number, col: number) => {
    const getColumnLabel = (index: number) => String.fromCharCode(65 + index);
    return `${getColumnLabel(col)}${row + 1}`;
  };



  const insertCells = (option: 'shift-right' | 'shift-down' | 'shift-left' | 'shift-up' | 'entire-row' | 'entire-column') => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
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
      for (let r = 29; r > row; r--) {
        for (let c = 0; c < 26; c++) {
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
      for (let c = 25; c > col; c--) {
        for (let r = 0; r < 30; r++) {
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
  };

  const deleteCells = (option: 'shift-left' | 'shift-up' | 'entire-row' | 'entire-column') => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    
    if (option === 'shift-left') {
      // Clear current cell and shift cells from right
      const currentKey = getCellKey(row, col);
      delete newCellData[currentKey];
      delete newCellFormats[currentKey];
      
      for (let c = col + 1; c < 26; c++) {
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
      
      for (let r = row + 1; r < 30; r++) {
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
      for (let c = 0; c < 26; c++) {
        const currentKey = getCellKey(row, c);
        delete newCellData[currentKey];
        delete newCellFormats[currentKey];
        
        for (let r = row + 1; r < 30; r++) {
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
      for (let r = 0; r < 30; r++) {
        const currentKey = getCellKey(r, col);
        delete newCellData[currentKey];
        delete newCellFormats[currentKey];
        
        for (let c = col + 1; c < 26; c++) {
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
      floatingImages,
      setFloatingImages,
      floatingShapes,
      setFloatingShapes,
      floatingCharts,
      setFloatingCharts,
      floatingTextBoxes,
      setFloatingTextBoxes,
      selectedImage,
      setSelectedImage,
      hasTextSelection,
      setHasTextSelection,
      isTextBoxMode,
      setIsTextBoxMode,
      getCellKey,
      insertCells,
      deleteCells,
      moveColumnLeft
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