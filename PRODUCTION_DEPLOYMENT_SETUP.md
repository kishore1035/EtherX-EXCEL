# Production Deployment Setup Guide

This guide covers deploying both the frontend and backend for the EtherX Excel application to production.

## Overview

The system consists of:
- **Frontend**: React + TypeScript (deployed on Vercel)
- **Backend**: Node.js + Express (deployed on Railway, Render, Vercel, or similar)
- **IPFS**: Documents stored on IPFS via backend
- **Real-time Collaboration**: WebSocket connections via backend

## Prerequisites

1. **Backend Deployment Service**: Railway, Render, Heroku, or any Node.js hosting
2. **Frontend Deployment**: Already on Vercel (https://etherxsuite.vercel.app)
3. **IPFS Setup**: Backend includes IPFS support (or use Pinata)
4. **Environment Variables**: Both frontend and backend need proper configuration

## Step 1: Deploy Backend

### Option A: Deploy to Railway (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Clone Repository**
   ```bash
   git clone <your-repo>
   cd EtherXExcelFinal-main
   ```

3. **Deploy Backend**
   ```bash
   cd backend
   railway init
   railway up
   ```

4. **Set Environment Variables in Railway Dashboard**
   ```
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://etherxsuite.vercel.app
   CORS_ALLOW_ALL=true
   JWT_SECRET=<generate-a-secure-random-string>
   REFRESH_TOKEN_SECRET=<generate-another-secure-random-string>
   DATABASE_URL=./data/etherx.db
   ```

5. **Get Backend URL**
   - Your backend will be available at: `https://<railway-generated-domain>.up.railway.app`
   - Copy this URL - you'll need it for the frontend

### Option B: Deploy to Render

1. **Create Render Account**
   - Go to https://render.com
   - Connect GitHub account

2. **Create New WebService**
   - Connect your repository
   - Set root directory to `backend/`
   - Build command: `npm install`
   - Start command: `npm start`

3. **Set Environment Variables**
   - In Render dashboard, go to Environment tab
   - Add all variables from `.env.production.example`

4. **Get Backend URL**
   - Available at: `https://<service-name>.onrender.com`

### Option C: Deploy to Vercel

1. **Create Vercel Project**
   - Go to https://vercel.com
   - Import your repository

2. **Configure for Backend**
   - Root directory: `backend/`
   - Framework: Other
   - Build command: `npm install`
   - Output directory: (leave empty)
   - Start command: `npm start`

3. **Set Environment Variables** in Vercel dashboard

4. **Get Backend URL**
   - Available at: `https://<project-name>.vercel.app`

## Step 2: Update Frontend Environment Variables

### In Vercel Dashboard

1. **Go to Settings → Environment Variables**

2. **Add these variables**:
   ```
   VITE_BACKEND_URL=https://<your-backend-url>
   VITE_API_BASE_URL=https://<your-backend-url>/api
   VITE_WS_URL=wss://<your-backend-domain>/ws/collaboration
   ```

3. **Keep existing variables**:
   - All Firebase credentials
   - EmailJS credentials
   - Pinata/IPFS credentials

### Example Values

If your backend is deployed at `https://etherx-backend.railway.app`:

```
VITE_BACKEND_URL=https://etherx-backend.railway.app
VITE_API_BASE_URL=https://etherx-backend.railway.app/api
VITE_WS_URL=wss://etherx-backend.railway.app/ws/collaboration
```

## Step 3: Verify CORS Configuration

### Backend Side

The backend automatically allows:
- Vercel, Netlify, Heroku, Railway, Render preview URLs (when `CORS_ALLOW_ALL=true`)
- URLs specified in `FRONTEND_URL` and `ALLOWED_ORIGINS` env variables

### Frontend Test

1. Open your deployed app: https://etherxsuite.vercel.app
2. Open browser console (F12)
3. Create a new spreadsheet
4. Try to save - you should see IPFS upload logs instead of CORS errors

If still seeing CORS errors:
1. Check backend logs for blocked origins
2. Verify `FRONTEND_URL` env variable is set correctly
3. Ensure backend process is running

## Step 4: Test the Setup

### Test Document Save to IPFS

1. **In your deployed app**:
   - Create a new spreadsheet
   - Add some data (cells, images, charts)
   - Trigger a save
   - Check browser console for: `✅ Document uploaded to IPFS:`

2. **Expected logs**:
   ```
   📤 Uploading document to IPFS...
   ✅ Document uploaded to IPFS: bafkrei...
   💾 Auto-saved sheet [uuid] to IPFS
   ```

3. **If you see CORS errors**:
   - IPFS upload will fail
   - But auto-save to browser cache will work
   - Check that `FRONTEND_URL` matches your actual deployment URL

### Test Real-time Collaboration

1. Open app in two browser windows
2. Make a change in one window
3. Should see update in other window within 1-2 seconds
4. Check WebSocket connection in DevTools → Network → WS tab

## Step 5: Environment Variables Reference

### Frontend (.env in Vercel)

```env
# Backend URLs (REQUIRED for production)
VITE_BACKEND_URL=https://your-backend-domain.com
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_WS_URL=wss://your-backend-domain.com/ws/collaboration

# IPFS / Pinata
VITE_PINATA_JWT=your_jwt_token
VITE_PINATA_API_KEY=your_api_key
VITE_PINATA_SECRET_KEY=your_secret_key

# EmailJS (for OTP)
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=public_key_xxxxx

# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
# ... other Firebase vars
```

### Backend (.env in hosting platform)

```env
# Server
NODE_ENV=production
PORT=5000

# CORS
FRONTEND_URL=https://etherxsuite.vercel.app
ALLOWED_ORIGINS=https://other-domains.com  # optional
CORS_ALLOW_ALL=true                        # for development/preview

# Security
JWT_SECRET=<long-random-string>
REFRESH_TOKEN_SECRET=<long-random-string>

# Database
DATABASE_URL=./data/etherx.db

# Optional services
# SENDGRID_API_KEY=...
# TWILIO_ACCOUNT_SID=...
```

## Troubleshooting

### CORS Errors

**Error**: `Access to fetch blocked by CORS policy`

**Solutions**:
1. Check backend logs: Is the origin being blocked?
2. Verify `FRONTEND_URL` environment variable matches your actual frontend URL
3. If using preview deployments, set `CORS_ALLOW_ALL=true`
4. Check that WebSocket URL starts with `wss://` (secure) for HTTPS

### IPFS Upload Fails

**Error**: `Failed to upload document to IPFS: TypeError: Failed to fetch`

**Solutions**:
1. Verify backend is running: `curl https://your-backend-url/api/health`
2. Check CORS is allowing your frontend domain
3. Ensure backend has `/api/ipfs/upload-document` endpoint
4. Check backend logs for errors

### WebSocket Connection Fails

**Error**: `WebSocket disconnected` or handshake fails

**Solutions**:
1. Verify `VITE_WS_URL` is set correctly (should start with `wss://` for HTTPS)
2. Check backend is running and listening on `/ws/collaboration`
3. Ensure backend proxy (Vercel, Railway) supports WebSocket upgrades
4. Check backend logs for WebSocket errors

### "Cannot find module" errors in backend

**Solution**: Reinstall dependencies
```bash
cd backend
rm -rf node_modules
npm install
npm start
```

## Monitoring

### Check Backend Health

```bash
curl https://your-backend-domain/api/health
```

Should return:
```json
{"ok":true,"status":"ok","pid":1234,"uptime":12345}
```

### Check Backend Logs

- **Railway**: Dashboard → Logs tab
- **Render**: Dashboard → Logs tab
- **Vercel**: Deployments → Logs tab

### Monitor IPFS Uploads

In browser console, look for:
- `📤 Uploading document to IPFS...` - Upload started
- `✅ Document uploaded to IPFS: bafkrei...` - Success
- `❌ Failed to upload document to IPFS:` - Error

## Production Checklist

- [ ] Backend deployed and running
- [ ] Frontend VITE_BACKEND_URL set to backend domain
- [ ] Frontend VITE_WS_URL set to backend WebSocket URL (wss://)
- [ ] Backend FRONTEND_URL set to frontend domain
- [ ] Backend JWT secrets generated and set
- [ ] Backend database initialized
- [ ] Test document save to IPFS works
- [ ] Test real-time collaboration works in two windows
- [ ] Check backend logs for errors
- [ ] Verify SSL certificates (https:// and wss://)

## Next Steps

1. Test thoroughly in production environment
2. Monitor logs for errors
3. Set up alerting for backend health
4. Plan for database backups
5. Consider rate limiting for API endpoints
6. Enable authentication for document sharing

## Support

For issues:
1. Check the backend logs first
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Test direct backend API calls with curl
5. Check network tab in browser DevTools for CORS headers

