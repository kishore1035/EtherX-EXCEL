// Formula Engine - Advanced formula parsing and evaluation

export type ASTNode = 
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'cell'; cellId: string }
  | { type: 'range'; start: string; end: string }
  | { type: 'function'; name: string; args: ASTNode[] }
  | { type: 'binary'; operator: string; left: ASTNode; right: ASTNode };

export interface FormulaContext {
  getCellValue: (cellId: string) => any;
  getRangeValues: (startCell: string, endCell: string) => any[];
}

// Tokenizer
type Token = 
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'operator'; value: string }
  | { type: 'identifier'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' }
  | { type: 'colon' };

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < formula.length) {
    const char = formula[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // String literals
    if (char === '"') {
      let str = '';
      i++;
      while (i < formula.length && formula[i] !== '"') {
        str += formula[i];
        i++;
      }
      i++; // Skip closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // Numbers
    if (/\d/.test(char)) {
      let num = '';
      while (i < formula.length && /[\d.]/.test(formula[i])) {
        num += formula[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }

    // Operators
    if (['+', '-', '*', '/', '>', '<', '='].includes(char)) {
      let op = char;
      i++;
      // Handle >= <= == !=
      if (i < formula.length && ['=', '>'].includes(formula[i])) {
        op += formula[i];
        i++;
      }
      tokens.push({ type: 'operator', value: op });
      continue;
    }

    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }

    // Comma
    if (char === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }

    // Colon (for ranges)
    if (char === ':') {
      tokens.push({ type: 'colon' });
      i++;
      continue;
    }

    // Identifiers (function names, cell references)
    if (/[A-Za-z]/.test(char)) {
      let ident = '';
      while (i < formula.length && /[A-Za-z0-9_]/.test(formula[i])) {
        ident += formula[i];
        i++;
      }
      tokens.push({ type: 'identifier', value: ident.toUpperCase() });
      continue;
    }

    i++;
  }

  return tokens;
}

// Parser
class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private current(): Token | undefined {
    return this.tokens[this.pos];
  }

  private advance(): void {
    this.pos++;
  }

  private expect(type: string): Token {
    const token = this.current();
    if (!token || token.type !== type) {
      throw new Error(`Expected ${type} but got ${token?.type}`);
    }
    this.advance();
    return token;
  }

  parse(): ASTNode {
    return this.parseExpression();
  }

  private parseExpression(): ASTNode {
    return this.parseComparison();
  }

  private parseComparison(): ASTNode {
    let node = this.parseAdditive();

    while (this.current() && this.current()!.type === 'operator' && 
           ['>', '<', '>=', '<=', '==', '='].includes((this.current() as any).value)) {
      const op = (this.current() as any).value;
      this.advance();
      const right = this.parseAdditive();
      node = { type: 'binary', operator: op, left: node, right };
    }

    return node;
  }

  private parseAdditive(): ASTNode {
    let node = this.parseMultiplicative();

    while (this.current() && this.current()!.type === 'operator' && 
           ['+', '-'].includes((this.current() as any).value)) {
      const op = (this.current() as any).value;
      this.advance();
      const right = this.parseMultiplicative();
      node = { type: 'binary', operator: op, left: node, right };
    }

    return node;
  }

  private parseMultiplicative(): ASTNode {
    let node = this.parsePrimary();

    while (this.current() && this.current()!.type === 'operator' && 
           ['*', '/'].includes((this.current() as any).value)) {
      const op = (this.current() as any).value;
      this.advance();
      const right = this.parsePrimary();
      node = { type: 'binary', operator: op, left: node, right };
    }

    return node;
  }

  private parsePrimary(): ASTNode {
    const token = this.current();

    if (!token) {
      throw new Error('Unexpected end of formula');
    }

    // Numbers
    if (token.type === 'number') {
      this.advance();
      return { type: 'number', value: (token as any).value };
    }

    // Strings
    if (token.type === 'string') {
      this.advance();
      return { type: 'string', value: (token as any).value };
    }

    // Parentheses
    if (token.type === 'lparen') {
      this.advance();
      const node = this.parseExpression();
      this.expect('rparen');
      return node;
    }

    // Identifiers (functions or cell references)
    if (token.type === 'identifier') {
      const name = (token as any).value;
      this.advance();

      // Check if it's a function call
      if (this.current() && this.current()!.type === 'lparen') {
        this.advance();
        const args: ASTNode[] = [];

        if (this.current() && this.current()!.type !== 'rparen') {
          args.push(this.parseExpression());

          while (this.current() && this.current()!.type === 'comma') {
            this.advance();
            args.push(this.parseExpression());
          }
        }

        this.expect('rparen');
        return { type: 'function', name, args };
      }

      // Check if it's a range (e.g., A1:B10)
      if (this.current() && this.current()!.type === 'colon') {
        this.advance();
        const endToken = this.expect('identifier');
        return { type: 'range', start: name, end: (endToken as any).value };
      }

      // It's a cell reference
      return { type: 'cell', cellId: name };
    }

    throw new Error(`Unexpected token: ${token.type}`);
  }
}

// Evaluator
export function evaluateFormula(node: ASTNode, context: FormulaContext): any {
  switch (node.type) {
    case 'number':
      return node.value;

    case 'string':
      return node.value;

    case 'boolean':
      return node.value;

    case 'cell':
      return context.getCellValue(node.cellId);

    case 'range':
      return context.getRangeValues(node.start, node.end);

    case 'binary':
      return evaluateBinary(node, context);

    case 'function':
      return evaluateFunction(node, context);

    default:
      throw new Error('Unknown node type');
  }
}

function evaluateBinary(node: Extract<ASTNode, { type: 'binary' }>, context: FormulaContext): any {
  const left = evaluateFormula(node.left, context);
  const right = evaluateFormula(node.right, context);

  switch (node.operator) {
    case '+':
      return (Number(left) || 0) + (Number(right) || 0);
    case '-':
      return (Number(left) || 0) - (Number(right) || 0);
    case '*':
      return (Number(left) || 0) * (Number(right) || 0);
    case '/':
      if (Number(right) === 0) throw new Error('Division by zero');
      return (Number(left) || 0) / (Number(right) || 0);
    case '>':
      return left > right;
    case '<':
      return left < right;
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    case '==':
    case '=':
      return left == right;
    default:
      throw new Error(`Unknown operator: ${node.operator}`);
  }
}

function evaluateFunction(node: Extract<ASTNode, { type: 'function' }>, context: FormulaContext): any {
  switch (node.name) {
    case 'SUM': {
      let sum = 0;
      for (const arg of node.args) {
        const value = evaluateFormula(arg, context);
        if (Array.isArray(value)) {
          sum += value.reduce((acc, v) => acc + (Number(v) || 0), 0);
        } else {
          sum += Number(value) || 0;
        }
      }
      return sum;
    }

    case 'AVERAGE': {
      let sum = 0;
      let count = 0;
      for (const arg of node.args) {
        const value = evaluateFormula(arg, context);
        if (Array.isArray(value)) {
          const nums = value.filter(v => typeof v === 'number' || !isNaN(Number(v)));
          sum += nums.reduce((acc, v) => acc + Number(v), 0);
          count += nums.length;
        } else if (typeof value === 'number' || !isNaN(Number(value))) {
          sum += Number(value);
          count++;
        }
      }
      return count > 0 ? sum / count : 0;
    }

    case 'COUNT': {
      let count = 0;
      for (const arg of node.args) {
        const value = evaluateFormula(arg, context);
        if (Array.isArray(value)) {
          count += value.filter(v => typeof v === 'number' || !isNaN(Number(v))).length;
        } else if (typeof value === 'number' || !isNaN(Number(value))) {
          count++;
        }
      }
      return count;
    }

    case 'MIN': {
      let min = Infinity;
      for (const arg of node.args) {
        const value = evaluateFormula(arg, context);
        if (Array.isArray(value)) {
          const nums = value.filter(v => typeof v === 'number' || !isNaN(Number(v))).map(Number);
          if (nums.length > 0) {
            min = Math.min(min, ...nums);
          }
        } else if (typeof value === 'number' || !isNaN(Number(value))) {
          min = Math.min(min, Number(value));
        }
      }
      return min === Infinity ? 0 : min;
    }

    case 'MAX': {
      let max = -Infinity;
      for (const arg of node.args) {
        const value = evaluateFormula(arg, context);
        if (Array.isArray(value)) {
          const nums = value.filter(v => typeof v === 'number' || !isNaN(Number(v))).map(Number);
          if (nums.length > 0) {
            max = Math.max(max, ...nums);
          }
        } else if (typeof value === 'number' || !isNaN(Number(value))) {
          max = Math.max(max, Number(value));
        }
      }
      return max === -Infinity ? 0 : max;
    }

    case 'IF': {
      if (node.args.length !== 3) {
        throw new Error('IF requires 3 arguments');
      }
      const condition = evaluateFormula(node.args[0], context);
      return condition ? evaluateFormula(node.args[1], context) : evaluateFormula(node.args[2], context);
    }

    case 'CONCAT': {
      return node.args.map(arg => String(evaluateFormula(arg, context))).join('');
    }

    case 'TODAY': {
      return new Date().toLocaleDateString();
    }

    default:
      throw new Error(`Unknown function: ${node.name}`);
  }
}

// Main parse and evaluate function
export function parseAndEvaluate(formula: string, context: FormulaContext): any {
  try {
    if (!formula.startsWith('=')) {
      return formula;
    }

    const formulaContent = formula.substring(1).trim();
    const tokens = tokenize(formulaContent);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    return evaluateFormula(ast, context);
  } catch (error) {
    return '#ERROR!';
  }
}

// Extract cell references from formula
export function extractCellReferences(formula: string): string[] {
  const references: string[] = [];
  const cellRegex = /\b[A-Z]+\d+\b/g;
  let match;

  while ((match = cellRegex.exec(formula)) !== null) {
    references.push(match[0]);
  }

  return [...new Set(references)];
}

// Parse cell reference (e.g., "A1" -> { col: 0, row: 0 })
export function parseCellReference(cellId: string): { col: number; row: number } {
  const match = cellId.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell reference: ${cellId}`);

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

// Get range cells (e.g., "A1:B3" -> ["A1", "A2", "A3", "B1", "B2", "B3"])
export function getRangeCells(start: string, end: string): string[] {
  const startPos = parseCellReference(start);
  const endPos = parseCellReference(end);

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

  for (let row = startPos.row; row <= endPos.row; row++) {
    for (let col = startPos.col; col <= endPos.col; col++) {
      const colName = indexToColumn(col);
      const cellId = `${colName}${row + 1}`;
      cells.push(cellId);
    }
  }

  return cells;
}
