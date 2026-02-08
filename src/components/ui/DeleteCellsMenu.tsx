import React, { useState } from 'react';
import { ArrowLeft, ArrowUp, Trash2, Minus, X } from 'lucide-react';
import FloatingDropdown from './FloatingDropdown';
import { Button } from './button';

interface DeleteCellsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

type DeleteAction = 'shift-left' | 'shift-up' | 'entire-row' | 'entire-column' | 'blank-rows';

export function DeleteCellsMenu({ isOpen, onClose, isDarkMode, triggerRef, anchorRect }: DeleteCellsMenuProps & { anchorRect: DOMRect | null }) {
  const [activeAction, setActiveAction] = useState<DeleteAction | null>(null);

  const menuItems = [
    {
      id: 'shift-left' as DeleteAction,
      label: 'Shift Cells Left',
      icon: <ArrowLeft className="w-4 h-4" />
    },
    {
      id: 'shift-up' as DeleteAction,
      label: 'Shift Cells Up',
      icon: <ArrowUp className="w-4 h-4" />
    },
    {
      id: 'entire-row' as DeleteAction,
      label: 'Entire Row',
      icon: <Minus className="w-4 h-4" />
    },
    {
      id: 'entire-column' as DeleteAction,
      label: 'Entire Column',
      icon: <Minus className="w-4 h-4 rotate-90" />
    },
    {
      id: 'blank-rows' as DeleteAction,
      label: 'Delete Blank Rows',
      icon: <Trash2 className="w-4 h-4" />
    }
  ];

  const handleItemClick = (action: DeleteAction) => {
    setActiveAction(action);
    // Here you would implement the actual delete logic
    console.log(`Delete action: ${action}`);
    onClose();
  };

  const itemClass = isDarkMode
    ? 'hover:bg-gray-700'
    : 'hover:bg-gray-50';

  const buttonClass = isDarkMode
    ? 'hover:bg-gray-700'
    : 'hover:bg-gray-50';

  if (!isOpen) return null;
  return (
    <FloatingDropdown
      anchorRect={anchorRect}
      onClose={onClose}
    >
      <div className="p-4 animate-in fade-in-0 zoom-in-95 duration-200">
        <h3 className="text-sm font-medium mb-3">
          🗑️ Delete Options
        </h3>
        
        <div className="space-y-1">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
              // ...existing code...
              onClick={() => handleItemClick(item.id)}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
        
        <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} mt-3 pt-3`}>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-center ${buttonClass}`}
            onClick={onClose}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </FloatingDropdown>
  );
}