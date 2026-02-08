import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Sparkles, Check, X } from "lucide-react";

interface FlashFillSuggestionProps {
  cellId: string;
  suggestions: string[];
  onAccept: (suggestions: string[]) => void;
  onReject: () => void;
}

export function FlashFillSuggestion({
  cellId,
  suggestions,
  onAccept,
  onReject,
}: FlashFillSuggestionProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
  }, [suggestions]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="fixed z-50" style={{ top: "200px", left: "400px" }}>
      <div className="bg-card border border-primary shadow-2xl rounded-lg p-4 min-w-[300px] animate-in slide-in-from-bottom-2">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium">Flash Fill Detected</h4>
            <p className="text-xs text-muted-foreground">
              We found a pattern in your data
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-accent/50 rounded-md p-3 mb-3 max-h-40 overflow-auto">
          <p className="text-xs text-muted-foreground mb-2">
            Suggested values:
          </p>
          <div className="space-y-1">
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-4 h-4 rounded-sm bg-primary/20 flex items-center justify-center text-xs text-primary">
                  {index + 1}
                </div>
                <span className="font-mono">{suggestion}</span>
              </div>
            ))}
            {suggestions.length > 5 && (
              <p className="text-xs text-muted-foreground italic">
                +{suggestions.length - 5} more values...
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-2"
            onClick={() => {
              onAccept(suggestions);
              setVisible(false);
            }}
          >
            <Check className="w-4 h-4" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              onReject();
              setVisible(false);
            }}
          >
            <X className="w-4 h-4" />
            Ignore
          </Button>
        </div>

        {/* Hint */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-accent rounded text-xs">Tab</kbd> to accept
        </p>
      </div>
    </div>
  );
}

// Inline cell suggestion overlay
export function FlashFillCellOverlay({ value }: { value: string }) {
  return (
    <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
      <span className="text-muted-foreground/50 italic truncate">
        {value}
      </span>
    </div>
  );
}
