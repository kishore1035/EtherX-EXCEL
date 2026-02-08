/**
 * Spreadsheet Adapter Service
 * 
 * Maps backend API responses to frontend data structures.
 * This adapter ensures that even if backend response shapes differ,
 * the frontend receives consistent data.
 * 
 * TODO: Update field mappings if backend response structures change
 */

import config from '../config';

const API_BASE_URL = config.api.apiUrl;

type AnyObject = Record<string, any>;

/**
 * Get authorization header with stored token
 */
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Normalize spreadsheet response from backend
 */
export function normalizeSpreadsheet(apiData: AnyObject): AnyObject | null {
  if (!apiData) return null;

  return {
    id: apiData.id,
    name: apiData.name,
    ownerId: apiData.owner_id || apiData.ownerId,
    sheets: Array.isArray(apiData.sheets) ? apiData.sheets.map(normalizeSheet) : [],
    createdAt: apiData.created_at || apiData.createdAt,
    updatedAt: apiData.updated_at || apiData.updatedAt,
  };
}

/**
 * Normalize sheet response
 */
function normalizeSheet(apiSheet: AnyObject): AnyObject {
  return {
    id: apiSheet.id,
    name: apiSheet.name,
    color: apiSheet.color,
    cells: apiSheet.cells || {},
  };
}

/**
 * Normalize cell response
 */
function normalizeCell(apiCell: AnyObject): AnyObject {
  return {
    value: apiCell.value || '',
    formula: apiCell.formula,
    bold: apiCell.bold || false,
    italic: apiCell.italic || false,
    underline: apiCell.underline || false,
    color: apiCell.color,
    backgroundColor: apiCell.background_color || apiCell.backgroundColor,
  };
}

/**
 * Convert frontend spreadsheet to backend format
 */
export function denormalizeSpreadsheet(uiData: AnyObject): AnyObject {
  return {
    name: uiData.name,
    sheets: uiData.sheets ? uiData.sheets.map(denormalizeSheet) : [],
  };
}

function denormalizeSheet(uiSheet: AnyObject): AnyObject {
  return {
    id: uiSheet.id,
    name: uiSheet.name,
    color: uiSheet.color,
    cells: denormalizeCells(uiSheet.cells),
  };
}

function denormalizeCells(uiCells: AnyObject): AnyObject {
  const result: AnyObject = {};
  for (const [cellId, cellData] of Object.entries(uiCells || {})) {
    const cell = cellData as AnyObject;
    result[cellId] = {
      value: cell.value,
      formula: cell.formula,
      bold: cell.bold,
      italic: cell.italic,
      underline: cell.underline,
      color: cell.color,
      backgroundColor: cell.backgroundColor,
    };
  }
  return result;
}

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export async function sendOtp(emailOrPhone: string): Promise<AnyObject> {
  const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
  return data;
}

export async function verifyOtp(emailOrPhone: string, otp: string): Promise<AnyObject> {
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'OTP verification failed');
  
  // Store token
  localStorage.setItem('authToken', data.token);
  
  return data.user;
}

export async function signup(name: string, email: string, phone: string): Promise<AnyObject> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data;
}

export async function logout(): Promise<boolean> {
  try {
    const headers = getAuthHeader();
    headers['Content-Type'] = 'application/json';
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers,
    });
    
    // Clear token regardless of response
    localStorage.removeItem('authToken');
    
    return true;
  } catch (error) {
    // Clear token on error too
    localStorage.removeItem('authToken');
    return true;
  }
}

export async function getMe(): Promise<AnyObject> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get user');
  return data.user;
}

// ============================================================================
// SPREADSHEET ENDPOINTS
// ============================================================================

