import React, { useState, useEffect } from 'react';
import { User, AuthScreen } from './types';
import Auth from './components/Auth';
import MainApp from './components/MainApp';
import { translateText } from './services/translationService';
import { LANGUAGES, INITIAL_TRANSLATIONS, UI_TEXT } from './constants';
import HomePage from './components/HomePage';
import MarketplacePage from './components/MarketplacePage';
import LandingPage from './components/LandingPage';
import { Home, ShoppingCart } from 'lucide-react';

export type PublicView = 'landing' | 'videos' | 'market';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState(INITIAL_TRANSLATIONS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [authInfo, setAuthInfo] = useState<{ show: boolean; initialScreen: AuthScreen }>({ show: false, initialScreen: AuthScreen.Login });
  const [publicView, setPublicView] = useState<PublicView>('landing');

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
    setPublicView('landing'); // Reset to landing page on logout
    localStorage.removeItem('skillroots_user');
  };
  
  const showAuthScreen = (screen: AuthScreen) => {
    setPublicView('landing'); // Go to a neutral bg for auth
    setAuthInfo({ show: true, initialScreen: screen });
  };

  const renderContent = () => {
    if (isAuthenticated && user) {
        return <MainApp user={user} translations={translations} />;
    }
    if (authInfo.show) {
        return <Auth onLogin={handleLogin} translations={translations} initialScreen={authInfo.initialScreen} />;
    }
    switch(publicView) {
      case 'videos':
        return <HomePage translations={translations} onVideoSelect={() => {}} user={null} />;
      case 'market':
        return <MarketplacePage translations={translations} onItemSelect={() => {}} user={null} />;
      case 'landing':
      default:
        return <LandingPage translations={translations} onNavigate={setPublicView} onShowAuth={showAuthScreen}/>;
    }
  }

  const PublicViewButton: React.FC<{view: PublicView, label: string, icon: React.ReactNode}> = ({view, label, icon}) => (
     <button 
        onClick={() => { setPublicView(view); setAuthInfo({ ...authInfo, show: false }); }} 
        className={`px-4 py-2 rounded-md transition duration-300 flex items-center gap-2 ${publicView === view && !authInfo.show ? 'bg-orange-600 text-white' : 'bg-orange-200 text-orange-800 hover:bg-orange-300'}`}
        aria-label={label}
      >
        {icon} <span className="hidden sm:inline">{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-orange-50 font-serif text-gray-800">
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => { 
                if (!isAuthenticated) { 
                    setPublicView('landing'); 
                    setAuthInfo({...authInfo, show: false}); 
                } 
            }}
        >
            <img src="https://picsum.photos/50/50?grayscale" alt="SkillRoots Logo" className="h-12 w-12 rounded-full object-cover" />
            <h1 className="text-2xl md:text-3xl font-bold text-orange-800">{translations.title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isTranslating}
              className="appearance-none bg-orange-100 border border-orange-300 text-orange-800 rounded-md py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-orange-800">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
            {isTranslating && <div className="absolute top-full right-0 mt-1 text-xs text-gray-500">Translating...</div>}
          </div>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition duration-300"
            >
              {translations.logout}
            </button>
          ) : (
             <div className="flex items-center space-x-2">
                <PublicViewButton view="videos" label={translations.menuHome} icon={<Home size={18}/>} />
                <PublicViewButton view="market" label={translations.menuMarketplace} icon={<ShoppingCart size={18}/>} />
                <button 
                  onClick={() => showAuthScreen(AuthScreen.Login)}
                  className={`px-4 py-2 rounded-md transition duration-300 ${authInfo.show && authInfo.initialScreen === AuthScreen.Login ? 'bg-orange-600 text-white' : 'bg-orange-200 text-orange-800 hover:bg-orange-300'}`}
                >
                  {translations.login}
                </button>
                 <button 
                  onClick={() => showAuthScreen(AuthScreen.Register)}
                  className={`px-4 py-2 rounded-md transition duration-300 ${authInfo.show && authInfo.initialScreen === AuthScreen.Register ? 'bg-orange-600 text-white' : 'bg-orange-200 text-orange-800 hover:bg-orange-300'}`}
                >
                  {translations.register}
                </button>
             </div>
          )}
        </div>
      </header>

      <main className="p-4 md:p-8">
        {renderContent()}
      </main>

      <footer className="text-center p-4 mt-8 text-sm text-gray-500 border-t border-orange-200">
        <p>&copy; {new Date().getFullYear()} SkillRoots. All rights reserved.</p>
        <p className="mt-1">{translations.subtitle}</p>
      </footer>
    </div>
  );
};

export default App;