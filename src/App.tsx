import { useState, useEffect, useLayoutEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { SettingsPage } from "./components/SettingsPage";
import { StartupSplash } from "./components/StartupSplash";
import { WelcomeSplash } from "./components/WelcomeSplash";
import { Dashboard } from "./components/Dashboard";
import { ExcelSpreadsheet } from "./components/ExcelSpreadsheet";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { User } from "./types/spreadsheet";
import { generateSpreadsheetId, loadSpreadsheet, clearNewSpreadsheetCache, saveSpreadsheet, type SpreadsheetData } from "./utils/spreadsheetStorage";
import { trackActivity } from "./utils/notificationSystem";
import { parseCollaborationLink, getCollaborationLink, addCollaborator } from "./utils/collaborationSystem";
import { RealtimeCollaborationProvider } from "./contexts/RealtimeCollaborationContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

type Screen = "login" | "signup" | "welcome" | "dashboard" | "app" | "forgotPassword" | "resetPassword" | "settings";

export default function App() {
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState<User | null>(null);
  const [showDemoOnStart, setShowDemoOnStart] = useState(false);
  const [importedData, setImportedData] = useState<any>(null);
  const [currentSpreadsheet, setCurrentSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [pendingLinkId, setPendingLinkId] = useState<string | null>(null);
  const [isProcessingCollabLink, setIsProcessingCollabLink] = useState<boolean>(false);

  // Read collaboration link on mount and defer handling until after login
  useEffect(() => {
    const linkId = parseCollaborationLink();
    if (linkId) {
      setPendingLinkId(linkId);
    }
  }, []);

  // When user is available and a pending collaboration link exists, join and open
  useEffect(() => {
    console.log('🔄 useEffect triggered - user:', !!user, 'pendingLinkId:', pendingLinkId);
    if (!user || !pendingLinkId) return;
    
    setIsProcessingCollabLink(true);
    console.log('✅ Both user and pendingLinkId exist, loading link...');
    const link = getCollaborationLink(pendingLinkId);
    console.log('🔗 Link retrieved:', !!link);
    
    if (!link) {
      console.error('❌ Link not found in localStorage for id:', pendingLinkId);
      // Clear the invalid link and URL parameter
      setPendingLinkId(null);
      const url = new URL(window.location.href);
      url.searchParams.delete('collab');
      window.history.replaceState({}, '', url.toString());
      toast.error("Invalid or expired collaboration link. Opening dashboard...");
      setIsProcessingCollabLink(false);
      setScreen("dashboard");
      return;
    }

    console.log('🔗 Processing collaboration link:', {
      linkId: pendingLinkId,
      hasSnapshot: !!link.snapshot,
      permission: link.permission,
      spreadsheetId: link.spreadsheetId
    });

    // Set permission for this session
    setCanEdit(link.permission !== 'viewer');
    // Add user as collaborator
    addCollaborator(pendingLinkId, user.email, user.name);

    // Try to load from local storage first
    let sheet = loadSpreadsheet(link.spreadsheetId);
    console.log('📂 Local sheet found:', !!sheet);

    // If missing (new collaborator), hydrate from snapshot embedded in link
    if (!sheet && link.snapshot) {
      console.log('💾 Hydrating from snapshot:', {
        title: link.snapshot.title,
        cellCount: Object.keys(link.snapshot.cellData || {}).length,
        hasFormats: !!link.snapshot.cellFormats,
        snapshotKeys: Object.keys(link.snapshot)
      });
      const snapshot = { ...link.snapshot } as SpreadsheetData;
      // Rebind snapshot to current user for local saves
      snapshot.userEmail = user.email;
      const saved = saveSpreadsheet({
        id: snapshot.id,
        title: snapshot.title,
        userEmail: snapshot.userEmail,
        cellData: snapshot.cellData || {},
        cellFormats: snapshot.cellFormats || {},
        created: snapshot.created || new Date().toISOString(),
      });
      sheet = saved;
      console.log('✅ Sheet created from snapshot, result:', {
        id: saved.id,
        title: saved.title,
        cellCount: Object.keys(saved.cellData || {}).length
      });
    }

    if (sheet) {
      console.log('📊 Opening spreadsheet:', sheet.title, 'Cells:', Object.keys(sheet.cellData || {}).length);
      setCurrentSpreadsheet(sheet);
      setScreen("app");
      setIsProcessingCollabLink(false);
      const roleLabel = link.permission === 'viewer' ? '(View only)' : '(Editor)';
      toast.success(`Joined collaboration on "${link.spreadsheetTitle}" ${roleLabel}`);
      // Clear the URL parameter and pending link id
      window.history.replaceState({}, document.title, window.location.pathname);
      setPendingLinkId(null);
    } else {
      console.error('❌ Failed to load/create sheet');
      toast.error("Could not load shared spreadsheet");
      setPendingLinkId(null);
      setIsProcessingCollabLink(false);
      setScreen("dashboard");
    }
  }, [user, pendingLinkId]);

  const handleLogin = (emailOrPhone: string) => {
    console.log('👤 Login handler called, pendingLinkId:', pendingLinkId);
    // Retrieve stored user data from localStorage
    const storedName = localStorage.getItem(`user_name_${emailOrPhone}`);
    const storedPhone = localStorage.getItem(`user_phone_${emailOrPhone}`);
    
    const newUser: User = {
      name: storedName || (emailOrPhone.includes("@") ? emailOrPhone.split("@")[0].charAt(0).toUpperCase() + emailOrPhone.split("@")[0].slice(1) : "User"),
      email: emailOrPhone.includes("@") ? emailOrPhone : `${emailOrPhone}@example.com`,
      phone: storedPhone || (emailOrPhone.includes("@") ? undefined : emailOrPhone),
    };
    setUser(newUser);
    console.log('👤 User set:', newUser.email);
    
    // If there's a pending collaboration link, show dashboard while processing
    if (!pendingLinkId) {
      console.log('🖥️ No pending link, going to welcome screen');
      setScreen("welcome");
    } else {
      console.log('⏳ Pending link detected, showing dashboard while processing...');
      setScreen("dashboard");
    }
  };

  const handleSignup = (name: string, email: string, phone: string) => {
    console.log('👤 Signup handler called, pendingLinkId:', pendingLinkId);
    const newUser: User = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      phone: phone || undefined,
    };
    setUser(newUser);
    console.log('👤 User set:', newUser.email);
    
    // If there's a pending collaboration link, show dashboard while processing
    if (!pendingLinkId) {
      console.log('🖥️ No pending link, going to welcome screen');
      setScreen("welcome");
    } else {
      console.log('⏳ Pending link detected, showing dashboard while processing...');
      setScreen("dashboard");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setScreen("login");
  };

  const handleForgotPassword = () => {
    setScreen("forgotPassword");
  };

  const handleOtpVerified = (email: string) => {
    setResetEmail(email);
    setScreen("resetPassword");
  };

  const handlePasswordReset = () => {
    setResetEmail("");
    setScreen("login");
  };

  const handleUpdateProfile = (name: string, email: string, phone: string) => {
    if (user) {
      setUser({
        ...user,
        name,
        email,
        phone: phone || undefined,
      });
    }
  };

  const handleImportFile = (data: any) => {
    setImportedData(data);
    setCurrentSpreadsheet(null);
    setScreen("app");
    // Track import activity
    if (user?.email) {
      trackActivity(user.email, 'import', undefined, data?.fileName || 'Imported file');
    }
  };

  const handleOpenSheet = (sheetId: string) => {
    const sheet = loadSpreadsheet(sheetId);
    if (sheet) {
      // This is an existing sheet: ensure global flags reflect non-blank
      (window as any).__isNewBlankSpreadsheet = false;
      (window as any).__currentSpreadsheetId = sheet.id;
      setCurrentSpreadsheet(sheet);
      setImportedData(null);
      setScreen("app");
      // Track open activity
      if (user?.email) {
        trackActivity(user.email, 'open', sheet.id, sheet.title);
        // Mark as reopened for dashboard indicators
        import('./utils/spreadsheetStorage').then(mod => {
          mod.markSheetReopened(user.email!, sheet.id);
        });
      }
    }
  };

  const handleNewSheet = () => {
    // Clear any existing data first
    setCurrentSpreadsheet(null);
    setImportedData(null);
    
    // Create a completely new spreadsheet with unique ID
    const uniqueId = generateSpreadsheetId();
    
    // CRITICAL: Clear any cached data for this new ID immediately
    clearNewSpreadsheetCache(uniqueId);
    
    // Also clear from sheet storage system
    const clearSheetStorageImport = async () => {
      const { clearSheetStorage, initializeBlankSheet } = await import('./utils/sheetStorageManager');
      clearSheetStorage(uniqueId);
      // Initialize with explicit empty data
      initializeBlankSheet(uniqueId);
    };
    clearSheetStorageImport();

    // Set globals for SpreadsheetGrid gating
    (window as any).__isNewBlankSpreadsheet = true;
    (window as any).__currentSpreadsheetId = uniqueId;
    
    const newSheet: SpreadsheetData = {
      id: uniqueId,
      title: "Untitled",
      userEmail: user?.email || "",
      cellData: {}, // Explicitly empty
      cellFormats: {}, // Explicitly empty
      lastModified: new Date().toISOString(),
      created: new Date().toISOString(),
    };
    
    // Small delay to ensure state is cleared
    setTimeout(() => {
      setCurrentSpreadsheet(newSheet);
      setScreen("app");
      
      // Track create activity
      if (user?.email) {
        trackActivity(user.email, 'create', newSheet.id, newSheet.title);
      }
    }, 50);
  };

  // Ensure globals reset when navigating back to dashboard to avoid stale state
  const handleBackToHome = () => {
    setScreen("dashboard");
    setCurrentSpreadsheet(null);
    setImportedData(null);
    (window as any).__isNewBlankSpreadsheet = false;
    (window as any).__currentSpreadsheetId = undefined;
  };

  // Listen for dashboard navigation event from Header
  useEffect(() => {
    const handleNavigateToDashboard = () => {
      handleBackToHome();
    };
    
    window.addEventListener('navigateToDashboard', handleNavigateToDashboard);
    return () => window.removeEventListener('navigateToDashboard', handleNavigateToDashboard);
  }, []);

  return (
    <ThemeProvider>
      <AppContent 
        showStartupSplash={showStartupSplash}
        setShowStartupSplash={setShowStartupSplash}
        screen={screen}
        setScreen={setScreen}
        user={user}
        showDemoOnStart={showDemoOnStart}
        setShowDemoOnStart={setShowDemoOnStart}
        importedData={importedData}
        currentSpreadsheet={currentSpreadsheet}
        canEdit={canEdit}
        resetEmail={resetEmail}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        handleLogout={handleLogout}
        handleForgotPassword={handleForgotPassword}
        handleOtpVerified={handleOtpVerified}
        handlePasswordReset={handlePasswordReset}
        handleUpdateProfile={handleUpdateProfile}
        handleImportFile={handleImportFile}
        handleOpenSheet={handleOpenSheet}
        handleNewSheet={handleNewSheet}
        handleBackToHome={handleBackToHome}
      />
    </ThemeProvider>
  );
}

interface AppContentProps {
  showStartupSplash: boolean;
  setShowStartupSplash: (value: boolean) => void;
  screen: Screen;
  setScreen: (value: Screen) => void;
  user: User | null;
  showDemoOnStart: boolean;
  setShowDemoOnStart: (value: boolean) => void;
  importedData: any;
  currentSpreadsheet: SpreadsheetData | null;
  canEdit: boolean;
  resetEmail: string;
  handleLogin: (emailOrPhone: string) => void;
  handleSignup: (name: string, email: string, phone: string) => void;
  handleLogout: () => void;
  handleForgotPassword: () => void;
  handleOtpVerified: (email: string) => void;
  handlePasswordReset: () => void;
  handleUpdateProfile: (name: string, email: string, phone: string) => void;
  handleImportFile: (data: any) => void;
  handleOpenSheet: (sheetId: string) => void;
  handleNewSheet: () => void;
  handleBackToHome: () => void;
}

function AppContent(props: AppContentProps) {
  const { theme, setThemeForScreen } = useTheme();
  const {
    showStartupSplash,
    setShowStartupSplash,
    screen,
    setScreen,
    user,
    handleLogin,
    handleForgotPassword,
    handleOtpVerified,
    handlePasswordReset,
    handleUpdateProfile,
    handleSignup,
    handleNewSheet,
    handleImportFile,
    handleOpenSheet,
    handleLogout,
    handleBackToHome,
    resetEmail,
    showDemoOnStart,
    setShowDemoOnStart,
    importedData,
    currentSpreadsheet,
    canEdit,
  } = props;

  // Set theme based on current screen - using useLayoutEffect for synchronous execution before paint
  useLayoutEffect(() => {
    setThemeForScreen(screen);
  }, [screen, setThemeForScreen]);

  return (
    <>
      {showStartupSplash && (
        <StartupSplash onComplete={() => setShowStartupSplash(false)} />
      )}

      {!showStartupSplash && screen === "login" && (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={() => setScreen("signup")}
            onForgotPassword={handleForgotPassword}
          />
      )}

      {screen === "signup" && (
        <SignupPage
          onSignup={handleSignup}
          onSwitchToLogin={() => setScreen("login")}
        />
      )}

      {screen === "forgotPassword" && (
        <ForgotPasswordPage
          onBackToLogin={() => setScreen("login")}
          onOtpVerified={handleOtpVerified}
        />
      )}

      {screen === "resetPassword" && (
        <ResetPasswordPage
          email={resetEmail}
          onPasswordReset={handlePasswordReset}
        />
      )}

      {screen === "settings" && user && (
        <SettingsPage
          userName={user.name}
          userEmail={user.email}
          userPhone={user.phone}
          isDarkMode={theme === "dark"}
          onBack={() => setScreen("dashboard")}
          onSaveProfile={handleUpdateProfile}
        />
      )}

      {screen === "welcome" && user && (
        <WelcomeSplash user={user} onComplete={() => setScreen("dashboard")} />
      )}

      {screen === "dashboard" && user && (
        <Dashboard
          userName={user.name}
          userEmail={user.email}
          userPhone={user.phone}
          onNewSheet={handleNewSheet}
          onLoadTemplates={() => {
            setScreen("app");
            setShowDemoOnStart(true);
          }}
          onImportFile={handleImportFile}
          onOpenSheet={handleOpenSheet}
          onOpenSettings={() => setScreen("settings")}
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {screen === "app" && user && (
        <RealtimeCollaborationProvider>
          <ExcelSpreadsheet 
            user={user} 
            onLogout={handleLogout}
            onBackToHome={handleBackToHome}
            importedData={importedData}
            currentSpreadsheet={currentSpreadsheet}
            canEdit={canEdit}
          />
        </RealtimeCollaborationProvider>
      )}

      <Toaster />
      
      {/* SVG Gradient Definitions for 3D Icons */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <linearGradient id="icon-gradient-text" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          
          <linearGradient id="icon-gradient-clipboard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          
          <linearGradient id="icon-gradient-align" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          
          <linearGradient id="icon-gradient-import" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          
          <linearGradient id="icon-gradient-danger" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          
          <linearGradient id="icon-gradient-success" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          
          <linearGradient id="icon-gradient-info" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          
          <linearGradient id="icon-gradient-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFCF40" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}
