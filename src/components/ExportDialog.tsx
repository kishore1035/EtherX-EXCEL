import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { FileDown, FileText, FileSpreadsheet } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'xlsx' | 'pdf' | 'json') => void;
}

export function ExportDialog({ open, onClose, onExport }: ExportDialogProps) {
  const handleExport = (format: 'csv' | 'xlsx' | 'pdf' | 'json') => {
    onExport(format);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Export Spreadsheet
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2"
            onClick={() => handleExport('xlsx')}
          >
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <div className="text-center">
              <div className="font-medium">Excel</div>
              <div className="text-xs text-muted-foreground">XLSX format</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2"
            onClick={() => handleExport('csv')}
          >
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="text-center">
              <div className="font-medium">CSV</div>
              <div className="text-xs text-muted-foreground">Comma separated</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2"
            onClick={() => handleExport('pdf')}
          >
            <FileText className="w-8 h-8 text-red-600" />
            <div className="text-center">
              <div className="font-medium">PDF</div>
              <div className="text-xs text-muted-foreground">Portable document</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2"
            onClick={() => handleExport('json')}
          >
            <FileText className="w-8 h-8 text-purple-600" />
            <div className="text-center">
              <div className="font-medium">JSON</div>
              <div className="text-xs text-muted-foreground">Data format</div>
            </div>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
