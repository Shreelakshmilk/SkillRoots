import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Translations, User, Video } from '../types';

interface HomePageProps {
  translations: Translations;
  user: User | null;
  onVideoSelect: (videoId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ translations, onVideoSelect }) => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const allVideos = db.getAllVideos();
    setVideos(allVideos.slice().reverse());
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-orange-800 mb-8">{translations.exploreCreations}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200 cursor-pointer group transform transition-transform hover:-translate-y-1"
            onClick={() => onVideoSelect(video.id)}
          >
            <div className="relative">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-40 object-cover" />
                 <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all"></div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-orange-700">{video.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{translations.by} {video.uploaderName}</p>
              <p className="text-xs text-gray-500 mt-2">{video.views} {translations.views}</p>
            </div>
          </div>
        ))}
      </div>
       {videos.length === 0 && (
          <div className="text-center col-span-full py-16">
            <p className="text-gray-500">{translations.noVideos}</p>
          </div>
        )}
    </div>
  );
};

export default HomePage;
