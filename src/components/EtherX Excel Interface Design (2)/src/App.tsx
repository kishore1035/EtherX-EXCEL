import { useState } from 'react';
import { Header } from './components/Header';
import { RibbonTabs } from './components/RibbonTabs';
import { HomeTab } from './components/ribbon/HomeTab';
import { InsertTab } from './components/ribbon/InsertTab';
import { FormulasTab } from './components/ribbon/FormulasTab';
import { DataTab } from './components/ribbon/DataTab';
import { ViewTab } from './components/ribbon/ViewTab';
import { FormulaBar } from './components/FormulaBar';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab isDarkMode={false} />;
      case 'insert':
        return <InsertTab />;
      case 'formulas':
        return <FormulasTab />;
      case 'data':
        return <DataTab />;
      case 'view':
        return <ViewTab />;
      default:
        return <HomeTab isDarkMode={false} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <RibbonTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="border-b border-gray-300 bg-white">
        {renderTabContent()}
      </div>
      <FormulaBar />
      <SpreadsheetGrid />
    </div>
  );
}
