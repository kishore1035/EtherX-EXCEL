import { useState, useEffect } from 'react';
import { X, Users, Eye, Edit, Clock, UserCheck, Share2, Trash2, RefreshCw } from 'lucide-react';
import {
  getOwnerLinks,
  getCollaborationLink,
  getActiveCollaborators,
  getUserCollaborations,
  CollaborationLink,
  ActiveCollaborator,
  CollaborationPermission,
} from '../utils/collaborationSystem';

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  isDarkMode: boolean;
}

interface CollaborationDetails {
  link: CollaborationLink;
  collaborators: ActiveCollaborator[];
  isOwner: boolean;
}

export function CollaborationPanel({
  isOpen,
  onClose,
  userEmail,
  isDarkMode,
}: CollaborationPanelProps) {
  const [collaborations, setCollaborations] = useState<CollaborationDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load collaborations
  const loadCollaborations = () => {
    setLoading(true);
    try {
      const allCollabs: CollaborationDetails[] = [];

      // Get links owned by user
      const ownedLinks = getOwnerLinks(userEmail);
      ownedLinks.forEach((linkId) => {
        const link = getCollaborationLink(linkId);
        if (link) {
          const collaborators = getActiveCollaborators(link.spreadsheetId);
          allCollabs.push({
            link,
            collaborators,
            isOwner: true,
          });
        }
      });

      // Get collaborations user has joined
      const userCollabIds = getUserCollaborations(userEmail);
      userCollabIds.forEach((spreadsheetId) => {
        // Find the link for this spreadsheet
        const allLinks = Object.keys(localStorage)
          .filter((key) => key.startsWith('collaboration_links_'))
          .map((key) => {
            try {
              return JSON.parse(localStorage.getItem(key) || '{}');
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        const link = allLinks.find(
          (l) => l.spreadsheetId === spreadsheetId && l.ownerEmail !== userEmail
        );

        if (link) {
          const collaborators = getActiveCollaborators(link.spreadsheetId);
          // Only add if not already in owned links
          if (!allCollabs.some((c) => c.link.linkId === link.linkId)) {
            allCollabs.push({
              link,
              collaborators,
              isOwner: false,
            });
          }
        }
      });

      // Sort by most recent activity
      allCollabs.sort((a, b) => {
        const aTime = Math.max(
          new Date(a.link.createdAt).getTime(),
          ...a.collaborators.map((c) => new Date(c.lastActive).getTime())
        );
        const bTime = Math.max(
          new Date(b.link.createdAt).getTime(),
          ...b.collaborators.map((c) => new Date(c.lastActive).getTime())
        );
        return bTime - aTime;
      });

      setCollaborations(allCollabs);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCollaborations();
      // Auto-refresh every 30 seconds when panel is open
      const interval = setInterval(loadCollaborations, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userEmail]);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getPermissionIcon = (permission: CollaborationPermission) => {
    return permission === 'viewer' ? (
      <Eye className="w-4 h-4" />
    ) : (
      <Edit className="w-4 h-4" />
    );
  };

  const getPermissionLabel = (permission: CollaborationPermission) => {
    return permission === 'viewer' ? 'View Only' : 'Can Edit';
  };

  const getPermissionColor = (permission: CollaborationPermission) => {
    return permission === 'viewer' ? '#3B82F6' : '#10B981';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: isDarkMode ? '#1a1a1a' : '#FFFFFF',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%) 1',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)'
              : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            borderBottom: '2px solid',
            borderColor: isDarkMode ? '#FFD700' : 'rgba(255, 255, 255, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: isDarkMode ? '#FFD700' : 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2
                className="text-2xl font-bold"
                // yellow accent logic is preserved, but text color is now controlled by CSS only
              >
                Collaboration Center
              </h2>
              <p
                className="text-sm"
                // text color is now controlled by CSS only
              >
                Manage your shared spreadsheets and collaborators
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadCollaborations}
              disabled={loading}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                background: isDarkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                color: isDarkMode ? '#FFD700' : '#FFFFFF',
              }}
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-red-500"
              style={{
                background: isDarkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                color: isDarkMode ? '#FFD700' : '#FFFFFF',
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div
          className="mx-6 mt-4 p-4 rounded-lg"
          style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 165, 0, 0.3)',
          }}
        >
          <p
            className="text-sm"
            // text color is now controlled by CSS only
          >
            <strong>
              Real-time collaboration tracking:
            </strong>{' '}
            View all spreadsheets you've shared or joined. Active collaborators are shown with their
            access level and last activity time. This list auto-refreshes every 30 seconds.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-3 flex gap-4">
          <div
            className="flex-1 p-3 rounded-lg text-center"
            style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <div className="text-2xl font-bold">
              {collaborations.filter((c) => c.isOwner).length}
            </div>
            <div className="text-xs">
              Owned Links
            </div>
          </div>
          <div
            className="flex-1 p-3 rounded-lg text-center"
            style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div className="text-2xl font-bold">
              {collaborations.filter((c) => !c.isOwner).length}
            </div>
            <div className="text-xs">
              Joined Sheets
            </div>
          </div>
          <div
            className="flex-1 p-3 rounded-lg text-center"
            style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
            }}
          >
            <div className="text-2xl font-bold">
              {collaborations.reduce((sum, c) => sum + c.collaborators.filter((col) => col.isActive).length, 0)}
            </div>
            <div className="text-xs">
              Active Now
            </div>
          </div>
        </div>

        {/* Last Refresh Time */}
        <div className="px-6 py-2 flex items-center gap-2 text-xs">
          <Clock className="w-3 h-3" />
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {/* Collaborations List */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          {collaborations.length === 0 ? (
            <div className="text-center py-12">
              <Share2
                className="w-16 h-16 mx-auto mb-4"
                // text color is now controlled by CSS only
              />
              <p className="text-lg font-medium">
                No collaborations yet
              </p>
              <p className="text-sm mt-2">
                Start sharing spreadsheets to see collaborators here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborations.map((collab) => (
                <div
                  key={collab.link.linkId}
                  className="rounded-lg p-4 transition-all duration-200"
                  style={{
                    background: isDarkMode ? '#2a2a2a' : '#F9FAFB',
                    border: '2px solid',
                    borderColor: collab.isOwner
                      ? isDarkMode
                        ? '#FFD700'
                        : '#FFA500'
                      : isDarkMode
                      ? '#3B82F6'
                      : '#60A5FA',
                  }}
                >
                  {/* Spreadsheet Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="font-bold text-lg"
                          // text color is now controlled by CSS only
                        >
                          {collab.link.spreadsheetTitle}
                        </h3>
                        {collab.isOwner && (
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                              color: '#FFFFFF',
                            }}
                          >
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded"
                          style={{
                            background: `${getPermissionColor(collab.link.permission)}20`,
                            color: getPermissionColor(collab.link.permission),
                          }}
                        >
                          {getPermissionIcon(collab.link.permission)}
                          <span className="font-medium">{getPermissionLabel(collab.link.permission)}</span>
                        </div>
                        <span>
                          Created {formatTimeAgo(collab.link.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Collaborators */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="w-4 h-4" />
                      <span
                        className="text-sm font-semibold"
                        // yellow accent logic is preserved, but text color is now controlled by CSS only
                      >
                        Collaborators ({collab.collaborators.length})
                      </span>
                    </div>
                    {collab.collaborators.length === 0 ? (
                      <p className="text-sm italic">
                        No collaborators yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {collab.collaborators.map((collaborator) => (
                          <div
                            key={collaborator.email}
                            className="flex items-center justify-between p-2 rounded"
                            style={{
                              background: isDarkMode
                                ? collaborator.isActive
                                  ? 'rgba(16, 185, 129, 0.1)'
                                  : 'rgba(107, 114, 128, 0.1)'
                                : collaborator.isActive
                                ? 'rgba(16, 185, 129, 0.05)'
                                : 'rgba(243, 244, 246, 1)',
                              border: '1px solid',
                              borderColor: collaborator.isActive
                                ? 'rgba(16, 185, 129, 0.3)'
                                : isDarkMode
                                ? 'rgba(107, 114, 128, 0.2)'
                                : 'rgba(229, 231, 235, 1)',
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{
                                  background: collaborator.isActive
                                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                                  color: '#FFFFFF',
                                }}
                              >
                                {collaborator.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <p
                                  className="text-sm font-medium"
                                  // text color is now controlled by CSS only
                                >
                                  {collaborator.name}
                                </p>
                                <p className="text-xs">
                                  {collaborator.email}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`flex items-center gap-1 text-xs font-semibold ${
                                  collaborator.isActive ? '' : ''
                                }`}
                                style={{
                                  color: collaborator.isActive ? '#10B981' : isDarkMode ? '#999999' : '#666666',
                                }}
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    background: collaborator.isActive ? '#10B981' : '#6B7280',
                                  }}
                                />
                                {collaborator.isActive ? 'Active' : 'Inactive'}
                              </div>
                              <p className="text-xs mt-1">
                                {formatTimeAgo(collaborator.lastActive)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
