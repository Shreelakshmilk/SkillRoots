
import React, { useEffect, useState } from 'react';
import { User, Translations, Item } from '../types';
import { db } from '../services/db';
import { ArrowLeft, ShoppingCart, MapPin, Lock, Star } from 'lucide-react';

interface ItemPageProps {
  itemId: string;
  user: User | null;
  translations: Translations;
  onBack: () => void;
  onBuy: (itemId: string) => void;
}

const ItemPage: React.FC<ItemPageProps> = ({ itemId, user, translations, onBack, onBuy }) => {
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
        const itemData = await db.getItemById(itemId);
        if (itemData) {
          setItem(itemData);
        }
    };
    fetchItem();
  }, [itemId]);

  if (!item) return <div className="p-8">Loading...</div>;
  
  const handleBuyNow = () => {
    onBuy(item.id);
  };

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-12">
        {/* Breadcrumb / Back */}
        <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
            <button onClick={onBack} className="hover:underline">Back to results</button>
            <span>›</span>
            <span className="text-orange-600 font-bold">Category</span>
            <span>›</span>
            <span className="truncate max-w-xs">{item.name}</span>
        </div>

      <div className="max-w-[1500px] mx-auto px-4 mt-4 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left: Image Gallery (Span 5) */}
        <div className="md:col-span-5 flex gap-4">
             {/* Thumbnails (Simulated) */}
             <div className="hidden lg:flex flex-col gap-3">
                 {[item.imageUrl, item.imageUrl, item.imageUrl].map((src, i) => (
                     <div key={i} className={`w-12 h-12 border rounded cursor-pointer flex items-center justify-center ${i === 0 ? 'border-orange-500 shadow-sm' : 'border-gray-300 hover:border-gray-500'}`}>
                         <img src={src} className="max-w-full max-h-full" alt="thumb"/>
                     </div>
                 ))}
             </div>
             {/* Main Image */}
             <div className="flex-1 flex items-center justify-center bg-white border border-gray-100 rounded-lg p-4 min-h-[400px]">
                 <img src={item.imageUrl} alt={item.name} className="max-h-[500px] max-w-full object-contain" />
             </div>
        </div>

        {/* Center: Info (Span 4) */}
        <div className="md:col-span-4 flex flex-col">
            <h1 className="text-2xl font-medium text-gray-900 leading-tight mb-2">{item.name}</h1>
            <div className="text-sm text-blue-600 mb-2 hover:underline cursor-pointer">Visit the {item.sellerName} Store</div>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-4">
                <div className="flex text-yellow-500 text-sm">
                    <Star size={16} fill="currentColor"/>
                    <Star size={16} fill="currentColor"/>
                    <Star size={16} fill="currentColor"/>
                    <Star size={16} fill="currentColor"/>
                    <Star size={16} fill="currentColor" className="text-gray-300"/>
                </div>
                <span className="text-sm text-blue-600 hover:underline">342 ratings</span>
            </div>

            {/* Price Block */}
            <div className="mb-4">
                 <div className="flex items-start">
                    <span className="text-sm relative top-1.5">₹</span>
                    <span className="text-3xl font-medium text-gray-900">{Math.floor(item.price).toLocaleString('en-IN')}</span>
                 </div>
                 <div className="text-sm text-gray-500">Inclusive of all taxes</div>
            </div>

            {/* Icons */}
            <div className="grid grid-cols-4 gap-2 mb-6 text-center text-xs text-blue-600">
                 <div className="flex flex-col items-center gap-1">
                     <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                         <Lock size={18}/>
                     </div>
                     <span>Secure transaction</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                     <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                         <MapPin size={18}/>
                     </div>
                     <span>SkillRoots Delivered</span>
                 </div>
            </div>

            {/* About */}
            <h4 className="font-bold text-base mb-2">About this item</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
                {item.description.split('. ').map((point, i) => (
                    point && <li key={i}>{point}{point.endsWith('.') ? '' : '.'}</li>
                ))}
                <li>Handcrafted by skilled artisans ensuring unique quality.</li>
                <li>Directly supports rural livelihood.</li>
            </ul>
        </div>

        {/* Right: Buy Box (Span 3) */}
        <div className="md:col-span-3">
             <div className="border border-gray-300 rounded-lg p-5 shadow-sm">
                 <div className="flex items-start mb-2">
                    <span className="text-sm relative top-0.5">₹</span>
                    <span className="text-2xl font-medium text-gray-900">{Math.floor(item.price).toLocaleString('en-IN')}</span>
                 </div>
                 
                 <div className="text-sm mb-4">
                     <span className="text-blue-600">FREE delivery</span> <span className="font-bold">Monday, June 26</span>. Details
                 </div>

                 <div className="text-lg text-green-700 font-medium mb-4">In stock</div>

                 <div className="space-y-3">
                     <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-full text-sm font-medium shadow-sm border border-yellow-500/50">
                         Add to Cart
                     </button>
                     <button 
                        onClick={handleBuyNow}
                        className="w-full bg-orange-400 hover:bg-orange-500 text-black py-2 rounded-full text-sm font-medium shadow-sm border border-orange-500/50"
                     >
                         {translations.buyNow}
                     </button>
                 </div>

                 <div className="text-xs text-gray-500 mt-4 space-y-2">
                     <div className="grid grid-cols-2">
                         <span>Ships from</span>
                         <span>SkillRoots</span>
                     </div>
                     <div className="grid grid-cols-2">
                         <span>Sold by</span>
                         <span className="text-blue-600 truncate">{item.sellerName}</span>
                     </div>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default ItemPage;
