import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

interface ColorPaletteProps {
  value?: string;
  onChange: (color: string) => void;
  children: React.ReactNode;
}

const COLOR_PALETTE = [
  { name: "Black", value: "#000000" },
  { name: "Dark Gray", value: "#374151" },
  { name: "Gray", value: "#6B7280" },
  { name: "Light Gray", value: "#9CA3AF" },
  { name: "White", value: "#FFFFFF" },
  
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Lime", value: "#84CC16" },
  
  { name: "Green", value: "#22C55E" },
  { name: "Emerald", value: "#10B981" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Sky", value: "#0EA5E9" },
  
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Fuchsia", value: "#D946EF" },
  
  { name: "Pink", value: "#EC4899" },
  { name: "Rose", value: "#F43F5E" },
];

export function ColorPalette({ value, onChange, children }: ColorPaletteProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div>
            <label className="text-sm mb-2 block">Color Palette</label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color.value}
                  onClick={() => onChange(color.value)}
                  className="w-10 h-10 rounded border-2 hover:scale-110 transition-transform relative"
                  style={{
                    backgroundColor: color.value,
                    borderColor: value === color.value ? "#3B82F6" : "#E5E7EB",
                  }}
                  title={color.name}
                >
                  {value === color.value && (
                    <Check className="w-4 h-4 absolute inset-0 m-auto text-white mix-blend-difference" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t border-border pt-3">
            <label className="text-sm mb-2 block">Custom Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value || "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="w-12 h-10 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 px-3 py-2 rounded border border-border bg-background text-sm"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
