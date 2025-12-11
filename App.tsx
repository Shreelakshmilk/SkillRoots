
import React, { useState, useEffect } from 'react';
import { User, AuthScreen } from './types';
import Auth from './components/Auth';
import MainApp from './components/MainApp';
import { translateText } from './services/translationService';
import { LANGUAGES, INITIAL_TRANSLATIONS, UI_TEXT } from './constants';
import HomePage from './components/HomePage';
import MarketplacePage from './components/MarketplacePage';
import LandingPage from './components/LandingPage';
import { Home, ShoppingCart, Search, Menu, Bell, Video, User as UserIcon, LoaderCircle } from 'lucide-react';
import VoiceAssistant from './components/VoiceAssistant';

export type PublicView = 'landing' | 'videos' | 'market';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState(INITIAL_TRANSLATIONS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [authInfo, setAuthInfo] = useState<{ show: boolean; initialScreen: AuthScreen }>({ show: false, initialScreen: AuthScreen.Login });
  const [publicView, setPublicView] = useState<PublicView>('landing');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loggedInUser = localStorage.getItem('skillroots_user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      setAuthInfo({ ...authInfo, show: false });
    }
  }, []);
  
  const handleLanguageChange = async (langCode: string) => {
    if (langCode === selectedLanguage) return;
    
    setIsTranslating(true);
    setSelectedLanguage(langCode);
    
    if (langCode === 'en') {
      setTranslations(INITIAL_TRANSLATIONS);
      setIsTranslating(false);
      return;
    }

    try {
      const translatedContent = await translateText(UI_TEXT, langCode);
      setTranslations(translatedContent);
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslations(INITIAL_TRANSLATIONS);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setAuthInfo({ ...authInfo, show: false });
    localStorage.setItem('skillroots_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthInfo({ ...authInfo, show: false });
    setPublicView('landing');
    localStorage.removeItem('skillroots_user');
  };
  
  const showAuthScreen = (screen: AuthScreen) => {
    setPublicView('landing');
    setAuthInfo({ show: true, initialScreen: screen });
  };

  const renderContent = () => {
    if (isAuthenticated && user) {
        return <MainApp user={user} translations={translations} searchQuery={searchQuery} />;
    }
    if (authInfo.show) {
        return <Auth onLogin={handleLogin} translations={translations} initialScreen={authInfo.initialScreen} />;
    }
    switch(publicView) {
      case 'videos':
        return <HomePage translations={translations} onVideoSelect={() => {}} user={null} searchQuery={searchQuery} />;
      case 'market':
        return <MarketplacePage translations={translations} onItemSelect={() => {}} user={null} searchQuery={searchQuery} />;
      case 'landing':
      default:
        return <LandingPage translations={translations} onNavigate={setPublicView} onShowAuth={showAuthScreen}/>;
    }
  }

  const PublicViewButton: React.FC<{view: PublicView, label: string, icon: React.ReactNode}> = ({view, label, icon}) => (
     <button 
        onClick={() => { setPublicView(view); setAuthInfo({ ...authInfo, show: false }); }} 
        className={`px-4 py-2 rounded-full transition duration-300 flex items-center gap-2 ${publicView === view && !authInfo.show ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-800'}`}
        aria-label={label}
      >
        {icon} <span className="hidden sm:inline font-medium">{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Platform Header */}
      <header className="bg-white shadow-sm px-4 py-2 flex justify-between items-center sticky top-0 z-50 h-16">
        
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-4">
            {isAuthenticated && (
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Menu size={24} className="text-gray-700" />
                </button>
            )}
            <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => { 
                    if (!isAuthenticated) { 
                        setPublicView('landing'); 
                        setAuthInfo({...authInfo, show: false}); 
                    } 
                }}
            >
                <img src="https://skillrootsinstitute.in/wp-content/uploads/2025/08/cropped-skillroots.png" alt="SkillRoots Logo" className="h-8 w-auto" />
                <h1 className="text-xl tracking-tight font-bold text-gray-900 hidden md:block">SkillRoots</h1>
            </div>
        </div>

        {/* Center: Search Bar (YouTube/Amazon style) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="flex w-full">
                <input 
                    type="text" 
                    placeholder="Search videos, products, or skills..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-full px-6 hover:bg-gray-200">
                    <Search size={20} className="text-gray-600" />
                </button>
            </div>
            {/* Voice Mic Button */}
            <button className="ml-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                 {/* Placeholder for voice trigger if needed apart from FAB */}
                 <div className="w-5 h-5 bg-gray-600 rounded-full opacity-50" />
            </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Selector */}
          <div className="relative hidden md:flex items-center">
            {isTranslating && <LoaderCircle size={16} className="animate-spin text-orange-600 mr-2" />}
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isTranslating}
              className="appearance-none bg-transparent text-sm font-medium text-gray-700 py-1 pr-6 cursor-pointer focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full" title="Create">
                    <Video size={24} className="text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full" title="Notifications">
                    <Bell size={24} className="text-gray-700" />
                </button>
                <div className="relative group">
                    <button className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                        {user?.name.charAt(0).toUpperCase()}
                    </button>
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100">
                         <div className="px-4 py-2 border-b">
                             <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                             <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                         </div>
                         <button 
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                         >
                            {translations.logout}
                         </button>
                    </div>
                </div>
            </div>
          ) : (
             <div className="flex items-center gap-2">
                <div className="hidden md:flex">
                    <PublicViewButton view="videos" label="Videos" icon={<Video size={18}/>} />
                    <PublicViewButton view="market" label="Shop" icon={<ShoppingCart size={18}/>} />
                </div>
                <button 
                  onClick={() => showAuthScreen(AuthScreen.Login)}
                  className="ml-2 flex items-center gap-1 border border-gray-300 rounded-full px-4 py-1.5 text-blue-600 font-medium hover:bg-blue-50"
                >
                  <UserIcon size={18} />
                  <span>{translations.login}</span>
                </button>
             </div>
          )}
        </div>
      </header>

      <main>
        {renderContent()}
      </main>

      {isAuthenticated && <VoiceAssistant translations={translations} />}
    </div>
  );
};

export default App;
