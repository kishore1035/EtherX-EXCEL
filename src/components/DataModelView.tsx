import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Database,
  Link2,
  Edit,
  Trash2,
  Plus,
  Table as TableIcon,
  Key,
} from "lucide-react";

interface DataTable {
  id: string;
  name: string;
  columns: Array<{ name: string; type: string; isPrimaryKey?: boolean }>;
  position: { x: number; y: number };
}

interface Relationship {
  id: string;
  from: string;
  to: string;
  fromColumn: string;
  toColumn: string;
  type: "one-to-many" | "one-to-one" | "many-to-many";
}

interface DataModelViewProps {
  open: boolean;
  onClose: () => void;
}

export function DataModelView({ open, onClose }: DataModelViewProps) {
  const [tables] = useState<DataTable[]>([
    {
      id: "table1",
      name: "Sales",
      columns: [
        { name: "SaleID", type: "Number", isPrimaryKey: true },
        { name: "ProductID", type: "Number" },
        { name: "Date", type: "Date" },
        { name: "Amount", type: "Currency" },
        { name: "CustomerID", type: "Number" },
      ],
      position: { x: 50, y: 100 },
    },
    {
      id: "table2",
      name: "Products",
      columns: [
        { name: "ProductID", type: "Number", isPrimaryKey: true },
        { name: "Name", type: "Text" },
        { name: "Category", type: "Text" },
        { name: "Price", type: "Currency" },
      ],
      position: { x: 400, y: 80 },
    },
    {
      id: "table3",
      name: "Customers",
      columns: [
        { name: "CustomerID", type: "Number", isPrimaryKey: true },
        { name: "Name", type: "Text" },
        { name: "Email", type: "Text" },
        { name: "Region", type: "Text" },
      ],
      position: { x: 400, y: 350 },
    },
  ]);

  const [relationships] = useState<Relationship[]>([
    {
      id: "rel1",
      from: "table1",
      to: "table2",
      fromColumn: "ProductID",
      toColumn: "ProductID",
      type: "one-to-many",
    },
    {
      id: "rel2",
      from: "table1",
      to: "table3",
      fromColumn: "CustomerID",
      toColumn: "CustomerID",
      type: "one-to-many",
    },
  ]);

  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(null);

  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case "one-to-many":
        return "1:∞";
      case "one-to-one":
        return "1:1";
      case "many-to-many":
        return "∞:∞";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Model
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 relative overflow-auto bg-accent/10 p-8">
            {/* SVG for relationships */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {relationships.map((rel) => {
                const fromTable = tables.find((t) => t.id === rel.from);
                const toTable = tables.find((t) => t.id === rel.to);
                if (!fromTable || !toTable) return null;

                const x1 = fromTable.position.x + 250;
                const y1 = fromTable.position.y + 100;
                const x2 = toTable.position.x;
                const y2 = toTable.position.y + 100;

                const isSelected = selectedRelationship === rel.id;

                return (
                  <g key={rel.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
                      strokeWidth={isSelected ? "3" : "2"}
                      markerEnd="url(#arrowhead)"
                      className="pointer-events-auto cursor-pointer"
                      onClick={() => setSelectedRelationship(rel.id)}
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 10}
                      fill="hsl(var(--primary))"
                      fontSize="12"
                      fontWeight="500"
                      className="pointer-events-none"
                    >
                      {getRelationshipLabel(rel.type)}
                    </text>
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="hsl(var(--border))"
                  />
                </marker>
              </defs>
            </svg>

            {/* Tables */}
            {tables.map((table) => (
              <div
                key={table.id}
                className="absolute bg-card border border-border rounded-lg shadow-lg w-[250px]"
                style={{
                  left: table.position.x,
                  top: table.position.y,
                }}
              >
                <div className="p-3 border-b border-border bg-accent/50 flex items-center justify-between rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4" />
                    <h4 className="font-medium text-sm">{table.name}</h4>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {table.columns.length} cols
                  </Badge>
                </div>
                <div className="divide-y divide-border">
                  {table.columns.map((column, index) => (
                    <div
                      key={index}
                      className="p-2 px-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {column.isPrimaryKey && (
                          <Key className="w-3 h-3 text-yellow-500" />
                        )}
                        <span className="text-sm">{column.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {column.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium mb-2">Relationships</h3>
              <p className="text-xs text-muted-foreground">
                Manage table relationships
              </p>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="p-4 space-y-3">
                {relationships.map((rel) => {
                  const fromTable = tables.find((t) => t.id === rel.from);
                  const toTable = tables.find((t) => t.id === rel.to);
                  if (!fromTable || !toTable) return null;

                  const isSelected = selectedRelationship === rel.id;

                  return (
                    <div
                      key={rel.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedRelationship(rel.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getRelationshipLabel(rel.type)}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="w-6 h-6">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-6 h-6">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">{fromTable.name}</span>
                          <span className="text-muted-foreground">
                            ({rel.fromColumn})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link2 className="w-3 h-3 text-muted-foreground" />
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">{toTable.name}</span>
                          <span className="text-muted-foreground">
                            ({rel.toColumn})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-border space-y-2">
              <Button className="w-full gap-2" variant="outline">
                <Plus className="w-4 h-4" />
                New Relationship
              </Button>
              <Button className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
