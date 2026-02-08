import { useState } from 'react';

interface SymbolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (symbol: string) => void;
}


// 30 categorized symbols
const SYMBOLS = {
  Arithmetic: [
    '+', '-', '×', '÷', '±', '∑', '∏', '√', '∫', '%'
  ],
  Logical: [
    '∧', '∨', '¬', '⇒', '⇔', '⊕', '⊤', '⊥', '∃', '∀'
  ],
  Relational: [
    '=', '≠', '<', '>', '≤', '≥', '≈', '∞', '∝', '∈'
  ],
  Other: [
    '✓', '✗', '⊂', '⊃', '⊆', '⊇', '∅', '∴', '∵', '∠'
  ]
};

export function SymbolModal({ isOpen, onClose, onInsert }: SymbolModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (selected) {
      onInsert(selected);
      setSelected(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-lg shadow-xl w-[600px] overflow-hidden relative">
        {/* HEADER */}
        <div className="relative bg-gradient-to-r from-[#FFD700] via-[#FFF8DC] to-[#FFD700] p-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">Ω</span>
              <h2 className="text-lg font-semibold text-black">Insert Symbol</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-black/10 transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
        {/* CONTENT */}
        <div className="p-2 space-y-2 bg-white min-w-[520px] max-w-[600px]">
          <div>
            <label className="block text-xs font-medium mb-1 text-black text-center">
              Choose a symbol
            </label>
            <div className="flex gap-2 justify-between overflow-auto" style={{maxWidth: '100%'}}>
              {Object.entries(SYMBOLS).map(([category, symbols]) => (
                <div key={category} className="flex flex-col items-center min-w-[80px]">
                  <span className="text-xs font-semibold mb-1 text-gray-700 whitespace-nowrap">{category}</span>
                  {symbols.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      className={`text-xl w-10 h-10 mb-1 flex items-center justify-center rounded border transition-all ${selected === sym ? 'bg-[#FFD700] border-black' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
                      onClick={() => setSelected(sym)}
                      aria-label={`Select symbol ${sym}`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {/* BUTTONS */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-gray-100 text-black hover:bg-gray-200 font-bold text-xs"
              style={{ color: "#000", opacity: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!selected}
              className={`px-3 py-1 rounded font-bold transition-all min-w-[60px] text-xs ${
                selected
                  ? "bg-[#FFD700] text-black hover:bg-[#B8860B]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              style={{
                color: selected ? "#000" : "#555",
                opacity: 1,
                minWidth: 60,
                fontWeight: 700,
                fontSize: 13
              }}
            >
              <span>Insert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
