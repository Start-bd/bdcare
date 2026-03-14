import React, { useState, useRef, useEffect } from 'react';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import TopNav from '../components/sb/TopNav';
import BottomNav from '../components/sb/BottomNav';
import { PhoneCall, AlertCircle, X } from 'lucide-react';

const emergencyServices = [
    { emoji: '🚑', titleBn: 'অ্যাম্বুলেন্স', titleEn: 'Ambulance', descBn: '১০ মিনিটে', descEn: 'In 10 minutes', number: '999', color: 'border-red-200 bg-red-50' },
    { emoji: '💨', titleBn: 'অক্সিজেন সাপ্লাই', titleEn: 'Oxygen Supply', descBn: 'বাড়িতে ডেলিভারি', descEn: 'Home delivery', number: '16789', color: 'border-blue-200 bg-blue-50' },
    { emoji: '🏥', titleBn: 'ICU বেড', titleEn: 'ICU Bed', descBn: 'উপলব্ধ বেড খুঁজুন', descEn: 'Find available bed', number: '16789', color: 'border-purple-200 bg-purple-50' },
    { emoji: '🩸', titleBn: 'ব্লাড ব্যাংক', titleEn: 'Blood Bank', descBn: 'জরুরি দাতা', descEn: 'Emergency donor', number: '16789', color: 'border-pink-200 bg-pink-50' },
];

const hospitals = [
    { name: 'ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল', nameEn: 'Mymensingh Medical College Hospital', distBn: '৩.২ কিমি', distEn: '3.2 km', beds: 1000 },
    { name: 'শমরিতা হাসপাতাল', nameEn: 'Shamorita Hospital', distBn: '৪.৮ কিমি', distEn: '4.8 km', beds: 200 },
    { name: 'পপুলার ডায়াগনস্টিক সেন্টার', nameEn: 'Popular Diagnostic Centre', distBn: '৬.১ কিমি', distEn: '6.1 km', beds: 50 },
];

