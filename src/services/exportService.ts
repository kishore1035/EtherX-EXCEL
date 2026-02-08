/**
 * COMPREHENSIVE EXPORT SERVICE
 * Integrates IPFS serialization, CSV, PDF, and JSON exports
 * Uses unified cell schema for consistent data representation
 */

import { DocumentState, SheetData } from '../types/documentState';
import { SerializedSheet, ExportOptions } from '../types/unifiedCell';
import { 
  serializeSheetForIPFS, 
  exportSheetToCSV, 
  renderCellToPDF,
  downloadCSV 
} from '../utils/unifiedExport';

// ============================================================================
// IPFS SERIALIZATION
// ============================================================================

/**
 * Serialize entire document for IPFS storage
 * Converts all sheets to unified cell schema
 */
export function serializeDocumentForIPFS(documentState: DocumentState): {
  documentId: string;
  metadata: any;
  sheets: SerializedSheet[];
} {
  console.log('🔄 Serializing document for IPFS...');
  
  const serializedSheets = documentState.sheets.map(sheet => 
    serializeSheetForIPFS(sheet)
  );
  
  console.log(`✅ Serialized ${serializedSheets.length} sheets for IPFS`);
  
  return {
    documentId: documentState.documentId,
    metadata: documentState.metadata,
    sheets: serializedSheets
  };
}

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Export document to CSV with unified schema
 * Includes styling annotations and proper type handling
 */
export function exportDocumentToCSV(
  documentState: DocumentState,
  filename?: string,
  options: ExportOptions = {}
): void {
  console.log('📄 Exporting document to CSV...');
  
  const defaultOptions: ExportOptions = {
    includeStyles: true,
    includeFormulas: false,
    fallbackOnError: true,
    ...options
  };
  
  // Get active sheet or first sheet
  const activeSheet = documentState.sheets.find(s => s.sheetId === documentState.activeSheetId) 
    || documentState.sheets[0];
  
  if (!activeSheet) {
    console.error('❌ No sheet to export');
    return;
  }
  
  // Serialize sheet to unified format
  const serializedSheet = serializeSheetForIPFS(activeSheet);
  
  // Convert to CSV
  const csvContent = exportSheetToCSV(serializedSheet, defaultOptions);
  
  // Generate filename if not provided
  const csvFilename = filename || `${documentState.metadata.title}_${new Date().toISOString().slice(0, 10)}.csv`;
  
  // Download
  downloadCSV(csvContent, csvFilename);
  
  console.log(`✅ CSV export complete: ${csvFilename}`);
}

/**
 * Export all sheets to separate CSV files (as ZIP)
 */
export async function exportAllSheetsToCSV(
  documentState: DocumentState,
  options: ExportOptions = {}
): Promise<void> {
  console.log('📄 Exporting all sheets to CSV...');
  
  // Check if JSZip is available
  const hasJSZip = typeof window !== 'undefined' && (window as any).JSZip;
  
  if (!hasJSZip) {
    console.warn('⚠️ JSZip not available, exporting active sheet only');
    exportDocumentToCSV(documentState, undefined, options);
    return;
  }
  
  const JSZip = (window as any).JSZip;
  const zip = new JSZip();
  
  // Export each sheet
  for (const sheet of documentState.sheets) {
    const serializedSheet = serializeSheetForIPFS(sheet);
    const csvContent = exportSheetToCSV(serializedSheet, options);
    zip.file(`${sheet.name}.csv`, csvContent);
  }
  
  // Generate ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // Download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${documentState.metadata.title}_all_sheets.zip`;
  link.click();
  URL.revokeObjectURL(url);
  
  console.log('✅ All sheets exported as ZIP');
}

// ============================================================================
// PDF EXPORT
// ============================================================================

/**
 * Export document to PDF with images and styling
 * Requires jsPDF library
 */
