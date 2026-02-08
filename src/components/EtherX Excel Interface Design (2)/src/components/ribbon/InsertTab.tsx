import React, { useState } from 'react';
import { SymbolInsertDropdown } from '../ui/SymbolInsertDropdown';
import { 
  Table, 
  Image, 
  Shapes,
  BarChart3,
  Link,
  Type,
  Hash
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useSpreadsheet } from '../../contexts/SpreadsheetContext';
import FloatingDropdown from '../ui/FloatingDropdown';

interface InsertTabProps {}

export function InsertTab({}: InsertTabProps) {
  const { selectedCell, setFloatingImages, setFloatingCharts, setCellData, getCellKey, setCellFormats, setIsTextBoxMode } = useSpreadsheet();
  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);
  const [linkAnchorRect, setLinkAnchorRect] = useState<DOMRect | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDisplayText, setLinkDisplayText] = useState('');
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);
  const [symbolAnchorRect, setSymbolAnchorRect] = useState<DOMRect | null>(null);
  
  const openDropdown = (type: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log(`Opening ${type} dropdown`);
  };
  
  const buttonClass = 'hover:bg-gray-100 text-gray-900';

  const handleInsertTable = (rows: number, cols: number) => {
    if (!selectedCell) return;
    
    const startRow = selectedCell.row;
    const startCol = selectedCell.col;
    
    setCellData(prev => {
      const newData = { ...prev };
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellKey = getCellKey(startRow + r, startCol + c);
          if (r === 0) {
            newData[cellKey] = `Header ${c + 1}`;
          } else {
            newData[cellKey] = `Row ${r} Col ${c + 1}`;
          }
        }
      }
      
      return newData;
    });
  };

  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          const newImage = {
            id: Date.now().toString(),
            src: imageUrl,
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1
          };
          setFloatingImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleInsertChart = (chartType: 'column' | 'line' | 'pie') => {
    const defaultData = [
      { label: 'Q1', value: 30 },
      { label: 'Q2', value: 45 },
      { label: 'Q3', value: 35 },
      { label: 'Q4', value: 50 }
    ];
    
    // Add sample data to cells A1:B4
    setCellData(prev => ({
      ...prev,
      'A1': 'Q1', 'B1': '30',
      'A2': 'Q2', 'B2': '45', 
      'A3': 'Q3', 'B3': '35',
      'A4': 'Q4', 'B4': '50'
    }));
    
    const newChart = {
      id: Date.now().toString(),
      type: chartType,
      x: 200,
      y: 200,
      width: 300,
      height: 200,
      data: defaultData,
      dataRange: 'A1:B4'
    };
    setFloatingCharts(prev => [...prev, newChart]);
  };

  const handleInsertLink = (url: string, displayText: string) => {
    if (!selectedCell) return;
    
    const cellKey = getCellKey(selectedCell.row, selectedCell.col);
    setCellData(prev => ({ ...prev, [cellKey]: displayText }));
    setCellFormats(prev => ({
      ...prev,
      [cellKey]: {
        ...prev[cellKey],
        isLink: true,
        linkUrl: url,
        color: '#0066cc',
        textDecoration: 'underline'
      }
    }));
  };

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-3 overflow-x-auto">
      {/* Tables Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Tables</div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => openDropdown("insert", e)}
            className="px-2 py-1 hover:bg-gray-100 rounded"
          >
            Insert ▼
          </button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Illustrations Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Illustrations</div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
            onClick={handleInsertImage}
          >
            <Image className="w-5 h-5" />
            <span className="text-xs">Pictures</span>
          </Button>
          <button
            onClick={(e) => openDropdown("delete", e)}
            className="px-2 py-1 hover:bg-gray-100 rounded"
          >
            Shapes ▼
          </button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Charts Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Charts</div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
            onClick={() => handleInsertChart('column')}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Column</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
            onClick={() => handleInsertChart('line')}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Line</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
            onClick={() => handleInsertChart('pie')}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Pie</span>
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Links Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Links</div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
            onClick={(e: React.MouseEvent) => {
              if (!selectedCell) return;
              setIsLinkDropdownOpen(true);
              setLinkAnchorRect((e.target as HTMLElement).getBoundingClientRect());
            }}
            disabled={!selectedCell}
          >
            <Link className="w-5 h-5" />
            <span className="text-xs">Link</span>
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Text Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Text</div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
            onClick={() => setIsTextBoxMode(true)}
          >
            <Type className="w-5 h-5" />
            <span className="text-xs">Text Box</span>
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Symbols Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-600 mb-1">Symbols</div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
            onClick={(e: React.MouseEvent) => {
              if (!selectedCell) return;
              setIsSymbolDropdownOpen(true);
              setSymbolAnchorRect((e.target as HTMLElement).getBoundingClientRect());
            }}
            disabled={!selectedCell}
          >
            <Hash className="w-5 h-5" />
            <span className="text-xs">Symbols</span>
          </Button>
        </div>
      </div>
        {/* Symbol Insert Dropdown */}
        {isSymbolDropdownOpen && (
          <FloatingDropdown anchorRect={symbolAnchorRect} onClose={() => setIsSymbolDropdownOpen(false)}>
            <SymbolInsertDropdown isOpen={isSymbolDropdownOpen} onClose={() => setIsSymbolDropdownOpen(false)} />
          </FloatingDropdown>
        )}
      

      </div>
      {isLinkDropdownOpen && (
        <FloatingDropdown anchorRect={linkAnchorRect} onClose={() => setIsLinkDropdownOpen(false)}>
          <div className="px-4 py-2 w-64">
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1 text-gray-700">URL or File Path</label>
              <input
                type="text"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://example.com or C:\path\to\file"
                className="w-full px-2 py-1 border rounded text-sm border-gray-300 focus:border-blue-400 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1 text-gray-700">Display Text (Optional)</label>
              <input
                type="text"
                value={linkDisplayText}
                onChange={e => setLinkDisplayText(e.target.value)}
                placeholder="Text to display in cell"
                className="w-full px-2 py-1 border rounded text-sm border-gray-300 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsLinkDropdownOpen(false);
                  setLinkUrl('');
                  setLinkDisplayText('');
                }}
                className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!linkUrl.trim()) return;
                  handleInsertLink(linkUrl.trim(), linkDisplayText.trim() || linkUrl.trim());
                  setIsLinkDropdownOpen(false);
                  setLinkUrl('');
                  setLinkDisplayText('');
                }}
                className={`px-3 py-1 rounded text-sm font-bold bg-black text-white hover:bg-gray-900 border border-black shadow`}
                disabled={!linkUrl.trim()}
                style={{ opacity: linkUrl.trim() ? 1 : 0.5, pointerEvents: 'auto' }}
              >
                Insert Link
              </button>
            </div>
          </div>
        </FloatingDropdown>
      )}
    </>
  );
}