export async function listSpreadsheets(): Promise<AnyObject[]> {
  const res = await fetch(`${API_BASE_URL}/spreadsheets`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to list spreadsheets');
  return data.spreadsheets || [];
}

export async function createSpreadsheet(name: string): Promise<AnyObject | null> {
  const res = await fetch(`${API_BASE_URL}/spreadsheets`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create spreadsheet');
  return normalizeSpreadsheet(data.spreadsheet);
}

export async function getSpreadsheet(id: string): Promise<AnyObject | null> {
  const res = await fetch(`${API_BASE_URL}/spreadsheets/${id}`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get spreadsheet');
  return normalizeSpreadsheet(data.spreadsheet);
}

export async function updateSpreadsheet(id: string, updates: AnyObject): Promise<AnyObject> {
  const res = await fetch(`${API_BASE_URL}/spreadsheets/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(denormalizeSpreadsheet(updates)),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update spreadsheet');
  return data;
}

export async function deleteSpreadsheet(id: string): Promise<AnyObject> {
  const res = await fetch(`${API_BASE_URL}/spreadsheets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete spreadsheet');
  return data;
}

// ============================================================================
// CELL ENDPOINTS (CREATE/UPDATE ROW - CRITICAL)
// ============================================================================

/**
 * Create a new row of cells
 * CRITICAL ENDPOINT
 */
export async function createRow(
  spreadsheetId: string,
  sheetId: string,
  rowNumber: number,
  rowData: AnyObject
): Promise<AnyObject> {
  const res = await fetch(`${API_BASE_URL}/cells/rows/create`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      spreadsheetId,
      sheetId,
      rowNumber,
      rowData,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create row');
  return data;
}

/**
 * Update an existing row of cells
 * CRITICAL ENDPOINT
 */
export async function updateRow(
  spreadsheetId: string,
  sheetId: string,
  rowNumber: number,
  rowData: AnyObject
): Promise<AnyObject> {
  const res = await fetch(`${API_BASE_URL}/cells/rows/update`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      spreadsheetId,
      sheetId,
      rowNumber,
      rowData,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update row');
  return data;
}

// ============================================================================
// IMPORT/EXPORT ENDPOINTS (CRITICAL)
// ============================================================================

/**
 * Import CSV data into spreadsheet
 * CRITICAL ENDPOINT
 */
export async function importData(
  spreadsheetId: string,
  sheetId: string,
  data: string,
  format: string = 'csv'
): Promise<AnyObject> {
  const res = await fetch(`${API_BASE_URL}/import-export/import`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      spreadsheetId,
      sheetId,
      data,
      format,
    }),
  });
  const apiData = await res.json();
  if (!res.ok) throw new Error(apiData.error || 'Failed to import data');
  return {
    success: apiData.success,
    cellsImported: apiData.cellsImported,
    rowsImported: apiData.rowsImported,
  };
}

/**
 * Export spreadsheet data
 * CRITICAL ENDPOINT
 */
export async function exportData(
  spreadsheetId: string,
  sheetId: string,
  format: string = 'csv'
): Promise<Blob | AnyObject> {
  const res = await fetch(
    `${API_BASE_URL}/import-export/export?spreadsheetId=${spreadsheetId}&sheetId=${sheetId}&format=${format}`,
    {
      headers: getAuthHeader(),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to export data');
  }

  if (format === 'csv') {
    return await res.blob();
  } else {
    return await res.json();
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert CSV string to 2D array
 */
export function parseCSV(csvString: string): string[][] {
  return csvString
    .trim()
    .split('\n')
    .map((line: string) =>
      line
        .split(',')
        .map((cell: string) => cell.trim().replace(/^"(.*)"$/, '$1'))
    );
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('authToken');
  if (!token || token === 'null' || token === 'undefined') return false;

  // Best-effort JWT expiry check
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payloadJson = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(payloadJson);
    if (typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp <= now) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * TODO: Add WebSocket support for real-time collaboration
 * export function connectCollaborationWS(spreadsheetId) { ... }
 * 
 * TODO: Add error boundary and retry logic
 * export function withRetry(fn, maxAttempts = 3) { ... }
 */
