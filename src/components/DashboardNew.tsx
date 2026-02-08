import { useState, useEffect, MouseEvent } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { FileSpreadsheet, Plus, Sparkles, Upload, Clock, Moon, Sun, Trash2, Settings, LogOut } from "lucide-react";
import logoImage from "../assets/Logo.png";
import { getRecentSheets, getRecentSheetsWithMeta, formatDate, deleteSpreadsheet, type SpreadsheetData } from "../utils/spreadsheetStorage";
import { trackActivity } from "../utils/notificationSystem";
import { NotificationCenter } from "./NotificationCenter";
import { ProfileMenu } from "./ProfileMenu";
import { TemplatePickerDialog } from "./TemplatePickerDialog";
import { CollaborationPanel } from "./CollaborationPanel";
import { useTheme } from "../contexts/ThemeContext";
import { IconButton3D, Icon3D, IconContainer3D } from "./ui/Icon3D";
import { DashboardCard } from "./DashboardCard";
import { RecentSheetCard } from "./RecentSheetCard";
import { SidebarNav } from "./SidebarNav";
import { SearchSortBar } from "./SearchSortBar";
import { PinnedTemplatesRow } from "./PinnedTemplatesRow";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { colors, spacing, borderRadius, transitions } from "../utils/designTokens";

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
  const [recentSheets, setRecentSheets] = useState<Array<SpreadsheetData & { lastOpenedAt?: string; wasReopened?: boolean; wasEdited?: boolean }>>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [collaborationPanelOpen, setCollaborationPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'recent' | 'name' | 'edited'>('recent');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const { theme, toggleTheme } = useTheme();

  // Load recent sheets - refresh whenever Dashboard mounts or userEmail changes
  useEffect(() => {
    const sheets = getRecentSheetsWithMeta(userEmail);
    setRecentSheets(sheets);
  }, [userEmail]);

  // Also refresh when Dashboard becomes visible (component mounts)
  useEffect(() => {
    const refreshSheets = () => {
      const sheets = getRecentSheetsWithMeta(userEmail);
      setRecentSheets(sheets);
    };
    // Refresh on mount
    refreshSheets();
    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshSheets();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userEmail]);

  const handleDeleteSheet = (e: MouseEvent, sheetId: string) => {
    e.stopPropagation();
    const sheet = recentSheets.find(s => s.id === sheetId);
    if (confirm('Are you sure you want to delete this spreadsheet?')) {
      deleteSpreadsheet(sheetId, userEmail);
      setRecentSheets(getRecentSheetsWithMeta(userEmail));
      if (sheet) {
        trackActivity(userEmail, 'delete', sheetId, sheet.title);
      }
    }
  };

  const handleDeleteSheetById = (sheetId: string) => {
    const sheet = recentSheets.find(s => s.id === sheetId);
    if (confirm('Are you sure you want to delete this spreadsheet?')) {
      deleteSpreadsheet(sheetId, userEmail);
      setRecentSheets(getRecentSheetsWithMeta(userEmail));
      if (sheet) {
        trackActivity(userEmail, 'delete', sheetId, sheet.title);
      }
    }
  };

  const handleOpenSheet = (sheetId: string) => {
    if (onOpenSheet) {
      const sheet = recentSheets.find(s => s.id === sheetId);
      onOpenSheet(sheetId);
      if (sheet) {
        trackActivity(userEmail, 'open', sheetId, sheet.title);
      }
    }
  };

  const handleTemplateSelect = (templateData: any) => {
    if (onLoadTemplates) {
      onLoadTemplates();
    }
    if (templateData && templateData.cells) {
      localStorage.setItem('pendingTemplateData', JSON.stringify(templateData));
    }
  };

  // Filter and sort sheets
  const getFilteredSheets = () => {
    let filtered = [...recentSheets];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(sheet =>
        sheet.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filters
    if (activeFilters.size > 0) {
      filtered = filtered.filter(sheet => {
        if (activeFilters.has('edited') && sheet.wasEdited) return true;
        if (activeFilters.has('reopened') && sheet.wasReopened) return true;
        if (activeFilters.has('shared')) return true;
        return activeFilters.size === 0;
      });
    }

    // Apply sort
    if (sortOption === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'edited') {
      filtered.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    }

    return filtered;
  };

  const handleSidebarNav = (item: string) => {
    setActiveSidebarItem(item);
    if (item === 'settings') {
      onOpenSettings?.();
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
            const rows = content.split('\n').map(row => {
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
    <div
      className="dashboard-container"
      style={{
        minHeight: '100vh',
        width: '100%',
        background: colors.gradient.background,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* Sidebar Navigation */}
      <SidebarNav
        activeItem={activeSidebarItem}
        onNavigate={handleSidebarNav}
        isDarkMode={theme === 'dark'}
      />

      {/* Main Content Wrapper */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Navigation Bar */}
        <div
          className="dashboard-navbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing[4]} ${spacing[6]}`,
            borderBottom: `1px solid ${colors.border.primary}`,
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 100%)`,
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Left side - Logo and title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <div style={{ width: spacing[10], height: spacing[10], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logoImage} alt="EtherX Excel" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  background: colors.gradient.title,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                EtherX Excel
              </h1>
            </div>
          </div>

          {/* Right side - Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              zIndex: 99998,
            }}
          >
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: spacing[10],
                height: spacing[10],
                borderRadius: borderRadius.md,
                background: colors.border.secondary,
                border: `1px solid ${colors.border.primaryLight}`,
                cursor: 'pointer',
                transition: transitions.base,
                color: colors.text.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary.yellow;
                e.currentTarget.style.background = colors.border.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border.primaryLight;
                e.currentTarget.style.background = colors.border.secondary;
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Center */}
            <div style={{ position: 'relative', zIndex: 99998 }}>
              <NotificationCenter userEmail={userEmail} isDarkMode={theme === 'dark'} />
            </div>

            {/* Profile Menu */}
            <div style={{ position: 'relative', zIndex: 99998 }}>
              <ProfileMenu
                userName={userName}
                userEmail={userEmail}
                userPhone={userPhone}
                isDarkMode={theme === 'dark'}
                onOpenSettings={() => onOpenSettings?.()}
                onOpenMySheets={() => {}}
                onOpenCollaboration={() => setCollaborationPanelOpen(true)}
                onLogout={() => onLogout?.()}
              />
            </div>
          </div>
        </div>

        {/* Content Area with Main and Side Panel */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            gap: spacing[4],
          }}
        >
          {/* Main Content Scroll Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: `${spacing[8]} ${spacing[6]}`,
              maxWidth: '900px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            {/* Header Section */}
            <div style={{ marginBottom: spacing[12] }}>
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  background: colors.gradient.title,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                  marginBottom: spacing[2],
                  lineHeight: 1.2,
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
                  color: colors.text.secondary,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                What would you like to work on today?
              </motion.p>
            </div>

            {/* Feature Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <DashboardCard
                icon={Plus}
                title="Blank Spreadsheet"
                description="Start with an empty spreadsheet"
                buttonText="Create New"
                onClick={onNewSheet}
                delay={0.1}
              />

              <DashboardCard
                icon={Sparkles}
                title="Use Templates"
                description="Budget, study, workout & more"
                buttonText="Browse Templates"
                onClick={() => setTemplateDialogOpen(true)}
                delay={0.2}
              />

              <DashboardCard
                icon={Upload}
                title="Import File"
                description="Upload CSV, XLS, or XLSX files"
                buttonText="Import File"
                onClick={handleImportFile}
                delay={0.3}
              />
            </div>

            {/* Pinned Templates Section */}
            <PinnedTemplatesRow
              onUseTemplate={(templateId) => setTemplateDialogOpen(true)}
              onViewAll={() => setTemplateDialogOpen(true)}
            />

            {/* Search and Sort Bar */}
            <SearchSortBar
              onSearch={(query) => setSearchQuery(query)}
              onSort={(option) => setSortOption(option)}
              onFilterToggle={(filter) => handleFilterToggle(filter)}
              activeFilters={activeFilters}
            />

            {/* Recent Sheets Section */}
            {getFilteredSheets().length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ marginBottom: spacing[12] }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[6] }}>
                  <Clock size={24} style={{ color: colors.primary.yellow }} strokeWidth={1.5} />
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Recent Sheets
                  </h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: colors.text.muted,
                      background: colors.border.primary,
                      padding: `${spacing[1]} ${spacing[2]}`,
                      borderRadius: borderRadius.full,
                    }}
                  >
                    {getFilteredSheets().length}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: spacing[4],
                  }}
                >
                  {getFilteredSheets().map((sheet, index) => {
                    const statusTags = [];
                    if (sheet.wasEdited) {
                      statusTags.push({ label: 'Edited', color: 'yellow' as const });
                    }
                    if (sheet.wasReopened) {
                      statusTags.push({ label: 'Reopened', color: 'blue' as const });
                    }

                    const sheetCardKey = sheet.id;
                    return (
                      <div key={sheetCardKey}>
                        <RecentSheetCard
                          id={sheet.id}
                          title={sheet.title}
                          date={formatDate(sheet.lastModified)}
                          statusTags={statusTags}
                          onClick={() => handleOpenSheet(sheet.id)}
                          onDelete={handleDeleteSheetById}
                          delay={0.05 * index}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {getFilteredSheets().length === 0 && recentSheets.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  textAlign: 'center',
                  padding: spacing[12],
                  borderRadius: borderRadius.lg,
                  border: `2px dashed ${colors.border.primary}`,
                  background: `linear-gradient(135deg, ${colors.primary.yellowLight} 0%, rgba(59, 130, 246, 0.05) 100%)`,
                }}
              >
                <FileSpreadsheet
                  size={48}
                  style={{
                    color: colors.text.muted,
                    margin: '0 auto',
                    marginBottom: spacing[4],
                    opacity: 0.5,
                  }}
                />
                <h4
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    margin: 0,
                    marginBottom: spacing[2],
                  }}
                >
                  No recent sheets yet
                </h4>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: colors.text.muted,
                    margin: 0,
                    marginBottom: spacing[4],
                  }}
                >
                  Create a new spreadsheet or import a file to get started
                </p>
              </motion.div>
            )}

            {/* No results state */}
            {getFilteredSheets().length === 0 && recentSheets.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  textAlign: 'center',
                  padding: spacing[8],
                  borderRadius: borderRadius.lg,
                  background: colors.background.darkCard,
                  border: `1px solid ${colors.border.primary}`,
                }}
              >
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: colors.text.secondary,
                    margin: 0,
                  }}
                >
                  No sheets match your search or filters
                </p>
              </motion.div>
            )}

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ marginTop: spacing[12] }}
            >
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[6],
                }}
              >
                Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Advanced Formulas",
                  "Conditional Formatting",
                  "Charts & Graphs",
                  "Export/Import",
                  "Auto-Save",
                  "Keyboard Shortcuts",
                  "Data Validation",
                  "Multiple Sheets",
                ].map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      padding: spacing[4],
                      borderRadius: borderRadius.lg,
                      textAlign: 'center',
                      background: colors.background.darkCard,
                      border: `1px solid ${colors.border.primary}`,
                      boxShadow: colors.shadow.sm,
                      transition: transitions.base,
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.primary.yellow;
                      e.currentTarget.style.boxShadow = colors.shadow.md;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = colors.shadow.sm;
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: colors.text.primary,
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side Panel - Quick Actions (Desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              width: '300px',
              padding: `${spacing[8]} ${spacing[4]}`,
              borderLeft: `1px solid ${colors.border.primary}`,
              overflowY: 'auto',
            }}
            className="quick-panel-desktop"
          >
            <QuickActionsPanel
              onNewSheet={onNewSheet}
              onImport={handleImportFile}
              onBrowseTemplates={() => setTemplateDialogOpen(true)}
              recentSheetCount={recentSheets.length}
              isDarkMode={theme === 'dark'}
            />
          </motion.div>
        </div>
      </div>

      {/* Template Picker Dialog */}
      <TemplatePickerDialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        isDarkMode={theme === 'dark'}
      />

      {/* Collaboration Panel */}
      <CollaborationPanel
        isOpen={collaborationPanelOpen}
        onClose={() => setCollaborationPanelOpen(false)}
        userEmail={userEmail}
        isDarkMode={theme === 'dark'}
      />
    </div>
  );
}
