// Notification System for tracking user activities

export interface NotificationData {
  id: string;
  type: 'edit' | 'create' | 'open' | 'share' | 'delete' | 'save' | 'import' | 'export' | 'collaboration_joined';
  title: string;
  message: string;
  timestamp: string;
  sheetId?: string;
  sheetTitle?: string;
  read: boolean;
  icon?: string;
}

const NOTIFICATIONS_KEY = 'notifications_';
const MAX_NOTIFICATIONS = 50;

/**
 * Generate a unique ID for a notification
 */
export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new notification
 */
export function createNotification(
  userEmail: string,
  type: NotificationData['type'],
  title: string,
  message: string,
  sheetId?: string,
  sheetTitle?: string
): NotificationData {
  const notification: NotificationData = {
    id: generateNotificationId(),
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    sheetId,
    sheetTitle,
    read: false,
  };

  // Get existing notifications
  const notifications = getNotifications(userEmail);
  
  // Add new notification at the beginning
  notifications.unshift(notification);
  
  // Keep only the last MAX_NOTIFICATIONS
  const trimmedNotifications = notifications.slice(0, MAX_NOTIFICATIONS);
  
  // Save back to localStorage
  localStorage.setItem(
    `${NOTIFICATIONS_KEY}${userEmail}`,
    JSON.stringify(trimmedNotifications)
  );

  return notification;
}

/**
 * Get all notifications for a user
 */
export function getNotifications(userEmail: string): NotificationData[] {
  const data = localStorage.getItem(`${NOTIFICATIONS_KEY}${userEmail}`);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse notifications:', error);
    return [];
  }
}

/**
 * Get unread notification count
 */
export function getUnreadCount(userEmail: string): number {
  const notifications = getNotifications(userEmail);
  return notifications.filter(n => !n.read).length;
}

/**
 * Mark a notification as read
 */
export function markAsRead(userEmail: string, notificationId: string): void {
  const notifications = getNotifications(userEmail);
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.read = true;
    localStorage.setItem(
      `${NOTIFICATIONS_KEY}${userEmail}`,
      JSON.stringify(notifications)
    );
  }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(userEmail: string): void {
  const notifications = getNotifications(userEmail);
  notifications.forEach(n => n.read = true);
  
  localStorage.setItem(
    `${NOTIFICATIONS_KEY}${userEmail}`,
    JSON.stringify(notifications)
  );
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(userEmail: string): void {
  localStorage.removeItem(`${NOTIFICATIONS_KEY}${userEmail}`);
}

/**
 * Delete a specific notification
 */
export function deleteNotification(userEmail: string, notificationId: string): void {
  const notifications = getNotifications(userEmail);
  const filtered = notifications.filter(n => n.id !== notificationId);
  
  localStorage.setItem(
    `${NOTIFICATIONS_KEY}${userEmail}`,
    JSON.stringify(filtered)
  );
}

/**
 * Track spreadsheet activity
 */
export function trackActivity(
  userEmail: string,
  type: NotificationData['type'],
  sheetId?: string,
  sheetTitle?: string
): void {
  const messages: Record<NotificationData['type'], { title: string; message: (title: string) => string }> = {
    create: {
      title: 'New spreadsheet created',
      message: (title) => `You created "${title}"`
    },
    edit: {
      title: 'Spreadsheet updated',
      message: (title) => `You edited "${title}"`
    },
    open: {
      title: 'Spreadsheet opened',
      message: (title) => `You opened "${title}"`
    },
    save: {
      title: 'Spreadsheet saved',
      message: (title) => `"${title}" has been saved successfully`
    },
    share: {
      title: 'Spreadsheet shared',
      message: (title) => `You shared "${title}"`
    },
    delete: {
      title: 'Spreadsheet deleted',
      message: (title) => `"${title}" has been deleted`
    },
    import: {
      title: 'File imported',
      message: (title) => `You imported "${title}"`
    },
    export: {
      title: 'File exported',
      message: (title) => `You exported "${title}"`
    },
    collaboration_joined: {
      title: 'New Collaborator',
      message: (message) => message // Custom message passed directly
    }
  };

  const config = messages[type];
  const title = sheetTitle || 'Untitled';
  
  createNotification(
    userEmail,
    type,
    config.title,
    config.message(title),
    sheetId,
    sheetTitle
  );
}

/**
 * Format notification time (relative)
 */
export function formatNotificationTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationData['type']): string {
  const icons: Record<NotificationData['type'], string> = {
    create: '📝',
    edit: '✏️',
    open: '📂',
    save: '💾',
    share: '🔗',
    delete: '🗑️',
    import: '📥',
    export: '📤',
    collaboration_joined: '👥'
  };
  
  return icons[type] || '📋';
}
