import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface FormulaBarProps {}

export function FormulaBar({}: FormulaBarProps) {
  const [formula, setFormula] = useState('');
  const [selectedCell, setSelectedCell] = useState('A1');

  return (
    <div className="h-10 flex items-center px-2 gap-2 border-b bg-white border-gray-300">
      <div className="flex items-center gap-2">
        <div className="w-12 sm:w-16 h-7 border rounded px-2 flex items-center text-xs sm:text-sm border-gray-300 text-gray-900">
          {selectedCell}
        </div>
        <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-600" />
        </button>
        <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100">
          <Check className="w-4 h-4 text-emerald-600" />
        </button>
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="Enter formula or value..."
          className="w-full h-7 px-2 text-xs sm:text-sm border-none outline-none bg-white text-gray-900 placeholder-gray-400"
        />
      </div>
    </div>
  );
}
