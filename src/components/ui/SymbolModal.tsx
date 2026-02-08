import { useState } from 'react';

interface SymbolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (symbol: string) => void;
}


// 105 categorized symbols - 15 per category for perfect alignment
const SYMBOLS = {
  Arithmetic: [
    '+', '-', '×', '÷', '±', '∑', '∏', '√', '∫', '%', '∂', '∆', '∇', '◊', '∓'
  ],
  Logical: [
    '∧', '∨', '¬', '⇒', '⇔', '⊕', '⊤', '⊥', '∃', '∀', '⊻', '⊼', '⊽', '∄', '∅'
  ],
  Relational: [
    '=', '≠', '<', '>', '≤', '≥', '≈', '∞', '∝', '∈', '∉', '≡', '≢', '≪', '≫'
  ],
  Greek: [
    'α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'σ', 'φ', 'ω', 'Δ', 'Σ', 'Ω'
  ],
  Arrows: [
    '←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇑', '⇓', '⇔', '↗', '↘', '↙', '↖'
  ],
  Symbols: [
    '✓', '✗', '★', '☆', '♠', '♣', '♥', '♦', '©', '®', '™', '§', '¶', '†', '‡'
  ],
  Sets: [
    '⊂', '⊃', '⊆', '⊇', '∅', '∩', '∪', '∖', '⊄', '⊅', '⊈', '⊉', '⊊', '⊋', '⊓'
  ]
};

export function SymbolModal({ isOpen, onClose, onInsert }: SymbolModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (selected) {
      onInsert(selected);
      setSelected(null);
      // Don't close - allow multiple insertions
    }
  };

  return (
    // Fixed overlay that prevents page scroll
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center" 
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
    <div className="w-[600px] max-h-[85vh] flex flex-col">
      <div 
        className="bg-white rounded-lg shadow-xl overflow-hidden relative"
        style={{
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%) 1',
        }}
      >
        {/* HEADER */}
        <div className="relative p-4 overflow-hidden" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">Ω</span>
              <h2 className="text-lg font-semibold">Insert Symbol</h2>
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
        <div className="p-2 space-y-2 bg-white min-w-[520px] max-w-[600px] flex flex-col" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          <div className="sticky top-0 bg-white z-10 pb-2">
            <label className="block text-xs font-medium mb-1 text-center">
              Choose a symbol
            </label>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="flex gap-2 justify-between" style={{maxWidth: '100%'}}>
              {Object.entries(SYMBOLS).map(([category, symbols]) => (
                <div key={category} className="flex flex-col items-center min-w-[80px]">
                  <span className="text-xs font-semibold mb-1 whitespace-nowrap">{category}</span>
                  {symbols.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      className={`text-xl w-10 h-10 mb-1 flex items-center justify-center rounded border transition-all cursor-pointer ${selected === sym ? 'border-black' : 'bg-gray-100 border-gray-300'}`}
                      style={selected === sym ? {
                        background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
                      } : {}}
                      onClick={() => setSelected(sym)}
                      onMouseEnter={(e) => {
                        if (selected !== sym) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selected !== sym) {
                          e.currentTarget.style.background = '';
                        }
                      }}
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
          <div className="flex justify-end gap-2 pt-2 bg-white sticky bottom-0 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 font-bold text-xs"
              // ...existing code...
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!selected}
              className={`px-3 py-1 rounded font-bold transition-all min-w-[60px] text-xs ${
                selected
                  ? ""
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              style={selected ? {
                background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
                color: "#000",
                opacity: 1,
                minWidth: 60,
                fontWeight: 700,
                fontSize: 13
              } : {
                color: "#555",
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
    </div>
  );
}
