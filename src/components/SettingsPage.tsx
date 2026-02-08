import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import config from "../config";
import { Icon3D } from "./ui/Icon3D";
import {
  ArrowLeft,
  User,
  Shield,
  Lock,
  UserCog,
  Save,
  Mail,
  Phone,
  Palette,
  Eye,
  EyeOff,
  Users,
  Share2,
  Activity,
  Key,
  Trash2,
  UserX,
  Sun,
  Moon,
  Monitor,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserSettings,
  saveUserSettings,
  getCollaborationCount,
  changePassword,
  deactivateAccount,
  deleteAccount,
  toggleTwoFactor,
  type UserSettings,
} from "../utils/settingsStorage";

interface SettingsPageProps {
  userName: string;
  userEmail: string;
  userPhone?: string;
  isDarkMode: boolean;
  onBack: () => void;
  onSaveProfile: (name: string, email: string, phone: string) => void;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  onLogout?: () => void;
}

type SettingsTab = "profile" | "privacy" | "security" | "account";

export function SettingsPage({
  userName,
  userEmail,
  userPhone,
  isDarkMode,
  onBack,
  onSaveProfile,
  onThemeChange,
  onLogout,
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [editPhone, setEditPhone] = useState(userPhone || "");
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings>(getUserSettings(userEmail));
  const [collaborationCount, setCollaborationCount] = useState(0);
  
  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setSettings(getUserSettings(userEmail));
    setCollaborationCount(getCollaborationCount(userEmail));
  }, [userEmail]);

  const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "account", label: "Account", icon: UserCog },
  ];

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveUserSettings(userEmail, newSettings);
  };

  const handlePasswordChange = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (changePassword(userEmail, oldPassword, newPassword)) {
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("Current password is incorrect");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.")) {
      if (confirm("This is your final warning. Delete account permanently?")) {
        try {
          // Get token from localStorage (support multiple key names used across the app)
          const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken') || localStorage.getItem('auth-token');
          if (!token) {
            toast.error('You are not authenticated with the backend. Please sign in.');
            return;
          }
          
          // Call backend API
          const response = await fetch(`${config.api.baseUrl}/api/auth/delete`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            // Clear local storage (remove possible token keys)
            deleteAccount(userEmail);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');
            
            toast.success("Account deleted successfully");
            setTimeout(() => onLogout?.(), 1500);
          } else {
            toast.error("Failed to delete account");
          }
        } catch (error) {
          console.error('Delete account error:', error);
          toast.error("Failed to delete account");
        }
      }
    }
  };

  const handleDeactivateAccount = async () => {
    if (confirm("Are you sure you want to deactivate your account? You can reactivate it later by logging in.")) {
      try {
        // Get token from localStorage (support multiple key names used across the app)
        const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken') || localStorage.getItem('auth-token');
        if (!token) {
          toast.error('You are not authenticated with the backend. Please sign in.');
          return;
        }
        
        // Call backend API
        const response = await fetch(`${config.api.baseUrl}/api/auth/deactivate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Update local storage and remove token keys
          deactivateAccount(userEmail);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('auth-token');
          
          toast.success("Account deactivated");
          setTimeout(() => onLogout?.(), 1500);
        } else {
          toast.error("Failed to deactivate account");
        }
      } catch (error) {
        console.error('Deactivate account error:', error);
        toast.error("Failed to deactivate account");
      }
    }
  };

  const handleSave = () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!editEmail.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    // Save to localStorage
    localStorage.setItem(`user_name_${userEmail}`, editName);
    if (editEmail !== userEmail) {
      // Handle email change - migrate data
      const oldPassword = localStorage.getItem(`user_password_${userEmail}`);
      const oldPhone = localStorage.getItem(`user_phone_${userEmail}`);
      
      if (oldPassword) localStorage.setItem(`user_password_${editEmail}`, oldPassword);
      if (editPhone) localStorage.setItem(`user_phone_${editEmail}`, editPhone);
      localStorage.setItem(`user_name_${editEmail}`, editName);
      
      // Remove old entries
      localStorage.removeItem(`user_password_${userEmail}`);
      localStorage.removeItem(`user_phone_${userEmail}`);
      localStorage.removeItem(`user_name_${userEmail}`);
    } else {
      if (editPhone) localStorage.setItem(`user_phone_${userEmail}`, editPhone);
    }

    onSaveProfile(editName, editEmail, editPhone);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    setEditName(userName);
    setEditEmail(userEmail);
    setEditPhone(userPhone || "");
    setIsEditing(false);
  };

  return (
    <div
      className="min-h-screen settings-page-container"
      style={{
        background: isDarkMode ? "#000000" : "#FFFFFF",
      }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          background: isDarkMode ? "#000000" : "#FFFFFF",
          borderBottom: '2px solid',
          borderImage: 'linear-gradient(90deg, #1B1A17 0%, #F0A500 100%) 1',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full h-12 w-12"
              style={{
                background: isDarkMode
                  ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
                  : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                border: isDarkMode ? "2px solid #4b5563" : "2px solid #FFD700",
                boxShadow: '0 4px 8px rgba(255, 215, 0, 0.3)',
              }}
            >
              <ArrowLeft
                size={24}
                style={{
                  color: isDarkMode ? "#fbbf24" : "#FFFFFF",
                }}
              />
            </Button>
            <div className="flex items-center gap-3">
              <div 
                className="rounded-xl"
                style={{
                  background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                  padding: '10px',
                  boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                }}
              >
                <Icon3D 
                  icon={Settings}
                  size="lg"
                  variant="warning"
                  glowIntensity="strong"
                />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{
                    color: isDarkMode ? "#FFFFFF" : "#000000",
                    textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  Settings
                </h1>
                <p
                  className="text-sm"
                  style={{
                    color: isDarkMode ? "#CCCCCC" : "#666666",
                  }}
                >
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div
              className="rounded-lg p-3"
              style={{
                background: isDarkMode ? "#000000" : "#FFFFFF",
                border: '3px solid transparent',
                backgroundImage: isDarkMode 
                  ? 'linear-gradient(#000000, #000000), linear-gradient(135deg, #1B1A17 0%, #F0A500 100%)'
                  : 'linear-gradient(#FFFFFF, #FFFFFF), linear-gradient(135deg, #1B1A17 0%, #F0A500 100%)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)',
              }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 mb-2 transition-all duration-200 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      border: isActive ? '2px solid #FFD700' : '2px solid transparent',
                      color: '#000000',
                      boxShadow: isActive ? '0 4px 8px rgba(255, 215, 0, 0.4)' : '0 2px 4px rgba(255, 215, 0, 0.2)',
                      fontWeight: isActive ? 600 : 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)';
                        e.currentTarget.style.borderColor = '#FFD700';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 215, 0, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 215, 0, 0.2)';
                      }
                    }}
                  >
                    <div 
                      className="rounded-xl"
                      style={{
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                        padding: '8px',
                        boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -1px -1px 3px rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Icon3D 
                        icon={IconComponent}
                        size="md"
                        variant="warning"
                        glowIntensity="medium"
                      />
                    </div>
                    <span 
                      className="font-medium"
                      style={{
                        color: '#000000',
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-9">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-lg p-6"
              style={{
                background: isDarkMode ? "#000000" : "#FFFFFF",
                border: '3px solid transparent',
                backgroundImage: isDarkMode 
                  ? 'linear-gradient(#000000, #000000), linear-gradient(135deg, #1B1A17 0%, #F0A500 100%)'
                  : 'linear-gradient(#FFFFFF, #FFFFFF), linear-gradient(135deg, #1B1A17 0%, #F0A500 100%)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)',
              }}
            >
              {activeTab === "profile" && (
                <div>
                  <div 
                    className="flex items-center justify-between mb-6 pb-4"
                    style={{
                      borderBottom: '2px solid',
                      borderImage: 'linear-gradient(90deg, #1B1A17 0%, #F0A500 100%) 1',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="rounded-xl"
                        style={{
                          background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                          padding: '8px',
                          boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        <Icon3D 
                          icon={User}
                          size="md"
                          variant="warning"
                          glowIntensity="strong"
                        />
                      </div>
                      <div>
                        <h2
                          className="text-xl font-bold"
                          style={{
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
                          }}
                        >
                          Profile Settings
                        </h2>
                        <p
                          className="text-sm mt-1"
                          style={{
                            color: isDarkMode ? "#CCCCCC" : "#666666",
                          }}
                        >
                          Update your personal information
                        </p>
                      </div>
                    </div>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="font-semibold"
                        style={{
                          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                          color: "#000000",
                          border: "2px solid #FFD700",
                          boxShadow: "0 4px 8px rgba(255, 215, 0, 0.3)",
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <Label
                        htmlFor="name"
                        style={{
                          color: isDarkMode ? "#FFFFFF" : "#000000",
                        }}
                      >
                        Full Name
                      </Label>
                      <div className="relative mt-2">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{
                            color: isDarkMode ? "#999999" : "#666666",
                          }}
                        />
                        <Input
                          id="name"
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                          style={{
                            background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                          }}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label
                        htmlFor="email"
                        style={{
                          color: isDarkMode ? "#FFFFFF" : "#000000",
                        }}
                      >
                        Email Address
                      </Label>
                      <div className="relative mt-2">
                        <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{
                            color: isDarkMode ? "#999999" : "#666666",
                          }}
                        />
                        <Input
                          id="email"
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                          style={{
                            background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                          }}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <Label
                        htmlFor="phone"
                        style={{
                          color: isDarkMode ? "#FFFFFF" : "#000000",
                        }}
                      >
                        Phone Number
                      </Label>
                      <div className="relative mt-2">
                        <Phone
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{
                            color: isDarkMode ? "#999999" : "#666666",
                          }}
                        />
                        <Input
                          id="phone"
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter phone number"
                          className="pl-10"
                          style={{
                            background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                          }}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSave}
                          className="flex items-center gap-2"
                          style={{
                            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                            color: "#FFFFFF",
                          }}
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          style={{
                            borderColor: isDarkMode ? "#374151" : "#d1d5db",
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div>
                  <div 
                    className="mb-6 pb-4"
                    style={{
                      borderBottom: '2px solid',
                      borderImage: 'linear-gradient(90deg, #1B1A17 0%, #F0A500 100%) 1',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="rounded-xl"
                        style={{
                          background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                          padding: '8px',
                          boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        <Icon3D 
                          icon={Shield}
                          size="md"
                          variant="warning"
                          glowIntensity="strong"
                        />
                      </div>
                      <div>
                        <h2
                          className="text-xl font-bold"
                          style={{
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
                          }}
                        >
                          Privacy Settings
                        </h2>
                        <p
                          className="text-sm mt-1"
                          style={{
                            color: isDarkMode ? "#CCCCCC" : "#666666",
                          }}
                        >
                          Control your data and privacy preferences
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Visibility */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg transition-all duration-200"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 2px 6px rgba(255, 215, 0, 0.1)',
                        border: '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#FFD700';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(255, 215, 0, 0.1)';
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="rounded-xl"
                          style={{
                            background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                            padding: '6px',
                            boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.3), -1px -1px 4px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          <Icon3D 
                            icon={Shield}
                            size="md"
                            variant="warning"
                            glowIntensity="medium"
                          />
                        </div>
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Profile Visibility
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            {settings.profileVisibility === "public"
                              ? "Your profile is visible to everyone"
                              : "Your profile is only visible to you"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.profileVisibility === "public"}
                        onCheckedChange={(checked) => {
                          updateSettings({ profileVisibility: checked ? "public" : "private" });
                          toast.success(
                            `Profile is now ${checked ? "public" : "private"}`
                          );
                        }}
                      />
                    </div>

                    {/* Collaboration Count */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg transition-all duration-200"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 2px 6px rgba(255, 215, 0, 0.1)',
                        border: '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#FFD700';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(255, 215, 0, 0.1)';
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="rounded-xl"
                          style={{
                            background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                            padding: '6px',
                            boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.3), -1px -1px 4px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          <Icon3D 
                            icon={Users}
                            size="md"
                            variant="warning"
                            glowIntensity="medium"
                          />
                        </div>
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Active Collaborations
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Number of shared spreadsheets you're collaborating on
                          </p>
                        </div>
                      </div>
                      <Badge
                        style={{
                          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                          color: "#FFFFFF",
                          fontSize: "14px",
                          padding: "6px 12px",
                        }}
                      >
                        {collaborationCount}
                      </Badge>
                    </div>

                    {/* Allow Collaborations */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg transition-all duration-200"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 2px 6px rgba(255, 215, 0, 0.1)',
                        border: '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#FFD700';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(255, 215, 0, 0.1)';
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="rounded-xl"
                          style={{
                            background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                            padding: '6px',
                            boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.3), -1px -1px 4px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          <Icon3D 
                            icon={Users}
                            size="md"
                            variant="warning"
                            glowIntensity="medium"
                          />
                        </div>
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Allow Collaborations
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Let others invite you to collaborate on spreadsheets
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.allowCollaborations}
                        onCheckedChange={(checked) => {
                          updateSettings({ allowCollaborations: checked });
                          toast.success(
                            `Collaborations ${checked ? "enabled" : "disabled"}`
                          );
                        }}
                      />
                    </div>

                    {/* Allow Sharing */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <Share2
                          className="w-5 h-5 mt-1"
                          style={{
                            color: "#FFD700",
                          }}
                        />
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Allow Sharing
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Let others share your spreadsheets with third parties
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.allowSharing}
                        onCheckedChange={(checked) => {
                          updateSettings({ allowSharing: checked });
                          toast.success(`Sharing ${checked ? "enabled" : "disabled"}`);
                        }}
                      />
                    </div>

                    {/* Show Activity Status */}
                    <div
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 0 20px rgba(255, 207, 64, 0.08), inset 0 0 30px rgba(255, 207, 64, 0.05)',
                        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <Activity
                          className="w-5 h-5 mt-1"
                          style={{
                            color: "#FFD700",
                          }}
                        />
                        <div>
                          <Label
                            style={{
                              color: isDarkMode ? "#FFFFFF" : "#000000",
                              fontWeight: 600,
                            }}
                          >
                            Show Activity Status
                          </Label>
                          <p
                            className="text-sm mt-1"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Display your online/offline status to collaborators
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.showActivityStatus}
                        onCheckedChange={(checked) => {
                          updateSettings({ showActivityStatus: checked });
                          toast.success(
                            `Activity status ${checked ? "visible" : "hidden"}`
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div>
                  <div 
                    className="mb-6 pb-4"
                    style={{
                      borderBottom: '2px solid',
                      borderImage: 'linear-gradient(90deg, #1B1A17 0%, #F0A500 100%) 1',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="rounded-xl"
                        style={{
                          background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                          padding: '8px',
                          boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        <Icon3D 
                          icon={Lock}
                          size="md"
                          variant="warning"
                          glowIntensity="strong"
                        />
                      </div>
                      <div>
                        <h2
                          className="text-xl font-bold"
                          style={{
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
                          }}
                        >
                          Security Settings
                        </h2>
                        <p
                          className="text-sm mt-1"
                          style={{
                            color: isDarkMode ? "#CCCCCC" : "#666666",
                          }}
                        >
                          Manage your password and security options
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Password Change Section */}
                    <div
                      className="p-6 rounded-lg transition-all duration-200"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 2px 6px rgba(255, 215, 0, 0.1)',
                        border: '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#FFD700';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(255, 215, 0, 0.1)';
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="rounded-xl"
                          style={{
                            background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                            padding: '6px',
                            boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.3), -1px -1px 4px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          <Icon3D 
                            icon={Key}
                            size="md"
                            variant="warning"
                            glowIntensity="medium"
                          />
                        </div>
                        <Label
                          style={{
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            fontWeight: 600,
                            fontSize: "16px",
                          }}
                        >
                          Change Password
                        </Label>
                      </div>

                      <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                          <Label
                            htmlFor="old-password"
                            style={{
                              color: isDarkMode ? "#CCCCCC" : "#666666",
                            }}
                          >
                            Current Password
                          </Label>
                          <div className="relative mt-2">
                            <Lock
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                              style={{
                                color: isDarkMode ? "#999999" : "#666666",
                              }}
                            />
                            <Input
                              id="old-password"
                              type="password"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              placeholder="Enter current password"
                              className="pl-10 pr-10"
                              style={{
                                background: isDarkMode ? "#0a0a0a" : "#FFFFFF",
                                color: isDarkMode ? "#FFFFFF" : "#000000",
                                border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                              }}
                            />
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <Label
                            htmlFor="new-password"
                            style={{
                              color: isDarkMode ? "#CCCCCC" : "#666666",
                            }}
                          >
                            New Password
                          </Label>
                          <div className="relative mt-2">
                            <Lock
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                              style={{
                                color: isDarkMode ? "#999999" : "#666666",
                              }}
                            />
                            <Input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password (min 6 characters)"
                              className="pl-10 pr-10"
                              style={{
                                background: isDarkMode ? "#0a0a0a" : "#FFFFFF",
                                color: isDarkMode ? "#FFFFFF" : "#000000",
                                border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                              }}
                            />
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <Label
                            htmlFor="confirm-password"
                            style={{
                              color: isDarkMode ? "#CCCCCC" : "#666666",
                            }}
                          >
                            Confirm New Password
                          </Label>
                          <div className="relative mt-2">
                            <Lock
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                              style={{
                                color: isDarkMode ? "#999999" : "#666666",
                              }}
                            />
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password"
                              className="pl-10 pr-10"
                              style={{
                                background: isDarkMode ? "#0a0a0a" : "#FFFFFF",
                                color: isDarkMode ? "#FFFFFF" : "#000000",
                                border: isDarkMode ? "1px solid #374151" : "1px solid #d1d5db",
                              }}
                            />
                          </div>
                        </div>

                        <Button
                          onClick={handlePasswordChange}
                          className="w-full mt-4"
                          style={{
                            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                            color: "#FFFFFF",
                          }}
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Change Password
                        </Button>

                        {settings.lastPasswordChange && (
                          <p
                            className="text-xs text-center mt-2"
                            style={{
                              color: isDarkMode ? "#999999" : "#666666",
                            }}
                          >
                            Last changed: {new Date(settings.lastPasswordChange).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div>
                  <div 
                    className="mb-6 pb-4"
                    style={{
                      borderBottom: '2px solid',
                      borderImage: 'linear-gradient(90deg, #1B1A17 0%, #F0A500 100%) 1',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="rounded-xl"
                        style={{
                          background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                          padding: '8px',
                          boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        <Icon3D 
                          icon={UserCog}
                          size="md"
                          variant="warning"
                          glowIntensity="strong"
                        />
                      </div>
                      <div>
                        <h2
                          className="text-xl font-bold"
                          style={{
                            color: isDarkMode ? "#FFFFFF" : "#000000",
                            textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
                          }}
                        >
                          Account Settings
                        </h2>
                        <p
                          className="text-sm mt-1"
                          style={{
                            color: isDarkMode ? "#CCCCCC" : "#666666",
                          }}
                        >
                          Manage your account preferences and status
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Account Status */}
                    <div
                      className="p-4 rounded-lg transition-all duration-200"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 2px 6px rgba(255, 215, 0, 0.1)',
                        border: '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#FFD700';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(255, 215, 0, 0.1)';
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="rounded-xl"
                            style={{
                              background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                              padding: '6px',
                              boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.3), -1px -1px 4px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                            }}
                          >
                            <Icon3D 
                              icon={UserCog}
                              size="md"
                              variant="warning"
                              glowIntensity="medium"
                            />
                          </div>
                          <div>
                            <Label
                              style={{
                                color: isDarkMode ? "#FFFFFF" : "#000000",
                                fontWeight: 600,
                              }}
                            >
                              Account Status
                            </Label>
                            <p
                              className="text-sm mt-1"
                              style={{
                                color: isDarkMode ? "#999999" : "#666666",
                              }}
                            >
                              Your account is currently{" "}
                              {settings.accountStatus === "active" ? "active" : "deactivated"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          style={{
                            background:
                              settings.accountStatus === "active"
                                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                                : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                            color: "#FFFFFF",
                          }}
                        >
                          {settings.accountStatus === "active" ? "Active" : "Deactivated"}
                        </Badge>
                      </div>
                    </div>

                    {/* Profile Visibility Status */}
                    {/* Profile Visibility (duplicate in Account) */}
                    <div
                      className="p-4 rounded-lg transition-all duration-200"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#f9fafb",
                        boxShadow: '0 2px 6px rgba(255, 215, 0, 0.1)',
                        border: '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#FFD700';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(255, 215, 0, 0.1)';
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="rounded-xl"
                            style={{
                              background: 'linear-gradient(145deg, #FFD700, #FFA500)',
                              padding: '6px',
                              boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.3), -1px -1px 4px rgba(255, 215, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
                            }}
                          >
                            <Icon3D 
                              icon={Shield}
                              size="md"
                              variant="warning"
                              glowIntensity="medium"
                            />
                          </div>
                          <div>
                            <Label
                              style={{
                                color: isDarkMode ? "#FFFFFF" : "#000000",
                                fontWeight: 600,
                              }}
                            >
                              Profile Visibility
                            </Label>
                            <p
                              className="text-sm mt-1"
                              style={{
                                color: isDarkMode ? "#999999" : "#666666",
                              }}
                            >
                              Your profile is{" "}
                              {settings.profileVisibility === "public" ? "public" : "private"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          style={{
                            background:
                              settings.profileVisibility === "public"
                                ? "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                                : "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
                            color: "#FFFFFF",
                          }}
                        >
                          {settings.profileVisibility === "public" ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div
                      className="p-6 rounded-lg transition-all duration-200"
                      style={{
                        background: isDarkMode ? "#1a1a1a" : "#FEF2F2",
                        border: '2px solid #EF4444',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="rounded-xl"
                          style={{
                            background: 'linear-gradient(145deg, #EF4444, #DC2626)',
                            padding: '6px',
                            boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.3), -1px -1px 4px rgba(239, 68, 68, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          <Icon3D 
                            icon={Trash2}
                            size="md"
                            variant="danger"
                            glowIntensity="strong"
                          />
                        </div>
                        <Label
                          style={{
                            color: "#EF4444",
                            fontWeight: 600,
                            fontSize: "16px",
                          }}
                        >
                          Danger Zone
                        </Label>
                      </div>

                      <div className="space-y-4">
                        {/* Deactivate Account */}
                        <div
                          className="p-4 rounded-lg transition-all duration-200"
                          style={{
                            background: isDarkMode ? "#0a0a0a" : "#FFFFFF",
                            border: '2px solid transparent',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#EF4444';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.1)';
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div
                                className="font-semibold mb-1"
                                style={{
                                  color: isDarkMode ? "#FFFFFF" : "#000000",
                                }}
                              >
                                Deactivate Account
                              </div>
                              <p
                                className="text-sm"
                                style={{
                                  color: isDarkMode ? "#999999" : "#666666",
                                }}
                              >
                                Temporarily disable your account. You can reactivate it anytime by
                                logging in again.
                              </p>
                            </div>
                            <Button
                              onClick={handleDeactivateAccount}
                              variant="outline"
                              style={{
                                borderColor: "#000000",
                                color: "#000000",
                                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)";
                                e.currentTarget.style.color = "#000000";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)";
                                e.currentTarget.style.color = "#000000";
                              }}
                            >
                              <UserX size={16} style={{ marginRight: '8px' }} />
                              Deactivate
                            </Button>
                          </div>
                        </div>

                        {/* Delete Account */}
                        <div
                          className="p-4 rounded-lg transition-all duration-200"
                          style={{
                            background: isDarkMode ? "#0a0a0a" : "#FFFFFF",
                            border: '2px solid transparent',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#EF4444';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.1)';
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div
                                className="font-semibold mb-1"
                                style={{
                                  color: isDarkMode ? "#FFFFFF" : "#000000",
                                }}
                              >
                                Delete Account
                              </div>
                              <p
                                className="text-sm"
                                style={{
                                  color: isDarkMode ? "#999999" : "#666666",
                                }}
                              >
                                Permanently delete your account and all associated data. This
                                action cannot be undone.
                              </p>
                            </div>
                            <Button
                              onClick={handleDeleteAccount}
                              variant="outline"
                              style={{
                                borderColor: "#000000",
                                color: "#000000",
                                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)";
                                e.currentTarget.style.color = "#000000";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)";
                                e.currentTarget.style.color = "#000000";
                              }}
                            >
                              <Trash2 size={16} style={{ marginRight: '8px' }} />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
