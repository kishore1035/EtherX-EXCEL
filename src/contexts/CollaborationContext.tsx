import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import config from '../config';

interface User {
  userId: string;
  userName: string;
  userColor: string;
  permission: 'viewer' | 'editor';
  cursor?: { row: number; col: number } | null;
  isEditing?: boolean;
  editingCell?: { row: number; col: number } | null;
  liveTypingContent?: string; // For real-time typing visibility
  selectionRange?: { startRow: number; startCol: number; endRow: number; endCol: number } | null; // For range selection visibility
}

interface CellLock {
  row: number;
  col: number;
  userId: string;
  userName: string;
  timestamp: number;
}

interface CollaborationContextType {
  activeUsers: User[];
  cellLocks: Map<string, CellLock>;
  isConnected: boolean;
  myUserId: string | null;
  sendCursorUpdate: (row: number | null, col: number | null) => void;
  sendCellUpdate: (row: number, col: number, value: any, format?: any) => void;
  sendEditingStatus: (row: number | null, col: number | null, isEditing: boolean) => void;
  sendTypingUpdate: (row: number, col: number, value: string) => void; // NEW: Live typing
  sendSelectionUpdate: (selectionRange: { startRow: number; startCol: number; endRow: number; endCol: number } | null) => void; // NEW: Selection range
  requestCellLock: (row: number, col: number) => Promise<boolean>;
  releaseCellLock: (row: number, col: number) => void;
  isCellLocked: (row: number, col: number) => boolean;
  getCellLockOwner: (row: number, col: number) => string | null;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

interface CollaborationProviderProps {
  children: React.ReactNode;
  documentId: string;
  userId: string;
  userName: string;
  userPermission: 'viewer' | 'editor';
}

// User colors palette
const USER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
];

