import React, { createContext, useContext, useState } from 'react';

interface ClipboardData {
  value: string;
  isCut: boolean;
  cellKey?: string;
}

interface ClipboardContextType {
  copy: (text: string, cellKey?: string) => Promise<void>;
  cut: (text: string, cellKey: string) => Promise<void>;
  paste: () => Promise<ClipboardData | null>;
  clearCut: () => void;
  getCutCellKey: () => string | null;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const ClipboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inMemory, setInMemory] = useState<ClipboardData | null>(null);

  const copy = async (text: string, cellKey?: string) => {
    const data: ClipboardData = { value: text, isCut: false, cellKey };
    
    try {
      await navigator.clipboard.writeText(text);
      setInMemory(data);
    } catch (err) {
      // Fallback to in-memory clipboard when browser denies access
      setInMemory(data);
    }
  };

  const cut = async (text: string, cellKey: string) => {
    const data: ClipboardData = { value: text, isCut: true, cellKey };
    
    try {
      await navigator.clipboard.writeText(text);
      setInMemory(data);
    } catch (err) {
      // Fallback to in-memory clipboard when browser denies access
      setInMemory(data);
    }
  };

  const paste = async (): Promise<ClipboardData | null> => {
    try {
      const text = await navigator.clipboard.readText();
      if (text !== undefined && text !== null) {
        // If we have in-memory data and it matches clipboard, return full data
        if (inMemory && inMemory.value === text) {
          return inMemory;
        }
        // Otherwise return just the text as copy operation
        return { value: text, isCut: false };
      }
    } catch (err) {
      // ignore and fall back to in-memory
    }
    return inMemory;
  };

  const clearCut = () => {
    if (inMemory?.isCut) {
      setInMemory(null);
    }
  };

  const getCutCellKey = () => {
    return inMemory?.isCut ? inMemory.cellKey || null : null;
  };

  return (
    <ClipboardContext.Provider value={{ copy, cut, paste, clearCut, getCutCellKey }}>
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboard = () => {
  const ctx = useContext(ClipboardContext);
  if (!ctx) throw new Error('useClipboard must be used within ClipboardProvider');
  return ctx;
};

export default ClipboardContext;
