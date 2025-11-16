import React, { useState } from 'react';
import { User, Translations, AppPage } from '../types';
import Dashboard from './Dashboard';
import UploadVideo from './UploadVideo';
import SellItem from './SellItem';
import HomePage from './HomePage';
import VideoPage from './VideoPage';
import MarketplacePage from './MarketplacePage';
import ItemPage from './ItemPage';
import { LayoutDashboard, Video as VideoIcon, Tag, Home, ShoppingCart } from 'lucide-react';

interface MainAppProps {
  user: User;
  translations: Translations;
}

const MainApp: React.FC<MainAppProps> = ({ user, translations }) => {
  const [currentPage, setCurrentPage] = useState<AppPage>(AppPage.Dashboard);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
    setCurrentPage(AppPage.VideoPage);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentPage(AppPage.ItemPage);
  };

  const navigateTo = (page: AppPage) => {
    setSelectedVideoId(null);
    setSelectedItemId(null);
    setCurrentPage(page);
  }

  const renderPage = () => {
    switch (currentPage) {
      case AppPage.Home:
        return <HomePage translations={translations} onVideoSelect={handleVideoSelect} user={user} />;
      case AppPage.Marketplace:
        return <MarketplacePage translations={translations} onItemSelect={handleItemSelect} user={user} />;
      case AppPage.Upload:
        return <UploadVideo user={user} translations={translations} onUploadSuccess={handleVideoSelect} />;
      case AppPage.Sell:
        return <SellItem user={user} translations={translations} onSellSuccess={() => navigateTo(AppPage.Dashboard)} />;
      case AppPage.VideoPage:
        if (selectedVideoId) {
          return <VideoPage videoId={selectedVideoId} user={user} translations={translations} onBack={() => navigateTo(AppPage.Home)} />;
        }
        return <HomePage translations={translations} onVideoSelect={handleVideoSelect} user={user} />;
      case AppPage.ItemPage:
        if (selectedItemId) {
          return <ItemPage itemId={selectedItemId} user={user} translations={translations} onBack={() => navigateTo(AppPage.Marketplace)} />;
        }
        return <MarketplacePage translations={translations} onItemSelect={handleItemSelect} user={user} />;
      case AppPage.Dashboard:
      default:
        return <Dashboard user={user} translations={translations} onVideoSelect={handleVideoSelect} onItemSelect={handleItemSelect} />;
    }
  };

  const NavItem = ({ page, label, icon }: { page: AppPage; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => navigateTo(page)}
      className={`flex items-center space-x-3 w-full text-left p-3 rounded-lg transition-colors ${
        currentPage === page
          ? 'bg-orange-200 text-orange-900 font-bold'
          : 'hover:bg-orange-100 text-gray-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      <aside className="md:w-1/4 lg:w-1/5 bg-white p-4 rounded-lg shadow-md border border-orange-200 self-start sticky top-28">
        <nav className="space-y-2">
          <NavItem page={AppPage.Dashboard} label={translations.menuDashboard} icon={<LayoutDashboard size={20} />} />
          <NavItem page={AppPage.Home} label={translations.menuHome} icon={<Home size={20} />} />
          <NavItem page={AppPage.Marketplace} label={translations.menuMarketplace} icon={<ShoppingCart size={20} />} />
          <NavItem page={AppPage.Upload} label={translations.menuUploadVideo} icon={<VideoIcon size={20} />} />
          <NavItem page={AppPage.Sell} label={translations.menuSellItem} icon={<Tag size={20} />} />
        </nav>
      </aside>
      <section className="flex-1">
        {renderPage()}
      </section>
    </div>
  );
};

export default MainApp;