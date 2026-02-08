import { useState } from 'react';
import { Button } from '../ui/button';

interface InsertCellsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (option: 'shift-right' | 'shift-down' | 'entire-row' | 'entire-column') => void;
  isDarkMode: boolean;
}

export function InsertCellsDialog({ isOpen, onClose, onInsert, isDarkMode }: InsertCellsDialogProps) {
  const [selectedOption, setSelectedOption] = useState<'shift-right' | 'shift-down' | 'entire-row' | 'entire-column'>('shift-right');

  if (!isOpen) return null;

  const handleInsert = () => {
    onInsert(selectedOption);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`p-6 rounded-lg shadow-lg w-80 ${
        isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
      }`}>
        <h3 className="text-lg font-semibold mb-4">Insert Cells</h3>
        
        <div className="space-y-3 mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="insertOption"
              value="shift-right"
              checked={selectedOption === 'shift-right'}
              onChange={(e) => setSelectedOption(e.target.value as any)}
              className="text-blue-600"
            />
            <span>Shift cells right</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="insertOption"
              value="shift-down"
              checked={selectedOption === 'shift-down'}
              onChange={(e) => setSelectedOption(e.target.value as any)}
              className="text-blue-600"
            />
            <span>Shift cells down</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="insertOption"
              value="entire-row"
              checked={selectedOption === 'entire-row'}
              onChange={(e) => setSelectedOption(e.target.value as any)}
              className="text-blue-600"
            />
            <span>Entire row</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="insertOption"
              value="entire-column"
              checked={selectedOption === 'entire-column'}
              onChange={(e) => setSelectedOption(e.target.value as any)}
              className="text-blue-600"
            />
            <span>Entire column</span>
          </label>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}