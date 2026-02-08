# EtherX Excel - Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- A hosting platform (Vercel, Netlify, Railway, Render, etc.)
- Domain name (optional but recommended)

---

## 📦 Backend Deployment

### 1. Environment Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS) - REPLACE WITH YOUR ACTUAL FRONTEND DOMAIN
FRONTEND_URL=https://your-frontend-domain.com

# Authentication - MUST CHANGE THESE IN PRODUCTION!
JWT_SECRET=<generate-a-strong-random-secret-here>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=<generate-another-strong-random-secret-here>
REFRESH_TOKEN_EXPIRES_IN=30d

# OTP Service
OTP_SERVICE=mock
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3

# Database
DATABASE_URL=./data/etherx.db

# Optional: Third-party integrations
# SENDGRID_API_KEY=your-sendgrid-api-key-for-emails
# TWILIO_ACCOUNT_SID=your-twilio-sid
# TWILIO_AUTH_TOKEN=your-twilio-token
# TWILIO_PHONE_NUMBER=+1234567890
```

**⚠️ CRITICAL SECURITY STEPS:**

1. **Generate Strong Secrets:**
   ```bash
   # Run this in your terminal to generate random secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and use it for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`.

2. **Update FRONTEND_URL:**
   Replace `https://your-frontend-domain.com` with your actual deployed frontend URL.

3. **Never commit `.env` to git:**
   The `.env` file is already in `.gitignore`. Double-check before pushing.

### 2. Deployment Steps (Example: Railway)

1. **Install Railway CLI:**
   ```bash
   npm install -g railway
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize Railway project:**
   ```bash
   cd backend
   railway init
   ```

4. **Add environment variables:**
   - Go to Railway dashboard
   - Click on your project
   - Go to "Variables" tab
   - Add all variables from your `.env` file

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Get your backend URL:**
   - Railway will provide a URL like `https://your-app.railway.app`
   - Copy this URL for frontend configuration

### 3. Alternative: Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from the dashboard
6. Deploy

---

## 🌐 Frontend Deployment

### 1. Environment Configuration

Create/update `.env` file in the root directory:

```env
# API Configuration - REPLACE WITH YOUR DEPLOYED BACKEND URL
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_API_URL=https://your-backend-domain.com

# Pinata IPFS Configuration (if using IPFS features)
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key

# EmailJS Configuration (for email features)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Firebase Configuration (if using Firebase features)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**⚠️ IMPORTANT:**
- Replace `https://your-backend-domain.com` with your actual deployed backend URL from step above
- If you don't have Pinata/EmailJS/Firebase, you can leave those as is (some features may not work)

### 2. Build the Frontend

```bash
npm install
npm run build
```

This creates an optimized production build in the `dist/` folder.

### 3. Deployment Steps (Example: Vercel)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Add environment variables:**
   - Go to Vercel dashboard
   - Click on your project
   - Go to "Settings" → "Environment Variables"
   - Add all variables from your `.env` file

5. **Redeploy after adding env vars:**
   ```bash
   vercel --prod
   ```

### 4. Alternative: Deploy to Netlify

1. Build the project: `npm run build`
2. Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)
3. Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

---

## 🔐 Post-Deployment Security Checklist

- [ ] Changed all default JWT secrets to strong random values
- [ ] Updated CORS configuration with actual frontend domain
- [ ] Verified HTTPS is enabled on both frontend and backend
- [ ] Tested authentication flow works in production
- [ ] Confirmed templates load correctly
- [ ] Tested collaboration links work across deployment
- [ ] Set up proper error logging/monitoring (optional: Sentry)
- [ ] Configured database backups (important!)

---

## 🧪 Testing Templates in Production

After deployment, test templates:

1. **Login to your deployed app**
2. **Click on "Templates" or "New from Template"**
3. **Select any template (e.g., "Business Report")**
4. **Verify:**
   - Template loads without errors
   - All data populates correctly
   - Formulas work
   - Styling is preserved

If templates don't load:
- Check browser console for errors
- Verify `VITE_API_URL` in frontend `.env` matches backend URL
- Check backend logs for authentication errors
- Ensure you're logged in (templates require authentication)

---

## 🐛 Common Issues

### Templates return 401 Unauthorized
**Cause:** Template routes now require authentication.
**Solution:** Make sure you're logged in before accessing templates.

### Templates return 404 Not Found
**Cause:** API URL mismatch between frontend and backend.
**Solution:** 
- Check `VITE_API_URL` in frontend `.env`
- Verify backend is actually running at that URL
- Check browser network tab for the actual URL being called

### CORS Errors in Production
**Cause:** Backend CORS not configured for frontend domain.
**Solution:** 
- Update `FRONTEND_URL` in backend `.env`
- Make sure it matches exactly (including https/http)
- Redeploy backend after changing env vars

### Database Errors in Production
**Cause:** SQLite database file not persisted.
**Solution:** 
- For Railway/Render: Add a volume mount for `./data/`
- Or migrate to PostgreSQL for production (recommended)

---

## 📊 Monitoring Template Usage

Templates are hardcoded in the backend (`backend/src/controllers/templatesController.js`), so they:
- ✅ Will NOT vanish after deployment
- ✅ Are version-controlled in your codebase
- ✅ Load from server on every request (fresh data)
- ✅ Require authentication (secure)

To add custom template logging, check backend logs when templates are accessed.

---

## 🔄 Updating Templates

To add/modify templates after deployment:

1. Edit `backend/src/controllers/templatesController.js`
2. Add or modify templates in the `TEMPLATES` object
3. Commit changes to git
4. Redeploy backend
5. No database migration needed (templates are code-based)

---

## 📧 Support

For deployment issues:
- Check the [README.md](./README.md) for local development setup
- Review backend logs for detailed error messages
- Verify all environment variables are set correctly
- Test locally first with production env vars

**Happy Deploying! 🚀**
