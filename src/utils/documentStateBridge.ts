/**
 * DOCUMENT STATE BRIDGE
 * Converts between legacy SpreadsheetContext format and new DocumentState format
 * Provides migration utilities
 */

import {
  DocumentState,
  SheetData,
  CellData,
  CellStyle,
  GridConfig,
} from '../types/documentState';
import { Cell } from '../types/spreadsheet';

/**
 * Convert legacy cell to DocumentState cell
 */
export function convertLegacyCellToDocumentCell(legacyCell: Cell): CellData {
  const cellStyle: CellStyle = {};
  
  if (legacyCell.bold) cellStyle.bold = true;
  if (legacyCell.italic) cellStyle.italic = true;
  if (legacyCell.underline) cellStyle.underline = true;
  if (legacyCell.color) cellStyle.textColor = legacyCell.color;
  if (legacyCell.backgroundColor) cellStyle.backgroundColor = legacyCell.backgroundColor;
  
  if (legacyCell.textAlign) {
    cellStyle.alignment = {
      horizontal: legacyCell.textAlign,
    };
  }
  
  if (legacyCell.borders) {
    cellStyle.border = {
      top: legacyCell.borders.top ? {
        style: legacyCell.borders.top.style,
        color: legacyCell.borders.top.color,
      } : undefined,
      right: legacyCell.borders.right ? {
        style: legacyCell.borders.right.style,
        color: legacyCell.borders.right.color,
      } : undefined,
      bottom: legacyCell.borders.bottom ? {
        style: legacyCell.borders.bottom.style,
        color: legacyCell.borders.bottom.color,
      } : undefined,
      left: legacyCell.borders.left ? {
        style: legacyCell.borders.left.style,
        color: legacyCell.borders.left.color,
      } : undefined,
    };
  }

  const cell: CellData = {
    value: legacyCell.value,
    type: legacyCell.formula ? 'formula' : 'string',
  };
  
  if (legacyCell.formula) cell.formula = legacyCell.formula;
  if (Object.keys(cellStyle).length > 0) cell.style = cellStyle;
  if (legacyCell.hyperlink) cell.hyperlink = legacyCell.hyperlink;
  if (legacyCell.validation) cell.validation = legacyCell.validation as any;
  if (legacyCell.mergedWith) cell.mergedWith = legacyCell.mergedWith;
  if (legacyCell.isMergeParent) cell.isMergeParent = legacyCell.isMergeParent;
  if (legacyCell.mergeSpan) cell.mergeSpan = legacyCell.mergeSpan;
  if (legacyCell.locked) cell.locked = legacyCell.locked;
  
  return cell;
}

/**
 * Convert DocumentState cell to legacy cell
 */
export function convertDocumentCellToLegacyCell(documentCell: CellData): Cell {
  const legacyCell: Cell = {
    value: typeof documentCell.value === 'string' ? documentCell.value : String(documentCell.value || ''),
  };
  
  if (documentCell.formula) legacyCell.formula = documentCell.formula;
  
  if (documentCell.style) {
    if (documentCell.style.bold) legacyCell.bold = true;
    if (documentCell.style.italic) legacyCell.italic = true;
    if (documentCell.style.underline) legacyCell.underline = true;
    if (documentCell.style.textColor) legacyCell.color = documentCell.style.textColor;
    if (documentCell.style.backgroundColor) legacyCell.backgroundColor = documentCell.style.backgroundColor;
    
    if (documentCell.style.alignment?.horizontal) {
      legacyCell.textAlign = documentCell.style.alignment.horizontal as 'left' | 'center' | 'right';
    }
    
    if (documentCell.style.border) {
      legacyCell.borders = {
        top: documentCell.style.border.top ? {
          style: documentCell.style.border.top.style as any,
          color: documentCell.style.border.top.color,
        } : undefined,
        right: documentCell.style.border.right ? {
          style: documentCell.style.border.right.style as any,
          color: documentCell.style.border.right.color,
        } : undefined,
        bottom: documentCell.style.border.bottom ? {
          style: documentCell.style.border.bottom.style as any,
          color: documentCell.style.border.bottom.color,
        } : undefined,
        left: documentCell.style.border.left ? {
          style: documentCell.style.border.left.style as any,
          color: documentCell.style.border.left.color,
        } : undefined,
      };
    }
  }
  
  if (documentCell.hyperlink) legacyCell.hyperlink = documentCell.hyperlink;
  if (documentCell.validation) legacyCell.validation = documentCell.validation as any;
  if (documentCell.mergedWith) legacyCell.mergedWith = documentCell.mergedWith;
  if (documentCell.isMergeParent) legacyCell.isMergeParent = documentCell.isMergeParent;
  if (documentCell.mergeSpan) legacyCell.mergeSpan = documentCell.mergeSpan;
  if (documentCell.locked) legacyCell.locked = documentCell.locked;
  
  return legacyCell;
}