function EmergencyContent() {
    const { isBn } = useLang();
    const [user, setUser] = useState(null);
    const [sosActive, setSosActive] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [dispatched, setDispatched] = useState(false);
    const holdTimer = useRef(null);
    const countInterval = useRef(null);

    useEffect(() => {
        import('@/api/base44Client').then(({ base44 }) => base44.auth.me().then(setUser).catch(() => {}));
    }, []);

    const startSOS = () => {
        setSosActive(true);
        setCountdown(3);
        let c = 3;
        countInterval.current = setInterval(() => {
            c -= 1;
            setCountdown(c);
            if (c <= 0) {
                clearInterval(countInterval.current);
                setDispatched(true);
            }
        }, 1000);
    };

    const cancelSOS = () => {
        setSosActive(false);
        setDispatched(false);
        setCountdown(3);
        clearInterval(countInterval.current);
    };

    return (
        <div className="min-h-screen bg-[#f8faf9] pb-20 md:pb-0">
            <TopNav user={user} />

            <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
                {/* Red header */}
                <div className="bg-[#D85A30] rounded-[14px] p-5 text-white text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <h1 className="text-xl font-bold">{isBn ? 'জরুরি সেবা' : 'Emergency Services'}</h1>
                    <p className="text-sm text-white/80 mt-1">{isBn ? '২৪ ঘণ্টা, ৭ দিন সেবা প্রদান' : '24 hours, 7 days service'}</p>
                </div>

                {/* SOS Button */}
                <div className="text-center py-4">
                    <button
                        onMouseDown={startSOS}
                        onTouchStart={startSOS}
                        className="w-32 h-32 rounded-full bg-[#D85A30] text-white font-bold text-lg pulse-ring mx-auto flex flex-col items-center justify-center shadow-xl hover:bg-red-600 active:scale-95 transition-transform select-none"
                    >
                        <span className="text-3xl">SOS</span>
                        <span className="text-xs mt-1">{isBn ? 'চাপুন' : 'Press'}</span>
                    </button>
                    <p className="text-xs text-gray-400 mt-3">{isBn ? 'SOS বাটনে চাপুন' : 'Press SOS button for emergency'}</p>
                </div>

                {/* SOS Modal */}
                {sosActive && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[14px] p-8 max-w-sm w-full text-center">
                            {dispatched ? (
                                <>
                                    <div className="text-5xl mb-4">🚑</div>
                                    <h3 className="text-xl font-bold text-[#D85A30] mb-2">{isBn ? 'অ্যাম্বুলেন্স ডাকা হয়েছে!' : 'Ambulance Dispatched!'}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{isBn ? 'আপনার লোকেশন শেয়ার করা হয়েছে' : 'Your location has been shared'}</p>
                                    <p className="text-sm font-semibold text-[#0F6E56] mb-6">{isBn ? 'আনুমানিক সময়: ১০ মিনিট' : 'ETA: 10 minutes'}</p>
                                    <button onClick={cancelSOS} className="w-full py-3 bg-[#0F6E56] text-white rounded-[10px] font-bold">
                                        {isBn ? 'ঠিক আছে' : 'OK'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-[#D85A30] text-white text-4xl font-bold flex items-center justify-center mx-auto mb-4">
                                        {countdown}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{isBn ? 'অ্যাম্বুলেন্স ডাকা হচ্ছে...' : 'Calling Ambulance...'}</h3>
                                    <p className="text-gray-500 text-sm mb-6">{isBn ? 'আপনার লোকেশন শেয়ার হচ্ছে' : 'Sharing your location'}</p>
                                    <button onClick={cancelSOS} className="flex items-center gap-2 mx-auto text-gray-500 hover:text-red-500 text-sm">
                                        <X className="w-4 h-4" /> {isBn ? 'বাতিল করুন' : 'Cancel'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Emergency services grid */}
                <div className="grid grid-cols-2 gap-3">
                    {emergencyServices.map((s, i) => (
                        <a key={i} href={`tel:${s.number}`} className={`card-sb p-4 ${s.color} border-2 flex flex-col gap-2 hover:shadow-md transition-shadow`}>
                            <span className="text-3xl">{s.emoji}</span>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{isBn ? s.titleBn : s.titleEn}</p>
                                <p className="text-xs text-gray-500">{isBn ? s.descBn : s.descEn}</p>
                            </div>
                            <span className="text-xs font-bold text-[#D85A30] flex items-center gap-1">
                                <PhoneCall className="w-3 h-3" /> {s.number}
                            </span>
                        </a>
                    ))}
                </div>

                {/* Hotlines */}
                <div className="card-sb p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{isBn ? 'জরুরি হটলাইন' : 'Emergency Hotlines'}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <a href="tel:999" className="flex items-center gap-3 p-3 bg-red-50 rounded-[10px] hover:bg-red-100">
                            <PhoneCall className="w-6 h-6 text-red-500" />
                            <div>
                                <p className="font-bold text-red-600 text-xl">999</p>
                                <p className="text-xs text-gray-500">{isBn ? 'জাতীয় জরুরি' : 'National Emergency'}</p>
                            </div>
                        </a>
                        <a href="tel:16789" className="flex items-center gap-3 p-3 bg-[#eefaf5] rounded-[10px] hover:bg-green-100">
                            <PhoneCall className="w-6 h-6 text-[#0F6E56]" />
                            <div>
                                <p className="font-bold text-[#0F6E56] text-xl">16789</p>
                                <p className="text-xs text-gray-500">{isBn ? 'স্বাস্থ্য সেবা' : 'Health Helpline'}</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Nearby hospitals */}
                <div className="card-sb p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{isBn ? 'কাছের হাসপাতাল' : 'Nearby Hospitals'}</h3>
                    <div className="space-y-3">
                        {hospitals.map((h, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-[#e0e8e4] last:border-0">
                                <div>
                                    <p className="font-medium text-sm text-gray-900">{isBn ? h.name : h.nameEn}</p>
                                    <p className="text-xs text-gray-500">{isBn ? h.distBn : h.distEn} · {h.beds} {isBn ? 'বেড' : 'beds'}</p>
                                </div>
                                <a href="tel:999" className="text-xs text-[#0F6E56] font-semibold border border-[#0F6E56] px-2 py-1 rounded-[8px] hover:bg-[#eefaf5]">
                                    {isBn ? 'কল' : 'Call'}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}

export default function SBEmergency() {
    return <LanguageProvider><EmergencyContent /></LanguageProvider>;
}