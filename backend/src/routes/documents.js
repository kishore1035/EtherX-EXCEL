/**
 * DOCUMENT ROUTES
 * Handles full DocumentState IPFS operations
 */

import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { getDatabase } from '../utils/database.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to get Pinata configuration at runtime (after dotenv loading)
function getPinataConfig() {
  return {
    usePinata: process.env.USE_PINATA === 'true' || true,
    jwt: process.env.PINATA_JWT,
    apiUrl: process.env.PINATA_API_URL || 'https://api.pinata.cloud',
    gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  };
}

// IPFS Configuration - Try local IPFS first, fallback to Pinata
const USE_PINATA = process.env.USE_PINATA === 'true' || true; // Default to Pinata for reliability
// NOTE: PINATA_JWT will be read at function level, not here
const PINATA_API_URL = process.env.PINATA_API_URL || 'https://api.pinata.cloud';
const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

/**
 * Upload to Pinata IPFS
 */
async function uploadToPinata(buffer, filename) {
  try {
    const config = getPinataConfig();
    
    if (!config.jwt) {
      throw new Error('PINATA_JWT environment variable is not set. Cannot upload to IPFS.');
    }
    
    const formData = new FormData();
    formData.append('file', buffer, filename);
    
    const pinataMetadata = JSON.stringify({
      name: filename,
      keyvalues: {
        type: 'document',
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', pinataMetadata);
    
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);
    
    const response = await fetch(`${config.apiUrl}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.jwt}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata upload failed: ${error}`);
    }
    
    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('❌ Pinata upload error:', error);
    throw error;
  }
}

/**
 * Get from Pinata IPFS
 */
async function getFromPinata(cid) {
  try {
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('❌ Pinata fetch error:', error);
    throw error;
  }
}

/**
 * Upload complete DocumentState to IPFS
 * POST /api/ipfs/upload-document
 */
router.post('/upload-document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('📤 Uploading document to IPFS...');
    console.log('   Size:', (req.file.size / 1024).toFixed(2), 'KB');

    // Parse and validate the document
    let documentState;
    try {
      documentState = JSON.parse(req.file.buffer.toString('utf-8'));
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    // Validate required fields
    if (!documentState.documentId || !documentState.metadata || !documentState.sheets) {
      return res.status(400).json({ error: 'Invalid document schema' });
    }

    // Upload to IPFS (Pinata)
    const result = USE_PINATA 
      ? await uploadToPinata(req.file.buffer, req.file.originalname || `document-${documentState.documentId}.json`)
      : await uploadToLocalIPFS(req.file.buffer);

    const cid = result;
    console.log('✅ Document uploaded to IPFS:', cid);

    // Store metadata in database
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.run(
      `INSERT OR REPLACE INTO document_cids 
       (document_id, cid, owner, title, created_at, size_bytes, sheet_count, cell_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        documentState.documentId,
        cid,
        documentState.metadata.owner,
        documentState.metadata.title,
        now,
        req.file.size,
        documentState.sheets.length,
        documentState.sheets.reduce((sum, sheet) => sum + Object.keys(sheet.cells || {}).length, 0)
      ]
    );

    // Store version history
    db.run(
      `INSERT INTO document_versions 
       (document_id, cid, timestamp, author, size_bytes) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        documentState.documentId,
        cid,
        now,
        documentState.metadata.owner,
        req.file.size
      ]
    );

    res.json({
      success: true,
      cid,
      hash: cid, // Legacy compatibility
      documentId: documentState.documentId,
      size: req.file.size,
      timestamp: now
    });
  } catch (error) {
    console.error('❌ Error uploading document to IPFS:', error);
    res.status(500).json({ 
      error: 'Failed to upload document',
      message: error.message 
    });
  }
});

/**
 * Get DocumentState from IPFS
 * GET /api/ipfs/get-document/:cid
 */
router.get('/get-document/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    console.log('📥 Fetching document from IPFS:', cid);

    // Get from IPFS (Pinata)
    const data = USE_PINATA
      ? await getFromPinata(cid)
      : await getFromLocalIPFS(cid);
    
    const documentState = JSON.parse(data);

    console.log('✅ Document retrieved from IPFS:', {
      documentId: documentState.documentId,
      title: documentState.metadata?.title,
      sheets: documentState.sheets?.length
    });

    res.json(documentState);
  } catch (error) {
    console.error('❌ Error fetching document from IPFS:', error);
    res.status(500).json({ 
      error: 'Failed to fetch document',
      message: error.message 
    });
  }
});

