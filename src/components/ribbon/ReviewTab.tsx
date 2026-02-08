import { 
  SpellCheck,
  MessageSquare,
  Lock,
  Unlock,
  Shield,
  ShieldOff,
  Lightbulb,
  ChevronDown
} from 'lucide-react';
import { Icon3D, IconButton3D } from '../ui/Icon3D';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useState } from 'react';
import { useDocumentState } from '../../contexts/DocumentStateContext';
import { useSpreadsheet } from '../../contexts/SpreadsheetContext';
import { toast } from 'sonner';

interface ReviewTabProps {}

export function ReviewTab({}: ReviewTabProps) {
  const buttonClass = 'hover:bg-gray-50 text-gray-900 border border-yellow-600/20 hover:border-yellow-600/40 shadow-sm';
  const { protectSheet, lockCells, isSheetProtected, isCellLocked } = useDocumentState();
  const { selectedCell, selectedRange, getCellKey } = useSpreadsheet();
  const [showProtectDialog, setShowProtectDialog] = useState(false);
  const [password, setPassword] = useState('');

  const activeSheetId = (window as any).__activeSheetId || 'default';
  const sheetProtected = isSheetProtected(activeSheetId);

  const handleProtectSheet = () => {
    if (sheetProtected) {
      protectSheet(activeSheetId, false);
      toast.success('Sheet protection removed');
    } else {
      setShowProtectDialog(true);
    }
  };

  const confirmProtection = () => {
    protectSheet(activeSheetId, true, password || undefined);
    setShowProtectDialog(false);
    setPassword('');
    toast.success('Sheet protected');
  };

  const handleLockCells = () => {
    if (!selectedCell && !selectedRange) {
      toast.error('Please select cell(s) to lock');
      return;
    }

    const cellKeys: string[] = [];

    if (selectedRange) {
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          cellKeys.push(getCellKey(row, col));
        }
      }
    } else if (selectedCell) {
      cellKeys.push(getCellKey(selectedCell.row, selectedCell.col));
    }

    lockCells(activeSheetId, cellKeys, true);
    toast.success(`Locked ${cellKeys.length} cell(s)`);
  };

  const handleUnlockCells = () => {
    if (!selectedCell && !selectedRange) {
      toast.error('Please select cell(s) to unlock');
      return;
    }

    const cellKeys: string[] = [];

    if (selectedRange) {
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          cellKeys.push(getCellKey(row, col));
        }
      }
    } else if (selectedCell) {
      cellKeys.push(getCellKey(selectedCell.row, selectedCell.col));
    }

    lockCells(activeSheetId, cellKeys, false);
    toast.success(`Unlocked ${cellKeys.length} cell(s)`);
  };

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
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass} ${sheetProtected ? 'bg-red-50' : ''}`}
            onClick={handleProtectSheet}
          >
            {sheetProtected ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            <span className="text-xs">{sheetProtected ? 'Unprotect' : 'Protect'} Sheet</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
            onClick={handleLockCells}
          >
            <Lock className="w-5 h-5" />
            <span className="text-xs">Lock Cells</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
            onClick={handleUnlockCells}
          >
            <Unlock className="w-5 h-5" />
            <span className="text-xs">Unlock Cells</span>
          </Button>
        </div>
      </div>

      {/* Protection Dialog */}
      {showProtectDialog && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowProtectDialog(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Protect Sheet</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add password protection to prevent unauthorized changes to this sheet.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowProtectDialog(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmProtection}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Protect
              </button>
            </div>
          </div>
        </div>
      )}

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
