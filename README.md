
  # EtherX Excel - Complete Spreadsheet Application

A full-stack spreadsheet application with real-time collaboration, import/export, and modern UI.


## ✨ Features

- **Authentication**: OTP-based email/phone login
- **Spreadsheet Management**: Create, read, update, delete spreadsheets
- **Collaboration**: Share with others, invite users, set permissions
- **Cell Editing**: Create/update rows, formatting, formulas
- **Import/Export**: CSV import and export functionality
- **Version History**: Track changes and restore versions
- **Comments**: Cell-level comments and discussions
- **Real-time Sync**: Auto-save and collaborative editing

## 🏗️ Architecture

```
EtherX Excel/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # React components
│   ├── services/
│   │   └── spreadsheetAdapter.ts  # API adapter layer
│   ├── types/                # TypeScript types
│   └── App.tsx               # Main app
├── backend/                  # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth, error handling
│   │   ├── utils/            # Database helpers
│   │   └── server.js         # Server entry point
│   ├── tests/                # Integration tests
│   ├── .env                  # Environment variables
│   └── package.json
├── package.json              # Root package with dev scripts
├── .env                      # Frontend env config
└── .env.example              # Environment template
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Environment Setup

Copy environment files:

```bash
# Frontend
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```

### 4. Run Development Environment

**Option A: Run both frontend and backend together**
```bash
npm start
```

This uses `concurrently` to run:
- Frontend at `http://localhost:5173`
- Backend at `http://localhost:3001`

**Option B: Run separately**

Terminal 1 - Frontend:
```bash
npm run start:client
```

Terminal 2 - Backend:
```bash
npm run start:server
```

## 🧪 Testing

### Run Integration Tests

Test the three critical endpoints (create row, update row, import/export):

```bash
npm run test:integration
```

### Test Critical Endpoints Manually

**1. Test Login (OTP)**
```bash
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone": "test@example.com"}'

# Response includes mock_otp in dev mode
# Use the OTP to verify:
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone": "test@example.com", "otp": "123456"}'
```

**2. Create Spreadsheet**
```bash
curl -X POST http://localhost:3001/api/spreadsheets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"name": "My Spreadsheet"}'
```

**3. Create Row (CRITICAL)**
```bash
curl -X POST http://localhost:3001/api/cells/rows/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "spreadsheetId": "<sheet_id>",
    "sheetId": "<sheet_id>",
    "rowNumber": 1,
    "rowData": {"A1": "John", "B1": "Doe", "C1": "25"}
  }'
```

**4. Update Row (CRITICAL)**
```bash
curl -X POST http://localhost:3001/api/cells/rows/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "spreadsheetId": "<sheet_id>",
    "sheetId": "<sheet_id>",
    "rowNumber": 1,
    "rowData": {"A1": "Jane", "B1": "Smith", "C1": "30"}
  }'
```

**5. Import Data (CRITICAL)**
```bash
curl -X POST http://localhost:3001/api/import-export/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "spreadsheetId": "<sheet_id>",
    "sheetId": "<sheet_id>",
    "data": "Name,Age,City\nJohn,25,NYC\nJane,30,LA",
    "format": "csv"
  }'
```

**6. Export Data (CRITICAL)**
```bash
curl -X GET 'http://localhost:3001/api/import-export/export?spreadsheetId=<sheet_id>&sheetId=<sheet_id>&format=csv' \
  -H "Authorization: Bearer <your_token>"
```

## 🔌 API Documentation

### Authentication

- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP and get token
- `POST /api/auth/signup` - Create new account
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Spreadsheets

- `GET /api/spreadsheets` - List user's spreadsheets
- `POST /api/spreadsheets` - Create new spreadsheet
- `GET /api/spreadsheets/:id` - Get spreadsheet details
- `PUT /api/spreadsheets/:id` - Update spreadsheet
- `DELETE /api/spreadsheets/:id` - Delete spreadsheet

### Cells (Critical Operations)

- `POST /api/cells/rows/create` - **CREATE ROW** (Critical)
- `POST /api/cells/rows/update` - **UPDATE ROW** (Critical)
- `DELETE /api/cells/:spreadsheetId/:cellId` - Delete cell

