# Real-Time Collaboration System

## Overview
This implementation provides Google Sheets-like real-time collaborative editing for the EtherX Excel application using WebSockets.

## Features

### ✅ Real-Time Synchronization
- **Cell Edits**: All cell value changes are instantly synchronized across all connected users
- **Formatting Changes**: Font, color, alignment changes broadcast in real-time
- **Bulk Operations**: Paste, insert/delete rows/columns, charts, images synchronized
- **Cursor Tracking**: See where other collaborators are working with color-coded cursors

### ✅ Permission System
- **Editor**: Full edit access to the spreadsheet
- **Viewer**: Read-only access, can see changes but cannot edit

### ✅ Conflict Resolution
- **Last-Write-Wins**: Most recent change takes precedence
- **Operation History**: Server maintains history of last 1000 operations
- **Throttling**: Changes are throttled (100ms) to prevent flooding

### ✅ Connection Management
- **Auto-Reconnect**: Automatically reconnects on connection loss
- **Heartbeat**: Keep-alive mechanism (every 30 seconds)
- **State Sync**: Full state synchronization on connect/reconnect

## Architecture

### Backend (WebSocket Server)
```
backend/src/services/collaborationService.js
```
- Manages WebSocket connections
- Maintains document state in memory
- Broadcasts changes to all connected clients
- Handles conflict resolution

### Frontend Components

#### 1. RealtimeCollaborationContext
```
src/contexts/RealtimeCollaborationContext.tsx
```
- WebSocket connection management
- Event handling and callbacks
- Collaborator tracking

#### 2. useSpreadsheetCollaboration Hook
```
src/hooks/useSpreadsheetCollaboration.ts
```
- Integrates real-time collaboration with SpreadsheetContext
- Broadcasts local changes
- Applies remote changes
- Throttles updates to prevent flooding

#### 3. UI Components
```
src/components/CollaboratorCursors.tsx - Display other users' cursors
src/components/CollaborationStatus.tsx - Show connection status
```

## Setup

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install ws
```

#### Frontend
No additional dependencies required (uses native WebSocket API)

### 2. Environment Variables

Create `.env` file in frontend root:
```env
VITE_WS_URL=ws://localhost:5000/ws/collaboration
```

### 3. Start Services

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
npm run dev
```

## Usage

### Integrating in ExcelSpreadsheet Component

```typescript
import { useSpreadsheetCollaboration } from '../hooks/useSpreadsheetCollaboration';
import { CollaboratorCursors } from './CollaboratorCursors';
import { CollaborationStatus } from './CollaborationStatus';

function ExcelSpreadsheet({ user, currentSpreadsheet }) {
  // Initialize collaboration
  const { isConnected, collaborators, collaboratorCursors } = useSpreadsheetCollaboration(
    currentSpreadsheet?.id || null,
    user.email,
    user.name,
    'editor' // or 'viewer'
  );

  return (
    <div>
      {/* Status Indicator */}
      <CollaborationStatus 
        isConnected={isConnected}
        collaborators={collaborators}
      />

      {/* Spreadsheet Grid */}
      <div className="relative">
        {/* Your existing spreadsheet */}
        
        {/* Collaborator Cursors Overlay */}
        <CollaboratorCursors 
          cursors={collaboratorCursors}
          getCellPosition={getCellPosition}
        />
      </div>
    </div>
  );
}
```

## Protocol

### Client → Server Messages

#### Join Document
```json
{
  "type": "join",
  "payload": {
    "documentId": "spreadsheet_123",
    "userId": "user@example.com",
    "userName": "John Doe",
    "permission": "editor"
  }
}
```

#### Cell Change
```json
{
  "type": "cell_change",
  "payload": {
    "cellId": "A1",
    "value": "Hello World",
    "timestamp": 1234567890
  }
}
```

#### Format Change
```json
{
  "type": "format_change",
  "payload": {
    "cellId": "A1",
    "format": {
      "bold": true,
      "color": "#FF0000"
    },
    "timestamp": 1234567890
  }
}
```

#### Bulk Change
```json
{
  "type": "bulk_change",
  "payload": {
    "changes": {
      "cellData": { "A1": "value1", "B2": "value2" },
      "cellFormats": { "A1": { "bold": true } },
      "floatingCharts": [...]
    },
    "timestamp": 1234567890
  }
}
```

#### Cursor Move
```json
{
  "type": "cursor_move",
  "payload": {
    "row": 5,
    "col": 3
  }
}
```

### Server → Client Messages

#### User Joined
```json
{
  "type": "user_joined",
  "payload": {
    "userId": "user@example.com",
    "userName": "John Doe",
    "permission": "editor",
    "timestamp": 1234567890
  }
}
```

#### Cell Changed
```json
{
  "type": "cell_changed",
  "payload": {
    "cellId": "A1",
    "value": "Hello World",
    "userId": "user@example.com",
    "userName": "John Doe",
    "timestamp": 1234567890
  }
}
```

## Testing

### Manual Testing Checklist

1. **Basic Sync**
   - [ ] Open same spreadsheet in two browsers
   - [ ] Edit cell in browser 1
   - [ ] Verify change appears in browser 2

2. **Cursor Tracking**
   - [ ] Click different cells in browser 1
   - [ ] Verify cursor indicator shows in browser 2

3. **Bulk Operations**
   - [ ] Paste data in browser 1
   - [ ] Verify data appears in browser 2
   - [ ] Insert row in browser 1
   - [ ] Verify row inserted in browser 2

4. **Connection**
   - [ ] Stop backend server
   - [ ] Verify "Disconnected" status shows
   - [ ] Restart server
   - [ ] Verify auto-reconnect works

5. **Permissions**
   - [ ] Open as viewer
   - [ ] Verify cannot edit cells
   - [ ] Can see other users' changes

## Performance Considerations

### Throttling
- Cell changes: 100ms throttle
- Cursor moves: 100ms throttle
- Prevents network flooding

### State Management
- Document state cached in memory on server
- Automatic cleanup after 24 hours of inactivity
- Operation history limited to last 1000 operations

### Scalability
For production deployment:
- Use Redis for distributed state management
- Implement Redis Pub/Sub for multi-server support
- Add database persistence for document states
- Implement rate limiting per user

## Troubleshooting

### Connection Issues
- Check VITE_WS_URL matches backend port
- Verify backend WebSocket server is running
- Check browser console for WebSocket errors

### Changes Not Syncing
- Verify isConnected === true
- Check permission (viewers cannot edit)
- Look for throttling (changes batched every 100ms)

### Memory Issues
- Server auto-cleans old documents (24hr)
- Restart server to clear all cached states

## Future Enhancements

- [ ] Operational Transformation (OT) for better conflict resolution
- [ ] Presence indicators (typing, selecting)
- [ ] Comments and annotations
- [ ] Version history with restore
- [ ] Chat integration
- [ ] Access control per cell/range
- [ ] Audit log of all changes
