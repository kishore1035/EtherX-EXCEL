import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface InsertShapesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (shapeType: string) => void;
  isDarkMode: boolean;
}

const shapes = [
  { type: 'rectangle', name: 'Rectangle', path: 'M2 2h20v16H2z' },
  { type: 'circle', name: 'Circle', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
  { type: 'triangle', name: 'Triangle', path: 'M12 2l10 18H2z' },
  { type: 'diamond', name: 'Diamond', path: 'M12 2l8 10-8 10-8-10z' },
  { type: 'arrow', name: 'Arrow', path: 'M2 12h16l-4-4m4 4l-4 4' },
  { type: 'star', name: 'Star', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' }
];

export function InsertShapesDialog({ isOpen, onClose, onInsert, isDarkMode }: InsertShapesDialogProps) {
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

  if (!isOpen) return null;

  return (
    <div 
      ref={dialogRef}
      className={`fixed top-32 left-4 p-4 rounded-lg shadow-lg border z-50 w-80 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Insert Shapes</h3>
        <button 
          onClick={onClose}
          className={`p-1 rounded transition-colors ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {shapes.map(shape => (
          <button
            key={shape.type}
            onClick={() => {
              onInsert(shape.type);
              onClose();
            }}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              isDarkMode 
                ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700' 
                : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <svg 
              className="w-8 h-8 mx-auto mb-2" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d={shape.path} />
            </svg>
            <div className="text-xs">{shape.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}