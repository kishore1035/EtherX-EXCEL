import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface TableInsertDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (columns: number, rows: number) => void;
}

export function TableInsertDialog({ open, onClose, onInsert }: TableInsertDialogProps) {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(5);

  console.log('TableInsertDialog render:', { open, columns, rows });

  const handleInsert = () => {
    if (columns > 0 && rows > 0) {
      onInsert(columns, rows);
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset to defaults
    setColumns(3);
    setRows(5);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="bg-white p-6 !max-w-[280px] w-[280px]" 
        style={{ 
          background: '#FFFFFF',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #FFFFFF 0%, #FFD700 100%) 1',
          maxWidth: '280px !important',
          width: '280px'
        }}
      >
        {/* Hide the default close button */}
        <style>{`
          [data-slot="dialog-content"] > button[class*="absolute"] {
            display: none !important;
          }
        `}</style>
        <DialogHeader>
          <DialogTitle className="text-sm">Insert Table</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-3">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="columns" className="text-right text-xs">
              Columns
            </Label>
            <Input
              id="columns"
              type="number"
              min="1"
              max="26"
              value={columns}
              onChange={(e) => setColumns(Math.max(1, Math.min(26, parseInt(e.target.value) || 1)))}
              className="col-span-3 h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="rows" className="text-right text-xs">
              Rows
            </Label>
            <Input
              id="rows"
              type="number"
              min="1"
              max="100"
              value={rows}
              onChange={(e) => setRows(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="col-span-3 h-8 text-sm"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} className="h-8 text-xs flex-1">
            Cancel
          </Button>
          <Button onClick={handleInsert} className="h-8 text-xs template-button-gradient flex-1">
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
