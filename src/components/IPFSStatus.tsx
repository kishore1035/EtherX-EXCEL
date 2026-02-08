import { Cloud, CloudOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface IPFSStatusProps {
  lastHash?: string;
  lastSaveTime?: string;
  error?: string;
}

export function IPFSStatus({ lastHash, lastSaveTime, error }: IPFSStatusProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Check if IPFS is configured
  const ipfsJWT = import.meta.env.VITE_PINATA_JWT;
  const isConfigured = ipfsJWT && ipfsJWT !== 'your_pinata_jwt_token_here';
  
  const getStatusIcon = () => {
    if (error) {
      return <CloudOff className="w-4 h-4 text-red-500" />;
    }
    if (lastHash) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (isConfigured) {
      return <Cloud className="w-4 h-4 text-blue-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };
  
  const getStatusText = () => {
    if (error) return 'IPFS Error';
    if (lastHash) return 'Saved to IPFS';
    if (isConfigured) return 'IPFS Ready';
    return 'IPFS Not Configured';
  };
  
  const getStatusColor = () => {
    if (error) return '#ef4444';
    if (lastHash) return '#10b981';
    if (isConfigured) return '#3b82f6';
    return '#f59e0b';
  };
  
  return (
    <div 
      className="flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer hover:bg-black/5 transition-colors"
      style={{ border: `1px solid ${getStatusColor()}20` }}
      onClick={() => setShowDetails(!showDetails)}
      title="Click for IPFS details"
    >
      {getStatusIcon()}
      <span style={{ color: getStatusColor(), fontWeight: 500 }}>
        {getStatusText()}
      </span>
      
      {showDetails && (
        <div 
          className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 w-[380px] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">IPFS Storage Status</h3>
            <button 
              onClick={() => setShowDetails(false)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors font-bold text-xl"
              title="Close"
            >
              ×
            </button>
          </div>
          
          {!isConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
              <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ IPFS Not Configured</p>
              <p className="text-xs text-yellow-700 mb-2">
                To enable IPFS storage, update your .env file with Pinata credentials.
              </p>
              <div className="bg-yellow-100 rounded p-2 font-mono text-xs text-yellow-900 overflow-x-auto">
                VITE_PINATA_JWT=your_jwt_here
              </div>
              <a 
                href="https://app.pinata.cloud/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
              >
                Get free Pinata credentials →
              </a>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
              <p className="text-sm text-red-800 font-medium mb-1">❌ Error</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
          
          {lastHash && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
              <p className="text-sm text-green-800 font-medium mb-2">✅ Saved to IPFS</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-green-700 mb-1">IPFS Hash:</p>
                  <div className="bg-green-100 rounded p-2 font-mono text-xs text-green-900 break-all">
                    {lastHash}
                  </div>
                  <a 
                    href={`https://gateway.pinata.cloud/ipfs/${lastHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    View on IPFS Gateway →
                  </a>
                </div>
                
                {lastSaveTime && (
                  <div>
                    <p className="text-xs text-green-700">Last saved:</p>
                    <p className="text-xs text-green-800 font-medium">{lastSaveTime}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
            <p className="text-xs text-gray-600">
              <strong>IPFS</strong> (InterPlanetary File System) provides decentralized, 
              permanent storage for your spreadsheets. Your data is distributed across 
              multiple nodes globally, ensuring availability and censorship resistance.
            </p>
          </div>
          
          {/* Close button at bottom */}
          <button
            onClick={() => setShowDetails(false)}
            className="w-full py-2.5 px-4 bg-gray-100 text-black rounded-md font-semibold text-sm shadow-sm hover:bg-gray-200 active:bg-gray-300 border border-gray-300 transition-all"
            style={{ opacity: 1 }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
