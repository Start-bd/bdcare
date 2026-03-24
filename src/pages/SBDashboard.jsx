import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import TopNav from '../components/sb/TopNav';
import BottomNav from '../components/sb/BottomNav';
import DoctorCard from '../components/sb/DoctorCard';
import { Search, Stethoscope, Pill, FlaskConical, Heart, PhoneCall, Home, Shield, Bot, Video, Calendar, ChevronRight, Zap } from 'lucide-react';

const services = [
    { icon: Stethoscope, bn: 'ডাক্তার', en: 'Doctors', color: 'bg-emerald-100 text-emerald-600', page: 'SBDoctors' },
    { icon: Pill, bn: 'ওষুধ', en: 'Medicine', color: 'bg-blue-100 text-blue-600', page: 'SBMedicine' },
    { icon: FlaskConical, bn: 'ল্যাব টেস্ট', en: 'Lab Test', color: 'bg-purple-100 text-purple-600', page: 'SBDashboard' },
    { icon: Heart, bn: 'প্যাকেজ', en: 'Packages', color: 'bg-pink-100 text-pink-600', page: 'SBDashboard' },
    { icon: PhoneCall, bn: 'জরুরি', en: 'Emergency', color: 'bg-red-100 text-red-600', page: 'SBEmergency' },
    { icon: Home, bn: 'হোম কেয়ার', en: 'Home Care', color: 'bg-orange-100 text-orange-600', page: 'SBDashboard' },
    { icon: Shield, bn: 'ভল্ট', en: 'Vault', color: 'bg-indigo-100 text-indigo-600', page: 'SBVault' },
    { icon: Bot, bn: 'AI বন্ধু', en: 'AI Doc', color: 'bg-teal-100 text-teal-600', page: 'SBAIDoctor' },
];

function getGreeting(isBn) {
    const h = new Date().getHours();
    if (h < 12) return isBn ? 'সুপ্রভাত' : 'Good Morning';
    if (h < 17) return isBn ? 'শুভ দুপুর' : 'Good Afternoon';
    return isBn ? 'শুভ সন্ধ্যা' : 'Good Evening';
}

function DashboardContent() {
    const { isBn } = useLang();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
        base44.entities.Doctor.list('-rating', 3).then(setDoctors).catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-[#f8faf9] pb-20 md:pb-0">
            <TopNav user={user} />

            <main className="max-w-2xl mx-auto px-4 py-5 space-y-6">
                {/* Greeting */}
                <div>
                    <p className="text-sm text-gray-500">{getGreeting(isBn)} 👋</p>
                    <h1 className="text-xl font-bold text-gray-900">
                        {user ? (user.full_name || (isBn ? 'স্বাগতম' : 'Welcome')) : (isBn ? 'স্বাগতম' : 'Welcome')}
                    </h1>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={isBn ? 'ডাক্তার, সেবা খুঁজুন...' : 'Search doctors, services...'}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#e0e8e4] rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                        onKeyDown={e => e.key === 'Enter' && navigate(createPageUrl('SBDoctors') + '?q=' + searchQuery)}
                    />
                </div>

                {/* Instant Consult Banner */}
                <div className="green-gradient rounded-[14px] p-5 text-white flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-yellow-300" />
                            <span className="text-xs font-semibold text-yellow-200">{isBn ? 'তাৎক্ষণিক সেবা' : 'Instant Service'}</span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight">{isBn ? '২ মিনিটে ডাক্তার পান' : 'Get Doctor in 2 Minutes'}</h3>
                        <p className="text-sm text-white/80 mt-0.5">{isBn ? 'অনলাইন ডাক্তার এখনই উপলব্ধ' : 'Online doctors available now'}</p>
                    </div>
                    <Link to={createPageUrl('SBDoctors')} className="bg-white text-[#0F6E56] font-bold px-4 py-2 rounded-[10px] text-sm flex-shrink-0 hover:bg-[#eefaf5]">
                        {isBn ? 'শুরু করুন' : 'Start'}
                    </Link>
                </div>

                {/* Services grid */}
                <div>
                    <h2 className="font-bold text-gray-900 mb-3">{isBn ? 'সেবাসমূহ' : 'Services'}</h2>
                    <div className="grid grid-cols-4 gap-3">
                        {services.map((s, i) => (
                            <Link key={i} to={createPageUrl(s.page)} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-[14px] border border-[#e0e8e4] hover:border-[#0F6E56]/30 transition-colors">
                                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{isBn ? s.bn : s.en}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Available Doctors */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-gray-900">{isBn ? 'সেরা ডাক্তার' : 'Top Doctors'}</h2>
                        <Link to={createPageUrl('SBDoctors')} className="text-xs text-[#0F6E56] font-semibold flex items-center gap-1">
                            {isBn ? 'সব দেখুন' : 'View all'} <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {doctors.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            {isBn ? 'ডাক্তার লোড হচ্ছে...' : 'Loading doctors...'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {doctors.map(d => <DoctorCard key={d.id} doctor={d} />)}
                        </div>
                    )}
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 gap-3">
                    <Link to={createPageUrl('SBEmergency')} className="card-sb p-4 text-center border-red-200 hover:bg-red-50 transition-colors">
                        <PhoneCall className="w-6 h-6 text-red-500 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-red-600">{isBn ? 'জরুরি সেবা' : 'Emergency'}</p>
                        <p className="text-xs text-gray-500">999 / 16789</p>
                    </Link>
                    <Link to={createPageUrl('SBAIDoctor')} className="card-sb p-4 text-center hover:bg-teal-50 transition-colors">
                        <Bot className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-teal-700">{isBn ? 'AI ডাক্তার' : 'AI Doctor'}</p>
                        <p className="text-xs text-gray-500">{isBn ? 'বিনামূল্যে' : 'Free'}</p>
                    </Link>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}

export default function SBDashboard() {
    return (
        <LanguageProvider>
            <DashboardContent />
        </LanguageProvider>
    );
}