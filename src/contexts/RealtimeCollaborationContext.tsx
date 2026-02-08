import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface CollaboratorCursor {
  userId: string;
  userName: string;
  row: number;
  col: number;
  color: string;
}

interface Collaborator {
  userId: string;
  userName: string;
  permission: 'viewer' | 'editor';
  lastActive: number;
}

interface RealtimeCollaborationContextType {
  isConnected: boolean;
  collaborators: Collaborator[];
  collaboratorCursors: Map<string, CollaboratorCursor>;
  connect: (documentId: string, userId: string, userName: string, permission?: 'viewer' | 'editor') => void;
  disconnect: () => void;
  broadcastCellChange: (cellId: string, value: string) => void;
  broadcastFormatChange: (cellId: string, format: any) => void;
  broadcastBulkChange: (changes: any) => void;
  broadcastCursorMove: (row: number, col: number) => void;
  requestFullState: () => void;
  onCellChange: (callback: (cellId: string, value: string, userId: string, userName: string) => void) => void;
  onFormatChange: (callback: (cellId: string, format: any, userId: string, userName: string) => void) => void;
  onBulkChange: (callback: (changes: any, userId: string, userName: string) => void) => void;
  onStateSync: (callback: (state: any) => void) => void;
}

const RealtimeCollaborationContext = createContext<RealtimeCollaborationContextType | undefined>(undefined);

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws/collaboration';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const RECONNECT_DELAY = 3000; // 3 seconds

// Color palette for collaborator cursors
const CURSOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80'
];