/**
 * Store document ID to CID mapping
 * POST /api/documents/mapping
 */
router.post('/mapping', async (req, res) => {
  try {
    const { documentId, cid, owner, timestamp } = req.body;

    const db = getDatabase();
    db.run(
      `INSERT OR REPLACE INTO document_mappings 
       (document_id, latest_cid, owner, updated_at) 
       VALUES (?, ?, ?, ?)`,
      [documentId, cid, owner, timestamp || new Date().toISOString()]
    );

    // HARD-CODED BEHAVIOR: ensure a corresponding spreadsheet exists or is updated
    // so that recent spreadsheets show the latest saved document.
    try {
      // Look up user id by owner (assume owner is an email)
      db.get('SELECT id FROM users WHERE email = ? LIMIT 1', [owner], (uErr, userRow) => {
        if (uErr) {
          console.warn('Could not lookup user for document mapping:', uErr.message);
          return;
        }

        const now = timestamp || new Date().toISOString();

        // Obtain title from document_cids if present
        db.get('SELECT title FROM document_cids WHERE document_id = ? LIMIT 1', [documentId], (cErr, docRow) => {
          const title = (docRow && docRow.title) ? docRow.title : `Sheet ${documentId.slice(0, 6)}`;

          if (userRow && userRow.id) {
            const ownerId = userRow.id;

            // Check if a spreadsheet with this id already exists
            db.get('SELECT id FROM spreadsheets WHERE id = ? LIMIT 1', [documentId], (sErr, sheetRow) => {
              if (sErr) {
                console.warn('Error checking spreadsheets for mapping:', sErr.message);
                return;
              }

              if (!sheetRow) {
                // Insert a new spreadsheet record (hard-coded creation)
                db.run(
                  'INSERT INTO spreadsheets (id, name, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
                  [documentId, title, ownerId, now, now],
                  (insertErr) => {
                    if (insertErr) {
                      console.warn('Failed to insert spreadsheet for document mapping:', insertErr.message);
                      return;
                    }

                    // Create a default sheet and add owner as collaborator
                    const sheetId = require('uuid').v4();
                    db.run(
                      'INSERT INTO sheets (id, spreadsheet_id, name, position, created_at) VALUES (?, ?, ?, ?, ?)',
                      [sheetId, documentId, 'Sheet 1', 0, now]
                    );
                    db.run(
                      'INSERT INTO collaborators (id, spreadsheet_id, user_id, role, status, invited_at) VALUES (?, ?, ?, ?, ?, ?)',
                      [require('uuid').v4(), documentId, ownerId, 'owner', 'active', now]
                    );
                  }
                );
              } else {
                // Update existing spreadsheet's name and timestamp
                db.run(
                  'UPDATE spreadsheets SET name = ?, updated_at = ? WHERE id = ?',
                  [title, now, documentId]
                );
              }
            });
          }
        });
      });
    } catch (innerErr) {
      console.warn('Error during hard-coded spreadsheet upsert for mapping:', innerErr.message || innerErr);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error storing document mapping:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get latest CID for a document
 * GET /api/documents/latest-cid/:documentId
 */
router.get('/latest-cid/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const db = getDatabase();

    const result = await new Promise((resolve, reject) => {
      db.get(
        'SELECT cid FROM document_cids WHERE document_id = ? ORDER BY created_at DESC LIMIT 1',
        [documentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (result) {
      res.json({ cid: result.cid });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error getting latest CID:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get version history for a document
 * GET /api/documents/history/:documentId
 */
router.get('/history/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const db = getDatabase();

    const history = await new Promise((resolve, reject) => {
      db.all(
        `SELECT cid, timestamp, author, size_bytes 
         FROM document_versions 
         WHERE document_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 50`,
        [documentId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json({ history });
  } catch (error) {
    console.error('Error getting document history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * List all documents for an owner
 * GET /api/documents/list/:owner
 */
router.get('/list/:owner', async (req, res) => {
  try {
    const { owner } = req.params;
    const db = getDatabase();

    const documents = await new Promise((resolve, reject) => {
      db.all(
        `SELECT document_id, cid, title, created_at, size_bytes, sheet_count, cell_count
         FROM document_cids 
         WHERE owner = ? 
         ORDER BY created_at DESC`,
        [owner],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json({ documents });
  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
