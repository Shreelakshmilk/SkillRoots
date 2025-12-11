
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Translations, User, Video } from '../types';
import { CheckCircle } from 'lucide-react';

interface HomePageProps {
  translations: Translations;
  user: User | null;
  onVideoSelect: (videoId: string) => void;
  searchQuery?: string;
}

const HomePage: React.FC<HomePageProps> = ({ translations, onVideoSelect, searchQuery = '' }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
        const allVideos = await db.getAllVideos();
        setVideos(allVideos.slice().reverse());
    };
    fetchVideos();
  }, []);

  useEffect(() => {
     if (!searchQuery.trim()) {
         setFilteredVideos(videos);
     } else {
         const query = searchQuery.toLowerCase();
         const filtered = videos.filter(video => 
             video.title.toLowerCase().includes(query) || 
             video.description.toLowerCase().includes(query) ||
             video.uploaderName.toLowerCase().includes(query)
         );
         setFilteredVideos(filtered);
     }
  }, [searchQuery, videos]);

  // Helpers for simulated data
  const getAvatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  const getRandomTime = () => `${Math.floor(Math.random() * 11) + 1} months ago`;
  const formatViews = (views: number) => {
     if(views >= 1000) return `${(views/1000).toFixed(1)}K`;
     return views;
  }

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      {/* Category Chips (Simulated) */}
      <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
         {['All', 'Pottery', 'Weaving', 'Painting', 'Metalwork', 'Textiles', 'Live', 'Recently Uploaded'].map((cat, i) => (
             <button key={cat} className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${i === 0 ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
                 {cat}
             </button>
         ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="flex flex-col cursor-pointer group"
            onClick={() => onVideoSelect(video.id)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 mb-3">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    {Math.floor(Math.random() * 10) + 2}:{Math.floor(Math.random() * 50) + 10}
                </div>
            </div>

            {/* Meta */}
            <div className="flex gap-3 items-start px-1">
                <img 
                    src={getAvatar(video.uploaderName)} 
                    alt={video.uploaderName} 
                    className="w-9 h-9 rounded-full mt-0.5 flex-shrink-0"
                />
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-gray-600">
                        {video.title}
                    </h3>
                    <div className="text-sm text-gray-600 flex flex-col">
                        <span className="flex items-center gap-1 hover:text-gray-900">
                            {video.uploaderName}
                            <CheckCircle size={12} className="text-gray-500 fill-gray-200" />
                        </span>
                        <span>
                            {formatViews(video.views)} views • {getRandomTime()}
                        </span>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
       {filteredVideos.length === 0 && (
          <div className="text-center col-span-full py-16">
            <p className="text-gray-500">{searchQuery ? `No videos found matching "${searchQuery}".` : translations.noVideos}</p>
          </div>
        )}
    </div>
  );
};

export default HomePage;
