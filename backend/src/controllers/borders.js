import { applyBorderPreset } from '../utils/borderService.js';
import { getDatabase } from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Apply border preset to a cell range
 * POST /api/sheets/:sheetId/borders/apply
 */
export async function applyBorders(req, res) {
  const { sheetId } = req.params;
  const { range, preset, style, color } = req.body;
  const userId = req.user.id;

  if (!sheetId || !range || !preset) {
    return res.status(400).json({
      error: 'sheetId, range, and preset are required',
    });
  }

  try {
    // Verify the sheet exists and get its spreadsheet
    const sheet = await getAsync(
      'SELECT spreadsheet_id FROM sheets WHERE id = ?',
      [sheetId]
    );

    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    // Verify user has access
    const spreadsheet = await getAsync(
      'SELECT owner_id FROM spreadsheets WHERE id = ?',
      [sheet.spreadsheet_id]
    );

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.owner_id !== userId) {
      const collab = await getAsync(
        'SELECT role FROM collaborators WHERE spreadsheet_id = ? AND user_id = ?',
        [sheet.spreadsheet_id, userId]
      );
      if (!collab || collab.role === 'viewer') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Apply borders
    const defaultStyle = style || 'thin';
    const borderColor = color || '#000000';
    
    const result = await applyBorderPreset(sheetId, range, preset, defaultStyle, borderColor);

    // Log activity
    await runAsync(
      `INSERT INTO activities (id, spreadsheet_id, user_id, type, description, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        sheet.spreadsheet_id,
        userId,
        'format',
        'Applied borders',
        JSON.stringify({ preset, range, style: defaultStyle, color: borderColor }),
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Borders applied successfully',
      ...result,
    });
  } catch (error) {
    console.error('Apply borders error:', error);
    res.status(500).json({ error: error.message || 'Failed to apply borders' });
  }
}
