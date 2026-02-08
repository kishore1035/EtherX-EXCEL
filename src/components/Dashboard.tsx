import { useState, useEffect, MouseEvent } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import logoImage from "../assets/Logo.png";
import { getRecentSheets, formatDate, deleteSpreadsheet, type SpreadsheetData } from "../utils/spreadsheetStorage";
import { trackActivity } from "../utils/notificationSystem";
import { NotificationCenter } from "./NotificationCenter";
import { ProfileMenu } from "./ProfileMenu";
import { TemplatePickerDialog } from "./TemplatePickerDialog";
import { CollaborationPanel } from "./CollaborationPanel";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { PinnedTemplatesRow } from "./PinnedTemplatesRow";
import { SidebarNav } from "./SidebarNav";
import { SearchSortBar } from "./SearchSortBar";

interface DashboardProps {
  userName: string;
  userEmail: string;
  userPhone?: string;
  onNewSheet: () => void;
  onLoadTemplates: () => void;
  onImportFile?: (data: any) => void;
  onOpenSheet?: (sheetId: string) => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onUpdateProfile?: (name: string, email: string, phone: string) => void;
}

export function Dashboard({ 
  userName, 
  userEmail, 
  userPhone,
  onNewSheet, 
  onLoadTemplates, 
  onImportFile, 
  onOpenSheet,
  onOpenSettings,
  onLogout,
  onUpdateProfile,
}: DashboardProps) {
  const [recentSheets, setRecentSheets] = useState<SpreadsheetData[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [collaborationPanelOpen, setCollaborationPanelOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'recent' | 'name' | 'edited'>('recent');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  useEffect(() => {
    // Always apply dark mode
    document.documentElement.classList.add('dark');
  }, []);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`favoriteTemplates:${userEmail}`);
    if (stored) {
      try {
        setFavoriteTemplateIds(new Set(JSON.parse(stored) as string[]));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
  }, [userEmail]);

  // Save favorites to localStorage when they change
  const updateFavorites = (newFavorites: Set<string>) => {
    setFavoriteTemplateIds(newFavorites);
    localStorage.setItem(`favoriteTemplates:${userEmail}`, JSON.stringify(Array.from(newFavorites)));
  };

  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set<string>(favoriteTemplateIds);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    updateFavorites(newFavorites);
  };

  // Load recent sheets
  useEffect(() => {
    const sheets = getRecentSheets(userEmail);
    setRecentSheets(sheets);
  }, [userEmail]);

  const handleDeleteSheet = (e: MouseEvent, sheetId: string) => {
    e.stopPropagation();
    const sheet = recentSheets.find(s => s.id === sheetId);
    if (confirm('Are you sure you want to delete this spreadsheet?')) {
      deleteSpreadsheet(sheetId, userEmail);
      setRecentSheets(getRecentSheets(userEmail));
      // Track delete activity
      if (sheet) {
        trackActivity(userEmail, 'delete', sheetId, sheet.title);
      }
    }
  };

  const handleOpenSheet = (sheetId: string) => {
    if (onOpenSheet) {
      const sheet = recentSheets.find(s => s.id === sheetId);
      onOpenSheet(sheetId);
      // Track open activity
      if (sheet) {
        trackActivity(userEmail, 'open', sheetId, sheet.title);
      }
    }
  };

  const handleFilterToggle = (filter: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
  };

  const getFilteredSheets = () => {
    let filtered = recentSheets;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sheet =>
        sheet.title.toLowerCase().includes(query)
      );
    }

    // Apply status filters
    if (activeFilters.size > 0) {
      filtered = filtered.filter(sheet => {
        if (activeFilters.has('edited') && !(sheet as any).wasEdited) return false;
        if (activeFilters.has('reopened') && !(sheet as any).wasReopened) return false;
        return true;
      });
    }

    // Apply sorting
    const sorted = [...filtered];
    if (sortOption === 'name') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'edited') {
      sorted.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    } else {
      // 'recent' - already sorted from storage
      sorted.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    }

    return sorted;
  };

  const handleTemplateSelect = (templateData: any) => {
    // Pass the template data to the parent component
    if (onLoadTemplates) {
      onLoadTemplates();
    }
    // Store template data for the spreadsheet to load
    if (templateData && templateData.cells) {
      localStorage.setItem('pendingTemplateData', JSON.stringify(templateData));
    }
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xls,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          
          let data: { [key: string]: string } = {};
          
          if (fileExtension === 'csv') {
            // Parse CSV
            const rows = content.split('\n').map(row => {
              // Handle quoted values with commas
              const cells: string[] = [];
              let current = '';
              let inQuotes = false;
              
              for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  cells.push(current.trim());
                  current = '';
                } else {
                  current += char;
                }
              }
              cells.push(current.trim());
              return cells;
            });
            
            rows.forEach((row, rowIndex) => {
              row.forEach((cell, colIndex) => {
                const cellKey = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
                data[cellKey] = cell.replace(/^"(.*)"$/, '$1').trim();
              });
            });
          } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
            // For XLS/XLSX files, parse as tab-separated or treat as CSV
            const rows = content.split('\n').map(row => row.split(/\t|,/));
            
            rows.forEach((row, rowIndex) => {
              row.forEach((cell, colIndex) => {
                const cellKey = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
                data[cellKey] = cell.trim();
              });
            });
          }
          
          if (onImportFile) {
            onImportFile(data);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg)', color: 'var(--text)', transition: 'background-color 0.25s, color 0.25s' }}>
      {/* Left Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-64 flex-shrink-0" style={{ background: 'var(--surface)', borderRight: '2px solid rgba(255, 207, 64, 0.3)', boxShadow: 'var(--shadow)', transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s' }}>
        <SidebarNav activeItem={activeSidebarItem} onNavigate={setActiveSidebarItem} isDarkMode={true} />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)', transition: 'background-color 0.25s' }}>
        {/* Top Navigation Bar */}
        <div className="dashboard-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '80px',
          maxHeight: '80px',
          padding: '0 1.5rem',
          borderBottom: '1px solid rgba(255, 207, 64, 0.3)',
          background: 'var(--surface)',
          zIndex: 50,
          transition: 'background-color 0.25s, border-color 0.25s',
        }}>
          {/* Logo Wrapper */}
          <div className="logo-wrapper" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img
              src={logoImage}
              alt="Logo"
              style={{ height: '40px', width: 'auto', objectFit: 'contain', maxHeight: '64px' }}
            />
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 99998 }}>
            {/* Notification Center */}
            <div style={{ position: 'relative', zIndex: 99998 }}>
              <NotificationCenter userEmail={userEmail} isDarkMode={true} />
            </div>

            {/* Profile Menu */}
            <div style={{ position: 'relative', zIndex: 99998 }}>
              <ProfileMenu
                userName={userName}
                userEmail={userEmail}
                userPhone={userPhone}
                isDarkMode={true}
                onOpenSettings={() => onOpenSettings?.()}
                onOpenMySheets={() => {}}
                onOpenCollaboration={() => setCollaborationPanelOpen(true)}
                onLogout={() => onLogout?.()}
              />
            </div>

            {/* Hamburger Menu for Right Sidebar */}
            <Button
              variant="ghost"
              className="header-icon-button relative h-12 w-12 rounded-full p-0 transition-all duration-300"
              style={{
                border: "2px solid #4b5563",
              }}
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            >
              <div
                className="h-full w-full rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                }}
              >
                <Menu size={24} style={{ color: '#fbbf24' }} />
              </div>
            </Button>
          </div>
        </div>

        {/* Main Content Scroll Area with Right Panel */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          gap: '0',
          background: 'var(--bg)',
          transition: 'background-color 0.25s',
        }}>
          {/* Center Content Container */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--bg)',
            transition: 'background-color 0.25s',
          }}>
            {/* Center Content Inner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                padding: '2rem 1.5rem',
                backgroundColor: '#0a0a0a',
                width: '100%',
              }}
            >
            {/* Welcome Header */}
            <div style={{ marginBottom: '3rem', position: 'relative' }}>
              {/* Semicircle Glow Effect */}
              <div style={{
                position: 'absolute',
                top: '-60px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '120px',
                background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 207, 64, 0.15) 0%, transparent 50%)',
                pointerEvents: 'none',
                zIndex: 0,
              }} />
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: 0,
                  marginBottom: '0.5rem',
                  transition: 'color 0.25s',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Welcome back, {userName}!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  fontSize: '1rem',
                  color: 'var(--muted)',
                  margin: 0,
                  transition: 'color 0.25s',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                What would you like to work on today?
              </motion.p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" style={{
              display: 'grid',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}>
              <motion.div
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={onNewSheet}
                style={{
                  padding: '2rem',
                  borderRadius: '1rem',
                  background: 'var(--surface)',
                  border: '2px solid rgba(255, 207, 64, 0.3)',
                  boxShadow: 'var(--shadow)',
                  cursor: 'pointer',
                  transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 207, 64, 0.6), 0 0 40px rgba(255, 207, 64, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow)';
                  e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.3)';
                }}
              >
                <img src="/icons/3d/plus.svg" alt="New Spreadsheet" className="dashboard-icon" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', margin: 0, marginBottom: '0.5rem', transition: 'color 0.25s' }}>
                  New Spreadsheet
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0, marginBottom: '1rem', transition: 'color 0.25s' }}>
                  Start with a blank sheet
                </p>
                <Button style={{ width: '100%' }}>Create New</Button>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setTemplateDialogOpen(true)}
                style={{
                  padding: '2rem',
                  borderRadius: '1rem',
                  background: 'var(--surface)',
                  border: '2px solid rgba(255, 207, 64, 0.3)',
                  boxShadow: 'var(--shadow)',
                  cursor: 'pointer',
                  transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 207, 64, 0.6), 0 0 40px rgba(255, 207, 64, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow)';
                  e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.3)';
                }}
              >
                <img src="/icons/3d/sparkles.svg" alt="Use Templates" className="dashboard-icon" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', margin: 0, marginBottom: '0.5rem', transition: 'color 0.25s' }}>
                  Use Templates
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0, marginBottom: '1rem', transition: 'color 0.25s' }}>
                  Budget, tracking & more
                </p>
                <Button style={{ width: '100%' }}>Browse Templates</Button>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleImportFile}
                style={{
                  padding: '2rem',
                  borderRadius: '1rem',
                  background: 'var(--surface)',
                  border: '2px solid rgba(255, 207, 64, 0.3)',
                  boxShadow: 'var(--shadow)',
                  cursor: 'pointer',
                  transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 207, 64, 0.6), 0 0 40px rgba(255, 207, 64, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow)';
                  e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.3)';
                }}
              >
                <img src="/icons/3d/upload.svg" alt="Import File" className="dashboard-icon" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', margin: 0, marginBottom: '0.5rem', transition: 'color 0.25s' }}>
                  Import File
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0, marginBottom: '1rem', transition: 'color 0.25s' }}>
                  Upload CSV or Excel
                </p>
                <Button style={{ width: '100%' }}>Import File</Button>
              </motion.div>
            </div>

            {/* Pinned Templates */}
            <PinnedTemplatesRow
              onUseTemplate={() => setTemplateDialogOpen(true)}
              onViewAll={() => setTemplateDialogOpen(true)}
              favoriteTemplateIds={favoriteTemplateIds}
              onToggleFavorite={toggleFavorite}
            />

            {/* Search & Sort Bar */}
            <SearchSortBar
              onSearch={setSearchQuery}
              onSort={setSortOption}
              onFilterToggle={handleFilterToggle}
              activeFilters={activeFilters}
              isDarkMode={true}
            />

            {/* Recent Sheets */}
            {getFilteredSheets().length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ marginTop: '3rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <img src="/icons/3d/clock.svg" alt="Recent" className="dashboard-icon" style={{ width: '32px', height: '32px', marginBottom: 0 }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#F0A500', margin: 0 }}>
                    Recent Spreadsheets
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#F0A500',
                    background: 'rgba(255, 207, 64, 0.1)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                  }}>
                    {getFilteredSheets().length}
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.5rem',
                }}>
                  {getFilteredSheets().map((sheet, index) => (
                    <motion.div
                      key={sheet.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      onClick={() => handleOpenSheet(sheet.id)}
                      style={{
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        background: 'rgba(255, 207, 64, 0.05)',
                        border: '1px solid rgba(255, 207, 64, 0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderColor = 'rgba(255, 207, 64, 0.4)';
                        el.style.background = 'rgba(255, 207, 64, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderColor = 'rgba(255, 207, 64, 0.15)';
                        el.style.background = 'rgba(255, 207, 64, 0.05)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#F0A500', margin: 0 }}>
                            {sheet.title}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0.25rem 0 0 0' }}>
                            {formatDate(sheet.lastModified)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSheet(e as any, sheet.id);
                          }}
                          style={{
                            background: 'rgba(255, 59, 48, 0.1)',
                            border: 'none',
                            borderRadius: '0.375rem',
                            color: '#FF3B30',
                            cursor: 'pointer',
                            padding: '0.375rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <img src="/icons/3d/trash.svg" alt="Delete" style={{ width: '20px', height: '20px' }} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ marginTop: '3rem' }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#F0A500', margin: '0 0 1.5rem 0' }}>
                Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{
                display: 'grid',
                gap: '1rem',
              }}>
                {[
                  'Advanced Formulas',
                  'Conditional Formatting',
                  'Export/Import',
                  'Auto-Save',
                  'Keyboard Shortcuts',
                  'Data Validation',
                ].map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      borderRadius: '1rem',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 207, 64, 0.2)',
                      background: 'rgba(255, 207, 64, 0.05)',
                      color: '#F0A500',
                    }}
                  >
                    <p style={{ fontSize: '0.875rem', color: '#F0A500', margin: 0, fontWeight: 500 }}>{feature}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Empty State */}
            {getFilteredSheets().length === 0 && recentSheets.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  borderRadius: '1rem',
                  border: '2px dashed rgba(255, 207, 64, 0.2)',
                  marginTop: '3rem',
                }}
              >
                <img src="/icons/3d/file-spreadsheet.svg" alt="No sheets" style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#F0A500', margin: 0, marginBottom: '0.5rem' }}>
                  No recent sheets yet
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
                  Create a new spreadsheet or import a file to get started
                </p>
              </motion.div>
            )}
            </motion.div>
          </div>

          {/* Right Quick Actions Panel - Slide-out Sidebar */}
          {rightSidebarOpen && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setRightSidebarOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 99990,
                }}
              />
              
              {/* Sidebar */}
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: '1px solid rgba(255, 207, 64, 0.1)',
                  backgroundColor: '#0a0a0a',
                  zIndex: 99991,
                  boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
                  padding: '1.25rem',
                }}
              >
                <QuickActionsPanel
                  onNewSheet={onNewSheet}
                  onImport={handleImportFile}
                  onBrowseTemplates={() => setTemplateDialogOpen(true)}
                  onClose={() => setRightSidebarOpen(false)}
                  recentSheetCount={recentSheets.length}
                  favoriteTemplateIds={favoriteTemplateIds}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Template Picker Dialog */}
      <TemplatePickerDialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        isDarkMode={true}
      />

      {/* Collaboration Panel */}
      <CollaborationPanel
        isOpen={collaborationPanelOpen}
        onClose={() => setCollaborationPanelOpen(false)}
        userEmail={userEmail}
        isDarkMode={true}
      />
    </div>
  );
}
