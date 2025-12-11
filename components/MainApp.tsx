
import React, { useState, useEffect } from 'react';
import { User, Translations, AppPage, ActivityStats, Video, Item } from '../types';
import Dashboard from './Dashboard';
import UploadVideo from './UploadVideo';
import SellItem from './SellItem';
import HomePage from './HomePage';
import VideoPage from './VideoPage';
import MarketplacePage from './MarketplacePage';
import ItemPage from './ItemPage';
import ProfilePage from './ProfilePage';
import MarketInsightsPage from './MarketInsightsPage';
import BlockchainPaymentPage from './BlockchainPaymentPage';
import SkillWalletPage from './SkillWalletPage';
import OrdersPage from './OrdersPage';
import { LayoutDashboard, Video as VideoIcon, Tag, Home, ShoppingCart, TrendingUp, Wallet, Package } from 'lucide-react';
import { db } from '../services/db';

interface MainAppProps {
  user: User;
  translations: Translations;
  searchQuery: string;
}

const MainApp: React.FC<MainAppProps> = ({ user, translations, searchQuery }) => {
  const [currentPage, setCurrentPage] = useState<AppPage>(AppPage.Dashboard);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const [stats, setStats] = useState<ActivityStats>({
    videosUploaded: 0,
    earnings: 0,
    skillsLearned: 0,
    itemsListed: 0,
    totalViews: 0,
  });
  const [videos, setVideos] = useState<Video[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const userVideos = await db.getVideosForUser(user.email);
      const userItems = await db.getItemsForUser(user.email);
      
      setVideos(userVideos.slice().reverse());
      setItems(userItems.slice().reverse());

      const totalItemValue = userItems.reduce((sum, item) => sum + item.price, 0);
      const totalViews = userVideos.reduce((sum, video) => sum + video.views, 0);
      const totalVideoEarnings = totalViews * 0.5;

      const newStats: ActivityStats = {
        videosUploaded: userVideos.length,
        earnings: totalItemValue + totalVideoEarnings,
        skillsLearned: Math.floor(Math.random() * 20),
        itemsListed: userItems.length,
        totalViews: totalViews,
      };
      setStats(newStats);
      setIsLoading(false);
    };

    fetchData();
  }, [user.email]);

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
    setCurrentPage(AppPage.VideoPage);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentPage(AppPage.ItemPage);
  };
  
  const handleUploadSuccess = (videoId: string) => {
      // The delay is now handled in UploadVideo to ensure DB write is complete
      handleVideoSelect(videoId);
  };

  const handleBuyItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentPage(AppPage.Payment);
  };

  const navigateTo = (page: AppPage) => {
    setSelectedVideoId(null);
    setSelectedItemId(null);
    setCurrentPage(page);
    // On mobile, close sidebar after nav
    if(window.innerWidth < 768) setIsSidebarOpen(false);
  }

  const renderPage = () => {
    switch (currentPage) {
      case AppPage.Home:
        return <HomePage translations={translations} onVideoSelect={handleVideoSelect} user={user} searchQuery={searchQuery} />;
      case AppPage.Marketplace:
        return <MarketplacePage translations={translations} onItemSelect={handleItemSelect} user={user} searchQuery={searchQuery} />;
      case AppPage.Upload:
        return <UploadVideo user={user} translations={translations} onUploadSuccess={handleUploadSuccess} />;
      case AppPage.Sell:
        return <SellItem user={user} translations={translations} onSellSuccess={() => navigateTo(AppPage.Dashboard)} />;
      case AppPage.VideoPage:
        if (selectedVideoId) {
          return <VideoPage videoId={selectedVideoId} user={user} translations={translations} onBack={() => navigateTo(AppPage.Home)} />;
        }
        return <HomePage translations={translations} onVideoSelect={handleVideoSelect} user={user} searchQuery={searchQuery} />;
      case AppPage.ItemPage:
        if (selectedItemId) {
          return <ItemPage itemId={selectedItemId} user={user} translations={translations} onBack={() => navigateTo(AppPage.Marketplace)} onBuy={handleBuyItem} />;
        }
        return <MarketplacePage translations={translations} onItemSelect={handleItemSelect} user={user} searchQuery={searchQuery} />;
       case AppPage.Profile:
        return <ProfilePage user={user} stats={stats} translations={translations} onBack={() => navigateTo(AppPage.Dashboard)} />;
      case AppPage.MARKET_INSIGHTS:
        return <MarketInsightsPage translations={translations} />;
      case AppPage.SkillWallet:
        return <SkillWalletPage user={user} stats={stats} translations={translations} onBack={() => navigateTo(AppPage.Dashboard)} />;
      case AppPage.Orders:
        return <OrdersPage user={user} translations={translations} />;
      case AppPage.Payment:
        if (selectedItemId) {
          return (
            <BlockchainPaymentPage 
              itemId={selectedItemId} 
              user={user} 
              translations={translations} 
              onBack={() => setCurrentPage(AppPage.ItemPage)} 
              onSuccess={() => navigateTo(AppPage.Orders)} 
            />
          );
        }
        return <MarketplacePage translations={translations} onItemSelect={handleItemSelect} user={user} searchQuery={searchQuery} />;
      case AppPage.Dashboard:
      default:
        return (
          <Dashboard 
            user={user} 
            translations={translations} 
            stats={stats}
            videos={videos}
            items={items}
            onVideoSelect={handleVideoSelect} 
            onItemSelect={handleItemSelect} 
            onNavigateToProfile={() => navigateTo(AppPage.Profile)}
            isLoading={isLoading}
          />
        );
    }
  };

  const NavItem = ({ page, label, icon }: { page: AppPage; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => navigateTo(page)}
      className={`flex items-center space-x-4 w-full text-left px-3 py-3 rounded-xl transition-colors ${
        currentPage === page
          ? 'bg-gray-100 text-black font-semibold'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <div className={currentPage === page ? "text-black" : "text-gray-700"}>{icon}</div>
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar: Persistent on Desktop */}
      <aside className={`w-60 bg-white p-3 border-r border-gray-200 hidden md:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto`}>
        <nav className="space-y-1">
          <NavItem page={AppPage.Home} label={translations.menuHome} icon={<Home size={22} />} />
          <NavItem page={AppPage.Marketplace} label={translations.menuMarketplace} icon={<ShoppingCart size={22} />} />
          <div className="h-px bg-gray-200 my-2 mx-3"></div>
          <NavItem page={AppPage.Dashboard} label={translations.menuDashboard} icon={<LayoutDashboard size={22} />} />
          <NavItem page={AppPage.Upload} label={translations.menuUploadVideo} icon={<VideoIcon size={22} />} />
          <NavItem page={AppPage.Sell} label={translations.menuSellItem} icon={<Tag size={22} />} />
          <NavItem page={AppPage.Orders} label="My Orders" icon={<Package size={22} />} />
          <div className="h-px bg-gray-200 my-2 mx-3"></div>
          <NavItem page={AppPage.MARKET_INSIGHTS} label={translations.menuMarketInsights} icon={<TrendingUp size={22} />} />
          <NavItem page={AppPage.SkillWallet} label={translations.menuSkillWallet} icon={<Wallet size={22} />} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 w-full min-w-0">
        {renderPage()}
      </section>
    </div>
  );
};

export default MainApp;
