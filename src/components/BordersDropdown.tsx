import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export type BorderPreset =
  | "BOTTOM"
  | "TOP"
  | "LEFT"
  | "RIGHT"
  | "NONE"
  | "ALL"
  | "OUTSIDE"
  | "THICK_OUTSIDE"
  | "BOTTOM_DOUBLE"
  | "BOTTOM_THICK"
  | "TOP_BOTTOM"
  | "TOP_THICK_BOTTOM"
  | "TOP_DOUBLE_BOTTOM";

interface BordersDropdownProps {
  onApplyBorder: (preset: BorderPreset) => void;
  isDarkMode?: boolean;
}

const borderOptions: Array<{ label: string; preset: BorderPreset; icon: string }> = [
  { label: "Bottom Border", preset: "BOTTOM", icon: "⎯" },
  { label: "Top Border", preset: "TOP", icon: "‾" },
  { label: "Left Border", preset: "LEFT", icon: "|" },
  { label: "Right Border", preset: "RIGHT", icon: "|" },
  { label: "No Border", preset: "NONE", icon: "□" },
  { label: "All Borders", preset: "ALL", icon: "▦" },
  { label: "Outside Borders", preset: "OUTSIDE", icon: "⊡" },
  { label: "Thick Outside Borders", preset: "THICK_OUTSIDE", icon: "■" },
  { label: "Bottom Double Border", preset: "BOTTOM_DOUBLE", icon: "═" },
  { label: "Thick Bottom Border", preset: "BOTTOM_THICK", icon: "━" },
  { label: "Top and Bottom Border", preset: "TOP_BOTTOM", icon: "⊤⊥" },
  { label: "Top and Thick Bottom Border", preset: "TOP_THICK_BOTTOM", icon: "⊤━" },
  { label: "Top and Double Bottom Border", preset: "TOP_DOUBLE_BOTTOM", icon: "⊤═" },
];

export function BordersDropdown({ onApplyBorder, isDarkMode = false }: BordersDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleBorderClick = (preset: BorderPreset) => {
    onApplyBorder(preset);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1"
          style={{
            color: isDarkMode ? "#FFFFFF" : "#000000",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          <span className="text-xs">Borders</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56"
        style={{
          background: isDarkMode ? "#1a1a1a" : "#FFFFFF",
          border: isDarkMode ? "1px solid #333" : "1px solid #e5e7eb",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {borderOptions.map((option) => (
          <DropdownMenuItem
            key={option.preset}
            onClick={() => handleBorderClick(option.preset)}
            className="cursor-pointer flex items-center gap-3 px-3 py-2"
            style={{
              color: isDarkMode ? "#FFFFFF" : "#000000",
            }}
          >
            <span
              className="font-mono text-lg w-6 flex items-center justify-center"
              style={{
                color: isDarkMode ? "#FFD700" : "#000000",
              }}
            >
              {option.icon}
            </span>
            <span className="text-sm">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
