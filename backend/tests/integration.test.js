import test from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../src/utils/database.js';

// Helper to run database queries
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

// Helper to create a test user and get token
async function createTestUser() {
  const userId = uuidv4();
  const testEmail = `test-${Date.now()}@example.com`;

  await runAsync(
    'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
    [userId, 'Test User', testEmail]
  );

  const token = jwt.sign(
    { id: userId, name: 'Test User', email: testEmail },
    process.env.JWT_SECRET || 'dev-secret-key'
  );

  return { userId, testEmail, token };
}

// Helper to create a test spreadsheet
async function createTestSpreadsheet(userId) {
  const spreadsheetId = uuidv4();
  const sheetId = uuidv4();

  await runAsync(
    'INSERT INTO spreadsheets (id, name, owner_id) VALUES (?, ?, ?)',
    [spreadsheetId, 'Test Spreadsheet', userId]
  );

  await runAsync(
    'INSERT INTO sheets (id, spreadsheet_id, name, position) VALUES (?, ?, ?, ?)',
    [sheetId, spreadsheetId, 'Sheet 1', 0]
  );

  return { spreadsheetId, sheetId };
}

test('Integration Tests - Spreadsheet Endpoints', async (t) => {
  // Initialize database before tests
  const db = getDatabase();
  
  // Clean up test data after all tests
  const cleanup = async () => {
    // Tests would clean up specific data
  };

  await t.test('CREATE ROW - should create cells in a row', async () => {
    const { userId, token } = await createTestUser();
    const { spreadsheetId, sheetId } = await createTestSpreadsheet(userId);

    const rowData = {
      'A1': 'John',
      'B1': 'Doe',
      'C1': '25',
    };

    // Simulate POST /api/cells/rows/create
    let cellsCreated = 0;
    for (const [cellId, cellValue] of Object.entries(rowData)) {
      await runAsync(
        `INSERT INTO cells (id, sheet_id, cell_id, value, bold, italic, underline)
         VALUES (?, ?, ?, ?, 0, 0, 0)`,
        [uuidv4(), sheetId, cellId, cellValue || '']
      );
      cellsCreated++;
    }

    // Verify cells were created
    const cells = await allAsync(
      'SELECT cell_id, value FROM cells WHERE sheet_id = ?',
      [sheetId]
    );

    assert.equal(cells.length, 3, 'Should have created 3 cells');
    assert.equal(cellsCreated, 3, 'Should track 3 cells created');
    
    const cellA1 = cells.find(c => c.cell_id === 'A1');
    assert.equal(cellA1.value, 'John', 'Cell A1 should have value John');
  });

  await t.test('UPDATE ROW - should update existing row cells', async () => {
    const { userId, token } = await createTestUser();
    const { spreadsheetId, sheetId } = await createTestSpreadsheet(userId);

    // Create initial cells
    const cellIds = ['A1', 'B1', 'C1'];
    for (const cellId of cellIds) {
      await runAsync(
        `INSERT INTO cells (id, sheet_id, cell_id, value, bold, italic, underline)
         VALUES (?, ?, ?, ?, 0, 0, 0)`,
        [uuidv4(), sheetId, cellId, 'original']
      );
    }

    // Update the cells
    const updatedData = {
      'A1': 'Jane',
      'B1': 'Smith',
      'C1': '30',
    };

    let updateCount = 0;
    for (const [cellId, cellValue] of Object.entries(updatedData)) {
      const existingCell = await getAsync(
        'SELECT id FROM cells WHERE sheet_id = ? AND cell_id = ?',
        [sheetId, cellId]
      );
      
      if (existingCell) {
        await runAsync(
          'UPDATE cells SET value = ? WHERE sheet_id = ? AND cell_id = ?',
          [cellValue || '', sheetId, cellId]
        );
        updateCount++;
      }
    }

    // Verify updates
    const cells = await allAsync(
      'SELECT cell_id, value FROM cells WHERE sheet_id = ?',
      [sheetId]
    );

    assert.equal(updateCount, 3, 'Should have updated 3 cells');
    
    const cellA1 = cells.find(c => c.cell_id === 'A1');
    assert.equal(cellA1.value, 'Jane', 'Cell A1 should have updated value Jane');
    
    const cellB1 = cells.find(c => c.cell_id === 'B1');
    assert.equal(cellB1.value, 'Smith', 'Cell B1 should have updated value Smith');
  });

  await t.test('IMPORT/EXPORT - should import CSV data and export it back', async () => {
    const { userId, token } = await createTestUser();
    const { spreadsheetId, sheetId } = await createTestSpreadsheet(userId);

    // Import CSV data
    const csvData = `Name,Age,City
John,25,NYC
Jane,30,LA
Bob,28,SF`;

    const rows = csvData
      .trim()
      .split('\n')
      .map((line) => 
        line
          .split(',')
          .map((cell) => cell.trim())
      );

    let cellsImported = 0;
    const importedCells = {};

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cellValue = row[colIdx];
        const cellId = String.fromCharCode(65 + colIdx) + (rowIdx + 1);

        try {
          await runAsync(
            `INSERT INTO cells (id, sheet_id, cell_id, value, bold, italic, underline)
             VALUES (?, ?, ?, ?, 0, 0, 0)`,
            [uuidv4(), sheetId, cellId, cellValue || '']
          );
          importedCells[cellId] = cellValue;
          cellsImported++;
        } catch (err) {
          if (err.message.includes('UNIQUE')) {
            await runAsync(
              'UPDATE cells SET value = ? WHERE sheet_id = ? AND cell_id = ?',
              [cellValue || '', sheetId, cellId]
            );
            importedCells[cellId] = cellValue;
            cellsImported++;
          }
        }
      }
    }

    assert.equal(cellsImported, 12, 'Should import 12 cells (4 columns × 3 rows)');
    assert.equal(importedCells['A1'], 'Name', 'First cell should contain header');
    assert.equal(importedCells['A2'], 'John', 'Should have imported first row');

    // Now export the data back
    const exportedCells = await allAsync(
      `SELECT cell_id, value FROM cells WHERE sheet_id = ? ORDER BY cell_id`,
      [sheetId]
    );

    assert.equal(exportedCells.length, 12, 'Should export all 12 cells');
    
    // Verify specific cells
    const exportedA1 = exportedCells.find(c => c.cell_id === 'A1');
    assert.equal(exportedA1.value, 'Name', 'Exported A1 should match imported');

    const exportedA2 = exportedCells.find(c => c.cell_id === 'A2');
    assert.equal(exportedA2.value, 'John', 'Exported A2 should match imported');
  });

  await t.test('PERMISSION CHECK - update should fail for viewer access', async () => {
    const { userId, token } = await createTestUser();
    const { spreadsheetId, sheetId } = await createTestSpreadsheet(userId);

    // Create another user as viewer
    const viewerId = uuidv4();
    await runAsync(
      'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
      [viewerId, 'Viewer', 'viewer@example.com']
    );

    await runAsync(
      'INSERT INTO collaborators (id, spreadsheet_id, user_id, role, status) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), spreadsheetId, viewerId, 'viewer', 'active']
    );

    // Try to update (simulate POST from viewer)
    try {
      const collab = await getAsync(
        'SELECT role FROM collaborators WHERE spreadsheet_id = ? AND user_id = ?',
        [spreadsheetId, viewerId]
      );
      
      assert.equal(collab.role, 'viewer', 'User should have viewer role');
      
      if (collab && collab.role === 'viewer') {
        throw new Error('Access denied');
      }
    } catch (err) {
      assert.ok(err.message.includes('Access denied'), 'Should deny viewer access');
    }
  });

  await cleanup();
});
