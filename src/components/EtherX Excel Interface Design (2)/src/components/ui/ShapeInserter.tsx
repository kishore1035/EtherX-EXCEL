// Shape Inserter Component - UI for shape selection and insertion
import React, { useState } from 'react';
import { ShapeType, shapeEngine } from '../../utils/shapeEngine';

interface ShapeInserterProps {
  isOpen: boolean;
  onClose: () => void;
  onShapeInsert: (shapeId: string) => void;
  theme?: 'light' | 'dark';
}

const ShapeInserter: React.FC<ShapeInserterProps> = ({
  isOpen,
  onClose,
  onShapeInsert,
  theme = 'light'
}) => {
  const [selectedType, setSelectedType] = useState<ShapeType | null>(null);

  const shapes: { type: ShapeType; label: string; icon: string }[] = [
    { type: 'rectangle', label: 'Rectangle', icon: '▭' },
    { type: 'circle', label: 'Circle', icon: '●' },
    { type: 'triangle', label: 'Triangle', icon: '▲' },
    { type: 'arrow', label: 'Arrow', icon: '→' },
    { type: 'line', label: 'Line', icon: '─' },
    { type: 'diamond', label: 'Diamond', icon: '◆' },
    { type: 'star', label: 'Star', icon: '★' },
    { type: 'heart', label: 'Heart', icon: '♥' },
    { type: 'cloud', label: 'Cloud', icon: '☁' },
  ];

  const handleShapeSelect = (type: ShapeType) => {
    setSelectedType(type);
    const shapeId = shapeEngine.insertShape(type);
    onShapeInsert(shapeId);
    onClose();
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`
        w-96 max-h-96 rounded-lg shadow-xl p-6
        ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
      `}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Insert Shape</h3>
          <button
            onClick={onClose}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            `}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {shapes.map((shape) => (
            <button
              key={shape.type}
              onClick={() => handleShapeSelect(shape.type)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                flex flex-col items-center gap-2
                ${isDark
                  ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700'
                  : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                }
                ${selectedType === shape.type
                  ? 'border-blue-500 bg-blue-100 dark:bg-blue-900'
                  : ''
                }
              `}
            >
              <span className="text-2xl">{shape.icon}</span>
              <span className="text-xs font-medium">{shape.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className={`
              px-4 py-2 rounded-lg border
              ${isDark
                ? 'border-gray-600 hover:bg-gray-700'
                : 'border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShapeInserter;