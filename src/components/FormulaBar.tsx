import { useState, useRef, useEffect } from 'react';
import { X, Check, Sigma } from 'lucide-react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { FormulaBuilder, FormulaDefinition, FORMULAS } from './FormulaBuilder';
import { parseAndEvaluate } from '../utils/formulaEngine';

interface FormulaBarProps {
  isDarkMode?: boolean;
}

export function FormulaBar({ isDarkMode = false }: FormulaBarProps) {
  const { selectedCell, cellData, setCellData, getCellKey, setIsFormulaMode, setFormulaSelectionCells, setActiveFormula, isFormulaMode, formulaSelectionCells, activeFormula } = useSpreadsheet();
  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);
  const [builderPosition, setBuilderPosition] = useState({ x: 0, y: 0 });
  const [formulaInput, setFormulaInput] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredFormulas, setFilteredFormulas] = useState<FormulaDefinition[]>(FORMULAS);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const formulaButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const cellKey = selectedCell ? getCellKey(selectedCell.row, selectedCell.col) : '';
  const displayCell = selectedCell ? `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}` : 'A1';

  // Sync formula input with cell data or formula mode
  useEffect(() => {
    if (isFormulaMode && activeFormula) {
      // Build formula string from selected cells
      let formulaStr = `=${activeFormula}(`;
      if (formulaSelectionCells.length > 0) {
        formulaStr += formulaSelectionCells.join(', ');
      }
      formulaStr += ')';
      setFormulaInput(formulaStr);
    } else if (cellKey) {
      setFormulaInput(cellData[cellKey] || '');
    }
  }, [isFormulaMode, activeFormula, formulaSelectionCells, cellKey, cellData]);

  const handleFormulaChange = (value: string) => {
    setFormulaInput(value);
    
    // If user starts typing a formula (begins with =), enable formula mode
    if (value.startsWith('=') && !isFormulaMode) {
      setIsFormulaMode(true);
      setFormulaSelectionCells([]);
    }

    // Autocomplete: filter formulas by the first token after '='
    // Show autocomplete immediately on first '='
    if (value === '=') {
      setFilteredFormulas(FORMULAS);
      setActiveSuggestionIndex(0);
      setShowAutocomplete(true);
      setIsFormulaMode(true);
      setFormulaSelectionCells([]);
      return;
    }

    if (value.startsWith('=')) {
      const token = value.slice(1).toUpperCase().trim();
      if (token.length === 0) {
        setFilteredFormulas(FORMULAS);
        setActiveSuggestionIndex(0);
        setShowAutocomplete(true);
      } else {
        const matches = FORMULAS.filter(f => f.name.startsWith(token));
        setFilteredFormulas(matches.length > 0 ? matches : FORMULAS);
        setActiveSuggestionIndex(0);
        setShowAutocomplete(true);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleFormulaButtonClick = () => {
    console.log('Formula button clicked!');
    if (formulaButtonRef.current) {
      const rect = formulaButtonRef.current.getBoundingClientRect();
      console.log('Button position:', rect);
      setBuilderPosition({ 
        x: Math.max(10, rect.left), 
        y: Math.max(10, rect.bottom + 5) 
      });
    }
    console.log('Opening formula builder...');
    setShowFormulaBuilder(true);
  };

  const handleSelectFormula = (formula: FormulaDefinition) => {
    setActiveFormula(formula.name);
    setIsFormulaMode(true);
    setFormulaSelectionCells([]);
    setFormulaInput(`=${formula.name}(`);
    setShowFormulaBuilder(false);
    
    // Focus the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleCancelFormula = () => {
    setIsFormulaMode(false);
    setFormulaSelectionCells([]);
    setActiveFormula(null);
    // Restore original cell value
    if (cellKey) {
      setFormulaInput(cellData[cellKey] || '');
    }
  };

  const calculateFormula = () => {
    if (!cellKey || !formulaInput) return;

    try {
      // If it's a formula (starts with =), evaluate it
      if (formulaInput.startsWith('=')) {
        const trimmed = formulaInput.trim();
        // Prevent evaluating bare '=' or obviously incomplete expressions
        if (trimmed === '=') {
          // Keep user in formula mode without writing an error
          return;
        }
        // Basic completeness checks: allow function calls and simple expressions
        const expr = trimmed.slice(1);
        const looksLikeFunction = /^[A-Z]+\s*\(/.test(expr);
        const hasBalancedParens = (() => {
          let balance = 0;
          for (const ch of expr) {
            if (ch === '(') balance++;
            else if (ch === ')') balance--;
          }
          return balance === 0;
        })();
        const looksLikeBinaryExpr = /[A-Z]+\d+\s*[+\-*/]\s*[A-Z]+\d+|[A-Z]+\d+\s*[+\-*/]\s*\d+|\d+\s*[+\-*/]\s*[A-Z]+\d+/.test(expr);
        const hasContentAfterEquals = expr.length > 0;
        const isCompleteEnough = (looksLikeFunction && hasBalancedParens) || looksLikeBinaryExpr || hasContentAfterEquals;
        if (!isCompleteEnough || trimmed.endsWith('(')) {
          return;
        }
        const result = parseAndEvaluate(formulaInput, {
          getCellValue: (cellId: string) => {
            const value = cellData[cellId];
            // Parse numeric values
            if (value && !isNaN(parseFloat(value))) {
              return parseFloat(value);
            }
            return value || 0;
          },
          getRangeValues: (start: string, end: string) => {
            const values: any[] = [];
            const startMatch = start.match(/([A-Z]+)(\d+)/);
            const endMatch = end.match(/([A-Z]+)(\d+)/);
            
            if (startMatch && endMatch) {
              const startCol = startMatch[1].charCodeAt(0) - 65;
              const startRow = parseInt(startMatch[2]) - 1;
              const endCol = endMatch[1].charCodeAt(0) - 65;
              const endRow = parseInt(endMatch[2]) - 1;
              
              for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row++) {
                for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
                  const key = `${String.fromCharCode(65 + col)}${row + 1}`;
                  const value = cellData[key];
                  if (value && !isNaN(parseFloat(value))) {
                    values.push(parseFloat(value));
                  } else if (value) {
                    values.push(value);
                  }
                }
              }
            }
            return values;
          }
        });
        
        // Store the result in the cell
        setCellData(prev => ({ ...prev, [cellKey]: String(result) }));
        console.log(`Formula ${formulaInput} calculated: ${result}`);
      } else {
        // Store raw value
        setCellData(prev => ({ ...prev, [cellKey]: formulaInput }));
      }
    } catch (error) {
      console.error('Formula calculation error:', error);
      // Do not overwrite the cell with error for incomplete inputs
      // Keep the user in control to fix the formula in the bar
    }
  };

  const handleConfirmFormula = () => {
    calculateFormula();
    setIsFormulaMode(false);
    setFormulaSelectionCells([]);
    setActiveFormula(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Open autocomplete instantly on first '=' keypress
    if (e.key === '=' && !showAutocomplete) {
      setIsFormulaMode(true);
      setFormulaSelectionCells([]);
      setFilteredFormulas(FORMULAS);
      setActiveSuggestionIndex(0);
      setShowAutocomplete(true);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmFormula();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelFormula();
      setShowAutocomplete(false);
    } else if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(i => Math.min(i + 1, filteredFormulas.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Apply active suggestion into input
        const sel = filteredFormulas[activeSuggestionIndex];
        if (sel) {
          setFormulaInput(`=${sel.name}(`);
          setActiveFormula(sel.name);
          setIsFormulaMode(true);
          setFormulaSelectionCells([]);
          setShowAutocomplete(false);
        }
      }
    }
  };

  // Add global ESC key listener for formula mode
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFormulaMode) {
        e.preventDefault();
        e.stopPropagation();
        handleCancelFormula();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [isFormulaMode]);

  return (
    <>
      <div 
        className="h-8 flex items-center px-2 gap-2 border-b" 
        style={{
          background: isDarkMode ? '#000000' : '#FFFFFF',
          borderColor: isDarkMode ? '#374151' : '#d1d5db',
          borderBottomWidth: isFormulaMode ? '2px' : '1px',
          borderBottomColor: isFormulaMode ? '#FFD700' : (isDarkMode ? '#374151' : '#d1d5db')
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-12 sm:w-16 h-7 border rounded px-2 flex items-center text-xs sm:text-sm font-semibold"
            style={{
              borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
              color: isDarkMode ? '#FFFFFF' : '#111827',
              background: isDarkMode ? '#1a1a1a' : '#FFFFFF'
            }}
          >
            {displayCell}
          </div>
          <button 
            ref={formulaButtonRef}
            onClick={handleFormulaButtonClick}
            className="h-7 w-7 flex items-center justify-center rounded transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)',
              border: '1px solid #FFD700'
            }}
            title="Insert Function"
          >
            <Sigma className="w-4 h-4 text-black" />
          </button>
          <button 
            onClick={handleCancelFormula}
            className="h-7 w-7 flex items-center justify-center rounded transition-all"
            style={{
              background: isDarkMode ? '#1a1a1a' : 'transparent',
              opacity: isFormulaMode ? 1 : 0.5
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : '#fee'}
            onMouseLeave={(e) => e.currentTarget.style.background = isDarkMode ? '#1a1a1a' : 'transparent'}
            title="Cancel Formula (Esc)"
            disabled={!isFormulaMode}
          >
            <X className="w-4 h-4" style={{ color: isDarkMode ? '#ef4444' : '#dc2626' }} />
          </button>
          <button 
            onClick={handleConfirmFormula}
            className="h-7 w-7 flex items-center justify-center rounded transition-all"
            style={{
              background: isDarkMode ? '#1a1a1a' : 'transparent',
              opacity: isFormulaMode ? 1 : 0.5
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : '#efe'}
            onMouseLeave={(e) => e.currentTarget.style.background = isDarkMode ? '#1a1a1a' : 'transparent'}
            title="Confirm Formula (Enter)"
            disabled={!isFormulaMode}
          >
            <Check className="w-4 h-4" style={{ color: isDarkMode ? '#10B981' : '#059669' }} />
          </button>
        </div>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            id="formula-bar-input"
            name="formula-bar"
            autoComplete="off"
            type="text"
            value={formulaInput}
            onChange={(e) => handleFormulaChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (formulaInput === '=') {
                setFilteredFormulas(FORMULAS);
                setActiveSuggestionIndex(0);
                setShowAutocomplete(true);
              }
            }}
            placeholder="Enter formula or value..."
            className="w-full h-7 px-2 text-xs sm:text-sm border-none outline-none"
            style={{
              background: isDarkMode ? '#1a1a1a' : '#FFFFFF',
              color: formulaInput.startsWith('=') ? '#0066cc' : (isDarkMode ? '#FFFFFF' : '#111827'),
              fontWeight: formulaInput.startsWith('=') ? '500' : 'normal'
            }}
          />

          {showAutocomplete && formulaInput.startsWith('=') && (
            <div
              className="absolute left-0 right-0 mt-1 z-50 max-h-48 overflow-auto rounded border shadow"
              style={{
                background: isDarkMode ? '#0b0b0b' : '#ffffff',
                borderColor: isDarkMode ? '#333' : '#e5e7eb',
                minWidth: '280px'
              }}
            >
              {filteredFormulas.map((f, idx) => (
                <div
                  key={f.name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setFormulaInput(`=${f.name}(`);
                    setActiveFormula(f.name);
                    setIsFormulaMode(true);
                    setFormulaSelectionCells([]);
                    setShowAutocomplete(false);
                    // Focus back to input for further typing
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="px-2 py-1 cursor-pointer text-xs sm:text-sm"
                  style={{
                    background: idx === activeSuggestionIndex
                      ? 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)'
                      : (isDarkMode ? '#0b0b0b' : '#ffffff'),
                    color: idx === activeSuggestionIndex ? '#000' : (isDarkMode ? '#e5e7eb' : '#111827'),
                    borderBottom: '1px solid ' + (isDarkMode ? '#222' : '#f3f4f6')
                  }}
                  title={f.description}
                >
                  <span style={{ fontWeight: 600 }}>{f.name}</span>
                  <span style={{ opacity: 0.75, marginLeft: 8 }}>— {f.syntax}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {isFormulaMode && (
          <div className="text-xs px-2 py-1 rounded" style={{
            background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)',
            color: '#000',
            fontWeight: '600'
          }}>
            {activeFormula ? `${activeFormula} Mode` : 'Formula Mode'}
          </div>
        )}
      </div>
      
      <FormulaBuilder
        show={showFormulaBuilder}
        position={builderPosition}
        onClose={() => setShowFormulaBuilder(false)}
        onSelectFormula={handleSelectFormula}
      />
    </>
  );
}
