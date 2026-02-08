import { useState } from "react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface ProfileMenuProps {
  userName: string;
  userEmail: string;
  userPhone?: string;
  isDarkMode: boolean;
  onOpenSettings: () => void;
  onOpenMySheets: () => void;
  onOpenCollaboration: () => void;
  onLogout: () => void;
}

export function ProfileMenu({
  userName,
  userEmail,
  userPhone,
  isDarkMode,
  onOpenSettings,
  onOpenMySheets,
  onOpenCollaboration,
  onLogout,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      iconSrc: "/icons/3d/settings.svg",
      label: "Settings",
      onClick: () => {
        onOpenSettings();
        setOpen(false);
      },
    },
    {
      iconSrc: "/icons/3d/file-spreadsheet.svg",
      label: "My Sheets",
      onClick: () => {
        onOpenMySheets();
        setOpen(false);
      },
    },
    {
      iconSrc: "/icons/3d/user.svg",
      label: "Collaboration",
      onClick: () => {
        onOpenCollaboration();
        setOpen(false);
      },
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-12 rounded-full p-0 transition-all duration-300"
          style={{
            border: isDarkMode ? "2px solid #4b5563" : "2px solid #FFD700",
          }}
        >
          <div
            className="h-full w-full rounded-full flex items-center justify-center"
            style={{
              background: isDarkMode
                ? "linear-gradient(135deg, #374151 0%, #1f2937 100%)"
                : "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            }}
          >
            <span
              style={{
                color: isDarkMode ? "#fbbf24" : "#FFFFFF",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {getInitials(userName)}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="fixed top-16 right-4 z-50 w-[360px] max-w-full p-0 shadow-2xl"
        style={{
          background: '#000000',
          border: "3px solid transparent",
          backgroundImage: "linear-gradient(#000000, #000000), linear-gradient(135deg, #1B1A17 0%, #F0A500 100%)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
        side="bottom"
        align="end"
        alignOffset={-10}
        sideOffset={8}
      >
        {/* Header */}
        <div
          className="p-4"
          style={{
            background: '#000000',
            borderBottom: "2px solid",
            borderImage: "linear-gradient(90deg, #1B1A17 0%, #F0A500 100%) 1",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              }}
            >
              <img src="/icons/3d/user.svg" alt="Profile" style={{ width: "20px", height: "20px" }} />
            </div>
            <h3
              className="font-bold text-lg"
              style={{
                color: '#FFFFFF',
                textShadow: "0 2px 4px rgba(255, 215, 0, 0.3)",
              }}
            >
              Profile
            </h3>
          </div>
        </div>

        {/* Profile Info Section */}
        <div
          className="p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)',
            borderBottom: "1px solid rgba(255, 215, 0, 0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center shadow-md"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                boxShadow: "0 4px 8px rgba(255, 215, 0, 0.3)",
              }}
            >
              <span
                style={{
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                {getInitials(userName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-sm truncate"
                style={{ color: '#FFFFFF' }}
              >
                {userName}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: '#CCCCCC' }}
              >
                {userEmail}
              </p>
              {userPhone && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: '#999999' }}
                >
                  {userPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div
          style={{
            background: '#000000',
          }}
        >
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="p-4 cursor-pointer relative transition-all duration-200"
              style={{
                background: '#000000',
                borderBottom: index < menuItems.length - 1 ? "1px solid rgba(255, 215, 0, 0.2)" : "none",
              }}
              onClick={item.onClick}
              onMouseEnter={(e) => {
                setHoveredIndex(index);
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 215, 0, 0.25) 100%)';
                e.currentTarget.style.borderLeft = '3px solid #FFD700';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                setHoveredIndex(null);
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.borderLeft = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-lg shadow-md flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    boxShadow: "0 4px 8px rgba(255, 215, 0, 0.3)",
                  }}
                >
                  <img src={item.iconSrc} alt={item.label} style={{ width: "20px", height: "20px" }} />
                </div>
                <span
                  className="font-semibold text-sm flex-1"
                  style={{ color: '#FFFFFF' }}
                >
                  {item.label}
                </span>
                <img
                  src="/icons/3d/sparkles.svg"
                  alt="Go"
                  style={{
                    width: "16px",
                    height: "16px",
                    transform: "rotate(-90deg)",
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div
          className="p-3"
          style={{
            background: '#000000',
            borderTop: "2px solid",
            borderImage: "linear-gradient(90deg, #1B1A17 0%, #F0A500 100%) 1",
          }}
        >
          <button
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <img src="/icons/3d/x.svg" alt="Logout" style={{ width: "16px", height: "16px", filter: "brightness(2)" }} />
            Log Out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
