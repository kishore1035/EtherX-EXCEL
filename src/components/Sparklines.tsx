import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { LineChart, BarChart3, TrendingUp } from "lucide-react";
import { SparklineData } from "../types/spreadsheet";

interface SparklinesProps {
  open: boolean;
  onClose: () => void;
  currentSparkline?: SparklineData;
  onAdd: (sparkline: SparklineData) => void;
  onRemove: () => void;
}

export function Sparklines({
  open,
  onClose,
  currentSparkline,
  onAdd,
  onRemove,
}: SparklinesProps) {
  const [type, setType] = useState<'line' | 'bar' | 'winloss'>(
    currentSparkline?.type || 'line'
  );
  const [range, setRange] = useState(currentSparkline?.range || "A1:A10");
  const [color, setColor] = useState(currentSparkline?.color || "#3b82f6");

  const handleAdd = () => {
    if (range) {
      onAdd({ type, range, color });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Insert Sparkline
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add a mini chart inside a cell to visualize data trends
          </p>

          <div>
            <Label>Chart Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4" />
                    Line Chart
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Bar Chart
                  </div>
                </SelectItem>
                <SelectItem value="winloss">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Win/Loss
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Data Range</Label>
            <Input
              placeholder="e.g., A1:A10"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              The range of cells containing the data to visualize
            </p>
          </div>

          <div>
            <Label>Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="bg-accent/50 p-4 rounded-md">
            <p className="text-sm mb-2">Preview:</p>
            <div className="bg-background p-3 rounded border border-border flex items-center justify-center h-16">
              {type === 'line' && (
                <svg width="120" height="40" className="opacity-70">
                  <polyline
                    points="0,30 20,25 40,15 60,20 80,10 100,5 120,15"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                  />
                </svg>
              )}
              {type === 'bar' && (
                <svg width="120" height="40" className="opacity-70">
                  {[8, 15, 25, 12, 30, 20, 18].map((h, i) => (
                    <rect
                      key={i}
                      x={i * 18}
                      y={40 - h}
                      width="14"
                      height={h}
                      fill={color}
                    />
                  ))}
                </svg>
              )}
              {type === 'winloss' && (
                <svg width="120" height="40" className="opacity-70">
                  {[15, -10, 20, -5, 25, 15, -8].map((h, i) => (
                    <rect
                      key={i}
                      x={i * 18}
                      y={h > 0 ? 20 - h : 20}
                      width="14"
                      height={Math.abs(h)}
                      fill={h > 0 ? color : '#ef4444'}
                    />
                  ))}
                </svg>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 p-3 rounded-md text-sm">
            <p className="text-blue-500">
              💡 Sparklines are great for showing trends in a compact space!
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {currentSparkline && (
            <Button variant="destructive" onClick={onRemove}>
              Remove Sparkline
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>
            {currentSparkline ? 'Update' : 'Insert'} Sparkline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
