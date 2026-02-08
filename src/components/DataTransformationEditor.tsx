import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  X,
  Columns,
  Filter,
  Type,
  Merge,
  Group,
  Trash2,
  ChevronRight,
  Play,
  RotateCcw,
  Settings,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface TransformStep {
  id: string;
  name: string;
  type: string;
  icon: any;
  details: string;
}

interface DataTransformationEditorProps {
  open: boolean;
  onClose: () => void;
  onApply: (steps: TransformStep[]) => void;
}

export function DataTransformationEditor({
  open,
  onClose,
  onApply,
}: DataTransformationEditorProps) {
  const [steps, setSteps] = useState<TransformStep[]>([
    {
      id: "1",
      name: "Source",
      type: "source",
      icon: Columns,
      details: "Sheet1!A1:E100",
    },
    {
      id: "2",
      name: "Removed Columns",
      type: "remove",
      icon: Trash2,
      details: "Column D, Column E",
    },
    {
      id: "3",
      name: "Filtered Rows",
      type: "filter",
      icon: Filter,
      details: "Sales > 1000",
    },
    {
      id: "4",
      name: "Changed Type",
      type: "type",
      icon: Type,
      details: "Column A: Text → Number",
    },
  ]);

  const [selectedStep, setSelectedStep] = useState<TransformStep | null>(steps[0]);

  // Sample preview data
  const previewData = [
    { id: 1, product: "Product A", category: "Electronics", sales: 1200, region: "North" },
    { id: 2, product: "Product B", category: "Clothing", sales: 850, region: "South" },
    { id: 3, product: "Product C", category: "Electronics", sales: 2300, region: "East" },
    { id: 4, product: "Product D", category: "Home", sales: 1500, region: "West" },
    { id: 5, product: "Product E", category: "Electronics", sales: 1800, region: "North" },
  ];

  const availableTransforms = [
    { icon: Trash2, name: "Remove Columns", type: "remove" },
    { icon: Filter, name: "Filter Rows", type: "filter" },
    { icon: Type, name: "Change Type", type: "type" },
    { icon: Merge, name: "Merge Queries", type: "merge" },
    { icon: Group, name: "Group By", type: "group" },
  ];

  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Power Query Editor
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Applied Steps Panel */}
          <div className="w-64 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium mb-2">Applied Steps</h3>
              <p className="text-xs text-muted-foreground">
                Steps applied to transform data
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`group flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      selectedStep?.id === step.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedStep(step)}
                  >
                    <step.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{step.name}</span>
                    {step.type !== "source" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStep(step.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-border">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Play className="w-4 h-4" />
                Add Step
              </Button>
            </div>
          </div>

          {/* Data Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-accent/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Data Preview</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    5 rows
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    4 columns
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {availableTransforms.map((transform, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <transform.icon className="w-3 h-3" />
                    {transform.name}
                  </Button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Region</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.product}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>${row.sales.toLocaleString()}</TableCell>
                        <TableCell>{row.region}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border flex items-center justify-between">
              <Button variant="outline" gap-2>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => onApply(steps)}>
                  Close & Apply
                </Button>
              </div>
            </div>
          </div>

          {/* Query Settings Panel */}
          <div className="w-80 border-l border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium mb-2">Query Settings</h3>
              {selectedStep && (
                <p className="text-xs text-muted-foreground">
                  Editing: {selectedStep.name}
                </p>
              )}
            </div>

            {selectedStep && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">
                    Step Name
                  </label>
                  <Input value={selectedStep.name} className="text-sm" />
                </div>

                <Separator />

                <div>
                  <label className="text-xs font-medium mb-2 block">
                    Step Type
                  </label>
                  <Badge variant="outline">{selectedStep.type}</Badge>
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">
                    Details
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {selectedStep.details}
                  </p>
                </div>

                {selectedStep.type === "filter" && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-xs font-medium mb-2 block">
                        Filter Condition
                      </label>
                      <div className="space-y-2">
                        <Input placeholder="Column" className="text-sm" />
                        <select className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm">
                          <option>Greater than</option>
                          <option>Less than</option>
                          <option>Equal to</option>
                          <option>Contains</option>
                        </select>
                        <Input placeholder="Value" className="text-sm" />
                      </div>
                    </div>
                  </>
                )}

                {selectedStep.type === "type" && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-xs font-medium mb-2 block">
                        Type Conversion
                      </label>
                      <div className="space-y-2">
                        <select className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm">
                          <option>Text</option>
                          <option>Number</option>
                          <option>Date</option>
                          <option>Boolean</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
