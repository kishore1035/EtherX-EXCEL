/**
 * Formula Backend - Comprehensive formula parsing and evaluation engine
 * Supports Excel-like functions with cell references and ranges
 */

export type CellValue = string | number | boolean | null;

export interface FormulaResult {
  value: CellValue;
  error?: string;
}

export interface CellData {
  [key: string]: string;
}

/**
 * Normalize any cell value to a string
 * Handles objects (template data), primitives, null/undefined
 */
function normalizeCellValue(raw: any): string {
  if (raw == null) {
    // null or undefined
    return '';
  }
  if (typeof raw === 'string') {
    return raw;
  }
  if (typeof raw === 'object' && 'value' in raw) {
    // Template data format: { value: '...', ... }
    return String(raw.value ?? '');
  }
  // Number, boolean, or other primitive
  return String(raw);
}

/**
 * Parse cell reference (e.g., "A1" -> {col: 0, row: 0})
 */
export function parseCellRef(ref: string): { col: number; row: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  
  const colStr = match[1];
  const rowStr = match[2];
  
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 65 + 1);
  }
  col -= 1; // Convert to 0-based
  
  const row = parseInt(rowStr) - 1; // Convert to 0-based
  
  return { col, row };
}

/**
 * Parse range (e.g., "A1:B10" -> array of cell refs)
 */
export function parseRange(range: string): string[] {
  const [start, end] = range.split(':');
  if (!start || !end) return [];
  
  const startRef = parseCellRef(start);
  const endRef = parseCellRef(end);
  
  if (!startRef || !endRef) return [];
  
  // Helper to convert index to column letter(s)
  const indexToColumn = (index: number): string => {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  };
  
  const cells: string[] = [];
  for (let row = Math.min(startRef.row, endRef.row); row <= Math.max(startRef.row, endRef.row); row++) {
    for (let col = Math.min(startRef.col, endRef.col); col <= Math.max(startRef.col, endRef.col); col++) {
      const colLetter = indexToColumn(col);
      cells.push(`${colLetter}${row + 1}`);
    }
  }
  
  return cells;
}

/**
 * Get numeric value from cell
 */
export function getNumericValue(cellData: CellData, cellRef: string): number {
  const raw = cellData[cellRef];
  const value = normalizeCellValue(raw);
  if (!value) return 0;
  
  // If it's a formula, try to parse the result
  if (value.startsWith('=')) {
    const result = evaluateFormula(value, cellData);
    return typeof result.value === 'number' ? result.value : parseFloat(String(result.value)) || 0;
  }
  
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Get cell value (string or number)
 */
export function getCellValue(cellData: CellData, cellRef: string): CellValue {
  const raw = cellData[cellRef];
  const value = normalizeCellValue(raw);
  if (!value) return null;
  
  // If it's a formula, evaluate it
  if (value.startsWith('=')) {
    const result = evaluateFormula(value, cellData);
    return result.value;
  }
  
  return value;
}

/**
 * SUM function - adds all numbers in range or arguments
 */
function funcSUM(args: string[], cellData: CellData): number {
  let sum = 0;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      // Range
      const cells = parseRange(arg);
      for (const cell of cells) {
        sum += getNumericValue(cellData, cell);
      }
    } else {
      // Single cell or number
      const cellRef = arg.match(/^[A-Z]+\d+$/);
      if (cellRef) {
        sum += getNumericValue(cellData, arg);
      } else {
        sum += parseFloat(arg) || 0;
      }
    }
  }
  
  return sum;
}

/**
 * AVERAGE function - calculates average of numbers
 */
function funcAVERAGE(args: string[], cellData: CellData): number {
  let sum = 0;
  let count = 0;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      const cells = parseRange(arg);
      for (const cell of cells) {
        const val = getNumericValue(cellData, cell);
        if (val !== 0 || cellData[cell]) {
          sum += val;
          count++;
        }
      }
    } else {
      const cellRef = arg.match(/^[A-Z]+\d+$/);
      if (cellRef) {
        sum += getNumericValue(cellData, arg);
        count++;
      } else {
        sum += parseFloat(arg) || 0;
        count++;
      }
    }
  }
  
  return count > 0 ? sum / count : 0;
}

/**
 * COUNT function - counts numeric values
 */
function funcCOUNT(args: string[], cellData: CellData): number {
  let count = 0;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      const cells = parseRange(arg);
      for (const cell of cells) {
        const val = cellData[cell];
        if (val && !isNaN(parseFloat(val))) {
          count++;
        }
      }
    } else {
      const cellRef = arg.match(/^[A-Z]+\d+$/);
      if (cellRef) {
        const val = cellData[arg];
        if (val && !isNaN(parseFloat(val))) {
          count++;
        }
      } else if (!isNaN(parseFloat(arg))) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * MAX function - returns maximum value
 */
function funcMAX(args: string[], cellData: CellData): number {
  let max = -Infinity;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      const cells = parseRange(arg);
      for (const cell of cells) {
        const val = getNumericValue(cellData, cell);
        if (val > max) max = val;
      }
    } else {
      const cellRef = arg.match(/^[A-Z]+\d+$/);
      if (cellRef) {
        const val = getNumericValue(cellData, arg);
        if (val > max) max = val;
      } else {
        const val = parseFloat(arg);
        if (!isNaN(val) && val > max) max = val;
      }
    }
  }
  
  return max === -Infinity ? 0 : max;
}

