import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Users, Eye, Edit } from 'lucide-react';

interface Collaborator {
  userId: string;
  userName: string;
  permission: 'viewer' | 'editor';
  lastActive: number;
}

interface CollaborationStatusProps {
  isConnected: boolean;
  collaborators: Collaborator[];
}

export function CollaborationStatus({ isConnected, collaborators }: CollaborationStatusProps) {
  const activeCollaborators = collaborators.filter(c => 
    Date.now() - c.lastActive < 5 * 60 * 1000 // Active within last 5 minutes
  );

  return (
    <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg ${
          isConnected 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}
      >
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Disconnected</span>
          </>
        )}
      </motion.div>

      {/* Active Collaborators */}
      {isConnected && activeCollaborators.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-500/90 text-white px-3 py-2 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{activeCollaborators.length}</span>
          </div>
          
          {/* Hover tooltip showing collaborator names */}
          <div className="absolute right-0 mt-2 hidden group-hover:block">
            <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl max-w-xs">
              <div className="text-xs font-semibold mb-2">Active Collaborators</div>
              {activeCollaborators.map(c => (
                <div key={c.userId} className="flex items-center gap-2 text-xs py-1">
                  {c.permission === 'editor' ? (
                    <Edit className="w-3 h-3 text-green-400" />
                  ) : (
                    <Eye className="w-3 h-3 text-blue-400" />
                  )}
                  <span>{c.userName}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
