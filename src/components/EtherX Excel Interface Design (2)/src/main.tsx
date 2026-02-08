
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClipboardProvider } from './contexts/ClipboardContext';
import { SpreadsheetProvider } from './contexts/SpreadsheetContext';
import { UndoRedoProvider } from './contexts/UndoRedoContext';

createRoot(document.getElementById('root')!).render(
  <UndoRedoProvider>
    <ClipboardProvider>
      <SpreadsheetProvider>
        <App />
      </SpreadsheetProvider>
    </ClipboardProvider>
  </UndoRedoProvider>
);
