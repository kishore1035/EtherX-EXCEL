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
  { value: 'az', label: 'Sort (A-Z)' },
  { value: 'za', label: 'Sort (Z-A)' },
  { value: 'num-asc', label: 'Sort (Numeric-Increasing Order)' },
  { value: 'num-desc', label: 'Sort (Numeric-Decreasing Order)' },
];

export function SortDropdown({ isOpen, onClose, onAction, isDarkMode, triggerRef }: SortDropdownProps) {
  const [selectedOption, setSelectedOption] = useState(sortOptions[0].value);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 2,
        left: rect.left,
      });
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
      className={`fixed w-64 rounded-md shadow-lg border z-[9999] ${
        isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-900'
      }`}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="p-4">
        <h3 className="text-sm font-medium mb-3">Sort Options</h3>
        <div className="space-y-2 mb-4">
          {sortOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="sortOption"
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
