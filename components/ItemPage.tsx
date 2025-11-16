import React, { useEffect, useState } from 'react';
import { User, Translations, Item } from '../types';
import { db } from '../services/db';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

interface ItemPageProps {
  itemId: string;
  user: User | null;
  translations: Translations;
  onBack: () => void;
}

const ItemPage: React.FC<ItemPageProps> = ({ itemId, user, translations, onBack }) => {
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    const itemData = db.getItemById(itemId);
    if (itemData) {
      setItem(itemData);
    }
  }, [itemId]);

  if (!item) {
    return (
        <div className="text-center p-8">
            <p className="text-gray-600">Loading product...</p>
        </div>
    );
  }
  
  const handleBuyNow = () => {
    alert(translations.purchaseSuccess);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-orange-700 hover:text-orange-900 font-semibold mb-6">
            <ArrowLeft size={20}/>
            {translations.backToMarketplace}
        </button>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200 grid md:grid-cols-2 gap-8">
        
        <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-orange-900">{item.name}</h1>
            <p className="text-gray-500 mt-2">{translations.soldBy} <strong>{item.sellerName}</strong></p>
            
            <div className="my-6">
                <h4 className="font-bold text-lg text-gray-800 border-b pb-2 mb-2">{translations.productDescription}</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>

            <div className="flex-grow"></div>

            <div className="flex items-center justify-between mt-4">
                 <p className="font-bold text-3xl text-green-700">₹{item.price.toLocaleString('en-IN')}</p>
                 <button 
                    onClick={handleBuyNow} 
                    className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-transform transform hover:scale-105 duration-300 shadow-lg">
                    <ShoppingCart size={20}/>
                    {translations.buyNow}
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ItemPage;
