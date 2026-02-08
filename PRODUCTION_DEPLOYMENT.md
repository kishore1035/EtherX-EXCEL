# 🚀 Production Deployment Guide - EtherX Excel

## ✅ Production-Ready Features

All features are now hardcoded with production fallbacks:

- ✅ **WebSocket Collaboration**: Auto-detects wss:// for HTTPS
- ✅ **IPFS Auto-Save**: Works in production with Pinata
- ✅ **API Communication**: Centralized config with fallbacks
- ✅ **CORS Configuration**: Supports Vercel/Netlify preview deployments
- ✅ **Error Handling**: Graceful fallbacks for all services
- ✅ **Build Optimization**: Code splitting and minification

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

#### Frontend (.env.production):
```env
# REQUIRED - Your deployed backend URL
VITE_API_URL=https://etherx-backend.herokuapp.com

# IPFS (Pinata) - Already configured
VITE_PINATA_JWT=<your-jwt-token>
VITE_PINATA_API_KEY=<your-api-key>
VITE_PINATA_SECRET_KEY=<your-secret-key>

# Firebase - Already configured
VITE_FIREBASE_API_KEY=AIzaSyB14OXytCuSBA-SBQcLLX0lYPWQXGiZ_IY
# ... (other Firebase configs)
```

#### Backend (.env.production):
```env
NODE_ENV=production
PORT=5000

# REQUIRED - Your deployed frontend URL
FRONTEND_URL=https://etherx-excel.vercel.app

# For multiple domains (optional)
ALLOWED_ORIGINS=https://staging.etherx.com,https://preview.etherx.com

# Enable wildcard CORS for preview deployments
CORS_ALLOW_ALL=true
```

---

## 🔧 Deployment Steps

### Method 1: Automated Script (Recommended)

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment preparation
./deploy.sh
```

This script will:
- ✅ Validate environment variables
- ✅ Install dependencies
- ✅ Run tests (if available)
- ✅ Build optimized production bundle
- ✅ Check backend configuration
- ✅ Show deployment instructions

### Method 2: Manual Deployment

#### Frontend:

```bash
# 1. Install dependencies
npm ci

# 2. Build for production
npm run build

# 3. Deploy to Vercel
npx vercel --prod

# OR Deploy to Netlify
npx netlify deploy --prod --dir=build

# OR Deploy to any static hosting
# Upload the 'build/' folder
```

#### Backend:

```bash
cd backend

# 1. Install dependencies
npm ci

# 2. Deploy to Heroku
heroku create etherx-backend
git push heroku main

# OR Deploy to Railway
railway up

# OR Deploy to Render
# Connect your repo and select backend folder
```

---

## 🌐 Platform-Specific Instructions

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Environment Variables in Vercel Dashboard:**
- Go to Project Settings → Environment Variables
- Add: `VITE_API_URL`, `VITE_PINATA_JWT`, etc.
- Redeploy after adding variables

### Netlify (Frontend)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=build
```

**Environment Variables in Netlify:**
- Site Settings → Build & Deploy → Environment
- Add all `VITE_*` variables

### Heroku (Backend)

```bash
# Create app
heroku create etherx-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://etherx.vercel.app
heroku config:set CORS_ALLOW_ALL=true

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Railway (Backend)

1. Go to railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set Root Directory to `backend`
5. Add Environment Variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=<your-frontend-url>`
   - `CORS_ALLOW_ALL=true`
6. Deploy automatically

### Render (Backend)

1. Go to render.com
2. New → Web Service
3. Connect repository
4. Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `node src/server.js`
7. Add Environment Variables
8. Create Web Service

---

## 🔍 Post-Deployment Testing

### 1. Health Check

```bash
# Backend health
curl https://your-backend.com/health

# Should return: {"ok":true,"pid":...}
```

### 2. WebSocket Test

Open browser console on your deployed frontend:

```javascript
const ws = new WebSocket('wss://your-backend.com/ws/collaboration');
ws.onopen = () => console.log('✅ WebSocket Connected');
ws.onerror = (e) => console.error('❌ WebSocket Error:', e);
```

### 3. Live Cursors Test

