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

export async function listSpreadsheets(req, res) {
  try {
    const userId = req.user.id;
    
    const spreadsheets = await allAsync(
      `SELECT s.*, 
              COUNT(DISTINCT c.spreadsheet_id) as collaborators
       FROM spreadsheets s
       LEFT JOIN collaborators c ON s.id = c.spreadsheet_id
       WHERE s.owner_id = ? OR s.id IN (
         SELECT spreadsheet_id FROM collaborators WHERE user_id = ?
       )
       GROUP BY s.id
       ORDER BY s.updated_at DESC`,
      [userId, userId]
    );

    res.json({ spreadsheets: spreadsheets || [] });
  } catch (error) {
    console.error('List spreadsheets error:', error);
    res.status(500).json({ error: 'Failed to list spreadsheets' });
  }
}

export async function createSpreadsheet(req, res) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Spreadsheet name required' });
  }

  try {
    const userId = req.user.id;
    const spreadsheetId = uuidv4();
    const sheetId = uuidv4();

    // Create spreadsheet
    await runAsync(
      'INSERT INTO spreadsheets (id, name, owner_id) VALUES (?, ?, ?)',
      [spreadsheetId, name, userId]
    );

    // Create default sheet
    await runAsync(
      'INSERT INTO sheets (id, spreadsheet_id, name, position) VALUES (?, ?, ?, ?)',
      [sheetId, spreadsheetId, 'Sheet 1', 0]
    );

    // Add owner as collaborator
    await runAsync(
      'INSERT INTO collaborators (id, spreadsheet_id, user_id, role, status) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), spreadsheetId, userId, 'owner', 'active']
    );

    const spreadsheet = {
      id: spreadsheetId,
      name,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sheets: [{ id: sheetId, name: 'Sheet 1', cells: {} }],
    };

    res.status(201).json({ spreadsheet });
  } catch (error) {
    console.error('Create spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to create spreadsheet' });
  }
}

export async function getSpreadsheet(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const spreadsheet = await getAsync(
      'SELECT * FROM spreadsheets WHERE id = ?',
      [id]
    );

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    // Check permissions
    if (spreadsheet.owner_id !== userId) {
      const collab = await getAsync(
        'SELECT * FROM collaborators WHERE spreadsheet_id = ? AND user_id = ?',
        [id, userId]
      );
      if (!collab) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get sheets and cells
    const sheets = await allAsync(
      'SELECT id, name, color FROM sheets WHERE spreadsheet_id = ? ORDER BY position',
      [id]
    );

    for (const sheet of sheets) {
      const cells = await allAsync(
        `SELECT cell_id, value, formula, bold, italic, underline, color, background_color,
         border_top_style, border_top_color, border_right_style, border_right_color,
         border_bottom_style, border_bottom_color, border_left_style, border_left_color
         FROM cells WHERE sheet_id = ?`,
        [sheet.id]
      );
      sheet.cells = cells.reduce((acc, cell) => {
        const cellData = {
          value: cell.value,
          formula: cell.formula,
          bold: Boolean(cell.bold),
          italic: Boolean(cell.italic),
          underline: Boolean(cell.underline),
          color: cell.color,
          backgroundColor: cell.background_color,
        };
        
        // Add borders if they exist
        const borders = {};
        if (cell.border_top_style && cell.border_top_style !== 'none') {
          borders.top = { style: cell.border_top_style, color: cell.border_top_color || '#000000' };
        }
        if (cell.border_right_style && cell.border_right_style !== 'none') {
          borders.right = { style: cell.border_right_style, color: cell.border_right_color || '#000000' };
        }
        if (cell.border_bottom_style && cell.border_bottom_style !== 'none') {
          borders.bottom = { style: cell.border_bottom_style, color: cell.border_bottom_color || '#000000' };
        }
        if (cell.border_left_style && cell.border_left_style !== 'none') {
          borders.left = { style: cell.border_left_style, color: cell.border_left_color || '#000000' };
        }
        
        if (Object.keys(borders).length > 0) {
          cellData.borders = borders;
        }
        
        acc[cell.cell_id] = cellData;
        return acc;
      }, {});
    }

    const result = {
      ...spreadsheet,
      sheets,
    };

    res.json({ spreadsheet: result });
  } catch (error) {
    console.error('Get spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to get spreadsheet' });
  }
}

