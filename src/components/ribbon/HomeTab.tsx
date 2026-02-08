import React from 'react';
import { 
  Clipboard, 
  Copy, 
  Scissors, 
  ClipboardPaste,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Upload,
  Download,
  FileText,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Plus,
  Minus,
  Check,
  ChevronUp,
  Trash2,
  Paintbrush,
  Type
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Icon3D, IconButton3D } from '../ui/Icon3D';
import { SmallRibbonIcon } from '../ui/RibbonIcon';
import { BordersDropdown, type BorderPreset } from '../BordersDropdown';

import { useClipboard } from '../../contexts/ClipboardContext';
import { useSpreadsheet } from '../../contexts/SpreadsheetContext';

import FloatingDropdown from '../ui/FloatingDropdown';
import { exportToCSV } from '../../utils/csvExport';
import { useState } from 'react';

// Import font registry
import { FONT_REGISTRY, getFontCSS } from '../../config/fonts';

interface HomeTabProps {
  isDarkMode: boolean;
}

export function HomeTab({ isDarkMode }: HomeTabProps) {
  const { copySelection, cutSelection, pasteClipboard } = useClipboard();
  const { 
    selectedCell, 
    selectedRange, 
    cellData, 
    setCellData, 
    cellFormats, 
    setCellFormats, 
    hasTextSelection, 
    getCellKey, 
    insertCells, 
    deleteCells,
    clearSelection
  } = useSpreadsheet();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [insertRowAboveCount, setInsertRowAboveCount] = useState(1);
  const [insertRowBelowCount, setInsertRowBelowCount] = useState(1);
  const [insertColLeftCount, setInsertColLeftCount] = useState(1);
  const [insertColRightCount, setInsertColRightCount] = useState(1);
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [fillColorOpen, setFillColorOpen] = useState(false);

  // Preset color palette for quick selection
  const colorPalette = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#C00000', '#FFC000', '#00B050', '#00B0F0', '#7030A0', '#808080', '#D9D9D9', '#F2F2F2'
  ];

  const openDropdown = (menuName: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setOpenMenu(menuName);
    setAnchorRect(rect);
  };

  const closeDropdown = () => {
    setOpenMenu(null);
    setAnchorRect(null);
  };

  const handleInsertWithCount = (type: string, count: number) => {
    for (let i = 0; i < count; i++) {
      if (type === 'row-above') insertCells('entire-row');
      else if (type === 'row-below') insertCells('entire-row');
      else if (type === 'col-left') insertCells('entire-column');
      else if (type === 'col-right') insertCells('entire-column');
    }
    setAppliedActions(prev => new Set([...prev, type]));
    setTimeout(() => setAppliedActions(prev => {
      const newSet = new Set(prev);
      newSet.delete(type);
      return newSet;
    }), 2000);
  };

  const performInsertRows = (startRow: number, count: number, direction: 'above' | 'below') => {
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    const maxRows = 1000;
    const maxCols = 26;
    
    const insertAtRow = direction === 'above' ? startRow : startRow + 1;
    
    // Shift existing rows down
    for (let row = maxRows - 1; row >= insertAtRow; row--) {
      for (let col = 0; col < maxCols; col++) {
        const oldKey = getCellKey(row, col);
        const newKey = getCellKey(row + count, col);
        
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
    
    setCellData(newCellData);
    setCellFormats(newCellFormats);
  };

  const performInsertColumns = (startCol: number, count: number, direction: 'left' | 'right') => {
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    const maxRows = 1000;
    const maxCols = 26;
    
    const insertAtCol = direction === 'left' ? startCol : startCol + 1;
    
    // Shift existing columns right
    for (let col = maxCols - 1; col >= insertAtCol; col--) {
      for (let row = 0; row < maxRows; row++) {
        const oldKey = getCellKey(row, col);
        const newKey = getCellKey(row, col + count);
        
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
    
    setCellData(newCellData);
    setCellFormats(newCellFormats);
  };

  const handleInsertAll = () => {
    if (!selectedCell && !selectedRange) return;
    
    const row = selectedRange ? selectedRange.startRow : selectedCell!.row;
    const col = selectedRange ? selectedRange.startCol : selectedCell!.col;
    
    // Execute insertions in order to avoid conflicts
    if (insertRowAboveCount > 0) {
      performInsertRows(row, insertRowAboveCount, 'above');
    }
    if (insertRowBelowCount > 0) {
      performInsertRows(row, insertRowBelowCount, 'below');
    }
    if (insertColLeftCount > 0) {
      performInsertColumns(col, insertColLeftCount, 'left');
    }
    if (insertColRightCount > 0) {
      performInsertColumns(col, insertColRightCount, 'right');
    }
    
    // Reset counters after successful insertion
    setInsertRowAboveCount(1);
    setInsertRowBelowCount(1);
    setInsertColLeftCount(1);
    setInsertColRightCount(1);
    
    // Show success feedback
    setAppliedActions(new Set(['insert-complete']));
    setTimeout(() => setAppliedActions(new Set()), 2000);
  };

  const handleDeleteBlankRows = () => {
    // Simple implementation - in real Excel this would be more complex
    const newCellData = { ...cellData };
    const keysToDelete: string[] = [];
    
    for (let row = 0; row < 30; row++) {
      let isRowEmpty = true;
      for (let col = 0; col < 26; col++) {
        const cellKey = getCellKey(row, col);
        if (newCellData[cellKey] && newCellData[cellKey].trim() !== '') {
          isRowEmpty = false;
          break;
        }
      }
      if (isRowEmpty) {
        for (let col = 0; col < 26; col++) {
          const cellKey = getCellKey(row, col);
          keysToDelete.push(cellKey);
        }
      }
    }
    
    keysToDelete.forEach(key => delete newCellData[key]);
    setCellData(newCellData);
  };

  const handleDeleteCell = () => {
    if (!selectedCell && !selectedRange) return;
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    
    if (selectedRange) {
      // Delete all cells in the range
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const cellKey = getCellKey(row, col);
          delete newCellData[cellKey];
          delete newCellFormats[cellKey];
        }
      }
    } else if (selectedCell) {
      const cellKey = getCellKey(selectedCell.row, selectedCell.col);
      delete newCellData[cellKey];
      delete newCellFormats[cellKey];
    }
    
    setCellData(newCellData);
    setCellFormats(newCellFormats);
  };
  
  const buttonClass = isDarkMode 
    ? 'hover:bg-gray-700 text-gray-200 border border-transparent hover:border-yellow-500/30' 
    : 'hover:bg-gray-50 text-gray-900 border border-transparent hover:border-transparent shadow-sm';
  
  const inputClass = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-gray-200'
    : 'bg-white border-gray-300 text-gray-900';

  const handleClipboardAction = async (action: 'copy' | 'cut' | 'paste') => {
    if (!selectedCell && !selectedRange) return;
    
    if (action === 'copy') {
      copySelection();
    } else if (action === 'cut') {
      cutSelection();
    } else if (action === 'paste') {
      pasteClipboard();
    }
  };

  const handleFormatChange = (formatType: string, value: any) => {
    if (!selectedCell && !selectedRange) return;
    
    let newValue = value;
    if (formatType === 'fontSize') {
      // Ensure fontSize is stored as a string with 'px' for CSS
      if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
        newValue = value + 'px';
      }
    } else if (formatType === 'fontFamily') {
      // Convert font name to CSS font-family string using registry
      newValue = getFontCSS(value);
      console.log(`🔤 Font selected: ${value} → CSS: ${newValue}`);
    }
    
    const newFormats = { ...cellFormats };
    
    if (selectedRange) {
      // Apply to all cells in the range
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const cellKey = getCellKey(row, col);
          newFormats[cellKey] = {
            ...newFormats[cellKey],
            [formatType]: newValue
          };
        }
      }
    } else if (selectedCell) {
      // Apply to single cell
      const cellKey = getCellKey(selectedCell.row, selectedCell.col);
      newFormats[cellKey] = {
        ...newFormats[cellKey],
        [formatType]: newValue
      };
    }
    
    setCellFormats(newFormats);
  };

  const getCurrentFormat = (formatType: string) => {
    // Check the first cell in the selection (either single cell or top-left of range)
    const checkCell = selectedRange 
      ? { row: selectedRange.startRow, col: selectedRange.startCol }
      : selectedCell;
    
    if (!checkCell) return undefined;
    const cellKey = getCellKey(checkCell.row, checkCell.col);
    return cellFormats[cellKey]?.[formatType as keyof typeof cellFormats[string]];
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csv = event.target?.result as string;
          const rows = csv.split('\n');
          const newCellData: { [key: string]: string } = {};
          
          rows.forEach((row, rowIndex) => {
            const cells = row.split(',');
            cells.forEach((cell, colIndex) => {
              if (cell.trim()) {
                const colLetter = String.fromCharCode(65 + colIndex);
                const cellKey = `${colLetter}${rowIndex + 1}`;
                newCellData[cellKey] = cell.trim().replace(/^"|"$/g, '');
              }
            });
          });
          
          setCellData(newCellData);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportCSV = () => {
    exportToCSV(cellData, 'spreadsheet.csv');
  };

  const handleExportPDF = () => {
    // Simple PDF export using browser print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const tableHTML = generateTableHTML();
      printWindow.document.write(`
        <html>
          <head>
            <title>Spreadsheet Export</title>
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            ${tableHTML}
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const generateTableHTML = () => {
    const cellKeys = Object.keys(cellData);
    if (cellKeys.length === 0) return '<p>No data to export</p>';
    
    let maxRow = 0;
    let maxCol = 0;
    
    cellKeys.forEach(key => {
      const match = key.match(/^([A-Z]+)(\d+)$/);
      if (match) {
        const col = match[1].charCodeAt(0) - 65;
        const row = parseInt(match[2]) - 1;
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col);
      }
    });
    
    let html = '<table>';
    for (let row = 0; row <= maxRow; row++) {
      html += '<tr>';
      for (let col = 0; col <= maxCol; col++) {
        const colLetter = String.fromCharCode(65 + col);
        const cellKey = `${colLetter}${row + 1}`;
        const cellValue = cellData[cellKey] || '';
        html += `<td>${cellValue}</td>`;
      }
      html += '</tr>';
    }
    html += '</table>';
    return html;
  };

  const formatNumber = (value: string, format: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    switch (format) {
      case 'Number':
        return num.toFixed(2);
      case 'Currency':
        return `$${num.toFixed(2)}`;
      case 'Percentage':
        return `${(num * 100).toFixed(2)}%`;
      case 'Date':
        return new Date(num).toLocaleDateString();
      default:
        return value;
    }
  };

  const handleApplyBorder = async (preset: BorderPreset) => {
    if (!selectedCell && !selectedRange) return;

    let range: { startRow: number; endRow: number; startCol: number; endCol: number };
    
    if (selectedRange) {
      range = selectedRange;
    } else if (selectedCell) {
      range = {
        startRow: selectedCell.row,
        endRow: selectedCell.row,
        startCol: selectedCell.col,
        endCol: selectedCell.col,
      };
    } else {
      return;
    }

    const thinBorder = { style: 'thin' as const, color: '#000000' };
    const thickBorder = { style: 'thick' as const, color: '#000000' };
    const doubleBorder = { style: 'double' as const, color: '#000000' };
    const noBorder = null;

    // Update local state immediately for instant feedback
    const newFormats = { ...cellFormats };
    
    // Helper to set border (or clear if null)
    const setBorder = (row: number, col: number, side: 'top' | 'right' | 'bottom' | 'left', border: { style: string; color: string } | null) => {
      const cellKey = getCellKey(row, col);
      if (!newFormats[cellKey]) {
        newFormats[cellKey] = {};
      }
      if (!(newFormats[cellKey] as any).borders) {
        (newFormats[cellKey] as any).borders = {};
      }
      
      if (border === null) {
        delete (newFormats[cellKey] as any).borders[side];
      } else {
        (newFormats[cellKey] as any).borders[side] = border;
      }
    };

    const { startRow, endRow, startCol, endCol } = range;
    
    switch (preset) {
      case 'ALL':
        // All Borders: Complete grid with no double lines
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            // TOP: only first row gets top border
            const topBorder = (r === startRow) ? thinBorder : noBorder;
            
            // BOTTOM: all rows get bottom border (creates internal horizontals + bottom frame)
            const bottomBorder = thinBorder;
            
            // LEFT: only first column gets left border
            const leftBorder = (c === startCol) ? thinBorder : noBorder;
            
            // RIGHT: all columns get right border (creates internal verticals + right frame)
            const rightBorder = thinBorder;
            
            setBorder(r, c, 'top', topBorder);
            setBorder(r, c, 'bottom', bottomBorder);
            setBorder(r, c, 'left', leftBorder);
            setBorder(r, c, 'right', rightBorder);
          }
        }
        break;

      case 'OUTSIDE':
        // Outside Borders: Only perimeter, no internal lines
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const topBorder = (r === startRow) ? thinBorder : noBorder;
            const bottomBorder = (r === endRow) ? thinBorder : noBorder;
            const leftBorder = (c === startCol) ? thinBorder : noBorder;
            const rightBorder = (c === endCol) ? thinBorder : noBorder;
            
            setBorder(r, c, 'top', topBorder);
            setBorder(r, c, 'bottom', bottomBorder);
            setBorder(r, c, 'left', leftBorder);
            setBorder(r, c, 'right', rightBorder);
          }
        }
        break;

      case 'THICK_OUTSIDE':
        // Thick Outside Borders
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const topBorder = (r === startRow) ? thickBorder : noBorder;
            const bottomBorder = (r === endRow) ? thickBorder : noBorder;
            const leftBorder = (c === startCol) ? thickBorder : noBorder;
            const rightBorder = (c === endCol) ? thickBorder : noBorder;
            
            setBorder(r, c, 'top', topBorder);
            setBorder(r, c, 'bottom', bottomBorder);
            setBorder(r, c, 'left', leftBorder);
            setBorder(r, c, 'right', rightBorder);
          }
        }
        break;

      case 'BOTTOM':
        // Bottom Border: only bottom edge of last row
        for (let c = startCol; c <= endCol; c++) {
          setBorder(endRow, c, 'bottom', thinBorder);
        }
        break;

      case 'TOP':
        // Top Border: only top edge of first row
        console.log('Applying TOP border to row', startRow, 'columns', startCol, 'to', endCol);
        for (let c = startCol; c <= endCol; c++) {
          const cellKey = getCellKey(startRow, c);
          console.log('Setting top border for cell:', cellKey);
          setBorder(startRow, c, 'top', thinBorder);
        }
        break;

      case 'LEFT':
        // Left Border: only left edge of first column
        console.log('Applying LEFT border to col', startCol, 'rows', startRow, 'to', endRow);
        for (let r = startRow; r <= endRow; r++) {
          const cellKey = getCellKey(r, startCol);
          console.log('Setting left border for cell:', cellKey);
          setBorder(r, startCol, 'left', thinBorder);
        }
        break;

      case 'RIGHT':
        // Right Border: only right edge of last column
        for (let r = startRow; r <= endRow; r++) {
          setBorder(r, endCol, 'right', thinBorder);
        }
        break;

      case 'NONE':
        // No Border: clear all borders
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            setBorder(r, c, 'top', noBorder);
            setBorder(r, c, 'bottom', noBorder);
            setBorder(r, c, 'left', noBorder);
            setBorder(r, c, 'right', noBorder);
          }
        }
        break;

      case 'BOTTOM_THICK':
        // Thick Bottom Border
        for (let c = startCol; c <= endCol; c++) {
          setBorder(endRow, c, 'bottom', thickBorder);
        }
        break;

      case 'BOTTOM_DOUBLE':
        // Double Bottom Border
        for (let c = startCol; c <= endCol; c++) {
          setBorder(endRow, c, 'bottom', doubleBorder);
        }
        break;

      case 'TOP_BOTTOM':
        // Top and Bottom Border (both thin)
        for (let c = startCol; c <= endCol; c++) {
          setBorder(startRow, c, 'top', thinBorder);
          setBorder(endRow, c, 'bottom', thinBorder);
        }
        break;

      case 'TOP_THICK_BOTTOM':
        // Top (thin) and Thick Bottom Border
        for (let c = startCol; c <= endCol; c++) {
          setBorder(startRow, c, 'top', thinBorder);
          setBorder(endRow, c, 'bottom', thickBorder);
        }
        break;

      case 'TOP_DOUBLE_BOTTOM':
        // Top (thin) and Double Bottom Border
        for (let c = startCol; c <= endCol; c++) {
          setBorder(startRow, c, 'top', thinBorder);
          setBorder(endRow, c, 'bottom', doubleBorder);
        }
        break;
    }

    console.log('Border application complete. New formats:', newFormats);
    const sampleCell = getCellKey(startRow, startCol);
    console.log('Sample cell format after border:', sampleCell, '=', JSON.stringify(newFormats[sampleCell], null, 2));
    setCellFormats(newFormats);
  };

  const handleNumberFormat = (format: string) => {
    if (!selectedCell && !selectedRange) return;
    
    handleFormatChange('numberFormat', format);
    
    const newCellData = { ...cellData };
    
    if (selectedRange) {
      // Apply to all cells in the range
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const cellKey = getCellKey(row, col);
          const currentValue = cellData[cellKey] || '';
          if (currentValue && !isNaN(parseFloat(currentValue))) {
            newCellData[cellKey] = formatNumber(currentValue, format);
          }
        }
      }
    } else if (selectedCell) {
      const cellKey = getCellKey(selectedCell.row, selectedCell.col);
      const currentValue = cellData[cellKey] || '';
      if (currentValue && !isNaN(parseFloat(currentValue))) {
        newCellData[cellKey] = formatNumber(currentValue, format);
      }
    }
    
    setCellData(newCellData);
  };

  const handleTextColorChange = (color: string) => {
    if (!selectedCell && !selectedRange) return;
    
    console.log('handleTextColorChange called with color:', color);
    console.log('selectedCell:', selectedCell);
    console.log('selectedRange:', selectedRange);
    
    const newFormats = { ...cellFormats };
    
    if (selectedRange) {
      // Apply to all cells in the range
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const cellKey = getCellKey(row, col);
          console.log('Applying color to cell:', cellKey, 'color:', color);
          newFormats[cellKey] = {
            ...newFormats[cellKey],
            color: color
          };
        }
      }
    } else if (selectedCell) {
      // Apply to single cell
      const cellKey = getCellKey(selectedCell.row, selectedCell.col);
      console.log('Applying color to cell:', cellKey, 'color:', color);
      newFormats[cellKey] = {
        ...newFormats[cellKey],
        color: color
      };
    }
    
    console.log('New formats:', newFormats);
    setCellFormats(newFormats);
    setTextColorOpen(false);
  };

  const handleFillColorChange = (color: string) => {
    if (!selectedCell && !selectedRange) return;
    
    const newFormats = { ...cellFormats };
    
    if (selectedRange) {
      // Apply to all cells in the range
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const cellKey = getCellKey(row, col);
          newFormats[cellKey] = {
            ...newFormats[cellKey],
            backgroundColor: color
          };
        }
      }
    } else if (selectedCell) {
      // Apply to single cell
      const cellKey = getCellKey(selectedCell.row, selectedCell.col);
      newFormats[cellKey] = {
        ...newFormats[cellKey],
        backgroundColor: color
      };
    }
    
    setCellFormats(newFormats);
    setFillColorOpen(false);
  };

  return (
    <div className="flex justify-center w-full">
      <div className="flex items-center justify-center gap-4 sm:gap-6 px-2 sm:px-4 py-3" style={{ transform: 'scale(0.75)', transformOrigin: 'center top' }}>


      {/* Clipboard Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Clipboard</div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-2 flex-col gap-0.5 ${buttonClass}`}
            onClick={() => handleClipboardAction('paste')}
            disabled={!selectedCell && !selectedRange}
          >
            <SmallRibbonIcon icon={ClipboardPaste} size={18} />
            <span className="text-xs">Paste</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-2 flex-col gap-0.5 ${buttonClass}`}
            onClick={() => handleClipboardAction('cut')}
            disabled={!selectedCell && !selectedRange}
          >
            <SmallRibbonIcon icon={Scissors} size={18} />
            <span className="text-xs">Cut</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-2 flex-col gap-0.5 ${buttonClass}`}
            onClick={() => handleClipboardAction('copy')}
            disabled={!selectedCell && !selectedRange}
          >
            <SmallRibbonIcon icon={Copy} size={18} />
            <span className="text-xs">Copy</span>
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />
      {/* Font Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Font</div>
        <div className="flex items-center gap-1">
          <select
            className={`h-7 px-2 text-xs sm:text-sm border rounded ${inputClass}`}
            value={(() => {
              const currentFont = getCurrentFormat('fontFamily') as string;
              // If it's already a CSS value like "'Arial', sans-serif", extract the font name
              if (currentFont && currentFont.includes("'")) {
                const match = currentFont.match(/'([^']+)'/);
                return match ? match[1] : 'Arial';
              }
              return currentFont || 'Arial';
            })()}
            onChange={(e) => handleFormatChange('fontFamily', e.target.value)}
          >
            {FONT_REGISTRY.map((font) => (
              <option 
                key={font.name} 
                value={font.name}
                style={{ fontFamily: font.css }}
              >
                {font.name}
              </option>
            ))}
          </select>
          <select
            className={`h-7 px-2 text-xs sm:text-sm border rounded w-12 sm:w-16 ${inputClass}`}
            value={(() => {
              const fs = getCurrentFormat('fontSize');
              if (!fs) return '11';
              if (typeof fs === 'string' && fs.endsWith('px')) return fs.replace('px', '');
              return fs.toString();
            })()}
            onChange={(e) => handleFormatChange('fontSize', e.target.value)}
          >
            <option>8</option>
            <option>9</option>
            <option>10</option>
            <option>11</option>
            <option>12</option>
            <option>14</option>
            <option>16</option>
            <option>18</option>
            <option>20</option>
            <option>22</option>
            <option>24</option>
            <option>28</option>
            <option>32</option>
            <option>36</option>
            <option>40</option>
            <option>44</option>
            <option>48</option>
            <option>54</option>
            <option>60</option>
            <option>66</option>
            <option>72</option>
            <option>80</option>
            <option>88</option>
            <option>96</option>
          </select>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 w-7 p-0 ${buttonClass} ${getCurrentFormat('bold') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            onClick={() => handleFormatChange('bold', !getCurrentFormat('bold'))}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 w-7 p-0 ${buttonClass} ${getCurrentFormat('italic') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            onClick={() => handleFormatChange('italic', !getCurrentFormat('italic'))}
          >
            <SmallRibbonIcon icon={Italic} size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 w-7 p-0 ${buttonClass} ${getCurrentFormat('underline') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            onClick={() => handleFormatChange('underline', !getCurrentFormat('underline'))}
          >
            <SmallRibbonIcon icon={Underline} size={14} />
          </Button>

          {/* Fill Color Picker */}
          <Popover open={fillColorOpen} onOpenChange={setFillColorOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 w-7 p-0 ${buttonClass} relative`}
                disabled={!selectedCell && !selectedRange}
              >
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <SmallRibbonIcon icon={Paintbrush} size={14} />
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5"
                    style={{ backgroundColor: (getCurrentFormat('backgroundColor') as string) || '#FFFFFF' }}
                  />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-64 p-3">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-2 block">Fill Color</label>
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => handleFillColorChange(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Custom Color</label>
                  <input
                    type="color"
                    className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                    value={(getCurrentFormat('backgroundColor') as string) || '#FFFFFF'}
                    onChange={(e) => handleFillColorChange(e.target.value)}
                  />
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleFillColorChange('')}
                  >
                    No Fill
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />

      {/* Alignment Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Alignment</div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 w-7 p-0 ${buttonClass} ${getCurrentFormat('textAlign') === 'left' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            onClick={() => handleFormatChange('textAlign', 'left')}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 w-7 p-0 ${buttonClass} ${getCurrentFormat('textAlign') === 'center' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            onClick={() => handleFormatChange('textAlign', 'center')}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 w-7 p-0 ${buttonClass} ${getCurrentFormat('textAlign') === 'right' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            onClick={() => handleFormatChange('textAlign', 'right')}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <BordersDropdown onApplyBorder={handleApplyBorder} isDarkMode={isDarkMode} />
        </div>
      </div>

      <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />

      {/* Number Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Number</div>
        <div className="flex items-center gap-1">
          <select 
            className={`h-7 px-2 text-xs sm:text-sm border rounded ${inputClass}`}
            value={(getCurrentFormat('numberFormat') as string) || 'General'}
            onChange={(e) => handleNumberFormat(e.target.value)}
          >
            <option>General</option>
            <option>Number</option>
            <option>Currency</option>
            <option>Percentage</option>
            <option>Date</option>
          </select>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 px-2 text-xs ${buttonClass}`}
            onClick={() => handleNumberFormat('Currency')}
          >
            $
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 px-2 text-xs ${buttonClass}`}
            onClick={() => handleNumberFormat('Percentage')}
          >
            %
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />

      {/* Import/Export Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Import/Export</div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-2 flex-col gap-0.5 text-xs ${buttonClass}`}
            onClick={handleImportCSV}
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs">Import</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-2 flex-col gap-0.5 text-xs ${buttonClass}`}
            onClick={handleExportCSV}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">CSV</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-2 flex-col gap-0.5 text-xs ${buttonClass}`}
            onClick={handleExportPDF}
          >
            <Download className="w-5 h-5" />
            <span className="text-xs">PDF</span>
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />

      {/* Cells Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Cells</div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`h-9 px-2 flex-col gap-0.5 text-xs ${buttonClass}`}
            onClick={(e) => openDropdown("insert", e)}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Insert</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-9 px-2 flex-col gap-0.5 text-xs ${buttonClass}`}
            onClick={(e) => openDropdown("delete", e)}
          >
            <Minus className="w-5 h-5" />
            <span className="text-xs">Delete</span>
          </Button>
        </div>
      </div>
      
      {openMenu === "insert" && (
        <FloatingDropdown anchorRect={anchorRect} onClose={closeDropdown}>
          {/* Insert Dropdown Content */}
          <>
            <div 
              className="flex items-center px-4 py-2 cursor-pointer rounded transition-all"
              onClick={() => { insertCells('shift-left'); closeDropdown(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
              <span className="text-black font-medium">Shift Cells Left</span>
            </div>
            <div 
              className="flex items-center px-4 py-2 cursor-pointer rounded transition-all"
              onClick={() => { insertCells('shift-right'); closeDropdown(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2 rotate-180" style={{ color: '#000000' }} />
              <span className="text-black font-medium">Shift Cells Right</span>
            </div>
            <div 
              className="flex items-center px-4 py-2 cursor-pointer rounded transition-all"
              onClick={() => { insertCells('shift-up'); closeDropdown(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <ArrowUp className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
              <span className="text-black font-medium">Shift Cells Up</span>
            </div>
            <div 
              className="flex items-center px-4 py-2 cursor-pointer rounded transition-all"
              onClick={() => { insertCells('shift-down'); closeDropdown(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <ArrowDown className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
              <span className="text-black font-medium">Shift Cells Down</span>
            </div>

            {/* Insert Row Above */}
            <div 
              className="flex items-center justify-between px-4 py-2 rounded transition-all"
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
                <span className="text-black font-medium">Insert Row Above</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded">
                  <span className="w-12 px-1 text-center text-xs">{insertRowAboveCount}</span>
                  <div className="flex flex-col">
                    <button onClick={() => setInsertRowAboveCount(prev => prev + 1)} className="px-1 hover:bg-gray-100 text-xs leading-none">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => setInsertRowAboveCount(prev => Math.max(0, prev - 1))} className="px-1 hover:bg-gray-100 text-xs leading-none">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Insert Row Below */}
            <div 
              className="flex items-center justify-between px-4 py-2 rounded transition-all"
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
                <span className="text-black font-medium">Insert Row Below</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded">
                  <span className="w-12 px-1 text-center text-xs">{insertRowBelowCount}</span>
                  <div className="flex flex-col">
                    <button onClick={() => setInsertRowBelowCount(prev => prev + 1)} className="px-1 hover:bg-gray-100 text-xs leading-none">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => setInsertRowBelowCount(prev => Math.max(0, prev - 1))} className="px-1 hover:bg-gray-100 text-xs leading-none">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Insert Column Left */}
            <div 
              className="flex items-center justify-between px-4 py-2 rounded transition-all"
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
                <span className="text-black font-medium">Insert Column Left</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded">
                  <span className="w-12 px-1 text-center text-xs">{insertColLeftCount}</span>
                  <div className="flex flex-col">
                    <button onClick={() => setInsertColLeftCount(prev => prev + 1)} className="px-1 hover:bg-gray-100 text-xs leading-none">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => setInsertColLeftCount(prev => Math.max(0, prev - 1))} className="px-1 hover:bg-gray-100 text-xs leading-none">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Insert Column Right */}
            <div 
              className="flex items-center justify-between px-4 py-2 rounded transition-all"
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
                <span className="text-black font-medium">Insert Column Right</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded">
                  <span className="w-12 px-1 text-center text-xs">{insertColRightCount}</span>
                  <div className="flex flex-col">
                    <button onClick={() => setInsertColRightCount(prev => prev + 1)} className="px-1 hover:bg-gray-100 text-xs leading-none">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => setInsertColRightCount(prev => Math.max(0, prev - 1))} className="px-1 hover:bg-gray-100 text-xs leading-none">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Insert Selected Button */}
            <div className="px-4 py-2 border-t">
              <button 
                onClick={() => { handleInsertAll(); closeDropdown(); }} 
                className="w-full px-4 py-2 rounded text-sm flex items-center justify-center gap-2 font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
                  color: '#000000',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <Plus className="w-4 h-4" />
                Insert Selected
              </button>
            </div>
          </>
        </FloatingDropdown>
      )}

      {openMenu === "delete" && (
        <FloatingDropdown anchorRect={anchorRect} onClose={closeDropdown}>
          {/* Delete Dropdown Content */}
          <>
            <div 
              className="flex items-center px-4 py-2 cursor-pointer rounded transition-all"
              onClick={() => { handleDeleteCell(); closeDropdown(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <Trash2 className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
              <span className="text-black font-medium">Delete Cell</span>
            </div>
            <div 
              className="flex items-center px-4 py-2 cursor-pointer rounded transition-all"
              onClick={() => { deleteCells('entire-row'); closeDropdown(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <Minus className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
              <span className="text-black font-medium">Entire Row</span>
            </div>
            <div 
              className="flex items-center px-4 py-2 cursor-pointer rounded transition-all"
              onClick={() => { deleteCells('entire-column'); closeDropdown(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <Minus className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
              <span className="text-black font-medium">Entire Column</span>
            </div>
            <div 
              className="flex items-center px-4 py-2 cursor-pointer rounded transition-all"
              onClick={() => { handleDeleteBlankRows(); closeDropdown(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ color: '#000000' }}
            >
              <Trash2 className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
              <span className="text-black font-medium">Delete Blank Rows</span>
            </div>
          </>
        </FloatingDropdown>
      )}
    </div>
    </div>
  );
}
