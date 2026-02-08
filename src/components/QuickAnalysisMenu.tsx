import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  Calculator,
  BarChart3,
  LineChart,
  Palette,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";

interface QuickAnalysisMenuProps {
  position: { x: number; y: number };
  selectedRange: string;
  onAction: (action: string, type?: string) => void;
  onClose: () => void;
}

export function QuickAnalysisMenu({
  position,
  selectedRange,
  onAction,
  onClose,
}: QuickAnalysisMenuProps) {
  const [activeTab, setActiveTab] = useState<"totals" | "charts" | "formatting">("totals");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Ensure popup stays within viewport with better logic
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
  
  const menuWidth = 320;
  const menuHeight = 400;
  
  let adjustedX = position.x;
  let adjustedY = position.y + 10; // Small offset from cursor
  
  // If menu would go off right edge, position it to the left
  if (adjustedX + menuWidth > viewportWidth - 20) {
    adjustedX = viewportWidth - menuWidth - 20;
  }
  
  // If menu would go off left edge, position it at minimum margin
  if (adjustedX < 20) {
    adjustedX = 20;
  }
  
  // If menu would go off bottom edge, position it above cursor
  if (adjustedY + menuHeight > viewportHeight - 20) {
    adjustedY = position.y - menuHeight - 10;
  }
  
  // If still off top edge, position it at minimum margin
  if (adjustedY < 20) {
    adjustedY = 20;
  }
  
  const adjustedPosition = {
    left: adjustedX,
    top: adjustedY,
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: adjustedPosition.top,
        left: adjustedPosition.left,
      }}
    >
      <div className="bg-card border-2 border-border rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2 bg-accent/30 border-b border-border flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Quick Analysis: {selectedRange}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <span className="text-xs">✕</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("totals")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "totals"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <Calculator className="w-4 h-4 mx-auto mb-1" />
            Totals
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "charts"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <BarChart3 className="w-4 h-4 mx-auto mb-1" />
            Charts
          </button>
          <button
            onClick={() => setActiveTab("formatting")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "formatting"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <Palette className="w-4 h-4 mx-auto mb-1" />
            Format
          </button>
        </div>

        {/* Content */}
        <div className="p-3 min-w-[280px]">
          {activeTab === "totals" && (
            <div className="space-y-1">
              {[
                { label: "Sum", icon: "∑", action: "sum" },
                { label: "Average", icon: "μ", action: "average" },
                { label: "Count", icon: "#", action: "count" },
                { label: "Max", icon: "↑", action: "max" },
                { label: "Min", icon: "↓", action: "min" },
              ].map((item) => (
                <button
                  key={item.action}
                  onClick={() => {
                    onAction("total", item.action);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <span className="text-blue-600 font-bold">{item.icon}</span>
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === "charts" && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Bar Chart", icon: BarChart3, type: "bar" },
                { label: "Line Chart", icon: LineChart, type: "line" },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    onAction("chart", item.type);
                    onClose();
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border hover:border-purple-500 hover:bg-accent transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <item.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === "formatting" && (
            <div className="space-y-1">
              {[
                {
                  label: "Color Scale",
                  description: "Red to Green gradient",
                  type: "colorscale",
                },
                {
                  label: "Data Bars",
                  description: "Visual bar in cells",
                  type: "databars",
                },
                {
                  label: "Icon Sets",
                  description: "Traffic light icons",
                  type: "iconsets",
                },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    onAction("format", item.type);
                    onClose();
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
