import React, { useState } from 'react';
import { User, Translations } from '../types';
import { db } from '../services/db';

interface UploadVideoProps {
  user: User;
  translations: Translations;
  onUploadSuccess: (videoId: string) => void;
}

const UploadVideo: React.FC<UploadVideoProps> = ({ user, translations, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!title || !description || !thumbnailUrl || !videoUrl) {
      setError(translations.fillFields);
      return;
    }
    const newVideo = await db.addVideo(user.email, user.name, title, description, thumbnailUrl, videoUrl);
    setSuccess(translations.uploadSuccess);
    setTitle('');
    setDescription('');
    setThumbnailUrl('');
    setVideoUrl('');

    setTimeout(() => {
        onUploadSuccess(newVideo.id);
    }, 1500);
  };

  return (
    <div className="w-full bg-white p-8 rounded-xl shadow-lg border border-orange-200 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-orange-800 mb-2">{translations.uploadTitle}</h2>
      <p className="text-center text-gray-500 mb-6">{translations.uploadSubtitle}</p>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">{translations.videoTitleLabel}</label>
          <input
            id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">{translations.videoDescLabel}</label>
          <textarea
            id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">{translations.thumbnailUrlLabel}</label>
          <input
            id="thumbnailUrl" type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} required placeholder={translations.thumbnailUrlPlaceholder}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">{translations.videoUrlLabel}</label>
          <input
            id="videoUrl" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required placeholder={translations.videoUrlPlaceholder}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-300">
            {translations.uploadButton}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadVideo;
