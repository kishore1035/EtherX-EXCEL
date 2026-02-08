import { useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  X,
  GripVertical,
  Plus,
  Table as TableIcon,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface PivotField {
  id: string;
  name: string;
  type: "dimension" | "measure";
}

interface AdvancedPivotTableBuilderProps {
  open: boolean;
  onClose: () => void;
}

export function AdvancedPivotTableBuilder({
  open,
  onClose,
}: AdvancedPivotTableBuilderProps) {
  const [availableFields] = useState<PivotField[]>([
    { id: "1", name: "Product", type: "dimension" },
    { id: "2", name: "Category", type: "dimension" },
    { id: "3", name: "Region", type: "dimension" },
    { id: "4", name: "Date", type: "dimension" },
    { id: "5", name: "Sales", type: "measure" },
    { id: "6", name: "Quantity", type: "measure" },
    { id: "7", name: "Profit", type: "measure" },
  ]);

  const [rowFields, setRowFields] = useState<PivotField[]>([
    { id: "1", name: "Product", type: "dimension" },
  ]);

  const [columnFields, setColumnFields] = useState<PivotField[]>([
    { id: "3", name: "Region", type: "dimension" },
  ]);

  const [valueFields, setValueFields] = useState<
    Array<PivotField & { aggregation: string }>
  >([{ id: "5", name: "Sales", type: "measure", aggregation: "Sum" }]);

  const [filterFields, setFilterFields] = useState<PivotField[]>([]);

  const handleDragStart = (e: React.DragEvent, field: PivotField) => {
    e.dataTransfer.setData("field", JSON.stringify(field));
  };

  const handleDrop = (
    e: React.DragEvent,
    area: "rows" | "columns" | "values" | "filters"
  ) => {
    e.preventDefault();
    const field = JSON.parse(e.dataTransfer.getData("field"));

    switch (area) {
      case "rows":
        if (!rowFields.find((f) => f.id === field.id)) {
          setRowFields([...rowFields, field]);
        }
        break;
      case "columns":
        if (!columnFields.find((f) => f.id === field.id)) {
          setColumnFields([...columnFields, field]);
        }
        break;
      case "values":
        if (!valueFields.find((f) => f.id === field.id)) {
          setValueFields([...valueFields, { ...field, aggregation: "Sum" }]);
        }
        break;
      case "filters":
        if (!filterFields.find((f) => f.id === field.id)) {
          setFilterFields([...filterFields, field]);
        }
        break;
    }
  };

  const removeField = (
    area: "rows" | "columns" | "values" | "filters",
    fieldId: string
  ) => {
    switch (area) {
      case "rows":
        setRowFields(rowFields.filter((f) => f.id !== fieldId));
        break;
      case "columns":
        setColumnFields(columnFields.filter((f) => f.id !== fieldId));
        break;
      case "values":
        setValueFields(valueFields.filter((f) => f.id !== fieldId));
        break;
      case "filters":
        setFilterFields(filterFields.filter((f) => f.id !== fieldId));
        break;
    }
  };

  if (!open) return null;

  const DropZone = ({
    title,
    fields,
    area,
    showAggregation = false,
  }: {
    title: string;
    fields: any[];
    area: "rows" | "columns" | "values" | "filters";
    showAggregation?: boolean;
  }) => (
    <div
      className="border-2 border-dashed border-border rounded-lg p-3 min-h-[100px]"
      onDrop={(e) => handleDrop(e, area)}
      onDragOver={(e) => e.preventDefault()}
    >
      <h4 className="text-xs font-medium text-muted-foreground mb-2">
        {title}
      </h4>
      <div className="space-y-2">
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Drag fields here
          </p>
        ) : (
          fields.map((field) => (
            <div
              key={field.id}
              className="flex items-center gap-2 bg-accent p-2 rounded group"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground cursor-move" />
              <Badge
                variant={field.type === "dimension" ? "default" : "secondary"}
                className="text-xs"
              >
                {field.name}
              </Badge>
              {showAggregation && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                      {field.aggregation}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Sum</DropdownMenuItem>
                    <DropdownMenuItem>Average</DropdownMenuItem>
                    <DropdownMenuItem>Count</DropdownMenuItem>
                    <DropdownMenuItem>Min</DropdownMenuItem>
                    <DropdownMenuItem>Max</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 ml-auto group-hover:opacity-100"
                onClick={() => removeField(area, field.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-card border-l border-border flex flex-col shadow-2xl z-50">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="w-5 h-5" />
          <h3 className="font-medium">PivotTable Builder</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Available Fields */}
      <div className="p-4 border-b border-border">
        <h4 className="text-sm font-medium mb-3">Available Fields</h4>
        <div className="space-y-1">
          {availableFields.map((field) => (
            <div
              key={field.id}
              draggable
              onDragStart={(e) => handleDragStart(e, field)}
              className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-move transition-colors"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
              <Badge
                variant={field.type === "dimension" ? "outline" : "secondary"}
                className="text-xs"
              >
                {field.name}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Drop Zones */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <DropZone title="Filters" fields={filterFields} area="filters" />
          <DropZone title="Rows" fields={rowFields} area="rows" />
          <DropZone title="Columns" fields={columnFields} area="columns" />
          <DropZone
            title="Values"
            fields={valueFields}
            area="values"
            showAggregation
          />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button className="w-full" onClick={onClose}>
          Create PivotTable
        </Button>
        <Button variant="outline" className="w-full">
          Reset All Fields
        </Button>
      </div>
    </div>
  );
}
