import { 
  SpellCheck,
  MessageSquare,
  Lock,
  Lightbulb,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface ReviewTabProps {}

export function ReviewTab({}: ReviewTabProps) {
  const buttonClass = 'hover:bg-gray-100 text-gray-900';

  return (
    <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-3 overflow-x-auto">


      {/* Comments Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Comments</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}>
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">New Comment</span>
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Delete
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Show/Hide
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Protect Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Protect</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}>
            <Lock className="w-5 h-5" />
            <span className="text-xs">Protect Sheet</span>
          </Button>
          <Button variant="ghost" size="sm" className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}>
            <Lock className="w-5 h-5" />
            <span className="text-xs">Protect Workbook</span>
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Insights Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Insights</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}>
            <Lightbulb className="w-5 h-5" />
            <span className="text-xs">Smart Lookup</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
