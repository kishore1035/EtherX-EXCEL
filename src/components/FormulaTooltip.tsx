import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Lightbulb, Code } from "lucide-react";

interface FormulaInfo {
  name: string;
  syntax: string;
  description: string;
  example: string;
  category: string;
}

const formulaDatabase: Record<string, FormulaInfo> = {
  SUM: {
    name: "SUM",
    syntax: "=SUM(number1, [number2], ...)",
    description: "Adds all the numbers in a range of cells",
    example: "=SUM(A1:A10)",
    category: "Math",
  },
  AVERAGE: {
    name: "AVERAGE",
    syntax: "=AVERAGE(number1, [number2], ...)",
    description: "Returns the average (arithmetic mean) of the arguments",
    example: "=AVERAGE(B1:B10)",
    category: "Statistical",
  },
  COUNT: {
    name: "COUNT",
    syntax: "=COUNT(value1, [value2], ...)",
    description: "Counts the number of cells that contain numbers",
    example: "=COUNT(C1:C20)",
    category: "Statistical",
  },
  MAX: {
    name: "MAX",
    syntax: "=MAX(number1, [number2], ...)",
    description: "Returns the largest value in a set of values",
    example: "=MAX(D1:D50)",
    category: "Statistical",
  },
  MIN: {
    name: "MIN",
    syntax: "=MIN(number1, [number2], ...)",
    description: "Returns the smallest value in a set of values",
    example: "=MIN(E1:E50)",
    category: "Statistical",
  },
  IF: {
    name: "IF",
    syntax: "=IF(condition, value_if_true, value_if_false)",
    description: "Returns one value if a condition is true and another if it's false",
    example: "=IF(A1>10, \"High\", \"Low\")",
    category: "Logical",
  },
  VLOOKUP: {
    name: "VLOOKUP",
    syntax: "=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])",
    description: "Searches for a value in the first column of a table and returns a value in the same row",
    example: "=VLOOKUP(A2, D2:F10, 3, FALSE)",
    category: "Lookup",
  },
  COUNTIF: {
    name: "COUNTIF",
    syntax: "=COUNTIF(range, criteria)",
    description: "Counts the number of cells that meet a criteria",
    example: "=COUNTIF(A1:A10, \">5\")",
    category: "Statistical",
  },
  SUMIF: {
    name: "SUMIF",
    syntax: "=SUMIF(range, criteria, [sum_range])",
    description: "Adds the cells specified by a given criteria",
    example: "=SUMIF(A1:A10, \">5\", B1:B10)",
    category: "Math",
  },
};

interface FormulaTooltipProps {
  formula: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function FormulaTooltip({ formula, position, onClose }: FormulaTooltipProps) {
  const [info, setInfo] = useState<FormulaInfo | null>(null);

  useEffect(() => {
    // Extract function name from formula (e.g., "=SUM(" -> "SUM")
    const match = formula.match(/^=([A-Z]+)\(/i);
    if (match) {
      const funcName = match[1].toUpperCase();
      if (formulaDatabase[funcName]) {
        setInfo(formulaDatabase[funcName]);
      }
    } else {
      setInfo(null);
    }
  }, [formula]);

  if (!info) return null;

  return (
    <div
      className="fixed z-50 w-96 animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        top: position.y + 40,
        left: position.x,
      }}
    >
      <div className="bg-card border-2 border-blue-500 rounded-lg shadow-2xl p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium">{info.name}</h4>
              <Badge variant="secondary" className="text-xs mt-0.5">
                {info.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Syntax */}
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-1">
            <Code className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Syntax</span>
          </div>
          <code className="block bg-accent px-3 py-2 rounded text-xs font-mono">
            {info.syntax}
          </code>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {info.description}
        </p>

        {/* Example */}
        <div className="bg-accent/50 border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Example:</p>
          <code className="text-sm font-mono text-foreground">{info.example}</code>
        </div>

        {/* Tip */}
        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Press <kbd className="px-1.5 py-0.5 bg-accent rounded text-xs">Tab</kbd> to autocomplete</span>
        </div>
      </div>
    </div>
  );
}
