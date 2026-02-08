interface RibbonTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function RibbonTabs({ activeTab, onTabChange }: RibbonTabsProps) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'insert', label: 'Insert' },
    { id: 'formulas', label: 'Formulas' },
    { id: 'data', label: 'Data' },
    { id: 'view', label: 'View' },
  ];

  return (
    <div className="border-b bg-white border-gray-300">
      <div className="flex items-center h-10 px-1 sm:px-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-2 sm:px-4 py-2 text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-emerald-700 bg-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B8860B]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
