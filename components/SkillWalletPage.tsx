
import React, { useState } from 'react';
import { User, Translations, ActivityStats } from '../types';
import { ShieldCheck, Award, Share2, Wallet, Star, CheckCircle } from 'lucide-react';

interface SkillWalletPageProps {
  user: User;
  stats: ActivityStats;
  translations: Translations;
  onBack: () => void;
}

const SkillWalletPage: React.FC<SkillWalletPageProps> = ({ user, stats, translations, onBack }) => {
  const [copied, setCopied] = useState(false);

  // Generate a mock DID based on email
  const mockDID = `did:skillroots:${btoa(user.email).substring(0, 16).toLowerCase()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${mockDID}`;
  
  // Calculate Reputation Score
  const reputationScore = 
    (stats.videosUploaded * 50) + 
    (stats.itemsListed * 30) + 
    (Math.floor(stats.totalViews / 10));

  const handleShare = () => {
    navigator.clipboard.writeText(mockDID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Badge: React.FC<{ title: string, description: string, icon: React.ReactNode, earned: boolean, color: string }> = ({ title, description, icon, earned, color }) => (
    <div className={`relative p-4 rounded-xl border-2 transition-all ${earned ? `bg-white border-${color}-500 shadow-md` : 'bg-gray-50 border-gray-200 opacity-60 grayscale'}`}>
      <div className={`absolute -top-3 -right-3 bg-${color}-500 text-white p-1 rounded-full shadow-sm`}>
        {earned ? <CheckCircle size={16} /> : <div className="w-4 h-4" />}
      </div>
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-full mb-3 bg-${color}-100 text-${color}-600`}>
            {icon}
        </div>
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-xs text-gray-500">{description}</p>
        {earned && <span className="mt-2 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">{translations.badgeVerified}</span>}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-orange-900">{translations.walletTitle}</h1>
      </div>
      <p className="text-gray-600">{translations.walletSubtitle}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Identity Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <ShieldCheck size={120} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <h2 className="text-lg font-medium opacity-90 mb-6">{translations.identityCard}</h2>
                    <p className="text-3xl font-bold mb-1">{user.name}</p>
                    <p className="opacity-80 text-sm">{user.email}</p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <div className="bg-white p-2 rounded-lg">
                        <img src={qrUrl} alt="Identity QR" className="w-24 h-24" />
                    </div>
                    <div className="flex-1 ml-6">
                        <p className="text-xs uppercase opacity-70 mb-1">{translations.didLabel}</p>
                        <p className="font-mono text-xs break-all bg-black/20 p-2 rounded mb-3">{mockDID}</p>
                        <button 
                            onClick={handleShare}
                            className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors"
                        >
                            {copied ? <CheckCircle size={16}/> : <Share2 size={16}/>}
                            {copied ? translations.identityCopied : translations.shareIdentity}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Reputation Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-200 flex flex-col justify-center items-center text-center">
            <div className="p-4 bg-yellow-100 rounded-full mb-4">
                <Star size={48} className="text-yellow-600 fill-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{translations.reputationScore}</h3>
            <p className="text-5xl font-extrabold text-orange-600 mb-4">{reputationScore}</p>
            <p className="text-sm text-gray-500">
                Earned via platform contributions, successful sales, and community engagement.
            </p>
        </div>
      </div>

      {/* Badges Section */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="text-orange-600" />
            {translations.skillBadges}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Badge 
                title="Early Adopter" 
                description="Joined SkillRoots in 2024" 
                icon={<ShieldCheck size={24}/>} 
                earned={true} 
                color="blue"
            />
            <Badge 
                title={translations.badgeCreator || "Creator"} 
                description="Uploaded first video tutorial" 
                icon={<Wallet size={24}/>} 
                earned={stats.videosUploaded > 0} 
                color="purple"
            />
            <Badge 
                title={translations.badgeMerchant || "Merchant"} 
                description="Listed item for sale" 
                icon={<Award size={24}/>} 
                earned={stats.itemsListed > 0} 
                color="green"
            />
            <Badge 
                title={translations.badgeInfluencer || "Influencer"} 
                description="Reached 100+ views" 
                icon={<Star size={24}/>} 
                earned={stats.totalViews > 100} 
                color="red"
            />
        </div>
      </div>
    </div>
  );
};

export default SkillWalletPage;
