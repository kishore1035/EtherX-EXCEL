/**
 * SPREADSHEET TO DOCUMENT STATE SYNC
 * Syncs all spreadsheet operations to documentState
 * Ensures EVERY change updates the single source of truth
 */

import { useEffect, useCallback } from 'react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { useDocumentState } from '../contexts/DocumentStateContext';
import { getCellKey } from '../utils/documentStateBridge';

/**
 * Hook to sync SpreadsheetContext with DocumentState
 * Call this in App.tsx to ensure all changes are captured
 */
export function useSpreadsheetDocumentSync() {
  const spreadsheet = useSpreadsheet();
  // useDocumentState may throw if the hook is used outside of a DocumentProvider.
  // Wrap the call so the app degrades gracefully instead of crashing.
  let state: any;
  let dispatch: any;
  let updateCell: any;
  let setCellStyle: any;
  let addImage: any;
  let addChart: any;

  try {
    const docCtx = useDocumentState();
    state = docCtx.state;
    dispatch = docCtx.dispatch;
    updateCell = docCtx.updateCell;
    setCellStyle = docCtx.setCellStyle;
    addImage = docCtx.addImage;
    addChart = docCtx.addChart;
  } catch (err) {
    console.warn('useSpreadsheetDocumentSync: DocumentProvider not found. Sync disabled.');
    return {
      state: undefined,
      documentReady: false,
    };
  }
  
  const activeSheet = state.sheets[0]; // Get first sheet (or active sheet)
  const sheetId = activeSheet?.sheetId || 'sheet-1';
  
  // Sync cell data changes
  useEffect(() => {
    if (!spreadsheet.cellData || !activeSheet) return;
    
    Object.entries(spreadsheet.cellData).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        const currentCell = activeSheet.cells[key];
        if (!currentCell || currentCell.value !== value) {
          updateCell(sheetId, key, {
            value: String(value),
            type: 'string'
          });
        }
      }
    });
  }, [spreadsheet.cellData, sheetId, activeSheet, updateCell]);
  
  // Sync cell formats to cell styles
  useEffect(() => {
    if (!spreadsheet.cellFormats || !activeSheet) return;
    
    Object.entries(spreadsheet.cellFormats).forEach(([key, format]) => {
      const style: any = {};
      
      if (format.bold) style.bold = true;
      if (format.italic) style.italic = true;
      if (format.underline) style.underline = true;
      if (format.color) style.textColor = format.color;
      if (format.backgroundColor) style.backgroundColor = format.backgroundColor;
      if (format.fontSize) style.fontSize = typeof format.fontSize === 'string' ? parseInt(format.fontSize) : format.fontSize;
      if (format.fontFamily) style.fontFamily = format.fontFamily;
      if (format.textAlign) {
        style.alignment = {
          horizontal: format.textAlign
        };
      }
      
      if (Object.keys(style).length > 0) {
        setCellStyle(sheetId, key, style);
      }
    });
  }, [spreadsheet.cellFormats, sheetId, activeSheet, setCellStyle]);
  
  // Sync images
  useEffect(() => {
    if (!spreadsheet.floatingImages || !activeSheet) return;
    
    spreadsheet.floatingImages.forEach(img => {
      const existingImage = activeSheet.images.find(i => i.id === img.id);
      if (!existingImage) {
        addImage(sheetId, {
          id: img.id,
          src: img.src,
          x: img.x,
          y: img.y,
          width: img.width,
          height: img.height,
          rotation: img.rotation,
          opacity: img.opacity,
          layer: img.zIndex || 0
        });
      }
    });
  }, [spreadsheet.floatingImages, sheetId, activeSheet, addImage]);
  
  // NOTE: Shapes and Charts sync disabled temporarily - SpreadsheetContext may not have these yet
  // Re-enable when SpreadsheetContext is updated to include floatingShapes and floatingCharts
  
  /*
  // Sync shapes
  useEffect(() => {
    if (!spreadsheet.floatingShapes || !activeSheet) return;
  // NOTE: Shapes and Charts sync disabled temporarily - SpreadsheetContext may not have these yet
  // Re-enable when SpreadsheetContext is updated to include floatingShapes and floatingCharts
  
  /*
  // Sync shapes
  useEffect(() => {
    if (!spreadsheet.floatingShapes || !activeSheet) return;
    
    spreadsheet.floatingShapes.forEach(shape => {
      const existingShape = activeSheet.shapes.find(s => s.id === shape.id);
      if (!existingShape) {
        addShape(sheetId, {
          id: shape.id,
          type: shape.type as any,
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          rotation: shape.rotation,
          opacity: shape.opacity,
          layer: 0,
          fill: shape.fillColor,
          stroke: shape.strokeColor,
          strokeWidth: shape.strokeWidth
        });
      }
    });
  }, [spreadsheet.floatingShapes, sheetId, activeSheet, addShape]);
  
  // Sync charts
  useEffect(() => {
    if (!spreadsheet.floatingCharts || !activeSheet) return;
    
    spreadsheet.floatingCharts.forEach(chart => {
      const existingChart = activeSheet.charts.find(c => c.id === chart.id);
      if (!existingChart) {
        addChart(sheetId, {
          id: chart.id,
          chartType: chart.type as any,
          dataRange: chart.dataRange || '',
          x: chart.x,
          y: chart.y,
          width: chart.width,
          height: chart.height,
          layer: 0,
          options: chart.config || {}
        });
      }
    });
  }, [spreadsheet.floatingCharts, sheetId, activeSheet, addChart]);
  */
  
  // Sync row/column sizes
  useEffect(() => {
    if (!spreadsheet.rowHeights || !activeSheet) return;
    
    Object.entries(spreadsheet.rowHeights).forEach(([rowIndex, height]) => {
      dispatch({
        type: 'SET_ROW_SIZE',
        payload: {
          sheetId,
          rowIndex: parseInt(rowIndex),
          size: height
        }
      });
    });
  }, [spreadsheet.rowHeights, sheetId, activeSheet, dispatch]);
  
  useEffect(() => {
    if (!spreadsheet.columnWidths || !activeSheet) return;
    
    Object.entries(spreadsheet.columnWidths).forEach(([colIndex, width]) => {
      dispatch({
        type: 'SET_COLUMN_SIZE',
        payload: {
          sheetId,
          colIndex: parseInt(colIndex),
          size: width
        }
      });
    });
  }, [spreadsheet.columnWidths, sheetId, activeSheet, dispatch]);
  
  return {
    state,
    documentReady: activeSheet !== undefined
  };
}

/**
 * Create a save handler that uses documentState
 */
export function useDocumentSaveHandler() {
  const { state, saveToIPFS } = useDocumentState();
  
  const handleSave = useCallback(async () => {
    try {
      console.log('💾 Saving complete documentState...');
      const cid = await saveToIPFS();
      console.log('✅ Document saved successfully:', cid);
      return { success: true, cid };
    } catch (error: any) {
      console.error('❌ Save failed:', error);
      return { success: false, error: error.message };
    }
  }, [saveToIPFS]);
  
  const handleLoad = useCallback(async (cid: string) => {
    // loadFromIPFS is in the context
    // This will be called by the context itself
  }, []);
  
  return {
    handleSave,
    handleLoad,
    documentState: state
  };
}
