import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLang } from './LanguageContext';
import LangToggle from './LangToggle';
import { Bell, PhoneCall } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TopNav({ user }) {
    const { isBn } = useLang();
    const navigate = useNavigate();

    return (
        <header className="bg-white border-b border-[#e0e8e4] sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
                {/* Logo */}
                <Link to={createPageUrl('SBDashboard')} className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg green-gradient flex items-center justify-center">
                        <span className="text-white font-bold text-sm">স্</span>
                    </div>
                    <span className="font-bold text-[#0F6E56] text-base leading-tight hidden sm:block">
                        স্বাস্থ্য বন্ধু
                    </span>
                </Link>

                {/* Desktop links */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                    <Link to={createPageUrl('SBDoctors')} className="hover:text-[#0F6E56]">{isBn ? 'ডাক্তার' : 'Doctors'}</Link>
                    <Link to={createPageUrl('SBMedicine')} className="hover:text-[#0F6E56]">{isBn ? 'ওষুধ' : 'Medicine'}</Link>
                    <Link to={createPageUrl('SBAIDoctor')} className="hover:text-[#0F6E56]">{isBn ? 'AI ডাক্তার' : 'AI Doctor'}</Link>
                    <Link to={createPageUrl('SBEmergency')} className="text-[#D85A30] font-semibold hover:opacity-80 flex items-center gap-1">
                        <PhoneCall className="w-4 h-4" />
                        {isBn ? 'জরুরি' : 'Emergency'}
                    </Link>
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    <LangToggle />
                    {user ? (
                        <>
                            <button className="relative p-2 text-gray-500 hover:text-[#0F6E56]">
                                <Bell className="w-5 h-5" />
                            </button>
                            <div
                                className="w-8 h-8 rounded-full green-gradient flex items-center justify-center text-white font-bold text-sm cursor-pointer"
                                onClick={() => navigate(createPageUrl('SBProfile'))}
                            >
                                {user.full_name?.charAt(0) || 'U'}
                            </div>
                        </>
                    ) : (
                        <Link to={createPageUrl('SBLanding')} className="btn-primary text-sm px-4 py-2 rounded-[10px]">
                            {isBn ? 'লগইন' : 'Login'}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}