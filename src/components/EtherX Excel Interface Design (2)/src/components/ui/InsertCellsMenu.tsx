import React, { useState } from 'react';
import { ArrowRight, ArrowDown, RowsIcon, Columns, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

interface InsertCellsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

type InsertAction = 'shift-right' | 'shift-down' | 'row-above' | 'row-below' | 'col-left' | 'col-right';

export function InsertCellsMenu({ isOpen, onClose, isDarkMode, triggerRef }: InsertCellsMenuProps) {
  const [appliedActions, setAppliedActions] = useState<Set<InsertAction>>(new Set());
  const [counts, setCounts] = useState({ 'row-above': 1, 'row-below': 1, 'col-left': 1, 'col-right': 1 });

  const menuItems = [
    { id: 'shift-right' as InsertAction, label: 'Shift Cells Right', icon: <ArrowRight className="w-5 h-5 text-blue-500" /> },
    { id: 'shift-down' as InsertAction, label: 'Shift Cells Down', icon: <ArrowDown className="w-5 h-5 text-blue-500" /> },
    { id: 'row-above' as InsertAction, label: 'Insert Row Above', icon: <RowsIcon className="w-5 h-5 text-green-600" />, hasCount: true },
    { id: 'row-below' as InsertAction, label: 'Insert Row Below', icon: <RowsIcon className="w-5 h-5 text-green-600" />, hasCount: true },
    { id: 'col-left' as InsertAction, label: 'Insert Column Left', icon: <Columns className="w-5 h-5 text-purple-600" />, hasCount: true },
    { id: 'col-right' as InsertAction, label: 'Insert Column Right', icon: <Columns className="w-5 h-5 text-purple-600" />, hasCount: true },
  ];

  const handleAction = (action: InsertAction) => {
    setAppliedActions(new Set([...appliedActions, action]));
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999]">
      {/* Blurred Background */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm ${isDarkMode ? 'bg-black/40' : 'bg-black/30'}`}
        onClick={onClose}
      />
      
      {/* Centered Modal */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className={`pointer-events-auto rounded-lg shadow-2xl border ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          } p-6 w-96`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Insert Cells
            </h2>
            <button
              onClick={onClose}
              className={`text-2xl leading-none ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ×
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {menuItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <button
                  onClick={() => handleAction(item.id)}
                  className={`flex-1 flex items-center gap-3 px-4 py-2 rounded transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-800 text-gray-200'
                      : 'hover:bg-blue-50 text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </button>
                {item.hasCount && (
                  <div className="flex items-center gap-1 ml-2">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={counts[item.id as keyof typeof counts]}
                      onChange={(e) => setCounts({ ...counts, [item.id]: Math.max(1, Math.min(999, parseInt(e.target.value) || 1)) })}
                      className={`w-14 px-2 py-1 text-xs rounded border text-center ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                )}
                {appliedActions.has(item.id) && (
                  <Check className="w-4 h-4 text-green-500 ml-2" />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}