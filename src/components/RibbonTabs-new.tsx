import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { Info } from 'lucide-react';

interface RibbonTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode?: boolean;
}

export function RibbonTabs({ activeTab, onTabChange, isDarkMode = false }: RibbonTabsProps) {
  const { inputMessage } = useSpreadsheet();
  const tabs = [
    { id: 'home', label: 'Home', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20C20 20.5523 19.5523 21 19 21ZM6 19H18V9.15745L12 3.7029L6 9.15745V19ZM8 15H16V17H8V15Z"></path></svg> },
    { id: 'insert', label: 'Insert', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 11V8L16 12L12 16V13H8V11H12ZM12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20Z"></path></svg> },
    { id: 'help', label: 'Help', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"></path></svg> },
  ];

  return (
    <div 
      className="border-b" 
      style={{
        background: isDarkMode ? '#000000' : '#FFFFFF',
        borderColor: isDarkMode ? '#374151' : '#d1d5db'
      }}
    >
      <div className="flex items-center h-10 px-1 sm:px-2 overflow-x-auto gap-2 justify-center">
        {/* Left side - Tabs */}
        <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="px-4 py-2 text-sm transition-colors relative whitespace-nowrap ribbon-tab-button flex items-center gap-1.5 min-w-[90px] justify-center"
            style={{
              color: activeTab === tab.id 
                ? (isDarkMode ? '#FFD700' : '#047857')
                : (isDarkMode ? '#CCCCCC' : '#374151'),
              background: activeTab === tab.id
                ? (isDarkMode ? '#1a1a1a' : '#FFFFFF')
                : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = isDarkMode ? '#0a0a0a' : '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            aria-pressed={activeTab === tab.id}
          >
            {tab.icon && tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5" 
                style={{ background: isDarkMode ? '#FFD700' : '#B8860B' }}
              />
            )}
          </button>
        ))}
        </div>
        
        {/* Right side - Input Message */}
        {inputMessage && (
          <div
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 100%)',
              border: '2px solid #000000',
              maxWidth: '400px',
            }}
          >
            <Info className="w-3.5 h-3.5 flex-shrink-0 text-black" />
            <div className="flex-1 min-w-0 overflow-hidden">
              {inputMessage.title && (
                <span className="font-semibold text-sm text-black mr-1">
                  {inputMessage.title}:
                </span>
              )}
              {inputMessage.message && (
                <span className="text-sm text-black">
                  {inputMessage.message}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
