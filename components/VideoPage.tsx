
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { User, Translations, Video } from '../types';
import { db } from '../services/db';
import { Eye, ArrowLeft, ThumbsUp, Share2, Play, Pause, Maximize, Volume2, VolumeX, RotateCcw, MoreHorizontal, Download, Scissors, ListPlus } from 'lucide-react';

interface VideoPageProps {
  videoId: string;
  user: User | null;
  translations: Translations;
  onBack: () => void;
}

const VideoPage: React.FC<VideoPageProps> = ({ videoId, user, translations, onBack }) => {
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const loadVideoData = async () => {
        setVideoError(null);
        await db.incrementViewCount(videoId);
        const videoData = await db.getVideoById(videoId);
        const allVideos = await db.getAllVideos();
        
        if (videoData) {
          setVideo(videoData);
          setLikeCount(videoData.likes || 0);
          const likedVideos = JSON.parse(localStorage.getItem('skillroots_liked_videos') || '[]');
          if (likedVideos.includes(videoId)) setIsLiked(true);
        }
        
        // Filter out current video for recommendations
        setRelatedVideos(allVideos.filter(v => v.id !== videoId).slice(0, 8));
    };
    loadVideoData();
  }, [videoId]);

  const togglePlayPause = useCallback(() => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      if (videoElement.paused) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
              playPromise.catch(error => {
                  console.log("Playback interrupted or prevented:", error);
              });
          }
      } else {
          videoElement.pause();
      }
  }, []);

  const handleLike = async () => {
    if (!isLiked) {
        await db.likeVideo(videoId);
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
        const likedVideos = JSON.parse(localStorage.getItem('skillroots_liked_videos') || '[]');
        likedVideos.push(videoId);
        localStorage.setItem('skillroots_liked_videos', JSON.stringify(likedVideos));
    }
  };

  if (!video) return <div className="p-8 text-center">Loading...</div>;

  const getAvatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  const formatViews = (views: number) => views >= 1000 ? `${(views/1000).toFixed(1)}K` : views;

  return (
    <div className="animate-fade-in bg-white min-h-screen">
      <div className="max-w-[1800px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Player & Info (Width ~70%) */}
        <div className="flex-1 lg:min-w-0">
            {/* Video Player */}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-sm relative group">
                <video
                    ref={videoRef}
                    key={videoId}
                    className="w-full h-full"
                    poster={video.thumbnailUrl}
                    controls
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                >
                    <source src={video.videoUrl} type="video/mp4" />
                </video>
            </div>

            {/* Video Title */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-4 mb-2">{video.title}</h1>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                {/* Channel Info */}
                <div className="flex items-center gap-3">
                    <img src={getAvatar(video.uploaderName)} alt={video.uploaderName} className="w-10 h-10 rounded-full" />
                    <div>
                        <h3 className="font-bold text-gray-900">{video.uploaderName}</h3>
                        <p className="text-xs text-gray-500">1.2K subscribers</p>
                    </div>
                    <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 ml-4">
                        Subscribe
                    </button>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center bg-gray-100 rounded-full">
                        <button 
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-l-full hover:bg-gray-200 border-r border-gray-300 ${isLiked ? 'text-blue-600' : 'text-gray-800'}`}
                        >
                            <ThumbsUp size={20} className={isLiked ? "fill-current" : ""} />
                            <span className="text-sm font-medium">{likeCount}</span>
                        </button>
                        <button className="px-4 py-2 rounded-r-full hover:bg-gray-200 text-gray-800">
                             {/* Dislike simulated */}
                             <ThumbsUp size={20} className="rotate-180" />
                        </button>
                    </div>
                    
                    <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 text-gray-800 text-sm font-medium">
                        <Share2 size={20} />
                        Share
                    </button>
                    <button className="hidden sm:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 text-gray-800 text-sm font-medium">
                        <Download size={20} />
                        Download
                    </button>
                    <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-800">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* Description Box */}
            <div className="bg-gray-100 rounded-xl p-4 mt-4 text-sm cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="font-bold text-gray-900 mb-1">
                    {video.views.toLocaleString()} views • {new Date().toLocaleDateString()}
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{video.description}</p>
                <p className="text-gray-500 font-bold mt-2">Show more</p>
            </div>

            {/* Comments Section (Simulated) */}
            <div className="mt-6 hidden md:block">
                <h3 className="font-bold text-xl mb-4">24 Comments</h3>
                <div className="flex gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                        {user ? user.name.charAt(0) : 'G'}
                    </div>
                    <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        className="flex-1 border-b border-gray-300 focus:border-black outline-none py-1 bg-transparent transition-colors"
                    />
                </div>
                {/* Mock Comment */}
                <div className="flex gap-4">
                     <img src={getAvatar("Viewer One")} alt="Viewer" className="w-10 h-10 rounded-full" />
                     <div>
                         <div className="flex items-center gap-2">
                             <span className="font-bold text-xs">@craftlover</span>
                             <span className="text-xs text-gray-500">2 days ago</span>
                         </div>
                         <p className="text-sm mt-1 text-gray-900">This is such a beautiful technique! Thanks for sharing.</p>
                         <div className="flex items-center gap-4 mt-2">
                             <button className="flex items-center gap-1 text-xs text-gray-600"><ThumbsUp size={14}/> 12</button>
                             <button className="text-xs text-gray-600 font-bold">Reply</button>
                         </div>
                     </div>
                </div>
            </div>
        </div>

        {/* Right Column: Recommendations (Width ~30%) */}
        <div className="lg:w-[400px] flex-shrink-0">
             <div className="flex flex-col gap-3">
                 {relatedVideos.map(rec => (
                     <div key={rec.id} className="flex gap-2 cursor-pointer group" onClick={() => window.location.href = '#'}> 
                         {/* Note: In a real app we'd use a router link or the prop handler properly, simulating reload for now or simple switch */}
                        <div 
                            className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200"
                            onClick={() => { /* Handle nav */ }}
                        >
                             <img src={rec.thumbnailUrl} alt={rec.title} className="w-full h-full object-cover" />
                             <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                 {Math.floor(Math.random() * 10) + 1}:{Math.floor(Math.random() * 50) + 10}
                             </span>
                        </div>
                        <div className="flex flex-col flex-1">
                             <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-gray-600">{rec.title}</h4>
                             <p className="text-xs text-gray-600">{rec.uploaderName}</p>
                             <p className="text-xs text-gray-600">{formatViews(rec.views)} views • 2 months ago</p>
                        </div>
                     </div>
                 ))}
             </div>
        </div>

      </div>
    </div>
  );
};

export default VideoPage;
