#!/bin/bash

# EtherX Excel - Production Deployment Script
# Run this script to prepare for deployment

echo "🚀 Preparing EtherX Excel for Production Deployment..."
echo ""

# Colors
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from template...${NC}"
    cp .env.production.example .env.production
    echo -e "${RED}❌ Please edit .env.production with your production values!${NC}"
    echo "   Set VITE_API_URL to your backend URL"
    exit 1
fi

# Validate environment variables
echo "📋 Validating environment variables..."

if ! grep -q "VITE_API_URL=https://" .env.production; then
    echo -e "${YELLOW}⚠️  Warning: VITE_API_URL should use HTTPS in production${NC}"
fi

if grep -q "localhost" .env.production; then
    echo -e "${RED}❌ Error: .env.production contains 'localhost'${NC}"
    echo "   Update all URLs to production domains"
    exit 1
fi

echo -e "${GREEN}✅ Environment validation passed${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run tests (if they exist)
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    echo "🧪 Running tests..."
    npm test || {
        echo -e "${RED}❌ Tests failed!${NC}"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
fi

# Build frontend
echo "🏗️  Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Check build size
BUILD_SIZE=$(du -sh build | cut -f1)
echo "📊 Build size: $BUILD_SIZE"
echo ""

# Backend check
if [ -d "backend" ]; then
    echo "🔧 Checking backend..."
    cd backend
    
    if [ ! -f ".env.production" ]; then
        echo -e "${YELLOW}⚠️  backend/.env.production not found. Creating from template...${NC}"
        cp .env.production.example .env.production
        echo -e "${RED}❌ Please edit backend/.env.production with your values!${NC}"
        exit 1
    fi
    
    npm ci --production=false
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    cd ..
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Production build ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Frontend Deployment:"
echo "   - Deploy the 'build/' folder to Vercel/Netlify/CloudFlare"
echo "   - Or run: vercel --prod"
echo "   - Or run: netlify deploy --prod --dir=build"
echo ""
echo "2. Backend Deployment:"
echo "   - Deploy 'backend/' folder to Heroku/Railway/Render"
echo "   - Set environment variables in your platform"
echo "   - Ensure PORT, FRONTEND_URL, CORS_ALLOW_ALL are set"
echo ""
echo "3. Update .env.production:"
echo "   - Set VITE_API_URL to your deployed backend URL"
echo "   - Rebuild: npm run build"
echo "   - Redeploy frontend"
echo ""
echo "4. Test:"
echo "   - Open your deployed frontend URL"
echo "   - Test live collaboration with 2 users"
echo "   - Check IPFS auto-save is working"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
