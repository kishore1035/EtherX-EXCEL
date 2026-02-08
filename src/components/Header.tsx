import React from 'react';
import { FileSpreadsheet, Save, Undo, Redo, LayoutDashboard, Edit2, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useUndoRedo } from '../contexts/UndoRedoContext';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { useTheme } from '../contexts/ThemeContext';
import { exportToCSV } from '../utils/csvExport';
import { useState, useRef, useEffect } from 'react';
// ❌ DEPRECATED: Old save system - DO NOT USE
// import { saveSpreadsheetToIPFS } from '../utils/pinataService';
// import { autoSaveSpreadsheet } from '../utils/spreadsheetStorage';
// ✅ NEW: Save complete documentState
import { saveDocumentStateToIPFS, logDocumentContents } from '../services/documentStateSave';
import { useDocumentState } from '../contexts/DocumentStateContext';
import { exportDocumentToCSV, exportDocumentToPDF, exportDocumentToJSON } from '../services/exportService';
import { trackActivity } from '../utils/notificationSystem';
import { CollaborationMenu } from './CollaborationMenu';
import { CollaborationPresence } from './collaboration/CollaborationPresence';
import { IPFSStatus } from './IPFSStatus';

interface HeaderProps {
  spreadsheetId: string;
  spreadsheetTitle: string;
  onTitleChange: (newTitle: string) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function Header({ spreadsheetId, spreadsheetTitle, onTitleChange, isDarkMode = false, onToggleTheme }: HeaderProps) {
  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const { setCellData, setCellFormats, cellData, inputMessage, cellFormats } = useSpreadsheet();
  const { theme, toggleTheme } = useTheme();
  
  // ✅ NEW: Use documentState instead of partial state
  const { state: documentState, saveToIPFS, updateMetadata } = useDocumentState();
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(spreadsheetTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // IPFS status tracking
  const [lastIPFSHash, setLastIPFSHash] = useState<string>();
  const [lastIPFSSaveTime, setLastIPFSSaveTime] = useState<string>();
  const [ipfsError, setIpfsError] = useState<string>();
  
  // Document statistics for UI display
  const [docStats, setDocStats] = useState({
    cells: 0,
    images: 0,
    shapes: 0,
    charts: 0
  });

  // Get user info from localStorage
  const userEmail = localStorage.getItem('userEmail') || 'user@etherx.com';
  const userName = localStorage.getItem('userName') || 'User';
  
  // Update document statistics when documentState changes
  useEffect(() => {
    if (documentState && documentState.sheets.length > 0) {
      const sheet = documentState.sheets[0];
      setDocStats({
        cells: Object.keys(sheet.cells || {}).length,
        images: sheet.images?.length || 0,
        shapes: sheet.shapes?.length || 0,
        charts: sheet.charts?.length || 0
      });
    }
  }, [documentState]);
  
  // Update title when prop changes
  useEffect(() => {
    setTitle(spreadsheetTitle);
  }, [spreadsheetTitle]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // ✅ NEW: Auto-save complete documentState every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (documentState && documentState.sheets.length > 0) {
        try {
          console.log('⏰ Auto-save triggered...');
          
          // Verification logging before save
          logDocumentContents(documentState);
          
          // Save complete documentState to IPFS
          const result = await saveDocumentStateToIPFS(documentState);
          console.log(`✅ Auto-saved to IPFS: ${result.cid}`);
          console.log(`📊 Saved: ${docStats.cells} cells, ${docStats.images} images, ${docStats.shapes} shapes, ${docStats.charts} charts`);
          
          // Update IPFS status
          setLastIPFSHash(result.cid);
          setLastIPFSSaveTime(new Date().toLocaleString());
          setIpfsError(undefined);
        } catch (error: any) {
          console.warn('⚠️ IPFS auto-save failed:', error.message);
          setIpfsError(error.message || 'Auto-save failed');
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [documentState, docStats]);

  const handleUndo = () => {
    const prevState = undo();
    if (prevState) {
      setCellData(prevState.cellData);
      setCellFormats(prevState.cellFormats);
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      setCellData(nextState.cellData);
      setCellFormats(nextState.cellFormats);
    }
  };

  const handleTitleSubmit = () => {
    if (title.trim()) {
      onTitleChange(title.trim());
      // ✅ NEW: Update metadata in documentState
      updateMetadata({ title: title.trim() });
      // Track edit activity
      trackActivity(userEmail, 'edit', spreadsheetId, title.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(spreadsheetTitle);
      setIsEditingTitle(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log('💾 SAVE TRIGGERED - Using complete documentState');
      console.log('════════════════════════════════════════════');
      
      // ✅ VERIFICATION LOGGING: Show what's in documentState before save
      console.log('📊 Document Statistics:');
      console.log(`   - Cells with data/formatting: ${docStats.cells}`);
      console.log(`   - Images: ${docStats.images}`);
      console.log(`   - Shapes: ${docStats.shapes}`);
      console.log(`   - Charts: ${docStats.charts}`);
      
      // Full verification logging
      logDocumentContents(documentState);
      
      // Log complete JSON structure (truncated for console)
      console.log('📄 Full documentState JSON (first 2000 chars):');
      const jsonStr = JSON.stringify(documentState, null, 2);
      console.log(jsonStr.substring(0, 2000));
      console.log(`... (Total size: ${jsonStr.length} bytes)`);
      
      // ✅ SAVE COMPLETE DOCUMENT STATE TO IPFS
      console.log('☁️ Uploading complete documentState to IPFS...');
      setIpfsError(undefined);
      
      const result = await saveDocumentStateToIPFS(documentState);
      
      console.log('════════════════════════════════════════════');
      console.log('✅ SAVE SUCCESSFUL!');
      console.log(`   CID: ${result.cid}`);
      console.log('════════════════════════════════════════════');
      
      // Update IPFS status
      setLastIPFSHash(result.cid);
      setLastIPFSSaveTime(new Date().toLocaleString());
      
      // Build detailed success message
      const detailsMessage = `Document saved successfully to IPFS!

IPFS CID: ${result.cid}

Document contains:
✓ ${docStats.cells} cells with data/formatting
✓ ${docStats.images} images
✓ ${docStats.shapes} shapes
✓ ${docStats.charts} charts

Saved at: ${new Date().toLocaleString()}`;
      
      alert(detailsMessage);
      
      // Track save activity
      trackActivity(userEmail, 'save', spreadsheetId, title);
      
      // ✅ EXPORT TO MULTIPLE FORMATS
      console.log('📦 Exporting to multiple formats...');
      
      // 1. CSV Export (text + styles)
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const baseFilename = title.replace(/[^a-z0-9]/gi, '_');
      
      // Use unified CSV export with styling
      exportDocumentToCSV(documentState, `${baseFilename}_${timestamp}.csv`, {
        includeStyles: true,
        includeFormulas: false,
        fallbackOnError: true
      });
      
      // 2. JSON Export (complete state)
      console.log('📄 Also exporting as JSON for backup...');
      exportDocumentToJSON(documentState, `${baseFilename}_${timestamp}.json`);
      
      console.log('✅ All exports complete');
      
      // Track export activity
      trackActivity(userEmail, 'export', spreadsheetId, title);
    } catch (error: any) {
      console.error('════════════════════════════════════════════');
      console.error('❌ SAVE FAILED!');
      console.error('Error:', error);
      console.error('════════════════════════════════════════════');
      
      // Update error status
      setIpfsError(error.message || 'IPFS upload failed');
      
      alert(`Save failed!\n\nError: ${error.message}\n\nCheck console for details.`);
    }
  };

  const handleDashboardClick = async () => {
    try {
      // ✅ NEW: Auto-save complete documentState before leaving
      console.log('💾 Auto-saving before dashboard navigation...');
      const result = await saveDocumentStateToIPFS(documentState);
      console.log(`✅ Auto-saved to IPFS: ${result.cid}`);
    } catch (error: any) {
      console.warn('⚠️ Auto-save failed:', error.message);
    }
    
    // Trigger navigation back to dashboard
    window.dispatchEvent(new CustomEvent('navigateToDashboard'));
  };

  return (
    <div className="h-8 flex items-center px-3 gap-3 text-black" style={{ 
        background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)'
      }}>
      <div className="flex items-center gap-2">
        <img 
          src="/src/assets/Logo.png" 
          alt="EtherX Logo" 
          className="w-auto object-contain"
          style={{ height: '1.575rem' }}
        />
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            id="spreadsheet-title"
            name="spreadsheet-title"
            autoComplete="off"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            className="font-semibold text-[4px] bg-white/50 px-1 rounded border border-black/20 focus:outline-none focus:border-black/40"
            style={{ width: '120px', color: '#000000' }}
          />
        ) : (
          <div 
            className="flex items-center gap-1 cursor-pointer hover:bg-black/5 px-1 rounded"
            onClick={() => setIsEditingTitle(true)}
            title="Click to rename"
          >
            <span className="font-semibold text-[4px]" style={{ color: '#000000' }}>{title}</span>
            <Edit2 className="w-1.5 h-1.5 opacity-60" style={{ color: '#000000' }} />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-4 w-4 p-0 text-black hover:bg-black hover:bg-opacity-10"
          onClick={handleSave}
          title="Save as CSV"
        >
          <Save className="w-2 h-2" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-4 w-4 p-0 text-black hover:bg-black hover:bg-opacity-10 ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <Undo className="w-2 h-2" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-4 w-4 p-0 text-black hover:bg-black hover:bg-opacity-10 ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleRedo}
          disabled={!canRedo}
        >
          <Redo className="w-2 h-2" />
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* IPFS Status Indicator */}
        <IPFSStatus 
          lastHash={lastIPFSHash}
          lastSaveTime={lastIPFSSaveTime}
          error={ipfsError}
        />
        
        {/* Collaboration Presence - Show active users */}
        <CollaborationPresence />
        
        {/* Collaboration Menu */}
        <CollaborationMenu
          spreadsheetId={spreadsheetId}
          spreadsheetTitle={title}
          userEmail={userEmail}
          userName={userName}
          isDarkMode={isDarkMode}
        />
        
        {/* Dashboard Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-4 px-3 text-black hover:bg-black hover:bg-opacity-10"
          onClick={handleDashboardClick}
          title="Go to Dashboard (saves automatically)"
          style={{ 
            display: 'flex', 
            visibility: 'visible', 
            opacity: 1, 
            color: '#000000',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LayoutDashboard className="w-2 h-2" style={{ color: '#000000' }} />
          <span className="text-[4px]" style={{ color: '#000000', display: 'inline !important' }}>Dashboard</span>
        </Button>
      </div>
    </div>
  );
}
