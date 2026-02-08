import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { Printer, FileDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface PrintLayoutProps {
  open: boolean;
  onClose: () => void;
  onPrint: (settings: PrintSettings) => void;
}

export interface PrintSettings {
  orientation: 'portrait' | 'landscape';
  paperSize: 'A4' | 'Letter' | 'Legal';
  margins: { top: number; right: number; bottom: number; left: number };
  scaling: number;
  fitToPage: boolean;
  showGridlines: boolean;
  showHeaders: boolean;
  headerText?: string;
  footerText?: string;
  pageNumbers: boolean;
}

export function PrintLayout({ open, onClose, onPrint }: PrintLayoutProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [paperSize, setPaperSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [scaling, setScaling] = useState("100");
  const [fitToPage, setFitToPage] = useState(false);
  const [showGridlines, setShowGridlines] = useState(true);
  const [showHeaders, setShowHeaders] = useState(true);
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("Page {page}");
  const [pageNumbers, setPageNumbers] = useState(true);
  const [marginTop, setMarginTop] = useState("0.75");
  const [marginRight, setMarginRight] = useState("0.7");
  const [marginBottom, setMarginBottom] = useState("0.75");
  const [marginLeft, setMarginLeft] = useState("0.7");

  const handlePrint = () => {
    const settings: PrintSettings = {
      orientation,
      paperSize,
      margins: {
        top: parseFloat(marginTop),
        right: parseFloat(marginRight),
        bottom: parseFloat(marginBottom),
        left: parseFloat(marginLeft),
      },
      scaling: parseInt(scaling),
      fitToPage,
      showGridlines,
      showHeaders,
      headerText: headerText || undefined,
      footerText: footerText || undefined,
      pageNumbers,
    };
    
    onPrint(settings);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Layout & Setup
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="page" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="page">Page Setup</TabsTrigger>
            <TabsTrigger value="margins">Margins</TabsTrigger>
            <TabsTrigger value="header">Header/Footer</TabsTrigger>
          </TabsList>

          <TabsContent value="page" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Orientation</Label>
                <Select value={orientation} onValueChange={(v: any) => setOrientation(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Paper Size</Label>
                <Select value={paperSize} onValueChange={(v: any) => setPaperSize(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Scaling (%)</Label>
              <Input
                type="number"
                min="10"
                max="400"
                value={scaling}
                onChange={(e) => setScaling(e.target.value)}
                disabled={fitToPage}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={fitToPage}
                onCheckedChange={(checked) => setFitToPage(checked as boolean)}
              />
              <Label>Fit to one page</Label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showGridlines}
                  onCheckedChange={(checked) => setShowGridlines(checked as boolean)}
                />
                <Label>Print gridlines</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showHeaders}
                  onCheckedChange={(checked) => setShowHeaders(checked as boolean)}
                />
                <Label>Print row and column headers</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="margins" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">Set margins in inches</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Top</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={marginTop}
                  onChange={(e) => setMarginTop(e.target.value)}
                />
              </div>
              <div>
                <Label>Bottom</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={marginBottom}
                  onChange={(e) => setMarginBottom(e.target.value)}
                />
              </div>
              <div>
                <Label>Left</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={marginLeft}
                  onChange={(e) => setMarginLeft(e.target.value)}
                />
              </div>
              <div>
                <Label>Right</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={marginRight}
                  onChange={(e) => setMarginRight(e.target.value)}
                />
              </div>
            </div>

            <div className="border border-border rounded-md p-8">
              <div className="border-2 border-dashed border-muted-foreground/30 h-64 flex items-center justify-center relative">
                <div className="absolute top-0 left-0 right-0 text-center text-xs text-muted-foreground">
                  {marginTop}"
                </div>
                <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-muted-foreground">
                  {marginBottom}"
                </div>
                <div className="absolute left-0 top-0 bottom-0 flex items-center text-xs text-muted-foreground">
                  {marginLeft}"
                </div>
                <div className="absolute right-0 top-0 bottom-0 flex items-center text-xs text-muted-foreground">
                  {marginRight}"
                </div>
                <span className="text-muted-foreground">Content Area</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="header" className="space-y-4 mt-4">
            <div>
              <Label>Header Text (optional)</Label>
              <Input
                placeholder="e.g., Company Name - Quarterly Report"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for no header
              </p>
            </div>

            <div>
              <Label>Footer Text</Label>
              <Input
                placeholder="Use {'{page}'} for page number"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {'{page}'} for page number, {'{date}'} for date
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={pageNumbers}
                onCheckedChange={(checked) => setPageNumbers(checked as boolean)}
              />
              <Label>Show page numbers</Label>
            </div>

            <div className="bg-accent/50 p-4 rounded-md">
              <p className="text-sm mb-2">Preview:</p>
              <div className="border border-border bg-background p-4 rounded">
                {headerText && (
                  <div className="text-center text-sm mb-2 pb-2 border-b border-border">
                    {headerText}
                  </div>
                )}
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                  Spreadsheet content
                </div>
                {footerText && (
                  <div className="text-center text-sm mt-2 pt-2 border-t border-border">
                    {footerText.replace('{page}', '1').replace('{date}', new Date().toLocaleDateString())}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
