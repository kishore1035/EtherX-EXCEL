# Quick Deployment Reference Card

## Problem Being Solved

Your frontend on Vercel tries to reach `localhost:5000` (local backend) - this doesn't work in production.

**Solution**: Deploy backend to production and update environment variables.

---

## Quick Start (5 Steps)

### Step 1: Deploy Backend

Choose one platform and follow its setup:

**Option A: Railway (Easiest)**
```bash
cd backend
railway init
railway up
# Wait for deployment, note the URL: https://xxxx.up.railway.app
```

**Option B: Render**
- Go to render.com → New + → Web Service
- Connect GitHub repository
- Root directory: `backend/`
- Deploy

**Option C: Vercel**
- Go to vercel.com → New Project
- Import repository
- Root directory: `backend/`
- Deploy

Get your **Backend URL**: Will look like `https://etherx-backend.railway.app`

---

### Step 2: Set Backend Environment Variables

In your hosting dashboard (Railway/Render/Vercel):

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://etherxsuite.vercel.app
CORS_ALLOW_ALL=true
JWT_SECRET=generate-a-random-string-here
REFRESH_TOKEN_SECRET=generate-another-random-string
DATABASE_URL=./data/etherx.db
```

**Generate random strings:**
```bash
# On Mac/Linux:
openssl rand -base64 32
```

---

### Step 3: Update Frontend Environment Variables in Vercel

Go to: **vercel.com** → Your Project → **Settings** → **Environment Variables**

Add these for **Production**:

```env
VITE_BACKEND_URL=https://etherx-backend.railway.app
VITE_API_BASE_URL=https://etherx-backend.railway.app/api
VITE_WS_URL=wss://etherx-backend.railway.app/ws/collaboration
```

Replace `etherx-backend.railway.app` with YOUR backend URL.

---

### Step 4: Redeploy Frontend

In Vercel:
1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Wait for build to complete

---

### Step 5: Test

Open: https://etherxsuite.vercel.app

Then:
1. Press F12 (open DevTools)
2. Go to **Console** tab
3. Create a new spreadsheet (File → New)
4. Add some data and save
5. Look for: `✅ Document uploaded to IPFS:`

**If you see CORS error:**
- Check backend logs
- Verify FRONTEND_URL matches your Vercel URL exactly
- Make sure CORS_ALLOW_ALL=true is set

---

## Environment Variable Mapping

| Frontend Variable | Example Value | Purpose |
|---|---|---|
| `VITE_BACKEND_URL` | `https://etherx-backend.railway.app` | Base URL for all API calls |
| `VITE_API_BASE_URL` | `https://etherx-backend.railway.app/api` | REST API endpoint |
| `VITE_WS_URL` | `wss://etherx-backend.railway.app/ws/collaboration` | WebSocket for real-time |

| Backend Variable | Example Value | Purpose |
|---|---|---|
| `FRONTEND_URL` | `https://etherxsuite.vercel.app` | Allow CORS from frontend |
| `JWT_SECRET` | Random 32-char string | Sign authentication tokens |
| `NODE_ENV` | `production` | Enable production mode |
| `PORT` | `5000` | Server port |

---

## Critical Notes

### ✅ What MUST Be Done
- [ ] Backend deployed to production
- [ ] VITE_BACKEND_URL set in Vercel
- [ ] FRONTEND_URL set in backend
- [ ] Frontend redeployed after env var changes
- [ ] Backend restarted after env var changes

### ❌ Common Mistakes
- Setting VITE_BACKEND_URL to `localhost:5000` in production
- Forgetting to redeploy frontend after env changes
- Not setting FRONTEND_URL in backend
- Using `http://` when frontend is `https://` (needs `wss://` for WebSocket)

### 🔧 URLs Must Match
```
Frontend URL: https://etherxsuite.vercel.app
Backend URL: https://etherx-backend.railway.app
FRONTEND_URL Env: https://etherxsuite.vercel.app ← MUST match
VITE_BACKEND_URL Env:https://etherx-backend.railway.app
```

---

## Troubleshooting

### CORS Blocked
```
Error: Access to fetch blocked by CORS policy
```
**Fix**:
1. Check backend logs: Is origin being blocked?
2. Verify FRONTEND_URL matches your actual Vercel URL
3. Set CORS_ALLOW_ALL=true temporarily to test

### IPFS Upload Fails
```
❌ Failed to upload document to IPFS: TypeError: Failed to fetch
```
**Fix**:
1. Test backend: `curl https://your-backend-url/api/health`
2. Check CORS headers are present in response
3. Verify backend is running (check logs)

### WebSocket Won't Connect
```
🔌 WebSocket disconnected
🔄 Attempting to reconnect...
```
**Fix**:
1. Check VITE_WS_URL starts with `wss://` (not `ws://`)
2. Verify backend is running
3. Check backend WebSocket support (`/ws/collaboration` route)

---

## Need to Update Again?

If you change environment variables:

**Backend**:
1. Update in hosting dashboard
2. Restart the service (usually automatic)
3. Verify with `curl` test

**Frontend**:
1. Update in Vercel Settings → Environment Variables
2. Go to Deployments
3. Click "Redeploy" on current deployment
4. Wait for build

---

## Service Status

Check if everything is running:

```bash
# Backend health check
curl https://your-backend-url/api/health

# Should return:
# {"ok":true,"status":"ok","pid":123,"uptime":456}
```

---

## Files Modified/Created

The following changes were made to fix deployment:

### Code Changes
- ✅ `src/config/index.ts` - Now properly uses VITE_BACKEND_URL
- ✅ `src/services/ipfsDocumentService.ts` - Uses centralized config
- ✅ `src/services/documentStateSave.ts` - Uses centralized config
- ✅ `backend/src/server.js` - Improved CORS error messages

### Documentation Created
- ✅ `PRODUCTION_DEPLOYMENT_SETUP.md` - Detailed deployment guide
- ✅ `.env.example` - Updated with production examples
- ✅ `.env.production.example` - New production template
- ✅ `backend/.env.production.example` - Backend production template

---

## Next Steps After Deployment

1. **Monitor Logs**
   - Backend: Check for errors
   - Frontend: Monitor browser console in production

2. **Set Up Backups**
   - Database backups (if using PostgreSQL)
   - IPFS pins (consider Pinata for pinning service)

3. **Enable Features**
   - Email/SMS OTP (currently in mock mode)
   - Email notifications
   - Real-time monitoring/alerting

4. **Security**
   - Rotate JWT secrets periodically
   - Enable rate limiting
   - Monitor for unusual API usage

5. **Performance**
   - Monitor response times
   - Consider caching for frequently accessed data
   - Monitor database performance

---

## Support

If issues persist after following these steps:

1. **Check Browser Console** (F12)
   - Look for specific error messages
   - Network tab shows actual CORS headers

2. **Check Backend Logs**
   - Railway: Dashboard → Logs
   - Render: Dashboard → Logs
   - Vercel: Deployments → Logs

3. **Test Directly**
   ```bash
   # Test backend API
   curl -H "Origin: https://etherxsuite.vercel.app" \
        https://your-backend-url/api/health
   
   # Look for: Access-Control-Allow-Origin header in response
   ```

4. **Verify Configuration**
   - Backend FRONTEND_URL matches frontend URL exactly
   - Frontend VITE_BACKEND_URL matches backend URL exactly
   - Protocols match (https + wss)

