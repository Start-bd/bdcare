import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLang } from './LanguageContext';
import { Home, Stethoscope, Bot, Pill, User } from 'lucide-react';

const navItems = [
    { icon: Home,        labelBn: 'হোম',       labelEn: 'Home',     page: 'SBDashboard' },
    { icon: Stethoscope, labelBn: 'ডাক্তার',   labelEn: 'Doctors',  page: 'SBDoctors' },
    { icon: Bot,         labelBn: 'AI বন্ধু',  labelEn: 'AI Doc',   page: 'SBAIDoctor' },
    { icon: Pill,        labelBn: 'ওষুধ',      labelEn: 'Medicine', page: 'SBMedicine' },
    { icon: User,        labelBn: 'প্রোফাইল',  labelEn: 'Profile',  page: 'SBProfile' },
];

export default function BottomNav() {
    const { isBn } = useLang();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e8e4] z-50 bottom-nav md:hidden">
            <div className="flex items-center justify-around py-2">
                {navItems.map(item => {
                    const href = createPageUrl(item.page);
                    const active = location.pathname === href || location.pathname.startsWith(href + '/');
                    return (
                        <Link key={item.page} to={href} className="flex flex-col items-center gap-0.5 min-w-0 px-2 py-1">
                            <item.icon className={`w-5 h-5 ${active ? 'text-[#0F6E56]' : 'text-gray-400'}`} />
                            <span className={`text-[10px] font-medium truncate ${active ? 'text-[#0F6E56]' : 'text-gray-400'}`}>
                                {isBn ? item.labelBn : item.labelEn}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}