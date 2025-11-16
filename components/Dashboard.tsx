import React, { useState, useEffect } from 'react';
import { User, ActivityStats, Translations, Video, Item } from '../types';
import StatCard from './StatCard';
import { UploadCloud, IndianRupee, BookOpen, ShoppingBag, Globe } from 'lucide-react';
import { db } from '../services/db';

interface DashboardProps {
  user: User;
  translations: Translations;
  onVideoSelect: (videoId: string) => void;
  onItemSelect: (itemId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, translations, onVideoSelect, onItemSelect }) => {
  const [stats, setStats] = useState<ActivityStats>({
    videosUploaded: 0,
    earnings: 0,
    skillsLearned: 0,
    itemsListed: 0,
    totalViews: 0,
  });
  const [videos, setVideos] = useState<Video[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const userVideos = db.getVideosForUser(user.email);
    const userItems = db.getItemsForUser(user.email);
    
    setVideos(userVideos.slice().reverse());
    setItems(userItems.slice().reverse());

    const totalItemValue = userItems.reduce((sum, item) => sum + item.price, 0);
    const totalViews = userVideos.reduce((sum, video) => sum + video.views, 0);
    const totalVideoEarnings = totalViews * 0.5; // Example rate: ₹0.5 per view

    const newStats: ActivityStats = {
      videosUploaded: userVideos.length,
      earnings: totalItemValue + totalVideoEarnings,
      skillsLearned: Math.floor(Math.random() * 20), // Still mock
      itemsListed: userItems.length,
      totalViews: totalViews,
    };
    setStats(newStats);
  }, [user.email]);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-orange-200">
          <h2 className="text-3xl font-bold text-orange-800">
            {translations.welcome}, {user.name}!
          </h2>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
        
        <h3 className="text-2xl font-semibold text-gray-700 mb-6 text-center">{translations.dashboardTitle}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title={translations.videosUploaded} value={stats.videosUploaded.toString()} icon={<UploadCloud className="h-8 w-8 text-blue-500" />} color="blue" />
          <StatCard title={translations.totalViews} value={stats.totalViews.toLocaleString('en-IN')} icon={<Globe className="h-8 w-8 text-yellow-500" />} color="yellow" />
          <StatCard title={translations.earnings} value={`₹${stats.earnings.toLocaleString('en-IN')}`} icon={<IndianRupee className="h-8 w-8 text-green-500" />} color="green" />
          <StatCard title={translations.skillsLearned} value={stats.skillsLearned.toString()} icon={<BookOpen className="h-8 w-8 text-purple-500" />} color="purple" />
          <StatCard title={translations.itemsListed} value={stats.itemsListed.toString()} icon={<ShoppingBag className="h-8 w-8 text-red-500" />} color="red" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-orange-200">
          <h4 className="text-xl font-bold text-gray-800 mb-4">{translations.myCreations}</h4>
          <div className="space-y-4 max-h-96 overflow-y-auto p-1">
            {videos.length > 0 ? videos.map(video => (
              <div 
                key={video.id} 
                className="flex items-center space-x-4 p-2 rounded-md hover:bg-orange-50 cursor-pointer"
                onClick={() => onVideoSelect(video.id)}
              >
                <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0 bg-gray-200"/>
                <div className="overflow-hidden">
                  <p className="font-semibold text-gray-700 truncate">{video.title}</p>
                  <p className="text-sm text-gray-500 truncate">{video.views} {translations.views}</p>
                </div>
              </div>
            )) : <p className="text-gray-500">{translations.noVideos}</p>}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-orange-200">
          <h4 className="text-xl font-bold text-gray-800 mb-4">{translations.myProducts}</h4>
            <div className="space-y-4 max-h-96 overflow-y-auto p-1">
              {items.length > 0 ? items.map(item => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-start p-2 rounded-md hover:bg-orange-50 cursor-pointer"
                  onClick={() => onItemSelect(item.id)}
                >
                   <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-gray-200 mr-4"/>
                   <div className="flex-grow overflow-hidden">
                      <p className="font-semibold text-gray-700 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 truncate">{item.description}</p>
                   </div>
                   <p className="font-bold text-green-600 whitespace-nowrap">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
              )) : <p className="text-gray-500">{translations.noItems}</p>}
            </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;