export async function updateSpreadsheet(req, res) {
  const { id } = req.params;
  const { name, sheets } = req.body;
  const userId = req.user.id;

  try {
    const spreadsheet = await getAsync(
      'SELECT * FROM spreadsheets WHERE id = ?',
      [id]
    );

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.owner_id !== userId) {
      return res.status(403).json({ error: 'Only owner can update spreadsheet' });
    }

    // Update spreadsheet name if provided
    if (name) {
      await runAsync(
        'UPDATE spreadsheets SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, id]
      );
    }

    // Update sheets and cells if provided
    if (sheets && Array.isArray(sheets)) {
      for (const sheet of sheets) {
        // Ensure sheet exists
        let existingSheet = await getAsync(
          'SELECT id FROM sheets WHERE id = ?',
          [sheet.id]
        );

        if (!existingSheet) {
          await runAsync(
            'INSERT INTO sheets (id, spreadsheet_id, name, color, position) VALUES (?, ?, ?, ?, ?)',
            [sheet.id, id, sheet.name || 'New Sheet', sheet.color || null, sheet.position || 0]
          );
        } else {
          await runAsync(
            'UPDATE sheets SET name = ?, color = ? WHERE id = ?',
            [sheet.name, sheet.color || null, sheet.id]
          );
        }

        // Update cells
        if (sheet.cells) {
          for (const [cellId, cellData] of Object.entries(sheet.cells)) {
            const existingCell = await getAsync(
              'SELECT id FROM cells WHERE sheet_id = ? AND cell_id = ?',
              [sheet.id, cellId]
            );

            if (existingCell) {
              await runAsync(
                `UPDATE cells SET value = ?, formula = ?, bold = ?, italic = ?, underline = ?, 
                 color = ?, background_color = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE sheet_id = ? AND cell_id = ?`,
                [
                  cellData.value || '',
                  cellData.formula || null,
                  cellData.bold ? 1 : 0,
                  cellData.italic ? 1 : 0,
                  cellData.underline ? 1 : 0,
                  cellData.color || null,
                  cellData.backgroundColor || null,
                  sheet.id,
                  cellId,
                ]
              );
            } else {
              await runAsync(
                `INSERT INTO cells (id, sheet_id, cell_id, value, formula, bold, italic, underline, color, background_color)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  uuidv4(),
                  sheet.id,
                  cellId,
                  cellData.value || '',
                  cellData.formula || null,
                  cellData.bold ? 1 : 0,
                  cellData.italic ? 1 : 0,
                  cellData.underline ? 1 : 0,
                  cellData.color || null,
                  cellData.backgroundColor || null,
                ]
              );
            }
          }
        }
      }
    }

    res.json({ success: true, message: 'Spreadsheet updated' });
  } catch (error) {
    console.error('Update spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to update spreadsheet' });
  }
}

export async function deleteSpreadsheet(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const spreadsheet = await getAsync(
      'SELECT * FROM spreadsheets WHERE id = ?',
      [id]
    );

    if (!spreadsheet) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }

    if (spreadsheet.owner_id !== userId) {
      return res.status(403).json({ error: 'Only owner can delete spreadsheet' });
    }

    await runAsync('DELETE FROM spreadsheets WHERE id = ?', [id]);

    res.json({ success: true, message: 'Spreadsheet deleted' });
  } catch (error) {
    console.error('Delete spreadsheet error:', error);
    res.status(500).json({ error: 'Failed to delete spreadsheet' });
  }
}
