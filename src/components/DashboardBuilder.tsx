import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Plus,
  Settings,
  Trash2,
  GripVertical,
  Sliders,
} from "lucide-react";
import { Card } from "./ui/card";

interface Widget {
  id: string;
  type: "bar" | "line" | "pie" | "kpi";
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface DashboardBuilderProps {
  open: boolean;
  onClose: () => void;
}

export function DashboardBuilder({ open, onClose }: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "1",
      type: "kpi",
      title: "Total Sales",
      position: { x: 0, y: 0 },
      size: { width: 250, height: 150 },
    },
    {
      id: "2",
      type: "bar",
      title: "Sales by Region",
      position: { x: 270, y: 0 },
      size: { width: 400, height: 300 },
    },
    {
      id: "3",
      type: "line",
      title: "Monthly Trend",
      position: { x: 0, y: 170 },
      size: { width: 400, height: 300 },
    },
  ]);

  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [filters] = useState([
    { id: "1", name: "Region", values: ["North", "South", "East", "West"] },
    { id: "2", name: "Quarter", values: ["Q1", "Q2", "Q3", "Q4"] },
  ]);

  const widgetTypes = [
    { icon: BarChart3, type: "bar", label: "Bar Chart" },
    { icon: LineChart, type: "line", label: "Line Chart" },
    { icon: PieChart, type: "pie", label: "Pie Chart" },
    { icon: TrendingUp, type: "kpi", label: "KPI Card" },
  ];

  const addWidget = (type: string) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: type as any,
      title: `New ${type} Chart`,
      position: { x: 0, y: 0 },
      size: { width: 300, height: 250 },
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const renderWidget = (widget: Widget) => {
    return (
      <div
        key={widget.id}
        className={`absolute bg-card border rounded-lg shadow-sm cursor-move ${
          selectedWidget === widget.id ? "border-primary border-2" : "border-border"
        }`}
        style={{
          left: widget.position.x,
          top: widget.position.y,
          width: widget.size.width,
          height: widget.size.height,
        }}
        onClick={() => setSelectedWidget(widget.id)}
      >
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">{widget.title}</h4>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <Settings className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => removeWidget(widget.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="p-4 flex items-center justify-center h-[calc(100%-52px)]">
          {widget.type === "kpi" && (
            <div className="text-center">
              <p className="text-4xl font-bold">$125,430</p>
              <p className="text-sm text-muted-foreground mt-2">
                +12% from last month
              </p>
            </div>
          )}

          {widget.type === "bar" && (
            <div className="w-full h-full flex items-end justify-around gap-2 px-4">
              {[60, 85, 45, 95].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {["N", "S", "E", "W"][i]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {widget.type === "line" && (
            <div className="w-full h-full flex items-end justify-around px-4">
              <svg className="w-full h-full" viewBox="0 0 200 100">
                <polyline
                  points="0,80 50,50 100,60 150,20 200,40"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
                {[
                  [0, 80],
                  [50, 50],
                  [100, 60],
                  [150, 20],
                  [200, 40],
                ].map(([x, y], i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="hsl(var(--primary))"
                  />
                ))}
              </svg>
            </div>
          )}

          {widget.type === "pie" && (
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--chart-1))"
                strokeWidth="20"
                strokeDasharray="75 25"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--chart-2))"
                strokeWidth="20"
                strokeDasharray="25 75"
                strokeDashoffset="-75"
              />
            </svg>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Interactive Dashboard Builder
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 flex flex-col">
            {/* Filters Bar */}
            <div className="p-3 border-b border-border bg-accent/30 flex items-center gap-3">
              <Sliders className="w-4 h-4 text-muted-foreground" />
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filter.name}:
                  </span>
                  <select className="px-2 py-1 rounded border border-border bg-background text-sm">
                    <option>All</option>
                    {filter.values.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Dashboard Canvas */}
            <ScrollArea className="flex-1 p-8 bg-accent/10">
              <div className="relative min-h-[800px] min-w-[1000px]">
                {widgets.map((widget) => renderWidget(widget))}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium mb-2">Add Widget</h3>
              <p className="text-xs text-muted-foreground">
                Click to add to canvas
              </p>
            </div>

            <div className="p-4 grid grid-cols-2 gap-2">
              {widgetTypes.map((widget) => (
                <Button
                  key={widget.type}
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={() => addWidget(widget.type)}
                >
                  <widget.icon className="w-6 h-6" />
                  <span className="text-xs">{widget.label}</span>
                </Button>
              ))}
            </div>

            {selectedWidget && (
              <>
                <div className="p-4 border-t border-border">
                  <h3 className="text-sm font-medium mb-3">
                    Widget Properties
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Title
                      </label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 rounded border border-border bg-background text-sm"
                        value={
                          widgets.find((w) => w.id === selectedWidget)?.title
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">
                        Data Source
                      </label>
                      <select className="w-full mt-1 px-3 py-2 rounded border border-border bg-background text-sm">
                        <option>Sales Data</option>
                        <option>Product Data</option>
                        <option>Customer Data</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">
                        Color Scheme
                      </label>
                      <div className="flex gap-2 mt-2">
                        <div className="w-8 h-8 rounded border border-border" style={{background: '#FFFACD'}} />
                        <div className="w-8 h-8 rounded border border-border" style={{background: '#FFD700'}} />
                        <div className="w-8 h-8 rounded border border-border" style={{background: '#FFA500'}} />
                        <div className="w-8 h-8 rounded border border-border" style={{background: '#B8860B'}} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-auto p-4 border-t border-border space-y-2">
              <Button className="w-full" onClick={onClose}>
                Save Dashboard
              </Button>
              <Button variant="outline" className="w-full">
                Preview
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
