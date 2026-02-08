import React from 'react';
import {
  FileText,
  Folder,
  Table,
  BarChart3,
  Zap,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Type,
  Paintbrush,
  DollarSign,
  Percent,
  Hash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  TrendingUp,
  Copy,
} from 'lucide-react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';

interface RibbonTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function RibbonTabs({ activeTab, onTabChange }: RibbonTabsProps): any {
  const { 
    toggleBold, 
    toggleItalic, 
    toggleUnderline, 
    setTextAlign,
    selectedCell,
    selectedRange 
  } = useSpreadsheet();
  const tabs = [
    { id: 'power-query', label: 'Power Query', icon: '🔌' },
    { id: 'data-model', label: 'Data Model', icon: '📊' },
    { id: 'pivot-table', label: 'PivotTable', icon: '📈' },
    { id: 'dashboard', label: 'Dashboard', icon: '📐' },
    { id: 'flash-fill', label: 'Flash Fill', icon: '✨' },
  ];

  const hasSelection = selectedCell !== null || selectedRange !== null;

  const toolbarIcons = [
    { icon: FileText, label: 'New', size: 'w-5 h-5', onClick: () => console.log('New') },
    { icon: Folder, label: 'Open', size: 'w-5 h-5', onClick: () => console.log('Open') },
    { icon: FileText, label: 'Save', size: 'w-5 h-5', onClick: () => console.log('Save') },
    { icon: Copy, label: 'Copy', size: 'w-5 h-5', onClick: () => console.log('Copy') },
    { icon: Undo2, label: 'Undo', size: 'w-5 h-5', onClick: () => console.log('Undo') },
    { icon: Redo2, label: 'Redo', size: 'w-5 h-5', onClick: () => console.log('Redo') },
    { icon: Bold, label: 'Bold (Ctrl+B)', size: 'w-5 h-5', onClick: toggleBold, disabled: !hasSelection },
    { icon: Italic, label: 'Italic (Ctrl+I)', size: 'w-5 h-5', onClick: toggleItalic, disabled: !hasSelection },
    { icon: Underline, label: 'Underline (Ctrl+U)', size: 'w-5 h-5', onClick: toggleUnderline, disabled: !hasSelection },
    { icon: Type, label: 'Text', size: 'w-5 h-5', onClick: () => console.log('Text') },
    { icon: Paintbrush, label: 'Format', size: 'w-5 h-5', onClick: () => console.log('Format') },
    { icon: DollarSign, label: 'Currency', size: 'w-5 h-5', onClick: () => console.log('Currency') },
    { icon: Percent, label: 'Percent', size: 'w-5 h-5', onClick: () => console.log('Percent') },
    { icon: Hash, label: 'Number', size: 'w-5 h-5', onClick: () => console.log('Number') },
    { icon: AlignLeft, label: 'Align Left', size: 'w-5 h-5', onClick: () => setTextAlign('left'), disabled: !hasSelection },
    { icon: AlignCenter, label: 'Align Center', size: 'w-5 h-5', onClick: () => setTextAlign('center'), disabled: !hasSelection },
    { icon: AlignRight, label: 'Align Right', size: 'w-5 h-5', onClick: () => setTextAlign('right'), disabled: !hasSelection },
    { icon: TrendingUp, label: 'Sort', size: 'w-5 h-5', onClick: () => console.log('Sort') },
    { icon: Copy, label: 'Duplicate', size: 'w-5 h-5', onClick: () => console.log('Duplicate') },
  ];

  return (
    <div className="bg-black/90 border-b border-gray-700">
      {/* Tab Navigation */}
      <div className="flex items-center h-12 px-4 gap-8 overflow-x-auto border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              border: activeTab === tab.id 
                ? '1px solid rgba(255, 215, 0, 0.4)' 
                : '1px solid rgba(255, 215, 0, 0.15)',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%)'
                : 'transparent',
              boxShadow: activeTab === tab.id
                ? '0 2px 8px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 1px 3px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px'
            }}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 relative whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300 hover:border-yellow-500/30'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar Icons */}
      <div className="flex items-center h-12 px-4 gap-2 overflow-x-auto">
        {toolbarIcons.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              style={{
                border: item.disabled 
                  ? '1px solid rgba(100, 100, 100, 0.2)' 
                  : '1px solid rgba(255, 215, 0, 0.2)',
                background: item.disabled
                  ? 'transparent'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 215, 0, 0.05) 100%)',
                boxShadow: item.disabled
                  ? 'none'
                  : '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                borderRadius: '6px'
              }}
              className={`p-2 transition-all duration-200 ${
                item.disabled 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/20'
              }`}
              title={item.label}
              onClick={item.onClick}
              disabled={item.disabled}
            >
              <Icon className={item.size} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
