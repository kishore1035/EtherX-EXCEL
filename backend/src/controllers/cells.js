import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../utils/database.js';

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Create a new row (set of cells) in a sheet
 * CRITICAL ENDPOINT #1: createRow
 */
export async function createRow(req, res) {
  const { spreadsheetId, sheetId, rowNumber, rowData } = req.body;
  const userId = req.user.id;

  if (!spreadsheetId || !sheetId || rowNumber === undefined || !rowData) {
    return res.status(400).json({
      error: 'spreadsheetId, sheetId, rowNumber, and rowData are required',
    });
  }

  try {
    // Verify ownership/access
    const spreadsheet = await getAsync(
      'SELECT owner_id FROM spreadsheets WHERE id = ?',
      [spreadsheetId]
    );

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.owner_id !== userId) {
      const collab = await getAsync(
        'SELECT role FROM collaborators WHERE spreadsheet_id = ? AND user_id = ?',
        [spreadsheetId, userId]
      );
      if (!collab || collab.role === 'viewer') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Create cells for this row
    const createdCells = {};
    for (const [cellId, cellValue] of Object.entries(rowData)) {
      const uuid = uuidv4();
      await runAsync(
        `INSERT INTO cells (id, sheet_id, cell_id, value, bold, italic, underline)
         VALUES (?, ?, ?, ?, 0, 0, 0)`,
        [uuid, sheetId, cellId, cellValue || '']
      );
      createdCells[cellId] = cellValue;
    }

    // Log activity
    await runAsync(
      `INSERT INTO activities (id, spreadsheet_id, user_id, type, description, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        spreadsheetId,
        userId,
        'edit',
        'Created row',
        JSON.stringify({ rowNumber, cellCount: Object.keys(rowData).length }),
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Row created',
      row: { rowNumber, cells: createdCells },
    });
  } catch (error) {
    console.error('Create row error:', error);
    res.status(500).json({ error: 'Failed to create row' });
  }
}

/**
 * Update an existing row (update multiple cells)
 * CRITICAL ENDPOINT #2: updateRow
 */
export async function updateRow(req, res) {
  const { spreadsheetId, sheetId, rowNumber, rowData } = req.body;
  const userId = req.user.id;

  if (!spreadsheetId || !sheetId || rowNumber === undefined || !rowData) {
    return res.status(400).json({
      error: 'spreadsheetId, sheetId, rowNumber, and rowData are required',
    });
  }

  try {
    // Verify ownership/access
    const spreadsheet = await getAsync(
      'SELECT owner_id FROM spreadsheets WHERE id = ?',
      [spreadsheetId]
    );

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.owner_id !== userId) {
      const collab = await getAsync(
        'SELECT role FROM collaborators WHERE spreadsheet_id = ? AND user_id = ?',
        [spreadsheetId, userId]
      );
      if (!collab || collab.role === 'viewer') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Update cells
    const updatedCells = {};
    let updateCount = 0;

    for (const [cellId, cellValue] of Object.entries(rowData)) {
      const existingCell = await getAsync(
        'SELECT id FROM cells WHERE sheet_id = ? AND cell_id = ?',
        [sheetId, cellId]
      );

      if (existingCell) {
        await runAsync(
          'UPDATE cells SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE sheet_id = ? AND cell_id = ?',
          [cellValue || '', sheetId, cellId]
        );
        updateCount++;
      } else {
        // If cell doesn't exist, create it
        await runAsync(
          `INSERT INTO cells (id, sheet_id, cell_id, value, bold, italic, underline)
           VALUES (?, ?, ?, ?, 0, 0, 0)`,
          [uuidv4(), sheetId, cellId, cellValue || '']
        );
        updateCount++;
      }
      updatedCells[cellId] = cellValue;
    }

    // Log activity
    await runAsync(
      `INSERT INTO activities (id, spreadsheet_id, user_id, type, description, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        spreadsheetId,
        userId,
        'edit',
        'Updated row',
        JSON.stringify({ rowNumber, cellsUpdated: updateCount }),
      ]
    );

    res.json({
      success: true,
      message: 'Row updated',
      row: { rowNumber, cells: updatedCells, cellsUpdated: updateCount },
    });
  } catch (error) {
    console.error('Update row error:', error);
    res.status(500).json({ error: 'Failed to update row' });
  }
}

export async function deleteCell(req, res) {
  const { spreadsheetId, cellId } = req.params;
  const userId = req.user.id;

  try {
    const spreadsheet = await getAsync(
      'SELECT owner_id FROM spreadsheets WHERE id = ?',
      [spreadsheetId]
    );

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.owner_id !== userId) {
      const collab = await getAsync(
        'SELECT role FROM collaborators WHERE spreadsheet_id = ? AND user_id = ?',
        [spreadsheetId, userId]
      );
      if (!collab || collab.role === 'viewer') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    await runAsync('DELETE FROM cells WHERE id = ?', [cellId]);

    res.json({ success: true, message: 'Cell deleted' });
  } catch (error) {
    console.error('Delete cell error:', error);
    res.status(500).json({ error: 'Failed to delete cell' });
  }
}
