import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { Snowflake } from "lucide-react";

interface FreezePanesProps {
  open: boolean;
  onClose: () => void;
  currentFrozenRows?: number;
  currentFrozenCols?: number;
  onApply: (rows: number, cols: number) => void;
  onUnfreeze: () => void;
}

export function FreezePanes({
  open,
  onClose,
  currentFrozenRows = 0,
  currentFrozenCols = 0,
  onApply,
  onUnfreeze,
}: FreezePanesProps) {
  const [rows, setRows] = useState(currentFrozenRows.toString());
  const [cols, setCols] = useState(currentFrozenCols.toString());

  const handleApply = () => {
    onApply(parseInt(rows) || 0, parseInt(cols) || 0);
    onClose();
  };

  const handleQuickFreeze = (type: 'row' | 'col' | 'both') => {
    switch (type) {
      case 'row':
        onApply(1, 0);
        break;
      case 'col':
        onApply(0, 1);
        break;
      case 'both':
        onApply(1, 1);
        break;
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Snowflake className="w-5 h-5" />
            Freeze Panes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Lock rows and columns so they stay visible when scrolling
          </p>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => handleQuickFreeze('row')}
              className="flex-col h-auto py-4"
            >
              <Snowflake className="w-4 h-4 mb-1" />
              <span className="text-xs">First Row</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickFreeze('col')}
              className="flex-col h-auto py-4"
            >
              <Snowflake className="w-4 h-4 mb-1" />
              <span className="text-xs">First Column</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickFreeze('both')}
              className="flex-col h-auto py-4"
            >
              <Snowflake className="w-4 h-4 mb-1" />
              <span className="text-xs">Both</span>
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="mb-3">Custom Freeze</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Freeze Rows</Label>
                <Input
                  type="number"
                  min="0"
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Freeze Columns</Label>
                <Input
                  type="number"
                  min="0"
                  value={cols}
                  onChange={(e) => setCols(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {(currentFrozenRows > 0 || currentFrozenCols > 0) && (
            <div className="bg-accent/50 p-3 rounded-md text-sm">
              Currently frozen: {currentFrozenRows} row(s), {currentFrozenCols} column(s)
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {(currentFrozenRows > 0 || currentFrozenCols > 0) && (
            <Button variant="outline" onClick={onUnfreeze}>
              Unfreeze All
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Custom</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
