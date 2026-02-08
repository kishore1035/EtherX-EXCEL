import { useState, useEffect, useRef, MouseEvent } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Icon3D, IconBadge3D, IconButton3D } from "./ui/Icon3D";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  formatNotificationTime,
  type NotificationData,
} from "../utils/notificationSystem";

interface NotificationCenterProps {
  userEmail: string;
  isDarkMode: boolean;
}

export function NotificationCenter({
  userEmail,
  isDarkMode,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconContainerRef = useRef<HTMLDivElement>(null);
  const iconImgRef = useRef<HTMLImageElement>(null);

  // Load notifications on mount and when popup opens
  useEffect(() => {
    loadNotifications();
  }, [userEmail, open]);

  // Set button color with !important
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.style.setProperty('color', isDarkMode ? '#FFFFFF' : '#FFD700', 'important');
    }
  }, [isDarkMode]);

  // Force icon container and image styles
  useEffect(() => {
    if (iconContainerRef.current) {
      iconContainerRef.current.style.setProperty('background', 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', 'important');
      iconContainerRef.current.style.setProperty('padding', '0.5rem', 'important');
      iconContainerRef.current.style.setProperty('border-radius', '0.5rem', 'important');
      iconContainerRef.current.style.setProperty('box-shadow', '0 4px 8px rgba(255, 215, 0, 0.3)', 'important');
    }
    if (iconImgRef.current) {
      iconImgRef.current.style.setProperty('width', '20px', 'important');
      iconImgRef.current.style.setProperty('height', '20px', 'important');
      iconImgRef.current.style.setProperty('display', 'block', 'important');
    }
  }, [open]);

  const loadNotifications = () => {
    const notifs = getNotifications(userEmail);
    setNotifications(notifs);
    setUnreadCount(getUnreadCount(userEmail));
  };

  const getNotificationIcon = (type: NotificationData['type']) => {
    const iconStyle = { width: '20px', height: '20px' };
    switch (type) {
      case "create":
        return <img src="/icons/3d/plus.svg" alt="Create" style={iconStyle} />;
      case "edit":
        return <img src="/icons/3d/file-spreadsheet.svg" alt="Edit" style={iconStyle} />;
      case "open":
        return <img src="/icons/3d/file-spreadsheet.svg" alt="Open" style={iconStyle} />;
      case "save":
        return <img src="/icons/3d/download.svg" alt="Save" style={iconStyle} />;
      case "share":
        return <img src="/icons/3d/upload.svg" alt="Share" style={iconStyle} />;
      case "delete":
        return <img src="/icons/3d/trash.svg" alt="Delete" style={iconStyle} />;
      case "import":
        return <img src="/icons/3d/upload.svg" alt="Import" style={iconStyle} />;
      case "export":
        return <img src="/icons/3d/download.svg" alt="Export" style={iconStyle} />;
      default:
        return <img src="/icons/3d/bell.svg" alt="Notification" style={iconStyle} />;
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.read) {
      markAsRead(userEmail, notification.id);
      loadNotifications();
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(userEmail);
    loadNotifications();
  };

  const handleDeleteNotification = (notificationId: string, e: MouseEvent) => {
    e.stopPropagation();
    deleteNotification(userEmail, notificationId);
    loadNotifications();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="header-icon-button relative h-12 w-12 rounded-full p-0 transition-all duration-300"
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
            <Bell size={24} style={{ color: isDarkMode ? '#fbbf24' : '#FFFFFF' }} />
          </div>
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-lg animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                zIndex: 101,
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="fixed top-16 right-6 z-50 w-[360px] max-w-full p-0 shadow-2xl"
        style={{
          background: isDarkMode ? '#000000' : '#FFFFFF',
          border: '3px solid transparent',
          backgroundImage: isDarkMode 
            ? 'linear-gradient(#000000, #000000), linear-gradient(135deg, #1B1A17 0%, #F0A500 100%)'
            : 'linear-gradient(#FFFFFF, #FFFFFF), linear-gradient(135deg, #1B1A17 0%, #F0A500 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
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
            background: isDarkMode ? '#000000' : '#FFFFFF',
            borderBottom: '2px solid',
            borderImage: 'linear-gradient(90deg, #1B1A17 0%, #F0A500 100%) 1',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                ref={iconContainerRef}
                className="p-2 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 4px 8px rgba(255, 215, 0, 0.3)',
                }}
              >
                <img 
                  ref={iconImgRef}
                  src="/icons/3d/bell-upgraded.svg" 
                  alt="Notifications" 
                  style={{ 
                    width: '20px', 
                    height: '20px',
                    display: 'block',
                  }} 
                />
              </div>
              <h3 
                className="font-bold text-lg"
                style={{
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
                }}
              >
                Notifications
              </h3>
            </div>
            {unreadCount > 0 && (
              <Button
                ref={buttonRef}
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold"
                style={{
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.setProperty('background', 'rgba(255, 215, 0, 0.2)', 'important');
                  e.currentTarget.style.setProperty('color', '#FFD700', 'important');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.setProperty('background', 'transparent', 'important');
                  e.currentTarget.style.setProperty('color', isDarkMode ? '#FFFFFF' : '#FFD700', 'important');
                }}
              >
                <img src="/icons/3d/check.svg" alt="Check" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                className="text-white font-semibold shadow-md"
                style={{
                  background: 'linear-gradient(to right, #FFD700, #FFA500)',
                }}
              >
                {unreadCount} new
              </Badge>
              <p className="text-xs" style={{ color: isDarkMode ? '#CCCCCC' : '#666666' }}>
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        <div 
          className="overflow-y-scroll overflow-x-hidden" 
          style={{ 
            background: isDarkMode ? '#000000' : '#FFFFFF',
            maxHeight: '450px',
            minHeight: '200px',
            overscrollBehavior: 'contain',
          }}
          onWheel={(e) => {
            // Avoid calling preventDefault on wheel; passive listeners can trigger errors.
            // Use overscrollBehavior CSS and stop propagation to reduce scroll chaining.
            e.stopPropagation();
          }}
        >
          {notifications.length === 0 ? (
            <div 
              className="flex flex-col items-center justify-center py-16 text-center px-4"
              style={{
                background: isDarkMode ? '#000000' : '#FFFFFF',
              }}
            >
              <div 
                className="p-6 rounded-full mb-4"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 8px 16px rgba(255, 215, 0, 0.3)',
                }}
              >
                <img src="/icons/3d/bell.svg" alt="No notifications" style={{ width: '48px', height: '48px' }} />
              </div>
              <p className="text-base font-semibold" style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>
                No notifications
              </p>
              <p className="text-sm mt-2" style={{ color: isDarkMode ? '#CCCCCC' : '#666666' }}>
                You're all caught up! 🎉
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className="p-4 cursor-pointer relative transition-all duration-200"
                  style={{
                    background: !notification.read
                      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)'
                      : (isDarkMode ? '#000000' : '#FFFFFF'),
                    borderBottom: index < notifications.length - 1 ? '1px solid rgba(255, 215, 0, 0.2)' : 'none',
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 215, 0, 0.25) 100%)';
                    e.currentTarget.style.borderLeft = '3px solid #FFD700';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = !notification.read
                      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)'
                      : (isDarkMode ? '#000000' : '#FFFFFF');
                    e.currentTarget.style.borderLeft = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2.5 rounded-lg shadow-md flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        boxShadow: '0 4px 8px rgba(255, 215, 0, 0.3)',
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p 
                          className="font-semibold text-sm"
                          style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div 
                            className="w-2.5 h-2.5 rounded-full mt-1 animate-pulse shadow-md"
                            style={{
                              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                            }}
                          />
                        )}
                      </div>
                      <p 
                        className="text-sm line-clamp-2"
                        style={{ color: isDarkMode ? '#CCCCCC' : '#666666' }}
                      >
                        {notification.message}
                      </p>
                      {notification.sheetTitle && (
                        <Badge 
                          className="mt-2 text-xs"
                          variant="secondary"
                          style={{
                            background: 'rgba(255, 215, 0, 0.2)',
                            color: '#F0A500',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                          }}
                        >
                          {notification.sheetTitle}
                        </Badge>
                      )}
                      <p 
                        className="text-xs mt-2 font-medium"
                        style={{ color: isDarkMode ? '#999999' : '#888888' }}
                      >
                        {formatNotificationTime(notification.timestamp)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0"
                      style={{ color: '#F0A500' }}
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#FFD700';
                      }}
                      title="Delete notification"
                    >
                      <img src="/icons/3d/x.svg" alt="Delete" style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}