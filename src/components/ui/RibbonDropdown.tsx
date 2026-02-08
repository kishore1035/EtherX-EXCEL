import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DropdownOption {
  value: string;
  label: string;
  onClick: () => void;
}

interface RibbonDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  options: DropdownOption[];
}

export function RibbonDropdown({ isOpen, onClose, isDarkMode, triggerRef, options }: RibbonDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen || !triggerRef.current) return null;

  const rect = triggerRef.current.getBoundingClientRect();
  const dropdownWidth = 200;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate horizontal position
  let left = rect.left;
  if (left + dropdownWidth > viewportWidth - 20) {
    left = Math.max(10, viewportWidth - dropdownWidth - 20);
  }

  // Calculate vertical position - ensure it doesn't overflow viewport
  let top = rect.bottom + 4;
  const estimatedDropdownHeight = options.length * 40 + 16; // Approximate height
  if (top + estimatedDropdownHeight > viewportHeight - 20) {
    top = Math.max(10, rect.top - estimatedDropdownHeight - 4);
  }

  const position = {
    top,
    left: Math.max(10, left)
  };

  return createPortal(
    <div 
      ref={dropdownRef}
      className={`fixed min-w-[200px] max-w-[280px] rounded-md shadow-xl border z-[10000] ${
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
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              option.onClick();
              onClose();
            }}
            className={`w-full px-4 py-2 text-left text-sm whitespace-nowrap hover:${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            } transition-colors focus:outline-none focus:${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}