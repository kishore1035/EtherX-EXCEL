import { FileSpreadsheet, Save, Undo, Redo, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { useUndoRedo } from '../contexts/UndoRedoContext';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { exportToCSV } from '../utils/csvExport';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {}

export function Header({}: HeaderProps) {
  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const { setCellData, setCellFormats, cellData } = useSpreadsheet();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Get user info from localStorage
  const userEmail = localStorage.getItem('userEmail') || 'user@etherx.com';
  const userName = userEmail.split('@')[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

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

  const handleSave = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `EtherX_Spreadsheet_${timestamp}.csv`;
    exportToCSV(cellData, filename);
  };

  const handleDashboard = () => {
    // Navigate to dashboard - can be updated with router if available
    window.location.href = '/dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };
  return (
    <div className="h-12 flex items-center px-2 sm:px-4 gap-2 sm:gap-4 text-black" style={{ 
        background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)'
      }}>
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="font-semibold text-sm sm:text-base">EtherX Excel</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-black hover:bg-black hover:bg-opacity-10"
          onClick={handleSave}
          title="Save as CSV"
        >
          <Save className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 w-8 p-0 text-black hover:bg-black hover:bg-opacity-10 ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <Undo className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 w-8 p-0 text-black hover:bg-black hover:bg-opacity-10 ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleRedo}
          disabled={!canRedo}
        >
          <Redo className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm hidden sm:inline">Workbook1</span>
        
        {/* Dashboard Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-black hover:bg-black hover:bg-opacity-10 flex items-center gap-2"
          onClick={handleDashboard}
          title="Go to Dashboard"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Dashboard</span>
        </Button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-black hover:bg-black hover:bg-opacity-10 rounded-full"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            title="User Profile"
          >
            <User className="w-4 h-4" />
          </Button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900" style={{ color: '#000000' }}>{userName}</p>
                <p className="text-xs text-gray-600" style={{ color: '#000000' }}>{userEmail}</p>
              </div>
              
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  // Add settings navigation if needed
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                style={{ color: '#000000' }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  handleDashboard();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                style={{ color: '#000000' }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              
              <div className="border-t border-gray-200 mt-1 pt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  style={{ color: '#dc2626' }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