### Import/Export (Critical Operations)

- `POST /api/import-export/import` - **IMPORT DATA** (Critical)
- `GET /api/import-export/export` - **EXPORT DATA** (Critical)

## 🔐 Authentication

The API uses JWT tokens. Include in all requests:

```
Authorization: Bearer <token>
```

## 📝 Manual Testing Checklist

- [ ] **Login Flow**
  - [ ] Send OTP works for email
  - [ ] Send OTP works for phone
  - [ ] OTP verification succeeds with correct code
  - [ ] OTP verification fails with incorrect code
  - [ ] JWT token is stored after login
  - [ ] User profile loads on /me endpoint

- [ ] **Spreadsheet CRUD**
  - [ ] Create new spreadsheet succeeds
  - [ ] List shows all user's spreadsheets
  - [ ] Get spreadsheet returns all sheets and cells
  - [ ] Update spreadsheet name works
  - [ ] Delete spreadsheet removes data

- [ ] **Create Row (Critical)**
  - [ ] Row creation with multiple columns succeeds
  - [ ] Created cells are retrievable via GET
  - [ ] Activity log records the action
  - [ ] Cells without viewer role cannot create (403)

- [ ] **Update Row (Critical)**
  - [ ] Existing row update succeeds
  - [ ] New cells are created if they don't exist
  - [ ] Updated values match what was sent
  - [ ] Activity log records updates
  - [ ] Viewers cannot update (403)

- [ ] **Import/Export (Critical)**
  - [ ] CSV import parses correctly
  - [ ] Cells are created/updated from import
  - [ ] Export returns valid CSV format
  - [ ] Round-trip (import → export) preserves data
  - [ ] Viewers cannot import (403)
  - [ ] Large CSV files (1000+ rows) import successfully

- [ ] **Permissions**
  - [ ] Owner can perform all operations
  - [ ] Editors can create/update cells
  - [ ] Viewers can read but not modify
  - [ ] Non-collaborators get 403 error

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is already in use
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill existing process and restart
npm run start:server
```

### Frontend can't connect to backend
```bash
# Verify .env file has correct API URL
cat .env
# Should show: VITE_API_BASE_URL=http://localhost:3001/api

# Check CORS headers in backend response
curl -v http://localhost:3001/api/health
```

### Database issues
```bash
# Remove existing database and reinitialize
rm -rf backend/data/etherx.db
npm run start:server
```

## 📦 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Railway)
```bash
cd backend
npm start
```

Set environment variables:
- `PORT`: 3001
- `NODE_ENV`: production
- `JWT_SECRET`: strong-random-secret
- `FRONTEND_URL`: https://your-frontend-domain.com

## 🔄 Data Adapter Layer

The `src/services/spreadsheetAdapter.ts` file provides a unified API interface:

- Normalizes backend responses to frontend data structures
- Handles token management
- Provides error handling and type safety
- Maps camelCase (frontend) ↔ snake_case (backend) fields

**TODO**: If backend field names change, update normalization functions:
- `normalizeSpreadsheet()`
- `normalizeSheet()`
- `normalizeCell()`

## 📋 Implementation Notes

- **Database**: SQLite with WAL mode for concurrency
- **Auth**: JWT with 7-day expiration
- **CORS**: Enabled for localhost:5173 (configurable via .env)
- **Error Handling**: Structured error responses with codes
- **Logging**: Console logging (extend with proper logging service)

## ⚠️ Known Limitations & TODOs

- [ ] Real-time WebSocket collaboration not yet implemented
- [ ] OTP uses mock service (integrate Twilio/SendGrid for production)
- [ ] Email verification not implemented
- [ ] Rate limiting not yet added (recommended: 100 requests/minute)
- [ ] Audit logging is basic (should add structured audit trail)
- [ ] Image upload endpoints not implemented
- [ ] Google Drive/Dropbox integrations not implemented

## 🤝 Contributing

Before making changes:
1. Run tests: `npm run test:integration`
2. Add TODOs for risky or uncertain changes
3. Test all three critical endpoints
4. Update .env.example if new env variables are added

## 📄 License

MIT
