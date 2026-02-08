export function parseFormula(
  formula: string,
  cells: Map<string, any>
): { value: string; error?: string } {
  if (!formula.startsWith("=")) {
    return { value: formula };
  }

  try {
    const expression = formula.substring(1).toUpperCase();

    // Handle SUM
    if (expression.startsWith("SUM(")) {
      const range = expression.match(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (range) {
        const sum = sumRange(range[1], range[2], cells);
        return { value: sum.toString() };
      }
    }

    // Handle AVERAGE
    if (expression.startsWith("AVERAGE(")) {
      const range = expression.match(/AVERAGE\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (range) {
        const avg = averageRange(range[1], range[2], cells);
        return { value: avg.toFixed(2) };
      }
    }

    // Handle COUNT
    if (expression.startsWith("COUNT(")) {
      const range = expression.match(/COUNT\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (range) {
        const count = countRange(range[1], range[2], cells);
        return { value: count.toString() };
      }
    }

    // Handle MIN
    if (expression.startsWith("MIN(")) {
      const range = expression.match(/MIN\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (range) {
        const min = minRange(range[1], range[2], cells);
        return { value: min.toString() };
      }
    }

    // Handle MAX
    if (expression.startsWith("MAX(")) {
      const range = expression.match(/MAX\(([A-Z]+\d+):([A-Z]+\d+)\)/);
      if (range) {
        const max = maxRange(range[1], range[2], cells);
        return { value: max.toString() };
      }
    }

    // Handle IF
    if (expression.startsWith("IF(")) {
      const ifMatch = expression.match(/IF\(([^,]+),([^,]+),([^)]+)\)/);
      if (ifMatch) {
        const condition = evaluateCondition(ifMatch[1], cells);
        return { value: condition ? ifMatch[2].trim() : ifMatch[3].trim() };
      }
    }

    // Handle VLOOKUP - VLOOKUP(lookup_value, table_range, col_index, [range_lookup])
    if (expression.startsWith("VLOOKUP(")) {
      const vlookupMatch = expression.match(/VLOOKUP\(([^,]+),([^,]+),(\d+)/);
      if (vlookupMatch) {
        const lookupValue = vlookupMatch[1].trim();
        const tableRange = vlookupMatch[2].trim();
        const colIndex = parseInt(vlookupMatch[3]);
        const result = vlookup(lookupValue, tableRange, colIndex, cells);
        return { value: result };
      }
    }

    // Handle HLOOKUP
    if (expression.startsWith("HLOOKUP(")) {
      const hlookupMatch = expression.match(/HLOOKUP\(([^,]+),([^,]+),(\d+)/);
      if (hlookupMatch) {
        const lookupValue = hlookupMatch[1].trim();
        const tableRange = hlookupMatch[2].trim();
        const rowIndex = parseInt(hlookupMatch[3]);
        const result = hlookup(lookupValue, tableRange, rowIndex, cells);
        return { value: result };
      }
    }

    // Handle CONCAT/CONCATENATE
    if (expression.startsWith("CONCAT(") || expression.startsWith("CONCATENATE(")) {
      const concatMatch = expression.match(/CONCA?T?E?N?A?T?E?\((.+)\)/);
      if (concatMatch) {
        const args = concatMatch[1].split(',').map(arg => arg.trim());
        const result = args.map(arg => {
          const cellRef = arg.match(/^([A-Z]+\d+)$/);
          if (cellRef) {
            return cells.get(cellRef[1])?.value || "";
          }
          return arg.replace(/"/g, '');
        }).join('');
        return { value: result };
      }
    }

    // Handle TODAY
    if (expression === "TODAY()") {
      const today = new Date();
      return { value: today.toLocaleDateString() };
    }

    // Handle NOW
    if (expression === "NOW()") {
      const now = new Date();
      return { value: now.toLocaleString() };
    }

    // Handle UPPER
    if (expression.startsWith("UPPER(")) {
      const upperMatch = expression.match(/UPPER\(([^)]+)\)/);
      if (upperMatch) {
        const arg = upperMatch[1].trim();
        const cellRef = arg.match(/^([A-Z]+\d+)$/);
        const text = cellRef ? cells.get(cellRef[1])?.value || "" : arg.replace(/"/g, '');
        return { value: text.toUpperCase() };
      }
    }

    // Handle LOWER
    if (expression.startsWith("LOWER(")) {
      const lowerMatch = expression.match(/LOWER\(([^)]+)\)/);
      if (lowerMatch) {
        const arg = lowerMatch[1].trim();
        const cellRef = arg.match(/^([A-Z]+\d+)$/);
        const text = cellRef ? cells.get(cellRef[1])?.value || "" : arg.replace(/"/g, '');
        return { value: text.toLowerCase() };
      }
    }

    // Handle TRIM
    if (expression.startsWith("TRIM(")) {
      const trimMatch = expression.match(/TRIM\(([^)]+)\)/);
      if (trimMatch) {
        const arg = trimMatch[1].trim();
        const cellRef = arg.match(/^([A-Z]+\d+)$/);
        const text = cellRef ? cells.get(cellRef[1])?.value || "" : arg.replace(/"/g, '');
        return { value: text.trim() };
      }
    }

    // Handle LEN
    if (expression.startsWith("LEN(")) {
      const lenMatch = expression.match(/LEN\(([^)]+)\)/);
      if (lenMatch) {
        const arg = lenMatch[1].trim();
        const cellRef = arg.match(/^([A-Z]+\d+)$/);
        const text = cellRef ? cells.get(cellRef[1])?.value || "" : arg.replace(/"/g, '');
        return { value: text.length.toString() };
      }
    }

    // Handle ROUND
    if (expression.startsWith("ROUND(")) {
      const roundMatch = expression.match(/ROUND\(([^,]+),(\d+)\)/);
      if (roundMatch) {
        const value = parseFloat(roundMatch[1]);
        const decimals = parseInt(roundMatch[2]);
        return { value: value.toFixed(decimals) };
      }
    }

    // Handle ABS
    if (expression.startsWith("ABS(")) {
      const absMatch = expression.match(/ABS\(([^)]+)\)/);
      if (absMatch) {
        const value = parseFloat(absMatch[1]);
        return { value: Math.abs(value).toString() };
      }
    }

    // Handle simple cell references (A1, B2, etc.)
    const cellRef = expression.match(/^([A-Z]+\d+)$/);
    if (cellRef) {
      const refCell = cells.get(cellRef[1]);
      return { value: refCell?.value || "0" };
    }

    // Handle simple arithmetic (A1+B1, A1*B1, etc.)
    const arithmeticMatch = expression.match(/([A-Z]+\d+)([+\-*/])([A-Z]+\d+)/);
    if (arithmeticMatch) {
      const val1 = parseFloat(cells.get(arithmeticMatch[1])?.value || "0");
      const val2 = parseFloat(cells.get(arithmeticMatch[3])?.value || "0");
      const operator = arithmeticMatch[2];

      let result = 0;
      switch (operator) {
        case "+":
          result = val1 + val2;
          break;
        case "-":
          result = val1 - val2;
          break;
        case "*":
          result = val1 * val2;
          break;
        case "/":
          result = val2 !== 0 ? val1 / val2 : 0;
          break;
      }
      return { value: result.toString() };
    }

    return { value: "#ERROR", error: "Invalid formula" };
  } catch (err) {
    return { value: "#ERROR", error: "Parse error" };
  }
}

function sumRange(start: string, end: string, cells: Map<string, any>): number {
  const cellRange = getCellRange(start, end);
  return cellRange.reduce((sum, cellId) => {
    const value = parseFloat(cells.get(cellId)?.value || "0");
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
}

function averageRange(start: string, end: string, cells: Map<string, any>): number {
  const cellRange = getCellRange(start, end);
  const sum = sumRange(start, end, cells);
  return cellRange.length > 0 ? sum / cellRange.length : 0;
}

function countRange(start: string, end: string, cells: Map<string, any>): number {
  const cellRange = getCellRange(start, end);
  return cellRange.filter((cellId) => {
    const value = cells.get(cellId)?.value;
    return value && value !== "";
  }).length;
}

function minRange(start: string, end: string, cells: Map<string, any>): number {
  const cellRange = getCellRange(start, end);
  const values = cellRange
    .map((cellId) => parseFloat(cells.get(cellId)?.value || "0"))
    .filter((v) => !isNaN(v));
  return values.length > 0 ? Math.min(...values) : 0;
}

function maxRange(start: string, end: string, cells: Map<string, any>): number {
  const cellRange = getCellRange(start, end);
  const values = cellRange
    .map((cellId) => parseFloat(cells.get(cellId)?.value || "0"))
    .filter((v) => !isNaN(v));
  return values.length > 0 ? Math.max(...values) : 0;
}

function evaluateCondition(condition: string, cells: Map<string, any>): boolean {
  const match = condition.match(/([A-Z]+\d+)([><=!]+)(\d+)/);
  if (match) {
    const cellValue = parseFloat(cells.get(match[1])?.value || "0");
    const compareValue = parseFloat(match[3]);
    const operator = match[2];

    switch (operator) {
      case ">":
        return cellValue > compareValue;
      case "<":
        return cellValue < compareValue;
      case ">=":
        return cellValue >= compareValue;
      case "<=":
        return cellValue <= compareValue;
      case "==":
      case "=":
        return cellValue === compareValue;
      case "!=":
        return cellValue !== compareValue;
    }
  }
  return false;
}

function getCellRange(start: string, end: string): string[] {
  const startCol = start.match(/[A-Z]+/)?.[0] || "";
  const startRow = parseInt(start.match(/\d+/)?.[0] || "1");
  const endCol = end.match(/[A-Z]+/)?.[0] || "";
  const endRow = parseInt(end.match(/\d+/)?.[0] || "1");

  const startColIndex = columnToIndex(startCol);
  const endColIndex = columnToIndex(endCol);

  const cells: string[] = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startColIndex; col <= endColIndex; col++) {
      cells.push(`${indexToColumn(col)}${row}`);
    }
  }
  return cells;
}

function columnToIndex(col: string): number {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 64);
  }
  return index;
}

function indexToColumn(index: number): string {
  let col = "";
  while (index > 0) {
    const remainder = (index - 1) % 26;
    col = String.fromCharCode(65 + remainder) + col;
    index = Math.floor((index - 1) / 26);
  }
  return col;
}

function vlookup(
  lookupValue: string,
  tableRange: string,
  colIndex: number,
  cells: Map<string, any>
): string {
  try {
    const [start, end] = tableRange.split(':');
    const range = getCellRange(start, end);
    
    // Get the first column values
    const startCol = start.match(/[A-Z]+/)?.[0] || "";
    const startRow = parseInt(start.match(/\d+/)?.[0] || "1");
    const endRow = parseInt(end.match(/\d+/)?.[0] || "1");
    
    // Search for the lookup value in the first column
    for (let row = startRow; row <= endRow; row++) {
      const cellId = `${startCol}${row}`;
      const cellValue = cells.get(cellId)?.value || "";
      
      if (cellValue.toString() === lookupValue.replace(/"/g, '')) {
        // Found the value, now get the value from the specified column
        const targetColIndex = columnToIndex(startCol) + colIndex - 1;
        const targetCellId = `${indexToColumn(targetColIndex)}${row}`;
        return cells.get(targetCellId)?.value || "#N/A";
      }
    }
    
    return "#N/A";
  } catch (err) {
    return "#ERROR";
  }
}

function hlookup(
  lookupValue: string,
  tableRange: string,
  rowIndex: number,
  cells: Map<string, any>
): string {
  try {
    const [start, end] = tableRange.split(':');
    const startCol = start.match(/[A-Z]+/)?.[0] || "";
    const startRow = parseInt(start.match(/\d+/)?.[0] || "1");
    const endCol = end.match(/[A-Z]+/)?.[0] || "";
    
    const startColIndex = columnToIndex(startCol);
    const endColIndex = columnToIndex(endCol);
    
    // Search for the lookup value in the first row
    for (let col = startColIndex; col <= endColIndex; col++) {
      const cellId = `${indexToColumn(col)}${startRow}`;
      const cellValue = cells.get(cellId)?.value || "";
      
      if (cellValue.toString() === lookupValue.replace(/"/g, '')) {
        // Found the value, now get the value from the specified row
        const targetRow = startRow + rowIndex - 1;
        const targetCellId = `${indexToColumn(col)}${targetRow}`;
        return cells.get(targetCellId)?.value || "#N/A";
      }
    }
    
    return "#N/A";
  } catch (err) {
    return "#ERROR";
  }
}

export { getCellRange };
