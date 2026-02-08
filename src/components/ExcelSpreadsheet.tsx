import { useState, useEffect } from 'react';
import { Header } from './Header';
import { RibbonTabs } from './RibbonTabs-new';
import { HomeTab } from './ribbon/HomeTab';
import { InsertTab } from './ribbon/InsertTab';
import { HelpTab } from './ribbon/HelpTab';
import { FormulaBar } from './FormulaBar';
import { SpreadsheetGrid } from './SpreadsheetGrid';
import { SheetTabsBar } from './SheetTabsBar';
import { WelcomeModal } from './WelcomeModal';
import { GuidedTour } from './GuidedTour';
import { GamesHub } from './GamesHub';
import { SpreadsheetProvider, useSpreadsheet } from '../contexts/SpreadsheetContext';
import { UndoRedoProvider } from '../contexts/UndoRedoContext';
import { ClipboardProvider } from '../contexts/ClipboardContext';
import { CollaborationProvider } from '../contexts/CollaborationContext';
import { User } from '../types/spreadsheet';
import { trackActivity } from '../utils/notificationSystem';
import { clearSheetStorage, generateSheetUUID, initializeBlankSheet } from '../utils/sheetStorageManager';
// ✅ NEW: Import sync hook to keep documentState in sync with SpreadsheetContext
import { useSpreadsheetDocumentSync } from '../hooks/useSpreadsheetDocumentSync';
import { DocumentProvider } from '../contexts/DocumentStateContext';
import { saveSpreadsheet } from '../utils/spreadsheetStorage';

