import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import TopNav from '../components/sb/TopNav';
import BottomNav from '../components/sb/BottomNav';
import PaymentModal from '../components/sb/PaymentModal';
import { base44 } from '@/api/base44Client';
import { Search, ShoppingCart, Upload, Plus, Minus, X, Check } from 'lucide-react';

const CAT_FILTERS = [
    { key: 'all', bn: 'সব', en: 'All' },
    { key: 'painkiller', bn: 'ব্যথানাশক', en: 'Painkiller' },
    { key: 'antibiotic', bn: 'এন্টিবায়োটিক', en: 'Antibiotic' },
    { key: 'antidiabetic', bn: 'ডায়াবেটিস', en: 'Diabetic' },
    { key: 'vitamin', bn: 'ভিটামিন', en: 'Vitamin' },
    { key: 'antacid', bn: 'গ্যাস্ট্রিক', en: 'Antacid' },
    { key: 'oral_saline', bn: 'স্যালাইন', en: 'Saline' },
];

function MedicineContent() {
    const { isBn } = useLang();
    const [user, setUser] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [cart, setCart] = useState({});
    const [showCart, setShowCart] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [ordered, setOrdered] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
        base44.entities.Medicine.list('-created_date', 50).then(m => {
            setMedicines(m);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...medicines];
        if (category !== 'all') result = result.filter(m => m.category === category);
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(m => m.name_en?.toLowerCase().includes(q) || m.name_bn?.includes(q));
        }
        setFiltered(result);
    }, [medicines, category, search]);

    const addToCart = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
    const removeFromCart = (id) => setCart(c => {
        const next = { ...c };
        if (next[id] > 1) next[id]--;
        else delete next[id];
        return next;
    });

    const cartItems = Object.entries(cart).map(([id, qty]) => ({ ...medicines.find(m => m.id === id), qty })).filter(i => i.id);
    const cartTotal = cartItems.reduce((s, i) => s + (i.price * i.qty), 0);
    const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);

    const handleOrderSuccess = async () => {
        if (user) {
            await base44.entities.MedicineOrder.create({
                user_id: user.id,
                items_json: JSON.stringify(cartItems),
                total_amount: cartTotal,
                payment_method: 'bkash',
                delivery_status: 'confirmed',
            }).catch(() => {});
        }
        setShowPayment(false);
        setCart({});
        setShowCart(false);
        setOrdered(true);
    };

    if (ordered) return (
        <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center pb-20">
            <div className="text-center px-4">
                <div className="w-20 h-20 green-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{isBn ? 'অর্ডার সম্পন্ন!' : 'Order Placed!'}</h2>
                <p className="text-gray-500 text-sm mb-2">{isBn ? 'আনুমানিক ডেলিভারি: ২ ঘণ্টার মধ্যে' : 'Estimated delivery: within 2 hours'}</p>
                <button onClick={() => setOrdered(false)} className="btn-primary px-6 py-2 rounded-[10px] mt-4">
                    {isBn ? 'আরো কিনুন' : 'Shop More'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8faf9] pb-20 md:pb-0">
            <TopNav user={user} />

            <main className="max-w-2xl mx-auto px-4 py-5">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900">{isBn ? 'ওষুধ অর্ডার' : 'Medicine Delivery'}</h1>
                    <button onClick={() => setShowCart(true)} className="relative p-2">
                        <ShoppingCart className="w-6 h-6 text-[#0F6E56]" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D85A30] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Prescription upload */}
                <button className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#0F6E56] rounded-[14px] text-[#0F6E56] mb-4 hover:bg-[#eefaf5] transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-semibold">{isBn ? 'প্রেসক্রিপশন আপলোড করুন' : 'Upload Prescription'}</span>
                </button>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={isBn ? 'ওষুধের নাম খুঁজুন...' : 'Search medicines...'}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e0e8e4] rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                    />
                </div>

                {/* Category chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                    {CAT_FILTERS.map(f => (
                        <button key={f.key} onClick={() => setCategory(f.key)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${category === f.key ? 'bg-[#0F6E56] text-white' : 'bg-white border border-[#e0e8e4] text-gray-600'}`}
                        >
                            {isBn ? f.bn : f.en}
                        </button>
                    ))}
                </div>

                {/* Delivery banner */}
                <div className="flex items-center gap-2 p-3 bg-[#eefaf5] rounded-[10px] mb-4 text-sm text-[#0F6E56] font-medium">
                    🚀 {isBn ? '২ ঘণ্টার মধ্যে ডেলিভারি' : 'Delivery within 2 hours'}
                </div>

                {/* Medicine grid */}
                {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[1,2,3,4].map(i => <div key={i} className="card-sb h-32 animate-pulse bg-gray-100 rounded-[14px]" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filtered.map(med => (
                            <div key={med.id} className="card-sb p-3 flex flex-col gap-2">
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">{isBn && med.name_bn ? med.name_bn : med.name_en}</p>
                                    <p className="text-xs text-gray-500">{med.dosage}</p>
                                    <p className="text-xs text-[#0F6E56] font-medium mt-0.5">{med.manufacturer}</p>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <p className="font-bold text-[#0F6E56]">৳{med.price}</p>
                                    {cart[med.id] ? (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => removeFromCart(med.id)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Minus className="w-3 h-3 text-gray-600" />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{cart[med.id]}</span>
                                            <button onClick={() => addToCart(med.id)} className="w-6 h-6 rounded-full bg-[#0F6E56] flex items-center justify-center">
                                                <Plus className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => addToCart(med.id)} disabled={!med.in_stock}
                                            className={`w-7 h-7 rounded-full flex items-center justify-center ${med.in_stock ? 'bg-[#0F6E56] hover:bg-[#1D9E75]' : 'bg-gray-200'}`}
                                        >
                                            <Plus className={`w-4 h-4 ${med.in_stock ? 'text-white' : 'text-gray-400'}`} />
                                        </button>
                                    )}
                                </div>
                                {!med.in_stock && <span className="text-[10px] text-red-500">{isBn ? 'স্টকে নেই' : 'Out of stock'}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Cart drawer */}
            {showCart && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white w-full max-w-md rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">{isBn ? 'আপনার কার্ট' : 'Your Cart'}</h3>
                            <button onClick={() => setShowCart(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        {cartItems.length === 0 ? (
                            <p className="text-center text-gray-400 py-8">{isBn ? 'কার্ট খালি' : 'Cart is empty'}</p>
                        ) : (
                            <>
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-[#e0e8e4]">
                                        <div>
                                            <p className="font-medium text-sm">{isBn && item.name_bn ? item.name_bn : item.name_en}</p>
                                            <p className="text-xs text-gray-500">৳{item.price} × {item.qty}</p>
                                        </div>
                                        <p className="font-bold text-[#0F6E56]">৳{item.price * item.qty}</p>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between pt-3 font-bold text-lg mb-4">
                                    <span>{isBn ? 'মোট' : 'Total'}</span>
                                    <span className="text-[#0F6E56]">৳{cartTotal}</span>
                                </div>
                                <button onClick={() => { setShowCart(false); setShowPayment(true); }} className="btn-primary w-full py-3 rounded-[10px] font-bold">
                                    {isBn ? 'অর্ডার করুন' : 'Place Order'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showPayment && (
                <PaymentModal amount={cartTotal} onClose={() => setShowPayment(false)} onSuccess={handleOrderSuccess} showCOD={true} />
            )}

            <BottomNav />
        </div>
    );
}

export default function SBMedicine() {
    return <LanguageProvider><MedicineContent /></LanguageProvider>;
}