// Production-Ready Configuration
// Centralized config with fallbacks for all external services

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Configuration with failover
const getApiUrl = () => {
  // Priority: 1. VITE_BACKEND_URL 2. VITE_API_URL 3. VITE_API_BASE_URL 4. Production detection 5. Development default
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (backendUrl) return backendUrl.replace(/\/api$/, '');
  if (apiUrl) return apiUrl.replace(/\/api$/, '');
  if (apiBaseUrl) return apiBaseUrl.replace(/\/api$/, '');
  
  // Production: Require explicit configuration
  if (isProduction) {
    console.error('❌ PRODUCTION: VITE_BACKEND_URL environment variable is REQUIRED');
    console.error('Set VITE_BACKEND_URL to your deployed backend URL (e.g., https://backend.example.com)');
    // Fallback to current domain assumption (may not work)
    if (typeof window !== 'undefined') {
      const currentDomain = window.location.origin;
      return currentDomain.replace('www.', '').replace('.vercel.app', '-api.vercel.app');
    }
  }
  
  // Development default
  return 'http://localhost:5000';
};

const getWebSocketUrl = (apiUrl: string) => {
  const protocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '');
  return `${protocol}://${host}/ws/collaboration`;
};

export const config = {
  // Environment
  isDevelopment,
  isProduction,
  
  // API URLs
  api: {
    baseUrl: getApiUrl(),
    apiUrl: getApiUrl() + '/api',
    websocketUrl: getWebSocketUrl(getApiUrl()),
    timeout: 30000, // 30 seconds
  },
  
  // IPFS / Pinata
  ipfs: {
    jwt: import.meta.env.VITE_PINATA_JWT || '',
    apiKey: import.meta.env.VITE_PINATA_API_KEY || '',
    secretKey: import.meta.env.VITE_PINATA_SECRET_KEY || '',
    enabled: Boolean(import.meta.env.VITE_PINATA_JWT && 
                     import.meta.env.VITE_PINATA_JWT !== 'your_pinata_jwt_token_here'),
    uploadUrl: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs',
    dashboardUrl: 'https://app.pinata.cloud',
  },
  
  // EmailJS
  emailjs: {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_b73tfnj',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_pfm0j6i',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '525kFqS7-tMAs3TFC',
  },
  
  // Firebase
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB14OXytCuSBA-SBQcLLX0lYPWQXGiZ_IY',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'etherx-excel.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'etherx-excel',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'etherx-excel.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '460125247936',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:460125247936:web:cc86143b42410fc9305025',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-RHG1PZSBT1',
  },
  
  // Features
  features: {
    enableCollaboration: true,
    enableIPFS: true,
    enableRealTimeSync: true,
    enableOfflineMode: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    autoSaveInterval: 30000, // 30 seconds
  },
  
  // Debug
  debug: isDevelopment,
  logLevel: isDevelopment ? 'debug' : 'error',
};

// Validate critical configuration
if (isProduction) {
  const criticalMissing: string[] = [];
  
  if (!config.firebase.apiKey || config.firebase.apiKey === 'your_firebase_api_key') {
    criticalMissing.push('VITE_FIREBASE_API_KEY');
  }
  
  if (criticalMissing.length > 0) {
    console.error('⚠️ CRITICAL: Missing production configuration:', criticalMissing.join(', '));
    console.error('Set these environment variables in your deployment platform.');
  }
}

// Log configuration (only in development)
if (isDevelopment) {
  console.log('🔧 App Configuration:', {
    environment: isProduction ? 'production' : 'development',
    apiUrl: config.api.baseUrl,
    websocketUrl: config.api.websocketUrl,
    ipfsEnabled: config.ipfs.enabled,
    features: config.features,
  });
}

export default config;