/**
 * Migrate legacy spreadsheet data to DocumentState
 */
export function migrateToDocumentState(
  legacyData: any,
  owner: string = 'anonymous'
): DocumentState {
  const now = new Date().toISOString();
  const documentId = `doc-${Date.now()}`;
  
  const sheets: SheetData[] = legacyData.sheets.map((legacySheet: any, index: number) => {
    // Convert Map<string, Cell> to { [key: string]: CellData }
    const cells: { [key: string]: CellData } = {};
    
    if (legacySheet.cells instanceof Map) {
      legacySheet.cells.forEach((cell: Cell, key: string) => {
        cells[key] = convertLegacyCellToDocumentCell(cell);
      });
    } else if (typeof legacySheet.cells === 'object') {
      // Already an object
      Object.entries(legacySheet.cells).forEach(([key, cell]) => {
        cells[key] = convertLegacyCellToDocumentCell(cell as Cell);
      });
    }
    
    const grid: GridConfig = {
      rows: 1000,
      columns: 26,
      rowSizes: {},
      columnSizes: {},
      frozenRows: legacySheet.frozenRows || 0,
      frozenColumns: legacySheet.frozenCols || 0,
      showGridlines: true,
      showRowHeaders: true,
      showColumnHeaders: true,
      defaultRowHeight: 24,
      defaultColumnWidth: 100,
      hiddenRows: [],
      hiddenColumns: [],
    };
    
    const sheet: SheetData = {
      sheetId: legacySheet.id || `sheet-${index + 1}`,
      name: legacySheet.name || `Sheet${index + 1}`,
      visible: true,
      grid,
      cells,
      images: [],
      shapes: [],
      charts: [],
      links: [],
      symbols: [],
      conditionalFormatting: [],
    };
    
    if (legacySheet.color) sheet.color = legacySheet.color;
    if (legacySheet.protected) sheet.protected = legacySheet.protected;
    if (legacySheet.sortState) sheet.sortState = legacySheet.sortState;
    if (legacySheet.filterState) sheet.filterState = legacySheet.filterState;
    
    return sheet;
  });
  
  const documentState: DocumentState = {
    documentId,
    metadata: {
      documentId,
      title: 'Migrated Spreadsheet',
      owner,
      createdAt: now,
      updatedAt: now,
      theme: 'light',
      sheetCount: sheets.length,
      version: '1.0.0',
    },
    sheets,
    activeSheetId: legacyData.activeSheetId || sheets[0]?.sheetId || '',
    settings: {
      autoSave: true,
      autoSaveInterval: 30,
      showFormulaBar: true,
      calculationMode: 'auto',
      r1c1ReferenceStyle: false,
    },
    versionHistory: [],
  };
  
  return documentState;
}

/**
 * Extract legacy format from DocumentState (for backward compatibility)
 */
export function extractLegacyFormat(documentState: DocumentState): any {
  const sheets = documentState.sheets.map(sheet => {
    const cellsMap = new Map<string, Cell>();
    
    Object.entries(sheet.cells).forEach(([key, cell]) => {
      cellsMap.set(key, convertDocumentCellToLegacyCell(cell));
    });
    
    return {
      id: sheet.sheetId,
      name: sheet.name,
      color: sheet.color,
      cells: cellsMap,
      frozenRows: sheet.grid.frozenRows,
      frozenCols: sheet.grid.frozenColumns,
      protected: sheet.protected,
      sortState: sheet.sortState,
      filterState: sheet.filterState,
    };
  });
  
  return {
    sheets,
    activeSheetId: documentState.activeSheetId,
  };
}

/**
 * Get cell key from row/col indices
 */
export function getCellKey(row: number, col: number): string {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}

/**
 * Parse cell key to row/col
 */
export function parseCellKey(cellKey: string): { row: number; col: number } {
  const match = cellKey.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell key: ${cellKey}`);
  }
  
  const col = match[1].charCodeAt(0) - 65;
  const row = parseInt(match[2]) - 1;
  
  return { row, col };
}