export function CollaborationProvider({ children, documentId, userId, userName, userPermission }: CollaborationProviderProps) {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [cellLocks, setCellLocks] = useState<Map<string, CellLock>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  // Initialize WebSocket connection
  useEffect(() => {
    if (!userId || !documentId) return;

    const connect = () => {
      // Use centralized production-ready WebSocket URL
      const wsUrl = config.api.websocketUrl;
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        console.log('📍 Document ID:', documentId);
        console.log('👤 User ID:', userId);
        console.log('📝 User Name:', userName);
        setIsConnected(true);

        // Join the spreadsheet room
        setMyUserId(userId);

        const joinMessage = {
          type: 'join',
          payload: {
            documentId,
            userId,
            userName,
            permission: userPermission
          }
        };
        console.log('📤 Sending join message:', joinMessage);
        ws.send(JSON.stringify(joinMessage));

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat', payload: { timestamp: Date.now() } }));
          }
        }, 30000); // Every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);

          switch (type) {
            case 'joined':
              console.log('✅ Successfully joined collaboration session');
              console.log('👥 Initial collaborators:', payload.collaborators);
              const initialUsers = (payload.collaborators || []).map((u: any, index: number) => ({
                ...u,
                userColor: u.userColor || USER_COLORS[index % USER_COLORS.length]
              }));
              console.log('👥 Setting active users:', initialUsers);
              setActiveUsers(initialUsers);
              break;

            case 'user_joined':
              console.log('🎉 New user joined:', payload.userName, payload.userId);
              setActiveUsers(prev => {
                const exists = prev.some(u => u.userId === payload.userId);
                if (exists) {
                  console.log('⚠️ User already exists, skipping');
                  return prev;
                }
                const newUser = {
                  userId: payload.userId,
                  userName: payload.userName,
                  userColor: USER_COLORS[prev.length % USER_COLORS.length],
                  permission: payload.permission,
                  cursor: null
                };
                console.log('➕ Adding new user:', newUser);
                console.log('📊 Total users now:', prev.length + 1);
                return [...prev, newUser];
              });
              break;

            case 'user_left':
              if (payload && typeof payload === 'object' && 'userId' in payload) {
                const userLeftPayload = payload as { userId: string; userName: string };
                setActiveUsers(prev => prev.filter(u => u.userId !== userLeftPayload.userId));
                // Release all locks from this user
                setCellLocks(prev => {
                  const newLocks = new Map<string, CellLock>(prev);
                  for (const [key, lock] of newLocks.entries()) {
                    if ((lock as CellLock).userId === userLeftPayload.userId) {
                      newLocks.delete(key);
                    }
                  }
                  return newLocks;
                });
              }
              break;

            case 'cursor_update':
              if (payload && typeof payload === 'object' && 'userId' in payload) {
                const cursorPayload = payload as { userId: string; cursor: { row: number; col: number } };
                console.log('🖱️ Cursor update received:', cursorPayload.userId, cursorPayload.cursor);
                setActiveUsers(prev => {
                  const updated = prev.map(u => 
                    u.userId === cursorPayload.userId
                      ? { ...u, cursor: cursorPayload.cursor }
                      : u
                  );
                  console.log('📊 Updated users after cursor:', updated.filter(u => u.cursor).length, 'users with cursors');
                  return updated;
                });
              }
              break;

            case 'editing_status':
              setActiveUsers(prev => prev.map(u =>
                u.userId === payload.userId
                  ? { 
                      ...u, 
                      isEditing: payload.isEditing,
                      editingCell: payload.isEditing ? payload.cell : null
                    }
                  : u
              ));
              break;

            case 'typing_update':
              // Real-time typing visibility (Canva-style)
              setActiveUsers(prev => prev.map(u =>
                u.userId === payload.userId
                  ? {
                      ...u,
                      liveTypingContent: payload.value,
                      cursor: { row: payload.row, col: payload.col }
                    }
                  : u
              ));
              break;

            case 'selection_update':
              // Selection range visibility
              setActiveUsers(prev => prev.map(u =>
                u.userId === payload.userId
                  ? {
                      ...u,
                      selectionRange: payload.selectionRange
                    }
                  : u
              ));
              break;

            case 'cell_locked':
              if (payload.success) {
                setCellLocks(prev => {
                  const newLocks = new Map(prev);
                  newLocks.set(getCellKey(payload.row, payload.col), {
                    row: payload.row,
                    col: payload.col,
                    userId: payload.userId,
                    userName: payload.userName,
                    timestamp: Date.now()
                  });
                  return newLocks;
                });
              }
              break;

            case 'cell_unlocked':
              setCellLocks(prev => {
                const newLocks = new Map(prev);
                newLocks.delete(getCellKey(payload.row, payload.col));
                return newLocks;
              });
              break;

            case 'cell_update':
              // This will be handled by the spreadsheet context
              // Just dispatch a custom event
              window.dispatchEvent(new CustomEvent('collaboration:cell_update', { 
                detail: payload 
              }));
              break;

            case 'error':
              console.error('❌ Collaboration error:', payload.message);
              break;
          }
        } catch (error) {
          console.error('❌ Error processing message:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        setActiveUsers([]);
        setCellLocks(new Map());

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Attempt reconnection after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [userId, documentId, userName, userPermission]);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const sendCursorUpdate = useCallback((row: number | null, col: number | null) => {
    const cursorData = row !== null && col !== null ? { row, col } : null;
    console.log('📤 Sending cursor update:', cursorData);
    sendMessage('cursor_move', {
      documentId,
      cursor: cursorData
    });
  }, [sendMessage, documentId]);

  const sendCellUpdate = useCallback((row: number, col: number, value: any, format?: any) => {
    if (userPermission !== 'editor') {
      console.warn('⚠️ Viewer cannot edit cells');
      return;
    }

    sendMessage('cell_change', {
      documentId,
      row,
      col,
      value,
      format,
      timestamp: Date.now()
    });
  }, [sendMessage, documentId, userPermission]);

  const sendEditingStatus = useCallback((row: number | null, col: number | null, isEditing: boolean) => {
    sendMessage('editing_status', {
      documentId,
      isEditing,
      cell: row !== null && col !== null ? { row, col } : null
    });
  }, [sendMessage, documentId]);

  const sendTypingUpdate = useCallback((row: number, col: number, value: string) => {
    if (userPermission !== 'editor') return;
    
    sendMessage('typing_update', {
      documentId,
      row,
      col,
      value,
      timestamp: Date.now()
    });
  }, [sendMessage, documentId, userPermission]);

  const sendSelectionUpdate = useCallback((selectionRange: { startRow: number; startCol: number; endRow: number; endCol: number } | null) => {
    sendMessage('selection_change', {
      documentId,
      selectionRange
    });
  }, [sendMessage, documentId]);

  const requestCellLock = useCallback(async (row: number, col: number): Promise<boolean> => {
    if (userPermission !== 'editor') {
      return false;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);

      const handler = (event: MessageEvent) => {
        try {
          const { type, payload } = JSON.parse(event.data);
          if (type === 'cell_locked' && payload.row === row && payload.col === col) {
            clearTimeout(timeout);
            wsRef.current?.removeEventListener('message', handler);
            resolve(payload.success);
          }
        } catch (error) {
          // Ignore parse errors
        }
      };

      wsRef.current?.addEventListener('message', handler);

      sendMessage('lock_cell', {
        documentId,
        row,
        col
      });
    });
  }, [sendMessage, documentId, userPermission]);

  const releaseCellLock = useCallback((row: number, col: number) => {
    sendMessage('unlock_cell', {
      documentId,
      row,
      col
    });
  }, [sendMessage, documentId]);

  const isCellLocked = useCallback((row: number, col: number): boolean => {
    const key = getCellKey(row, col);
    const lock = cellLocks.get(key);
    return lock !== undefined && lock.userId !== myUserId;
  }, [cellLocks, myUserId]);

  const getCellLockOwner = useCallback((row: number, col: number): string | null => {
    const key = getCellKey(row, col);
    const lock = cellLocks.get(key);
    return lock ? lock.userName : null;
  }, [cellLocks]);

  // Expose debug info globally
  useEffect(() => {
    (window as any).__COLLABORATION_DEBUG__ = {
      activeUsers,
      myUserId,
      isConnected,
      cellLocks,
      documentId,
      userId,
      userName
    };
  }, [activeUsers, myUserId, isConnected, cellLocks, documentId, userId, userName]);

  return (
    <CollaborationContext.Provider
      value={{
        activeUsers,
        cellLocks,
        isConnected,
        myUserId,
        sendCursorUpdate,
        sendCellUpdate,
        sendEditingStatus,
        sendTypingUpdate,
        sendSelectionUpdate,
        requestCellLock,
        releaseCellLock,
        isCellLocked,
        getCellLockOwner
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
}