function ExcelContent({ 
  activeTab, 
  setActiveTab,
  spreadsheetId = 'default',
  spreadsheetTitle = 'Untitled',
  onTitleChange = () => {},
  user,
  userPermission = 'editor'
}: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  spreadsheetId?: string;
  spreadsheetTitle?: string;
  onTitleChange?: (title: string) => void;
  user: User;
  userPermission?: 'editor' | 'viewer';
}) {
  const { showFormulaBar, cellData, cellFormats } = useSpreadsheet();
  
  // ✅ NEW: Sync SpreadsheetContext with DocumentState
  // This ensures ALL changes (cells, images, shapes, charts) are captured in documentState
  const { state: documentState, documentReady } = useSpreadsheetDocumentSync();
  
  // ✅ AUTO-SAVE: Periodically save spreadsheet to localStorage
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (user?.email && spreadsheetId) {
        try {
          // Convert cellData to plain object if it's a Map or other structure
          const plainCellData = cellData instanceof Map 
            ? Object.fromEntries(cellData)
            : (cellData || {});
          
          const plainCellFormats = cellFormats instanceof Map
            ? Object.fromEntries(cellFormats)
            : (cellFormats || {});

          saveSpreadsheet({
            id: spreadsheetId,
            title: spreadsheetTitle,
            userEmail: user.email,
            cellData: plainCellData,
            cellFormats: plainCellFormats,
            created: new Date().toISOString(),
          });
          console.log('⏱️ Auto-saved spreadsheet:', spreadsheetTitle, 'Cells:', Object.keys(plainCellData).length);
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
          if (error instanceof Error) {
            console.error('   Error details:', error.message);
          }
        }
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(autoSaveInterval);
  }, [user?.email, spreadsheetId, spreadsheetTitle, cellData, cellFormats]);
  
  const [sheets, setSheets] = useState([
    { id: generateSheetUUID(), name: 'Sheet1' } // Initialize with UUID
  ]);
  const [activeSheetId, setActiveSheetId] = useState(() => sheets[0].id);
  
  // Log document state readiness
  useEffect(() => {
    if (documentReady) {
      console.log('✅ DocumentState is ready and synced with SpreadsheetContext');
      console.log('📊 Current document structure:', {
        sheets: documentState.sheets.length,
        cells: Object.keys(documentState.sheets[0]?.cells || {}).length,
        images: documentState.sheets[0]?.images?.length || 0,
        shapes: documentState.sheets[0]?.shapes?.length || 0,
        charts: documentState.sheets[0]?.charts?.length || 0
      });
    }
  }, [documentReady, documentState]);
  
  // Initialize the first sheet with empty data
  useEffect(() => {
    initializeBlankSheet(sheets[0].id);
  }, []); // Run once on mount
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab isDarkMode={false} />;
      case 'insert':
        return <InsertTab />;
      case 'help':
        return <HelpTab isDarkMode={false} userId={user?.email || 'guest'} spreadsheetId={spreadsheetId} />;
      default:
        return <HomeTab isDarkMode={false} />;
    }
  };

  const handleAddSheet = () => {
    // Generate new UUID for the sheet
    const newSheetUUID = generateSheetUUID();
    const newSheetNumber = sheets.length + 1;
    const newSheet = {
      id: newSheetUUID, // Use UUID instead of simple counter
      name: `Sheet${newSheetNumber}`
    };
    
    // Initialize blank sheet with explicit empty data immediately
    initializeBlankSheet(newSheetUUID);
    
    setSheets([...sheets, newSheet]);
    setActiveSheetId(newSheet.id); // Set as active - this triggers load of empty data
    
    console.log(`\ud83c\udd95 Created new blank sheet: ${newSheetUUID}`);
  };

  const handleRenameSheet = (sheetId: string, newName: string) => {
    setSheets(sheets.map(sheet => 
      sheet.id === sheetId ? { ...sheet, name: newName } : sheet
    ));
  };
  
  // Update global activeSheetId whenever it changes for SpreadsheetGrid
  useEffect(() => {
    (window as any).__activeSheetId = activeSheetId;
    console.log(`\ud83d\udd04 Active sheet changed to: ${activeSheetId}`);
  }, [activeSheetId]);
  
  return (
    <div 
      className="h-screen flex flex-col bg-gray-50" 
      style={{ 
        transform: 'scale(1.5)',
        transformOrigin: 'top left',
        width: '66.67%',
        height: '66.67%',
        position: 'relative'
      }}
    >
      <Header 
        spreadsheetId={spreadsheetId}
        spreadsheetTitle={spreadsheetTitle}
        onTitleChange={onTitleChange}
      />
      <RibbonTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ribbon-tabs border-b border-gray-300 bg-white">
        {renderTabContent()}
      </div>
      {showFormulaBar && <FormulaBar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <SpreadsheetGrid />
        </div>
      </div>
    </div>
  );
}

interface ExcelSpreadsheetProps {
  user: User;
  onLogout: () => void;
  onBackToHome: () => void;
  importedData?: any;
  currentSpreadsheet?: any;
  canEdit?: boolean;
}

