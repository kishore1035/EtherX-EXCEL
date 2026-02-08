import { useState } from "react";
import { X, Search, Command, Keyboard } from "lucide-react";
import { Button } from "../ui/button";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

interface Shortcut {
  category: string;
  shortcuts: { keys: string; description: string }[];
}

export function KeyboardShortcutsModal({ isOpen, onClose, isDarkMode = false }: KeyboardShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const isWindows = navigator.platform.toLowerCase().includes('win');
  const cmdKey = isWindows ? 'Ctrl' : '⌘';

  const shortcuts: Shortcut[] = [
    {
      category: "General",
      shortcuts: [
        { keys: `${cmdKey} + S`, description: "Save spreadsheet" },
        { keys: `${cmdKey} + Z`, description: "Undo" },
        { keys: `${cmdKey} + Y`, description: "Redo" },
        { keys: `${cmdKey} + C`, description: "Copy" },
        { keys: `${cmdKey} + X`, description: "Cut" },
        { keys: `${cmdKey} + V`, description: "Paste" },
        { keys: `${cmdKey} + A`, description: "Select all" },
        { keys: `${cmdKey} + F`, description: "Find" },
        { keys: `${cmdKey} + H`, description: "Find and replace" },
        { keys: `${cmdKey} + P`, description: "Print" }
      ]
    },
    {
      category: "Navigation",
      shortcuts: [
        { keys: "Arrow Keys", description: "Move between cells" },
        { keys: "Tab", description: "Move to next cell" },
        { keys: "Shift + Tab", description: "Move to previous cell" },
        { keys: "Enter", description: "Move down one cell" },
        { keys: "Shift + Enter", description: "Move up one cell" },
        { keys: `${cmdKey} + Home`, description: "Go to cell A1" },
        { keys: `${cmdKey} + End`, description: "Go to last used cell" },
        { keys: "Page Up", description: "Move up one screen" },
        { keys: "Page Down", description: "Move down one screen" }
      ]
    },
    {
      category: "Cell Editing",
      shortcuts: [
        { keys: "F2", description: "Edit active cell" },
        { keys: "Esc", description: "Cancel cell editing" },
        { keys: "Delete", description: "Clear cell content" },
        { keys: `${cmdKey} + B`, description: "Bold" },
        { keys: `${cmdKey} + I`, description: "Italic" },
        { keys: `${cmdKey} + U`, description: "Underline" },
        { keys: "Alt + Enter", description: "Insert line break in cell" },
        { keys: `${cmdKey} + ;`, description: "Insert current date" },
        { keys: `${cmdKey} + Shift + ;`, description: "Insert current time" }
      ]
    },
    {
      category: "Selection",
      shortcuts: [
        { keys: "Shift + Arrow", description: "Extend selection" },
        { keys: `${cmdKey} + Shift + Arrow`, description: "Select to edge" },
        { keys: `${cmdKey} + Space`, description: "Select entire column" },
        { keys: "Shift + Space", description: "Select entire row" },
        { keys: `${cmdKey} + Shift + Space`, description: "Select all cells" }
      ]
    },
    {
      category: "Formulas",
      shortcuts: [
        { keys: "=", description: "Start formula" },
        { keys: "Alt + =", description: "AutoSum" },
        { keys: `${cmdKey} + '`, description: "Copy formula from above" },
        { keys: "F4", description: "Toggle absolute/relative references" },
        { keys: `${cmdKey} + Shift + U`, description: "Expand/collapse formula bar" }
      ]
    },
    {
      category: "Formatting",
      shortcuts: [
        { keys: `${cmdKey} + 1`, description: "Format cells dialog" },
        { keys: `${cmdKey} + Shift + $`, description: "Apply currency format" },
        { keys: `${cmdKey} + Shift + %`, description: "Apply percentage format" },
        { keys: `${cmdKey} + Shift + #`, description: "Apply date format" },
        { keys: `${cmdKey} + Shift + !`, description: "Apply number format" }
      ]
    },
    {
      category: "Rows & Columns",
      shortcuts: [
        { keys: `${cmdKey} + +`, description: "Insert row/column" },
        { keys: `${cmdKey} + -`, description: "Delete row/column" },
        { keys: "Alt + H + O + I", description: "Auto-fit column width" },
        { keys: "Alt + H + O + A", description: "Auto-fit row height" }
      ]
    }
  ];

  const filteredShortcuts = shortcuts.map(category => ({
    ...category,
    shortcuts: category.shortcuts.filter(s => 
      searchQuery === "" ||
      s.keys.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.shortcuts.length > 0);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {filteredShortcuts.length === 0 ? (
            <div className="text-center py-12">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                No shortcuts found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredShortcuts.map((category, idx) => (
                <div key={idx}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Command className="w-5 h-5 text-yellow-500" />
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut, sIdx) => (
                      <div
                        key={sIdx}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}
                      >
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {shortcut.description}
                        </span>
                        <kbd className={`px-3 py-1.5 rounded font-mono text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700 text-yellow-400 border border-gray-600' 
                            : 'bg-white text-gray-900 border border-gray-300 shadow-sm'
                        }`}>
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
