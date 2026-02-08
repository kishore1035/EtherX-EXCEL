/**
 * DOCUMENT STATE SAVE SERVICE
 * Single source of truth for all save/load operations.
 * NOTHING is saved unless it exists in documentState.
 */

import { DocumentState } from '../types/documentState';
import { uploadDocumentToIPFS, loadDocumentFromIPFS } from './ipfsDocumentService';
import { config } from '../config/index';

// Use centralized config for API URL consistency
const BACKEND_API_URL = config.api.baseUrl;

/**
 * Save complete documentState to backend and IPFS
 * This is the ONLY save function - use this for ALL saves
 */
export async function saveDocumentState(documentState: DocumentState): Promise<{ success: boolean; cid: string; error?: string }> {
  try {
    // VERIFICATION LOGGING - Confirm all data is present
    logDocumentContents(documentState);
    
    // CRITICAL CHECK - Verify complete state
    const hasCompleteState = checkDocumentCompleteness(documentState);
    if (!hasCompleteState.isComplete) {
      console.warn('⚠️ INCOMPLETE DOCUMENT STATE:', hasCompleteState.missing);
    }
    
    // Log full JSON (first 1000 chars for debugging)
    const fullJSON = JSON.stringify(documentState);
    console.log('📄 Full Document JSON (preview):', fullJSON.substring(0, 1000) + '...');
    console.log('📏 Total Size:', (fullJSON.length / 1024).toFixed(2), 'KB');
    
    // Update timestamp
    documentState.metadata.updatedAt = new Date().toISOString();
    
    // Upload to IPFS
    console.log('📤 Uploading complete documentState to IPFS...');
    const cid = await uploadDocumentToIPFS(documentState);
    
    console.log('✅ SAVE COMPLETE');
    console.log('   CID:', cid);
    console.log('   View at: https://ipfs.io/ipfs/' + cid);
    
    return {
      success: true,
      cid
    };
    
  } catch (error: any) {
    console.error('❌ SAVE FAILED:', error);
    return {
      success: false,
      cid: '',
      error: error.message || 'Unknown error'
    };
  }
}

// Alias for compatibility
export const saveDocumentStateToIPFS = saveDocumentState;

/**
 * Detailed logging of document contents for verification
 */
export function logDocumentContents(documentState: DocumentState): void {
  console.log('📊 SAVE PIPELINE - Document State Preview:');
  console.log('  Document ID:', documentState.documentId);
  console.log('  Title:', documentState.metadata.title);
  console.log('  Sheets:', documentState.sheets.length);
  console.log('  Total Cells:', documentState.sheets.reduce((sum, sheet) => sum + Object.keys(sheet.cells).length, 0));
  console.log('  Total Images:', documentState.sheets.reduce((sum, sheet) => sum + sheet.images.length, 0));
  console.log('  Total Shapes:', documentState.sheets.reduce((sum, sheet) => sum + sheet.shapes.length, 0));
  console.log('  Total Charts:', documentState.sheets.reduce((sum, sheet) => sum + sheet.charts.length, 0));
  console.log('  Conditional Formats:', documentState.sheets.reduce((sum, sheet) => sum + sheet.conditionalFormatting.length, 0));
}

/**
 * Load complete documentState from IPFS
 */
export async function loadDocumentState(cid: string): Promise<{ success: boolean; documentState?: DocumentState; error?: string }> {
  try {
    console.log('📥 Loading documentState from IPFS:', cid);
    
    const documentState = await loadDocumentFromIPFS(cid);
    
    // Verification logging
    console.log('✅ LOAD COMPLETE');
    console.log('  Document ID:', documentState.documentId);
    console.log('  Title:', documentState.metadata.title);
    console.log('  Sheets:', documentState.sheets.length);
    console.log('  Cells:', documentState.sheets.reduce((sum, sheet) => sum + Object.keys(sheet.cells).length, 0));
    console.log('  Images:', documentState.sheets.reduce((sum, sheet) => sum + sheet.images.length, 0));
    console.log('  Shapes:', documentState.sheets.reduce((sum, sheet) => sum + sheet.shapes.length, 0));
    console.log('  Charts:', documentState.sheets.reduce((sum, sheet) => sum + sheet.charts.length, 0));
    
    return {
      success: true,
      documentState
    };
    
  } catch (error: any) {
    console.error('❌ LOAD FAILED:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

// Alias for compatibility
export const loadDocumentStateFromIPFS = loadDocumentState;

/**
 * Check if documentState is complete
 * Returns what's missing if incomplete
 */
function checkDocumentCompleteness(documentState: DocumentState): { isComplete: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!documentState.documentId) missing.push('documentId');
  if (!documentState.metadata) missing.push('metadata');
  if (!documentState.sheets || documentState.sheets.length === 0) missing.push('sheets');
  if (!documentState.activeSheetId) missing.push('activeSheetId');
  
  // Check each sheet has required structure
  documentState.sheets.forEach((sheet, index) => {
    if (!sheet.sheetId) missing.push(`sheet[${index}].sheetId`);
    if (!sheet.name) missing.push(`sheet[${index}].name`);
    if (!sheet.grid) missing.push(`sheet[${index}].grid`);
    if (!sheet.cells) missing.push(`sheet[${index}].cells`);
    if (!sheet.images) missing.push(`sheet[${index}].images`);
    if (!sheet.shapes) missing.push(`sheet[${index}].shapes`);
    if (!sheet.charts) missing.push(`sheet[${index}].charts`);
  });
  
  return {
    isComplete: missing.length === 0,
    missing
  };
}

/**
 * Export documentState as downloadable JSON file
 */
export function downloadDocumentStateJSON(documentState: DocumentState): void {
  const json = JSON.stringify(documentState, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${documentState.metadata.title}-${documentState.documentId}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  
  console.log('📥 Document downloaded as JSON');
}

/**
 * Get latest auto-save from localStorage
 */
export function getAutoSaveState(): DocumentState | null {
  try {
    const saved = localStorage.getItem('autoSave_documentState');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load auto-save:', error);
  }
  return null;
}

/**
 * Auto-save to localStorage (backup)
 */
export function autoSaveDocumentState(documentState: DocumentState): void {
  try {
    localStorage.setItem('autoSave_documentState', JSON.stringify(documentState));
    localStorage.setItem('autoSave_timestamp', new Date().toISOString());
    console.log('💾 Auto-saved to localStorage');
  } catch (error) {
    console.error('Auto-save to localStorage failed:', error);
  }
}