/**
 * MIN function - returns minimum value
 */
function funcMIN(args: string[], cellData: CellData): number {
  let min = Infinity;
  
  for (const arg of args) {
    if (arg.includes(':')) {
      const cells = parseRange(arg);
      for (const cell of cells) {
        const val = getNumericValue(cellData, cell);
        if (val < min) min = val;
      }
    } else {
      const cellRef = arg.match(/^[A-Z]+\d+$/);
      if (cellRef) {
        const val = getNumericValue(cellData, arg);
        if (val < min) min = val;
      } else {
        const val = parseFloat(arg);
        if (!isNaN(val) && val < min) min = val;
      }
    }
  }
  
  return min === Infinity ? 0 : min;
}

/**
 * MULTIPLY function - multiplies all arguments
 */
function funcMULTIPLY(args: string[], cellData: CellData): number {
  let product = 1;
  
  for (const arg of args) {
    const cellRef = arg.match(/^[A-Z]+\d+$/);
    if (cellRef) {
      product *= getNumericValue(cellData, arg);
    } else {
      product *= parseFloat(arg) || 0;
    }
  }
  
  return product;
}

/**
 * DIVIDE function - divides first argument by second
 */
function funcDIVIDE(args: string[], cellData: CellData): number {
  if (args.length < 2) return 0;
  
  const numerator = args[0].match(/^[A-Z]+\d+$/) 
    ? getNumericValue(cellData, args[0])
    : parseFloat(args[0]) || 0;
  
  const denominator = args[1].match(/^[A-Z]+\d+$/)
    ? getNumericValue(cellData, args[1])
    : parseFloat(args[1]) || 1;
  
  return denominator !== 0 ? numerator / denominator : 0;
}

/**
 * DIFFERENCE function - subtracts second argument from first
 */
function funcDIFFERENCE(args: string[], cellData: CellData): number {
  if (args.length < 2) return 0;
  
  const minuend = args[0].match(/^[A-Z]+\d+$/)
    ? getNumericValue(cellData, args[0])
    : parseFloat(args[0]) || 0;
  
  const subtrahend = args[1].match(/^[A-Z]+\d+$/)
    ? getNumericValue(cellData, args[1])
    : parseFloat(args[1]) || 0;
  
  return minuend - subtrahend;
}

/**
 * POWER function - raises first argument to power of second
 */
function funcPOWER(args: string[], cellData: CellData): number {
  if (args.length < 2) return 0;
  
  const base = args[0].match(/^[A-Z]+\d+$/)
    ? getNumericValue(cellData, args[0])
    : parseFloat(args[0]) || 0;
  
  const exponent = args[1].match(/^[A-Z]+\d+$/)
    ? getNumericValue(cellData, args[1])
    : parseFloat(args[1]) || 1;
  
  return Math.pow(base, exponent);
}

/**
 * SQRT function - returns square root
 */
function funcSQRT(args: string[], cellData: CellData): number {
  if (args.length < 1) return 0;
  
  const value = args[0].match(/^[A-Z]+\d+$/)
    ? getNumericValue(cellData, args[0])
    : parseFloat(args[0]) || 0;
  
  return Math.sqrt(value);
}

/**
 * CONCAT function - concatenates text
 */
function funcCONCAT(args: string[], cellData: CellData): string {
  return args.map(arg => {
    // Remove quotes if present
    if (arg.startsWith('"') && arg.endsWith('"')) {
      return arg.slice(1, -1);
    }
    
    // Cell reference
    const cellRef = arg.match(/^[A-Z]+\d+$/);
    if (cellRef) {
      return String(getCellValue(cellData, arg) || '');
    }
    
    return arg;
  }).join('');
}

/**
 * IF function - conditional logic
 */
function funcIF(args: string[], cellData: CellData): CellValue {
  if (args.length < 3) return null;
  
  // Parse condition (simplified - supports basic comparisons)
  const condition = args[0];
  const trueValue = args[1];
  const falseValue = args[2];
  
  // Evaluate condition
  let conditionResult = false;
  
  // Try to parse comparison operators
  const operators = ['>=', '<=', '>', '<', '==', '=', '!='];
  for (const op of operators) {
    if (condition.includes(op)) {
      const [left, right] = condition.split(op).map(s => s.trim());
      
      const leftVal = left.match(/^[A-Z]+\d+$/)
        ? getNumericValue(cellData, left)
        : parseFloat(left) || 0;
      
      const rightVal = right.match(/^[A-Z]+\d+$/)
        ? getNumericValue(cellData, right)
        : parseFloat(right) || 0;
      
      switch (op) {
        case '>':
          conditionResult = leftVal > rightVal;
          break;
        case '<':
          conditionResult = leftVal < rightVal;
          break;
        case '>=':
          conditionResult = leftVal >= rightVal;
          break;
        case '<=':
          conditionResult = leftVal <= rightVal;
          break;
        case '==':
        case '=':
          conditionResult = leftVal === rightVal;
          break;
        case '!=':
          conditionResult = leftVal !== rightVal;
          break;
      }
      break;
    }
  }
  
  // Return appropriate value
  const resultArg = conditionResult ? trueValue : falseValue;
  
  // Remove quotes if string literal
  if (resultArg.startsWith('"') && resultArg.endsWith('"')) {
    return resultArg.slice(1, -1);
  }
  
  // Cell reference
  const cellRef = resultArg.match(/^[A-Z]+\d+$/);
  if (cellRef) {
    return getCellValue(cellData, resultArg);
  }
  
  // Number
  const num = parseFloat(resultArg);
  if (!isNaN(num)) return num;
  
  return resultArg;
}

