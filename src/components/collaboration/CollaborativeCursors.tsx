import React from 'react';
import { useCollaboration } from '../../contexts/CollaborationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CollaborativeCursorsProps {
  cellWidth: number;
  cellHeight: number;
  offsetX: number;
  offsetY: number;
}

export function CollaborativeCursors({ cellWidth, cellHeight, offsetX, offsetY }: CollaborativeCursorsProps) {
  const { activeUsers, myUserId } = useCollaboration();

  // Debug logging
  React.useEffect(() => {
    console.log('👥 CollaborativeCursors - Active Users:', activeUsers.length);
    console.log('👤 My User ID:', myUserId);
    console.log('🎯 Other users with cursors:', activeUsers.filter(u => u.userId !== myUserId && u.cursor).length);
  }, [activeUsers, myUserId]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10000 }}>
      <AnimatePresence>
        {activeUsers
          .filter(user => user.userId !== myUserId && user.cursor)
          .map(user => {
            console.log('🎨 Rendering cursor for user:', user.userName, 'at', user.cursor);
            return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.15,
                ease: "easeOut"
              }}
              className="absolute"
              style={{
                left: offsetX + (user.cursor!.col * cellWidth),
                top: offsetY + (user.cursor!.row * cellHeight),
                width: cellWidth,
                height: cellHeight,
                pointerEvents: 'none'
              }}
            >
              {/* Canva-style animated border */}
              <motion.div
                className="absolute inset-0"
                style={{
                  border: `3px solid ${user.userColor}`,
                  borderRadius: '3px',
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.8), 0 0 12px ${user.userColor}80, inset 0 0 0 1px ${user.userColor}40`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 0 1px rgba(255,255,255,0.8), 0 0 12px ${user.userColor}80, inset 0 0 0 1px ${user.userColor}40`,
                    `0 0 0 1px rgba(255,255,255,0.8), 0 0 20px ${user.userColor}60, inset 0 0 0 1px ${user.userColor}60`,
                    `0 0 0 1px rgba(255,255,255,0.8), 0 0 12px ${user.userColor}80, inset 0 0 0 1px ${user.userColor}40`,
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Canva-style mouse cursor pointer */}
              <motion.div
                className="absolute -left-1 -top-1"
                animate={{
                  x: [0, 3, 0],
                  y: [0, 3, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  {/* Cursor arrow with white outline */}
                  <path
                    d="M5 3L5 17L9 13L12 17L15 15L12 11L17 11L5 3Z"
                    fill="white"
                    stroke="black"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M5 3L5 17L9 13L12 17L15 15L12 11L17 11L5 3Z"
                    fill={user.userColor}
                    opacity="1"
                  />
                </svg>
              </motion.div>

              {/* Enhanced username label with Canva-style design */}
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute -top-8 left-0 px-3 py-1.5 rounded-full text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-2"
                style={{
                  backgroundColor: user.userColor,
                  pointerEvents: 'auto',
                  boxShadow: `0 4px 12px ${user.userColor}60, 0 2px 4px rgba(0,0,0,0.2)`,
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                {/* User avatar circle */}
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    border: '1.5px solid rgba(255,255,255,0.5)'
                  }}
                >
                  {user.userName.charAt(0).toUpperCase()}
                </div>
                
                <span className="font-medium">
                  {user.userName}
                  {user.isEditing && ' ✏️'}
                </span>
              </motion.div>

              {/* Live typing preview (Canva-style) */}
              {user.liveTypingContent !== undefined && user.isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full left-0 mt-1 px-2 py-1 rounded text-xs max-w-xs truncate shadow-lg z-50"
                  style={{
                    backgroundColor: `${user.userColor}15`,
                    border: `1.5px solid ${user.userColor}`,
                    color: '#000',
                    fontFamily: 'monospace',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <span className="font-semibold" style={{ color: user.userColor }}>Typing: </span>
                  {user.liveTypingContent || '|'}
                </motion.div>
              )}

              {/* Typing indicator (blinking cursor) */}
              {user.isEditing && (
                <motion.div
                  className="absolute top-1 left-1 w-0.5 h-4 bg-current"
                  style={{ backgroundColor: user.userColor }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              )}
            </motion.div>
            );
          })}
      </AnimatePresence>

      {/* Selection ranges overlay */}
      <AnimatePresence>
        {activeUsers
          .filter(user => user.userId !== myUserId && user.selectionRange)
          .map(user => {
            const range = user.selectionRange!;
            return (
              <motion.div
                key={`selection-${user.userId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute pointer-events-none"
                style={{
                  left: offsetX + (range.startCol * cellWidth),
                  top: offsetY + (range.startRow * cellHeight),
                  width: (range.endCol - range.startCol + 1) * cellWidth,
                  height: (range.endRow - range.startRow + 1) * cellHeight,
                  backgroundColor: user.userColor,
                  border: `2px solid ${user.userColor}`,
                  borderRadius: '2px',
                }}
              />
            );
          })}
      </AnimatePresence>
    </div>
  );
}
