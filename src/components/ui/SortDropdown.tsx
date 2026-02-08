import React, { useState, useRef, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

interface SortDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (option: string) => void;
  isDarkMode: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

const sortOptions = [
  { value: 'az', label: 'Sort A to Z (Ascending)' },
  { value: 'za', label: 'Sort Z to A (Descending)' },
  { value: 'num-asc', label: 'Sort Smallest to Largest' },
  { value: 'num-desc', label: 'Sort Largest to Smallest' },
];

export function SortDropdown({ isOpen, onClose, onAction, isDarkMode, triggerRef }: SortDropdownProps) {
  const [selectedOption, setSelectedOption] = useState(sortOptions[0].value);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updatePosition = () => {
      if (isOpen && triggerRef.current) {
        // Get button position using getBoundingClientRect
        // This already includes all CSS transforms from parent elements
        const rect = triggerRef.current.getBoundingClientRect();
        
        console.log('Sort Button Position:', {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height
        });
        
        // Position dropdown immediately below button
        const dropdownTop = rect.bottom + 8;
        const dropdownLeft = rect.left;
        
        console.log('Dropdown Position:', { top: dropdownTop, left: dropdownLeft });
        
        setPosition({
          top: dropdownTop,
          left: dropdownLeft,
        });
      }
    };

    if (isOpen) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(updatePosition);
      
      // Update on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, triggerRef]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
      className="fixed z-[10000] bg-white rounded-lg shadow-2xl"
      style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`,
          width: '280px',
          border: '2px solid transparent',
          boxShadow: 'none'
      }}
    >
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3">Sort Options</h3>
        <div className="space-y-1 mb-4">
          {sortOptions.map((option) => (
            <label 
              key={option.value} 
              className="flex items-center space-x-3 cursor-pointer text-sm px-3 py-2 rounded transition-all hover:bg-gradient-to-r hover:from-[#FFFEF5] hover:to-[#FFF9E6]"
            >
              <input
                type="radio"
                name="sortOption"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-4 h-4 accent-yellow-600"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="bg-white hover:bg-gray-50 border-gray-300"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAction}
            className="font-semibold bg-transparent"
          >
            OK
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
