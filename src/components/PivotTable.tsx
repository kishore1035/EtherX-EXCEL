import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table as TableIcon, Plus, X, ArrowRight, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface PivotTableProps {
  open: boolean;
  onClose: () => void;
  cells: Map<string, any>;
  onInsert: (pivotData: PivotTableData) => void;
}

export interface PivotTableData {
  sourceRange: string;
  rowFields: string[];
  columnFields: string[];
  valueField: string;
  aggregation: 'SUM' | 'COUNT' | 'AVERAGE' | 'MIN' | 'MAX';
  targetCell: string;
}

export function PivotTable({ open, onClose, cells, onInsert }: PivotTableProps) {
  const [sourceRange, setSourceRange] = useState("A1:D10");
  const [targetCell, setTargetCell] = useState("F1");
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [rowFields, setRowFields] = useState<string[]>([]);
  const [columnFields, setColumnFields] = useState<string[]>([]);
  const [valueField, setValueField] = useState("");
  const [aggregation, setAggregation] = useState<'SUM' | 'COUNT' | 'AVERAGE' | 'MIN' | 'MAX'>('SUM');

  // Parse source range to get available fields (headers)
  const detectFields = () => {
    try {
      const [start] = sourceRange.split(':');
      const colMatch = start.match(/[A-Z]+/);
      const rowMatch = start.match(/\d+/);
      
      if (!colMatch || !rowMatch) return;
      
      const startCol = colMatch[0];
      const startRow = parseInt(rowMatch[0]);
      
      // Get headers from first row
      const fields: string[] = [];
      let col = startCol;
      
      for (let i = 0; i < 10; i++) {
        const cellId = `${col}${startRow}`;
        const cellValue = cells.get(cellId)?.value;
        
        if (cellValue) {
          fields.push(cellValue);
        } else if (i > 0) {
          break;
        }
        
        // Move to next column
        col = String.fromCharCode(col.charCodeAt(0) + 1);
      }
      
      setAvailableFields(fields);
      
      if (fields.length > 0 && !valueField) {
        setValueField(fields[0]);
      }
    } catch (err) {
      console.error("Error detecting fields:", err);
    }
  };

  const addRowField = (field: string) => {
    if (!rowFields.includes(field)) {
      setRowFields([...rowFields, field]);
    }
  };

  const addColumnField = (field: string) => {
    if (!columnFields.includes(field)) {
      setColumnFields([...columnFields, field]);
    }
  };

  const removeRowField = (field: string) => {
    setRowFields(rowFields.filter(f => f !== field));
  };

  const removeColumnField = (field: string) => {
    setColumnFields(columnFields.filter(f => f !== field));
  };

  // Generate pivot table preview
  const pivotPreview = useMemo(() => {
    if (rowFields.length === 0 || !valueField) {
      return null;
    }

    // Mock preview data for demonstration
    const preview: any[][] = [];
    
    // Header row
    const headerRow = ["", ...columnFields.length > 0 ? ["Category A", "Category B", "Total"] : ["Values"]];
    preview.push(headerRow);
    
    // Data rows (mock)
    for (let i = 0; i < 3; i++) {
      const row = [`Item ${i + 1}`, "100", "150", "250"];
      preview.push(row);
    }
    
    // Total row
    preview.push(["Total", "300", "450", "750"]);
    
    return preview;
  }, [rowFields, columnFields, valueField, aggregation]);

  const handleInsert = () => {
    if (rowFields.length === 0 || !valueField) {
      alert("Please configure at least one row field and a value field");
      return;
    }

    const pivotData: PivotTableData = {
      sourceRange,
      rowFields,
      columnFields,
      valueField,
      aggregation,
      targetCell,
    };

    onInsert(pivotData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TableIcon className="w-5 h-5" />
            Create Pivot Table
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="configure" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="flex-1 overflow-auto space-y-4 mt-4">
            {/* Source Range */}
            <div className="space-y-2">
              <Label>Source Data Range</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., A1:D10"
                  value={sourceRange}
                  onChange={(e) => setSourceRange(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={detectFields} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Detect Fields
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Select the range containing your data (including headers)
              </p>
            </div>

            {/* Available Fields */}
            {availableFields.length > 0 && (
              <div className="border border-border rounded-lg p-4 space-y-3">
                <Label>Available Fields</Label>
                <div className="flex flex-wrap gap-2">
                  {availableFields.map((field) => (
                    <Badge
                      key={field}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pivot Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Row Fields */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <Label>Row Fields</Label>
                <Select onValueChange={addRowField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add row field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="space-y-2">
                  {rowFields.map((field) => (
                    <div
                      key={field}
                      className="flex items-center justify-between bg-accent p-2 rounded"
                    >
                      <span className="text-sm">{field}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeRowField(field)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {rowFields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No row fields selected
                    </p>
                  )}
                </div>
              </div>

              {/* Column Fields */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <Label>Column Fields (Optional)</Label>
                <Select onValueChange={addColumnField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add column field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="space-y-2">
                  {columnFields.map((field) => (
                    <div
                      key={field}
                      className="flex items-center justify-between bg-accent p-2 rounded"
                    >
                      <span className="text-sm">{field}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeColumnField(field)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {columnFields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No column fields selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Value Field and Aggregation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Value Field</Label>
                <Select value={valueField} onValueChange={setValueField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select value field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Aggregation Function</Label>
                <Select value={aggregation} onValueChange={(v: any) => setAggregation(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUM">Sum</SelectItem>
                    <SelectItem value="COUNT">Count</SelectItem>
                    <SelectItem value="AVERAGE">Average</SelectItem>
                    <SelectItem value="MIN">Minimum</SelectItem>
                    <SelectItem value="MAX">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Cell */}
            <div>
              <Label>Insert At Cell</Label>
              <Input
                placeholder="e.g., F1"
                value={targetCell}
                onChange={(e) => setTargetCell(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Where to insert the pivot table
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 p-4 rounded-md space-y-2">
              <h4 className="text-sm font-medium text-blue-500">How to use:</h4>
              <ol className="text-sm text-blue-500 space-y-1 list-decimal list-inside">
                <li>Enter your source data range and click "Detect Fields"</li>
                <li>Add fields to Rows (required) - these will be your categories</li>
                <li>Optionally add fields to Columns for cross-tabulation</li>
                <li>Select a Value field and aggregation function</li>
                <li>Specify where to insert the pivot table</li>
                <li>Click "Create Pivot Table" to insert</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-auto mt-4">
            {pivotPreview ? (
              <div className="space-y-4">
                <div className="bg-accent/50 p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Preview:</strong> This is a sample of how your pivot table will look
                  </p>
                </div>
                
                <ScrollArea className="h-[400px] border border-border rounded-md">
                  <div className="p-4">
                    <table className="w-full border-collapse">
                      <tbody>
                        {pivotPreview.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className={`border border-border p-2 ${
                                  rowIndex === 0 || cellIndex === 0
                                    ? "bg-muted font-medium"
                                    : ""
                                } ${
                                  rowIndex === pivotPreview.length - 1
                                    ? "bg-accent font-medium"
                                    : ""
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    Pivot table will be inserted at cell <strong>{targetCell}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center space-y-2">
                  <TableIcon className="w-12 h-12 mx-auto opacity-20" />
                  <p>Configure your pivot table to see a preview</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>
            <TableIcon className="w-4 h-4 mr-2" />
            Create Pivot Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}