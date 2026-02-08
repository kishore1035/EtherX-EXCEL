import axios from 'axios';

// Pinata API configuration - Access Vite env variables correctly
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || 'your_pinata_api_key';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || 'your_pinata_secret_key';
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || 'your_pinata_jwt';

// Rate limiting configuration
let lastUploadTime = 0;
const MIN_UPLOAD_INTERVAL = 5000; // 5 seconds between uploads
let uploadQueue: Array<{resolve: Function, reject: Function, data: any, filename: string}> = [];
let isProcessingQueue = false;
let ipfsEnabled = true; // Flag to disable IPFS if credentials are invalid

console.log('Pinata Config:', {
  apiKey: PINATA_API_KEY?.substring(0, 10) + '...',
  ipfsEnabled: PINATA_JWT && PINATA_JWT !== 'your_pinata_jwt',
  jwtLength: PINATA_JWT?.length,
  jwtStart: PINATA_JWT?.substring(0, 20) + '...'
});

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

// Process upload queue with rate limiting
const processUploadQueue = async () => {
  if (isProcessingQueue || uploadQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (uploadQueue.length > 0) {
    const now = Date.now();
    const timeSinceLastUpload = now - lastUploadTime;
    
    if (timeSinceLastUpload < MIN_UPLOAD_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_UPLOAD_INTERVAL - timeSinceLastUpload));
    }
    
    const item = uploadQueue.shift();
    if (!item) continue;
    
    try {
      const result = await uploadToIPFSInternal(item.data, item.filename);
      lastUploadTime = Date.now();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    }
  }
  
  isProcessingQueue = false;
};

// Internal upload function (not rate-limited)
const uploadToIPFSInternal = async (data: any, filename: string): Promise<PinataResponse> => {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: data,
        pinataMetadata: {
          name: filename,
        },
        pinataOptions: {
          cidVersion: 1,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );
    return response.data;
  } catch (error: any) {
    // Log detailed error information
    console.error('❌ IPFS Upload Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      jwtLength: PINATA_JWT?.length,
      jwtValid: PINATA_JWT && PINATA_JWT !== 'your_pinata_jwt'
    });
    
    // Silently fail for 403/401 (invalid API key) - disable IPFS
    if (error.response?.status === 403 || error.response?.status === 401) {
      ipfsEnabled = false;
      throw new Error('IPFS_DISABLED: ' + (error.response?.data?.error?.reason || error.response?.data?.message || 'Authentication failed'));
    }
    throw error;
  }
};

// Upload JSON data to IPFS via Pinata with rate limiting and error handling
export const uploadToIPFS = async (data: any, filename: string): Promise<PinataResponse> => {
  // Check if IPFS is disabled
  if (!ipfsEnabled) {
    throw new Error('IPFS uploads are currently disabled due to authentication issues');
  }
  
  try {
    // Use queue-based rate limiting
    return new Promise((resolve, reject) => {
      uploadQueue.push({ resolve, reject, data, filename });
      processUploadQueue();
    });
  } catch (error: any) {
    // Handle specific error codes
    if (error.response) {
      const status = error.response.status;
      
      if (status === 403) {
        console.error('IPFS authentication failed. Disabling IPFS uploads.');
        ipfsEnabled = false;
        throw new Error('IPFS authentication failed. Please check your API credentials.');
      } else if (status === 429) {
        console.warn('IPFS rate limit exceeded. Please wait before trying again.');
        throw new Error('Too many requests. Please wait a moment.');
      }
    }
    
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

// Retrieve data from IPFS
export const getFromIPFS = async (hash: string): Promise<any> => {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw error;
  }
};

// Save user credentials to IPFS
export const saveUserCredentials = async (email: string, password: string): Promise<string> => {
  const credentials = {
    email,
    password, // In production, this should be hashed!
    createdAt: new Date().toISOString(),
  };
  const result = await uploadToIPFS(credentials, `user_${email}`);
  return result.IpfsHash;
};

// Save spreadsheet data to IPFS
export const saveSpreadsheetToIPFS = async (cellData: any, metadata?: any): Promise<string> => {
  const spreadsheetData = {
    cellData,
    metadata: {
      ...metadata,
      savedAt: new Date().toISOString(),
      version: '1.0',
    },
  };
  const result = await uploadToIPFS(spreadsheetData, `spreadsheet_${Date.now()}`);
  return result.IpfsHash;
};

// Load spreadsheet data from IPFS
export const loadSpreadsheetFromIPFS = async (hash: string): Promise<any> => {
  const data = await getFromIPFS(hash);
  return data;
};

// Save user's IPFS hashes mapping (to track their data)
export const saveUserDataMapping = async (email: string, mappings: any): Promise<string> => {
  const userMapping = {
    email,
    mappings,
    lastUpdated: new Date().toISOString(),
  };
  const result = await uploadToIPFS(userMapping, `user_mapping_${email}`);
  return result.IpfsHash;
};

// Get user's latest data mapping
export const getUserDataMapping = async (hash: string): Promise<any> => {
  return await getFromIPFS(hash);
};

// Auto-save functionality with IPFS
export const autoSaveToIPFS = async (data: any, type: 'spreadsheet' | 'credentials' | 'settings'): Promise<string> => {
  const timestamp = Date.now();
  const result = await uploadToIPFS(
    {
      type,
      data,
      timestamp,
      autoSaved: true,
    },
    `autosave_${type}_${timestamp}`
  );
  return result.IpfsHash;
};
