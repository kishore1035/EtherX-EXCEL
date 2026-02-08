/**
 * Chart Data Processor
 * Handles data extraction, validation, and transformation for charts
 */

export interface TableData {
  id: string;
  name: string;
  range: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  columns: string[];
  rows: any[][];
}

export interface ChartConfiguration {
  chartType: 'column' | 'line' | 'pie';
  title: string;
  xAxisColumn?: string; // For column/line charts
  yAxisColumns?: string[]; // For column/line charts (can be multiple)
  categoryColumn?: string; // For pie chart
  valueColumn?: string; // For pie chart
  colors?: string[];
  showLegend?: boolean;
  showDataLabels?: boolean;
}

export interface ProcessedChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

/**
 * Detect tables in the spreadsheet
 */
export function detectTables(cellData: { [key: string]: string }): TableData[] {
  console.log('detectTables called with', Object.keys(cellData).length, 'cells');
  
  const tables: TableData[] = [];
  const processedCells = new Set<string>();
  
  // Sort cell keys to process in order
  const cellKeys = Object.keys(cellData).sort((a, b) => {
    const [rowA, colA] = parseCellKey(a);
    const [rowB, colB] = parseCellKey(b);
    return rowA - rowB || colA - colB;
  });
  
  console.log('Processing', cellKeys.length, 'cell keys');

  for (const cellKey of cellKeys) {
    if (processedCells.has(cellKey)) continue;
    
    const [row, col] = parseCellKey(cellKey);
    const value = cellData[cellKey];
    
    // Check if this could be a table header (non-empty, followed by data)
    if (value && value.trim()) {
      const table = extractTable(cellData, row, col, processedCells);
      if (table && table.rows.length > 1) {
        tables.push(table);
      }
    }
  }

  console.log('Detected', tables.length, 'tables:', tables);
  return tables;
}

/**
 * Extract a table starting from a given position
 */
function extractTable(
  cellData: { [key: string]: string },
  startRow: number,
  startCol: number,
  processedCells: Set<string>
): TableData | null {
  // Find table boundaries
  let endCol = startCol;
  let endRow = startRow;
  
  // Find horizontal extent (columns)
  while (cellData[getCellKey(startRow, endCol + 1)]) {
    endCol++;
  }
  
  // Find vertical extent (rows)
  let emptyRowCount = 0;
  let currentRow = startRow + 1;
  
  while (emptyRowCount < 2) {
    let hasData = false;
    for (let c = startCol; c <= endCol; c++) {
      if (cellData[getCellKey(currentRow, c)]) {
        hasData = true;
        break;
      }
    }
    
    if (hasData) {
      endRow = currentRow;
      emptyRowCount = 0;
    } else {
      emptyRowCount++;
    }
    currentRow++;
    
    if (currentRow > startRow + 100) break; // Safety limit
  }
  
  // Need at least 2 rows (header + data) and 2 columns
  if (endRow <= startRow || endCol <= startCol) {
    return null;
  }
  
  // Extract column headers
  const columns: string[] = [];
  for (let c = startCol; c <= endCol; c++) {
    const header = cellData[getCellKey(startRow, c)] || `Column ${c - startCol + 1}`;
    columns.push(header.trim());
  }
  
  // Extract rows
  const rows: any[][] = [];
  for (let r = startRow + 1; r <= endRow; r++) {
    const row: any[] = [];
    let hasData = false;
    
    for (let c = startCol; c <= endCol; c++) {
      const value = cellData[getCellKey(r, c)] || '';
      row.push(value);
      if (value) hasData = true;
      processedCells.add(getCellKey(r, c));
    }
    
    if (hasData) {
      rows.push(row);
    }
  }
  
  // Mark header cells as processed
  for (let c = startCol; c <= endCol; c++) {
    processedCells.add(getCellKey(startRow, c));
  }
  
  const tableName = `Table at ${String.fromCharCode(65 + startCol)}${startRow + 1}`;
  const range = `${String.fromCharCode(65 + startCol)}${startRow + 1}:${String.fromCharCode(65 + endCol)}${endRow + 1}`;
  
  return {
    id: `table_${startRow}_${startCol}`,
    name: tableName,
    range,
    startRow,
    startCol,
    endRow,
    endCol,
    columns,
    rows
  };
}

/**
 * Process table data for chart rendering
 */
export function processChartData(
  table: TableData,
  config: ChartConfiguration
): ProcessedChartData | null {
  console.log('processChartData called with:', { table, config });
  
  let result: ProcessedChartData | null = null;
  
  if (config.chartType === 'pie') {
    result = processPieChartData(table, config);
  } else {
    result = processColumnLineChartData(table, config);
  }
  
  console.log('processChartData result:', result);
  return result;
}

/**
 * Process data for Column/Line charts
 */
