import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface Sheet {
  id: string;
  name: string;
}

interface SheetTabsBarProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSheetChange: (sheetId: string) => void;
  onAddSheet: () => void;
  onRenameSheet?: (sheetId: string, newName: string) => void;
}

export function SheetTabsBar({ 
  sheets, 
  activeSheetId, 
  onSheetChange, 
  onAddSheet,
  onRenameSheet 
}: SheetTabsBarProps) {
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleDoubleClick = (sheet: Sheet) => {
    setEditingSheetId(sheet.id);
    setEditName(sheet.name);
  };

  const handleRename = (sheetId: string) => {
    if (editName.trim() && onRenameSheet) {
      onRenameSheet(sheetId, editName.trim());
    }
    setEditingSheetId(null);
  };

  return (
    <div 
      className="flex items-center h-7 border-t"
      style={{ 
        backgroundColor: '#f0f0f0',
        borderTopColor: '#d0d0d0',
        boxShadow: '0 -1px 0 0 #d0d0d0'
      }}
      role="tablist"
      aria-label="Sheet tabs"
    >
      {/* Navigation buttons */}
      <div className="flex items-center border-r" style={{ borderColor: '#d0d0d0' }}>
        <button 
          className="h-7 px-2 hover:bg-gray-200 text-gray-600 disabled:opacity-30"
          disabled
          title="Scroll left"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        <button 
          className="h-7 px-2 hover:bg-gray-200 text-gray-600 disabled:opacity-30"
          disabled
          title="Scroll right"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Sheet tabs */}
      <div className="flex-1 flex items-center overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
        {sheets.map((sheet, index) => (
          <button
            key={sheet.id}
            role="tab"
            aria-selected={activeSheetId === sheet.id}
            aria-label={`${sheet.name} sheet`}
            tabIndex={activeSheetId === sheet.id ? 0 : -1}
            className={`h-7 px-3 flex items-center cursor-pointer border-r relative ${
              activeSheetId === sheet.id ? 'bg-white' : 'hover:bg-gray-200'
            }`}
            style={{ 
              borderColor: '#d0d0d0',
              borderBottom: activeSheetId === sheet.id ? 'none' : '1px solid #d0d0d0',
              marginBottom: activeSheetId === sheet.id ? '-1px' : '0'
            }}
            onClick={() => onSheetChange(sheet.id)}
            onDoubleClick={() => handleDoubleClick(sheet)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSheetChange(sheet.id);
              } else if (e.key === 'F2') {
                handleDoubleClick(sheet);
              }
            }}
          >
            {editingSheetId === sheet.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleRename(sheet.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(sheet.id);
                  if (e.key === 'Escape') setEditingSheetId(null);
                }}
                autoFocus
                className="w-24 px-1 text-xs border border-blue-500 outline-none"
                style={{ fontFamily: 'Calibri, sans-serif' }}
              />
            ) : (
              <span 
                className="text-xs font-semibold select-none"
                style={{ 
                  fontFamily: 'Calibri, sans-serif',
                  color: activeSheetId === sheet.id ? '#000000' : '#444444'
                }}
              >
                {sheet.name}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add sheet button */}
      <button
        onClick={onAddSheet}
        className="h-7 px-3 hover:bg-gray-200 flex items-center gap-1 border-l"
        style={{ borderColor: '#d0d0d0' }}
        title="Insert worksheet"
        aria-label="Add new sheet"
        tabIndex={0}
      >
        <Plus className="w-3 h-3" style={{ color: '#444444' }} />
      </button>
    </div>
  );
}
