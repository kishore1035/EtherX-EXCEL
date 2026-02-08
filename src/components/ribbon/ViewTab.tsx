import { 
  Layout,
  Grid,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Code,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useSpreadsheet } from '../../contexts/SpreadsheetContext';
import { useState } from 'react';

interface ViewTabProps {}

export function ViewTab({}: ViewTabProps) {
  const { 
    showGridlines, 
    setShowGridlines, 
    showFormulaBar, 
    setShowFormulaBar, 
    showHeadings, 
    setShowHeadings,
    zoomLevel,
    setZoomLevel,
    freezePanes,
    setFreezePanes,
    selectedCell,
    selectedRange
  } = useSpreadsheet();
  const [showFreezePanesMenu, setShowFreezePanesMenu] = useState(false);
  const buttonClass = 'hover:bg-gray-50 text-gray-900 border border-yellow-600/20 hover:border-yellow-600/40 shadow-sm';
  
  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 10, 200));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 10, 50));
  const handleZoomReset = () => setZoomLevel(100);
  
  const handleFreezePanes = () => {
    if (!selectedCell && !selectedRange) return;
    if (freezePanes) {
      setFreezePanes(null);
    } else {
      const row = selectedRange ? selectedRange.startRow : selectedCell!.row;
      const col = selectedRange ? selectedRange.startCol : selectedCell!.col;
      setFreezePanes({ row, col });
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="flex items-center justify-center gap-4 sm:gap-6 px-2 sm:px-4 py-3" style={{ transform: 'scale(0.75)', transformOrigin: 'center top' }}>
      {/* View features can be added here */}
      <div className="text-sm text-gray-500">View options will be available here</div>
    </div>
    </div>
  );
}
