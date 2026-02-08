export const exportToCSV = (cellData: { [key: string]: string }, filename: string = 'spreadsheet.csv') => {
  // Get all cell keys and determine the grid dimensions
  const cellKeys = Object.keys(cellData);
  if (cellKeys.length === 0) {
    // If no data, create empty CSV
    const blob = new Blob([''], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
    return;
  }

  let maxRow = 0;
  let maxCol = 0;

  // Parse cell keys to find dimensions
  cellKeys.forEach(key => {
    const match = key.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const col = columnToIndex(match[1]);
      const row = parseInt(match[2]) - 1;
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
    }
  });

  // Create 2D array for CSV data
  const csvData: string[][] = [];
  for (let row = 0; row <= maxRow; row++) {
    csvData[row] = new Array(maxCol + 1).fill('');
  }

  // Fill the array with cell data
  cellKeys.forEach(key => {
    const match = key.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const col = columnToIndex(match[1]);
      const row = parseInt(match[2]) - 1;
      csvData[row][col] = cellData[key] || '';
    }
  });

  // Convert to CSV string
  const csvContent = csvData
    .map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = cell.replace(/"/g, '""');
        return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
      }).join(',')
    )
    .join('\n');

  // Create and download blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

const columnToIndex = (column: string): number => {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result - 1;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};