export function RealtimeCollaborationProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaboratorCursors, setCollaboratorCursors] = useState<Map<string, CollaboratorCursor>>(new Map());
  
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const documentIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const userNameRef = useRef<string | null>(null);
  const permissionRef = useRef<'viewer' | 'editor'>('editor');
  
  // Event callbacks
  const onCellChangeCallbacks = useRef<Array<(cellId: string, value: string, userId: string, userName: string) => void>>([]);
  const onFormatChangeCallbacks = useRef<Array<(cellId: string, format: any, userId: string, userName: string) => void>>([]);
  const onBulkChangeCallbacks = useRef<Array<(changes: any, userId: string, userName: string) => void>>([]);
  const onStateSyncCallbacks = useRef<Array<(state: any) => void>>([]);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback((documentId: string, userId: string, userName: string, permission: 'viewer' | 'editor' = 'editor') => {
    // Disconnect existing connection
    if (wsRef.current) {
      disconnect();
    }

    documentIdRef.current = documentId;
    userIdRef.current = userId;
    userNameRef.current = userName;
    permissionRef.current = permission;

    try {
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);

        // Join document
        sendMessage({
          type: 'join',
          payload: {
            documentId,
            userId,
            userName,
            permission
          }
        });

        // Start heartbeat
        startHeartbeat();

        toast.success('Connected to collaboration server');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        stopHeartbeat();

        // Attempt reconnect
        if (documentIdRef.current) {
          toast.info('Disconnected. Reconnecting...');
          attemptReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        toast.error('Connection error');
      };

    } catch (error) {
      console.error('❌ Failed to connect:', error);
      toast.error('Failed to connect to collaboration server');
    }
  }, []);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      // Send leave message
      sendMessage({
        type: 'leave',
        payload: {}
      });

      wsRef.current.close();
      wsRef.current = null;
    }

    stopHeartbeat();
    setIsConnected(false);
    setCollaborators([]);
    setCollaboratorCursors(new Map());
    documentIdRef.current = null;
    userIdRef.current = null;
    userNameRef.current = null;
  }, []);

  /**
   * Attempt to reconnect
   */
  const attemptReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (documentIdRef.current && userIdRef.current && userNameRef.current) {
        console.log('🔄 Attempting to reconnect...');
        connect(documentIdRef.current, userIdRef.current, userNameRef.current, permissionRef.current);
      }
    }, RECONNECT_DELAY);
  }, [connect]);

  /**
   * Send message to server
   */
  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  /**
   * Handle incoming messages
   */
  const handleMessage = (message: any) => {
    const { type, payload } = message;

    switch (type) {
      case 'connected':
        console.log('📡 Connection acknowledged');
        break;

      case 'joined':
        console.log('✅ Joined document:', payload.documentId);
        setCollaborators(payload.collaborators || []);
        // Trigger state sync callbacks with initial state
        onStateSyncCallbacks.current.forEach(cb => cb(payload.state));
        break;

      case 'user_joined':
        console.log('👋 User joined:', payload.userName);
        toast.info(`${payload.userName} joined the document`);
        setCollaborators(prev => [...prev, {
          userId: payload.userId,
          userName: payload.userName,
          permission: payload.permission,
          lastActive: payload.timestamp
        }]);
        break;

      case 'user_left':
        console.log('👋 User left:', payload.userName);
        toast.info(`${payload.userName} left the document`);
        setCollaborators(prev => prev.filter(c => c.userId !== payload.userId));
        setCollaboratorCursors(prev => {
          const newMap = new Map(prev);
          newMap.delete(payload.userId);
          return newMap;
        });
        break;

      case 'cell_changed':
        onCellChangeCallbacks.current.forEach(cb => 
          cb(payload.cellId, payload.value, payload.userId, payload.userName)
        );
        break;

      case 'format_changed':
        onFormatChangeCallbacks.current.forEach(cb => 
          cb(payload.cellId, payload.format, payload.userId, payload.userName)
        );
        break;

      case 'bulk_changed':
        onBulkChangeCallbacks.current.forEach(cb => 
          cb(payload.changes, payload.userId, payload.userName)
        );
        break;

      case 'cursor_moved':
        updateCollaboratorCursor(payload.userId, payload.userName, payload.row, payload.col);
        break;

      case 'state_sync':
        onStateSyncCallbacks.current.forEach(cb => cb(payload.state));
        break;

      case 'heartbeat_ack':
        // Connection is alive
        break;

      case 'error':
        console.error('Server error:', payload.message);
        toast.error(payload.message);
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  };

  /**
   * Update collaborator cursor position
   */
  const updateCollaboratorCursor = (userId: string, userName: string, row: number, col: number) => {
    setCollaboratorCursors(prev => {
      const newMap = new Map(prev);
      const existingCursor = newMap.get(userId) as CollaboratorCursor | undefined;
      
      let cursor: CollaboratorCursor;
      if (!existingCursor) {
        // Assign a color
        const colorIndex = Array.from(newMap.values()).length % CURSOR_COLORS.length;
        cursor = {
          userId,
          userName,
          row,
          col,
          color: CURSOR_COLORS[colorIndex]
        };
      } else {
        cursor = {
          userId: existingCursor.userId,
          userName: existingCursor.userName,
          row,
          col,
          color: existingCursor.color
        };
      }
      
      newMap.set(userId, cursor);
      return newMap;
    });
  };

  /**
   * Start heartbeat
   */
  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      sendMessage({
        type: 'heartbeat',
        payload: {}
      });
    }, HEARTBEAT_INTERVAL);
  };

  /**
   * Stop heartbeat
   */
  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  /**
   * Broadcast cell change
   */
  const broadcastCellChange = useCallback((cellId: string, value: string) => {
    sendMessage({
      type: 'cell_change',
      payload: {
        cellId,
        value,
        timestamp: Date.now()
      }
    });
  }, []);

  /**
   * Broadcast format change
   */
  const broadcastFormatChange = useCallback((cellId: string, format: any) => {
    sendMessage({
      type: 'format_change',
      payload: {
        cellId,
        format,
        timestamp: Date.now()
      }
    });
  }, []);

  /**
   * Broadcast bulk changes
   */
  const broadcastBulkChange = useCallback((changes: any) => {
    sendMessage({
      type: 'bulk_change',
      payload: {
        changes,
        timestamp: Date.now()
      }
    });
  }, []);

  /**
   * Broadcast cursor movement
   */
  const broadcastCursorMove = useCallback((row: number, col: number) => {
    sendMessage({
      type: 'cursor_move',
      payload: {
        row,
        col
      }
    });
  }, []);

  /**
   * Request full state sync
   */
  const requestFullState = useCallback(() => {
    sendMessage({
      type: 'request_state',
      payload: {}
    });
  }, []);

  /**
   * Register event callbacks
   */
  const onCellChange = useCallback((callback: (cellId: string, value: string, userId: string, userName: string) => void) => {
    onCellChangeCallbacks.current.push(callback);
  }, []);

  const onFormatChange = useCallback((callback: (cellId: string, format: any, userId: string, userName: string) => void) => {
    onFormatChangeCallbacks.current.push(callback);
  }, []);

  const onBulkChange = useCallback((callback: (changes: any, userId: string, userName: string) => void) => {
    onBulkChangeCallbacks.current.push(callback);
  }, []);

  const onStateSync = useCallback((callback: (state: any) => void) => {
    onStateSyncCallbacks.current.push(callback);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [disconnect]);

  const value: RealtimeCollaborationContextType = {
    isConnected,
    collaborators,
    collaboratorCursors,
    connect,
    disconnect,
    broadcastCellChange,
    broadcastFormatChange,
    broadcastBulkChange,
    broadcastCursorMove,
    requestFullState,
    onCellChange,
    onFormatChange,
    onBulkChange,
    onStateSync
  };

  return (
    <RealtimeCollaborationContext.Provider value={value}>
      {children}
    </RealtimeCollaborationContext.Provider>
  );
}

export function useRealtimeCollaboration() {
  const context = useContext(RealtimeCollaborationContext);
  if (!context) {
    throw new Error('useRealtimeCollaboration must be used within RealtimeCollaborationProvider');
  }
  return context;
}
