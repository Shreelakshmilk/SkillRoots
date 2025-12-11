
import React, { useState, useEffect } from 'react';
import { User, Translations, Order } from '../types';
import { db } from '../services/db';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

interface OrdersPageProps {
  user: User;
  translations: Translations;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ user, translations }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const userOrders = await db.getOrdersForUser(user.email);
      setOrders(userOrders.slice().reverse());
      setIsLoading(false);
    };
    fetchOrders();
  }, [user.email]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
           <Package size={64} className="mx-auto text-gray-300 mb-4" />
           <p className="text-xl text-gray-500">You haven't placed any orders yet.</p>
           <button className="mt-4 text-orange-600 font-medium hover:underline">
               Start Shopping
           </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex gap-8 text-sm text-gray-600">
                        <div>
                            <p className="uppercase text-xs font-bold text-gray-500">Order Placed</p>
                            <p>{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="uppercase text-xs font-bold text-gray-500">Total</p>
                            <p className="font-medium text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="hidden sm:block">
                             <p className="uppercase text-xs font-bold text-gray-500">Order ID</p>
                             <p className="font-mono">{order.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {order.status === 'completed' && <span className="flex items-center gap-1 text-green-600 text-sm font-bold"><CheckCircle size={16}/> Paid</span>}
                    </div>
                </div>

                {/* Items */}
                <div className="p-6">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4">
                             <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-contain border border-gray-200 rounded-md bg-white" />
                             <div className="flex-1">
                                 <h3 className="font-bold text-lg text-gray-800 hover:text-orange-600 cursor-pointer">{item.name}</h3>
                                 <p className="text-sm text-gray-500 mb-2">Sold by: {item.sellerName}</p>
                                 <div className="flex items-center gap-2 mt-2">
                                     <button className="text-sm bg-orange-400 text-white px-4 py-1.5 rounded-md hover:bg-orange-500">Buy it again</button>
                                     <button className="text-sm border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-50">View item</button>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
                
                {/* Footer status */}
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                     <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                         <Truck size={16} /> Arriving by {new Date(new Date(order.date).setDate(new Date(order.date).getDate() + 5)).toDateString()}
                     </p>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
