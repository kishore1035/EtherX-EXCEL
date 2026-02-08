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
 * Import CSV data into spreadsheet
 * CRITICAL ENDPOINT #3: importData
 */
export async function importData(req, res) {
  const { spreadsheetId, sheetId, data, format = 'csv' } = req.body;
  const userId = req.user.id;

  if (!spreadsheetId || !sheetId || !data) {
    return res.status(400).json({
      error: 'spreadsheetId, sheetId, and data are required',
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

    // Parse CSV data (simple comma-separated format)
    let rows = [];
    if (format === 'csv' && typeof data === 'string') {
      rows = data
        .trim()
        .split('\n')
        .map((line) =>
          line
            .split(',')
            .map((cell) => cell.trim().replace(/^"(.*)"$/, '$1'))
        );
    } else if (Array.isArray(data)) {
      rows = data;
    } else {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Import cells
    let cellsImported = 0;
    const cellMap = {};

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cellValue = row[colIdx];
        const cellId = String.fromCharCode(65 + colIdx) + (rowIdx + 1); // A1, B1, etc.

        const uuid = uuidv4();
        try {
          await runAsync(
            `INSERT INTO cells (id, sheet_id, cell_id, value, bold, italic, underline)
             VALUES (?, ?, ?, ?, 0, 0, 0)`,
            [uuid, sheetId, cellId, cellValue || '']
          );
          cellMap[cellId] = cellValue;
          cellsImported++;
        } catch (err) {
          // Cell might already exist, try to update
          if (err.message.includes('UNIQUE')) {
            await runAsync(
              'UPDATE cells SET value = ? WHERE sheet_id = ? AND cell_id = ?',
              [cellValue || '', sheetId, cellId]
            );
            cellMap[cellId] = cellValue;
            cellsImported++;
          }
        }
      }
    }

    // Create version
    const versionId = uuidv4();
    const fullData = await allAsync(
      `SELECT cell_id, value FROM cells WHERE sheet_id = ?`,
      [sheetId]
    );
    const dataJson = JSON.stringify(fullData);

    await runAsync(
      `INSERT INTO versions (id, spreadsheet_id, data, author_id, changes_summary, changes_count, is_current, size_bytes)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        versionId,
        spreadsheetId,
        dataJson,
        userId,
        'Imported CSV data',
        cellsImported,
        dataJson.length,
      ]
    );

    // Log activity
    await runAsync(
      `INSERT INTO activities (id, spreadsheet_id, user_id, type, description, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        spreadsheetId,
        userId,
        'import',
        'Imported CSV data',
        JSON.stringify({ cellsImported, format }),
      ]
    );

    res.json({
      success: true,
      message: 'Data imported successfully',
      cellsImported,
      rowsImported: rows.length,
    });
  } catch (error) {
    console.error('Import data error:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
}

/**
 * Export spreadsheet data
 * CRITICAL ENDPOINT #3b: exportData
 */
export async function exportData(req, res) {
  const { spreadsheetId, sheetId, format = 'csv' } = req.query;
  const userId = req.user.id;

  if (!spreadsheetId || !sheetId) {
    return res.status(400).json({
      error: 'spreadsheetId and sheetId are required',
    });
  }

  try {
    // Verify ownership/access
    const spreadsheet = await getAsync(
      'SELECT owner_id, name FROM spreadsheets WHERE id = ?',
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
      if (!collab) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get cells
    const cells = await allAsync(
      `SELECT cell_id, value FROM cells WHERE sheet_id = ? ORDER BY cell_id`,
      [sheetId]
    );

    if (format === 'csv') {
      // Convert to CSV format
      const maxCol = Math.max(
        ...cells.map((c) => c.cell_id.charCodeAt(0) - 65),
        0
      );
      const maxRow = Math.max(
        ...cells.map((c) => parseInt(c.cell_id.substring(1))),
        1
      );

      const csv = [];
      for (let row = 1; row <= maxRow; row++) {
        const rowData = [];
        for (let col = 0; col <= maxCol; col++) {
          const cellId = String.fromCharCode(65 + col) + row;
          const cell = cells.find((c) => c.cell_id === cellId);
          const value = cell ? cell.value : '';
          // Escape CSV values
          rowData.push(`"${(value || '').replace(/"/g, '""')}"`);
        }
        csv.push(rowData.join(','));
      }

      res.type('text/csv').send(csv.join('\n'));
    } else if (format === 'json') {
      res.json({
        spreadsheet: spreadsheet.name,
        cells: cells,
        exportedAt: new Date().toISOString(),
      });
    } else {
      res.status(400).json({ error: 'Unsupported format. Use csv or json' });
    }

    // Log activity
    await runAsync(
      `INSERT INTO activities (id, spreadsheet_id, user_id, type, description, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        spreadsheetId,
        userId,
        'export',
        'Exported spreadsheet',
        JSON.stringify({ format, cellsExported: cells.length }),
      ]
    );
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
}
