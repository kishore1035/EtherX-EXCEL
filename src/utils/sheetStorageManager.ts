/**
 * Sheet Storage Manager
 * 
 * Manages per-sheet autosave data with unique storage keys.
 * Prevents data from bleeding across different sheets.
 * Each sheet uses format: 'sheets:data:{uuid}'
 */

// Storage key prefix as specified: 'sheets:data:'
const STORAGE_PREFIX = 'sheets:data:';

export interface SheetStorageKeys {
  hash: string;
  data: string;
  timestamp: string;
}

/**
 * Generate a unique UUID v4 for new sheets
 */
export function generateSheetUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get storage keys for a specific sheet
 * Format: 'sheets:data:{uuid}', 'sheets:hash:{uuid}', 'sheets:timestamp:{uuid}'
 */
export function getSheetStorageKeys(sheetId: string): SheetStorageKeys {
  return {
    hash: `sheets:hash:${sheetId}`,
    data: `${STORAGE_PREFIX}${sheetId}`, // Main data key: 'sheets:data:{uuid}'
    timestamp: `sheets:timestamp:${sheetId}`,
  };
}

/**
 * Save sheet data to localStorage with debounce support
 * Always writes to activeSheetId key only - no global 'autosave' key
 */
export function saveSheetData(sheetId: string, cellData: Record<string, any>, hash?: string): void {
  const keys = getSheetStorageKeys(sheetId);
  const timestamp = new Date().toISOString();
  
  try {
    // Write data to sheet-specific key
    localStorage.setItem(keys.data, JSON.stringify(cellData));
    localStorage.setItem(keys.timestamp, timestamp);
    
    if (hash) {
      localStorage.setItem(keys.hash, hash);
    }
    
    console.log(`✅ Saved sheet ${sheetId} data (${Object.keys(cellData).length} cells)`);
  } catch (error) {
    console.error(`❌ Failed to save sheet ${sheetId}:`, error);
  }
}

/**
 * Initialize a new blank sheet with explicit empty data
 * Called when 'New Sheet' is created to ensure clean state
 */
export function initializeBlankSheet(sheetId: string): void {
  const keys = getSheetStorageKeys(sheetId);
  const timestamp = new Date().toISOString();
  
  try {
    // Write explicit empty object
    localStorage.setItem(keys.data, JSON.stringify({}));
    localStorage.setItem(keys.timestamp, timestamp);
    
    console.log(`🆕 Initialized blank sheet ${sheetId}`);
  } catch (error) {
    console.error(`❌ Failed to initialize sheet ${sheetId}:`, error);
  }
}

/**
 * Load sheet data from localStorage
 * Only reads from activeSheetId key - NO global autosave fallback
 */
export function loadSheetData(sheetId: string): Record<string, any> | null {
  const keys = getSheetStorageKeys(sheetId);
  
  try {
    const dataStr = localStorage.getItem(keys.data);
    if (!dataStr) {
      console.log(`ℹ️ No saved data found for sheet ${sheetId}`);
      return null; // Return null, don't fallback to any global key
    }
    
    const data = JSON.parse(dataStr);
    const timestamp = localStorage.getItem(keys.timestamp);
    console.log(`✅ Loaded sheet ${sheetId} data (${Object.keys(data).length} cells) from ${timestamp}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to load sheet ${sheetId}:`, error);
    return null;
  }
}

/**
 * Get IPFS hash for a sheet
 */
export function getSheetHash(sheetId: string): string | null {
  const keys = getSheetStorageKeys(sheetId);
  return localStorage.getItem(keys.hash);
}

/**
 * Clear all saved data for a specific sheet
 * Use when creating a new blank sheet to prevent stale data
 */
export function clearSheetStorage(sheetId: string): void {
  const keys = getSheetStorageKeys(sheetId);
  
  localStorage.removeItem(keys.hash);
  localStorage.removeItem(keys.data);
  localStorage.removeItem(keys.timestamp);
  
  console.log(`🧹 Cleared autosave cache for sheet ${sheetId}`);
}

/**
 * Check if a sheet has saved data
 */
export function hasSheetData(sheetId: string): boolean {
  const keys = getSheetStorageKeys(sheetId);
  return localStorage.getItem(keys.data) !== null;
}

/**
 * Get sheet metadata (timestamp, size, etc.)
 */
export function getSheetMetadata(sheetId: string): {
  timestamp: string | null;
  hash: string | null;
  cellCount: number;
  hasData: boolean;
} {
  const keys = getSheetStorageKeys(sheetId);
  const data = loadSheetData(sheetId);
  
  return {
    timestamp: localStorage.getItem(keys.timestamp),
    hash: localStorage.getItem(keys.hash),
    cellCount: data ? Object.keys(data).length : 0,
    hasData: data !== null && Object.keys(data).length > 0,
  };
}

/**
 * List all sheets with saved data (for debugging/admin)
 */
export function listAllSavedSheets(): string[] {
  const sheets: string[] = [];
  const prefix = STORAGE_PREFIX; // 'sheets:data:'
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const sheetId = key.substring(prefix.length);
      sheets.push(sheetId);
    }
  }
  
  return sheets;
}

/**
 * Debounced save wrapper to prevent race conditions
 * Stores pending saves and flushes after delay
 */
let saveTimeouts: Map<string, NodeJS.Timeout> = new Map();

export function debouncedSaveSheetData(
  sheetId: string,
  cellData: Record<string, any>,
  hash?: string,
  delayMs: number = 1000
): void {
  // Clear existing timeout for this sheet
  const existingTimeout = saveTimeouts.get(sheetId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  
  // Set new timeout
  const timeoutId = setTimeout(() => {
    saveSheetData(sheetId, cellData, hash);
    saveTimeouts.delete(sheetId);
  }, delayMs);
  
  saveTimeouts.set(sheetId, timeoutId);
}

/**
 * Clean up old/orphaned sheet data (optional maintenance)
 */
export function cleanupOrphanedSheetData(activeSheetIds: string[]): number {
  const allSheets = listAllSavedSheets();
  let cleaned = 0;
  
  for (const sheetId of allSheets) {
    if (!activeSheetIds.includes(sheetId)) {
      clearSheetStorage(sheetId);
      cleaned++;
    }
  }
  
  console.log(`🧹 Cleaned up ${cleaned} orphaned sheet(s)`);
  return cleaned;
}
