import { getDatabase } from './database.js';
import { v4 as uuidv4 } from 'uuid';

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
 * Convert column letter to index (A=0, B=1, etc.)
 */
function columnToIndex(col) {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
}

/**
 * Convert index to column letter (0=A, 1=B, etc.)
 */
function indexToColumn(index) {
  let col = '';
  index++;
  while (index > 0) {
    const remainder = (index - 1) % 26;
    col = String.fromCharCode(65 + remainder) + col;
    index = Math.floor((index - 1) / 26);
  }
  return col;
}

/**
 * Parse cell ID like "A1" into {col: "A", row: 1}
 */
function parseCellId(cellId) {
  const match = cellId.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  return { col: match[1], row: parseInt(match[2]) };
}

/**
 * Parse range like "A1:C3" into {startCol, endCol, startRow, endRow}
 */
function parseRange(range) {
  const [start, end] = range.split(':');
  const startCell = parseCellId(start);
  const endCell = parseCellId(end || start);
  
  if (!startCell || !endCell) return null;
  
  return {
    startCol: columnToIndex(startCell.col),
    endCol: columnToIndex(endCell.col),
    startRow: startCell.row,
    endRow: endCell.row
  };
}

/**
 * Ensure a cell exists in the database
 */
async function ensureCellExists(sheetId, cellId) {
  const existing = await getAsync(
    'SELECT id FROM cells WHERE sheet_id = ? AND cell_id = ?',
    [sheetId, cellId]
  );
  
  if (!existing) {
    await runAsync(
      `INSERT INTO cells (id, sheet_id, cell_id, value, bold, italic, underline)
       VALUES (?, ?, ?, ?, 0, 0, 0)`,
      [uuidv4(), sheetId, cellId, '']
    );
  }
}

/**
 * Update border for a specific side of a cell
 */
async function updateCellBorder(sheetId, cellId, side, style, color = '#000000') {
  await ensureCellExists(sheetId, cellId);
  
  const styleCol = `border_${side}_style`;
  const colorCol = `border_${side}_color`;
  
  await runAsync(
    `UPDATE cells SET ${styleCol} = ?, ${colorCol} = ?, updated_at = CURRENT_TIMESTAMP
     WHERE sheet_id = ? AND cell_id = ?`,
    [style, color, sheetId, cellId]
  );
}

/**
 * Apply border preset to a range of cells
 * @param {string} sheetId - Sheet ID
 * @param {string} range - Range like "A1:C3" or object with startRow, endRow, startCol, endCol
 * @param {string} preset - Border preset identifier
 * @param {string} defaultStyle - Default border style ('thin', 'thick', 'double')
 * @param {string} color - Border color (default: #000000)
 */
export async function applyBorderPreset(sheetId, range, preset, defaultStyle = 'thin', color = '#000000') {
  // Parse range
  let rangeObj;
  if (typeof range === 'string') {
    rangeObj = parseRange(range);
  } else {
    rangeObj = range;
  }
  
  if (!rangeObj) {
    throw new Error('Invalid range format');
  }
  
  const { startCol, endCol, startRow, endRow } = rangeObj;
  
  // Apply border based on preset
  switch (preset) {
    case 'BOTTOM':
      await applyBottomBorder(sheetId, startCol, endCol, startRow, endRow, defaultStyle, color);
      break;
    case 'TOP':
      await applyTopBorder(sheetId, startCol, endCol, startRow, endRow, defaultStyle, color);
      break;
    case 'LEFT':
      await applyLeftBorder(sheetId, startCol, endCol, startRow, endRow, defaultStyle, color);
      break;
    case 'RIGHT':
      await applyRightBorder(sheetId, startCol, endCol, startRow, endRow, defaultStyle, color);
      break;
    case 'NONE':
      await applyNoBorder(sheetId, startCol, endCol, startRow, endRow);
      break;
    case 'ALL':
      await applyAllBorders(sheetId, startCol, endCol, startRow, endRow, defaultStyle, color);
      break;
    case 'OUTSIDE':
      await applyOutsideBorders(sheetId, startCol, endCol, startRow, endRow, defaultStyle, color);
      break;
    case 'THICK_OUTSIDE':
      await applyOutsideBorders(sheetId, startCol, endCol, startRow, endRow, 'thick', color);
      break;
    case 'BOTTOM_DOUBLE':
      await applyBottomBorder(sheetId, startCol, endCol, startRow, endRow, 'double', color);
      break;
    case 'BOTTOM_THICK':
      await applyBottomBorder(sheetId, startCol, endCol, startRow, endRow, 'thick', color);
      break;
    case 'TOP_BOTTOM':
      await applyTopBottomBorder(sheetId, startCol, endCol, startRow, endRow, defaultStyle, color);
      break;
    case 'TOP_THICK_BOTTOM':
      await applyTopThickBottomBorder(sheetId, startCol, endCol, startRow, endRow, color);
      break;
    case 'TOP_DOUBLE_BOTTOM':
      await applyTopDoubleBottomBorder(sheetId, startCol, endCol, startRow, endRow, color);
      break;
    default:
      throw new Error(`Unknown border preset: ${preset}`);
  }
  
  return { success: true, appliedRange: rangeObj, preset };
}

