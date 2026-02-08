import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

interface CellsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (option: string) => void;
  isDarkMode: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  title: string;
  options: { value: string; label: string }[];
}

export function CellsDropdown({ isOpen, onClose, onAction, isDarkMode, triggerRef, title, options }: CellsDropdownProps) {
  const [selectedOption, setSelectedOption] = useState(options[0]?.value || '');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 256;
      const viewportWidth = window.innerWidth;
      
      let left = rect.left;
      if (left + dropdownWidth > viewportWidth - 20) {
        left = viewportWidth - dropdownWidth - 20;
      }
      
      setPosition({
        top: rect.bottom + 2,
        left: Math.max(10, left)
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const handleAction = () => {
    onAction(selectedOption);
    onClose();
  };

  return createPortal(
    <div 
      ref={dropdownRef}
      className={`fixed w-64 rounded-md shadow-lg border z-[9999] ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-600 text-gray-200' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="p-4">
        <h3 className="text-sm font-medium mb-3">{title}</h3>
        
        <div className="space-y-2 mb-4">
          {options.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="cellsOption"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="text-blue-600"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleAction}>
            OK
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}