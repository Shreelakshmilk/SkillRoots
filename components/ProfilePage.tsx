import React from 'react';
import { User, ActivityStats, Translations } from '../types';
import StatCard from './StatCard';
import { ArrowLeft, User as UserIcon, UploadCloud, IndianRupee, ShoppingBag, Globe } from 'lucide-react';

interface ProfilePageProps {
  user: User;
  stats: ActivityStats;
  translations: Translations;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, stats, translations, onBack }) => {
  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-orange-700 hover:text-orange-900 font-semibold">
        <ArrowLeft size={20}/>
        {translations.backToDashboard}
      </button>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-200">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex-shrink-0 bg-orange-100 p-5 rounded-full border-2 border-orange-200">
            <UserIcon size={48} className="text-orange-600" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-orange-900">{user.name}</h1>
            <p className="text-lg text-gray-600 mt-1">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-6 text-center">{translations.profileSummary}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title={translations.videosUploaded} value={stats.videosUploaded.toString()} icon={<UploadCloud className="h-8 w-8 text-blue-500" />} color="blue" />
          <StatCard title={translations.itemsListed} value={stats.itemsListed.toString()} icon={<ShoppingBag className="h-8 w-8 text-red-500" />} color="red" />
          <StatCard title={translations.totalViews} value={stats.totalViews.toLocaleString('en-IN')} icon={<Globe className="h-8 w-8 text-yellow-500" />} color="yellow" />
          <StatCard title={translations.earnings} value={`₹${stats.earnings.toLocaleString('en-IN')}`} icon={<IndianRupee className="h-8 w-8 text-green-500" />} color="green" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;