export function ExcelSpreadsheet({ user, onLogout, onBackToHome, importedData, currentSpreadsheet, canEdit = true }: ExcelSpreadsheetProps) {
  const [activeTab, setActiveTab] = useState<string>('home');
  // Generate a unique ID that changes when currentSpreadsheet changes
  const [spreadsheetId, setSpreadsheetId] = useState(() => 
    currentSpreadsheet?.id || `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [spreadsheetTitle, setSpreadsheetTitle] = useState(currentSpreadsheet?.title || "Untitled");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [showGamesHub, setShowGamesHub] = useState(false);

  // Determine if this is a new blank spreadsheet (no data and titled "Untitled")
  // BUT: Don't treat collaboration sheets as blank - they need to load with their data
  const isNewBlankSpreadsheet = currentSpreadsheet && 
    currentSpreadsheet.title === "Untitled" && 
    (!currentSpreadsheet.cellData || Object.keys(currentSpreadsheet.cellData).length === 0) &&
    !importedData &&
    canEdit === true; // If canEdit is false, it's from a collab link, not a new sheet

  // Initialize data immediately based on the spreadsheet type
  const initialData = isNewBlankSpreadsheet 
    ? {} 
    : (currentSpreadsheet?.cellData || importedData || {});
  
  console.log('📊 ExcelSpreadsheet initializing:', {
    spreadsheetId,
    title: currentSpreadsheet?.title,
    isNewBlankSpreadsheet,
    canEdit,
    cellCount: Object.keys(initialData).length,
    hasCellData: !!currentSpreadsheet?.cellData,
    cellDataKeys: currentSpreadsheet?.cellData ? Object.keys(currentSpreadsheet.cellData).length : 0
  });
  
  // Update when currentSpreadsheet changes and track activity
  useEffect(() => {
    if (currentSpreadsheet) {
      const newId = currentSpreadsheet.id;
      setSpreadsheetId(newId);
      setSpreadsheetTitle(currentSpreadsheet.title);
      
      // Make spreadsheet ID globally available for SpreadsheetGrid
      (window as any).__currentSpreadsheetId = newId;
      
      // Set global flag for new blank spreadsheet
      (window as any).__isNewBlankSpreadsheet = isNewBlankSpreadsheet;
      
      // If this is a new blank sheet, clear any stale autosave data
      if (isNewBlankSpreadsheet) {
        console.log(`🧹 Clearing autosave cache for new blank sheet: ${newId}`);
        clearSheetStorage(newId);
        // Initialize with explicit empty data
        initializeBlankSheet(newId);
      } else {
        console.log(`✅ Keeping autosave data (not a new blank sheet)`);
      }
      
      // Track that the spreadsheet was opened
      if (user?.email) {
        trackActivity(user.email, 'open', currentSpreadsheet.id, currentSpreadsheet.title);
      }
    }
  }, [currentSpreadsheet, user?.email, isNewBlankSpreadsheet]);

  // Expose permission globally for components not wired with props yet
  useEffect(() => {
    (window as any).__etherxCanEdit = canEdit;
  }, [canEdit]);

  // ✅ IMPORTANT: Listen for navigation events to save final data before unmounting
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Browser is closing - save will be handled by auto-save interval
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <DocumentProvider>
      <SpreadsheetProvider key={spreadsheetId} initialData={initialData}>
        <UndoRedoProvider>
          <ClipboardProvider>
            <CollaborationProvider
              documentId={spreadsheetId}
              userId={user.email}
              userName={user.name}
              userPermission={canEdit ? 'editor' : 'viewer'}
            >
            <ExcelContent 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              spreadsheetId={spreadsheetId}
              spreadsheetTitle={spreadsheetTitle}
              onTitleChange={setSpreadsheetTitle}
              user={user}
              userPermission={canEdit ? 'editor' : 'viewer'}
            />

            {/* Welcome Modal - Only for new blank spreadsheets */}
            <WelcomeModal
              open={showWelcomeModal}
              onClose={() => setShowWelcomeModal(false)}
              onStartTour={() => {
                setShowWelcomeModal(false);
                setShowGuidedTour(true);
              }}
              onOpenGames={() => {
                setShowWelcomeModal(false);
                setShowGamesHub(true);
              }}
              userName={user.name}
            />

            {/* Guided Tour */}
            <GuidedTour
              active={showGuidedTour}
              onComplete={() => setShowGuidedTour(false)}
              onSkip={() => setShowGuidedTour(false)}
            />

            {/* Games Hub */}
            <GamesHub
              open={showGamesHub}
              onClose={() => setShowGamesHub(false)}
              onStartGame={(gameId) => {
                console.log('Starting game:', gameId);
                // Game will be handled by the GamesHub component
              }}
            />
          </CollaborationProvider>
        </ClipboardProvider>
      </UndoRedoProvider>
      {/* Pass read-only flag to grid via window for now */}
      <div style={{ display: 'none' }} data-permission={canEdit ? 'editor' : 'viewer'} />
    </SpreadsheetProvider>
    </DocumentProvider>
  );
}
