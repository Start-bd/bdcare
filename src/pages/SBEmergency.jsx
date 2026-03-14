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
        setCountdown(5);
        let c = 5;
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
        setCountdown(5);
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
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-7 max-w-sm w-full text-center shadow-2xl">
                            {dispatched ? (
                                <>
                                    <div className="text-6xl mb-3 animate-bounce">🚑</div>
                                    <h3 className="text-xl font-bold text-[#D85A30] mb-1">{isBn ? 'অ্যাম্বুলেন্স ডাকা হয়েছে!' : 'Ambulance Dispatched!'}</h3>
                                    <p className="text-gray-500 text-sm mb-1">{isBn ? 'আপনার লোকেশন শেয়ার করা হয়েছে' : 'Your location has been shared'}</p>
                                    {user?.district && (
                                        <p className="text-xs font-semibold text-[#0F6E56] mb-3">📍 {user.district}</p>
                                    )}
                                    <p className="text-sm font-semibold text-[#0F6E56] mb-5">{isBn ? 'আনুমানিক সময়: ১০ মিনিট' : 'ETA: 10 minutes'}</p>
                                    <button onClick={cancelSOS} className="w-full py-3 bg-[#0F6E56] text-white rounded-[10px] font-bold">
                                        {isBn ? 'ঠিক আছে' : 'OK'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Animated ambulance */}
                                    <div className="relative h-20 overflow-hidden mb-4">
                                        <style>{`
                                            @keyframes ambulance-drive {
                                                0%   { transform: translateX(-80px); }
                                                100% { transform: translateX(340px); }
                                            }
                                            @keyframes siren-blink {
                                                0%, 100% { opacity: 1; }
                                                50%       { opacity: 0.2; }
                                            }
                                            .ambulance-move {
                                                animation: ambulance-drive 1.8s linear infinite;
                                                font-size: 3rem;
                                                display: inline-block;
                                            }
                                            .siren-blink {
                                                animation: siren-blink 0.5s ease-in-out infinite;
                                            }
                                        `}</style>
                                        {/* Road stripe */}
                                        <div className="absolute bottom-2 left-0 right-0 h-1 bg-gray-200 rounded" />
                                        <span className="ambulance-move absolute bottom-3">🚑</span>
                                        {/* Flashing siren dots */}
                                        <span className="siren-blink absolute top-1 left-1/2 -translate-x-1/2 flex gap-1">
                                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" style={{ animationDelay: '0.25s' }} />
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-[#D85A30] mb-1">
                                        {isBn ? 'অ্যাম্বুলেন্স ডাকা হচ্ছে' : 'Calling Ambulance'}
                                    </h3>

                                    {/* Countdown ring */}
                                    <div className="flex items-center justify-center my-4">
                                        <div className="relative w-20 h-20">
                                            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                                <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                                                <circle
                                                    cx="40" cy="40" r="34"
                                                    fill="none"
                                                    stroke="#D85A30"
                                                    strokeWidth="6"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${2 * Math.PI * 34}`}
                                                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 5)}`}
                                                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[#D85A30]">
                                                {countdown}
                                            </span>
                                        </div>
                                    </div>

                                    {/* User district */}
                                    {user?.district && (
                                        <p className="text-xs text-gray-500 mb-1">
                                            📍 {isBn ? 'আপনার জেলা:' : 'Your district:'} <span className="font-semibold text-gray-700">{user.district}</span>
                                        </p>
                                    )}

                                    {/* 3 nearest hospitals */}
                                    <div className="bg-[#f8faf9] rounded-[10px] p-3 mb-5 text-left space-y-1.5">
                                        <p className="text-xs font-semibold text-gray-500 mb-1">{isBn ? 'কাছের হাসপাতাল (ময়মনসিংহ)' : 'Nearest Hospitals (Mymensingh)'}</p>
                                        {hospitals.map((h, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                                                <span className="w-4 h-4 rounded-full bg-[#D85A30] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">{i + 1}</span>
                                                <span className="font-medium">{isBn ? h.name : h.nameEn}</span>
                                                <span className="ml-auto text-gray-400 flex-shrink-0">{isBn ? h.distBn : h.distEn}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={cancelSOS}
                                        className="w-full py-3 rounded-[10px] border-2 border-gray-300 text-gray-600 font-bold hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> বাতিল করুন
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