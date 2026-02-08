import React, { createContext, useContext, useState, useCallback } from 'react';

interface UndoRedoState {
  cellData: Record<string, string>;
  cellFormats: Record<string, any>;
}

interface UndoRedoContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => UndoRedoState | undefined;
  redo: () => UndoRedoState | undefined;
  saveState: (state: UndoRedoState) => void;
}

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(undefined);

export function UndoRedoProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<UndoRedoState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const saveState = useCallback((state: UndoRedoState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(state);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return undefined;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return undefined;
  }, [currentIndex, history]);

  return (
    <UndoRedoContext.Provider value={{
      canUndo: currentIndex > 0,
      canRedo: currentIndex < history.length - 1,
      undo,
      redo,
      saveState
    }}>
      {children}
    </UndoRedoContext.Provider>
  );
}

export function useUndoRedo() {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedo must be used within UndoRedoProvider');
  }
  return context;
}