import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

interface CellModalOption {
  value: string;
  label: string;
  onClick: () => void;
}

interface CellModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  title: string;
  options: CellModalOption[];
  defaultOption?: string;
}

export function CellModal({ isOpen, onClose, isDarkMode, triggerRef, title, options, defaultOption }: CellModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState(defaultOption || options[0]?.value);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const modalWidth = 280;
      const modalHeight = 200;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let left = rect.left;
      let top = rect.bottom + 4;
      
      if (left + modalWidth > viewportWidth - 20) {
        left = Math.max(10, viewportWidth - modalWidth - 20);
      }
      
      if (top + modalHeight > viewportHeight - 20) {
        top = Math.max(10, rect.top - modalHeight - 4);
      }
      
      setPosition({ top, left: Math.max(10, left) });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) &&
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

  const handleConfirm = () => {
    const option = options.find(opt => opt.value === selectedOption);
    if (option) {
      option.onClick();
    }
    onClose();
  };

  return createPortal(
    <div 
      ref={modalRef}
      className={`fixed w-70 max-w-[calc(100vw-20px)] rounded-md shadow-xl border z-[10002] ${
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
                name="cellOption"
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
          <Button size="sm" onClick={handleConfirm}>
            OK
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}