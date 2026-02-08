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

interface ViewTabProps {}

export function ViewTab({}: ViewTabProps) {
  const buttonClass = 'hover:bg-gray-100 text-gray-900';

  return (
    <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-3 overflow-x-auto">
      {/* Workbook Views Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Workbook Views</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}>
            <Layout className="w-5 h-5" />
            <span className="text-xs">Normal</span>
          </Button>
          <Button variant="ghost" size="sm" className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}>
            <Layout className="w-5 h-5" />
            <span className="text-xs">Page Layout</span>
          </Button>
          <Button variant="ghost" size="sm" className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}>
            <Eye className="w-5 h-5" />
            <span className="text-xs">Page Break</span>
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Show Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Show</div>
        <div className="flex items-center gap-1">
          <label className="flex items-center gap-1 text-xs cursor-pointer text-gray-900">
            <input type="checkbox" className="w-3 h-3" defaultChecked={true} />
            <span>Gridlines</span>
          </label>
          <label className="flex items-center gap-1 text-xs cursor-pointer ml-2 text-gray-900">
            <input type="checkbox" className="w-3 h-3" defaultChecked={true} />
            <span>Formula Bar</span>
          </label>
          <label className="flex items-center gap-1 text-xs cursor-pointer ml-2 text-gray-900">
            <input type="checkbox" className="w-3 h-3" defaultChecked />
            <span>Headings</span>
          </label>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Zoom Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Zoom</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            <ZoomIn className="w-3 h-3 mr-1" />
            Zoom
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            100%
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Window Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Window</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            New Window
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Freeze Panes
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Split
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Macros Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Macros</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}>
            <Code className="w-5 h-5" />
            <span className="text-xs">View Macros</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
