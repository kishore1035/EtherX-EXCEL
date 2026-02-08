// Settings Storage Utility for User Preferences

export interface UserSettings {
  // Privacy Settings
  profileVisibility: 'public' | 'private';
  allowCollaborations: boolean;
  allowSharing: boolean;
  showActivityStatus: boolean;
  
  // Security Settings
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
  
  // Account Settings
  accountStatus: 'active' | 'deactivated';
  
  // Theme Settings
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: UserSettings = {
  profileVisibility: 'private',
  allowCollaborations: true,
  allowSharing: true,
  showActivityStatus: true,
  twoFactorEnabled: false,
  accountStatus: 'active',
  theme: 'system',
};

// Get user settings from localStorage
export function getUserSettings(userEmail: string): UserSettings {
  const stored = localStorage.getItem(`user_settings_${userEmail}`);
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error parsing user settings:', error);
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

// Save user settings to localStorage
export function saveUserSettings(userEmail: string, settings: Partial<UserSettings>): void {
  const currentSettings = getUserSettings(userEmail);
  const updatedSettings = { ...currentSettings, ...settings };
  localStorage.setItem(`user_settings_${userEmail}`, JSON.stringify(updatedSettings));
}

// Update specific setting
export function updateSetting<K extends keyof UserSettings>(
  userEmail: string,
  key: K,
  value: UserSettings[K]
): void {
  const settings = getUserSettings(userEmail);
  settings[key] = value;
  localStorage.setItem(`user_settings_${userEmail}`, JSON.stringify(settings));
}

// Get collaboration count
export function getCollaborationCount(userEmail: string): number {
  const collaborations = localStorage.getItem(`user_collaborations_${userEmail}`);
  if (collaborations) {
    try {
      return JSON.parse(collaborations).length;
    } catch {
      return 0;
    }
  }
  return 0;
}

// Change password
export function changePassword(userEmail: string, oldPassword: string, newPassword: string): boolean {
  const storedPassword = localStorage.getItem(`user_password_${userEmail}`);
  if (storedPassword === oldPassword) {
    localStorage.setItem(`user_password_${userEmail}`, newPassword);
    updateSetting(userEmail, 'lastPasswordChange', new Date().toISOString());
    return true;
  }
  return false;
}

// Deactivate account
export function deactivateAccount(userEmail: string): void {
  updateSetting(userEmail, 'accountStatus', 'deactivated');
  localStorage.setItem(`user_deactivated_${userEmail}`, new Date().toISOString());
}

// Reactivate account
export function reactivateAccount(userEmail: string): void {
  updateSetting(userEmail, 'accountStatus', 'active');
  localStorage.removeItem(`user_deactivated_${userEmail}`);
}

// Delete account (remove all user data)
export function deleteAccount(userEmail: string): void {
  const keysToRemove = [
    `user_settings_${userEmail}`,
    `user_password_${userEmail}`,
    `user_name_${userEmail}`,
    `user_phone_${userEmail}`,
    `user_collaborations_${userEmail}`,
    `user_deactivated_${userEmail}`,
    `notifications_${userEmail}`,
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Remove all spreadsheets for this user
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('spreadsheet_') || key.startsWith('recent_sheets_')) {
      const data = localStorage.getItem(key);
      if (data && data.includes(userEmail)) {
        localStorage.removeItem(key);
      }
    }
  });
}

// Enable/Disable 2FA
export function toggleTwoFactor(userEmail: string, enabled: boolean): void {
  updateSetting(userEmail, 'twoFactorEnabled', enabled);
  if (enabled) {
    // Generate 2FA secret (in real app, this would be more secure)
    const secret = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(`user_2fa_secret_${userEmail}`, secret);
  } else {
    localStorage.removeItem(`user_2fa_secret_${userEmail}`);
  }
}