function processColumnLineChartData(
  table: TableData,
  config: ChartConfiguration
): ProcessedChartData | null {
  console.log('processColumnLineChartData:', { table, config });
  
  if (!config.xAxisColumn || !config.yAxisColumns || config.yAxisColumns.length === 0) {
    console.error('Missing axis configuration');
    return null;
  }
  
  const xIndex = table.columns.indexOf(config.xAxisColumn);
  if (xIndex === -1) {
    console.error('X-axis column not found:', config.xAxisColumn);
    return null;
  }
  
  const yIndices = config.yAxisColumns
    .map(col => table.columns.indexOf(col))
    .filter(idx => idx !== -1);
  
  if (yIndices.length === 0) {
    console.error('No valid Y-axis columns found');
    return null;
  }
  
  console.log('Column indices:', { xIndex, yIndices });
  
  // Extract labels from X-axis column
  const labels = table.rows.map(row => String(row[xIndex] || ''));
  
  // Create datasets for each Y-axis column
  const colors = config.colors || generateColors(yIndices.length);
  const datasets = yIndices.map((yIndex, i) => {
    const columnName = table.columns[yIndex];
    const data = table.rows.map(row => {
      const value = row[yIndex];
      return parseNumericValue(value);
    });
    
    return {
      label: columnName,
      data,
      backgroundColor: config.chartType === 'column' ? colors[i] : 'transparent',
      borderColor: colors[i],
      borderWidth: 2,
      fill: false
    };
  });
  
  return { labels, datasets };
}

/**
 * Process data for Pie charts
 */
function processPieChartData(
  table: TableData,
  config: ChartConfiguration
): ProcessedChartData | null {
  console.log('processPieChartData:', { table, config });
  
  if (!config.categoryColumn || !config.valueColumn) {
    console.error('Missing category or value column');
    return null;
  }
  
  const categoryIndex = table.columns.indexOf(config.categoryColumn);
  const valueIndex = table.columns.indexOf(config.valueColumn);
  
  if (categoryIndex === -1 || valueIndex === -1) {
    console.error('Column not found:', { categoryIndex, valueIndex });
    return null;
  }
  
  console.log('Pie column indices:', { categoryIndex, valueIndex });
  
  // Extract labels and values
  const labels = table.rows.map(row => String(row[categoryIndex] || ''));
  const data = table.rows.map(row => parseNumericValue(row[valueIndex]));
  
  const colors = config.colors || generateColors(labels.length);
  
  return {
    labels,
    datasets: [{
      label: config.valueColumn,
      data,
      backgroundColor: colors,
      borderColor: '#FFFFFF',
      borderWidth: 2
    }]
  };
}

/**
 * Parse numeric value from string
 */
function parseNumericValue(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols, commas, etc.
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Generate color palette
 */
function generateColors(count: number): string[] {
  const baseColors = [
    '#FFD700', // Gold
    '#4A90E2', // Blue
    '#50C878', // Green
    '#FF6B6B', // Red
    '#9B59B6', // Purple
    '#F39C12', // Orange
    '#1ABC9C', // Turquoise
    '#E74C3C', // Crimson
    '#3498DB', // Sky Blue
    '#2ECC71'  // Emerald
  ];
  
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

/**
 * Parse cell key (e.g., "A1" -> [0, 0])
 */
function parseCellKey(key: string): [number, number] {
  const match = key.match(/^([A-Z]+)(\d+)$/);
  if (!match) return [0, 0];
  
  const col = match[1].split('').reduce((acc, char) => {
    return acc * 26 + (char.charCodeAt(0) - 65);
  }, 0);
  const row = parseInt(match[2]) - 1;
  
  return [row, col];
}

/**
 * Get cell key from row/col (e.g., [0, 0] -> "A1")
 */
function getCellKey(row: number, col: number): string {
  let colStr = '';
  let c = col;
  while (c >= 0) {
    colStr = String.fromCharCode(65 + (c % 26)) + colStr;
    c = Math.floor(c / 26) - 1;
  }
  return `${colStr}${row + 1}`;
}

/**
 * Validate chart configuration
 */
export function validateChartConfig(config: ChartConfiguration): string | null {
  if (!config.chartType) {
    return 'Chart type is required';
  }
  
  if (config.chartType === 'pie') {
    if (!config.categoryColumn) {
      return 'Category column is required for pie chart';
    }
    if (!config.valueColumn) {
      return 'Value column is required for pie chart';
    }
  } else {
    if (!config.xAxisColumn) {
      return 'X-axis column is required';
    }
    if (!config.yAxisColumns || config.yAxisColumns.length === 0) {
      return 'At least one Y-axis column is required';
    }
  }
  
  return null;
}

/**
 * Get column data types
 */
export function getColumnTypes(table: TableData): { [column: string]: 'numeric' | 'text' } {
  const types: { [column: string]: 'numeric' | 'text' } = {};
  
  table.columns.forEach((column, index) => {
    let numericCount = 0;
    let totalCount = 0;
    
    table.rows.forEach(row => {
      const value = row[index];
      if (value !== null && value !== undefined && value !== '') {
        totalCount++;
        const parsed = parseNumericValue(value);
        if (!isNaN(parsed) && isFinite(parsed)) {
          numericCount++;
        }
      }
    });
    
    // If more than 70% of values are numeric, consider it numeric
    // Default to 'text' if no data or can't determine
    if (totalCount === 0) {
      types[column] = 'text';
    } else {
      types[column] = (numericCount / totalCount) > 0.7 ? 'numeric' : 'text';
    }
  });
  
  console.log('getColumnTypes result:', types);
  
  return types;
}
