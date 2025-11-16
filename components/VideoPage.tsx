import React, { useEffect, useState, useRef, useCallback } from 'react';
import { User, Translations, Video } from '../types';
import { db } from '../services/db';
import { IndianRupee, Eye, ArrowLeft, Heart, Play, Pause, Maximize, Share2, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface VideoPageProps {
  videoId: string;
  user: User | null;
  translations: Translations;
  onBack: () => void;
}

const VideoPage: React.FC<VideoPageProps> = ({ videoId, user, translations, onBack }) => {
  const [video, setVideo] = useState<Video | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showCenterIcon, setShowCenterIcon] = useState<'play' | 'pause' | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const centerIconTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setVideoError(null); // Reset error on new video
    db.incrementViewCount(videoId);
    const videoData = db.getVideoById(videoId);
    if (videoData) {
      setVideo({ ...videoData, views: videoData.views + 1 });
      setLikeCount(videoData.likes || 0);
      const likedVideos = JSON.parse(localStorage.getItem('skillroots_liked_videos') || '[]');
      if (likedVideos.includes(videoId)) {
          setIsLiked(true);
      }
    }
  }, [videoId]);
  
  const displayCenterIcon = (icon: 'play' | 'pause') => {
    if (centerIconTimeoutRef.current) {
        clearTimeout(centerIconTimeoutRef.current);
    }
    setShowCenterIcon(icon);
    centerIconTimeoutRef.current = window.setTimeout(() => {
        setShowCenterIcon(null);
    }, 800);
  };

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
            if(videoEnded) setVideoEnded(false);
            displayCenterIcon('play');
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
            displayCenterIcon('pause');
        }
    }
  }, [videoEnded]);

  const toggleFullScreen = useCallback(() => {
      if (!document.fullscreenElement) {
          playerContainerRef.current?.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
      } else {
          document.exitFullscreen();
      }
  }, []);
  
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if(!newMuted && videoRef.current.volume === 0) {
        const newVolume = 0.5;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
      }
    }
  }, []);

  const seekRelative = useCallback((offset: number) => {
    if (videoRef.current && duration > 0) {
        const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + offset));
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }
  }, [duration]);

  const adjustVolume = useCallback((change: number) => {
    if (videoRef.current) {
        const newVolume = Math.max(0, Math.min(1, volume + change));
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        const newMuted = newVolume === 0;
        if (videoRef.current.muted !== newMuted) {
          videoRef.current.muted = newMuted;
          setIsMuted(newMuted);
        }
    }
  }, [volume]);
  
  const seekToPercentage = useCallback((percentage: number) => {
    if (videoRef.current && duration > 0) {
        const newTime = (duration * percentage) / 100;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }
  }, [duration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        switch (e.key.toLowerCase()) {
            case ' ': e.preventDefault(); togglePlayPause(); break;
            case 'f': toggleFullScreen(); break;
            case 'm': toggleMute(); break;
            case 'arrowright': e.preventDefault(); seekRelative(5); break;
            case 'arrowleft': e.preventDefault(); seekRelative(-5); break;
            case 'arrowup': e.preventDefault(); adjustVolume(0.1); break;
            case 'arrowdown': e.preventDefault(); adjustVolume(-0.1); break;
            case '0': seekToPercentage(0); break;
            case '1': seekToPercentage(10); break;
            case '2': seekToPercentage(20); break;
            case '3': seekToPercentage(30); break;
            case '4': seekToPercentage(40); break;
            case '5': seekToPercentage(50); break;
            case '6': seekToPercentage(60); break;
            case '7': seekToPercentage(70); break;
            case '8': seekToPercentage(80); break;
            case '9': seekToPercentage(90); break;
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
}, [togglePlayPause, toggleFullScreen, toggleMute, seekRelative, adjustVolume, seekToPercentage]);


  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
    }
  };

  const handleLike = () => {
    if (!isLiked) {
        db.likeVideo(videoId);
        setLikeCount(prev => prev + 1);
        setIsLiked(true);

        const likedVideos = JSON.parse(localStorage.getItem('skillroots_liked_videos') || '[]');
        likedVideos.push(videoId);
        localStorage.setItem('skillroots_liked_videos', JSON.stringify(likedVideos));
    }
  };

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newVolume = parseFloat(e.target.value);
      adjustVolume(newVolume - volume);
    }
  };
  
  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setVideoEnded(false);
      setIsPlaying(true);
      displayCenterIcon('play');
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget;
    const { error } = videoElement;

    if (!error) {
        const msg = "An unknown error occurred during video playback.";
        console.error("Video Error:", msg, e);
        setVideoError(msg);
        return;
    }

    let errorMessage;
    switch (error.code) {
        case 1: // MEDIA_ERR_ABORTED
            errorMessage = 'The video playback was aborted by the user.';
            break;
        case 2: // MEDIA_ERR_NETWORK
            errorMessage = 'A network error caused the video download to fail. Please check your internet connection.';
            break;
        case 3: // MEDIA_ERR_DECODE
            errorMessage = 'The video is corrupt or in a format not supported by your browser.';
            break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMessage = 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
            break;
        default:
            errorMessage = `An unknown error occurred (code: ${error.code}).`;
            break;
    }
    
    if (error.message) {
      errorMessage += ` (${error.message})`;
    }

    console.error("Video Error:", errorMessage, error);
    setVideoError(errorMessage);
  };

  const handleRetry = () => {
    setVideoError(null);
    if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(e => {
            console.warn("Autoplay was prevented.", e);
        });
    }
  };
  
  const showControls = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setIsControlsVisible(true);
    controlsTimeoutRef.current = window.setTimeout(() => {
        if (isPlaying) {
            setIsControlsVisible(false);
        }
    }, 3000);
  };
  
  const hideControls = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      setIsControlsVisible(false);
    }
  };
  
  useEffect(() => {
    if (!isPlaying) {
      showControls();
    }
    const currentVideoRef = videoRef.current;
    if (currentVideoRef) {
      currentVideoRef.addEventListener('mousemove', showControls);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (currentVideoRef) {
        currentVideoRef.removeEventListener('mousemove', showControls);
      }
    };
  }, [isPlaying]);


  if (!video) {
    return (
        <div className="text-center p-8">
            <p className="text-gray-600">Loading video...</p>
        </div>
    );
  }

  const isOwner = user?.email === video.userId;
  const EARNING_RATE_PER_VIEW = 0.5;
  const estimatedEarnings = video.views * EARNING_RATE_PER_VIEW;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-orange-700 hover:text-orange-900 font-semibold mb-6">
            <ArrowLeft size={20}/>
            {translations.backToHome}
        </button>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200 space-y-6">
        <div 
          ref={playerContainerRef} 
          className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
          onMouseMove={showControls}
          onMouseLeave={hideControls}
        >
             <video
                ref={videoRef}
                key={videoId}
                className="w-full h-full object-contain"
                autoPlay
                muted={isMuted}
                playsInline
                poster={video.thumbnailUrl}
                onClick={togglePlayPause}
                onDoubleClick={toggleFullScreen}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => { setIsPlaying(false); setVideoEnded(true); }}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onError={handleVideoError}
            >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {videoError && (
              <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white p-4 z-30">
                <h3 className="font-bold text-xl text-red-500 mb-2">Video Playback Error</h3>
                <p className="text-center mb-4">{videoError}</p>
                <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 text-white bg-orange-600 px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                >
                    <RotateCcw size={18} />
                    <span>Retry</span>
                </button>
              </div>
            )}

            {showCenterIcon && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 pointer-events-none z-10 animate-center-icon">
                    <div className="bg-black/50 p-4 rounded-full">
                        {showCenterIcon === 'play' && <Play size={48} className="text-white fill-white" />}
                        {showCenterIcon === 'pause' && <Pause size={48} className="text-white fill-white" />}
                    </div>
                </div>
            )}

            {videoEnded && !videoError && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
                <button 
                  onClick={handleReplay} 
                  className="flex flex-col items-center gap-2 text-white bg-orange-600 p-4 rounded-full hover:bg-orange-700 transition-colors"
                  aria-label="Replay video"
                >
                  <RotateCcw size={32} />
                  <span className="text-sm font-semibold">Replay</span>
                </button>
              </div>
            )}
        
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white transition-opacity duration-300 z-10 ${isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Progress Bar */}
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer range-thumb"
                    aria-label="Video progress"
                />
                
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3">
                        <button onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? <Pause size={24}/> : <Play size={24}/>}
                        </button>
                        <div className="flex items-center gap-2 group/volume">
                             <button onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                                {isMuted || volume === 0 ? <VolumeX size={24}/> : <Volume2 size={24}/>}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover/volume:w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer transition-all duration-300 range-thumb"
                                aria-label="Volume control"
                            />
                        </div>
                         <span className="text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            {[0.5, 1, 1.5, 2].map(rate => (
                                <button
                                    key={rate}
                                    onClick={() => handlePlaybackRateChange(rate)}
                                    className={`px-2 py-0.5 text-xs font-bold rounded-md transition-colors ${playbackRate === rate ? 'bg-orange-600 text-white' : 'bg-white/20 hover:bg-white/40'}`}
                                >
                                    {rate}x
                                </button>
                            ))}
                        </div>
                        <button onClick={toggleFullScreen} aria-label="Toggle fullscreen">
                            <Maximize size={20}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div>
            <h1 className="text-3xl font-bold text-orange-900">{video.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-gray-500 mt-2">
                <div className="flex items-center space-x-4">
                    <span>{translations.by} <strong>{video.uploaderName}</strong></span>
                    <div className="flex items-center gap-1">
                        <Eye size={16} />
                        <span>{video.views.toLocaleString('en-IN')} {translations.views}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLike}
                        disabled={isLiked}
                        className={`flex items-center gap-1.5 py-2 px-3 rounded-full transition-colors ${isLiked ? 'bg-red-100 text-red-600 cursor-not-allowed' : 'bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-500'}`}
                        aria-label="Like video"
                    >
                        <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                        <span className="font-semibold text-sm">{likeCount.toLocaleString('en-IN')}</span>
                    </button>
                     <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 py-2 px-3 rounded-full transition-colors bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600"
                        aria-label="Share video link"
                    >
                        <Share2 size={16} />
                        <span className="font-semibold text-sm w-16 text-center">{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                </div>
            </div>
        </div>

        {isOwner && (
          <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-green-800 mb-3">{translations.yourEarnings}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">{translations.views}</p>
                <p className="text-lg font-bold text-green-700">{video.views.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{translations.ratePerView}</p>
                <p className="text-lg font-bold text-green-700">₹{EARNING_RATE_PER_VIEW.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{translations.estimatedEarnings}</p>
                <p className="text-lg font-bold text-green-700 flex items-center justify-center">
                  <IndianRupee size={18}/>{estimatedEarnings.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div>
            <h4 className="font-bold text-lg text-gray-800 border-b pb-2 mb-2">{translations.videoDescription}</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
        </div>
      </div>
      <style>{`
        .range-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            background: #ea580c;
            border-radius: 50%;
            cursor: pointer;
            margin-top: -5px;
            transition: background-color 0.2s;
        }
        .range-thumb::-moz-range-thumb {
            width: 14px;
            height: 14px;
            background: #ea580c;
            border-radius: 50%;
            cursor: pointer;
        }
        .range-thumb:hover::-webkit-slider-thumb {
            background-color: #f97316;
        }
        
        @keyframes center-icon-anim {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(1.3); }
        }
        .animate-center-icon {
          animation: center-icon-anim 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VideoPage;