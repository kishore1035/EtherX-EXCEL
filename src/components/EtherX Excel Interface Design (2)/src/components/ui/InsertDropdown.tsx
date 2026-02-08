import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

interface InsertDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onInsertCells: (option: string) => void;
  onInsertRows: () => void;
  onInsertColumns: () => void;
  onInsertSheet: () => void;
}

export function InsertDropdown({ 
  isOpen, 
  onClose, 
  isDarkMode, 
  triggerRef, 
  onInsertCells,
  onInsertRows,
  onInsertColumns,
  onInsertSheet
}: InsertDropdownProps) {
  const [showCellsDialog, setShowCellsDialog] = useState(false);
  const [selectedCellOption, setSelectedCellOption] = useState('shift-right');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
        setShowCellsDialog(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCellsDialog) {
          setShowCellsDialog(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, showCellsDialog, onClose, triggerRef]);

  if (!isOpen || !triggerRef.current) return null;

  const rect = triggerRef.current.getBoundingClientRect();
  const dropdownWidth = showCellsDialog ? 280 : 200;
  const viewportWidth = window.innerWidth;
  
  let left = rect.left;
  if (left + dropdownWidth > viewportWidth - 20) {
    left = viewportWidth - dropdownWidth - 20;
  }

  const position = {
    top: rect.bottom + 2,
    left: Math.max(10, left)
  };

  const handleInsertCells = () => {
    onInsertCells(selectedCellOption);
    onClose();
    setShowCellsDialog(false);
  };

  if (showCellsDialog) {
    return createPortal(
      <div 
        ref={dropdownRef}
        className={`fixed w-70 rounded-md shadow-lg border z-[10001] ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-gray-200' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          overflow: 'visible',
          zIndex: 10001,
        }}
      >
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3">Insert Cells</h3>
          <div className="space-y-2 mb-4">
            {[
              { value: 'shift-right', label: 'Shift cells right' },
              { value: 'shift-down', label: 'Shift cells down' },
              { value: 'entire-row', label: 'Entire row' },
              { value: 'entire-column', label: 'Entire column' }
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="insertOption"
                  value={option.value}
                  checked={selectedCellOption === option.value}
                  onChange={(e) => setSelectedCellOption(e.target.value)}
                  className="text-blue-600"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCellsDialog(false)}
              className="font-bold bg-white text-black border-2 border-gray-400 shadow-lg"
              style={{ zIndex: 10001, position: 'relative' }}
              color="black"
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleInsertCells}
              className="font-bold bg-blue-600 text-white border-2 border-blue-800 shadow-lg"
              style={{ zIndex: 10001, position: 'relative' }}
              color="black"
            >
              Add
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div 
      ref={dropdownRef}
      className={`fixed w-50 rounded-md shadow-lg border z-[9999] ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-600 text-gray-200' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="py-1">
        <button
          onClick={() => setShowCellsDialog(true)}
          className={`w-full px-4 py-2 text-left text-sm hover:${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          } transition-colors`}
        >
          Insert Cells…
        </button>
        <button
          onClick={() => {
            onInsertRows();
            onClose();
          }}
          className={`w-full px-4 py-2 text-left text-sm hover:${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          } transition-colors`}
        >
          Insert Sheet Rows
        </button>
        <button
          onClick={() => {
            onInsertColumns();
            onClose();
          }}
          className={`w-full px-4 py-2 text-left text-sm hover:${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          } transition-colors`}
        >
          Insert Sheet Columns
        </button>
        <button
          onClick={() => {
            onInsertSheet();
            onClose();
          }}
          className={`w-full px-4 py-2 text-left text-sm hover:${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          } transition-colors`}
        >
          Insert Sheet
        </button>
      </div>
    </div>,
    document.body
  );
}
