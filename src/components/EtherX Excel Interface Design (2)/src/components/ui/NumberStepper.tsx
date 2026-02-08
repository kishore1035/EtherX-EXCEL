import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  isDarkMode?: boolean;
  className?: string;
}

export function NumberStepper({ 
  value, 
  onChange, 
  min = 1, 
  max = 100, 
  isDarkMode = false,
  className = '' 
}: NumberStepperProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const inputClass = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-gray-200'
    : 'bg-white border-gray-300 text-gray-900';

  const buttonClass = isDarkMode
    ? 'hover:bg-gray-600 text-gray-300'
    : 'hover:bg-gray-100 text-gray-600';

  return (
    <div className={`flex items-center border rounded ${inputClass} ${className}`}>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className={`w-12 px-2 py-1 text-xs text-center border-none outline-none ${inputClass}`}
      />
      <div className="flex flex-col border-l border-gray-300">
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className={`px-1 py-0.5 ${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className={`px-1 py-0.5 ${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed border-t border-gray-300`}
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}