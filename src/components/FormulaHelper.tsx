import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";

interface FormulaHelperProps {
  formula: string;
  visible: boolean;
  position: { x: number; y: number };
}

const FORMULA_HINTS = {
  "SUM": {
    syntax: "SUM(range)",
    description: "Adds all numbers in a range",
    example: "=SUM(A1:A10)"
  },
  "AVERAGE": {
    syntax: "AVERAGE(range)",
    description: "Calculates the average of numbers",
    example: "=AVERAGE(B1:B5)"
  },
  "COUNT": {
    syntax: "COUNT(range)",
    description: "Counts cells containing numbers",
    example: "=COUNT(C1:C10)"
  },
  "MAX": {
    syntax: "MAX(range)",
    description: "Returns the largest value",
    example: "=MAX(A1:A10)"
  },
  "MIN": {
    syntax: "MIN(range)",
    description: "Returns the smallest value",
    example: "=MIN(A1:A10)"
  },
  "IF": {
    syntax: "IF(condition, value_if_true, value_if_false)",
    description: "Returns different values based on condition",
    example: "=IF(A1>10, \"High\", \"Low\")"
  }
};

export function FormulaHelper({ formula, visible, position }: FormulaHelperProps) {
  const [currentHint, setCurrentHint] = useState<any>(null);

  useEffect(() => {
    if (!formula || !formula.startsWith("=")) {
      setCurrentHint(null);
      return;
    }

    const formulaUpper = formula.toUpperCase();
    for (const [func, hint] of Object.entries(FORMULA_HINTS)) {
      if (formulaUpper.includes(func)) {
        setCurrentHint({ func, ...hint });
        break;
      }
    }
  }, [formula]);

  if (!visible || !currentHint) return null;

  // Ensure tooltip stays within viewport with better logic
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
  
  const tooltipWidth = 320;
  const tooltipHeight = 200;
  
  let adjustedX = position.x;
  let adjustedY = position.y;
  
  // If tooltip would go off right edge, position it to the left
  if (adjustedX + tooltipWidth > viewportWidth - 20) {
    adjustedX = viewportWidth - tooltipWidth - 20;
  }
  
  // If tooltip would go off left edge, position it at minimum margin
  if (adjustedX < 20) {
    adjustedX = 20;
  }
  
  // If tooltip would go off bottom edge, position it above
  if (adjustedY + tooltipHeight > viewportHeight - 20) {
    adjustedY = position.y - tooltipHeight - 20;
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
    <Card 
      className="fixed z-50 w-80 shadow-lg"
      style={{
        left: adjustedPosition.left,
        top: adjustedPosition.top,
      }}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded font-mono">
              {currentHint.func}
            </span>
            <span className="text-xs text-muted-foreground">Function Helper</span>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Syntax:</div>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {currentHint.syntax}
            </code>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Description:</div>
            <p className="text-xs text-muted-foreground">
              {currentHint.description}
            </p>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Example:</div>
            <code className="text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-green-700 dark:text-green-300">
              {currentHint.example}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}