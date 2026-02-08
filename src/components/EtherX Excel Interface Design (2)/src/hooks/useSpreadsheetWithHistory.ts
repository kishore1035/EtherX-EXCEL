import { useCallback, useEffect, useRef } from 'react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { useUndoRedo } from '../contexts/UndoRedoContext';

export function useSpreadsheetWithHistory() {
  const spreadsheet = useSpreadsheet();
  const { saveState, undo, redo, canUndo, canRedo } = useUndoRedo();
  const initialStateSaved = useRef(false);

  // Save initial state once
  useEffect(() => {
    if (!initialStateSaved.current) {
      saveState({ 
        cellData: spreadsheet.cellData, 
        cellFormats: spreadsheet.cellFormats 
      });
      initialStateSaved.current = true;
    }
  }, [saveState, spreadsheet.cellData, spreadsheet.cellFormats]);

  const saveCurrentState = useCallback(() => {
    saveState({ 
      cellData: spreadsheet.cellData, 
      cellFormats: spreadsheet.cellFormats 
    });
  }, [spreadsheet.cellData, spreadsheet.cellFormats, saveState]);

  const setCellDataWithHistory = useCallback((newData: { [key: string]: string } | ((prev: { [key: string]: string }) => { [key: string]: string })) => {
    if (initialStateSaved.current) {
      saveCurrentState();
    }
    spreadsheet.setCellData(newData);
  }, [saveCurrentState, spreadsheet.setCellData]);

  const setCellFormatsWithHistory = useCallback((newFormats: { [key: string]: any } | ((prev: { [key: string]: any }) => { [key: string]: any })) => {
    if (initialStateSaved.current) {
      saveCurrentState();
    }
    spreadsheet.setCellFormats(newFormats);
  }, [saveCurrentState, spreadsheet.setCellFormats]);

  const moveColumnLeftWithHistory = useCallback(() => {
    if (initialStateSaved.current) {
      saveCurrentState();
    }
    spreadsheet.moveColumnLeft();
  }, [saveCurrentState, spreadsheet.moveColumnLeft]);

  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      spreadsheet.setCellData(previousState.cellData);
      spreadsheet.setCellFormats(previousState.cellFormats);
    }
  }, [undo, spreadsheet.setCellData, spreadsheet.setCellFormats]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      spreadsheet.setCellData(nextState.cellData);
      spreadsheet.setCellFormats(nextState.cellFormats);
    }
  }, [redo, spreadsheet.setCellData, spreadsheet.setCellFormats]);

  return {
    ...spreadsheet,
    setCellData: setCellDataWithHistory,
    setCellFormats: setCellFormatsWithHistory,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo
  };
}