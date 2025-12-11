
import React, { useState, useEffect } from 'react';
import { User, Translations, Item } from '../types';
import { db } from '../services/db';
import { ArrowLeft, CheckCircle, LoaderCircle, ShieldCheck, CreditCard, Smartphone, Landmark, Lock } from 'lucide-react';

interface PaymentPageProps {
  itemId: string;
  user: User | null;
  translations: Translations;
  onBack: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING';

const PaymentPage: React.FC<PaymentPageProps> = ({ itemId, user, translations, onBack, onSuccess }) => {
  const [item, setItem] = useState<Item | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [transactionId, setTransactionId] = useState('');
  
  // Form States
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('SBI');

  useEffect(() => {
    const fetchItem = async () => {
      const itemData = await db.getItemById(itemId);
      if (itemData) {
        setItem(itemData);
      }
    };
    fetchItem();
  }, [itemId]);

  const handlePayment = () => {
    setPaymentStep('processing');
    setIsLoading(true);
    
    // Simulate Gateway Delay
    setTimeout(async () => {
        setIsLoading(false);
        const txnId = `TXN_${Math.floor(Math.random() * 1000000000)}`;
        setTransactionId(txnId);
        
        if (user && item) {
             await db.addOrder(user.email, [item], item.price, method);
        }
        
        setPaymentStep('completed');
    }, 3000);
  };

  const handleComplete = () => {
    onSuccess();
  };

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
  };

  const formatExpiry = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
  };

  if (!item) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin text-orange-600" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
       <button onClick={onBack} className="flex items-center gap-2 text-orange-700 hover:text-orange-900 font-semibold mb-6">
            <ArrowLeft size={20}/>
            {translations.backToMarketplace || "Back"}
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Summary & Methods */}
        <div className="w-full md:w-1/3 space-y-4">
             {/* Order Summary */}
             <div className="bg-white p-6 rounded-xl shadow-md border border-orange-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Order Summary</h3>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between mb-4 text-sm text-gray-500">
                    <span>Tax & Fees</span>
                    <span>₹0</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dashed border-gray-300">
                    <span className="font-bold text-lg text-orange-800">{translations.amountToPay}</span>
                    <span className="font-bold text-lg text-orange-800">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
             </div>

             {/* Payment Methods Menu */}
             <div className="bg-white rounded-xl shadow-md border border-orange-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-bold text-gray-700">{translations.paymentSelectMethod}</h3>
                </div>
                <div className="flex flex-col">
                    <button 
                        onClick={() => setMethod('UPI')}
                        className={`p-4 flex items-center gap-3 text-left transition-colors ${method === 'UPI' ? 'bg-orange-50 text-orange-800 font-semibold border-l-4 border-orange-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <Smartphone size={20} />
                        {translations.payViaUPI}
                    </button>
                    <button 
                        onClick={() => setMethod('CARD')}
                        className={`p-4 flex items-center gap-3 text-left transition-colors ${method === 'CARD' ? 'bg-orange-50 text-orange-800 font-semibold border-l-4 border-orange-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <CreditCard size={20} />
                        {translations.payViaCard}
                    </button>
                    <button 
                        onClick={() => setMethod('NETBANKING')}
                        className={`p-4 flex items-center gap-3 text-left transition-colors ${method === 'NETBANKING' ? 'bg-orange-50 text-orange-800 font-semibold border-l-4 border-orange-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <Landmark size={20} />
                        {translations.payViaNetBanking}
                    </button>
                </div>
             </div>
        </div>

        {/* Right Side: Payment Details */}
        <div className="w-full md:w-2/3">
             <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-200 min-h-[400px] flex flex-col relative">
                
                {paymentStep === 'processing' && (
                    <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center rounded-xl">
                        <LoaderCircle className="animate-spin text-orange-600 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-gray-800">{translations.verifying}</h3>
                        <p className="text-gray-500 mt-2">{translations.redirecting}</p>
                    </div>
                )}

                {paymentStep === 'completed' ? (
                     <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center">
                        <CheckCircle size={80} className="text-green-500 mb-6" />
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">{translations.paymentSuccess}</h2>
                        <p className="text-gray-600 mb-6">{translations.orderPlaced}</p>
                        <div className="bg-gray-100 px-6 py-3 rounded-md mb-8">
                            <p className="text-sm text-gray-500">{translations.transactionId}</p>
                            <p className="font-mono font-bold text-gray-800">{transactionId}</p>
                        </div>
                        <button 
                            onClick={handleComplete}
                            className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors w-full md:w-auto"
                        >
                            View Orders
                        </button>
                     </div>
                ) : (
                    <>
                        {/* Header for Payment Area */}
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                             <ShieldCheck className="text-green-600" size={24} />
                             <h2 className="text-xl font-bold text-gray-800">{translations.paymentTitle}</h2>
                             <div className="flex-grow"></div>
                             <span className="text-xs text-gray-400 flex items-center gap-1"><Lock size={12}/> 100% Secure</span>
                        </div>

                        {/* UPI Payment Content */}
                        {method === 'UPI' && (
                            <div className="animate-fade-in space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{translations.orPayUsing}</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={handlePayment} className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-all">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mb-2">P</div>
                                            <span className="text-sm font-medium">{translations.phonePe}</span>
                                        </button>
                                        <button onClick={handlePayment} className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-all">
                                            <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-800 font-bold mb-2">G</div>
                                            <span className="text-sm font-medium">{translations.gPay}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                     <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                     </div>
                                     <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">OR</span>
                                     </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{translations.enterUpiId}</label>
                                    <input 
                                        type="text" 
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="e.g. mobileNumber@upi" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                        <CheckCircle size={12} /> Verified Merchant
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Card Payment Content */}
                        {method === 'CARD' && (
                            <div className="animate-fade-in space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{translations.cardNumber}</label>
                                    <input 
                                        type="text" 
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        placeholder="0000 0000 0000 0000" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{translations.expiryDate}</label>
                                        <input 
                                            type="text" 
                                            value={expiry}
                                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                            placeholder="MM/YY" 
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{translations.cvv}</label>
                                        <input 
                                            type="password" 
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/\D/g,'').substring(0,3))}
                                            placeholder="123" 
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{translations.cardHolderName}</label>
                                    <input 
                                        type="text" 
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        placeholder="Name on card" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Net Banking Content */}
                        {method === 'NETBANKING' && (
                            <div className="animate-fade-in space-y-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{translations.popularBanks}</label>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(bank => (
                                        <button 
                                            key={bank}
                                            onClick={() => setSelectedBank(bank)}
                                            className={`py-3 px-2 border rounded-lg text-sm font-medium transition-all ${selectedBank === bank ? 'border-orange-500 bg-orange-50 text-orange-800' : 'hover:border-gray-400'}`}
                                        >
                                            {bank}
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{translations.selectBank}</label>
                                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                                        <option>Select another bank</option>
                                        <option>Bank of Baroda</option>
                                        <option>Union Bank</option>
                                        <option>Canara Bank</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="flex-grow"></div>

                        {/* Pay Button */}
                        <div className="mt-8">
                            <button 
                                onClick={handlePayment}
                                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg flex justify-center items-center gap-2"
                            >
                                <span>{translations.verifyPayment}</span>
                                <span>₹{item.price.toLocaleString('en-IN')}</span>
                            </button>
                            <div className="text-center mt-4">
                                <p className="text-xs text-gray-400">
                                    By proceeding, you agree to our Terms & Conditions.
                                </p>
                            </div>
                        </div>
                    </>
                )}
             </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;
