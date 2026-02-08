import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');
const dbPath = process.env.DB_URL || path.join(dataDir, 'etherx.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;
let isRealDb = false;
let inMemoryStore = new Map();

// In-memory mock database
class InMemoryDb {
  constructor() {
    this.store = new Map();
  }

  run(sql, params, callback) {
    // Mock implementation - just call callback with no error
    if (typeof params === 'function') {
      callback = params;
    }
    setImmediate(() => callback.call({ lastID: Date.now(), changes: 1 }, null));
  }

  get(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
    }
    setImmediate(() => callback(null, null));
  }

  all(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
    }
    setImmediate(() => callback(null, []));
  }

  close(callback) {
    if (callback) setImmediate(callback);
  }
}

async function connectWithRetry(maxRetries = 3) {
  const delays = [500, 1500, 4500];
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const testDb = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            reject(err);
          } else {
            db = testDb;
            isRealDb = true;
            resolve();
          }
        });
      });
      
      console.log(`✅ Connected to database at ${dbPath}`);
      return true;
    } catch (err) {
      const delay = delays[attempt] || 4500;
      console.warn(`⚠️  Database connection attempt ${attempt + 1}/${maxRetries} failed: ${err.message}`);
      
      if (attempt < maxRetries - 1) {
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
}

export function getDatabase() {
  if (!db) {
    // Return in-memory mock if real DB failed
    console.warn('⚠️  Using in-memory database mock');
    db = new InMemoryDb();
  }
  return db;
}

export { isRealDb };

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export async function initializeDatabase() {
  // Attempt to connect with retries
  const connected = await connectWithRetry(3);
  
  if (!connected) {
    console.warn('⚠️  All database connection attempts failed');
    console.warn('⚠️  Application will continue with in-memory mock database');
    console.warn('⚠️  Data will NOT be persisted');
    db = new InMemoryDb();
    isRealDb = false;
    return;
  }
  
  const database = getDatabase();
  
  const tables = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      password_hash TEXT,
      status TEXT DEFAULT 'active',
      deactivated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS spreadsheets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sheets (
      id TEXT PRIMARY KEY,
      spreadsheet_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT,
      position INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (spreadsheet_id) REFERENCES spreadsheets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cells (
      id TEXT PRIMARY KEY,
      sheet_id TEXT NOT NULL,
      cell_id TEXT NOT NULL,
      value TEXT,
      formula TEXT,
      bold INTEGER DEFAULT 0,
      italic INTEGER DEFAULT 0,
      underline INTEGER DEFAULT 0,
      color TEXT,
      background_color TEXT,
      border_top_style TEXT,
      border_top_color TEXT,
      border_right_style TEXT,
      border_right_color TEXT,
      border_bottom_style TEXT,
      border_bottom_color TEXT,
      border_left_style TEXT,
      border_left_color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE,
      UNIQUE(sheet_id, cell_id)
    );

    CREATE TABLE IF NOT EXISTS collaborators (
      id TEXT PRIMARY KEY,
      spreadsheet_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
      status TEXT CHECK (status IN ('active', 'pending', 'offline')),
      invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (spreadsheet_id) REFERENCES spreadsheets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(spreadsheet_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      sheet_id TEXT NOT NULL,
      cell_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      spreadsheet_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      cell_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (spreadsheet_id) REFERENCES spreadsheets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS versions (
      id TEXT PRIMARY KEY,
      spreadsheet_id TEXT NOT NULL,
      data TEXT NOT NULL,
      author_id TEXT NOT NULL,
      changes_summary TEXT,
      changes_count INTEGER,
      is_current INTEGER DEFAULT 0,
      size_bytes INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (spreadsheet_id) REFERENCES spreadsheets(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_cids (
      document_id TEXT PRIMARY KEY,
      cid TEXT NOT NULL,
      owner TEXT NOT NULL,
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      size_bytes INTEGER,
      sheet_count INTEGER,
      cell_count INTEGER
    );

    CREATE TABLE IF NOT EXISTS document_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      cid TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      author TEXT,
      size_bytes INTEGER,
      description TEXT,
      FOREIGN KEY (document_id) REFERENCES document_cids(document_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_mappings (
      document_id TEXT PRIMARY KEY,
      latest_cid TEXT NOT NULL,
      owner TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const statements = tables.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      await new Promise((resolve, reject) => {
        database.run(statement.trim(), (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  // Create indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_spreadsheets_owner ON spreadsheets(owner_id);',
    'CREATE INDEX IF NOT EXISTS idx_sheets_spreadsheet ON sheets(spreadsheet_id);',
    'CREATE INDEX IF NOT EXISTS idx_cells_sheet ON cells(sheet_id);',
    'CREATE INDEX IF NOT EXISTS idx_collaborators_spreadsheet ON collaborators(spreadsheet_id);',
    'CREATE INDEX IF NOT EXISTS idx_collaborators_user ON collaborators(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_activities_spreadsheet ON activities(spreadsheet_id);',
    'CREATE INDEX IF NOT EXISTS idx_versions_spreadsheet ON versions(spreadsheet_id);',
    'CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_document_cids_owner ON document_cids(owner);',
    'CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);',
    'CREATE INDEX IF NOT EXISTS idx_document_versions_cid ON document_versions(cid);'
  ];

  for (const index of indexes) {
    await new Promise((resolve, reject) => {
      database.run(index, (err) => {
        if (err && err.message.includes('already exists')) resolve();
        else if (err) reject(err);
        else resolve();
      });
    });
  }

  console.log('✅ Database initialized successfully');
  console.log(`📊 Using ${isRealDb ? 'real SQLite database' : 'in-memory mock database'}`);
}

export function closeDatabase() {
  if (db) {
    db.close();
  }
}
