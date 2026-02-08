import { useState, useEffect, useRef } from 'react';
import { Calculator, Plus, Minus, X as Times, Divide, Sigma, BarChart3, Hash, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export interface FormulaOption {
  id: string;
  name: string;
  syntax: string;
  description: string;
  icon: React.ReactNode;
  requiresRange: boolean;
  requiresMultipleCells?: boolean;
  argsCount?: number;
}

const FORMULA_OPTIONS: FormulaOption[] = [
  {
    id: 'SUM',
    name: 'SUM',
    syntax: 'SUM(range)',
    description: 'Adds all numbers in a range of cells',
    icon: <Sigma className="w-4 h-4" />,
    requiresRange: true,
  },
  {
    id: 'AVERAGE',
    name: 'AVERAGE',
    syntax: 'AVERAGE(range)',
    description: 'Returns the average of numbers in a range',
    icon: <BarChart3 className="w-4 h-4" />,
    requiresRange: true,
  },
  {
    id: 'COUNT',
    name: 'COUNT',
    syntax: 'COUNT(range)',
    description: 'Counts cells with numbers in a range',
    icon: <Hash className="w-4 h-4" />,
    requiresRange: true,
  },
  {
    id: 'MIN',
    name: 'MIN',
    syntax: 'MIN(range)',
    description: 'Returns the minimum value in a range',
    icon: <TrendingDown className="w-4 h-4" />,
    requiresRange: true,
  },
  {
    id: 'MAX',
    name: 'MAX',
    syntax: 'MAX(range)',
    description: 'Returns the maximum value in a range',
    icon: <TrendingUp className="w-4 h-4" />,
    requiresRange: true,
  },
  {
    id: 'IF',
    name: 'IF',
    syntax: 'IF(condition, true_value, false_value)',
    description: 'Returns one value if condition is true, another if false',
    icon: <Calculator className="w-4 h-4" />,
    requiresRange: false,
    requiresMultipleCells: true,
    argsCount: 3,
  },
  {
    id: 'CONCAT',
    name: 'CONCAT',
    syntax: 'CONCAT(text1, text2, ...)',
    description: 'Joins multiple text strings together',
    icon: <Plus className="w-4 h-4" />,
    requiresRange: false,
    requiresMultipleCells: true,
  },
  {
    id: 'TODAY',
    name: 'TODAY',
    syntax: 'TODAY()',
    description: 'Returns the current date',
    icon: <Calendar className="w-4 h-4" />,
    requiresRange: false,
  },
];

interface FormulaDropdownProps {
  position: { top: number; left: number };
  onSelect: (formula: FormulaOption) => void;
  onClose: () => void;
  searchText: string;
}

export function FormulaDropdown({ position, onSelect, onClose, searchText }: FormulaDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredFormulas = FORMULA_OPTIONS.filter(f => 
    f.name.toLowerCase().includes(searchText.toLowerCase()) ||
    f.description.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredFormulas.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredFormulas.length) % filteredFormulas.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredFormulas[selectedIndex]) {
          onSelect(filteredFormulas[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredFormulas, onSelect, onClose]);

  if (filteredFormulas.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white rounded-lg shadow-xl z-[10000] overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '400px',
        maxHeight: '400px',
        border: '2px solid',
        borderImage: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%) 1',
      }}
    >
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-700" style={{ color: '#000000' }}>
          Select a Formula
        </p>
      </div>
      <div className="overflow-y-auto max-h-[350px]">
        {filteredFormulas.map((formula, index) => (
          <div
            key={formula.id}
            className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-100 transition-colors ${
              index === selectedIndex ? 'bg-gray-100' : ''
            }`}
            onClick={() => onSelect(formula)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1" style={{color: '#F0A500'}}>{formula.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900" style={{ color: '#000000' }}>
                    {formula.name}
                  </span>
                  <span className="text-xs text-gray-500 font-mono" style={{ color: '#666666' }}>
                    {formula.syntax}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1" style={{ color: '#333333' }}>
                  {formula.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-500" style={{ color: '#666666' }}>
          Use ↑↓ to navigate, Enter to select, Esc to cancel
        </p>
      </div>
    </div>
  );
}
