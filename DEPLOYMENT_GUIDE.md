# 🚀 Deployment Checklist for Live Cursor Collaboration

## ✅ Pre-Deployment Changes (COMPLETED)

### 1. WebSocket URL Configuration ✓
- **Changed:** `CollaborationContext.tsx` now uses environment variables
- **Before:** Hardcoded `ws://localhost:5000/ws/collaboration`
- **After:** Dynamically generated from `VITE_API_URL`
  - Development: `ws://localhost:5000/ws/collaboration`
  - Production: `wss://your-domain.com/ws/collaboration` (secure WebSocket)

### 2. Environment Variables ✓
- Created `.env.production.example` template
- Added production configuration comments to `.env`
- WebSocket protocol automatically switches:
  - `http://` → uses `ws://`
  - `https://` → uses `wss://` (required for HTTPS sites)

---

## 📋 Deployment Steps

### Step 1: Backend Deployment

1. **Deploy your backend** to a hosting service:
   - Options: Heroku, Railway, Render, DigitalOcean, AWS, etc.
   - Ensure port 5000 is exposed (or configure your chosen port)

2. **Enable WebSocket support:**
   - Make sure your hosting platform supports WebSockets
   - Backend already has WebSocket server at `/ws/collaboration`
   - No code changes needed in backend

3. **Configure CORS:**
   - Update `backend/src/server.js` CORS origins to include your frontend domain
   - Example: `https://your-frontend.vercel.app`

4. **Get your backend URL:**
   - Example: `https://etherx-backend.herokuapp.com`

### Step 2: Frontend Deployment

1. **Create `.env.production` file:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Update production environment variables:**
   ```env
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   VITE_API_URL=https://your-backend-domain.com
   ```

3. **Build the frontend:**
   ```bash
   npm run build
   ```

4. **Deploy to hosting service:**
   - Options: Vercel, Netlify, GitHub Pages, AWS S3, etc.
   - Upload the `dist/` folder

### Step 3: Test Collaboration

1. **Open your deployed frontend** in two different browsers
2. **Log in with different accounts**
3. **User 1:** Create a spreadsheet and click "Collaborate" → Generate Share Link
4. **User 2:** Open the share link
5. **Move your mouse** → You should see live cursors! 🎉

---

## 🔧 Platform-Specific Instructions

### Deploying to Vercel (Frontend)

```bash
npm install -g vercel
vercel login
vercel
```

In Vercel dashboard:
- Add environment variables from `.env.production`
- `VITE_API_URL=https://your-backend.com`

### Deploying to Heroku (Backend)

```bash
cd backend
heroku create etherx-backend
git push heroku main
heroku open
```

Your backend URL: `https://etherx-backend.herokuapp.com`

### Deploying to Railway (Backend)

1. Go to railway.app
2. Connect your GitHub repo
3. Select `backend` folder as root directory
4. Deploy automatically
5. Get your URL: `https://etherx-backend.railway.app`

---

## ✅ Features That Will Work After Deployment

1. **Live Cursor Tracking** ✓
   - Real-time mouse movement tracking
   - Canva-style cursor visualization
   - User name labels with colors
   - Animated cursor pointers

2. **Real-time Collaboration** ✓
   - Cell editing updates
   - Live typing preview
   - Selection range visibility
   - Cell locking

3. **IPFS Auto-Save** ✓
   - Automatic uploads to Pinata every 30 seconds
   - Decentralized storage
   - Permanent backups

4. **WebSocket Collaboration** ✓
   - Multi-user presence
   - Bi-directional updates
   - Secure WebSocket (wss://) for HTTPS

---

## 🐛 Troubleshooting

### If cursors don't show after deployment:

1. **Check browser console:**
   - Look for: `🔌 Connecting to WebSocket: wss://...`
   - Should see: `🔌 WebSocket connected`

2. **Verify WebSocket connection:**
   - Open Network tab → WS filter
   - Should see active WebSocket connection
   - Status should be "101 Switching Protocols"

3. **Check backend logs:**
   - Look for: `✅ User [name] joined document [id]`
   - Should see cursor update messages

4. **Common issues:**
   - ❌ Mixed content (HTTP frontend + HTTPS backend)
   - ❌ CORS not configured for your frontend domain
   - ❌ WebSocket not supported by hosting platform
   - ❌ Firewall blocking WebSocket connections

### Solutions:

1. **Both frontend and backend must use HTTPS** (or both HTTP)
2. **Update CORS origins** in `backend/src/server.js`
3. **Use wss://** for secure WebSocket with HTTPS
4. **Check hosting platform** supports WebSockets

---

## 🎯 Quick Test Command

After deployment, test WebSocket connection:

```bash
# Replace with your deployed backend URL
wscat -c wss://your-backend.com/ws/collaboration
```

Should connect successfully. Then send:
```json
{"type":"join","payload":{"documentId":"test","userId":"test-user","userName":"Test","permission":"editor"}}
```

---

## 📊 What Happens in Production

1. **User opens app** → Frontend loaded from Vercel/Netlify
2. **User logs in** → Firebase Authentication
3. **User creates spreadsheet** → Generates unique ID
4. **Collaboration starts:**
   - Frontend connects to: `wss://your-backend.com/ws/collaboration`
   - Backend accepts WebSocket connection
   - User joins document room
5. **Mouse movement:**
   - Frontend sends cursor updates via WebSocket
   - Backend broadcasts to all users in same room
   - Other users see cursor in real-time
6. **IPFS auto-save:**
   - Every 30 seconds → uploads to Pinata
   - Data stored permanently on IPFS
   - Hash stored in localStorage

---

## ✨ Summary

**YES, live cursors WILL work after deployment!** 

The code is now configured to:
- ✅ Automatically use the correct WebSocket URL
- ✅ Support both development (ws://) and production (wss://)
- ✅ Work with any backend hosting platform
- ✅ Enable secure WebSocket for HTTPS sites

**Just update `.env.production` with your backend URL and deploy!** 🚀
