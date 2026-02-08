/**
 * DOCUMENT STATE CONTEXT
 * Manages the complete in-memory document state and provides actions for all operations.
 * This is the SINGLE source of truth for the entire spreadsheet.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import {
  DocumentState,
  DocumentAction,
  SheetData,
  CellData,
  CellStyle,
  ImageObject,
  ShapeObject,
  ChartObject,
  GridConfig,
  ConditionalFormat,
  DataValidation,
  DocumentMetadata,
} from '../types/documentState';
import { uploadDocumentToIPFS, loadDocumentFromIPFS } from '../services/ipfsDocumentService';

// ============================================================================
// REDUCER
// ============================================================================

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return action.payload;

    case 'UPDATE_METADATA':
      return {
        ...state,
        metadata: {
          ...state.metadata,
          ...action.payload,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'ADD_SHEET':
      return {
        ...state,
        sheets: [...state.sheets, action.payload],
        metadata: {
          ...state.metadata,
          sheetCount: state.sheets.length + 1,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'REMOVE_SHEET': {
      const filteredSheets = state.sheets.filter(s => s.sheetId !== action.payload);
      return {
        ...state,
        sheets: filteredSheets,
        activeSheetId: state.activeSheetId === action.payload 
          ? (filteredSheets[0]?.sheetId || '')
          : state.activeSheetId,
        metadata: {
          ...state.metadata,
          sheetCount: filteredSheets.length,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'RENAME_SHEET':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? { ...sheet, name: action.payload.name }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'SET_ACTIVE_SHEET':
      return {
        ...state,
        activeSheetId: action.payload,
      };

    case 'UPDATE_CELL':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                cells: {
                  ...sheet.cells,
                  [action.payload.cellKey]: {
                    ...sheet.cells[action.payload.cellKey],
                    ...action.payload.data,
                  },
                },
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'UPDATE_CELLS':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                cells: {
                  ...sheet.cells,
                  ...Object.entries(action.payload.cells).reduce((acc, [key, data]) => {
                    acc[key] = {
                      ...sheet.cells[key],
                      ...data,
                    };
                    return acc;
                  }, {} as { [key: string]: CellData }),
                },
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'SET_CELL_STYLE':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                cells: {
                  ...sheet.cells,
                  [action.payload.cellKey]: {
                    ...sheet.cells[action.payload.cellKey],
                    style: {
                      ...sheet.cells[action.payload.cellKey]?.style,
                      ...action.payload.style,
                    },
                  },
                },
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'ADD_IMAGE':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                images: [...sheet.images, action.payload.image],
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'UPDATE_IMAGE':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                images: sheet.images.map(img =>
                  img.id === action.payload.imageId
                    ? { ...img, ...action.payload.updates }
                    : img
                ),
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'REMOVE_IMAGE':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                images: sheet.images.filter(img => img.id !== action.payload.imageId),
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'ADD_CHART':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                charts: [...sheet.charts, action.payload.chart],
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'UPDATE_CHART':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                charts: sheet.charts.map(chart =>
                  chart.id === action.payload.chartId
                    ? { ...chart, ...action.payload.updates }
                    : chart
                ),
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'REMOVE_CHART':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                charts: sheet.charts.filter(chart => chart.id !== action.payload.chartId),
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'UPDATE_GRID_CONFIG':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                grid: {
                  ...sheet.grid,
                  ...action.payload.config,
                },
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'SET_ROW_SIZE':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                grid: {
                  ...sheet.grid,
                  rowSizes: {
                    ...sheet.grid.rowSizes,
                    [action.payload.rowIndex]: action.payload.size,
                  },
                },
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'SET_COLUMN_SIZE':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                grid: {
                  ...sheet.grid,
                  columnSizes: {
                    ...sheet.grid.columnSizes,
                    [action.payload.colIndex]: action.payload.size,
                  },
                },
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'ADD_CONDITIONAL_FORMAT':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                conditionalFormatting: [...sheet.conditionalFormatting, action.payload.format],
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'REMOVE_CONDITIONAL_FORMAT':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                conditionalFormatting: sheet.conditionalFormatting.filter(
                  cf => cf.id !== action.payload.formatId
                ),
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'SET_DATA_VALIDATION':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                cells: {
                  ...sheet.cells,
                  [action.payload.cellKey]: {
                    ...sheet.cells[action.payload.cellKey],
                    validation: action.payload.validation,
                  },
                },
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'SET_SPARKLINE':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                cells: {
                  ...sheet.cells,
                  [action.payload.cellKey]: {
                    ...sheet.cells[action.payload.cellKey],
                    sparkline: action.payload.sparkline || undefined,
                  },
                },
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'PROTECT_SHEET':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                protected: action.payload.protected,
                protectionPassword: action.payload.password,
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'LOCK_CELLS':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.sheetId === action.payload.sheetId
            ? {
                ...sheet,
                cellLocks: {
                  ...(sheet.cellLocks || {}),
                  ...action.payload.cellKeys.reduce((acc, cellKey) => ({
                    ...acc,
                    [cellKey]: action.payload.locked,
                  }), {}),
                },
              }
            : sheet
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'RESTORE_FROM_IPFS':
      return action.payload;

    default:
      return state;
  }
}

// ============================================================================
// INITIAL STATE
// ============================================================================

function createInitialState(): DocumentState {
  const now = new Date().toISOString();
  const sheetId = 'sheet-1';
  
  return {
    documentId: `doc-${Date.now()}`,
    metadata: {
      documentId: `doc-${Date.now()}`,
      title: 'Untitled Spreadsheet',
      owner: 'anonymous',
      createdAt: now,
      updatedAt: now,
      theme: 'light',
      sheetCount: 1,
      version: '1.0.0',
    },
    sheets: [
      {
        sheetId,
        name: 'Sheet1',
        visible: true,
        grid: {
          rows: 1000,
          columns: 26,
          rowSizes: {},
          columnSizes: {},
          frozenRows: 0,
          frozenColumns: 0,
          showGridlines: true,
          showRowHeaders: true,
          showColumnHeaders: true,
          defaultRowHeight: 24,
          defaultColumnWidth: 100,
          hiddenRows: [],
          hiddenColumns: [],
        },
        cells: {},
        images: [],
        shapes: [],
        charts: [],
        links: [],
        symbols: [],
        conditionalFormatting: [],
      },
    ],
    activeSheetId: sheetId,
    settings: {
      autoSave: true,
      autoSaveInterval: 30,
      showFormulaBar: true,
      calculationMode: 'auto',
      r1c1ReferenceStyle: false,
    },
    versionHistory: [],
  };
}

// ============================================================================
// CONTEXT
// ============================================================================

interface DocumentContextValue {
  state: DocumentState;
  dispatch: React.Dispatch<DocumentAction>;
  
  // Convenience methods
  updateCell: (sheetId: string, cellKey: string, data: Partial<CellData>) => void;
  setCellStyle: (sheetId: string, cellKey: string, style: Partial<CellStyle>) => void;
  addImage: (sheetId: string, image: ImageObject) => void;
  addChart: (sheetId: string, chart: ChartObject) => void;
  updateMetadata: (metadata: Partial<DocumentMetadata>) => void;
  setSparkline: (sheetId: string, cellKey: string, sparkline: any | null) => void;
  protectSheet: (sheetId: string, isProtected: boolean, password?: string) => void;
  lockCells: (sheetId: string, cellKeys: string[], locked: boolean) => void;
  isCellLocked: (sheetId: string, cellKey: string) => boolean;
  isSheetProtected: (sheetId: string) => boolean;
  saveToIPFS: () => Promise<string>; // Returns CID
  loadFromIPFS: (cid: string) => Promise<void>;
  
  // Active sheet helpers
  activeSheet: SheetData | undefined;
}

const DocumentContext = createContext<DocumentContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface DocumentProviderProps {
  children: React.ReactNode;
  initialDocumentId?: string;
  autoSaveEnabled?: boolean;
}

export function DocumentProvider({ 
  children, 
  initialDocumentId,
  autoSaveEnabled = true 
}: DocumentProviderProps) {
  const [state, dispatch] = useReducer(documentReducer, createInitialState());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Convenience methods
  const updateCell = useCallback((sheetId: string, cellKey: string, data: Partial<CellData>) => {
    dispatch({ type: 'UPDATE_CELL', payload: { sheetId, cellKey, data } });
  }, []);

  const setCellStyle = useCallback((sheetId: string, cellKey: string, style: Partial<CellStyle>) => {
    dispatch({ type: 'SET_CELL_STYLE', payload: { sheetId, cellKey, style } });
  }, []);

  const addImage = useCallback((sheetId: string, image: ImageObject) => {
    dispatch({ type: 'ADD_IMAGE', payload: { sheetId, image } });
  }, []);

  const addChart = useCallback((sheetId: string, chart: ChartObject) => {
    dispatch({ type: 'ADD_CHART', payload: { sheetId, chart } });
  }, []);

  const updateMetadata = useCallback((metadata: Partial<DocumentMetadata>) => {
    dispatch({ type: 'UPDATE_METADATA', payload: metadata });
  }, []);

  const setSparkline = useCallback((sheetId: string, cellKey: string, sparkline: any | null) => {
    dispatch({ type: 'SET_SPARKLINE', payload: { sheetId, cellKey, sparkline } });
  }, []);

  const protectSheet = useCallback((sheetId: string, isProtected: boolean, password?: string) => {
    dispatch({ type: 'PROTECT_SHEET', payload: { sheetId, protected: isProtected, password } });
  }, []);

  const lockCells = useCallback((sheetId: string, cellKeys: string[], locked: boolean) => {
    dispatch({ type: 'LOCK_CELLS', payload: { sheetId, cellKeys, locked } });
  }, []);

  const isCellLocked = useCallback((sheetId: string, cellKey: string): boolean => {
    const sheet = state.sheets.find(s => s.sheetId === sheetId);
    if (!sheet) return false;
    if (sheet.protected) return true; // Entire sheet protected
    return sheet.cellLocks?.[cellKey] || false;
  }, [state.sheets]);

  const isSheetProtected = useCallback((sheetId: string): boolean => {
    const sheet = state.sheets.find(s => s.sheetId === sheetId);
    return sheet?.protected || false;
  }, [state.sheets]);

  const saveToIPFS = useCallback(async (): Promise<string> => {
    try {
      const cid = await uploadDocumentToIPFS(state);
      
      // Add to version history
      dispatch({
        type: 'UPDATE_METADATA',
        payload: {
          updatedAt: new Date().toISOString(),
        },
      });
      
      // Update version history
      const newVersion = {
        cid,
        timestamp: new Date().toISOString(),
        author: state.metadata.owner,
      };
      
      const updatedState = {
        ...state,
        versionHistory: [...(state.versionHistory || []), newVersion],
      };
      
      dispatch({ type: 'SET_DOCUMENT', payload: updatedState });
      
      console.log('✅ Document saved to IPFS:', cid);
      return cid;
    } catch (error) {
      console.error('❌ Failed to save document to IPFS:', error);
      throw error;
    }
  }, [state]);

  const loadFromIPFS = useCallback(async (cid: string): Promise<void> => {
    try {
      const loadedState = await loadDocumentFromIPFS(cid);
      dispatch({ type: 'RESTORE_FROM_IPFS', payload: loadedState });
      console.log('✅ Document loaded from IPFS:', cid);
    } catch (error) {
      console.error('❌ Failed to load document from IPFS:', error);
      throw error;
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !state.settings?.autoSave) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    const interval = (state.settings?.autoSaveInterval || 30) * 1000;
    autoSaveTimerRef.current = setTimeout(() => {
      saveToIPFS().catch(console.error);
    }, interval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [state, autoSaveEnabled, saveToIPFS]);

  // Load initial document if provided
  useEffect(() => {
    if (initialDocumentId) {
      loadFromIPFS(initialDocumentId).catch(console.error);
    }
  }, [initialDocumentId, loadFromIPFS]);

  // Get active sheet
  const activeSheet = state.sheets.find(s => s.sheetId === state.activeSheetId);

  const value: DocumentContextValue = {
    state,
    dispatch,
    updateCell,
    setCellStyle,
    addImage,
    addChart,
    updateMetadata,
    setSparkline,
    protectSheet,
    lockCells,
    isCellLocked,
    isSheetProtected,
    saveToIPFS,
    loadFromIPFS,
    activeSheet,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useDocumentState() {
  const context = useContext(DocumentContext);
  if (!context) {
    // Provider missing — return a safe fallback to avoid crashing the app.
    // This allows components to render in degraded mode (useful in dev).
    console.warn('useDocumentState: DocumentProvider is missing. Returning fallback context.');

    const fallbackState = createInitialState();

    const fallback: DocumentContextValue = {
      state: fallbackState,
      dispatch: () => {},
      updateCell: () => {},
      setCellStyle: () => {},
      addImage: () => {},
      addChart: () => {},
      updateMetadata: () => {},
      setSparkline: () => {},
      protectSheet: () => {},
      lockCells: () => {},
      isCellLocked: () => false,
      isSheetProtected: () => false,
      saveToIPFS: async () => { throw new Error('DocumentProvider missing'); },
      loadFromIPFS: async () => { throw new Error('DocumentProvider missing'); },
      activeSheet: fallbackState.sheets[0],
    };

    return fallback;
  }

  return context;
}
