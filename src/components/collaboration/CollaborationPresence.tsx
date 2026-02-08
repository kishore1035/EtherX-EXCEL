import React from 'react';
import { useCollaboration } from '../../contexts/CollaborationContext';
import { motion } from 'framer-motion';
import { Circle } from 'lucide-react';

export function CollaborationPresence() {
  const { activeUsers, myUserId, isConnected } = useCollaboration();

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <Circle 
          className={`w-2 h-2 ${isConnected ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
        />
        <span className="text-xs text-gray-600">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Active users avatars */}
      {activeUsers.length > 0 && (
        <div className="flex items-center -space-x-2">
          {activeUsers.map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white
                  border-2 border-white shadow-md cursor-pointer
                  ${user.userId === myUserId ? 'ring-2 ring-yellow-400' : ''}
                  ${user.isEditing ? 'animate-pulse' : ''}
                `}
                style={{
                  backgroundColor: user.userColor,
                  zIndex: activeUsers.length - index
                }}
                title={`${user.userName} ${user.permission === 'viewer' ? '(Viewing)' : '(Editing)'}`}
              >
                {getInitials(user.userName)}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {user.userName}
                <div className="text-gray-400 text-[10px]">
                  {user.isEditing ? '✏️ Editing' : user.permission === 'viewer' ? '👁️ Viewing' : '⏸️ Idle'}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* User count */}
      {activeUsers.length > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'}
        </span>
      )}
    </div>
  );
}
