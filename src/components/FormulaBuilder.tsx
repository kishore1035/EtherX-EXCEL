import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface FormulaBuilderProps {
  show: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onSelectFormula: (formula: FormulaDefinition) => void;
}

export interface FormulaDefinition {
  name: string;
  description: string;
  syntax: string;
  category: string;
  requiresRange: boolean;
  minArgs?: number;
  maxArgs?: number;
  example: string;
}

export const FORMULAS: FormulaDefinition[] = [
  {
    name: 'SUM',
    description: 'Adds all numbers in a range or list',
    syntax: 'SUM(range)',
    category: 'Math',
    requiresRange: true,
    minArgs: 1,
    example: '=SUM(A1:A10)'
  },
  {
    name: 'AVERAGE',
    description: 'Returns the average of numbers',
    syntax: 'AVERAGE(range)',
    category: 'Statistical',
    requiresRange: true,
    minArgs: 1,
    example: '=AVERAGE(A1:A10)'
  },
  {
    name: 'COUNT',
    description: 'Counts the number of cells that contain numbers',
    syntax: 'COUNT(range)',
    category: 'Statistical',
    requiresRange: true,
    minArgs: 1,
    example: '=COUNT(A1:A10)'
  },
  {
    name: 'MAX',
    description: 'Returns the largest value',
    syntax: 'MAX(range)',
    category: 'Statistical',
    requiresRange: true,
    minArgs: 1,
    example: '=MAX(A1:A10)'
  },
  {
    name: 'MIN',
    description: 'Returns the smallest value',
    syntax: 'MIN(range)',
    category: 'Statistical',
    requiresRange: true,
    minArgs: 1,
    example: '=MIN(A1:A10)'
  },
  {
    name: 'IF',
    description: 'Returns one value if condition is true, another if false',
    syntax: 'IF(condition, value_if_true, value_if_false)',
    category: 'Logical',
    requiresRange: false,
    minArgs: 3,
    maxArgs: 3,
    example: '=IF(A1>10, "High", "Low")'
  },
  {
    name: 'CONCAT',
    description: 'Joins several text strings into one',
    syntax: 'CONCAT(text1, text2, ...)',
    category: 'Text',
    requiresRange: false,
    minArgs: 1,
    example: '=CONCAT(A1, " ", B1)'
  },
  {
    name: 'TODAY',
    description: 'Returns the current date',
    syntax: 'TODAY()',
    category: 'Date & Time',
    requiresRange: false,
    minArgs: 0,
    maxArgs: 0,
    example: '=TODAY()'
  },
  {
    name: 'MULTIPLY',
    description: 'Multiplies numbers',
    syntax: 'MULTIPLY(number1, number2, ...)',
    category: 'Math',
    requiresRange: false,
    minArgs: 2,
    example: '=MULTIPLY(A1, B1)'
  },
  {
    name: 'DIVIDE',
    description: 'Divides one number by another',
    syntax: 'DIVIDE(number1, number2)',
    category: 'Math',
    requiresRange: false,
    minArgs: 2,
    maxArgs: 2,
    example: '=DIVIDE(A1, B1)'
  },
  {
    name: 'POWER',
    description: 'Returns a number raised to a power',
    syntax: 'POWER(number, power)',
    category: 'Math',
    requiresRange: false,
    minArgs: 2,
    maxArgs: 2,
    example: '=POWER(A1, 2)'
  },
  {
    name: 'SQRT',
    description: 'Returns the square root of a number',
    syntax: 'SQRT(number)',
    category: 'Math',
    requiresRange: false,
    minArgs: 1,
    maxArgs: 1,
    example: '=SQRT(A1)'
  },
  {
    name: 'DIFFERENCE',
    description: 'Subtracts the second number from the first',
    syntax: 'DIFFERENCE(number1, number2)',
    category: 'Math',
    requiresRange: false,
    minArgs: 2,
    maxArgs: 2,
    example: '=DIFFERENCE(A1, B1)'
  }
];

const CATEGORIES = ['All', 'Math', 'Statistical', 'Logical', 'Text', 'Date & Time'];

export function FormulaBuilder({ show, position, onClose, onSelectFormula }: FormulaBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFormula, setSelectedFormula] = useState<FormulaDefinition | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('FormulaBuilder render - show:', show, 'position:', position);
  }, [show, position]);

  const filteredFormulas = FORMULAS.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || formula.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (!show) {
      setSearchTerm('');
      setSelectedFormula(null);
    }
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  const handleSelectFormula = (formula: FormulaDefinition) => {
    setSelectedFormula(formula);
    onSelectFormula(formula);
  };

  const content = (
    <>
      {/* Semi-transparent backdrop */}
      <div 
        className="fixed inset-0 z-[99998]"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
        onClick={onClose}
      />
      
      {/* Formula builder dropdown */}
      <div
        ref={dropdownRef}
        className="fixed z-[99999] bg-white rounded-lg shadow-2xl border-2 border-[#FFD700] overflow-hidden"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '500px',
          maxHeight: '600px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFACD 100%)',
          pointerEvents: 'auto'
        }}
      >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-[#FFD700]">
        <h3 className="text-lg font-bold text-black">Insert Function</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-300">
        <input
          type="text"
          placeholder="Search for a function..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border-2 border-[#FFD700] rounded text-black"
          style={{
            background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)'
          }}
          autoFocus
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 p-4 border-b border-gray-300 overflow-x-auto">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className="px-3 py-1 rounded text-sm whitespace-nowrap transition-all"
            style={{
              background: selectedCategory === category
                ? 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)'
                : 'white',
              border: '1px solid #FFD700',
              color: 'black',
              fontWeight: selectedCategory === category ? 'bold' : 'normal'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Formula List */}
      <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
        {filteredFormulas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No functions found matching "{searchTerm}"
          </div>
        ) : (
          filteredFormulas.map(formula => (
            <div
              key={formula.name}
              onClick={() => handleSelectFormula(formula)}
              className="p-4 border-b border-gray-200 cursor-pointer transition-all hover:bg-gradient-to-r hover:from-[#FFFACD] hover:to-[#FFD700]"
              style={{
                background: selectedFormula?.name === formula.name
                  ? 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)'
                  : 'white'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black text-lg">{formula.name}</span>
                    <span className="text-xs px-2 py-1 rounded" style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      color: 'white'
                    }}>
                      {formula.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{formula.description}</p>
                  <p className="text-xs text-gray-600 mt-2 font-mono">
                    Syntax: <span className="font-semibold">{formula.syntax}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1 font-mono">
                    Example: <span className="text-blue-600">{formula.example}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t-2 border-[#FFD700] bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6]">
        <p className="text-xs text-gray-600">
          {selectedFormula
            ? `Select cells for ${selectedFormula.name} function, then press Enter to apply`
            : 'Select a function from the list above'}
        </p>
      </div>
      </div>
    </>
  );

  // Render using portal to escape parent transform/overflow constraints
  return createPortal(content, document.body);
}