// Border preset implementations

async function applyBottomBorder(sheetId, startCol, endCol, startRow, endRow, style, color) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${indexToColumn(col)}${row}`;
      await updateCellBorder(sheetId, cellId, 'bottom', style, color);
    }
  }
}

async function applyTopBorder(sheetId, startCol, endCol, startRow, endRow, style, color) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${indexToColumn(col)}${row}`;
      await updateCellBorder(sheetId, cellId, 'top', style, color);
    }
  }
}

async function applyLeftBorder(sheetId, startCol, endCol, startRow, endRow, style, color) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${indexToColumn(col)}${row}`;
      await updateCellBorder(sheetId, cellId, 'left', style, color);
    }
  }
}

async function applyRightBorder(sheetId, startCol, endCol, startRow, endRow, style, color) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${indexToColumn(col)}${row}`;
      await updateCellBorder(sheetId, cellId, 'right', style, color);
    }
  }
}

async function applyNoBorder(sheetId, startCol, endCol, startRow, endRow) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${indexToColumn(col)}${row}`;
      await ensureCellExists(sheetId, cellId);
      await runAsync(
        `UPDATE cells SET 
         border_top_style = 'none', border_top_color = NULL,
         border_right_style = 'none', border_right_color = NULL,
         border_bottom_style = 'none', border_bottom_color = NULL,
         border_left_style = 'none', border_left_color = NULL,
         updated_at = CURRENT_TIMESTAMP
         WHERE sheet_id = ? AND cell_id = ?`,
        [sheetId, cellId]
      );
    }
  }
}

async function applyAllBorders(sheetId, startCol, endCol, startRow, endRow, style, color) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${indexToColumn(col)}${row}`;
      await ensureCellExists(sheetId, cellId);
      await runAsync(
        `UPDATE cells SET 
         border_top_style = ?, border_top_color = ?,
         border_right_style = ?, border_right_color = ?,
         border_bottom_style = ?, border_bottom_color = ?,
         border_left_style = ?, border_left_color = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE sheet_id = ? AND cell_id = ?`,
        [style, color, style, color, style, color, style, color, sheetId, cellId]
      );
    }
  }
}

async function applyOutsideBorders(sheetId, startCol, endCol, startRow, endRow, style, color) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${indexToColumn(col)}${row}`;
      await ensureCellExists(sheetId, cellId);
      
      // Top edge
      if (row === startRow) {
        await updateCellBorder(sheetId, cellId, 'top', style, color);
      }
      // Bottom edge
      if (row === endRow) {
        await updateCellBorder(sheetId, cellId, 'bottom', style, color);
      }
      // Left edge
      if (col === startCol) {
        await updateCellBorder(sheetId, cellId, 'left', style, color);
      }
      // Right edge
      if (col === endCol) {
        await updateCellBorder(sheetId, cellId, 'right', style, color);
      }
    }
  }
}

async function applyTopBottomBorder(sheetId, startCol, endCol, startRow, endRow, style, color) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${indexToColumn(col)}${row}`;
      await updateCellBorder(sheetId, cellId, 'top', style, color);
      await updateCellBorder(sheetId, cellId, 'bottom', style, color);
    }
  }
}

async function applyTopThickBottomBorder(sheetId, startCol, endCol, startRow, endRow, color) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${indexToColumn(col)}${row}`;
      await updateCellBorder(sheetId, cellId, 'top', 'thin', color);
      await updateCellBorder(sheetId, cellId, 'bottom', 'thick', color);
    }
  }
}

async function applyTopDoubleBottomBorder(sheetId, startCol, endCol, startRow, endRow, color) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${indexToColumn(col)}${row}`;
      await updateCellBorder(sheetId, cellId, 'top', 'thin', color);
      await updateCellBorder(sheetId, cellId, 'bottom', 'double', color);
    }
  }
}
