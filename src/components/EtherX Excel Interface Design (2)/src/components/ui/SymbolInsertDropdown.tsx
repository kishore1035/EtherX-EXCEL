import React, { useState } from 'react';
import { SymbolModal } from '../ui/SymbolModal';
import { useSpreadsheet } from '../../contexts/SpreadsheetContext';

export function SymbolInsertDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { selectedCell, getCellKey, setCellData } = useSpreadsheet();

  const handleInsertSymbol = (symbol: string) => {
    if (!selectedCell) return;
    const cellKey = getCellKey(selectedCell.row, selectedCell.col);
    setCellData((prev: any) => ({ ...prev, [cellKey]: symbol }));
  };

  return (
    <SymbolModal
      isOpen={isOpen}
      onClose={onClose}
      onInsert={handleInsertSymbol}
    />
  );
}
