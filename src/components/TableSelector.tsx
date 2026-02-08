import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Table as TableIcon, Check } from 'lucide-react';
import { TableData } from '../utils/chartDataProcessor';

interface TableSelectorProps {
  open: boolean;
  onClose: () => void;
  tables: TableData[];
  onSelectTable: (table: TableData) => void;
  isDarkMode?: boolean;
}

export function TableSelector({ open, onClose, tables, onSelectTable, isDarkMode = false }: TableSelectorProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const handleSelect = () => {
    const table = tables.find(t => t.id === selectedTableId);
    if (table) {
      onSelectTable(table);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl"
        style={{
          background: isDarkMode ? '#000000' : '#FFFFFF',
          border: isDarkMode ? '2px solid #374151' : '2px solid #e5e7eb',
          color: isDarkMode ? '#FFFFFF' : '#000000'
        }}
      >
        {/* Hide the default close button */}
        <style>{`
          [data-slot="dialog-content"] > button[class*="absolute"] {
            display: none !important;
          }
        `}</style>
        <DialogHeader>
          <DialogTitle 
            className="flex items-center gap-2"
            style={{ color: isDarkMode ? '#FFD700' : '#000000' }}
          >
            <TableIcon className="w-5 h-5" />
            Select Table for Chart
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {tables.length === 0 ? (
            <div 
              className="text-center py-8"
              style={{ color: isDarkMode ? '#999999' : '#666666' }}
            >
              <TableIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No tables found in the spreadsheet</p>
              <p className="text-xs mt-2">Create a table with headers and data to generate charts</p>
            </div>
          ) : (
            <>
              <p 
                className="text-sm"
                style={{ color: isDarkMode ? '#CCCCCC' : '#666666' }}
              >
                Select a table from your spreadsheet to create a chart:
              </p>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className="w-full p-4 rounded-lg border-2 transition-all"
                    style={{
                      background: selectedTableId === table.id
                        ? isDarkMode ? '#1a1a1a' : '#f9fafb'
                        : isDarkMode ? '#0a0a0a' : '#FFFFFF',
                      borderColor: selectedTableId === table.id
                        ? '#FFD700'
                        : isDarkMode ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <TableIcon 
                            className="w-4 h-4" 
                            style={{ color: isDarkMode ? '#FFD700' : '#000000' }}
                          />
                          <span 
                            className="font-semibold text-sm"
                            style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
                          >
                            {table.name}
                          </span>
                        </div>
                        <p 
                          className="text-xs mb-2"
                          style={{ color: isDarkMode ? '#999999' : '#666666' }}
                        >
                          Range: {table.range}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {table.columns.map((col, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                background: isDarkMode ? '#374151' : '#e5e7eb',
                                color: isDarkMode ? '#CCCCCC' : '#374151'
                              }}
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                        <p 
                          className="text-xs mt-2"
                          style={{ color: isDarkMode ? '#999999' : '#666666' }}
                        >
                          {table.rows.length} rows × {table.columns.length} columns
                        </p>
                      </div>
                      {selectedTableId === table.id && (
                        <Check 
                          className="w-5 h-5 flex-shrink-0" 
                          style={{ color: '#F0A500' }}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  style={{
                    borderColor: isDarkMode ? '#374151' : '#d1d5db',
                    color: isDarkMode ? '#CCCCCC' : '#374151'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSelect}
                  disabled={!selectedTableId}
                  style={{
                    background: selectedTableId
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : isDarkMode ? '#374151' : '#d1d5db',
                    color: '#FFFFFF',
                    opacity: selectedTableId ? 1 : 0.5
                  }}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
