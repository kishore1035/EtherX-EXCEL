# 🔍 Cursor Visibility Test Guide

## Quick Test Steps

### 1. Open Browser Console (F12)

When you open the app at `http://localhost:3002/`, you should see:
```
👥 CollaborativeCursors - Active Users: 1
👤 My User ID: your-email@example.com
🎯 Other users with cursors: 0
🔌 WebSocket connected
✅ Successfully joined collaboration session
```

### 2. Open Second Window

In a new browser window (or incognito window), open `http://localhost:3002/` and login as a different user.

You should now see in BOTH windows:
```
👥 CollaborativeCursors - Active Users: 2
👤 My User ID: user1@example.com (or user2@example.com)
🎯 Other users with cursors: 1
```

### 3. Test Cursor Visibility

**Window 1 (User A):**
1. Click on cell B5
2. Check Window 2's console - you should see:
   ```
   🎨 Rendering cursor for user: User A at {row: 5, col: 1}
   ```

**Window 2 (User B):**
- You should NOW SEE:
  - ✅ A colored border around cell B5
  - ✅ User A's name label above the cell
  - ✅ Avatar circle with "A" initial

### 4. If Cursors Still Not Visible

#### Check 1: WebSocket Connection
Open console and type:
```javascript
// Should show WebSocket status
window.location.reload()
```

Look for:
```
🔌 WebSocket connected
✅ Successfully joined collaboration session
```

#### Check 2: Active Users
In console, type:
```javascript
// This should show all active users
console.log('Users:', window)
```

#### Check 3: Z-Index Issue
Press F12, go to Elements tab, and search for "CollaborativeCursors". 
The wrapper div should have:
```html
<div style="position: fixed; inset: 0px; z-index: 9999; pointer-events: none;">
```

### 5. Manual Testing Checklist

Test each of these:

- [ ] Open 2 browser windows
- [ ] Login as different users in each
- [ ] Open the same spreadsheet
- [ ] Console shows "Active Users: 2" in both windows
- [ ] Console shows "Other users with cursors: 1" in both windows
- [ ] Click a cell in Window 1
- [ ] Console in Window 2 shows "🎨 Rendering cursor for user: [name]"
- [ ] See colored border in Window 2
- [ ] See username label in Window 2
- [ ] Move cursor in Window 1 → Border moves in Window 2

### 6. Common Issues & Fixes

**Issue**: "Active Users: 1" in both windows
**Fix**: Users not properly joined. Check backend is running on port 5000.

**Issue**: "Other users with cursors: 0"
**Fix**: Users are joined but cursor positions not being sent. Check selectedCell in spreadsheet.

**Issue**: Console shows rendering but no visual cursor
**Fix**: Z-index issue. Wrapper has z-index: 9999 and position: fixed now.

**Issue**: "🎨 Rendering cursor" logs but nothing visible
**Fix**: Cell position calculation might be off. Check offsetX=50, offsetY=75 matches your grid.

### 7. Debug Commands

Open console in either window and run:

```javascript
// Check collaboration state
const collab = window.__COLLABORATION_DEBUG__;
console.log('My ID:', collab?.myUserId);
console.log('Active Users:', collab?.activeUsers);
console.log('Is Connected:', collab?.isConnected);

// Force cursor update (if implemented)
// This would manually send cursor position
```

### 8. Expected Visual Results

When working correctly, you should see:

**In Window 2 when Window 1 clicks B5:**
```
┌─────────────────────┐
│  User A    🎨       │ ← Username label (colored background)
├─────────────────────┤
│   ╔══════════╗      │
│   ║    B5    ║      │ ← Colored border (3px, animated glow)
│   ╚══════════╝      │
└─────────────────────┘
```

**When Window 1 is typing in B5:**
```
┌─────────────────────┐
│  User A ✏️  🎨      │ ← Username label with editing emoji
├─────────────────────┤
│   ╔══════════╗      │
│   ║  Hello | ║      │ ← Cell with blinking cursor
│   ╚══════════╝      │
│   Typing: Hello     │ ← Live preview box
└─────────────────────┘
```

### 9. Backend Verification

Check backend terminal (port 5000) should show:
```
✅ User [name] joined document [id]
📡 Broadcasting cursor_update
📡 Broadcasting typing_update
```

If not showing these messages, backend handlers might not be triggered.

### 10. Final Verification

All of these should be TRUE:
- [x] Backend running on port 5000
- [x] Frontend running on port 3002
- [x] No errors in browser console
- [x] WebSocket shows "connected"
- [x] Active users count shows correctly
- [x] Console logs "🎨 Rendering cursor" when other user moves
- [x] Visual colored border appears on screen
- [x] Username label visible above cursor
- [x] Cursor moves smoothly when other user navigates

---

## Still Not Working?

If after all this, cursors are STILL not visible:

1. **Hard refresh both windows**: Ctrl+Shift+R
2. **Clear browser cache**: Settings → Clear browsing data
3. **Restart backend**: Kill port 5000 process and restart
4. **Check for console errors**: Look for any red errors in F12 console
5. **Verify framer-motion installed**: Run `npm list framer-motion`

---

## Success Indicator

When it's working, you'll see this in console:
```
👥 CollaborativeCursors - Active Users: 2
👤 My User ID: user1@example.com
🎯 Other users with cursors: 1
🎨 Rendering cursor for user: User 2 at { row: 5, col: 1 }
```

And visually, a **bright colored border** around the cell where the other user is!

**Current Status**: Enhanced with z-index: 9999 and position: fixed wrapper for maximum visibility! 🎉