export async function exportDocumentToPDF(
  documentState: DocumentState,
  filename?: string,
  options: ExportOptions = {}
): Promise<void> {
  console.log('📄 Exporting document to PDF...');
  
  // Check if jsPDF is available
  const hasJsPDF = typeof window !== 'undefined' && (window as any).jspdf;
  
  if (!hasJsPDF) {
    console.error('❌ jsPDF library not loaded');
    alert('PDF export requires jsPDF library. Please include it in your HTML.');
    return;
  }
  
  const { jsPDF } = (window as any).jspdf;
  const pdfDoc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  const defaultOptions: ExportOptions = {
    includeStyles: true,
    ipfsGateway: 'https://ipfs.io/ipfs/',
    maxImageSize: 5 * 1024 * 1024, // 5MB
    fallbackOnError: true,
    ...options
  };
  
  // Get active sheet
  const activeSheet = documentState.sheets.find(s => s.sheetId === documentState.activeSheetId) 
    || documentState.sheets[0];
  
  if (!activeSheet) {
    console.error('❌ No sheet to export');
    return;
  }
  
  // Serialize sheet
  const serializedSheet = serializeSheetForIPFS(activeSheet);
  
  // Add title
  pdfDoc.setFontSize(16);
  pdfDoc.setTextColor('#000000');
  pdfDoc.text(documentState.metadata.title, 15, 15);
  
  pdfDoc.setFontSize(10);
  pdfDoc.setTextColor('#666666');
  pdfDoc.text(`Sheet: ${activeSheet.name}`, 15, 22);
  pdfDoc.text(`Exported: ${new Date().toLocaleString()}`, 15, 27);
  
  // Define cell dimensions
  const startX = 15;
  const startY = 35;
  const cellWidth = 25;
  const cellHeight = 8;
  
  // Find grid bounds
  let maxRow = 0;
  let maxCol = 0;
  
  serializedSheet.cells.forEach(cell => {
    maxRow = Math.max(maxRow, cell.row);
    const colIndex = columnToIndex(cell.col);
    maxCol = Math.max(maxCol, colIndex);
  });
  
  console.log(`📊 PDF Grid: ${maxRow} rows × ${maxCol + 1} columns`);
  
  // Render grid (limit to fit on page)
  const maxRowsPerPage = Math.floor((297 - startY - 10) / cellHeight); // A4 landscape height
  const maxColsPerPage = Math.floor((210 - startX - 10) / cellWidth);  // A4 landscape width
  
  const rowsToRender = Math.min(maxRow, maxRowsPerPage);
  const colsToRender = Math.min(maxCol + 1, maxColsPerPage);
  
  // Draw grid
  pdfDoc.setDrawColor('#cccccc');
  pdfDoc.setLineWidth(0.1);
  
  for (let r = 0; r <= rowsToRender; r++) {
    for (let c = 0; c <= colsToRender; c++) {
      const x = startX + c * cellWidth;
      const y = startY + r * cellHeight;
      
      // Draw cell border
      pdfDoc.rect(x, y, cellWidth, cellHeight);
    }
  }
  
  // Render cells
  for (const cell of serializedSheet.cells) {
    if (cell.row > rowsToRender) continue;
    
    const colIndex = columnToIndex(cell.col);
    if (colIndex > colsToRender) continue;
    
    const x = startX + colIndex * cellWidth;
    const y = startY + (cell.row - 1) * cellHeight;
    
    try {
      await renderCellToPDF(cell, pdfDoc, x, y, cellWidth, cellHeight, defaultOptions);
    } catch (error) {
      console.error(`❌ Failed to render cell ${cell.col}${cell.row}:`, error);
    }
  }
  
  // Add footer
  const pageCount = pdfDoc.getNumberOfPages();
  pdfDoc.setFontSize(8);
  pdfDoc.setTextColor('#999999');
  pdfDoc.text(
    `Generated by EtherX Excel - IPFS CID: ${documentState.documentId}`,
    15,
    290,
    { maxWidth: 270 }
  );
  
  // Save PDF
  const pdfFilename = filename || `${documentState.metadata.title}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdfDoc.save(pdfFilename);
  
  console.log(`✅ PDF export complete: ${pdfFilename}`);
  console.log(`   Rendered ${serializedSheet.cells.length} cells`);
  console.log(`   Grid: ${rowsToRender} rows × ${colsToRender} columns`);
}

/**
 * Convert column letter to index (A = 0, Z = 25, AA = 26)
 */
function columnToIndex(column: string): number {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result - 1;
}

// ============================================================================
// JSON EXPORT
// ============================================================================

/**
 * Export document as JSON (complete DocumentState)
 */
export function exportDocumentToJSON(
  documentState: DocumentState,
  filename?: string
): void {
  console.log('📄 Exporting document to JSON...');
  
  const json = JSON.stringify(documentState, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  
  const jsonFilename = filename || `${documentState.metadata.title}_${documentState.documentId}.json`;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = jsonFilename;
  link.click();
  URL.revokeObjectURL(url);
  
  console.log(`✅ JSON export complete: ${jsonFilename}`);
  console.log(`   Size: ${(json.length / 1024).toFixed(2)} KB`);
}

/**
 * Export serialized document (unified schema) as JSON
 */
export function exportSerializedDocumentToJSON(
  documentState: DocumentState,
  filename?: string
): void {
  console.log('📄 Exporting serialized document to JSON...');
  
  const serialized = serializeDocumentForIPFS(documentState);
  const json = JSON.stringify(serialized, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  
  const jsonFilename = filename || `${documentState.metadata.title}_unified_${documentState.documentId}.json`;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = jsonFilename;
  link.click();
  URL.revokeObjectURL(url);
  
  console.log(`✅ Serialized JSON export complete: ${jsonFilename}`);
  console.log(`   Size: ${(json.length / 1024).toFixed(2)} KB`);
}

// ============================================================================
// EXCEL EXPORT (.xlsx)
// ============================================================================

/**
 * Export document to Excel format (.xlsx)
 * Requires exceljs library
 */
export async function exportDocumentToExcel(
  documentState: DocumentState,
  filename?: string,
  options: ExportOptions = {}
): Promise<void> {
  console.log('📄 Exporting document to Excel (.xlsx)...');
  
  // Check if ExcelJS is available
  const hasExcelJS = typeof window !== 'undefined' && (window as any).ExcelJS;
  
  if (!hasExcelJS) {
    console.error('❌ ExcelJS library not loaded');
    alert('Excel export requires ExcelJS library.');
    return;
  }
  
  const ExcelJS = (window as any).ExcelJS;
  const workbook = new ExcelJS.Workbook();
  
  workbook.creator = 'EtherX Excel';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Add each sheet
  for (const sheet of documentState.sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);
    const serializedSheet = serializeSheetForIPFS(sheet);
    
    // Add cells
    serializedSheet.cells.forEach(cell => {
      const colIndex = columnToIndex(cell.col) + 1; // ExcelJS uses 1-based
      const excelCell = worksheet.getCell(cell.row, colIndex);
      
      // Set value
      switch (cell.type) {
        case 'number':
          excelCell.value = parseFloat(cell.value) || 0;
          break;
        case 'formula':
          excelCell.value = { formula: cell.meta?.formula?.replace(/^=/, '') || cell.value };
          break;
        case 'checkbox':
          excelCell.value = cell.meta?.checked || cell.value === 'true';
          break;
        case 'image':
          excelCell.value = `IMAGE(${cell.meta?.ipfsCid || cell.value})`;
          break;
        case 'file':
          excelCell.value = `FILE(${cell.meta?.fileName || cell.value})`;
          break;
        default:
          excelCell.value = cell.value;
      }
      
      // Apply styling
      if (cell.style) {
        excelCell.font = {
          name: cell.style.fontFamily || 'Arial',
          size: cell.style.fontSize || 11,
          bold: cell.style.bold,
          italic: cell.style.italic,
          underline: cell.style.underline,
          strike: cell.style.strikethrough,
          color: cell.style.textColor ? { argb: cell.style.textColor.replace('#', 'FF') } : undefined
        };
        
        excelCell.fill = cell.style.bgColor && cell.style.bgColor !== '#ffffff' ? {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: cell.style.bgColor.replace('#', 'FF') }
        } : undefined;
        
        excelCell.alignment = {
          horizontal: cell.style.alignment || 'left',
          vertical: cell.style.verticalAlignment || 'middle',
          wrapText: cell.style.wrapText
        };
        
        if (cell.style.numberFormat) {
          excelCell.numFmt = cell.style.numberFormat;
        }
      }
    });
  }
  
  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const excelFilename = filename || `${documentState.metadata.title}.xlsx`;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = excelFilename;
  link.click();
  URL.revokeObjectURL(url);
  
  console.log(`✅ Excel export complete: ${excelFilename}`);
}

// ============================================================================
// EXPORT ALL FORMATS
// ============================================================================

/**
 * Export menu - show all available formats
 */
export interface ExportFormat {
  name: string;
  extension: string;
  description: string;
  handler: (documentState: DocumentState, filename?: string, options?: ExportOptions) => void | Promise<void>;
  requiresLibrary?: string;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    name: 'CSV',
    extension: '.csv',
    description: 'Text-only with style annotations',
    handler: exportDocumentToCSV
  },
  {
    name: 'PDF',
    extension: '.pdf',
    description: 'Visual document with images',
    handler: exportDocumentToPDF,
    requiresLibrary: 'jsPDF'
  },
  {
    name: 'JSON',
    extension: '.json',
    description: 'Complete document state',
    handler: exportDocumentToJSON
  },
  {
    name: 'JSON (Unified)',
    extension: '.json',
    description: 'Serialized with unified cell schema',
    handler: exportSerializedDocumentToJSON
  },
  {
    name: 'Excel',
    extension: '.xlsx',
    description: 'Excel workbook with formatting',
    handler: exportDocumentToExcel,
    requiresLibrary: 'ExcelJS'
  }
];
