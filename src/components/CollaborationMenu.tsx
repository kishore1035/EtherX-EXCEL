import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Users,
  Link as LinkIcon,
  Copy,
  Check,
  UserPlus,
  Clock,
  X,
  Circle,
} from "lucide-react";
import {
  createCollaborationLink,
  getActiveCollaborators,
  getCollaborationLinkUrl,
  updateCollaboratorActivity,
  type ActiveCollaborator,
  type CollaborationPermission,
} from "../utils/collaborationSystem";
import { toast } from "sonner";
import { loadSpreadsheet, autoSaveSpreadsheet } from "../utils/spreadsheetStorage";
import { attachSnapshotToLink } from "../utils/collaborationSystem";
import { useSpreadsheet } from "../contexts/SpreadsheetContext";

interface CollaborationMenuProps {
  spreadsheetId: string;
  spreadsheetTitle: string;
  userEmail: string;
  userName: string;
  isDarkMode: boolean;
}

export function CollaborationMenu({
  spreadsheetId,
  spreadsheetTitle,
  userEmail,
  userName,
  isDarkMode,
}: CollaborationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<ActiveCollaborator[]>([]);
  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [permission, setPermission] = useState<CollaborationPermission>("editor");
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Get current spreadsheet data from context
  const { cellData, cellFormats } = useSpreadsheet();

  // Clear share link when permission changes to force new link generation
  useEffect(() => {
    if (shareLink) {
      setShareLink("");
      setCopied(false);
    }
  }, [permission]);

  // Load collaborators
  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
      const interval = setInterval(loadCollaborators, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, spreadsheetId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Update activity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      updateCollaboratorActivity(spreadsheetId, userEmail);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [spreadsheetId, userEmail]);

  // Update button position when opened
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const loadCollaborators = () => {
    const collabs = getActiveCollaborators(spreadsheetId);
    setCollaborators(collabs);
  };

  const handleGenerateLink = () => {
    console.log('🔗 Generating collaboration link for:', spreadsheetId, spreadsheetTitle);
    
    // CRITICAL: Save the current spreadsheet state BEFORE generating the link
    // This ensures the snapshot includes the latest data, even if autosave hasn't run yet
    console.log('💾 Saving current spreadsheet state before generating link...');
    console.log('Current cellData count:', Object.keys(cellData || {}).length);
    
    if (!cellData || Object.keys(cellData).length === 0) {
      console.warn('⚠️ No cell data to share!');
      toast.error("Please add some data to the spreadsheet before sharing!");
      return;
    }
    
    // Manually trigger save with current state
    autoSaveSpreadsheet(spreadsheetId, spreadsheetTitle, userEmail, cellData, cellFormats);
    console.log('✅ Spreadsheet saved to localStorage');
    
    const link = createCollaborationLink(spreadsheetId, spreadsheetTitle, userEmail, permission);
    
    // Now load the freshly saved snapshot
    const snapshot = loadSpreadsheet(spreadsheetId);
    console.log('📸 Snapshot loaded:', {
      found: !!snapshot,
      cellCount: snapshot ? Object.keys(snapshot.cellData || {}).length : 0,
      title: snapshot?.title
    });
    
    if (!snapshot) {
      console.error('❌ Failed to load snapshot after saving!');
      toast.error("Failed to create collaboration link. Please try again.");
      return;
    }
    
    attachSnapshotToLink(link.linkId, snapshot);
    console.log('✅ Snapshot attached to link');
    
    const url = getCollaborationLinkUrl(link.linkId);
    console.log('🔗 Generated URL length:', url.length);
    setShareLink(url);
    toast.success("Collaboration link generated!");
  };

  const handleCopyLink = async () => {
    if (!shareLink) {
      handleGenerateLink();
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const activeCount = collaborators.filter((c) => c.isActive).length;

  return (
    <div className="relative" ref={menuRef}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="h-4 px-3 hover:bg-black hover:bg-opacity-10 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        title="Collaboration"
        style={{
          display: "flex",
          visibility: "visible",
          opacity: 1,
          color: "#000000",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Users className="w-2 h-2" />
        <span className="text-[4px]">
          Collaborate
        </span>
        {activeCount > 0 && (
          <Badge
            style={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "#FFFFFF",
              fontSize: "3px",
              padding: "1px 3px",
              height: "auto",
              minHeight: "8px",
            }}
          >
            {activeCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div
          className="fixed rounded-lg shadow-2xl border py-2"
          style={{
            width: "360px",
            top: buttonRect ? `${buttonRect.bottom + 8}px` : "60px",
            right: buttonRect ? `${window.innerWidth - buttonRect.right}px` : "20px",
            zIndex: 999999,
            background: isDarkMode ? "#000000" : "#FFFFFF",
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            border: "3px solid transparent",
            backgroundImage: isDarkMode
              ? "linear-gradient(#000000, #000000), linear-gradient(135deg, #1B1A17 0%, #F0A500 100%)"
              : "linear-gradient(#FFFFFF, #FFFFFF), linear-gradient(135deg, #1B1A17 0%, #F0A500 100%)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            maxHeight: "calc(100vh - 80px)",
            overflowY: "auto",
            visibility: "visible",
            opacity: 1,
            pointerEvents: "auto",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b" style={{ borderColor: isDarkMode ? "#374151" : "#e5e7eb" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users
                  className="w-5 h-5"
                  // yellow accent logic is preserved, but text color is now controlled by CSS only
                />
                <h3
                  className="font-semibold text-sm"
                  // text color is now controlled by CSS only
                >
                  Collaboration
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p
              className="text-xs"
              // text color is now controlled by CSS only
            >
              Share this spreadsheet with others
            </p>
          </div>

          {/* Share Link Section */}
          <div className="px-4 py-3 border-b" style={{ borderColor: isDarkMode ? "#374151" : "#e5e7eb" }}>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-4 h-4" />
              <span
                className="text-xs font-medium"
                // text color is now controlled by CSS only
              >
                Share Link
              </span>
            </div>

            {/* Permission Toggle */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setPermission('viewer')}
                className="text-xs font-medium px-2 py-1 rounded border"
                style={{
                  borderColor: permission === 'viewer' ? '#FFD700' : (isDarkMode ? '#374151' : '#d1d5db'),
                  background: permission === 'viewer'
                    ? 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)'
                    : (isDarkMode ? '#111827' : '#ffffff'),
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                }}
              >
                View only
              </button>
              <button
                onClick={() => setPermission('editor')}
                className="text-xs font-medium px-2 py-1 rounded border"
                style={{
                  borderColor: permission === 'editor' ? '#FFD700' : (isDarkMode ? '#374151' : '#d1d5db'),
                  background: permission === 'editor'
                    ? 'linear-gradient(135deg, #FFFACD 0%, #FFD700 100%)'
                    : (isDarkMode ? '#111827' : '#ffffff'),
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                }}
              >
                View & Edit
              </button>
            </div>
            
            {shareLink ? (
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 p-2 rounded text-xs break-all"
                  style={{
                    background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                    color: isDarkMode ? "#CCCCCC" : "#666666",
                    border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                  }}
                >
                  {shareLink}
                </div>
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  className="w-full text-xs"
                  style={{
                    background: copied
                      ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                      : "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    color: "#FFFFFF",
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleGenerateLink}
                size="sm"
                className="w-full text-xs"
                style={{
                  background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  color: "#FFFFFF",
                }}
              >
                <UserPlus className="w-3 h-3 mr-2" />
                Generate {permission === 'viewer' ? 'View-only' : 'Edit'} Link
              </Button>
            )}
          </div>

          {/* Active Collaborators */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              <span
                className="text-xs font-medium"
                // text color is now controlled by CSS only
              >
                Active Collaborators ({collaborators.length})
              </span>
            </div>

            {collaborators.length === 0 ? (
              <div
                className="text-center py-6 text-xs"
                // text color is now controlled by CSS only
              >
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p>No collaborators yet</p>
                <p className="text-[10px] mt-1">Share the link to start collaborating</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {collaborators.map((collab) => (
                  <div
                    key={collab.email}
                    className="flex items-center justify-between p-2 rounded"
                    style={{
                      background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                      border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        }}
                      >
                        <span className="text-white text-xs font-bold">
                          {collab.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-xs font-medium truncate"
                            // text color is now controlled by CSS only
                          >
                            {collab.name}
                          </p>
                          {collab.isActive && (
                            <Circle
                              className="w-2 h-2 fill-current"
                              // accent logic is preserved, but text color is now controlled by CSS only
                            />
                          )}
                        </div>
                        <p
                          className="text-[10px] truncate"
                          // text color is now controlled by CSS only
                        >
                          {collab.email}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          <span
                            className="text-[10px]"
                            // text color is now controlled by CSS only
                          >
                            {collab.isActive ? "Active" : `Last seen ${formatTime(collab.lastActive)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      style={{
                        background: collab.isActive
                          ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                          : "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
                        color: "#FFFFFF",
                        fontSize: "10px",
                        padding: "2px 6px",
                      }}
                    >
                      {collab.isActive ? "Online" : "Offline"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
