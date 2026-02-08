/**
 * UNIFIED CELL SCHEMA
 * Standard cell format for EtherX Excel with content + styling support
 */

export type UnifiedCellType = 
  | 'text' 
  | 'number' 
  | 'image' 
  | 'file' 
  | 'checkbox' 
  | 'date' 
  | 'formula' 
  | 'symbol';

export interface UnifiedCellStyle {
  bgColor?: string;      // Background color (hex, e.g., "#ffffff")
  textColor?: string;    // Text color (hex, e.g., "#000000")
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;     // Font size in points
  fontFamily?: string;   // Font family
  alignment?: 'left' | 'center' | 'right' | 'justify';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  wrapText?: boolean;
  rotation?: number;
  strikethrough?: boolean;
  numberFormat?: string; // e.g., "0.00", "$#,##0.00"
}

export interface UnifiedCell {
  row: number;
  col: string;           // Column letter(s), e.g., "A", "AA"
  type: UnifiedCellType;
  value: string;         // Primary value (text, number as string, IPFS CID for images/files)
  style?: UnifiedCellStyle;
  meta?: {
    // Image/File metadata
    ipfsCid?: string;    // IPFS content identifier
    mimeType?: string;   // e.g., "image/jpeg", "application/pdf"
    fileName?: string;   // Original filename for files
    fileSize?: number;   // Size in bytes
    
    // Formula metadata
    formula?: string;    // Formula string (with = prefix)
    
    // Checkbox metadata
    checked?: boolean;   // For checkbox type
    
    // Symbol metadata
    symbolCode?: string; // Unicode code point
    
    // General metadata
    comment?: string;
    author?: string;
    timestamp?: string;  // ISO 8601
    hyperlink?: string;  // URL
    locked?: boolean;    // Cell protection
    validation?: any;    // Data validation rules
    
    // Merge information
    mergedWith?: string; // Cell key this is merged into
    isMergeParent?: boolean;
    mergeSpan?: { rows: number; cols: number };
  };
}

export interface ExportOptions {
  includeStyles?: boolean;      // Include styling in exports
  includeFormulas?: boolean;    // Include formulas or computed values
  ipfsGateway?: string;         // IPFS gateway URL for image fetching
  maxImageSize?: number;        // Max image size in bytes for PDF embedding
  fallbackOnError?: boolean;    // Gracefully handle errors
  compression?: boolean;        // Compress output where possible
}

export interface SerializedSheet {
  sheetId: string;
  name: string;
  cells: UnifiedCell[];
  metadata?: {
    rowCount?: number;
    colCount?: number;
    createdAt?: string;
    updatedAt?: string;
    frozen?: {
      rows?: number;
      columns?: number;
    };
    zoom?: number;
  };
}
