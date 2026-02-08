import { 
  Sigma,
  FileText,
  Search,
  Calculator,
  ChevronDown
} from 'lucide-react';
import { Icon3D, IconButton3D } from '../ui/Icon3D';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface FormulasTabProps {}

export function FormulasTab({}: FormulasTabProps) {
  const buttonClass = 'hover:bg-gray-100 text-gray-900';

  return (
    <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-3 overflow-x-auto">
      {/* Function Library Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Function Library</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Insert Function
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            AutoSum
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Financial
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Logical
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Text
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Date & Time
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Defined Names Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Defined Names</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Name Manager
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Define Name
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Formula Auditing Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Formula Auditing</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Trace Precedents
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Trace Dependents
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Show Formulas
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Calculation Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Calculation</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Calculation Options
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Calculate Now
          </Button>
        </div>
      </div>
    </div>
  );
}
