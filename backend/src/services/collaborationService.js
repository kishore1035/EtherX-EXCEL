// Real-time collaboration service using WebSocket
import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// Store active connections per document
const documentRooms = new Map(); // documentId -> Set of client connections
const clientInfo = new Map(); // ws -> { userId, documentId, userName, permission }

// Document state cache (in-memory, could be Redis in production)
const documentStates = new Map(); // documentId -> document state

// Operation history for conflict resolution
const operationHistory = new Map(); // documentId -> array of operations

export class CollaborationService {
  constructor() {
    this.wss = null;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/collaboration'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('📡 New WebSocket connection');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });

      // Send connection acknowledgment
      this.sendMessage(ws, {
        type: 'connected',
        timestamp: Date.now()
      });
    });

    console.log('✅ Collaboration WebSocket server initialized');
  }

  /**
   * Handle incoming messages
   */
  handleMessage(ws, data) {
    const { type, payload } = data;

    switch (type) {
      case 'join':
        this.handleJoin(ws, payload);
        break;
      
      case 'leave':
        this.handleLeave(ws, payload);
        break;

      case 'cell_change':
        this.handleCellChange(ws, payload);
        break;

      case 'format_change':
        this.handleFormatChange(ws, payload);
        break;

      case 'bulk_change':
        this.handleBulkChange(ws, payload);
        break;

      case 'cursor_move':
        this.handleCursorMove(ws, payload);
        break;

      case 'editing_status':
        this.handleEditingStatus(ws, payload);
        break;

      case 'typing_update':
        this.handleTypingUpdate(ws, payload);
        break;

      case 'selection_change':
        this.handleSelectionChange(ws, payload);
        break;

      case 'lock_cell':
        this.handleLockCell(ws, payload);
        break;

      case 'unlock_cell':
        this.handleUnlockCell(ws, payload);
        break;

      case 'request_state':
        this.handleStateRequest(ws, payload);
        break;

      case 'heartbeat':
        this.handleHeartbeat(ws, payload);
        break;

      default:
        console.warn('⚠️ Unknown message type:', type);
    }
  }

  /**
   * Handle user joining a document
   */
  handleJoin(ws, payload) {
    const { documentId, userId, userName, permission = 'editor' } = payload;

    if (!documentId || !userId) {
      this.sendError(ws, 'Missing documentId or userId');
      return;
    }

    // Store client info
    clientInfo.set(ws, { userId, documentId, userName, permission });

    // Add to document room
    if (!documentRooms.has(documentId)) {
      documentRooms.set(documentId, new Set());
    }
    documentRooms.get(documentId).add(ws);

    // Initialize document state if doesn't exist
    if (!documentStates.has(documentId)) {
      documentStates.set(documentId, {
        cellData: {},
        cellFormats: {},
        floatingImages: [],
        floatingCharts: [],
        floatingShapes: [],
        floatingTextBoxes: [],
        shapes: [],
        columnWidths: {},
        rowHeights: {},
        lastModified: Date.now()
      });
    }

    // Initialize operation history
    if (!operationHistory.has(documentId)) {
      operationHistory.set(documentId, []);
    }

    // Get current collaborators
    const collaborators = this.getDocumentCollaborators(documentId);

    // Notify user of successful join
    this.sendMessage(ws, {
      type: 'joined',
      payload: {
        documentId,
        state: documentStates.get(documentId),
        collaborators,
        timestamp: Date.now()
      }
    });

    // Broadcast to others that a new user joined
    this.broadcastToDocument(documentId, {
      type: 'user_joined',
      payload: {
        userId,
        userName,
        permission,
        timestamp: Date.now()
      }
    }, ws);

    console.log(`✅ User ${userName} (${userId}) joined document ${documentId}`);
  }

  /**
   * Handle user leaving a document
   */
  handleLeave(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId, userName } = info;

    // Release all cell locks owned by this user
    const state = documentStates.get(documentId);
    if (state && state.cellLocks) {
      const unlockedCells = [];
      for (const [cellKey, lock] of Object.entries(state.cellLocks)) {
        if (lock.userId === userId) {
          delete state.cellLocks[cellKey];
          const [row, col] = cellKey.split('-').map(Number);
          unlockedCells.push({ row, col });
        }
      }

      // Broadcast unlocks
      if (unlockedCells.length > 0) {
        this.broadcastToDocument(documentId, {
          type: 'bulk_unlock',
          payload: {
            cells: unlockedCells,
            userId
          }
        });
      }
    }

    // Remove from room
    if (documentRooms.has(documentId)) {
      documentRooms.get(documentId).delete(ws);
      
      // Clean up empty rooms
      if (documentRooms.get(documentId).size === 0) {
        documentRooms.delete(documentId);
      }
    }

    // Remove client info
    clientInfo.delete(ws);

    // Broadcast to others
    this.broadcastToDocument(documentId, {
      type: 'user_left',
      payload: {
        userId,
        userName,
        timestamp: Date.now()
      }
    });

    console.log(`👋 User ${userName} (${userId}) left document ${documentId}`);
  }

  /**
   * Handle cell change
   */
  handleCellChange(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId, userName, permission } = info;

    // Check permission
    if (permission !== 'editor') {
      this.sendError(ws, 'No edit permission');
      return;
    }

    const { cellId, value, timestamp: clientTimestamp } = payload;
    const serverTimestamp = Date.now();

    // Update document state
    const state = documentStates.get(documentId);
    if (state) {
      state.cellData[cellId] = value;
      state.lastModified = serverTimestamp;

      // Add to operation history
      this.addOperation(documentId, {
        type: 'cell_change',
        cellId,
        value,
        userId,
        userName,
        clientTimestamp,
        serverTimestamp
      });
    }

    // Broadcast change to all other collaborators
    this.broadcastToDocument(documentId, {
      type: 'cell_changed',
      payload: {
        cellId,
        value,
        userId,
        userName,
        timestamp: serverTimestamp
      }
    }, ws);
  }

  /**
   * Handle format change
   */
  handleFormatChange(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId, userName, permission } = info;

    if (permission !== 'editor') {
      this.sendError(ws, 'No edit permission');
      return;
    }

    const { cellId, format, timestamp: clientTimestamp } = payload;
    const serverTimestamp = Date.now();

    // Update document state
    const state = documentStates.get(documentId);
    if (state) {
      state.cellFormats[cellId] = { ...state.cellFormats[cellId], ...format };
      state.lastModified = serverTimestamp;

      this.addOperation(documentId, {
        type: 'format_change',
        cellId,
        format,
        userId,
        userName,
        clientTimestamp,
        serverTimestamp
      });
    }

    // Broadcast
    this.broadcastToDocument(documentId, {
      type: 'format_changed',
      payload: {
        cellId,
        format,
        userId,
        userName,
        timestamp: serverTimestamp
      }
    }, ws);
  }

  /**
   * Handle bulk changes (paste, delete, insert rows/cols, etc.)
   */
  handleBulkChange(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId, userName, permission } = info;

    if (permission !== 'editor') {
      this.sendError(ws, 'No edit permission');
      return;
    }

    const { changes, timestamp: clientTimestamp } = payload;
    const serverTimestamp = Date.now();

    // Update document state
    const state = documentStates.get(documentId);
    if (state) {
      // Apply all changes
      if (changes.cellData) {
        Object.assign(state.cellData, changes.cellData);
      }
      if (changes.cellFormats) {
        Object.assign(state.cellFormats, changes.cellFormats);
      }
      if (changes.floatingImages) {
        state.floatingImages = changes.floatingImages;
      }
      if (changes.floatingCharts) {
        state.floatingCharts = changes.floatingCharts;
      }
      if (changes.floatingShapes) {
        state.floatingShapes = changes.floatingShapes;
      }
      if (changes.floatingTextBoxes) {
        state.floatingTextBoxes = changes.floatingTextBoxes;
      }
      if (changes.shapes) {
        state.shapes = changes.shapes;
      }
      if (changes.columnWidths) {
        Object.assign(state.columnWidths, changes.columnWidths);
      }
      if (changes.rowHeights) {
        Object.assign(state.rowHeights, changes.rowHeights);
      }

      state.lastModified = serverTimestamp;

      this.addOperation(documentId, {
        type: 'bulk_change',
        changes,
        userId,
        userName,
        clientTimestamp,
        serverTimestamp
      });
    }

    // Broadcast
    this.broadcastToDocument(documentId, {
      type: 'bulk_changed',
      payload: {
        changes,
        userId,
        userName,
        timestamp: serverTimestamp
      }
    }, ws);
  }

  /**
   * Handle cursor movement
   */
  handleCursorMove(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId, userName } = info;
    const { cursor } = payload;

    // Broadcast cursor position to others (don't store in state)
    this.broadcastToDocument(documentId, {
      type: 'cursor_update',
      payload: {
        userId,
        userName,
        cursor,
        timestamp: Date.now()
      }
    }, ws);
  }

  /**
   * Handle editing status change
   */
  handleEditingStatus(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId, userName } = info;
    const { isEditing, cell } = payload;

    // Broadcast editing status to others
    this.broadcastToDocument(documentId, {
      type: 'editing_status',
      payload: {
        userId,
        userName,
        isEditing,
        cell,
        timestamp: Date.now()
      }
    }, ws);
  }

  /**
   * Handle live typing updates (Canva-style)
   */
  handleTypingUpdate(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId, userName } = info;
    const { row, col, value, cursorPosition } = payload;

    // Broadcast typing in real-time to all other collaborators
    this.broadcastToDocument(documentId, {
      type: 'typing_update',
      payload: {
        userId,
        userName,
        row,
        col,
        value,
        cursorPosition,
        timestamp: Date.now()
      }
    }, ws);
  }

  /**
   * Handle selection range change (for multi-cell selection visibility)
   */
  handleSelectionChange(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId, userName } = info;
    const { selectionRange } = payload;

    // Broadcast selection range to others
    this.broadcastToDocument(documentId, {
      type: 'selection_update',
      payload: {
        userId,
        userName,
        selectionRange,
        timestamp: Date.now()
      }
    }, ws);
  }

  /**
   * Handle cell lock request
   */
  handleLockCell(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId, userName, permission } = info;
    const { row, col } = payload;

    if (permission !== 'editor') {
      this.sendMessage(ws, {
        type: 'cell_locked',
        payload: {
          success: false,
          row,
          col,
          reason: 'No edit permission'
        }
      });
      return;
    }

    const cellKey = `${row}-${col}`;
    const state = documentStates.get(documentId);
    
    if (!state.cellLocks) {
      state.cellLocks = {};
    }

    // Check if cell is already locked
    if (state.cellLocks[cellKey] && state.cellLocks[cellKey].userId !== userId) {
      this.sendMessage(ws, {
        type: 'cell_locked',
        payload: {
          success: false,
          row,
          col,
          reason: 'Cell already locked',
          lockedBy: state.cellLocks[cellKey].userName
        }
      });
      return;
    }

    // Lock the cell
    state.cellLocks[cellKey] = {
      userId,
      userName,
      timestamp: Date.now()
    };

    // Confirm lock to requester
    this.sendMessage(ws, {
      type: 'cell_locked',
      payload: {
        success: true,
        row,
        col,
        userId,
        userName
      }
    });

    // Broadcast lock to others
    this.broadcastToDocument(documentId, {
      type: 'cell_locked',
      payload: {
        success: true,
        row,
        col,
        userId,
        userName
      }
    }, ws);
  }

  /**
   * Handle cell unlock request
   */
  handleUnlockCell(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId } = info;
    const { row, col } = payload;

    const cellKey = `${row}-${col}`;
    const state = documentStates.get(documentId);

    if (state && state.cellLocks && state.cellLocks[cellKey]) {
      // Only owner can unlock
      if (state.cellLocks[cellKey].userId === userId) {
        delete state.cellLocks[cellKey];

        // Broadcast unlock
        this.broadcastToDocument(documentId, {
          type: 'cell_unlocked',
          payload: {
            row,
            col,
            userId
          }
        });
      }
    }
  }

  /**
   * Handle cursor movement
   */
  handleCursorMove_OLD(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId, userId, userName } = info;
    const { row, col } = payload;

    // Broadcast cursor position to others (don't store in state)
    this.broadcastToDocument(documentId, {
      type: 'cursor_moved',
      payload: {
        userId,
        userName,
        row,
        col,
        timestamp: Date.now()
      }
    }, ws);
  }

  /**
   * Handle state request (when user needs full sync)
   */
  handleStateRequest(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { documentId } = info;
    const state = documentStates.get(documentId);

    if (state) {
      this.sendMessage(ws, {
        type: 'state_sync',
        payload: {
          state,
          timestamp: Date.now()
        }
      });
    }
  }

  /**
   * Handle heartbeat to keep connection alive
   */
  handleHeartbeat(ws, payload) {
    const info = clientInfo.get(ws);
    if (!info) return;

    // Update last active timestamp
    info.lastActive = Date.now();

    // Send heartbeat response
    this.sendMessage(ws, {
      type: 'heartbeat_ack',
      timestamp: Date.now()
    });
  }

  /**
   * Handle disconnect
   */
  handleDisconnect(ws) {
    const info = clientInfo.get(ws);
    if (!info) return;

    this.handleLeave(ws, {});
  }

  /**
   * Get all collaborators for a document
   */
  getDocumentCollaborators(documentId) {
    const collaborators = [];
    const room = documentRooms.get(documentId);

    if (room) {
      room.forEach(ws => {
        const info = clientInfo.get(ws);
        if (info) {
          collaborators.push({
            userId: info.userId,
            userName: info.userName,
            permission: info.permission,
            lastActive: info.lastActive || Date.now()
          });
        }
      });
    }

    return collaborators;
  }

  /**
   * Broadcast message to all users in a document
   */
  broadcastToDocument(documentId, message, excludeWs = null) {
    const room = documentRooms.get(documentId);
    if (!room) return;

    const messageStr = JSON.stringify(message);

    room.forEach(ws => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  /**
   * Send message to specific client
   */
  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send error to client
   */
  sendError(ws, error) {
    this.sendMessage(ws, {
      type: 'error',
      payload: { message: error }
    });
  }

  /**
   * Add operation to history
   */
  addOperation(documentId, operation) {
    if (!operationHistory.has(documentId)) {
      operationHistory.set(documentId, []);
    }

    const history = operationHistory.get(documentId);
    history.push(operation);

    // Keep only last 1000 operations
    if (history.length > 1000) {
      history.shift();
    }
  }

  /**
   * Get document state (useful for persistence)
   */
  getDocumentState(documentId) {
    return documentStates.get(documentId);
  }

  /**
   * Set document state (useful for loading from persistence)
   */
  setDocumentState(documentId, state) {
    documentStates.set(documentId, {
      ...state,
      lastModified: Date.now()
    });
  }

  /**
   * Clean up old documents (call periodically)
   */
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const now = Date.now();
    
    documentStates.forEach((state, documentId) => {
      if (now - state.lastModified > maxAge) {
        // No active connections and old
        if (!documentRooms.has(documentId) || documentRooms.get(documentId).size === 0) {
          documentStates.delete(documentId);
          operationHistory.delete(documentId);
          console.log(`🧹 Cleaned up old document: ${documentId}`);
        }
      }
    });
  }
}

export const collaborationService = new CollaborationService();
