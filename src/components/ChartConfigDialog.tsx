import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { TableData, ChartConfiguration, validateChartConfig, getColumnTypes } from '../utils/chartDataProcessor';
import { AlertCircle } from 'lucide-react';

interface ChartConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: ChartConfiguration) => void;
  table: TableData | null;
  chartType: 'column' | 'line' | 'pie' | null;
  isDarkMode?: boolean;
}

export function ChartConfigDialog({ 
  open, 
  onClose, 
  onConfirm, 
  table, 
  chartType,
  isDarkMode = false 
}: ChartConfigDialogProps) {
  const [config, setConfig] = useState<ChartConfiguration>({
    chartType: chartType || 'column',
    title: '',
    showLegend: true,
    showDataLabels: false
  });
  const [error, setError] = useState<string | null>(null);
  const [columnTypes, setColumnTypes] = useState<Record<string, 'numeric' | 'text'>>({});

  useEffect(() => {
    if (table && chartType) {
      const types = getColumnTypes(table);
      console.log('Column types detected:', types);
      console.log('Table columns:', table.columns);
      setColumnTypes(types);
      setConfig(prev => ({
        ...prev,
        chartType,
        title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
      }));
    }
  }, [table, chartType]);

  const handleConfirm = () => {
    const validationError = validateChartConfig(config);
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(config);
    onClose();
  };

  if (!table || !chartType) return null;

  const isPieChart = chartType === 'pie';
  const textColumns = table.columns.filter(col => columnTypes[col] === 'text');
  const numericColumns = table.columns.filter(col => columnTypes[col] === 'numeric');
  
  // Fallback: if no columns detected, show all columns in both lists
  const categoryOptions = textColumns.length > 0 ? textColumns : table.columns;
  const valueOptions = numericColumns.length > 0 ? numericColumns : table.columns;
  
  console.log('Category options:', categoryOptions);
  console.log('Value options:', valueOptions);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg"
        style={{
          background: isDarkMode ? '#000000' : '#FFFFFF',
          border: isDarkMode ? '2px solid #374151' : '2px solid #e5e7eb',
          color: isDarkMode ? '#FFFFFF' : '#000000'
        }}
      >
        <DialogHeader>
          <DialogTitle 
            // yellow accent logic is preserved, but text color is now controlled by CSS only
          >
            Configure {chartType ? (chartType.charAt(0).toUpperCase() + chartType.slice(1)) : ''} Chart
          </DialogTitle>
          <DialogDescription>
            Configure the data and appearance of your chart
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Chart Title */}
          <div className="space-y-2">
            <Label 
              htmlFor="title"
              // text color is now controlled by CSS only
            >
              Chart Title
            </Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter chart title"
              style={{
                background: isDarkMode ? '#0a0a0a' : '#FFFFFF',
                borderColor: isDarkMode ? '#374151' : '#d1d5db',
                color: isDarkMode ? '#FFFFFF' : '#000000'
              }}
            />
          </div>

          {isPieChart ? (
            <>
              {/* Category Column (Pie) */}
              <div className="space-y-2">
                <Label 
                  htmlFor="categoryColumn"
                  // text color is now controlled by CSS only
                >
                  Category Column (Labels)
                </Label>
                <Select
                  value={config.categoryColumn}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, categoryColumn: value }))}
                >
                  <SelectTrigger
                    style={{
                      background: isDarkMode ? '#0a0a0a' : '#FFFFFF',
                      borderColor: isDarkMode ? '#374151' : '#d1d5db',
                      color: isDarkMode ? '#FFFFFF' : '#000000'
                    }}
                  >
                    <SelectValue placeholder="Select category column" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: isDarkMode ? '#0a0a0a' : '#FFFFFF',
                      borderColor: isDarkMode ? '#374151' : '#d1d5db',
                      zIndex: 9999
                    }}
                  >
                    {categoryOptions.map(col => (
                      <SelectItem 
                        key={col} 
                        value={col}
                        // text color is now controlled by CSS only
                      >
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value Column (Pie) */}
              <div className="space-y-2">
                <Label 
                  htmlFor="valueColumn"
                  // text color is now controlled by CSS only
                >
                  Value Column (Numbers)
                </Label>
                <Select
                  value={config.valueColumn}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, valueColumn: value }))}
                >
                  <SelectTrigger
                    style={{
                      background: isDarkMode ? '#0a0a0a' : '#FFFFFF',
                      borderColor: isDarkMode ? '#374151' : '#d1d5db',
                      color: isDarkMode ? '#FFFFFF' : '#000000'
                    }}
                  >
                    <SelectValue placeholder="Select value column" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: isDarkMode ? '#0a0a0a' : '#FFFFFF',
                      borderColor: isDarkMode ? '#374151' : '#d1d5db',
                      zIndex: 9999
                    }}
                  >
                    {valueOptions.map(col => (
                      <SelectItem 
                        key={col} 
                        value={col}
                        // text color is now controlled by CSS only
                      >
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              {/* X-Axis Column (Column/Line) */}
              <div className="space-y-2">
                <Label 
                  htmlFor="xAxisColumn"
                  // text color is now controlled by CSS only
                >
                  X-Axis Column
                </Label>
                <Select
                  value={config.xAxisColumn}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, xAxisColumn: value }))}
                >
                  <SelectTrigger
                    style={{
                      background: isDarkMode ? '#0a0a0a' : '#FFFFFF',
                      borderColor: isDarkMode ? '#374151' : '#d1d5db',
                      color: isDarkMode ? '#FFFFFF' : '#000000'
                    }}
                  >
                    <SelectValue placeholder="Select X-axis column" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: isDarkMode ? '#0a0a0a' : '#FFFFFF',
                      borderColor: isDarkMode ? '#374151' : '#d1d5db',
                      zIndex: 9999
                    }}
                  >
                    {table.columns.map(col => (
                      <SelectItem 
                        key={col} 
                        value={col}
                        // text color is now controlled by CSS only
                      >
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Y-Axis Columns (Column/Line) */}
              <div className="space-y-2">
                <Label 
                  style={{ color: isDarkMode ? '#CCCCCC' : '#374151' }}
                >
                  Y-Axis Columns (Select one or more)
                </Label>
                <div 
                  className="space-y-2 p-3 rounded-lg border"
                  style={{
                    background: isDarkMode ? '#0a0a0a' : '#f9fafb',
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                  }}
                >
                  {numericColumns.map(col => (
                    <div key={col} className="flex items-center space-x-2">
                      <Checkbox
                        id={`y-${col}`}
                        checked={config.yAxisColumns?.includes(col)}
                        onCheckedChange={(checked) => {
                          setConfig(prev => {
                            const current = prev.yAxisColumns || [];
                            if (checked) {
                              return { ...prev, yAxisColumns: [...current, col] };
                            } else {
                              return { ...prev, yAxisColumns: current.filter(c => c !== col) };
                            }
                          });
                        }}
                      />
                      <Label 
                        htmlFor={`y-${col}`}
                        style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
                        className="cursor-pointer"
                      >
                        {col}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Options */}
          <div className="space-y-3 pt-4 border-t" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showLegend"
                checked={config.showLegend}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showLegend: Boolean(checked) }))}
              />
              <Label 
                htmlFor="showLegend"
                // text color is now controlled by CSS only
                className="cursor-pointer"
              >
                Show Legend
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showDataLabels"
                checked={config.showDataLabels}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showDataLabels: Boolean(checked) }))}
              />
              <Label 
                htmlFor="showDataLabels"
                // text color is now controlled by CSS only
                className="cursor-pointer"
              >
                Show Data Labels
              </Label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#EF4444',
                color: '#EF4444'
              }}
            >
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              style={{
                borderColor: isDarkMode ? '#374151' : '#d1d5db',
                color: isDarkMode ? '#CCCCCC' : '#374151'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#FFFFFF'
              }}
            >
              Create Chart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
