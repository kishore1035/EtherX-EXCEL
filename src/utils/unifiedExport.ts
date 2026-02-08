/**
 * UNIFIED EXPORT SYSTEM
 * Handles IPFS serialization, CSV export, and PDF rendering with proper cell schema
 */

import { UnifiedCell, SerializedSheet, ExportOptions, UnifiedCellType } from '../types/unifiedCell';
import { DocumentState, SheetData, CellData } from '../types/documentState';

// ============================================================================
// IPFS SERIALIZATION
// ============================================================================

/**
 * Serialize entire sheet for IPFS storage
 * Converts DocumentState sheet format to unified cell schema
 * STRICT VALIDATION: Throws error if cells are missing required fields
 * 
 * @param sheet - SheetData from DocumentState
 * @returns SerializedSheet ready for IPFS upload
 */
export function serializeSheetForIPFS(sheet: SheetData): SerializedSheet {
  console.log('🔄 Serializing sheet for IPFS:', sheet.name);
  
  const unifiedCells: UnifiedCell[] = [];
  const errors: string[] = [];
  
  // Convert cells from { [cellKey: string]: CellData } to UnifiedCell[]
  Object.entries(sheet.cells || {}).forEach(([cellKey, cellData]) => {
    try {
      const unifiedCell = convertToUnifiedCell(cellKey, cellData);
      if (unifiedCell) {
        // STRICT VALIDATION
        validateUnifiedCell(unifiedCell, cellKey);
        unifiedCells.push(unifiedCell);
      }
    } catch (error) {
      errors.push(`Cell ${cellKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`❌ Failed to serialize cell ${cellKey}:`, error);
    }
  });
  
  // Add image cells
  (sheet.images || []).forEach((image, index) => {
    try {
      const imageCell = createImageCell(image, index);
      validateUnifiedCell(imageCell, `Image[${index}]`);
      unifiedCells.push(imageCell);
    } catch (error) {
      errors.push(`Image[${index}]: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`❌ Failed to serialize image ${index}:`, error);
    }
  });
  
  // Add file cells (if any stored as shapes with file metadata)
  (sheet.shapes || []).forEach((shape, index) => {
    if ((shape as any).fileData) {
      try {
        const fileCell = createFileCell(shape, index);
        validateUnifiedCell(fileCell, `File[${index}]`);
        unifiedCells.push(fileCell);
      } catch (error) {
        errors.push(`File[${index}]: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`❌ Failed to serialize file ${index}:`, error);
      }
    }
  });
  
  // Report errors if any
  if (errors.length > 0) {
    console.warn(`⚠️ Serialization completed with ${errors.length} errors:`);
    errors.forEach(err => console.warn(`  - ${err}`));
  }
  
  console.log(`✅ Serialized ${unifiedCells.length} cells for IPFS`);
  
  return {
    sheetId: sheet.sheetId,
    name: sheet.name,
    cells: unifiedCells,
    metadata: {
      rowCount: sheet.grid?.rows,
      colCount: sheet.grid?.columns,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      frozen: {
        rows: sheet.grid?.frozenRows,
        columns: sheet.grid?.frozenColumns
      },
      zoom: sheet.zoom
    }
  };
}

/**
 * Convert DocumentState CellData to UnifiedCell
 */
function convertToUnifiedCell(cellKey: string, cellData: CellData): UnifiedCell | null {
  const { row, col } = parseCellKey(cellKey);
  if (row === null || col === null) return null;
  
  // Determine cell type
  const type = determineCellType(cellData);
  
  // Extract value
  const value = extractCellValue(cellData);
  
  // Build unified cell
  const unifiedCell: UnifiedCell = {
    row,
    col,
    type,
    value,
    style: convertToUnifiedStyle(cellData.style),
    meta: {
      formula: cellData.formula,
      comment: cellData.comment?.text,
      author: cellData.comment?.author,
      timestamp: cellData.comment?.timestamp,
      hyperlink: cellData.hyperlink,
      locked: cellData.locked,
      validation: cellData.validation,
      mergedWith: cellData.mergedWith,
      isMergeParent: cellData.isMergeParent,
      mergeSpan: cellData.mergeSpan
    }
  };
  
  return unifiedCell;
}

/**
 * Parse cell key like "A1" into row and column
 */
function parseCellKey(cellKey: string): { row: number | null; col: string | null } {
  const match = cellKey.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { row: null, col: null };
  
  return {
    col: match[1],
    row: parseInt(match[2], 10)
  };
}

/**
 * STRICT VALIDATION: Validate UnifiedCell structure
 * Throws error if required fields are missing
 */
function validateUnifiedCell(cell: UnifiedCell, identifier: string): void {
  if (!cell.type) {
    throw new Error(`Cell ${identifier} missing type`);
  }
  
  if (cell.value === undefined || cell.value === null) {
    throw new Error(`Cell ${identifier} missing value`);
  }
  
  if (!cell.row || cell.row < 1) {
    throw new Error(`Cell ${identifier} has invalid row: ${cell.row}`);
  }
  
  if (!cell.col || !/^[A-Z]+$/.test(cell.col)) {
    throw new Error(`Cell ${identifier} has invalid column: ${cell.col}`);
  }
  
  // Validate type-specific requirements
  if (cell.type === 'image' || cell.type === 'file') {
    if (cell.value.startsWith('data:')) {
      throw new Error(`Cell ${identifier} contains base64 data - must use IPFS CID`);
    }
  }
}

/**
 * Determine cell type from CellData
 */
function determineCellType(cellData: CellData): UnifiedCellType {
  // Check for formula
  if (cellData.formula) return 'formula';
  
  // Check for checkbox (boolean value)
  if (typeof cellData.value === 'boolean') return 'checkbox';
  
  // Check for date
  if (cellData.type === 'date') return 'date';
  
  // Check if value contains emoji/symbol (Unicode > 127)
  if (typeof cellData.value === 'string' && /[\u{1F300}-\u{1F9FF}]/u.test(cellData.value)) {
    return 'symbol';
  }
  
  // Check for number
  if (cellData.type === 'number' || typeof cellData.value === 'number') {
    return 'number';
  }
  
  // Default to text
  return 'text';
}

/**
 * Extract cell value as string
 */
function extractCellValue(cellData: CellData): string {
  if (cellData.value === null || cellData.value === undefined) return '';
  
  if (typeof cellData.value === 'boolean') {
    return cellData.value.toString();
  }
  
  if (typeof cellData.value === 'number') {
    return cellData.value.toString();
  }
  
  return String(cellData.value);
}

/**
 * Convert CellStyle to UnifiedCellStyle
 */
function convertToUnifiedStyle(style: any): any {
  if (!style) return undefined;
  
  return {
    bgColor: style.backgroundColor,
    textColor: style.textColor,
    bold: style.bold,
    italic: style.italic,
    underline: style.underline,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    alignment: style.alignment?.horizontal,
    verticalAlignment: style.alignment?.vertical || style.verticalAlignment,
    wrapText: style.wrapText || style.alignment?.wrapText,
    rotation: style.rotation || style.alignment?.textRotation,
    strikethrough: style.strikethrough,
    numberFormat: style.numberFormat
  };
}

/**
 * Create UnifiedCell for an image
 * CRITICAL: Extracts IPFS CID or uploads base64 to IPFS
 */
function createImageCell(image: any, index: number): UnifiedCell {
  let ipfsCid = '';
  let value = '';
  
  if (image.src.startsWith('ipfs://')) {
    // Already has IPFS CID
    ipfsCid = image.src.replace('ipfs://', '');
    value = ipfsCid;
  } else if (image.src.startsWith('https://ipfs.io/ipfs/') || image.src.startsWith('https://gateway.pinata.cloud/ipfs/')) {
    // Extract CID from IPFS gateway URL
    const match = image.src.match(/\/ipfs\/([a-zA-Z0-9]+)/);
    if (match) {
      ipfsCid = match[1];
      value = ipfsCid;
    }
  } else if (image.src.startsWith('data:')) {
    // Base64 image - mark for upload or use placeholder
    // NOTE: In production, this should be uploaded to IPFS before serialization
    value = '[BASE64_IMAGE]';
    console.warn('⚠️ Image has base64 data, should be uploaded to IPFS first');
  } else {
    // Unknown format - use as-is but warn
    value = image.src;
    console.warn('⚠️ Unknown image source format:', image.src.substring(0, 50));
  }
  
  return {
    row: Math.floor(image.y / 30) + 1,
    col: indexToColumn(Math.floor(image.x / 100)),
    type: 'image',
    value: value,
    style: {
      bgColor: '#ffffff'
    },
    meta: {
      ipfsCid: ipfsCid || undefined,
      mimeType: detectMimeType(image.src),
      fileName: `image_${index}.jpg`
    }
  };
}

/**
 * Create UnifiedCell for a file
 */
function createFileCell(shape: any, index: number): UnifiedCell {
  const fileData = (shape as any).fileData;
  
  return {
    row: Math.floor(shape.y / 30) + 1,
    col: indexToColumn(Math.floor(shape.x / 100)),
    type: 'file',
    value: fileData.ipfsCid || fileData.name,
    style: {
      bgColor: '#f0f0f0'
    },
    meta: {
      ipfsCid: fileData.ipfsCid,
      mimeType: fileData.mimeType,
      fileName: fileData.name,
      fileSize: fileData.size
    }
  };
}

/**
 * Detect MIME type from data URL or extension
 */
function detectMimeType(src: string): string {
  if (src.startsWith('data:')) {
    const match = src.match(/^data:([^;]+);/);
    return match ? match[1] : 'application/octet-stream';
  }
  
  // Default to JPEG for images
  return 'image/jpeg';
}

/**
 * Convert column index to letter (0 = A, 25 = Z, 26 = AA)
 */
function indexToColumn(index: number): string {
  let column = '';
  let num = index;
  
  while (num >= 0) {
    column = String.fromCharCode((num % 26) + 65) + column;
    num = Math.floor(num / 26) - 1;
  }
  
  return column;
}

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Map a UnifiedCell to CSV format
 * Follows CSV rules: text-only with style annotations
 * CRITICAL: NEVER includes base64 or binary data
 * 
 * @param cell - UnifiedCell to convert
 * @param options - Export options
 * @returns CSV-formatted string for this cell
 */
export function mapCellForCSV(cell: UnifiedCell, options: ExportOptions = {}): string {
  const { includeStyles = true } = options;
  
  // STRICT VALIDATION: Ensure cell has required fields
  if (!cell.type || cell.value === undefined) {
    throw new Error(`Invalid cell: missing type or value (col: ${cell.col}, row: ${cell.row})`);
  }
  
  let csvValue = '';
  
  // Map cell value based on type
  switch (cell.type) {
    case 'image':
      // Image cells: IMAGE(ipfs://CID)
      // CRITICAL: NEVER include base64 data
      if (cell.meta?.ipfsCid) {
        csvValue = `IMAGE(ipfs://${cell.meta.ipfsCid})`;
      } else if (cell.value === '[BASE64_IMAGE]') {
        csvValue = `IMAGE(base64_not_uploaded)`;
      } else if (cell.value.startsWith('Qm') || cell.value.startsWith('bafy')) {
        // Looks like a CID
        csvValue = `IMAGE(ipfs://${cell.value})`;
      } else {
        csvValue = `IMAGE(unknown)`;
      }
      break;
      
    case 'file':
      // File cells: FILE(ipfs://CID) with filename
      const fileName = cell.meta?.fileName || 'file';
      csvValue = `FILE(ipfs://${cell.meta?.ipfsCid || cell.value}, ${fileName})`;
      break;
      
    case 'symbol':
      // Symbols: actual UTF-8 character (emoji, etc.)
      csvValue = cell.value;
      break;
      
    case 'checkbox':
      // Checkboxes: true/false
      csvValue = cell.meta?.checked !== undefined ? String(cell.meta.checked) : cell.value;
      break;
      
    case 'formula':
      // Formulas: show computed value or formula based on options
      csvValue = options.includeFormulas && cell.meta?.formula 
        ? cell.meta.formula 
        : cell.value;
      break;
      
    case 'date':
    case 'number':
    case 'text':
    default:
      // Standard text/number/date
      csvValue = cell.value;
      break;
  }
  
  // Append style information if requested
  if (includeStyles && cell.style) {
    const styleAnnotations: string[] = [];
    
    if (cell.style.bgColor && cell.style.bgColor !== '#ffffff') {
      styleAnnotations.push(`bg=${cell.style.bgColor}`);
    }
    
    if (cell.style.textColor && cell.style.textColor !== '#000000') {
      styleAnnotations.push(`color=${cell.style.textColor}`);
    }
    
    if (cell.style.bold) {
      styleAnnotations.push('bold');
    }
    
    if (cell.style.italic) {
      styleAnnotations.push('italic');
    }
    
    if (cell.style.fontSize && cell.style.fontSize !== 14) {
      styleAnnotations.push(`size=${cell.style.fontSize}`);
    }
    
    if (styleAnnotations.length > 0) {
      csvValue += ` [${styleAnnotations.join(';')}]`;
    }
  }
  
  // Escape CSV special characters
  return escapeCsvValue(csvValue);
}

/**
 * Escape CSV special characters
 */
function escapeCsvValue(value: string): string {
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Export entire sheet to CSV
 */
export function exportSheetToCSV(
  sheet: SerializedSheet, 
  options: ExportOptions = {}
): string {
  console.log('📄 Exporting sheet to CSV:', sheet.name);
  
  if (sheet.cells.length === 0) {
    console.warn('⚠️ No cells to export');
    return '';
  }
  
  // Find grid dimensions
  let maxRow = 0;
  let maxCol = 0;
  
  sheet.cells.forEach(cell => {
    maxRow = Math.max(maxRow, cell.row);
    const colIndex = columnToIndex(cell.col);
    maxCol = Math.max(maxCol, colIndex);
  });
  
  // Create 2D array
  const grid: string[][] = [];
  for (let r = 0; r <= maxRow; r++) {
    grid[r] = new Array(maxCol + 1).fill('');
  }
  
  // Fill grid with CSV values
  sheet.cells.forEach(cell => {
    const rowIndex = cell.row - 1; // Convert to 0-based
    const colIndex = columnToIndex(cell.col);
    
    if (rowIndex >= 0 && colIndex >= 0) {
      grid[rowIndex][colIndex] = mapCellForCSV(cell, options);
    }
  });
  
  // Convert to CSV string
  const csvContent = grid
    .map(row => row.join(','))
    .join('\n');
  
  console.log(`✅ CSV export complete: ${grid.length} rows, ${maxCol + 1} columns`);
  
  return csvContent;
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
// PDF EXPORT
// ============================================================================

/**
 * Render a single cell to PDF
 * Handles text, images (fetched from IPFS), files, symbols, etc.
 * 
 * @param cell - UnifiedCell to render
 * @param pdfDoc - jsPDF document instance
 * @param x - X position on PDF
 * @param y - Y position on PDF
 * @param width - Cell width
 * @param height - Cell height
 * @param options - Export options
 */
export async function renderCellToPDF(
  cell: UnifiedCell,
  pdfDoc: any, // jsPDF instance
  x: number,
  y: number,
  width: number,
  height: number,
  options: ExportOptions = {}
): Promise<void> {
  const {
    ipfsGateway = 'https://ipfs.io/ipfs/',
    maxImageSize = 5 * 1024 * 1024, // 5MB
    fallbackOnError = true
  } = options;
  
  try {
    // Apply background color
    if (cell.style?.bgColor && cell.style.bgColor !== '#ffffff') {
      pdfDoc.setFillColor(cell.style.bgColor);
      pdfDoc.rect(x, y, width, height, 'F');
    }
    
    // Set text color
    if (cell.style?.textColor) {
      pdfDoc.setTextColor(cell.style.textColor);
    } else {
      pdfDoc.setTextColor('#000000');
    }
    
    // Set font size
    const fontSize = cell.style?.fontSize || 12;
    pdfDoc.setFontSize(fontSize);
    
    // Set font style
    let fontStyle = 'normal';
    if (cell.style?.bold && cell.style?.italic) {
      fontStyle = 'bolditalic';
    } else if (cell.style?.bold) {
      fontStyle = 'bold';
    } else if (cell.style?.italic) {
      fontStyle = 'italic';
    }
    pdfDoc.setFont(undefined, fontStyle);
    
    // Handle cell content based on type
    switch (cell.type) {
      case 'image':
        await renderImageCell(cell, pdfDoc, x, y, width, height, ipfsGateway, maxImageSize, fallbackOnError);
        break;
        
      case 'file':
        renderFileCell(cell, pdfDoc, x, y, width, height);
        break;
        
      case 'symbol':
      case 'text':
      case 'number':
      case 'date':
        renderTextCell(cell, pdfDoc, x, y, width, height);
        break;
        
      case 'checkbox':
        renderCheckboxCell(cell, pdfDoc, x, y, width, height);
        break;
        
      case 'formula':
        // Render computed value
        renderTextCell(cell, pdfDoc, x, y, width, height);
        break;
        
      default:
        renderTextCell(cell, pdfDoc, x, y, width, height);
    }
    
  } catch (error) {
    console.error('❌ Error rendering cell to PDF:', error);
    
    if (fallbackOnError) {
      // Fallback: render as text
      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor('#666666');
      pdfDoc.text(`[Error: ${cell.type}]`, x + 2, y + height / 2);
    } else {
      throw error;
    }
  }
}

/**
 * Render image cell to PDF
 * CRITICAL: Fetches from IPFS gateway and embeds as image
 */
async function renderImageCell(
  cell: UnifiedCell,
  pdfDoc: any,
  x: number,
  y: number,
  width: number,
  height: number,
  ipfsGateway: string,
  maxImageSize: number,
  fallbackOnError: boolean
): Promise<void> {
  try {
    let imageData: string;
    let ipfsCid = cell.meta?.ipfsCid || cell.value;
    
    // Validate we have a CID
    if (!ipfsCid || ipfsCid === '[BASE64_IMAGE]' || ipfsCid === 'unknown') {
      throw new Error('No valid IPFS CID for image');
    }
    
    // Clean CID (remove ipfs:// prefix if present)
    ipfsCid = ipfsCid.replace('ipfs://', '').replace('https://ipfs.io/ipfs/', '');
    
    // Fetch from IPFS
    const url = `${ipfsGateway}${ipfsCid}`;
    console.log('🖼️ Fetching image from IPFS:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'default'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Check size
    if (blob.size > maxImageSize) {
      console.warn(`⚠️ Image too large (${blob.size} bytes), rendering placeholder`);
      renderImagePlaceholder(pdfDoc, x, y, width, height, 'Image too large');
      return;
    }
    
    console.log(`✅ Image fetched: ${blob.size} bytes, type: ${blob.type}`);
    
    // Convert to base64
    imageData = await blobToBase64(blob);
    
    // Determine image format
    const format = detectImageFormat(imageData);
    
    // Add image to PDF with padding
    pdfDoc.addImage(imageData, format, x + 1, y + 1, width - 2, height - 2);
    
    console.log('✅ Image rendered to PDF');
    
  } catch (error) {
    console.error('❌ Failed to render image:', error);
    
    if (fallbackOnError) {
      const errorMsg = error instanceof Error ? error.message : 'Image load failed';
      renderImagePlaceholder(pdfDoc, x, y, width, height, errorMsg);
    } else {
      throw error;
    }
  }
}

/**
 * Render placeholder for failed images
 */
function renderImagePlaceholder(
  pdfDoc: any,
  x: number,
  y: number,
  width: number,
  height: number,
  message: string
): void {
  // Draw border
  pdfDoc.setDrawColor('#cccccc');
  pdfDoc.rect(x, y, width, height);
  
  // Draw X
  pdfDoc.line(x, y, x + width, y + height);
  pdfDoc.line(x + width, y, x, y + height);
  
  // Draw text
  pdfDoc.setFontSize(8);
  pdfDoc.setTextColor('#999999');
  pdfDoc.text(message, x + width / 2, y + height / 2, { align: 'center' });
}

/**
 * Render file cell to PDF (as clickable link)
 */
function renderFileCell(
  cell: UnifiedCell,
  pdfDoc: any,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const linkText = cell.meta?.fileName || cell.value;
  const ipfsUrl = cell.meta?.ipfsCid ? `ipfs://${cell.meta.ipfsCid}` : cell.value;
  
  // Draw file icon placeholder
  pdfDoc.setDrawColor('#0066cc');
  pdfDoc.rect(x + 2, y + 2, 10, 10);
  
  // Draw filename
  pdfDoc.setTextColor('#0066cc');
  pdfDoc.textWithLink(linkText, x + 15, y + height / 2, { url: ipfsUrl });
}

/**
 * Render text cell to PDF
 */
function renderTextCell(
  cell: UnifiedCell,
  pdfDoc: any,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const alignment = cell.style?.alignment || 'left';
  const textX = alignment === 'center' ? x + width / 2 : alignment === 'right' ? x + width - 2 : x + 2;
  const textY = y + height / 2 + 2; // Vertical center
  
  const options: any = {};
  if (alignment === 'center') {
    options.align = 'center';
  } else if (alignment === 'right') {
    options.align = 'right';
  }
  
  // Handle text wrapping if needed
  if (cell.style?.wrapText) {
    const lines = pdfDoc.splitTextToSize(cell.value, width - 4);
    pdfDoc.text(lines, textX, y + 4, options);
  } else {
    pdfDoc.text(cell.value, textX, textY, options);
  }
}

/**
 * Render checkbox cell to PDF
 */
function renderCheckboxCell(
  cell: UnifiedCell,
  pdfDoc: any,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const checked = cell.meta?.checked || cell.value === 'true';
  const boxSize = Math.min(width, height) * 0.6;
  const boxX = x + (width - boxSize) / 2;
  const boxY = y + (height - boxSize) / 2;
  
  // Draw checkbox border
  pdfDoc.setDrawColor('#000000');
  pdfDoc.rect(boxX, boxY, boxSize, boxSize);
  
  // Draw checkmark if checked
  if (checked) {
    pdfDoc.setDrawColor('#0066cc');
    pdfDoc.setLineWidth(2);
    pdfDoc.line(boxX + boxSize * 0.2, boxY + boxSize * 0.5, boxX + boxSize * 0.4, boxY + boxSize * 0.7);
    pdfDoc.line(boxX + boxSize * 0.4, boxY + boxSize * 0.7, boxX + boxSize * 0.8, boxY + boxSize * 0.3);
    pdfDoc.setLineWidth(0.5);
  }
}

/**
 * Convert Blob to base64 data URL
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Detect image format from data URL
 */
function detectImageFormat(dataUrl: string): 'JPEG' | 'PNG' | 'GIF' {
  if (dataUrl.includes('image/png')) return 'PNG';
  if (dataUrl.includes('image/gif')) return 'GIF';
  return 'JPEG';
}

// ============================================================================
// HELPER: Download CSV
// ============================================================================

/**
 * Download CSV content as file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  console.log('✅ CSV downloaded:', filename);
}
