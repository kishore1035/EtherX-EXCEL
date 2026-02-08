import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";

interface ChartDialogProps {
  open: boolean;
  onClose: () => void;
  cells: Map<string, any>;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export function ChartDialog({ open, onClose, cells }: ChartDialogProps) {
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [dataRange, setDataRange] = useState("A1:B5");

  const parseDataRange = () => {
    const data: any[] = [];
    const match = dataRange.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) return data;

    const startRow = parseInt(match[2]);
    const endRow = parseInt(match[4]);

    for (let row = startRow; row <= endRow; row++) {
      const labelCell = cells.get(`${match[1]}${row}`);
      const valueCell = cells.get(`${match[3]}${row}`);

      if (labelCell && valueCell) {
        data.push({
          name: labelCell.value || `Item ${row}`,
          value: parseFloat(valueCell.value) || 0,
        });
      }
    }

    return data;
  };

  const data = parseDataRange();

  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No data available. Please enter a valid range.
        </div>
      );
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Chart</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Chart Type</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  onClick={() => setChartType("bar")}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs">Bar</span>
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  onClick={() => setChartType("line")}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <LineChartIcon className="w-5 h-5" />
                  <span className="text-xs">Line</span>
                </Button>
                <Button
                  variant={chartType === "pie" ? "default" : "outline"}
                  onClick={() => setChartType("pie")}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <PieChartIcon className="w-5 h-5" />
                  <span className="text-xs">Pie</span>
                </Button>
              </div>
            </div>

            <div>
              <Label>Data Range</Label>
              <Input
                type="text"
                value={dataRange}
                onChange={(e) => setDataRange(e.target.value)}
                placeholder="e.g., A1:B5"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: LabelColumn:ValueColumn (e.g., A1:B5)
              </p>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 bg-card">
            {renderChart()}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
