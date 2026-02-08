import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { Merge, Split } from "lucide-react";

interface MergeCellsProps {
  open: boolean;
  onClose: () => void;
  selectedRange?: { start: string; end: string };
  onMerge: (rows: number, cols: number) => void;
  onUnmerge: () => void;
  isMerged?: boolean;
}

export function MergeCells({
  open,
  onClose,
  selectedRange,
  onMerge,
  onUnmerge,
  isMerged = false,
}: MergeCellsProps) {
  const [rows, setRows] = useState("2");
  const [cols, setCols] = useState("2");

  const handleMerge = () => {
    onMerge(parseInt(rows) || 2, parseInt(cols) || 2);
    onClose();
  };

  const handleUnmerge = () => {
    onUnmerge();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="w-5 h-5" />
            Merge Cells
          </DialogTitle>
        </DialogHeader>

        {isMerged ? (
          <div className="space-y-4">
            <div className="bg-accent/50 p-4 rounded-md">
              <p className="text-sm">
                This cell is part of a merged range. Unmerge to edit individual cells.
              </p>
            </div>
            <Button onClick={handleUnmerge} className="w-full" variant="destructive">
              <Split className="w-4 h-4 mr-2" />
              Unmerge Cells
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Combine multiple cells into one larger cell
            </p>

            {selectedRange && (
              <div className="bg-accent/50 p-3 rounded-md text-sm">
                Selected: {selectedRange.start} to {selectedRange.end}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rows to Merge</Label>
                <Input
                  type="number"
                  min="1"
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                  placeholder="2"
                />
              </div>
              <div>
                <Label>Columns to Merge</Label>
                <Input
                  type="number"
                  min="1"
                  value={cols}
                  onChange={(e) => setCols(e.target.value)}
                  placeholder="2"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 p-3 rounded-md text-sm">
              <p className="text-blue-500">
                💡 Tip: Only the top-left cell's value will be kept
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isMerged && (
            <Button onClick={handleMerge}>
              <Merge className="w-4 h-4 mr-2" />
              Merge
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