/**
 * TODAY function - returns current date
 */
function funcTODAY(): string {
  const now = new Date();
  return now.toLocaleDateString();
}

/**
 * Parse formula and extract function name and arguments
 */
function parseFormulaExpression(formula: string): { func: string; args: string[] } | null {
  // Remove leading = and trim
  const expr = formula.substring(1).trim();
  
  // Match function pattern: FUNCTION(args)
  const match = expr.match(/^([A-Z]+)\((.*)\)$/);
  if (!match) return null;
  
  const func = match[1];
  const argsStr = match[2];
  
  // Parse arguments (simple comma split, doesn't handle nested functions yet)
  const args: string[] = [];
  let current = '';
  let inQuotes = false;
  let parenDepth = 0;
  
  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === '(' && !inQuotes) {
      parenDepth++;
      current += char;
    } else if (char === ')' && !inQuotes) {
      parenDepth--;
      current += char;
    } else if (char === ',' && !inQuotes && parenDepth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    args.push(current.trim());
  }
  
  return { func, args };
}

/**
 * Main formula evaluation function
 */
export function evaluateFormula(formula: string, cellData: CellData): FormulaResult {
  if (!formula || !formula.startsWith('=')) {
    return { value: formula };
  }
  
  try {
    const parsed = parseFormulaExpression(formula);
    if (!parsed) {
      return { value: '#ERROR!', error: 'Invalid formula syntax' };
    }
    
    const { func, args } = parsed;
    
    // Execute function
    switch (func.toUpperCase()) {
      case 'SUM':
        return { value: funcSUM(args, cellData) };
      
      case 'AVERAGE':
        return { value: funcAVERAGE(args, cellData) };
      
      case 'COUNT':
        return { value: funcCOUNT(args, cellData) };
      
      case 'MAX':
        return { value: funcMAX(args, cellData) };
      
      case 'MIN':
        return { value: funcMIN(args, cellData) };
      
      case 'MULTIPLY':
        return { value: funcMULTIPLY(args, cellData) };
      
      case 'DIVIDE':
        return { value: funcDIVIDE(args, cellData) };
      
      case 'DIFFERENCE':
        return { value: funcDIFFERENCE(args, cellData) };
      
      case 'POWER':
        return { value: funcPOWER(args, cellData) };
      
      case 'SQRT':
        return { value: funcSQRT(args, cellData) };
      
      case 'CONCAT':
      case 'CONCATENATE':
        return { value: funcCONCAT(args, cellData) };
      
      case 'IF':
        return { value: funcIF(args, cellData) };
      
      case 'TODAY':
        return { value: funcTODAY() };
      
      default:
        return { value: '#NAME?', error: `Unknown function: ${func}` };
    }
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return { value: '#ERROR!', error: String(error) };
  }
}

/**
 * Evaluate all formulas in a spreadsheet
 * Returns updated cell data with evaluated results
 */
export function evaluateAllFormulas(cellData: CellData): CellData {
  const result: CellData = { ...cellData };
  const evaluated = new Set<string>();
  const maxIterations = 100; // Prevent infinite loops
  
  // Keep evaluating until all formulas are resolved
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let anyChanged = false;
    
    for (const key of Object.keys(result)) {
      const raw = result[key];
      const cellValue = normalizeCellValue(raw);
      
      if (cellValue.startsWith('=') && !evaluated.has(key)) {
        const evalResult = evaluateFormula(cellValue, result);
        if (evalResult.value !== null && evalResult.value !== undefined) {
          result[key] = String(evalResult.value);
          evaluated.add(key);
          anyChanged = true;
        }
      }
    }
    
    if (!anyChanged) break;
  }
  
  return result;
}

/**
 * Get display value for a cell (evaluates formulas)
 */
export function getCellDisplayValue(cellData: CellData, cellKey: string): string {
  const raw = cellData[cellKey];
  const cellValue = normalizeCellValue(raw);
  
  if (!cellValue) return '';
  
  if (cellValue.startsWith('=')) {
    const result = evaluateFormula(cellValue, cellData);
    return String(result.value ?? '');
  }
  
  return cellValue;
}
