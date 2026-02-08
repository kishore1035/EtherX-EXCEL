import { 
  Download,
  ArrowUpDown,
  Filter,
  Database,
  TrendingUp,
  ChevronDown,
  SpellCheck
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useRef, useState } from 'react';
import { SortDropdown } from '../ui/SortDropdown';

interface DataTabProps {}

export function DataTab({}: DataTabProps) {
  const buttonClass = 'hover:bg-gray-100 text-gray-900';
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const isDarkMode = false; // TODO: wire up dark mode if needed

  const handleSortAction = (option: string) => {
    // TODO: Implement sort logic via context or callback
    window.dispatchEvent(new CustomEvent('spreadsheet-sort', { detail: { option } }));
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-3 overflow-x-auto">
      {/* Get & Transform Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Get & Transform</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            <Download className="w-3 h-3 mr-1" />
            Get Data
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            From Table/Range
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Proofing Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Proofing</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}>
            <SpellCheck className="w-5 h-5" />
            <span className="text-xs">Spelling</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Sort & Filter</div>
        <div className="flex items-center gap-1">
          <Button
            ref={sortButtonRef}
            variant="ghost"
            size="sm"
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
            onClick={() => setSortDropdownOpen(true)}
          >
            <ArrowUpDown className="w-5 h-5" />
            <span className="text-xs">Sort</span>
          </Button>
          <SortDropdown
            isOpen={sortDropdownOpen}
            onClose={() => setSortDropdownOpen(false)}
            onAction={handleSortAction}
            isDarkMode={isDarkMode}
            triggerRef={sortButtonRef}
          />
          <Button variant="ghost" size="sm" className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}>
            <Filter className="w-5 h-5" />
            <span className="text-xs">Filter</span>
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Clear
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Data Tools Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Data Tools</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Text to Columns
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Remove Duplicates
          </Button>
          <Button variant="ghost" size="sm" className={`h-7 px-2 sm:px-3 text-xs ${buttonClass}`}>
            Data Validation
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

    </div>
  );
}
