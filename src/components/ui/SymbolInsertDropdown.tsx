import React, { useState } from 'react';
import { SymbolModal } from '../ui/SymbolModal';
import { useSpreadsheet } from '../../contexts/SpreadsheetContext';

export function SymbolInsertDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { selectedCell, getCellKey, setCellData, cellData, setEditingCell, editingCell } = useSpreadsheet();

  const handleInsertSymbol = (symbol: string) => {
    if (!selectedCell) return;
    const cellKey = getCellKey(selectedCell.row, selectedCell.col);
    
    // Get existing cell content
    const existingContent = cellData[cellKey] || '';
    
    // If cell is being edited, insert at cursor position
    // Otherwise, append to existing content
    const newContent = existingContent + symbol;
    
    setCellData((prev: any) => ({ ...prev, [cellKey]: newContent }));
    
    // Enable editing mode so user can continue adding symbols
    if (!editingCell || editingCell.row !== selectedCell.row || editingCell.col !== selectedCell.col) {
      setEditingCell({ row: selectedCell.row, col: selectedCell.col });
    }
  };

  return (
    <SymbolModal
      isOpen={isOpen}
      onClose={onClose}
      onInsert={handleInsertSymbol}
    />
  );
}
