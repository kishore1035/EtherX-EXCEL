import { Sheet, Cell } from "../types/spreadsheet";
import { saveSpreadsheetState, prepareExportData } from "./spreadsheetBackend";

// Export to PDF (using browser print) - Now includes all formatting
export function exportToPDF(sheet: Sheet, cellFormats?: any): void {
  // Create a temporary div with the sheet data
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export to PDF");
    return;
  }

  const rows: string[][] = [];
  const maxRow = 100;
  const maxCol = 26;

  // Get all data
  for (let row = 1; row <= maxRow; row++) {
    const rowData: string[] = [];
    let hasData = false;
    for (let col = 0; col < maxCol; col++) {
      const cellId = `${String.fromCharCode(65 + col)}${row}`;
      const cell = sheet.cells.get(cellId);
      rowData.push(cell?.value || "");
      if (cell?.value) hasData = true;
    }
    if (hasData) rows.push(rowData);
    else if (rows.length > 0) break; // Stop if we hit empty rows after data
  }

  // Create HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${sheet.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          margin-bottom: 20px;
          color: #333;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print()" style="padding: 10px 20px; margin-bottom: 20px; cursor: pointer;">Print / Save as PDF</button>
      <h1>${sheet.name}</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            ${Array.from({ length: maxCol }, (_, i) => `<th>${String.fromCharCode(65 + i)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, rowIndex) => `
            <tr>
              <td><strong>${rowIndex + 1}</strong></td>
              ${row.map((cell) => `<td>${cell || ""}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// Export to XLSX (mock - in production use a library like SheetJS)
export function exportToXLSX(sheet: Sheet): void {
  // For production, you'd use: import * as XLSX from 'xlsx';
  // This is a mock implementation that creates a downloadable data structure
  
  const rows: any[][] = [];
  const maxRow = 100;
  const maxCol = 26;

  // Add headers
  const headers = [""];
  for (let col = 0; col < maxCol; col++) {
    headers.push(String.fromCharCode(65 + col));
  }
  rows.push(headers);

  // Add data rows
  for (let row = 1; row <= maxRow; row++) {
    const rowData: any[] = [row];
    let hasData = false;
    for (let col = 0; col < maxCol; col++) {
      const cellId = `${String.fromCharCode(65 + col)}${row}`;
      const cell = sheet.cells.get(cellId);
      rowData.push(cell?.value || "");
      if (cell?.value) hasData = true;
    }
    if (hasData) {
      rows.push(rowData);
    } else if (rows.length > 1) {
      break;
    }
  }

  // Create TSV (Tab-Separated Values) format which Excel can open
  const tsv = rows.map((row) => row.join("\t")).join("\n");
  const blob = new Blob([tsv], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sheet.name}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(sheet: Sheet): void {
  const rows: string[][] = [];
  const maxRow = 100;
  const maxCol = 26;

  for (let row = 1; row <= maxRow; row++) {
    const rowData: string[] = [];
    for (let col = 0; col < maxCol; col++) {
      const cellId = `${String.fromCharCode(65 + col)}${row}`;
      const cell = sheet.cells.get(cellId);
      rowData.push(cell?.value || "");
    }
    // Only include rows that have data
    if (rowData.some((val) => val !== "")) {
      rows.push(rowData);
    }
  }

  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sheet.name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(sheets: Sheet[]): void {
  const data = sheets.map((sheet) => ({
    id: sheet.id,
    name: sheet.name,
    color: sheet.color,
    cells: Array.from(sheet.cells.entries()).map(([key, value]) => ({
      id: key,
      ...value,
    })),
  }));

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "spreadsheet.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromCSV(file: File): Promise<Map<string, any>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split("\n").map((row) =>
          row.split(",").map((cell) => cell.replace(/^"|"$/g, ""))
        );

        const cells = new Map();
        rows.forEach((row, rowIndex) => {
          row.forEach((value, colIndex) => {
            if (value.trim()) {
              const cellId = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
              cells.set(cellId, { value: value.trim() });
            }
          });
        });

        resolve(cells);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function saveToLocalStorage(sheets: Sheet[], activeSheetId: string): void {
  const data = {
    sheets: sheets.map((sheet) => ({
      id: sheet.id,
      name: sheet.name,
      color: sheet.color,
      cells: Array.from(sheet.cells.entries()),
    })),
    activeSheetId,
    timestamp: Date.now(),
  };
  localStorage.setItem("etherx-excel-data", JSON.stringify(data));
}

export function loadFromLocalStorage(): {
  sheets: Sheet[];
  activeSheetId: string;
} | null {
  try {
    const data = localStorage.getItem("etherx-excel-data");
    if (!data) return null;

    const parsed = JSON.parse(data);
    const sheets = parsed.sheets.map((sheet: any) => ({
      id: sheet.id,
      name: sheet.name,
      color: sheet.color,
      cells: new Map(sheet.cells),
    }));

    return { sheets, activeSheetId: parsed.activeSheetId };
  } catch {
    return null;
  }
}