1. Open app in **Chrome**
2. Login with Account A
3. Create spreadsheet → Click "Collaborate" → Copy link
4. Open app in **Firefox** (or Incognito)
5. Paste link → Login with Account B
6. Move mouse → See cursors! 🎉

### 4. IPFS Auto-Save Test

1. Open browser console
2. Look for: `✅ Auto-saved to IPFS: QmXXX...`
3. Check every 30 seconds
4. If errors, verify Pinata JWT token

---

## 🐛 Troubleshooting

### Issue: "CORS Error"

**Solution:**
```bash
# Backend - Add your frontend domain
heroku config:set ALLOWED_ORIGINS=https://your-frontend.vercel.app

# OR enable wildcard
heroku config:set CORS_ALLOW_ALL=true
```

### Issue: "WebSocket connection failed"

**Symptoms:** `ERR_CONNECTION_REFUSED` or `404 on /ws/collaboration`

**Solutions:**
1. Verify backend is running: `curl https://your-backend.com/health`
2. Check WebSocket URL in console
3. Ensure backend supports WebSocket (Heroku/Railway/Render all do)
4. For Nginx: Add WebSocket upgrade headers

### Issue: "IPFS uploads failing (403)"

**Solutions:**
1. Check Pinata JWT is valid: Login to pinata.cloud
2. Verify JWT has `pinJSONToIPFS` permission
3. Check JWT expiration date
4. Generate new JWT if needed

### Issue: "Live cursors not showing"

**Checklist:**
- [ ] Both users on **same spreadsheet** (via share link)
- [ ] WebSocket connected (check console)
- [ ] Different browsers or incognito
- [ ] CORS configured correctly

---

## 📊 Production Monitoring

### Logs

**Frontend (Vercel):**
```bash
vercel logs <deployment-url>
```

**Backend (Heroku):**
```bash
heroku logs --tail
```

**Backend (Railway):**
- Dashboard → Deployments → View Logs

### Performance

Monitor in production:
- Bundle size: Check `build/` folder size
- API response times: Use browser Network tab
- WebSocket latency: Check console timestamps
- IPFS upload times: Should be < 5 seconds

---

## 🔐 Security Checklist

- [ ] Change all default secrets/tokens
- [ ] Use HTTPS for all production URLs
- [ ] Enable CORS only for trusted domains
- [ ] Set `NODE_ENV=production`
- [ ] Disable source maps (`sourcemap: false` in vite.config.ts)
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable rate limiting (backend)
- [ ] Regularly rotate API keys

---

## 🎯 Quick Reference

### URLs to Update:

| Variable | Location | Example |
|----------|----------|---------|
| `VITE_API_URL` | Frontend `.env.production` | `https://etherx-api.herokuapp.com` |
| `FRONTEND_URL` | Backend `.env.production` | `https://etherx.vercel.app` |
| `ALLOWED_ORIGINS` | Backend `.env.production` | `https://staging.etherx.com` |

### Commands:

```bash
# Build frontend
npm run build

# Deploy frontend (Vercel)
vercel --prod

# Deploy backend (Heroku)
git push heroku main

# Check backend health
curl https://your-backend.com/health

# View logs
heroku logs --tail  # Heroku
vercel logs         # Vercel
```

---

## ✅ Success Indicators

Your deployment is successful when:

1. ✅ Frontend loads without errors
2. ✅ Login works (Firebase auth)
3. ✅ Spreadsheet saves to localStorage
4. ✅ IPFS auto-save shows hash in header
5. ✅ WebSocket connects (check console)
6. ✅ Live cursors appear for 2+ users
7. ✅ No CORS errors in console
8. ✅ Health endpoint returns `{"ok":true}`

---

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Heroku Node.js Guide](https://devcenter.heroku.com/categories/nodejs-support)
- [Railway Deployment Guide](https://docs.railway.app/deploy/deployments)
- [WebSocket on Heroku](https://devcenter.heroku.com/articles/node-websockets)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs for API errors
3. Verify all environment variables are set
4. Test locally with production build: `npm run build && npm run preview`
5. Review this guide's troubleshooting section

---

**You're now ready for production! 🚀**

All features are hardcoded with intelligent fallbacks. The app will work seamlessly in production with proper environment variables configured.
