// Collaboration System for sharing spreadsheets and tracking active users
import { trackActivity } from './notificationSystem';

export type CollaborationPermission = 'viewer' | 'editor';

export interface CollaborationLink {
  linkId: string;
  spreadsheetId: string;
  spreadsheetTitle: string;
  ownerEmail: string;
  createdAt: string;
  expiresAt?: string;
  permission: CollaborationPermission;
  snapshot?: any;
}

export interface ActiveCollaborator {
  email: string;
  name: string;
  joinedAt: string;
  lastActive: string;
  isActive: boolean;
}

const COLLABORATION_LINKS_KEY = 'collaboration_links_';
const ACTIVE_COLLABORATORS_KEY = 'active_collaborators_';
const COLLABORATION_ACCESS_KEY = 'collaboration_access_';

/**
 * Generate a unique collaboration link ID
 */
export function generateLinkId(): string {
  return `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a shareable collaboration link
 */
export function createCollaborationLink(
  spreadsheetId: string,
  spreadsheetTitle: string,
  ownerEmail: string,
  permission: CollaborationPermission = 'editor'
): CollaborationLink {
  const linkId = generateLinkId();
  const link: CollaborationLink = {
    linkId,
    spreadsheetId,
    spreadsheetTitle,
    ownerEmail,
    createdAt: new Date().toISOString(),
    permission,
  };

  // Save the link
  localStorage.setItem(
    `${COLLABORATION_LINKS_KEY}${linkId}`,
    JSON.stringify(link)
  );

  // Add to owner's links list
  const ownerLinks = getOwnerLinks(ownerEmail);
  ownerLinks.push(linkId);
  localStorage.setItem(`owner_links_${ownerEmail}`, JSON.stringify(ownerLinks));

  return link;
}

/**
 * Get collaboration link by ID
 */
export function getCollaborationLink(linkId: string): CollaborationLink | null {
  const data = localStorage.getItem(`${COLLABORATION_LINKS_KEY}${linkId}`);
  return data ? JSON.parse(data) : null;
}

/**
 * Convenience: get permission for a link id
 */
export function getLinkPermission(linkId: string): CollaborationPermission | null {
  const link = getCollaborationLink(linkId);
  return link ? link.permission : null;
}

/**
 * Attach a snapshot of spreadsheet data to a link (for cross-user loading)
 */
export function attachSnapshotToLink(linkId: string, snapshot: any): void {
  const key = `${COLLABORATION_LINKS_KEY}${linkId}`;
  const data = localStorage.getItem(key);
  if (!data) return;
  try {
    const link: CollaborationLink = JSON.parse(data);
    link.snapshot = snapshot;
    localStorage.setItem(key, JSON.stringify(link));
  } catch {
    // ignore
  }
}

/**
 * Get all links owned by a user
 */
export function getOwnerLinks(ownerEmail: string): string[] {
  const data = localStorage.getItem(`owner_links_${ownerEmail}`);
  return data ? JSON.parse(data) : [];
}

/**
 * Add a collaborator to a spreadsheet
 */
export function addCollaborator(
  linkId: string,
  userEmail: string,
  userName: string
): boolean {
  const link = getCollaborationLink(linkId);
  if (!link) return false;

  const collaborator: ActiveCollaborator = {
    email: userEmail,
    name: userName,
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    isActive: true,
  };

  // Get existing collaborators
  const collaborators = getActiveCollaborators(link.spreadsheetId);
  
  // Check if user already exists
  const existingIndex = collaborators.findIndex(c => c.email === userEmail);
  if (existingIndex >= 0) {
    // Update existing collaborator
    collaborators[existingIndex] = {
      ...collaborators[existingIndex],
      lastActive: new Date().toISOString(),
      isActive: true,
    };
  } else {
    // Add new collaborator
    collaborators.push(collaborator);
  }

  // Save collaborators
  localStorage.setItem(
    `${ACTIVE_COLLABORATORS_KEY}${link.spreadsheetId}`,
    JSON.stringify(collaborators)
  );

  // Track access for the user
  const userAccess = getUserCollaborations(userEmail);
  if (!userAccess.includes(link.spreadsheetId)) {
    userAccess.push(link.spreadsheetId);
    localStorage.setItem(
      `${COLLABORATION_ACCESS_KEY}${userEmail}`,
      JSON.stringify(userAccess)
    );
  }

  // Notify owner
  notifyOwnerOfNewCollaborator(link.ownerEmail, userName, link.spreadsheetTitle);

  return true;
}

/**
 * Get all active collaborators for a spreadsheet
 */
export function getActiveCollaborators(spreadsheetId: string): ActiveCollaborator[] {
  const data = localStorage.getItem(`${ACTIVE_COLLABORATORS_KEY}${spreadsheetId}`);
  if (!data) return [];

  const collaborators: ActiveCollaborator[] = JSON.parse(data);
  
  // Update active status based on last activity (active if within last 5 minutes)
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  return collaborators.map(collab => ({
    ...collab,
    isActive: now - new Date(collab.lastActive).getTime() < fiveMinutes,
  }));
}

/**
 * Update collaborator activity timestamp
 */
export function updateCollaboratorActivity(
  spreadsheetId: string,
  userEmail: string
): void {
  const collaborators = getActiveCollaborators(spreadsheetId);
  const collaborator = collaborators.find(c => c.email === userEmail);
  
  if (collaborator) {
    collaborator.lastActive = new Date().toISOString();
    collaborator.isActive = true;
    
    localStorage.setItem(
      `${ACTIVE_COLLABORATORS_KEY}${spreadsheetId}`,
      JSON.stringify(collaborators)
    );
  }
}

/**
 * Remove a collaborator from a spreadsheet
 */
export function removeCollaborator(
  spreadsheetId: string,
  userEmail: string
): void {
  const collaborators = getActiveCollaborators(spreadsheetId);
  const filtered = collaborators.filter(c => c.email !== userEmail);
  
  localStorage.setItem(
    `${ACTIVE_COLLABORATORS_KEY}${spreadsheetId}`,
    JSON.stringify(filtered)
  );
}

/**
 * Get spreadsheets a user has access to via collaboration
 */
export function getUserCollaborations(userEmail: string): string[] {
  const data = localStorage.getItem(`${COLLABORATION_ACCESS_KEY}${userEmail}`);
  return data ? JSON.parse(data) : [];
}

/**
 * Notify owner of new collaborator
 */
function notifyOwnerOfNewCollaborator(
  ownerEmail: string,
  collaboratorName: string,
  spreadsheetTitle: string
): void {
  trackActivity(
    ownerEmail,
    'collaboration_joined',
    undefined,
    `${collaboratorName} joined "${spreadsheetTitle}"`
  );
}

/**
 * Get collaboration link URL
 */
export function getCollaborationLinkUrl(linkId: string): string {
  const baseUrl = window.location.origin;
  // Encode the full link data in URL for cross-browser sharing
  const link = getCollaborationLink(linkId);
  if (link && link.snapshot) {
    try {
      // Compress and encode snapshot
      const encoded = btoa(JSON.stringify({
        linkId: link.linkId,
        spreadsheetId: link.spreadsheetId,
        spreadsheetTitle: link.spreadsheetTitle,
        permission: link.permission,
        snapshot: link.snapshot
      }));
      return `${baseUrl}?collab=${encoded}`;
    } catch (e) {
      console.error('Failed to encode link:', e);
    }
  }
  return `${baseUrl}?collab=${linkId}`;
}

/**
 * Parse collaboration link from URL
 */
export function parseCollaborationLink(): string | null {
  const params = new URLSearchParams(window.location.search);
  const collabParam = params.get('collab');
  if (!collabParam) return null;
  
  // Try to decode if it's base64-encoded full link data
  try {
    const decoded = JSON.parse(atob(collabParam));
    if (decoded.linkId && decoded.snapshot) {
      // Store the full link data locally so getCollaborationLink can retrieve it
      const link: CollaborationLink = {
        linkId: decoded.linkId,
        spreadsheetId: decoded.spreadsheetId,
        spreadsheetTitle: decoded.spreadsheetTitle,
        ownerEmail: '', // Not needed for recipient
        createdAt: new Date().toISOString(),
        permission: decoded.permission,
        snapshot: decoded.snapshot
      };
      localStorage.setItem(`${COLLABORATION_LINKS_KEY}${decoded.linkId}`, JSON.stringify(link));
      return decoded.linkId;
    }
  } catch (e) {
    // Not encoded, treat as simple linkId
  }
  
  return collabParam;
}

/**
 * Check if user owns the spreadsheet
 */
export function isSpreadsheetOwner(
  spreadsheetId: string,
  userEmail: string
): boolean {
  const ownerLinks = getOwnerLinks(userEmail);
  return ownerLinks.some(linkId => {
    const link = getCollaborationLink(linkId);
    return link?.spreadsheetId === spreadsheetId;
  });
}
