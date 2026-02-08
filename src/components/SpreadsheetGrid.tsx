interface SpreadsheetGridProps {
  isDarkMode?: boolean;
}
import { useState, useRef, useEffect } from 'react';
import type { MouseEvent, DragEvent, KeyboardEvent, CSSProperties } from 'react';
import { FormulaDropdown, FormulaOption } from './FormulaDropdown';
import { parseAndEvaluate, extractCellReferences, getRangeCells, FormulaContext } from '../utils/formulaEngine';
import { saveSpreadsheetToIPFS, loadSpreadsheetFromIPFS, autoSaveToIPFS } from '../utils/pinataService';
import { validateCellValue, ValidationResult } from '../utils/validationBackend';
import { CellValidation } from '../types/spreadsheet';
import { ChevronDown } from 'lucide-react';
import { getCellDisplayValue } from '../utils/formulaBackend';
import { ImageFormatPanel } from './images/ImageFormatPanel';
import { ChartCanvas, ChartFormattingPanel } from './charts';
import { CollaborativeCursors } from './collaboration/CollaborativeCursors';
import { useCollaboration } from '../contexts/CollaborationContext';
import { 
  saveSheetData, 
  loadSheetData, 
  getSheetHash, 
  clearSheetStorage,
  hasSheetData,
  debouncedSaveSheetData
} from '../utils/sheetStorageManager';

