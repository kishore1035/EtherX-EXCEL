import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { BarChart3, LineChart, PieChart } from 'lucide-react';

interface ChartTypePickerProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: 'column' | 'line' | 'pie') => void;
  isDarkMode?: boolean;
}

export function ChartTypePicker({ open, onClose, onSelectType, isDarkMode = false }: ChartTypePickerProps) {
  const chartTypes = [
    {
      type: 'column' as const,
      icon: BarChart3,
      title: 'Column Chart',
      description: 'Compare values across categories with vertical bars'
    },
    {
      type: 'line' as const,
      icon: LineChart,
      title: 'Line Chart',
      description: 'Show trends and changes over time with connected points'
    },
    {
      type: 'pie' as const,
      icon: PieChart,
      title: 'Pie Chart',
      description: 'Display proportions and percentages of a whole'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl"
        style={{
          background: isDarkMode ? '#000000' : '#FFFFFF',
          border: isDarkMode ? '2px solid #374151' : '2px solid #e5e7eb',
          color: isDarkMode ? '#FFFFFF' : '#000000'
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-center"
            // yellow accent logic is preserved, but text color is now controlled by CSS only
          >
            Choose Chart Type
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {chartTypes.map(({ type, icon: Icon, title, description }) => (
            <button
              key={type}
              onClick={() => {
                onSelectType(type);
                onClose();
              }}
              className="group p-6 rounded-lg border-2 transition-all hover:shadow-lg"
              style={{
                background: isDarkMode ? '#0a0a0a' : '#FFFFFF',
                borderColor: isDarkMode ? '#374151' : '#e5e7eb'
              }}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                  }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 
                  className="font-semibold"
                  // text color is now controlled by CSS only
                >
                  {title}
                </h3>
                <p 
                  className="text-xs"
                  // text color is now controlled by CSS only
                >
                  {description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center pt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
