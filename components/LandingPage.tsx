import React from 'react';
import { Translations, AuthScreen } from '../types';
import { PublicView } from '../App';
import { Eye, ShoppingCart as ShoppingCartIcon, Sparkles } from 'lucide-react';

interface LandingPageProps {
  translations: Translations;
  onNavigate: (view: PublicView) => void;
  onShowAuth: (screen: AuthScreen) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ translations, onNavigate, onShowAuth }) => {
  
  const FeatureCard: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-orange-200 text-center transform transition-transform hover:-translate-y-2">
      <div className="flex justify-center items-center mb-4">
        <div className="bg-orange-100 p-4 rounded-full">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-orange-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 bg-white rounded-xl shadow-lg border border-orange-200">
        <h1 className="text-4xl md:text-6xl font-extrabold text-orange-900 mb-4">
          {translations.landingTitle}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          {translations.landingHeroSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={() => onShowAuth(AuthScreen.Register)}
            className="w-full sm:w-auto bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-transform transform hover:scale-105 duration-300 shadow-lg">
              {translations.joinNowCTA}
          </button>
           <button 
            onClick={() => onNavigate('videos')}
            className="w-full sm:w-auto bg-orange-100 text-orange-800 px-8 py-3 rounded-lg font-bold hover:bg-orange-200 transition duration-300">
              {translations.exploreVideosCTA}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Eye size={32} className="text-orange-500" />}
            title={translations.featureWatchTitle}
            description={translations.featureWatchDesc}
          />
          <FeatureCard 
            icon={<ShoppingCartIcon size={32} className="text-orange-500" />}
            title={translations.featureShopTitle}
            description={translations.featureShopDesc}
          />
          <FeatureCard 
            icon={<Sparkles size={32} className="text-orange-500" />}
            title={translations.featureEmpowerTitle}
            description={translations.featureEmpowerDesc}
          />
        </div>
      </section>

       {/* Secondary CTA */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Explore?</h2>
        <button 
            onClick={() => onNavigate('market')}
            className="bg-green-600 text-white px-10 py-4 rounded-lg font-bold hover:bg-green-700 transition-transform transform hover:scale-105 duration-300 shadow-xl text-lg">
            {translations.browseMarketCTA}
        </button>
      </section>
    </div>
  );
};

export default LandingPage;