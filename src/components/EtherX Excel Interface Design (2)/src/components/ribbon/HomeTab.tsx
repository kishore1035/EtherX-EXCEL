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
  Trash2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

import { useClipboard } from '../../contexts/ClipboardContext';
import { useSpreadsheet } from '../../contexts/SpreadsheetContext';

import FloatingDropdown from '../ui/FloatingDropdown';
import { exportToCSV } from '../../utils/csvExport';
import { useState } from 'react';

interface HomeTabProps {
  isDarkMode: boolean;
}

export function HomeTab({ isDarkMode }: HomeTabProps) {
  const { copy, cut, paste, clearCut } = useClipboard();
  const { selectedCell, cellData, setCellData, cellFormats, setCellFormats, hasTextSelection, getCellKey, insertCells, deleteCells } = useSpreadsheet();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [insertRowAboveCount, setInsertRowAboveCount] = useState(1);
  const [insertRowBelowCount, setInsertRowBelowCount] = useState(1);
  const [insertColLeftCount, setInsertColLeftCount] = useState(1);
  const [insertColRightCount, setInsertColRightCount] = useState(1);
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());

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
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
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
    if (!selectedCell) return;
    const cellKey = getCellKey(selectedCell.row, selectedCell.col);
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    delete newCellData[cellKey];
    delete newCellFormats[cellKey];
    setCellData(newCellData);
    setCellFormats(newCellFormats);
  };
  
  const buttonClass = isDarkMode 
    ? 'hover:bg-gray-700 text-gray-200' 
    : 'hover:bg-gray-100 text-gray-900';
  
  const inputClass = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-gray-200'
    : 'bg-white border-gray-300 text-gray-900';

  const handleClipboardAction = async (action: 'copy' | 'cut' | 'paste') => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const cellKey = getCellKey(row, col);
    const val = cellData[cellKey] || '';

    if (action === 'copy') {
      await copy(val, cellKey);
    } else if (action === 'cut') {
      await cut(val, cellKey);
    } else if (action === 'paste') {
      const clipboardData = await paste();
      if (clipboardData?.value !== undefined && clipboardData?.value !== null) {
        setCellData((prev) => ({ ...prev, [cellKey]: clipboardData.value }));
        
        // If this was a cut operation, clear the source cell
        if (clipboardData.isCut && clipboardData.cellKey) {
          setCellData((prev) => ({ ...prev, [clipboardData.cellKey!]: '' }));
          clearCut();
        }
      }
    }
  };

  const handleFormatChange = (formatType: string, value: any) => {
    if (!selectedCell) return;
    const cellKey = getCellKey(selectedCell.row, selectedCell.col);
    let newValue = value;
    if (formatType === 'fontSize') {
      // Ensure fontSize is stored as a string with 'px' for CSS
      if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
        newValue = value + 'px';
      }
    }
    setCellFormats(prev => ({
      ...prev,
      [cellKey]: {
        ...prev[cellKey],
        [formatType]: newValue
      }
    }));
  };

  const getCurrentFormat = (formatType: string) => {
    if (!selectedCell) return undefined;
    const cellKey = getCellKey(selectedCell.row, selectedCell.col);
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

  const handleNumberFormat = (format: string) => {
    if (!selectedCell) return;
    
    const cellKey = getCellKey(selectedCell.row, selectedCell.col);
    const currentValue = cellData[cellKey] || '';
    
    handleFormatChange('numberFormat', format);
    
    if (currentValue && !isNaN(parseFloat(currentValue))) {
      const formattedValue = formatNumber(currentValue, format);
      setCellData(prev => ({ ...prev, [cellKey]: formattedValue }));
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-3 overflow-x-auto">


      {/* Clipboard Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Clipboard</div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-2 flex-col gap-0.5 ${buttonClass}`}
            onClick={() => handleClipboardAction('paste')}
            disabled={!selectedCell}
          >
            <ClipboardPaste className="w-5 h-5" />
            <span className="text-xs">Paste</span>
          </Button>
          <div className="flex flex-col gap-0.5">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-4 px-2 ${buttonClass}`}
              onClick={() => handleClipboardAction('cut')}
              disabled={!selectedCell}
            >
              <Scissors className="w-3 h-3" />
              <span className="text-xs ml-1">Cut</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-4 px-2 ${buttonClass}`}
              onClick={() => handleClipboardAction('copy')}
              disabled={!selectedCell}
            >
              <Copy className="w-3 h-3" />
              <span className="text-xs ml-1">Copy</span>
            </Button>
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />
      {/* Font Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Font</div>
        <div className="flex items-center gap-1">
          <select
            className={`h-7 px-2 text-xs sm:text-sm border rounded ${inputClass}`}
            value={(getCurrentFormat('fontFamily') as string) || 'Calibri'}
            onChange={(e) => handleFormatChange('fontFamily', e.target.value)}
          >
            {/* Modern Windows / Office Fonts */}
            <option>Calibri</option>
            <option>Cambria</option>
            <option>Segoe UI</option>
            <option>Segoe UI Emoji</option>
            <option>Segoe UI Symbol</option>

            {/* Generic Popular Fonts */}
            <option>Arial</option>
            <option>Arial Narrow</option>
            <option>Arial Black</option>
            <option>Helvetica</option>
            <option>Verdana</option>
            <option>Tahoma</option>
            <option>Trebuchet MS</option>

            {/* Serif Fonts */}
            <option>Times New Roman</option>
            <option>Georgia</option>
            <option>Garamond</option>

            {/* Monospace */}
            <option>Consolas</option>
            <option>Courier New</option>
            <option>Lucida Console</option>
            <option>Roboto Mono</option>

            {/* Modern UI Fonts */}
            <option>Inter</option>
            <option>Poppins</option>
            <option>Roboto</option>
            <option>Noto Sans</option>
            <option>Lato</option>
            <option>Montserrat</option>
            <option>Open Sans</option>

            {/* Decorative / Optional */}
            <option>Comic Sans MS</option>
            <option>Impact</option>
            <option>Century Gothic</option>
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
            <Italic className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 w-7 p-0 ${buttonClass} ${getCurrentFormat('underline') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            onClick={() => handleFormatChange('underline', !getCurrentFormat('underline'))}
          >
            <Underline className="w-4 h-4" />
          </Button>
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
            className={`h-7 px-2 text-xs ${buttonClass}`}
            onClick={handleImportCSV}
          >
            <Upload className="w-3 h-3 mr-1" />
            Import
          </Button>
          <div className="flex flex-col gap-0.5">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-3.5 px-2 text-xs ${buttonClass}`}
              onClick={handleExportCSV}
            >
              <FileText className="w-2.5 h-2.5 mr-1" />
              CSV
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-3.5 px-2 text-xs ${buttonClass}`}
              onClick={handleExportPDF}
            >
              <Download className="w-2.5 h-2.5 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className={`h-12 ${isDarkMode ? 'bg-gray-700' : ''}`} />

      {/* Cells Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Cells</div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => openDropdown("insert", e)}
            className="px-2 py-1 hover:bg-gray-100 rounded"
          >
            Insert ▼
          </button>
          <button
            onClick={(e) => openDropdown("delete", e)}
            className="px-2 py-1 hover:bg-gray-100 rounded"
          >
            Delete ▼
          </button>
        </div>
      </div>
      
      {openMenu === "insert" && (
        <FloatingDropdown anchorRect={anchorRect} onClose={closeDropdown}>
          {/* Insert Dropdown Content */}
          <>
            <div className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { insertCells('shift-left'); closeDropdown(); }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Shift Cells Left</span>
            </div>
            <div className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { insertCells('shift-right'); closeDropdown(); }}>
              <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
              <span>Shift Cells Right</span>
            </div>
            <div className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { insertCells('shift-up'); closeDropdown(); }}>
              <ArrowUp className="w-4 h-4 mr-2" />
              <span>Shift Cells Up</span>
            </div>
            <div className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { insertCells('shift-down'); closeDropdown(); }}>
              <ArrowDown className="w-4 h-4 mr-2" />
              <span>Shift Cells Down</span>
            </div>

            {/* Insert Row Above */}
            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-200">
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                <span>Insert Row Above</span>
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
            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-200">
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                <span>Insert Row Below</span>
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
            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-200">
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                <span>Insert Column Left</span>
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
            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-200">
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                <span>Insert Column Right</span>
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
              <button onClick={() => { handleInsertAll(); closeDropdown(); }} className="w-full px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-2">
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
            <div className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { handleDeleteCell(); closeDropdown(); }}>
              <Trash2 className="w-4 h-4 mr-2" />
              <span>Delete Cell</span>
            </div>
            <div className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { deleteCells('entire-row'); closeDropdown(); }}>
              <Minus className="w-4 h-4 mr-2" />
              <span>Entire Row</span>
            </div>
            <div className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { deleteCells('entire-column'); closeDropdown(); }}>
              <Minus className="w-4 h-4 mr-2" />
              <span>Entire Column</span>
            </div>
            <div className="flex items-center px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { handleDeleteBlankRows(); closeDropdown(); }}>
              <Trash2 className="w-4 h-4 mr-2" />
              <span>Delete Blank Rows</span>
            </div>
          </>
        </FloatingDropdown>
      )}
    </div>
  );
}
