import React, { useState, useEffect } from 'react';
import { ChartObject } from '../../types/documentState';
import { useDocumentState } from '../../contexts/DocumentStateContext';
import { X, Trash2, LineChart, BarChart3, PieChart, ScatterChart } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ChartFormattingPanelProps {
  chartId: string;
  sheetId: string;
  onClose: () => void;
}

export function ChartFormattingPanel({ chartId, sheetId, onClose }: ChartFormattingPanelProps) {
  const { state, dispatch } = useDocumentState();
  const sheet = state.sheets.find(s => s.sheetId === sheetId);
  const chart = sheet?.charts.find(c => c.id === chartId);

  const [localChart, setLocalChart] = useState<ChartObject | null>(chart || null);

  useEffect(() => {
    if (chart) {
      setLocalChart(chart);
    }
  }, [chart]);

  if (!localChart) return null;

  const updateChart = (updates: Partial<ChartObject>) => {
    const updated = { ...localChart, ...updates };
    setLocalChart(updated);
    
    dispatch({
      type: 'UPDATE_CHART',
      payload: {
        sheetId,
        chartId,
        updates
      }
    });
  };

  const updateOptions = (optionUpdates: Partial<ChartObject['options']>) => {
    updateChart({
      options: {
        ...localChart.options,
        ...optionUpdates
      }
    });
  };

  const handleDelete = () => {
    dispatch({
      type: 'REMOVE_CHART',
      payload: { sheetId, chartId }
    });
    onClose();
  };

  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'scatter', label: 'Scatter Chart', icon: ScatterChart }
  ];

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Chart Options</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Chart Type</Label>
          <Select 
            value={localChart.chartType} 
            onValueChange={(value: any) => updateChart({ chartType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartTypeOptions.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Chart Title</Label>
          <Input
            value={localChart.options.title || ''}
            onChange={(e) => updateOptions({ title: e.target.value })}
            placeholder="Enter chart title"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Legend</Label>
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Legend</span>
            <Switch
              checked={localChart.options.legend?.show !== false}
              onCheckedChange={(checked) => 
                updateOptions({ 
                  legend: { 
                    ...localChart.options.legend, 
                    show: checked,
                    position: localChart.options.legend?.position || 'bottom'
                  } 
                })
              }
            />
          </div>
          {localChart.options.legend?.show !== false && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Position</Label>
              <Select
                value={localChart.options.legend?.position || 'bottom'}
                onValueChange={(value: any) =>
                  updateOptions({ 
                    legend: { 
                      ...localChart.options.legend, 
                      show: true,
                      position: value 
                    } 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {localChart.chartType !== 'pie' && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium">X-Axis</Label>
              <div className="space-y-2">
                <Input
                  value={localChart.options.xAxis?.title || ''}
                  onChange={(e) => 
                    updateOptions({ 
                      xAxis: { 
                        ...localChart.options.xAxis, 
                        title: e.target.value 
                      } 
                    })
                  }
                  placeholder="X-axis label"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Gridlines</span>
                  <Switch
                    checked={localChart.options.xAxis?.showGridlines !== false}
                    onCheckedChange={(checked) =>
                      updateOptions({ 
                        xAxis: { 
                          ...localChart.options.xAxis, 
                          showGridlines: checked 
                        } 
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Y-Axis</Label>
              <div className="space-y-2">
                <Input
                  value={localChart.options.yAxis?.title || ''}
                  onChange={(e) => 
                    updateOptions({ 
                      yAxis: { 
                        ...localChart.options.yAxis, 
                        title: e.target.value 
                      } 
                    })
                  }
                  placeholder="Y-axis label"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Gridlines</span>
                  <Switch
                    checked={localChart.options.yAxis?.showGridlines !== false}
                    onCheckedChange={(checked) =>
                      updateOptions({ 
                        yAxis: { 
                          ...localChart.options.yAxis, 
                          showGridlines: checked 
                        } 
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">Data Range</Label>
          <Input
            value={localChart.dataRange}
            onChange={(e) => updateChart({ dataRange: e.target.value })}
            placeholder="e.g., A1:D5"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Size</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Width</Label>
              <Input
                type="number"
                value={localChart.width}
                onChange={(e) => updateChart({ width: parseInt(e.target.value) })}
                min={200}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Height</Label>
              <Input
                type="number"
                value={localChart.height}
                onChange={(e) => updateChart({ height: parseInt(e.target.value) })}
                min={150}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Position</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">X</Label>
              <Input
                type="number"
                value={localChart.x}
                onChange={(e) => updateChart({ x: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Y</Label>
              <Input
                type="number"
                value={localChart.y}
                onChange={(e) => updateChart({ y: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Chart
        </Button>
      </div>
    </div>
  );
}
