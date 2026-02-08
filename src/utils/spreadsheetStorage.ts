// Spreadsheet Storage Utility for managing user spreadsheets

export interface SpreadsheetData {
  id: string;
  title: string;
  userEmail: string;
  cellData: Record<string, any>;
  cellFormats?: Record<string, any>;
  ipfsHash?: string; // IPFS hash for decentralized storage
  lastModified: string;
  created: string;
}

const STORAGE_KEY_PREFIX = 'spreadsheet_';
const RECENT_SHEETS_KEY = 'recent_sheets_';

/**
 * Generate a unique ID for a spreadsheet
 */
export function generateSpreadsheetId(): string {
  return `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save a spreadsheet to localStorage
 */
export function saveSpreadsheet(
  spreadsheetData: Omit<SpreadsheetData, 'lastModified'>,
): SpreadsheetData {
  const data: SpreadsheetData = {
    ...spreadsheetData,
    lastModified: new Date().toISOString(),
  };

  // Save the spreadsheet
  localStorage.setItem(
    `${STORAGE_KEY_PREFIX}${data.id}`,
    JSON.stringify(data)
  );

  // Update recent sheets list
  updateRecentSheets(data.userEmail, data.id);

  return data;
}

/**
 * Load a spreadsheet from localStorage
 */
export function loadSpreadsheet(id: string): SpreadsheetData | null {
  const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse spreadsheet data:', error);
    return null;
  }
}

/**
 * Get all recent sheets for a user
 */
export function getRecentSheets(userEmail: string): SpreadsheetData[] {
  const recentIds = getRecentSheetIds(userEmail);
  const sheets: SpreadsheetData[] = [];

  for (const id of recentIds) {
    const sheet = loadSpreadsheet(id);
    if (sheet) {
      sheets.push(sheet);
    }
  }

  // Sort by last modified (most recent first)
  return sheets.sort(
    (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
}

/**
 * Get recent sheet IDs for a user
 */
function getRecentSheetIds(userEmail: string): string[] {
  const data = localStorage.getItem(`${RECENT_SHEETS_KEY}${userEmail}`);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

/**
 * Update the recent sheets list for a user
 */
function updateRecentSheets(userEmail: string, sheetId: string): void {
  let recentIds = getRecentSheetIds(userEmail);
  
  // Remove the sheet if it already exists
  recentIds = recentIds.filter(id => id !== sheetId);
  
  // Add to the beginning
  recentIds.unshift(sheetId);
  
  localStorage.setItem(
    `${RECENT_SHEETS_KEY}${userEmail}`,
    JSON.stringify(recentIds)
  );
}

/**
 * Record when a sheet was reopened (viewed from dashboard)
 */
export function markSheetReopened(userEmail: string, sheetId: string): void {
  try {
    const key = `${RECENT_SHEETS_KEY}${userEmail}:meta`;
    const raw = localStorage.getItem(key);
    const meta = raw ? JSON.parse(raw) : {};
    meta[sheetId] = {
      ...(meta[sheetId] || {}),
      lastOpenedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(meta));
  } catch {
    // noop
  }
}

/**
 * Get recent sheet metadata including lastOpenedAt and lastEdited info
 */
export function getRecentSheetsWithMeta(userEmail: string): Array<SpreadsheetData & { lastOpenedAt?: string; wasReopened?: boolean; wasEdited?: boolean; }>{
  const sheets = getRecentSheets(userEmail);
  const key = `${RECENT_SHEETS_KEY}${userEmail}:meta`;
  let meta: Record<string, any> = {};
  try {
    const raw = localStorage.getItem(key);
    meta = raw ? JSON.parse(raw) : {};
  } catch {
    meta = {};
  }

  return sheets.map(s => {
    const m = meta[s.id] || {};
    const lastOpenedAt: string | undefined = m.lastOpenedAt;
    const wasReopened = !!lastOpenedAt;
    // Only show "Edited" if lastModified is AFTER lastOpenedAt (with 2 second grace period for autosave)
    // This ensures we don't show "Edited" for sheets that were just opened and autosaved without changes
    const wasEdited = !!(lastOpenedAt && s.lastModified && 
      (new Date(s.lastModified).getTime() - new Date(lastOpenedAt).getTime()) > 2000);
    return { ...s, lastOpenedAt, wasReopened, wasEdited };
  });
}

/**
 * Delete a spreadsheet
 */
export function deleteSpreadsheet(id: string, userEmail: string): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
  
  // Remove from recent sheets
  let recentIds = getRecentSheetIds(userEmail);
  recentIds = recentIds.filter(sheetId => sheetId !== id);
  localStorage.setItem(
    `${RECENT_SHEETS_KEY}${userEmail}`,
    JSON.stringify(recentIds)
  );
}

/**
 * Get the last active spreadsheet for a user (for auto-restore)
 */
export function getLastActiveSpreadsheet(userEmail: string): SpreadsheetData | null {
  const recentSheets = getRecentSheets(userEmail);
  return recentSheets.length > 0 ? recentSheets[0] : null;
}

/**
 * Clear any cached data for a new blank spreadsheet
 */
export function clearNewSpreadsheetCache(id: string): void {
  // Remove any existing cache for this ID
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
}

/**
 * Deep equality check for objects (order-independent)
 */
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();
  
  if (keys1.length !== keys2.length) return false;
  if (keys1.join(',') !== keys2.join(',')) return false;
  
  for (const key of keys1) {
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

/**
 * Auto-save current spreadsheet (called periodically)
 * Skip saving if the sheet is completely empty (new blank sheet)
 * Only updates lastModified if data has actually changed
 */
export function autoSaveSpreadsheet(
  id: string,
  title: string,
  userEmail: string,
  cellData: Record<string, any>,
  cellFormats?: Record<string, any>,
  ipfsHash?: string
): void {
  // Don't save completely empty sheets titled "Untitled"
  const hasData = cellData && Object.keys(cellData).length > 0;
  const hasFormats = cellFormats && Object.keys(cellFormats).length > 0;
  
  if (!hasData && !hasFormats && title === "Untitled") {
    // This is a new blank sheet, don't save yet
    return;
  }
  
  const existing = loadSpreadsheet(id);
  
  // Check if data has actually changed to avoid unnecessary lastModified updates
  // Use deep comparison that's order-independent
  const cellDataChanged = !deepEqual(existing?.cellData || {}, cellData || {});
  const cellFormatsChanged = !deepEqual(existing?.cellFormats || {}, cellFormats || {});
  const titleChanged = existing?.title !== title;
  const dataChanged = !existing || cellDataChanged || cellFormatsChanged || titleChanged;
  
  const data: Omit<SpreadsheetData, 'lastModified'> = {
    id,
    title,
    userEmail,
    cellData: cellData || {},
    cellFormats: cellFormats || {},
    ipfsHash: ipfsHash || existing?.ipfsHash, // Keep existing IPFS hash if new one not provided
    created: existing?.created || new Date().toISOString(),
  };

  // Only save if data changed OR if this is a new sheet
  if (dataChanged) {
    console.log(`📝 Data changed for sheet ${id}, updating lastModified`);
    saveSpreadsheet(data);
  } else {
    // Data unchanged - just update in storage without changing lastModified
    if (existing) {
      // No changes detected, preserving lastModified (silent)
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${id}`,
        JSON.stringify({ ...data, lastModified: existing.lastModified })
      );
    }
  }
}

/**
 * Format date for display
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
