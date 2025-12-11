
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Translations, User, Item } from '../types';
import { Star, Check } from 'lucide-react';

interface MarketplacePageProps {
  translations: Translations;
  user: User | null;
  onItemSelect: (itemId: string) => void;
  searchQuery?: string;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ translations, onItemSelect, searchQuery = '' }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
        const allItems = await db.getAllItems();
        setItems(allItems.slice().reverse());
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
        setFilteredItems(items);
    } else {
        const query = searchQuery.toLowerCase();
        const filtered = items.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query) ||
            item.sellerName.toLowerCase().includes(query)
        );
        setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  return (
    <div className="animate-fade-in bg-white min-h-screen">
      <div className="flex border-b border-gray-200 px-4 py-2 bg-white shadow-sm mb-4 overflow-x-auto">
          {['Fresh', 'Mobiles', 'Fashion', 'Home', 'Electronics', 'Crafts', 'Beauty', 'Toys'].map(cat => (
              <button key={cat} className="px-4 py-1 text-sm text-gray-700 hover:text-orange-600 whitespace-nowrap">
                  {cat}
              </button>
          ))}
      </div>

      <div className="max-w-[1500px] mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
            {searchQuery ? `Results for "${searchQuery}"` : "Results"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map((item) => (
            <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer flex flex-col overflow-hidden"
                onClick={() => onItemSelect(item.id)}
            >
                {/* Image Area */}
                <div className="h-56 p-4 bg-gray-50 flex items-center justify-center relative">
                    <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    {/* Sponsored Tag (Simulated) */}
                    {Math.random() > 0.7 && (
                        <span className="absolute top-2 right-2 text-[10px] text-gray-400 border border-gray-300 px-1 rounded">Sponsored</span>
                    )}
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-gray-900 font-medium leading-tight line-clamp-3 hover:text-orange-600 mb-1">
                        {item.name}
                    </h3>
                    
                    {/* Ratings */}
                    <div className="flex items-center gap-1 mb-2">
                         <div className="flex text-yellow-500">
                             {[1,2,3,4].map(i => <Star key={i} size={14} fill="currentColor" />)}
                             <Star size={14} fill="currentColor" className="text-yellow-500 opacity-50" />
                         </div>
                         <span className="text-xs text-blue-600 hover:underline cursor-pointer">1,204</span>
                    </div>

                    {/* Price */}
                    <div className="mt-auto">
                        <div className="flex items-start">
                            <span className="text-xs relative top-1">₹</span>
                            <span className="text-2xl font-medium text-gray-900">{Math.floor(item.price).toLocaleString('en-IN')}</span>
                            <span className="text-xs relative top-1">00</span>
                        </div>
                        <div className="text-xs text-gray-500">M.R.P: <span className="line-through">₹{(item.price * 1.2).toFixed(0)}</span> (20% off)</div>
                    </div>

                    {/* Prime / Delivery Info */}
                    <div className="mt-2 text-xs">
                        <div className="flex items-center gap-1 text-gray-700">
                             <Check size={12} className="text-orange-500 font-bold" />
                             <span className="font-bold text-blue-600">Prime</span>
                             <span className="text-gray-500">Get it by</span>
                             <span className="font-bold">Tomorrow</span>
                        </div>
                        <div className="text-gray-500 mt-1">FREE Delivery by SkillRoots</div>
                    </div>
                </div>
            </div>
            ))}
        </div>
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No products found matching "{searchQuery}".</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
