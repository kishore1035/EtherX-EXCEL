import { useEffect, useState } from "react";
import { Trophy, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface BadgeNotificationProps {
  title: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon?: any;
  show: boolean;
  onClose: () => void;
}

export function BadgeNotification({
  title,
  description,
  rarity,
  icon: Icon = Trophy,
  show,
  onClose,
}: BadgeNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!show) return null;

  const getRarityColors = () => {
    switch (rarity) {
      case "common":
        return {
          gradient: "from-yellow-300 to-yellow-500",
          bg: "bg-yellow-300/10",
          border: "border-yellow-400",
        };
      case "rare":
        return {
          gradient: "from-yellow-400 to-yellow-600",
          bg: "bg-yellow-400/10",
          border: "border-yellow-500",
        };
      case "epic":
        return {
          gradient: "from-yellow-500 to-orange-500",
          bg: "bg-yellow-500/10",
          border: "border-orange-400",
        };
      case "legendary":
        return {
          gradient: "from-yellow-500 via-orange-500 to-orange-600",
          bg: "bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-orange-600/10",
          border: "border-yellow-500",
        };
      default:
        return {
          gradient: "from-yellow-300 to-yellow-500",
          bg: "bg-yellow-300/10",
          border: "border-yellow-400",
        };
    }
  };

  const colors = getRarityColors();

  return (
    <div
      className={`fixed top-20 right-6 z-[100] transition-all duration-300 ${
        visible
          ? "animate-in slide-in-from-top-4 fade-in"
          : "animate-out slide-out-to-top-4 fade-out"
      }`}
    >
      <div
        className={`w-96 rounded-xl border-2 ${colors.border} ${colors.bg} backdrop-blur-xl shadow-2xl overflow-hidden`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} animate-pulse`}
          />
        </div>

        {/* Sparkles Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-yellow-400 w-4 h-4 animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: "1.5s",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0 shadow-lg animate-bounce`}
              style={{ animationDuration: "2s" }}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-lg">Achievement Unlocked!</h4>
                <Badge
                  className={`text-xs bg-gradient-to-r ${colors.gradient} text-white border-none`}
                >
                  {rarity.toUpperCase()}
                </Badge>
              </div>
              <h3 className="font-bold text-xl mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-1 bg-background/20 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colors.gradient}`}
              style={{
                width: "100%",
                animation: "shrink 5s linear",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
