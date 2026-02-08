import React, { useState } from 'react';
import { X, Square, Circle, Triangle, Diamond, Star, Heart } from 'lucide-react';

interface ShapesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertShape: (shape: string) => void;
  theme: 'light' | 'dark';
}

const ShapesModal: React.FC<ShapesModalProps> = ({ isOpen, onClose, onInsertShape, theme }) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  
  const shapes = [
    { name: 'Rectangle', icon: Square, value: 'rectangle' },
    { name: 'Circle', icon: Circle, value: 'circle' },
    { name: 'Triangle', icon: Triangle, value: 'triangle' },
    { name: 'Diamond', icon: Diamond, value: 'diamond' },
    { name: 'Star', icon: Star, value: 'star' },
    { name: 'Heart', icon: Heart, value: 'heart' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`p-6 rounded-lg shadow-xl w-96 ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Insert Shapes</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {shapes.map((shape) => (
            <button
              key={shape.value}
              onClick={() => {
                onInsertShape(shape.value);
                onClose();
              }}
              className={`p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all flex flex-col items-center gap-2 ${
                isDark
                  ? 'border-slate-600 hover:border-blue-400 hover:bg-slate-700'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <shape.icon size={24} />
              <span className="text-xs">{shape.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShapesModal;