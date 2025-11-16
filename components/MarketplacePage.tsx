import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Translations, User, Item } from '../types';

interface MarketplacePageProps {
  translations: Translations;
  user: User | null;
  onItemSelect: (itemId: string) => void;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ translations, onItemSelect }) => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const allItems = db.getAllItems();
    setItems(allItems.slice().reverse());
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-orange-800 mb-8">{translations.exploreProducts}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200 cursor-pointer group transform transition-transform hover:-translate-y-1 flex flex-col"
            onClick={() => onItemSelect(item.id)}
          >
            <div className="relative">
                <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
                 <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-30 transition-all"></div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-orange-700">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{translations.soldBy} {item.sellerName}</p>
              <div className="flex-grow"></div>
              <p className="font-bold text-xl text-green-600 mt-4 self-end">₹{item.price.toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>
       {items.length === 0 && (
          <div className="text-center col-span-full py-16">
            <p className="text-gray-500">{translations.noProducts}</p>
          </div>
        )}
    </div>
  );
};

export default MarketplacePage;
