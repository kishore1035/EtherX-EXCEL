import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface DynamicArrayIndicatorProps {
  sourceCell: string;
  spillRange: string;
  formula: string;
}

export function DynamicArrayIndicator({
  sourceCell,
  spillRange,
  formula,
}: DynamicArrayIndicatorProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded pointer-events-none">
            <div className="absolute -top-6 left-0 flex items-center gap-1 bg-blue-500 text-white px-2 py-0.5 rounded text-xs">
              <Info className="w-3 h-3" />
              <span>Dynamic Array</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">Dynamic Array Formula</p>
            <p className="text-xs">Source: {sourceCell}</p>
            <p className="text-xs">Spilling to: {spillRange}</p>
            <p className="text-xs font-mono mt-2">{formula}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Visual component to show spilled cells
export function SpilledCellOverlay() {
  return (
    <div className="absolute inset-0 bg-blue-500/5 border border-blue-500/30 pointer-events-none" />
  );
}
