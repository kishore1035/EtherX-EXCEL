import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface InsertTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
  isDarkMode: boolean;
}

export function InsertTableDialog({ isOpen, onClose, onInsert, isDarkMode }: InsertTableDialogProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleInsert = () => {
    if (rows < 1 || rows > 50) {
      setError('Rows must be between 1 and 50');
      return;
    }
    if (cols < 1 || cols > 26) {
      setError('Columns must be between 1 and 26');
      return;
    }
    setError('');
    onInsert(rows, cols);
    onClose();
  };

  const handleRowsChange = (value: string) => {
    const num = parseInt(value) || 1;
    setRows(Math.max(1, Math.min(50, num)));
    setError('');
  };

  const handleColsChange = (value: string) => {
    const num = parseInt(value) || 1;
    setCols(Math.max(1, Math.min(26, num)));
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dialogRef}
      className={`fixed top-32 left-4 p-4 rounded-lg shadow-lg border z-50 w-64 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Insert Table</h3>
        <button 
          onClick={onClose}
          className={`p-1 rounded transition-colors ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-xs mb-1 opacity-70">Rows</label>
          <input
            type="number"
            min="1"
            max="50"
            value={rows}
            onChange={(e) => handleRowsChange(e.target.value)}
            className={`w-full px-2 py-1 text-sm rounded border text-center ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          />
        </div>
        <div className="text-sm opacity-50 mt-4">×</div>
        <div className="flex-1">
          <label className="block text-xs mb-1 opacity-70">Columns</label>
          <input
            type="number"
            min="1"
            max="26"
            value={cols}
            onChange={(e) => handleColsChange(e.target.value)}
            className={`w-full px-2 py-1 text-sm rounded border text-center ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          />
        </div>
      </div>
      
      {error && (
        <div className="text-red-400 text-xs mb-3">{error}</div>
      )}

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClose}
          className="flex-1 text-xs"
        >
          Cancel
        </Button>
        <Button 
          size="sm"
          onClick={handleInsert}
          className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0"
          style={{ backgroundColor: '#2563eb', color: 'white' }}
        >
          Insert Table
        </Button>
      </div>
    </div>
  );
}