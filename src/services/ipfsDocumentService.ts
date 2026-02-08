/**
 * IPFS DOCUMENT SERVICE
 * Handles uploading and downloading complete DocumentState JSON to/from IPFS.
 * This replaces the old text-only storage approach.
 */

import { DocumentState } from '../types/documentState';
import { config } from '../config/index';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const IPFS_API_URL = import.meta.env.VITE_IPFS_API_URL || 'http://localhost:5001/api/v0';

// Backend API endpoint - Use centralized config for consistency
const getBackendUrl = () => config.api.baseUrl;

const BACKEND_API_URL = getBackendUrl();

/**
 * Upload complete DocumentState to IPFS
 * @param documentState The complete document state
 * @returns IPFS CID of the uploaded document
 */
export async function uploadDocumentToIPFS(documentState: DocumentState): Promise<string> {
  try {
    console.log('📤 Uploading document to IPFS...', {
      documentId: documentState.documentId,
      sheets: documentState.sheets.length,
      cellCount: documentState.sheets.reduce((sum, sheet) => sum + Object.keys(sheet.cells).length, 0),
    });

    // Serialize the entire document state to JSON
    const documentJSON = JSON.stringify(documentState, null, 2);
    const documentBlob = new Blob([documentJSON], { type: 'application/json' });

    // Create form data for IPFS upload
    const formData = new FormData();
    formData.append('file', documentBlob, `document-${documentState.documentId}.json`);

    // Upload to IPFS via backend
    const response = await fetch(`${BACKEND_API_URL}/api/ipfs/upload-document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`IPFS upload failed: ${error}`);
    }

    const result = await response.json();
    const cid = result.cid || result.hash;

    console.log('✅ Document uploaded to IPFS:', cid);
    console.log(`   View at: ${IPFS_GATEWAY}${cid}`);

    // Store the mapping in backend
    await storeDocumentMapping(documentState.documentId, cid, documentState.metadata.owner);

    return cid;
  } catch (error) {
    console.error('❌ Failed to upload document to IPFS:', error);
    throw error;
  }
}

/**
 * Load complete DocumentState from IPFS
 * @param cid IPFS CID of the document
 * @returns Complete DocumentState
 */
export async function loadDocumentFromIPFS(cid: string): Promise<DocumentState> {
  try {
    console.log('📥 Loading document from IPFS:', cid);

    // Fetch from IPFS via backend (handles pinning and caching)
    const response = await fetch(`${BACKEND_API_URL}/api/ipfs/get-document/${cid}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch document from IPFS: ${response.statusText}`);
    }

    const documentState: DocumentState = await response.json();

    console.log('✅ Document loaded from IPFS:', {
      documentId: documentState.documentId,
      title: documentState.metadata.title,
      sheets: documentState.sheets.length,
      cellCount: documentState.sheets.reduce((sum, sheet) => sum + Object.keys(sheet.cells).length, 0),
      images: documentState.sheets.reduce((sum, sheet) => sum + sheet.images.length, 0),
      shapes: documentState.sheets.reduce((sum, sheet) => sum + sheet.shapes.length, 0),
      charts: documentState.sheets.reduce((sum, sheet) => sum + sheet.charts.length, 0),
    });

    return documentState;
  } catch (error) {
    console.error('❌ Failed to load document from IPFS:', error);
    throw error;
  }
}

/**
 * Store document ID to CID mapping in backend
 */
async function storeDocumentMapping(documentId: string, cid: string, owner: string): Promise<void> {
  try {
    await fetch(`${BACKEND_API_URL}/api/documents/mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        cid,
        owner,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Warning: Failed to store document mapping:', error);
    // Non-critical error - don't throw
  }
}

/**
 * Get latest CID for a document ID
 */
export async function getLatestCID(documentId: string): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/documents/latest-cid/${documentId}`);
    
    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.cid;
  } catch (error) {
    console.error('Failed to get latest CID:', error);
    return null;
  }
}

/**
 * Get version history for a document
 */
export async function getDocumentHistory(documentId: string): Promise<Array<{ cid: string; timestamp: string; author: string }>> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/documents/history/${documentId}`);
    
    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.history || [];
  } catch (error) {
    console.error('Failed to get document history:', error);
    return [];
  }
}

/**
 * Validate DocumentState schema
 */
export function validateDocumentState(data: any): data is DocumentState {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check required top-level fields
  if (!data.documentId || !data.metadata || !Array.isArray(data.sheets) || !data.activeSheetId) {
    return false;
  }

  // Check metadata
  const meta = data.metadata;
  if (!meta.documentId || !meta.title || !meta.owner || !meta.createdAt || !meta.updatedAt) {
    return false;
  }

  // Check sheets
  for (const sheet of data.sheets) {
    if (!sheet.sheetId || !sheet.name || !sheet.grid || !sheet.cells) {
      return false;
    }
    
    // Grid validation
    if (typeof sheet.grid.rows !== 'number' || typeof sheet.grid.columns !== 'number') {
      return false;
    }
    
    // Cells should be an object
    if (typeof sheet.cells !== 'object') {
      return false;
    }
  }

  return true;
}

/**
 * Calculate document size in bytes
 */
export function getDocumentSize(documentState: DocumentState): number {
  const json = JSON.stringify(documentState);
  return new Blob([json]).size;
}

/**
 * Export document as downloadable JSON file
 */
export function downloadDocumentJSON(documentState: DocumentState): void {
  const json = JSON.stringify(documentState, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${documentState.metadata.title}-${documentState.documentId}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Import document from JSON file
 */
export async function importDocumentJSON(file: File): Promise<DocumentState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);
        
        if (!validateDocumentState(data)) {
          throw new Error('Invalid document format');
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
