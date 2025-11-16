import React, { useState } from 'react';
import { User, Translations } from '../types';
import { db } from '../services/db';

interface SellItemProps {
  user: User;
  translations: Translations;
  onSellSuccess: () => void;
}

const SellItem: React.FC<SellItemProps> = ({ user, translations, onSellSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const priceNumber = parseFloat(price);
    if (!name || !description || !price || !imageUrl || isNaN(priceNumber) || priceNumber <= 0) {
      setError(translations.fillFields);
      return;
    }
    db.addItem(user.email, user.name, name, description, priceNumber, imageUrl);
    setSuccess(translations.sellSuccess);
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');

    setTimeout(() => {
        onSellSuccess();
    }, 1500);
  };

  return (
    <div className="w-full bg-white p-8 rounded-xl shadow-lg border border-orange-200 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-orange-800 mb-2">{translations.sellTitle}</h2>
      <p className="text-center text-gray-500 mb-6">{translations.sellSubtitle}</p>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">{translations.itemNameLabel}</label>
          <input
            id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">{translations.itemDescLabel}</label>
          <textarea
            id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">{translations.itemPriceLabel}</label>
          <input
            id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0.01" step="0.01"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">{translations.itemImageUrlLabel}</label>
          <input
            id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required placeholder={translations.itemImageUrlPlaceholder}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-300">
            {translations.sellButton}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellItem;