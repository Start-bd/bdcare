import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import TopNav from '../components/sb/TopNav';
import BottomNav from '../components/sb/BottomNav';
import DoctorCard, { SPECIALTY_LABELS } from '../components/sb/DoctorCard';
import GlobalSEO from '../components/seo/GlobalSEO';
import { Search, SlidersHorizontal, X, Stethoscope } from 'lucide-react';

const FILTERS = [
    { key: 'all', bn: 'সব', en: 'All' },
    { key: 'general', bn: 'সাধারণ', en: 'General' },
    { key: 'cardiology', bn: 'হৃদরোগ', en: 'Cardiology' },
    { key: 'pediatrics', bn: 'শিশু', en: 'Pediatrics' },
    { key: 'dermatology', bn: 'চর্মরোগ', en: 'Dermatology' },
    { key: 'orthopedics', bn: 'অর্থোপেডিক', en: 'Orthopedic' },
    { key: 'psychiatry', bn: 'মানসিক', en: 'Mental Health' },
    { key: 'gynecology', bn: 'গাইনি', en: 'Gynecology' },
];

const SORT_OPTIONS = [
    { key: 'rating', bn: 'রেটিং', en: 'Rating' },
    { key: 'fee_low', bn: 'ফি (কম)', en: 'Fee (Low)' },
    { key: 'experience', bn: 'অভিজ্ঞতা', en: 'Experience' },
];

function DoctorsContent() {
    const { isBn } = useLang();
    const [user, setUser] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [specialty, setSpecialty] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('rating');
    const [femaleOnly, setFemaleOnly] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get('q');
        if (q) setSearch(q);

        base44.entities.Doctor.list('-rating', 50).then(d => {
            setDoctors(d);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...doctors];
        if (specialty !== 'all') result = result.filter(d => d.specialty === specialty);
        if (femaleOnly) result = result.filter(d => d.is_female);
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(d =>
                d.name_en?.toLowerCase().includes(q) ||
                d.name_bn?.includes(q) ||
                d.specialty?.includes(q) ||
                d.hospital?.toLowerCase().includes(q)
            );
        }
        if (sort === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (sort === 'fee_low') result.sort((a, b) => (a.consultation_fee_video || 0) - (b.consultation_fee_video || 0));
        else if (sort === 'experience') result.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
        setFiltered(result);
    }, [doctors, specialty, search, femaleOnly, sort]);

    return (
        <div className="min-h-screen bg-[#f8faf9] pb-20 md:pb-0">
            <TopNav user={user} />

            <main className="max-w-2xl mx-auto px-4 py-5">
                <h1 className="text-xl font-bold text-gray-900 mb-4">
                    {isBn ? 'বিশেষজ্ঞ ডাক্তার' : 'Find Doctors'}
                </h1>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={isBn ? 'নাম, বিশেষজ্ঞতা খুঁজুন...' : 'Search by name, specialty...'}
                        className="w-full pl-10 pr-10 py-3 bg-white border border-[#e0e8e4] rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
                </div>

                {/* Specialty chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setSpecialty(f.key)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${specialty === f.key ? 'bg-[#0F6E56] text-white' : 'bg-white border border-[#e0e8e4] text-gray-600 hover:border-[#0F6E56]/40'}`}
                        >
                            {isBn ? f.bn : f.en}
                        </button>
                    ))}
                </div>

                {/* Sort + Female filter */}
                <div className="flex items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                            className="text-xs border border-[#e0e8e4] rounded-[8px] px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#0F6E56]"
                        >
                            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{isBn ? o.bn : o.en}</option>)}
                        </select>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                        <div
                            onClick={() => setFemaleOnly(!femaleOnly)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${femaleOnly ? 'bg-[#0F6E56]' : 'bg-gray-200'}`}
                        >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${femaleOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                        {isBn ? 'মহিলা ডাক্তার' : 'Female doctor'}
                    </label>
                </div>

                {/* Count */}
                <p className="text-xs text-gray-500 mb-3">
                    {filtered.length} {isBn ? 'জন ডাক্তার পাওয়া গেছে' : 'doctors found'}
                </p>

                {/* Doctor list */}
                {loading ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => <div key={i} className="card-sb h-36 animate-pulse bg-gray-100 rounded-[14px]" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>{isBn ? 'কোনো ডাক্তার পাওয়া যায়নি' : 'No doctors found'}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(d => <DoctorCard key={d.id} doctor={d} />)}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}

export default function SBDoctors() {
    return <LanguageProvider><DoctorsContent /></LanguageProvider>;
}