// Simple notification component
function AutosaveNotification({ visible, onClose }: { visible: boolean; onClose?: () => void }) {
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      <div className="text-black px-4 py-2 rounded shadow-lg font-semibold flex items-center gap-3" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
        <span>Spreadsheet autosaved</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-black hover:text-gray-700 font-bold text-lg leading-none"
            style={{ padding: '0 4px' }}
            title="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export { SpreadsheetGrid };
type CellFormat = {
  fontFamily?: string;
  fontSize?: number | string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: string;
  isLink?: boolean;
  color?: string;
  textDecoration?: string;
  linkUrl?: string;
  backgroundColor?: string;
  borders?: {
    top?: { style: string; color: string };
    right?: { style: string; color: string };
    bottom?: { style: string; color: string };
    left?: { style: string; color: string };
  };
};
import { useClipboard } from '../contexts/ClipboardContext';
import { useSpreadsheetWithHistory } from '../hooks/useSpreadsheetWithHistory';

const COLS = 52; // A-Z, AA-AZ (52 columns - double Excel's default view)
const ROWS = 100; // 100 rows (expandable, matches Excel's typical view)

function SpreadsheetGrid({ isDarkMode = false }: SpreadsheetGridProps) {
  const isReadOnly = (window as any).__etherxCanEdit === false;

  // All state/context variables must be declared at the top, before any useEffect or logic that references them
  const [showAutosave, setShowAutosave] = useState(false);
  const { selectedCell, setSelectedCell, selectedRange, setSelectedRange, cellData, setCellData, cellFormats, setCellFormats, cellValidations, inputMessage, setInputMessage, floatingImages, setFloatingImages, floatingTextBoxes, setFloatingTextBoxes, selectedImage, setSelectedImage, setHasTextSelection, isTextBoxMode, setIsTextBoxMode, isFormulaMode, setIsFormulaMode, formulaSelectionCells, setFormulaSelectionCells, activeFormula, setActiveFormula, getCellKey, undo, redo, canUndo, canRedo, showGridlines, showHeadings, zoomLevel, freezePanes, evaluateConditionalFormatting } = useSpreadsheetWithHistory();

  // Collaboration hook
  const { 
    sendCursorUpdate, 
    sendCellUpdate, 
    sendEditingStatus,
    sendTypingUpdate,
    sendSelectionUpdate,
    isCellLocked,
    requestCellLock,
    releaseCellLock,
    getCellLockOwner
  } = useCollaboration();

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawPath, setDrawPath] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [showCursor, setShowCursor] = useState(false); // Controls whether cursor is visible
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  // Fill handle drag state
  const [isFillDragging, setIsFillDragging] = useState(false);
  const [fillStart, setFillStart] = useState<{ row: number; col: number } | null>(null);
  const [fillEnd, setFillEnd] = useState<{ row: number; col: number } | null>(null);
  
  // Cell drag and drop state (Excel-style)
  const [isDraggingCell, setIsDraggingCell] = useState(false);
  const [draggedCells, setDraggedCells] = useState<{ row: number; col: number }[]>([]);
  const [dragDropTarget, setDragDropTarget] = useState<{ row: number; col: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Chart selection state
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Formula state
  const [showFormulaDropdown, setShowFormulaDropdown] = useState(false);
  const [formulaDropdownPosition, setFormulaDropdownPosition] = useState({ top: 0, left: 0 });
  const [formulaSearchText, setFormulaSearchText] = useState('');
  const [selectedFormula, setSelectedFormula] = useState<FormulaOption | null>(null);
  const [formulaSelectionMode, setFormulaSelectionMode] = useState(false);
  const [formulaSelectedCells, setFormulaSelectedCells] = useState<string[]>([]);
  const [formulaRangeStart, setFormulaRangeStart] = useState<string | null>(null);
  const [cellEvaluatedValues, setCellEvaluatedValues] = useState<Map<string, any>>(new Map());

  // Validation state
  const [showValidationDropdown, setShowValidationDropdown] = useState(false);
  const [validationDropdownPosition, setValidationDropdownPosition] = useState({ top: 0, left: 0 });
  const [validationDropdownCell, setValidationDropdownCell] = useState<string | null>(null);
  const [originalCellValue, setOriginalCellValue] = useState<string>('');
  const [validationModal, setValidationModal] = useState<{ type: 'stop' | 'warning' | 'info'; title: string; message: string; onConfirm?: () => void; onCancel?: () => void } | null>(null);

  // Colors for multi-cell selection in formulas
  const selectionColors = [
    { border: '#4285f4', bg: 'rgba(66, 133, 244, 0.1)' }, // Blue
    { border: '#ea4335', bg: 'rgba(234, 67, 53, 0.1)' },  // Red
    { border: '#34a853', bg: 'rgba(52, 168, 83, 0.1)' },  // Green
    { border: '#fbbc04', bg: 'rgba(251, 188, 4, 0.1)' },  // Yellow
  ];

  // Load saved data on mount
  // Get the activeSheetId from context - passed via props from ExcelSpreadsheet
  // This is the UUID that identifies the current sheet
  const activeSheetId = (window as any).__activeSheetId || 'default';
  
  // Load data on mount - ONLY reads from activeSheetId key, no global fallback
  useEffect(() => {
    const loadData = async () => {
      // Check for pending template data first
      const pendingTemplateData = localStorage.getItem('pendingTemplateData');
      if (pendingTemplateData) {
        try {
          const templateData = JSON.parse(pendingTemplateData);
          if (templateData && templateData.cells) {
            // Normalize template cell data - extract values and formats separately
            const normalizedCells: Record<string, string> = {};
            const normalizedFormats: Record<string, CellFormat> = {};
            
            Object.entries(templateData.cells).forEach(([key, cell]) => {
              if (typeof cell === 'string') {
                normalizedCells[key] = cell;
              } else if (cell && typeof cell === 'object' && 'value' in cell) {
                // Cast to any to safely access properties
                const cellObj = cell as any;
                
                // Extract value
                normalizedCells[key] = cellObj.value != null ? String(cellObj.value) : '';
                
                // Extract formatting properties (including backgroundColor)
                const format: any = {};
                if (cellObj.bold) format.bold = cellObj.bold;
                if (cellObj.italic) format.italic = cellObj.italic;
                if (cellObj.underline) format.underline = cellObj.underline;
                if (cellObj.fontSize) format.fontSize = cellObj.fontSize;
                if (cellObj.fontFamily) format.fontFamily = cellObj.fontFamily;
                if (cellObj.textAlign) format.textAlign = cellObj.textAlign;
                if (cellObj.color) format.color = cellObj.color;
                if (cellObj.textDecoration) format.textDecoration = cellObj.textDecoration;
                if (cellObj.backgroundColor) format.backgroundColor = cellObj.backgroundColor;
                
                if (Object.keys(format).length > 0) {
                  normalizedFormats[key] = format;
                }
              } else if (cell != null) {
                normalizedCells[key] = String(cell);
              } else {
                normalizedCells[key] = '';
              }
            });
            
            setCellData(normalizedCells);
            
            // Apply cell formats
            if (Object.keys(normalizedFormats).length > 0) {
              setCellFormats(prev => ({ ...prev, ...normalizedFormats }));
            }
            
            console.log('📋 Loaded template data:', templateData.template?.name);
            console.log('✅ Normalized cells sample:', Object.keys(normalizedCells).slice(0, 5).map(k => ({ [k]: normalizedCells[k] })));
            console.log('✅ Normalized formats sample:', Object.keys(normalizedFormats).slice(0, 5).map(k => ({ [k]: normalizedFormats[k] })));
            localStorage.removeItem('pendingTemplateData');
            return;
          }
        } catch (error) {
          console.error('Failed to load template data:', error);
        }
      }

      // Skip loading if we already have initial data from props (new sheet or opened sheet)
      if (Object.keys(cellData).length > 0) {
        console.log('⏭️ Skipping auto-load: Initial data already present');
        return;
      }
      
      // Check if this is a brand new blank sheet - if so, skip loading from storage
      const isNewBlank = (window as any).__isNewBlankSpreadsheet;
      if (isNewBlank) {
        console.log(`🆕 Skipping data load for new blank spreadsheet: ${activeSheetId}`);
        setCellData({});
        return;
      }
      
      // Try to load from IPFS first (optional)
      const savedHash = getSheetHash(activeSheetId);
      if (savedHash) {
        try {
          const ipfsData = await loadSpreadsheetFromIPFS(savedHash);
          if (ipfsData && ipfsData.cellData) {
            setCellData(ipfsData.cellData);
            console.log(`📥 Loaded sheet ${activeSheetId} from IPFS:`, savedHash);
            return;
          }
        } catch (error) {
          console.error('Failed to load from IPFS:', error);
        }
      }
      
      // Load from localStorage using activeSheetId key only
      const savedData = loadSheetData(activeSheetId);
      if (savedData && Object.keys(savedData).length > 0) {
        setCellData(savedData);
        console.log(`📥 Loaded ${Object.keys(savedData).length} cells from localStorage`);
      } else {
        console.log(`📄 No saved data, starting with empty sheet`);
        setCellData({});
      }
    };
    loadData();
  }, []); // Empty dependency - run only once on mount

  // Auto-save functionality - always writes to activeSheetId only, with debounce
  useEffect(() => {
    const saveData = async () => {
      try {
        // Save to IPFS first (primary storage)
        console.log(`☁️ Uploading to IPFS...`);
        const hash = await autoSaveToIPFS(cellData, 'spreadsheet');
        console.log(`✅ IPFS Hash: ${hash}`);
        
        // Save to localStorage with IPFS hash
        debouncedSaveSheetData(activeSheetId, cellData, hash);
        
        console.log(`💾 Auto-saved sheet ${activeSheetId} to IPFS`);
        setShowAutosave(true);
        setTimeout(() => setShowAutosave(false), 2000);
      } catch (error: any) {
        console.error('❌ IPFS auto-save failed:', error.message);
        // Still save to localStorage as backup
        debouncedSaveSheetData(activeSheetId, cellData);
        // Show error to user
        if (error.message === 'IPFS_DISABLED') {
          console.warn('⚠️ IPFS disabled - check your Pinata API credentials in .env file');
        }
      }
    };

    // Trigger save if there's data
    if (Object.keys(cellData).length > 0) {
      saveData();
    }
    
    // Cleanup on unmount
    return () => {};
  }, [cellData, activeSheetId]); // Include activeSheetId in dependencies

  // Global mouse tracking for fill handle drag
  useEffect(() => {
    if (!isFillDragging) return;

    // Set cursor to crosshair during fill drag
    document.body.style.cursor = 'crosshair';

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      // Find the cell element under the mouse cursor
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (!element) return;
      
      // Find the closest td element
      const cellElement = element.closest('td[data-cell-key]');
      if (!cellElement) return;
      
      const cellKey = cellElement.getAttribute('data-cell-key');
      if (!cellKey) return;
      
      // Parse cell key (format: "R{row}C{col}")
      const match = cellKey.match(/R(\d+)C(\d+)/);
      if (!match) return;
      
      const row = parseInt(match[1]);
      const col = parseInt(match[2]);
      
      if (fillStart) {
        handleFillDragMove(row, col);
      }
    };

    const handleMouseUp = () => {
      document.body.style.cursor = '';
      handleFillDragEnd();
    };

    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isFillDragging, fillStart]);

  // Global mouse up for range selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleCellMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  // Send cursor position when selectedCell changes (always send, even while editing)
  useEffect(() => {
    if (selectedCell) {
      console.log('🎯 Selected cell changed, sending cursor update:', selectedCell);
      sendCursorUpdate(selectedCell.row, selectedCell.col);
    } else {
      console.log('🎯 Clearing cursor position');
      sendCursorUpdate(null, null);
    }
  }, [selectedCell, sendCursorUpdate]);

  // Track mouse movement over cells for Canva-style live cursor tracking
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const lastSentCursor = useRef<{ row: number; col: number } | null>(null);

  useEffect(() => {
    // Only send hover updates if not editing (to avoid spam while typing)
    if (hoveredCell && !editingCell) {
      const key = `${hoveredCell.row}-${hoveredCell.col}`;
      const lastKey = lastSentCursor.current ? `${lastSentCursor.current.row}-${lastSentCursor.current.col}` : null;
      
      if (key !== lastKey) {
        sendCursorUpdate(hoveredCell.row, hoveredCell.col);
        lastSentCursor.current = hoveredCell;
      }
    }
  }, [hoveredCell, editingCell, sendCursorUpdate]);

  // Send selection range when it changes (for multi-cell selection visibility)
  useEffect(() => {
    if (selectedRange) {
      sendSelectionUpdate(selectedRange);
    } else {
      sendSelectionUpdate(null);
    }
  }, [selectedRange, sendSelectionUpdate]);

  const getColumnLabel = (index: number) => {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  };

  const handleCellMouseDown = (row: number, col: number, e: MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    const cellKey = getCellKey(row, col);
    
    // If in formula mode, add cell to selection
    if (isFormulaMode) {
      if (!formulaSelectionCells.includes(cellKey)) {
        setFormulaSelectionCells([...formulaSelectionCells, cellKey]);
      }
      return;
    }
    
    // Start range selection on mouse down
    setIsDragging(true);
    setDragStart({ row, col });
    setSelectedCell({ row, col });
    setSelectedRange(null);
    setEditingCell({ row, col });
    setShowCursor(false);
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isDragging || !dragStart) return;
    
    // Update range selection as mouse moves
    const startRow = Math.min(dragStart.row, row);
    const endRow = Math.max(dragStart.row, row);
    const startCol = Math.min(dragStart.col, col);
    const endCol = Math.max(dragStart.col, col);
    
    setSelectedRange({ startRow, endRow, startCol, endCol });
  };

  const handleCellMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Keep dragStart for reference but mark dragging as complete
    }
  };

  const handleCellClick = (row: number, col: number) => {
    const cellKey = getCellKey(row, col);
    
    // If in formula mode, add cell to selection
    if (isFormulaMode) {
      if (!formulaSelectionCells.includes(cellKey)) {
        setFormulaSelectionCells([...formulaSelectionCells, cellKey]);
      }
      return;
    }
    
    // Single click without drag: clear range and select single cell
    if (!selectedRange || (selectedRange.startRow === row && selectedRange.endRow === row && 
        selectedRange.startCol === col && selectedRange.endCol === col)) {
      console.log('📍 handleCellClick - Setting selectedCell:', { row, col });
      setSelectedRange(null);
      setSelectedCell({ row, col });
      // DON'T set editingCell on single click - only on double click
      console.log('📍 handleCellClick - editingCell NOT set (good for cursor tracking)');
      setShowCursor(false);
    }
    
    // Check for validation and show input message (only if not editing)
    const validation = cellValidations[cellKey];
    
    console.log('Cell clicked:', cellKey, 'Validation:', validation, 'showCursor:', showCursor);
    
    // Only show input message if cell is not being edited
    if (!showCursor && validation && (validation.inputMessage || validation.inputTitle)) {
      // Update context with input message
      console.log('Setting input message:', { title: validation.inputTitle, message: validation.inputMessage });
      setInputMessage({
        title: validation.inputTitle,
        message: validation.inputMessage
      });
    } else {
      console.log('Clearing input message');
      setInputMessage(null);
    }
    
    // Focus hidden input to capture keyboard but don't show cursor
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.blur(); // Immediately blur to hide cursor
      }
    }, 0);
  };

  const handleCellDoubleClick = async (row: number, col: number) => {
    if (isReadOnly) return;
    
    // Check if cell is locked by another user
    if (isCellLocked(row, col)) {
      const owner = getCellLockOwner(row, col) as any;
      alert(`This cell is being edited by ${owner?.userName || owner?.name || 'another user'}`);
      return;
    }
    
    // Try to lock the cell
    const locked = await requestCellLock(row, col);
    if (!locked) {
      alert('Could not lock cell for editing');
      return;
    }
    
    const key = getCellKey(row, col);
    setOriginalCellValue(cellData[key] || ''); // Store original value
    setSelectedCell({ row, col });
    setEditingCell({ row, col });
    setShowCursor(true); // Double click SHOWS cursor
    setInputMessage(null); // Hide input message when editing starts
    
    // Send editing status
    sendEditingStatus(row, col, true);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Select all text on double click
        inputRef.current.select();
      }
    }, 0);
  };

  // New fill handle drag logic
  const handleFillDragStart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Always use the currently selected cell (not cached state)
    if (!selectedCell) return;
    
    const startPoint = { ...selectedCell };
    
    // Reset any previous fill state
    setFillStart(startPoint);
    setFillEnd(startPoint);
    setIsFillDragging(true);
    
    console.log('Fill drag started from:', startPoint, 'Cell value:', cellData[getCellKey(startPoint.row, startPoint.col)]);
  };

  const handleFillDragMove = (row: number, col: number) => {
    if (isFillDragging && fillStart) {
      setFillEnd({ row, col });
      const startRow = Math.min(fillStart.row, row);
      const endRow = Math.max(fillStart.row, row);
      const startCol = Math.min(fillStart.col, col);
      const endCol = Math.max(fillStart.col, col);
      setSelectedRange({ startRow, startCol, endRow, endCol });
    }
  };

  const handleFillDragEnd = () => {
    if (!isFillDragging || !fillStart || !fillEnd) {
      setIsFillDragging(false);
      return;
    }

    // Determine fill direction and range
    const startRow = Math.min(fillStart.row, fillEnd.row);
    const endRow = Math.max(fillStart.row, fillEnd.row);
    const startCol = Math.min(fillStart.col, fillEnd.col);
    const endCol = Math.max(fillStart.col, fillEnd.col);

    // Get source cell value
    const sourceKey = getCellKey(fillStart.row, fillStart.col);
    const sourceValue = cellData[sourceKey] || '';
    const sourceFormat = cellFormats[sourceKey];

    // Check if value is a number (for sequential increment)
    const numericValue = parseFloat(sourceValue);
    const isNumber = !isNaN(numericValue) && isFinite(numericValue) && sourceValue.trim() !== '';
    
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };

    // Determine fill direction
    const isVertical = Math.abs(fillEnd.row - fillStart.row) >= Math.abs(fillEnd.col - fillStart.col);
    
    // Fill cells based on direction
    
    if (isVertical) {
      // Vertical fill (down or up)
      let sequenceIndex = 0;
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          // Skip source cell
          if (row === fillStart.row && col === fillStart.col) {
            continue;
          }

          const targetKey = getCellKey(row, col);
          
          if (isNumber) {
            // Number: increment sequentially
            sequenceIndex++;
            const newValue = numericValue + sequenceIndex;
            newCellData[targetKey] = newValue.toString();
            newCellFormats[targetKey] = { ...sourceFormat };
          } else {
            // Text: copy exactly
            newCellData[targetKey] = sourceValue;
            newCellFormats[targetKey] = { ...sourceFormat };
          }
        }
      }
    } else {
      // Horizontal fill (right or left)
      let sequenceIndex = 0;
      for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
          // Skip source cell
          if (row === fillStart.row && col === fillStart.col) {
            continue;
          }

          const targetKey = getCellKey(row, col);
          
          if (isNumber) {
            // Number: increment sequentially
            sequenceIndex++;
            const newValue = numericValue + sequenceIndex;
            newCellData[targetKey] = newValue.toString();
            newCellFormats[targetKey] = { ...sourceFormat };
          } else {
            // Text: copy exactly
            newCellData[targetKey] = sourceValue;
            newCellFormats[targetKey] = { ...sourceFormat };
          }
        }
      }
    }

    setCellData(newCellData);
    setCellFormats(newCellFormats);
    
    console.log('Fill completed. Filled cells with:', isNumber ? 'number sequence' : 'text copy');
    
    // Clean up fill state
    setIsFillDragging(false);
    setFillStart(null);
    setFillEnd(null);
    setSelectedRange(null);
  };

  // Excel-style drag and drop handlers
  const handleCellDragStart = (e: DragEvent, row: number, col: number) => {
    if (isReadOnly) {
      e.preventDefault();
      return;
    }
    // Prevent drag if editing or in formula mode
    if (showCursor || isFormulaMode) {
      e.preventDefault();
      return;
    }

    setIsDraggingCell(true);
    
    // Determine which cells to drag
    let cellsToDrag: { row: number; col: number }[] = [];
    
    if (selectedRange) {
      // Drag entire range
      for (let r = selectedRange.startRow; r <= selectedRange.endRow; r++) {
        for (let c = selectedRange.startCol; c <= selectedRange.endCol; c++) {
          cellsToDrag.push({ row: r, col: c });
        }
      }
    } else if (selectedCell) {
      // Drag single cell
      cellsToDrag = [selectedCell];
    }
    
    setDraggedCells(cellsToDrag);
    
    // Set drag image (ghost image during drag)
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.padding = '4px 8px';
    dragImage.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)';
    dragImage.style.border = '2px solid #FFD700';
    dragImage.style.borderRadius = '4px';
    dragImage.style.fontSize = '12px';
    dragImage.style.fontWeight = 'bold';
    dragImage.style.color = '#000';
    dragImage.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    dragImage.textContent = cellsToDrag.length > 1 
      ? `Moving ${cellsToDrag.length} cells` 
      : 'Moving cell';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
    
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCellDragOver = (e: DragEvent, row: number, col: number) => {
    if (!isDraggingCell) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Update drop target for visual feedback
    setDragDropTarget({ row, col });
  };

  const handleCellDragEnd = (e: DragEvent) => {
    setIsDraggingCell(false);
    setDraggedCells([]);
    setDragDropTarget(null);
  };

  const handleCellDrop = (e: DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    
    if (!isDraggingCell || draggedCells.length === 0) return;
    
    // Calculate offset from first dragged cell to target
    const firstCell = draggedCells[0];
    const rowOffset = targetRow - firstCell.row;
    const colOffset = targetCol - firstCell.col;
    
    // Prepare new cell data and formats
    const newCellData = { ...cellData };
    const newCellFormats = { ...cellFormats };
    
    // Store moved data temporarily
    const movedData: { [key: string]: string } = {};
    const movedFormats: { [key: string]: any } = {};
    
    // Copy data from dragged cells
    draggedCells.forEach(cell => {
      const sourceKey = getCellKey(cell.row, cell.col);
      const targetKey = getCellKey(cell.row + rowOffset, cell.col + colOffset);
      
      movedData[targetKey] = newCellData[sourceKey] || '';
      movedFormats[targetKey] = newCellFormats[sourceKey] || {};
      
      // Clear source cell
      delete newCellData[sourceKey];
      delete newCellFormats[sourceKey];
    });
    
    // Apply moved data to target cells
    Object.assign(newCellData, movedData);
    Object.assign(newCellFormats, movedFormats);
    
    // Update state
    setCellData(newCellData);
    
    // Update selection to follow moved cells
    if (selectedRange) {
      setSelectedRange({
        startRow: selectedRange.startRow + rowOffset,
        startCol: selectedRange.startCol + colOffset,
        endRow: selectedRange.endRow + rowOffset,
        endCol: selectedRange.endCol + colOffset
      });
    } else if (selectedCell) {
      setSelectedCell({
        row: selectedCell.row + rowOffset,
        col: selectedCell.col + colOffset
      });
    }
    
    // Clean up drag state
    setIsDraggingCell(false);
    setDraggedCells([]);
    setDragDropTarget(null);
  };

  // Formula mode helper functions
  const applyFormulaToCell = () => {
    if (!activeFormula || !selectedCell || formulaSelectionCells.length === 0) {
      cancelFormulaMode();
      return;
    }

    const targetKey = getCellKey(selectedCell.row, selectedCell.col);
    let formulaString = '';

    if (activeFormula === 'SUM' || activeFormula === 'AVERAGE' || activeFormula === 'COUNT' || activeFormula === 'MAX' || activeFormula === 'MIN') {
      // Range-based formulas
      if (formulaSelectionCells.length === 1) {
        formulaString = `=${activeFormula}(${formulaSelectionCells[0]})`;
      } else {
        const firstCell = formulaSelectionCells[0];
        const lastCell = formulaSelectionCells[formulaSelectionCells.length - 1];
        formulaString = `=${activeFormula}(${firstCell}:${lastCell})`;
      }
    } else if (activeFormula === 'IF') {
      // Conditional formula - requires 3 arguments
      if (formulaSelectionCells.length >= 3) {
        formulaString = `=IF(${formulaSelectionCells[0]}>0, ${formulaSelectionCells[1]}, ${formulaSelectionCells[2]})`;
      }
    } else if (activeFormula === 'CONCAT') {
      // Concatenation formula
      formulaString = `=CONCAT(${formulaSelectionCells.join(', ')})`;
    } else if (activeFormula === 'TODAY') {
      formulaString = `=TODAY()`;
    } else if (activeFormula === 'MULTIPLY') {
      formulaString = `=MULTIPLY(${formulaSelectionCells.join(', ')})`;
    } else if (activeFormula === 'DIVIDE' && formulaSelectionCells.length >= 2) {
      formulaString = `=DIVIDE(${formulaSelectionCells[0]}, ${formulaSelectionCells[1]})`;
    } else if (activeFormula === 'DIFFERENCE' && formulaSelectionCells.length >= 2) {
      formulaString = `=DIFFERENCE(${formulaSelectionCells[0]}, ${formulaSelectionCells[1]})`;
    } else if (activeFormula === 'POWER' && formulaSelectionCells.length >= 2) {
      formulaString = `=POWER(${formulaSelectionCells[0]}, ${formulaSelectionCells[1]})`;
    } else if (activeFormula === 'SQRT' && formulaSelectionCells.length >= 1) {
      formulaString = `=SQRT(${formulaSelectionCells[0]})`;
    }

    if (formulaString) {
      setCellData(prev => ({ ...prev, [targetKey]: formulaString }));
    }

    cancelFormulaMode();
  };

  const cancelFormulaMode = () => {
    setIsFormulaMode(false);
    setFormulaSelectionCells([]);
    setActiveFormula(null);
  };

  // Smart fill logic matching Excel behavior
  const smartFill = (sourceValue: string, sourceRow: number, sourceCol: number, targetRow: number, targetCol: number): string => {
    // Check if it's a pure number
    const isNumber = /^-?\d+(?:\.\d+)?$/.test(sourceValue);
    
    if (isNumber) {
      const base = parseFloat(sourceValue);
      
      // Determine direction and calculate increment
      if (sourceRow !== targetRow && sourceCol === targetCol) {
        // Vertical fill
        const diff = targetRow - sourceRow;
        return (base + diff).toString();
      } else if (sourceCol !== targetCol && sourceRow === sourceRow) {
        // Horizontal fill
        const diff = targetCol - sourceCol;
        return (base + diff).toString();
      } else {
        // Diagonal fill - use Manhattan distance
        const diff = Math.abs(targetRow - sourceRow) + Math.abs(targetCol - sourceCol);
        const sign = (targetRow > sourceRow || targetCol > sourceCol) ? 1 : -1;
        return (base + (diff * sign)).toString();
      }
    }
    
    // Check for number patterns like "Item 1", "Test 5", etc.
    const patternMatch = sourceValue.match(/^(.+?)(\d+)$/);
    if (patternMatch) {
      const prefix = patternMatch[1];
      const num = parseInt(patternMatch[2]);
      
      if (sourceRow !== targetRow && sourceCol === targetCol) {
        const diff = targetRow - sourceRow;
        return `${prefix}${num + diff}`;
      } else if (sourceCol !== targetCol && sourceRow === targetRow) {
        const diff = targetCol - sourceCol;
        return `${prefix}${num + diff}`;
      }
    }
    
    // Check for date patterns (basic)
    const dateMatch = sourceValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dateMatch) {
      const date = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[1]) - 1, parseInt(dateMatch[2]));
      if (sourceRow !== targetRow && sourceCol === targetCol) {
        date.setDate(date.getDate() + (targetRow - sourceRow));
      } else if (sourceCol !== targetCol && sourceRow === targetRow) {
        date.setDate(date.getDate() + (targetCol - sourceCol));
      }
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
    
    // For text, just copy
    return sourceValue;
  };

  const isCellInRange = (row: number, col: number) => {
    if (!selectedRange) return false;
    return row >= selectedRange.startRow && row <= selectedRange.endRow &&
           col >= selectedRange.startCol && col <= selectedRange.endCol;
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const key = getCellKey(row, col);
    
    // Send live typing update (Canva-style)
    if (editingCell && editingCell.row === row && editingCell.col === col) {
      sendTypingUpdate(row, col, value);
    }
    
    // Check if user is typing a formula
    if (value === '=' && !showFormulaDropdown) {
      const cellElement = document.querySelector(`[data-cell-key="${key}"]`);
      if (cellElement) {
        const rect = cellElement.getBoundingClientRect();
        setFormulaDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
        setShowFormulaDropdown(true);
        setFormulaSearchText('');
      }
    } else if (showFormulaDropdown && value.startsWith('=')) {
      const searchText = value.substring(1);
      setFormulaSearchText(searchText);
    } else if (!value.startsWith('=')) {
      setShowFormulaDropdown(false);
    }
    
    // Just update the cell data without validation on every keystroke
    setCellData(prev => ({ ...prev, [key]: value }));
    evaluateFormulas();
  };

  // New function to validate on blur/enter
  const handleCellValidation = (row: number, col: number, value: string) => {
    const key = getCellKey(row, col);
    const validation = cellValidations?.[key];
    
    console.log('Validating cell:', key, 'Value:', value, 'Validation:', validation);
    
    if (!validation) {
      console.log('No validation found for cell:', key);
      return true;
    }
    
    // Allow blank if specified
    if (validation.allowBlank && (!value || value.trim() === '')) {
      return true;
    }
    
    const validationResult = validateCellValue(value, validation);
    console.log('Validation result:', validationResult);
    
    if (!validationResult.valid) {
      // Handle validation error based on error style
      if (validationResult.errorStyle === 'stop') {
        // Block the entry
        setValidationModal({
          type: 'stop',
          title: validationResult.errorTitle || 'Invalid Entry',
          message: validationResult.errorMessage,
          onConfirm: () => {
            setValidationModal(null);
            // Revert to original value before editing
            setCellData(prev => ({ ...prev, [key]: originalCellValue }));
          }
        });
        return false;
      } else if (validationResult.errorStyle === 'warning') {
        // Show warning but allow entry if user confirms
        setValidationModal({
          type: 'warning',
          title: validationResult.errorTitle || 'Warning',
          message: validationResult.errorMessage,
          onConfirm: () => {
            setValidationModal(null);
            // Allow the entry
          },
          onCancel: () => {
            setValidationModal(null);
            // Revert to original value before editing
            setCellData(prev => ({ ...prev, [key]: originalCellValue }));
          }
        });
        return false;
      } else if (validationResult.errorStyle === 'information') {
        // Just inform, don't block
        setValidationModal({
          type: 'info',
          title: validationResult.errorTitle || 'Information',
          message: validationResult.errorMessage,
          onConfirm: () => setValidationModal(null)
        });
      }
    }
    
    return true;
  };

  // Formula evaluation context
  const createFormulaContext = (): FormulaContext => ({
    getCellValue: (cellId: string) => {
      const evaluated = cellEvaluatedValues.get(cellId);
      if (evaluated !== undefined) return evaluated;
      return cellData[cellId] || '';
    },
    getRangeValues: (startCell: string, endCell: string) => {
      const cells = getRangeCells(startCell, endCell);
      return cells.map(cellId => {
        const evaluated = cellEvaluatedValues.get(cellId);
        if (evaluated !== undefined) return evaluated;
        return cellData[cellId] || '';
      });
    }
  });

  // Evaluate all formulas
  const evaluateFormulas = () => {
    const newEvaluatedValues = new Map<string, any>();
    
    Object.entries(cellData).forEach(([key, value]) => {
      const cellValue = String(value);
      if (cellValue.startsWith('=')) {
        try {
          const context = createFormulaContext();
          const result = parseAndEvaluate(cellValue, context);
          newEvaluatedValues.set(key, result);
        } catch (error) {
          newEvaluatedValues.set(key, '#ERROR!');
        }
      }
    });
    
    setCellEvaluatedValues(newEvaluatedValues);
  };

  // Evaluate formulas when cell data changes
  useEffect(() => {
    evaluateFormulas();
  }, [cellData]);

  const handleFormulaSelect = (formula: FormulaOption) => {
    setSelectedFormula(formula);
    setShowFormulaDropdown(false);
    setFormulaSelectionMode(true);
    setFormulaSelectedCells([]);
    setFormulaRangeStart(null);
    
    if (editingCell) {
      const key = getCellKey(editingCell.row, editingCell.col);
      setCellData(prev => ({ ...prev, [key]: `=${formula.id}(` }));
    }
  };

  const handleFormulaCellClick = (row: number, col: number) => {
    if (!formulaSelectionMode || !selectedFormula) return;
    
    const cellKey = getCellKey(row, col);
    
    if (selectedFormula.requiresRange) {
      // Range selection logic
      if (!formulaRangeStart) {
        setFormulaRangeStart(cellKey);
        setFormulaSelectedCells([cellKey]);
      } else {
        // Complete the range
        const rangeCells = getRangeCells(formulaRangeStart, cellKey);
        setFormulaSelectedCells(rangeCells);
      }
    } else {
      // Multiple cell selection for functions like IF, CONCAT
      setFormulaSelectedCells(prev => [...prev, cellKey]);
    }
  };

  const completeFormulaSelection = () => {
    if (!formulaSelectionMode || !selectedFormula || !editingCell) return;
    
    const key = getCellKey(editingCell.row, editingCell.col);
    let formulaText = `=${selectedFormula.id}(`;
    
    if (selectedFormula.requiresRange && formulaRangeStart && formulaSelectedCells.length > 0) {
      const lastCell = formulaSelectedCells[formulaSelectedCells.length - 1];
      formulaText += `${formulaRangeStart}:${lastCell}`;
    } else if (formulaSelectedCells.length > 0) {
      formulaText += formulaSelectedCells.join(', ');
    }
    
    formulaText += ')';
    
    setCellData(prev => ({ ...prev, [key]: formulaText }));
    setFormulaSelectionMode(false);
    setFormulaSelectedCells([]);
    setFormulaRangeStart(null);
    setSelectedFormula(null);
  };

  const cancelFormulaSelection = () => {
    setFormulaSelectionMode(false);
    setFormulaSelectedCells([]);
    setFormulaRangeStart(null);
    setSelectedFormula(null);
    
    if (editingCell) {
      const key = getCellKey(editingCell.row, editingCell.col);
      setCellData(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleKeyDown = (e: KeyboardEvent, row: number, col: number) => {
    // Handle formula mode keys
    if (isFormulaMode) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFormulaToCell();
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelFormulaMode();
        return;
      }
    }
    
    // Arrow keys ALWAYS navigate, even during editing with visible cursor
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      let newRow = row;
      let newCol = col;
      if (e.key === "ArrowUp" && row > 0) newRow--;
      if (e.key === "ArrowDown" && row < ROWS - 1) newRow++;
      if (e.key === "ArrowLeft" && col > 0) newCol--;
      if (e.key === "ArrowRight" && col < COLS - 1) newCol++;
      setSelectedCell({ row: newRow, col: newCol });
      setEditingCell({ row: newRow, col: newCol });
      setShowCursor(false); // Hide cursor when navigating
      return;
    }
    
    if (e.key === 'Enter') {
      if (formulaSelectionMode) {
        e.preventDefault();
        completeFormulaSelection();
      } else {
        e.preventDefault();
        
        // Validate before moving to next cell
        const key = getCellKey(row, col);
        const currentValue = cellData[key] || '';
        const isValid = handleCellValidation(row, col, currentValue);
        
        if (isValid) {
          setEditingCell(null);
          setShowCursor(false);
          if (row < ROWS - 1) {
            setSelectedCell({ row: row + 1, col });
            setEditingCell({ row: row + 1, col });
          }
        } else {
          // Keep focus on current cell if validation failed
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      }
    } else if (e.key === 'Escape') {
      if (formulaSelectionMode) {
        e.preventDefault();
        cancelFormulaSelection();
      } else {
        setEditingCell(null);
        setShowCursor(false);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setEditingCell(null);
      setShowCursor(false);
      if (e.shiftKey && col > 0) {
        setSelectedCell({ row, col: col - 1 });
        setEditingCell({ row, col: col - 1 });
      } else if (!e.shiftKey && col < COLS - 1) {
        setSelectedCell({ row, col: col + 1 });
        setEditingCell({ row, col: col + 1 });
      }
    }
  };

  // Global key handlers for copy / cut / paste when not editing
  const { copySelection, cutSelection, pasteClipboard } = useClipboard();



  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      // Check if the event is from a dialog/modal input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.closest('[role="dialog"]') ||
        target.closest('.dialog') ||
        target.closest('[data-radix-portal]')
      ) {
        return; // Don't intercept keyboard events from dialogs
      }

      // Only handle if cursor is not visible (not in visual editing mode)
      if (showCursor) return;
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      const cellKey = getCellKey(row, col);
      const val = cellData[cellKey] || '';

      // Arrow keys: move cell selection
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        let newRow = row;
        let newCol = col;
        if (e.key === "ArrowUp" && row > 0) newRow--;
        if (e.key === "ArrowDown" && row < ROWS - 1) newRow++;
        if (e.key === "ArrowLeft" && col > 0) newCol--;
        if (e.key === "ArrowRight" && col < COLS - 1) newCol++;
        setSelectedCell({ row: newRow, col: newCol });
        setEditingCell({ row: newRow, col: newCol });
        setShowCursor(false);
        setSelectedRange(null);
        return;
      }

      // Delete: clear entire cell content
      if (isReadOnly) {
        // In view-only mode, block destructive keys beyond navigation
        return;
      }
      if (e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        setCellData(prev => ({ ...prev, [cellKey]: '' }));
        return;
      }
      
      // Backspace: delete last character
      if (e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        const currentValue = val || '';
        const newValue = currentValue.slice(0, -1);
        setCellData(prev => ({ ...prev, [cellKey]: newValue }));
        return;
      }

      // F2: Enter edit mode with cursor visible
      if (e.key === 'F2') {
        if (isReadOnly) return;
        e.preventDefault();
        e.stopPropagation();
        setEditingCell({ row, col });
        setShowCursor(true);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
          }
        }, 0);
        return;
      }

      // Enter key: activate editing with cursor visible
      if (e.key === "Enter") {
        if (isReadOnly) return;
        e.preventDefault();
        e.stopPropagation();
        setEditingCell({ row, col });
        setShowCursor(true);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
          }
        }, 0);
        return;
      }

      // Esc key triggers undo
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (canUndo) undo();
        return;
      }

      // Any printable character: append to content WITHOUT showing cursor
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (isReadOnly) return;
        e.preventDefault();
        e.stopPropagation();
        const currentValue = val || '';
        // Store original value when starting to type
        if (!editingCell) {
          setOriginalCellValue(currentValue);
        }
        const newValue = currentValue + e.key;
        setCellData(prev => ({ ...prev, [cellKey]: newValue }));
        setEditingCell({ row, col });
        setShowCursor(false); // Keep cursor hidden while typing
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(newValue.length, newValue.length);
          }
        }, 0);
        return;
      }

      // Ctrl/Cmd + C/X/V/Z/Y/S for clipboard/undo/redo/save
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      const key = e.key.toLowerCase();
      
      if (key === 's') {
        e.preventDefault();
        // Manual save with Ctrl+S (sheet-specific, immediate - no debounce)
        saveSheetData(activeSheetId, cellData);
        setShowAutosave(true);
        setTimeout(() => setShowAutosave(false), 2000);
        return;
      } else if (key === 'c') {
        e.preventDefault();
        e.stopPropagation();
        // Use new clipboard context for copying selection
        copySelection();
        return;
      } else if (key === 'x') {
        if (isReadOnly) return;
        e.preventDefault();
        e.stopPropagation();
        // Use new clipboard context for cutting selection
        cutSelection();
        return;
      } else if (key === 'v') {
        if (isReadOnly) return;
        e.preventDefault();
        e.stopPropagation();
        // Use new clipboard context for pasting
        pasteClipboard();
        return;
      } else if (key === 'z') {
        if (isReadOnly) return;
        e.preventDefault();
        if (canUndo) undo();
      } else if (key === 'y') {
        if (isReadOnly) return;
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', handler as any, { capture: true });
    return () => window.removeEventListener('keydown', handler as any, { capture: true });
  }, [selectedCell, selectedRange, showCursor, cellData, copySelection, cutSelection, pasteClipboard, undo, redo, canUndo, canRedo, isReadOnly]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      setHasTextSelection(selection ? selection.toString().length > 0 : false);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    // document.addEventListener('mouseup', (e) => handleMouseUp(e as MouseEvent));
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      // document.removeEventListener('mouseup', (e) => handleMouseUp(e as MouseEvent));
    };
  }, [setHasTextSelection]);

  const handleImageResize = (id: string, width: number, height: number) => {
    setFloatingImages((prev: any[]) => prev.map((img: any) => 
      img.id === id ? { ...img, width, height } : img
    ));
  };

  const handleImageMove = (id: string, x: number, y: number) => {
    setFloatingImages((prev: any[]) => prev.map((img: any) => 
      img.id === id ? { ...img, x, y } : img
    ));
  };

  const handleImageRotate = (id: string, rotation: number) => {
    setFloatingImages((prev: any[]) => prev.map((img: any) => 
      img.id === id ? { ...img, rotation } : img
    ));
  };

  const handleImageTransform = (id: string, property: string, value: number) => {
    setFloatingImages((prev: any[]) => prev.map((img: any) => 
      img.id === id ? { ...img, [property]: value } : img
    ));
  };

  const parseRange = (range: string) => {
    const match = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) return [];
    
    const [, startCol, startRow, endCol, endRow] = match;
    const startColIndex = startCol.charCodeAt(0) - 65;
    const endColIndex = endCol.charCodeAt(0) - 65;
    const startRowIndex = parseInt(startRow) - 1;
    const endRowIndex = parseInt(endRow) - 1;
    
    const data = [];
    for (let row = startRowIndex; row <= endRowIndex; row++) {
      const rowData = [];
      for (let col = startColIndex; col <= endColIndex; col++) {
        const cellKey = getCellKey(row, col);
        rowData.push(cellData[cellKey] || '');
      }
      data.push(rowData);
    }
    return data;
  };

  const getChartData = (chart: any) => {
    if (!chart.dataRange) return chart.data;
    
    const rangeData = parseRange(chart.dataRange);
    if (rangeData.length === 0) return chart.data;
    
    const chartData = [];
    for (let i = 0; i < rangeData.length; i++) {
      const [label, value] = rangeData[i];
      if (label && value) {
        chartData.push({
          label: label.toString(),
          value: parseFloat(value.toString()) || 0
        });
      }
    }
    return chartData.length > 0 ? chartData : chart.data;
  };

  return (
    <div className="w-full" style={{ position: 'relative', fontSize: '13px', minHeight: '100%' }}>
      <AutosaveNotification visible={showAutosave} />
      
      {/* Formula Dropdown */}
      {showFormulaDropdown && (
        <FormulaDropdown
          position={formulaDropdownPosition}
          onSelect={handleFormulaSelect}
          onClose={() => setShowFormulaDropdown(false)}
          searchText={formulaSearchText}
        />
      )}

      {/* Formula Selection Mode Indicator */}
      {formulaSelectionMode && selectedFormula && (
        <div 
          className="fixed bottom-4 right-4 text-black px-6 py-3 rounded-lg shadow-xl z-[10000] flex items-center gap-3"
          style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}
        >
          <div>
            <p className="font-semibold text-sm">Selecting cells for {selectedFormula.name}</p>
            <p className="text-xs opacity-90 mt-1">
              {selectedFormula.requiresRange 
                ? 'Click and drag to select a range, then press Enter' 
                : 'Click cells to add them, then press Enter'}
            </p>
            <p className="text-xs opacity-75 mt-1">Press Esc to cancel</p>
          </div>
        </div>
      )}

      {/* New Formula Mode Indicator */}
      {isFormulaMode && activeFormula && (
        <div 
          className="fixed bottom-4 right-4 text-black px-6 py-3 rounded-lg shadow-xl z-[10000] flex items-center gap-3"
          style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}
        >
          <div>
            <p className="font-semibold text-sm">Building {activeFormula} Formula</p>
            <p className="text-xs opacity-90 mt-1">
              Click cells to select them: {formulaSelectionCells.join(', ') || 'None selected'}
            </p>
            <p className="text-xs opacity-75 mt-1">Press Enter to apply • Press Esc to cancel</p>
          </div>
        </div>
      )}

      {/* Fill Dragging Indicator */}
      {isFillDragging && fillStart && fillEnd && (
        <div 
          className="fixed bottom-4 left-4 text-black px-4 py-2 rounded-lg shadow-xl z-[10000]"
          style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}
        >
          <p className="font-semibold text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2v12M2 8h12" stroke="#00875A" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Auto-Fill: {getCellKey(fillStart.row, fillStart.col)} → {getCellKey(fillEnd.row, fillEnd.col)}
          </p>
          <p className="text-xs opacity-90 mt-1">
            {(() => {
              const sourceKey = getCellKey(fillStart.row, fillStart.col);
              const sourceValue = cellData[sourceKey] || '';
              const numericValue = parseFloat(sourceValue);
              const isNumber = !isNaN(numericValue) && isFinite(numericValue) && sourceValue.trim() !== '';
              const cellCount = selectedRange 
                ? `${Math.abs(selectedRange.endRow - selectedRange.startRow) + 1} × ${Math.abs(selectedRange.endCol - selectedRange.startCol) + 1} cells`
                : '1 cell';
              
              if (isNumber) {
                const endNum = numericValue + Math.abs(selectedRange ? (selectedRange.endRow - selectedRange.startRow + selectedRange.endCol - selectedRange.startCol) : 0);
                return `📊 Sequence: ${sourceValue} → ${endNum} • ${cellCount}`;
              } else {
                return `📝 Copy: "${sourceValue}" • ${cellCount}`;
              }
            })()}
          </p>
        </div>
      )}

      <div 
        ref={containerRef}
        className="overflow-auto bg-white"
        style={{ 
          cursor: isTextBoxMode ? 'crosshair' : 'default',
          userSelect: isDragging ? 'none' : 'auto',
          WebkitUserSelect: isDragging ? 'none' : 'auto',
          MozUserSelect: isDragging ? 'none' : 'auto',
          msUserSelect: isDragging ? 'none' : 'element',
          position: 'relative'
        } as CSSProperties}
      >
        <div className="inline-block relative" style={{ minWidth: '100%' }}>
          <div style={{ position: 'relative' }}>
            <table style={{ 
              fontSize: `${zoomLevel}%`, 
              tableLayout: 'auto', 
              userSelect: 'none', 
              fontFamily: 'Calibri, sans-serif', 
              width: 'auto',
              borderCollapse: 'separate',
              borderSpacing: '0'
            }}>
              <thead>
                <tr>
                  <th className="sticky top-0 left-0" style={{ 
                    width: '42px', 
                    height: '28px', 
                    minHeight: '28px',
                    backgroundColor: '#f0f0f0', 
                    borderRight: '1px solid #d0d0d0', 
                    borderBottom: '1px solid #a6a6a6',
                    zIndex: 30,
                    visibility: showHeadings ? 'visible' : 'hidden' 
                  }}></th>
                  {Array.from({ length: COLS }).map((_, colIndex) => (
                    <th
                      key={colIndex}
                      className="sticky top-0 text-center"
                      style={{ 
                        minWidth: '64px',
                        height: '28px', 
                        minHeight: '28px', 
                        padding: '0', 
                        fontSize: '11px', 
                        lineHeight: '28px',
                        fontWeight: 'bold',
                        fontFamily: 'Calibri, sans-serif',
                        backgroundColor: '#f0f0f0',
                        borderRight: '1px solid #d0d0d0',
                        borderBottom: '1px solid #a6a6a6',
                        color: '#000000',
                        zIndex: 20,
                        visibility: showHeadings ? 'visible' : 'hidden'
                      }}
                    >
                      {getColumnLabel(colIndex)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: ROWS }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="sticky left-0 text-center" style={{ 
                      width: '42px',
                      minWidth: '42px',
                      maxWidth: '42px',
                      height: '20px', 
                      minHeight: '20px', 
                      padding: '0',
                      fontSize: '11px', 
                      lineHeight: '20px',
                      fontWeight: 'bold',
                      fontFamily: 'Calibri, sans-serif',
                      backgroundColor: '#f0f0f0',
                      borderRight: '1px solid #d0d0d0',
                      borderBottom: '1px solid #d0d0d0',
                      color: '#000000',
                      zIndex: 15,
                      visibility: showHeadings ? 'visible' : 'hidden'
                    }}>
                      {rowIndex + 1}
                    </td>
                    {Array.from({ length: COLS }).map((_, colIndex) => {
                      const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                      const isInRange = isCellInRange(rowIndex, colIndex);
                      const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                      const shouldShowInput = isEditing && showCursor; // Only show input when cursor should be visible
                      const cellKey = getCellKey(rowIndex, colIndex);
                      
                      // Safe value extraction - handle objects, primitives, etc.
                      const rawValue = cellData[cellKey];
                      let cellValue: string;
                      
                      if (rawValue == null) {
                        // null or undefined
                        cellValue = '';
                      } else if (typeof rawValue === 'string') {
                        cellValue = rawValue;
                      } else if (typeof rawValue === 'object' && rawValue !== null && 'value' in rawValue) {
                        // Template data format: { value: '...', ... }
                        cellValue = (rawValue as any).value != null ? String((rawValue as any).value) : '';
                      } else {
                        // Number, boolean, or other primitive
                        cellValue = String(rawValue);
                      }
                      
                      const cellFormat: CellFormat = cellFormats[cellKey] || {};
                      
                      // Check if this cell is part of formula selection (local or context)
                      const localFormulaIndex = formulaSelectedCells.indexOf(cellKey);
                      const contextFormulaIndex = formulaSelectionCells.indexOf(cellKey);
                      const formulaSelectionIndex = contextFormulaIndex !== -1 ? contextFormulaIndex : localFormulaIndex;
                      const isFormulaSelected = formulaSelectionIndex !== -1;
                      
                      // Enhanced color palette for formula selection with unique colors per operand
                      const formulaColors = [
                        { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', name: 'Blue' },      // First operand - blue
                        { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', name: 'Green' },     // Second operand - green
                        { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', name: 'Red' },       // Third operand - red
                        { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', name: 'Purple' },   // Fourth operand - purple
                        { bg: 'rgba(251, 146, 60, 0.15)', border: '#fb923c', name: 'Orange' },   // Fifth operand - orange
                        { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899', name: 'Pink' },     // Sixth operand - pink
                      ];
                      
                      const formulaColor = isFormulaSelected ? formulaColors[formulaSelectionIndex % formulaColors.length] : null;

                      // Get display value (evaluated for formulas using backend)
                      // Safe check: only call startsWith on strings
                      const isFormula = typeof cellValue === 'string' && cellValue.startsWith('=');
                      const displayValue = isFormula
                        ? getCellDisplayValue(cellData, cellKey)
                        : (cellEvaluatedValues.has(cellKey) ? String(cellEvaluatedValues.get(cellKey)) : cellValue);

                      // Evaluate conditional formatting for this cell (always pass string)
                      const conditionalFormat = evaluateConditionalFormatting(cellKey, cellValue || '');

                      // Helper function to convert border style to CSS
                      const getBorderCSS = (side: 'top' | 'right' | 'bottom' | 'left') => {
                        const borders = cellFormat.borders;
                        if (!borders || !borders[side]) return undefined;
                        
                        const border = borders[side];
                        if (!border || border.style === 'none') return undefined;
                        
                        let width = '1px';
                        let style = 'solid';
                        
                        switch (border.style) {
                          case 'thin':
                            width = '1px';
                            break;
                          case 'thick':
                            width = '2px';
                            break;
                          case 'double':
                            width = '3px';
                            style = 'double';
                            break;
                        }
                        
                        const color = border.color || '#000000';
                        const result = `${width} ${style} ${color}`;
                        return result;
                      };

                      const getCellStyle = () => {
                        const style: CSSProperties = {
                          color: '#000000',
                          fontFamily: 'Calibri, sans-serif',
                          fontSize: '11px'
                        };
                        
                        if (cellFormat.fontFamily) style.fontFamily = cellFormat.fontFamily;
                        if (cellFormat.fontSize) {
                          const fontSize = typeof cellFormat.fontSize === 'number' ? `${cellFormat.fontSize}px` : cellFormat.fontSize;
                          style.fontSize = fontSize;
                        }
                        if (cellFormat.bold) style.fontWeight = 'bold';
                        if (cellFormat.italic) style.fontStyle = 'italic';
                        if (cellFormat.underline) style.textDecoration = 'underline';
                        if (cellFormat.textAlign) style.textAlign = cellFormat.textAlign as any;
                        if (cellFormat.color) {
                          style.color = cellFormat.color;
                        }
                        if (cellFormat.backgroundColor) style.backgroundColor = cellFormat.backgroundColor;
                        
                        if (conditionalFormat) {
                          if (conditionalFormat.bgColor) style.backgroundColor = conditionalFormat.bgColor;
                          if (conditionalFormat.textColor) style.color = conditionalFormat.textColor;
                          if (conditionalFormat.bold) style.fontWeight = 'bold';
                          if (conditionalFormat.italic) style.fontStyle = 'italic';
                          if (conditionalFormat.underline) {
                            style.textDecoration = style.textDecoration === 'underline' 
                              ? 'underline' 
                              : (style.textDecoration ? `${style.textDecoration} underline` : 'underline');
                          }
                        }

                        return style;
                      };

                      // Get the cell style with all formatting applied
                      const appliedCellStyle = getCellStyle();
                      
                      // Check if cell has custom borders
                      const hasCustomBorders = cellFormat.borders && (
                        cellFormat.borders.top || 
                        cellFormat.borders.right || 
                        cellFormat.borders.bottom || 
                        cellFormat.borders.left
                      );

                      // Extract custom borders if they exist
                      const customBorderTop = getBorderCSS('top');
                      const customBorderRight = getBorderCSS('right');
                      const customBorderBottom = getBorderCSS('bottom');
                      const customBorderLeft = getBorderCSS('left');
                      
                      // (Debug logging for cells F6-F11 removed)

                      return (
                        <td
                          key={colIndex}
                          data-cell-key={cellKey}
                          style={{ 
                            position: 'relative',
                            minWidth: '64px',
                            height: 'auto',
                            minHeight: '20px',
                            padding: '2px 4px',
                            overflow: 'visible',
                            cursor: isFillDragging ? 'crosshair' : 'default',
                            whiteSpace: 'nowrap',
                            boxSizing: 'border-box',
                            // Apply base cell styling first
                            ...appliedCellStyle,
                            // Then apply conditional background colors (can override)
                            backgroundColor: isInRange && !isSelected ? '#e7f3ff' : 
                                           isFillDragging && selectedRange && 
                                           rowIndex >= selectedRange.startRow && rowIndex <= selectedRange.endRow &&
                                           colIndex >= selectedRange.startCol && colIndex <= selectedRange.endCol ? 'rgba(0, 120, 212, 0.1)' :
                                           isFormulaSelected && formulaColor ? formulaColor.bg :
                                           appliedCellStyle.backgroundColor ? appliedCellStyle.backgroundColor :
                                           cellFormat.backgroundColor ? cellFormat.backgroundColor :
                                           conditionalFormat?.bgColor && !isFillDragging && !isFormulaSelected && !isInRange ? conditionalFormat.bgColor :
                                           'white',
                            outline: isSelected ? '2px solid #0078d4' : 'none',
                            outlineOffset: isSelected ? '-2px' : '0',
                            zIndex: isSelected ? 10 : 'auto',
                            // Apply ALL borders explicitly - dashed for formula selection, custom, or gridline/none
                            borderTop: isFormulaSelected && formulaColor ? `2px dashed ${formulaColor.border}` : (customBorderTop || (showGridlines ? '1px solid #d0d0d0' : 'none')),
                            borderRight: isFormulaSelected && formulaColor ? `2px dashed ${formulaColor.border}` : (customBorderRight || (showGridlines ? '1px solid #d0d0d0' : 'none')),
                            borderBottom: isFormulaSelected && formulaColor ? `2px dashed ${formulaColor.border}` : (customBorderBottom || (showGridlines ? '1px solid #d0d0d0' : 'none')),
                            borderLeft: isFormulaSelected && formulaColor ? `2px dashed ${formulaColor.border}` : (customBorderLeft || (showGridlines ? '1px solid #d0d0d0' : 'none')),
                            // Special states (formula selection with glow, fill drag) applied last
                            ...(isFormulaSelected && formulaColor ? {
                              boxShadow: `0 0 8px ${formulaColor.border}40, 0 0 0 2px ${formulaColor.border} inset`,
                            } : {}),
                            ...(isFillDragging && selectedRange && 
                               rowIndex >= selectedRange.startRow && rowIndex <= selectedRange.endRow &&
                               colIndex >= selectedRange.startCol && colIndex <= selectedRange.endCol && !(fillStart && rowIndex === fillStart.row && colIndex === fillStart.col) ? {
                              boxShadow: '0 0 0 1px #0078d4 inset',
                            } : {})
                          }}
                          onMouseDown={(e) => {
                            if (formulaSelectionMode) {
                              return;
                            }
                            handleCellMouseDown(rowIndex, colIndex, e);
                          }}
                          onMouseEnter={(e) => {
                            // Track hover for live cursor collaboration
                            setHoveredCell({ row: rowIndex, col: colIndex });
                            
                            if (isFillDragging) {
                              handleFillDragMove(rowIndex, colIndex);
                            } else if (isDragging) {
                              handleCellMouseEnter(rowIndex, colIndex);
                            }
                          }}
                          onMouseLeave={() => {
                            // Clear hover when leaving cell
                            setHoveredCell(null);
                          }}
                          onClick={(e) => {
                            if (formulaSelectionMode) {
                              handleFormulaCellClick(rowIndex, colIndex);
                            } else {
                              // Prevent single click from firing on double click
                              if (e.detail === 1) {
                                handleCellClick(rowIndex, colIndex);
                              }
                            }
                          }}
                          onDoubleClick={() => {
                            if (!formulaSelectionMode) {
                              handleCellDoubleClick(rowIndex, colIndex);
                            }
                          }}
                          onMouseUp={(e) => {
                            if (isFillDragging) handleFillDragEnd();
                          }}
                        >
                          {shouldShowInput ? (
                            <input
                              ref={inputRef}
                              type="text"
                              id={`cell-input-${rowIndex}-${colIndex}`}
                              name={`cell-${getCellKey(rowIndex, colIndex)}`}
                              value={cellValue}
                              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                              onFocus={() => setInputMessage(null)}
                              onBlur={(e) => {
                                // Validate before blur
                                const currentValue = cellValue || '';
                                handleCellValidation(rowIndex, colIndex, currentValue);
                                
                                // Release cell lock and send editing status
                                releaseCellLock(rowIndex, colIndex);
                                sendEditingStatus(rowIndex, colIndex, false);
                                
                                // Send cell update to collaborators
                                const key = getCellKey(rowIndex, colIndex);
                                sendCellUpdate(rowIndex, colIndex, cellData[key], cellFormats[key]);
                                
                                // Delay to allow click events to process
                                setTimeout(() => {
                                  setEditingCell(null);
                                  setShowCursor(false);
                                }, 100);
                              }}
                              onMouseUp={() => {
                                const selection = window.getSelection();
                                setHasTextSelection(selection ? selection.toString().length > 0 : false);
                              }}
                              onSelect={() => {
                                const target = inputRef.current;
                                if (target) {
                                  setHasTextSelection(target.selectionStart !== target.selectionEnd);
                                }
                              }}
                              autoFocus
                              style={{...getCellStyle(), height: 'auto', minHeight: '20px', lineHeight: '1.2', padding: '2px'}}
                              className="w-full h-full px-1 outline-none border-none bg-white"
                            />
                          ) : (
                            <div 
                              style={{...getCellStyle(), height: 'auto', minHeight: '20px', lineHeight: '1.2', padding: '2px'}}
                              className="px-1 h-full flex items-center"
                              onMouseUp={() => {
                                const selection = window.getSelection();
                                setHasTextSelection(selection ? selection.toString().length > 0 : false);
                              }}
                            >
                              <span className="w-full" style={{ textAlign: (cellFormat.textAlign as any) || 'left', whiteSpace: 'nowrap', overflow: 'visible' }}>
                                {cellFormat.isLink && cellFormat.linkUrl ? (
                                  <a
                                    href={cellFormat.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{color: '#B8860B', textDecoration: 'underline', cursor: 'pointer'}}
                                    className="hover:opacity-80"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {displayValue}
                                  </a>
                                ) : (
                                  displayValue
                                )}
                              </span>
                              {/* List Validation Dropdown Arrow */}
                              {cellValidations[cellKey]?.type === 'list' && cellValidations[cellKey]?.options && (
                                <button
                                  className="ml-auto shrink-0 hover:bg-gray-200 dark:hover:bg-gray-600 rounded p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const cellElement = document.querySelector(`[data-cell-key="${cellKey}"]`);
                                    if (cellElement) {
                                      const rect = cellElement.getBoundingClientRect();
                                      setValidationDropdownPosition({
                                        top: rect.bottom + window.scrollY,
                                        left: rect.left + window.scrollX
                                      });
                                      setValidationDropdownCell(cellKey);
                                      setShowValidationDropdown(true);
                                    }
                                  }}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                          {/* Fill Handle - Blue square on selected cell (MS Excel style) */}
                          {isSelected && !formulaSelectionMode && !isReadOnly && (
                            <div
                              className="absolute select-none"
                              onMouseDown={handleFillDragStart}
                              title="Drag to auto-fill"
                              style={{
                                bottom: '-3px',
                                right: '-3px',
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#0078d4',
                                border: '1px solid #FFFFFF',
                                borderRadius: '0px',
                                zIndex: 10000,
                                pointerEvents: 'auto',
                                cursor: 'crosshair',
                                boxShadow: '0 0 0 1px #0078d4',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none',
                              }}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Overlays: images, textboxes, drawing path preview */}
            {floatingImages.map(image => {
              const imgStyle = (image as any).style || {};
              const borderStyle = imgStyle.border ? `${imgStyle.border.width}px ${imgStyle.border.style} ${imgStyle.border.color}` : 'none';
              const boxShadow = imgStyle.shadow ? 
                `${imgStyle.shadow.offsetX}px ${imgStyle.shadow.offsetY}px ${imgStyle.shadow.blur}px ${imgStyle.shadow.color}` : 
                'none';
              
              return (
              <div
                key={image.id}
                className={`absolute select-none ${selectedImage === image.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: image.x,
                  top: image.y,
                  width: image.width,
                  height: image.height,
                  transform: `rotate(${image.rotation}deg) scaleX(${image.scaleX}) scaleY(${image.scaleY})`,
                  opacity: image.opacity,
                  transformOrigin: 'center',
                  zIndex: (image as any).zIndex || 1
                }}
                onClick={() => setSelectedImage(image.id)}
              >
                <div
                  className="w-full h-full"
                  style={{ cursor: isReadOnly ? 'default' : 'move' }}
                  onMouseDown={(e) => {
                    if (isReadOnly) return;
                    const startX = e.clientX - image.x;
                    const startY = e.clientY - image.y;
                    const handleMouseMove = (e: MouseEvent) => {
                      handleImageMove(image.id, e.clientX - startX, e.clientY - startY);
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove as any);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove as any);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <img
                    src={image.src}
                    alt="Floating image"
                    className="w-full h-full object-cover"
                    draggable={false}
                    style={{
                      border: borderStyle,
                      borderRadius: `${(imgStyle as any).borderRadius || 0}px`,
                      boxShadow: boxShadow,
                      filter: (imgStyle as any).filter || 'none'
                    }}
                  />
                </div>
                {selectedImage === image.id && (
                  <>
                    <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
                    {!isReadOnly && (
                    <>
                    {/* Resize Handles - Corners */}
                    <div
                      className="absolute w-3 h-3 bg-white border-2 border-blue-500 cursor-nw-resize flex items-center justify-center"
                      style={{ left: -6, top: -6 }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = image.width;
                        const startHeight = image.height;
                        const startLeft = image.x;
                        const startTop = image.y;
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          const deltaY = e.clientY - startY;
                          const newWidth = Math.max(20, startWidth - deltaX);
                          const newHeight = Math.max(20, startHeight - deltaY);
                          setFloatingImages(prev => prev.map(img => 
                            img.id === image.id ? { 
                              ...img, 
                              width: newWidth, 
                              height: newHeight,
                              x: startLeft + (startWidth - newWidth),
                              y: startTop + (startHeight - newHeight)
                            } : img
                          ));
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove as any);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove as any);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" className="pointer-events-none">
                        <path d="M0,2 L2,0 L2,2 L0,2 M2,0 L2,2 L2,0" fill="#2563eb" />
                      </svg>
                    </div>
                    <div
                      className="absolute w-3 h-3 bg-white border-2 border-blue-500 cursor-ne-resize flex items-center justify-center"
                      style={{ right: -6, top: -6 }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = image.width;
                        const startHeight = image.height;
                        const startTop = image.y;
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          const deltaY = e.clientY - startY;
                          const newWidth = Math.max(20, startWidth + deltaX);
                          const newHeight = Math.max(20, startHeight - deltaY);
                          setFloatingImages(prev => prev.map(img => 
                            img.id === image.id ? { 
                              ...img, 
                              width: newWidth, 
                              height: newHeight,
                              y: startTop + (startHeight - newHeight)
                            } : img
                          ));
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove as any);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove as any);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" className="pointer-events-none">
                        <path d="M6,0 L8,2 L6,2 L6,0 M6,0 L6,2 L6,0" fill="#2563eb" />
                      </svg>
                    </div>
                    <div
                      className="absolute w-3 h-3 bg-white border-2 border-blue-500 cursor-sw-resize flex items-center justify-center"
                      style={{ left: -6, bottom: -6 }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = image.width;
                        const startHeight = image.height;
                        const startLeft = image.x;
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          const deltaY = e.clientY - startY;
                          const newWidth = Math.max(20, startWidth - deltaX);
                          const newHeight = Math.max(20, startHeight + deltaY);
                          setFloatingImages(prev => prev.map(img => 
                            img.id === image.id ? { 
                              ...img, 
                              width: newWidth, 
                              height: newHeight,
                              x: startLeft + (startWidth - newWidth)
                            } : img
                          ));
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove as any);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove as any);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" className="pointer-events-none">
                        <path d="M0,6 L2,8 L2,6 L0,6 M0,6 L2,6 L0,6" fill="#2563eb" />
                      </svg>
                    </div>
                    <div
                      className="absolute w-3 h-3 bg-white border-2 border-blue-500 cursor-se-resize flex items-center justify-center"
                      style={{ right: -6, bottom: -6 }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = image.width;
                        const startHeight = image.height;
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          const deltaY = e.clientY - startY;
                          setFloatingImages(prev => prev.map(img => 
                            img.id === image.id ? { 
                              ...img, 
                              width: Math.max(20, startWidth + deltaX), 
                              height: Math.max(20, startHeight + deltaY)
                            } : img
                          ));
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove as any);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove as any);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" className="pointer-events-none">
                        <path d="M6,6 L8,8 L6,8 L6,6 M8,6 L8,8 L6,6" stroke="#2563eb" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                    
                    {/* Resize Handles - Edges */}
                    <div
                      className="absolute w-full h-2 cursor-n-resize flex items-center justify-center"
                      style={{ left: 0, top: -4 }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startY = e.clientY;
                        const startHeight = image.height;
                        const startTop = image.y;
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaY = e.clientY - startY;
                          const newHeight = Math.max(20, startHeight - deltaY);
                          setFloatingImages(prev => prev.map(img => 
                            img.id === image.id ? { 
                              ...img, 
                              height: newHeight,
                              y: startTop + (startHeight - newHeight)
                            } : img
                          ));
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove as any);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove as any);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <svg width="12" height="8" viewBox="0 0 12 8" className="pointer-events-none">
                        <path d="M4,4 L6,0 L8,4 M6,0 L6,8" stroke="#2563eb" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                    <div
                      className="absolute w-full h-2 cursor-s-resize flex items-center justify-center"
                      style={{ left: 0, bottom: -4 }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startY = e.clientY;
                        const startHeight = image.height;
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaY = e.clientY - startY;
                          setFloatingImages(prev => prev.map(img => 
                            img.id === image.id ? { 
                              ...img, 
                              height: Math.max(20, startHeight + deltaY)
                            } : img
                          ));
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove as any);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove as any);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <svg width="12" height="8" viewBox="0 0 12 8" className="pointer-events-none">
                        <path d="M4,4 L6,8 L8,4 M6,0 L6,8" stroke="#2563eb" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                    <div
                      className="absolute w-2 h-full cursor-w-resize flex items-center justify-center"
                      style={{ left: -4, top: 0 }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startWidth = image.width;
                        const startLeft = image.x;
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          const newWidth = Math.max(20, startWidth - deltaX);
                          setFloatingImages(prev => prev.map(img => 
                            img.id === image.id ? { 
                              ...img, 
                              width: newWidth,
                              x: startLeft + (startWidth - newWidth)
                            } : img
                          ));
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove as any);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove as any);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <svg width="8" height="12" viewBox="0 0 8 12" className="pointer-events-none">
                        <path d="M4,4 L0,6 L4,8 M0,6 L8,6" stroke="#2563eb" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                    <div
                      className="absolute w-2 h-full cursor-e-resize flex items-center justify-center"
                      style={{ right: -4, top: 0 }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startWidth = image.width;
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          setFloatingImages(prev => prev.map(img => 
                            img.id === image.id ? { 
                              ...img, 
                              width: Math.max(20, startWidth + deltaX)
                            } : img
                          ));
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove as any);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove as any);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <svg width="8" height="12" viewBox="0 0 8 12" className="pointer-events-none">
                        <path d="M4,4 L8,6 L4,8 M0,6 L8,6" stroke="#2563eb" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                    </>
                    )}
                  </>
                )}
              </div>
            );
            })}
            {floatingTextBoxes.map(textBox => (
              <div
                key={textBox.id}
                className={`absolute select-none ${selectedImage === textBox.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: textBox.x,
                  top: textBox.y,
                  width: textBox.width,
                  height: textBox.height,
                  backgroundColor: textBox.drawPath ? 'transparent' : textBox.backgroundColor,
                  border: textBox.drawPath ? 'none' : `${textBox.borderWidth}px solid ${textBox.borderColor}`,
                  padding: textBox.padding
                }}
                onClick={() => setSelectedImage(textBox.id)}
              >
                {textBox.drawPath && (
                  <svg 
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <path
                      d={`M ${textBox.drawPath.map(p => `${p.x},${p.y}`).join(' L ')} Z`}
                      stroke={textBox.borderColor}
                      strokeWidth={textBox.borderWidth}
                      fill={textBox.backgroundColor}
                    />
                  </svg>
                )}
                <textarea
                  value={textBox.text}
                  readOnly={(window as any).__etherxCanEdit === false}
                  onChange={(e) => {
                    if ((window as any).__etherxCanEdit === false) return;
                    setFloatingTextBoxes(prev => prev.map(tb => 
                      tb.id === textBox.id ? { ...tb, text: e.target.value } : tb
                    ));
                  }}
                  className="w-full h-full resize-none border-none outline-none bg-transparent"
                  style={{
                    fontSize: textBox.fontSize,
                    fontFamily: textBox.fontFamily,
                    color: textBox.color,
                    textAlign: textBox.textAlign
                  }}
                />
                {selectedImage === textBox.id && (
                  <>
                    <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
                    {(window as any).__etherxCanEdit !== false && (
                    <button
                      className="absolute -top-2 -right-2 w-5 h-5 text-black text-xs rounded-full flex items-center justify-center"
                      style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFloatingTextBoxes(prev => prev.filter(tb => tb.id !== textBox.id));
                        setSelectedImage(null);
                      }}
                    >
                      ×
                    </button>)}
                  </>
                )}
              </div>
            ))}

            {/* ChartsLayer - Renders all charts as overlays */}
            <ChartCanvas
              sheetId={activeSheetId}
              selectedChartId={selectedChart}
              onChartSelect={(chartId) => {
                setSelectedChart(chartId);
                if (chartId) {
                  // Deselect images when chart is selected
                  setSelectedImage(null);
                }
              }}
              cellData={cellData}
            />

            {/* Drawing Path Preview */}
            {isDrawingPath && drawPath.length > 0 && (
              <svg 
                className="absolute inset-0 pointer-events-none z-10"
                style={{ width: '100%', height: '100%' }}
              >
                <path
                  d={`M ${drawPath.map(p => `${p.x},${p.y}`).join(' L ')}`}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Validation Dropdown for List Type */}
      {showValidationDropdown && validationDropdownCell && (() => {
        const validation = cellValidations[validationDropdownCell];
        if (!validation || validation.type !== 'list' || !validation.options) return null;
        
        return (
          <div
            className="absolute z-[9999] bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto"
            style={{
              top: validationDropdownPosition.top,
              left: validationDropdownPosition.left,
              minWidth: '150px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {validation.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center px-4 py-2 cursor-pointer rounded transition-all bg-white"
                style={{ background: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                onClick={() => {
                  setCellData(prev => ({ ...prev, [validationDropdownCell]: option }));
                  setShowValidationDropdown(false);
                }}
              >
                <span className="text-black font-medium">{option}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Validation Error Modal */}
      {validationModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => {
            if (validationModal.type !== 'warning') {
              validationModal.onConfirm?.();
            } else {
              validationModal.onCancel?.();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 border border-gray-300"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 100%)',
              padding: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3">
              <h2 className="text-base font-bold text-black mb-1.5">
                {validationModal.title}
              </h2>
              <p className="text-xs text-black whitespace-pre-wrap">
                {validationModal.message}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              {validationModal.type === 'warning' && (
                <button
                  onClick={() => validationModal.onCancel?.()}
                  className="px-3 py-1.5 text-xs font-medium text-black bg-white border-2 border-black rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => validationModal.onConfirm?.()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-black border-2 border-black rounded hover:bg-gray-800 transition-colors"
              >
                {validationModal.type === 'warning' ? 'Continue' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Format Panel */}
      {selectedImage && floatingImages.find(img => img.id === selectedImage) && (
        <ImageFormatPanel
          image={floatingImages.find(img => img.id === selectedImage)!}
          allImages={floatingImages}
          onUpdate={(updates) => {
            setFloatingImages(prev => prev.map(img => 
              img.id === selectedImage ? { ...img, ...updates } : img
            ));
          }}
          onClose={() => setSelectedImage(null)}
          onDelete={() => {
            setFloatingImages(prev => prev.filter(img => img.id !== selectedImage));
            setSelectedImage(null);
          }}
        />
      )}

      {/* Chart Format Panel */}
      {selectedChart && (
        <ChartFormattingPanel
          chartId={selectedChart}
          sheetId={activeSheetId}
          onClose={() => setSelectedChart(null)}
        />
      )}

      {/* Collaborative Cursors Overlay - MUST BE LAST FOR VISIBILITY */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
        <CollaborativeCursors 
          cellWidth={100}
          cellHeight={24}
          offsetX={50}
          offsetY={75}
        />
      </div>

      <AutosaveNotification 
        visible={showAutosave} 
        onClose={() => setShowAutosave(false)} 
      />
    </div>
  );
}
