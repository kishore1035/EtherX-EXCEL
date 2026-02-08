import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollaboratorCursor {
  userId: string;
  userName: string;
  row: number;
  col: number;
  color: string;
}

interface CollaboratorCursorsProps {
  cursors: Map<string, CollaboratorCursor>;
  getCellPosition: (row: number, col: number) => { x: number; y: number } | null;
}

export function CollaboratorCursors({ cursors, getCellPosition }: CollaboratorCursorsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <AnimatePresence>
        {Array.from(cursors.values()).map((cursor) => {
          const position = getCellPosition(cursor.row, cursor.col);
          if (!position) return null;

          return (
            <motion.div
              key={cursor.userId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                pointerEvents: 'none',
                zIndex: 1000
              }}
            >
              {/* Cursor indicator */}
              <div
                className="absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: cursor.color }}
              />
              
              {/* User name label */}
              <div
                className="absolute top-0 left-4 px-2 py-1 rounded text-xs font-medium text-white shadow-lg whitespace-nowrap"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.userName}
              </div>

              {/* Selection highlight */}
              <div
                className="absolute inset-0 border-2 rounded-sm"
                style={{
                  borderColor: cursor.color,
                  width: '100%',
                  height: '100%'
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
