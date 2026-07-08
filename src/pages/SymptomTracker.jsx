import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import TopNav from '../components/sb/TopNav';
import BottomNav from '../components/sb/BottomNav';
import SymptomLogForm from '../components/symptoms/SymptomLogForm';
import SymptomTrendChart from '../components/symptoms/SymptomTrendChart';
import SymptomHistory from '../components/symptoms/SymptomHistory';
import FloatingIcon from '../components/sb/FloatingIcon';
import { Activity, Plus, BarChart2, List } from 'lucide-react';

function SymptomTrackerContent() {
    const { isBn } = useLang();
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('chart'); // log | chart | history
    const [todayLog, setTodayLog] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const init = async () => {
            try {
                const u = await base44.auth.me();
                setUser(u);
                const data = await base44.entities.SymptomLog.filter({ user_id: u.id }, '-log_date', 60);
                setLogs(data);
                setTodayLog(data.find(l => l.log_date === today) || null);
            } catch {}
            setLoading(false);
        };
        init();
    }, []);

    const onSaved = (log) => {
        setLogs(prev => {
            const exists = prev.find(l => l.id === log.id);
            if (exists) return prev.map(l => l.id === log.id ? log : l);
            return [log, ...prev];
        });
        setTodayLog(log);
        setTab('chart');
    };

    const onDelete = (id) => {
        setLogs(prev => prev.filter(l => l.id !== id));
        if (todayLog?.id === id) setTodayLog(null);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
            <div className="w-10 h-10 border-4 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
            <div className="card-sb p-8 text-center max-w-sm mx-auto">
                <Activity className="w-12 h-12 text-[#0F6E56] mx-auto mb-3" />
                <p className="font-semibold text-lg mb-2">{isBn ? 'লগইন প্রয়োজন' : 'Login Required'}</p>
                <p className="text-gray-500 text-sm mb-4">{isBn ? 'লক্ষণ ট্র্যাক করতে লগইন করুন।' : 'Please log in to track symptoms.'}</p>
                <button onClick={() => base44.auth.redirectToLogin(window.location.pathname)} className="btn-primary w-full">
                    {isBn ? 'লগইন' : 'Login'}
                </button>
            </div>
        </div>
    );

    const tabs = [
        { id: 'log', icon: Plus, labelBn: 'লগ করুন', labelEn: 'Log' },
        { id: 'chart', icon: BarChart2, labelBn: 'ট্রেন্ড', labelEn: 'Trends' },
        { id: 'history', icon: List, labelBn: 'ইতিহাস', labelEn: 'History' },
    ];

    return (
        <div className="min-h-screen bg-[#f8faf9] pb-24">
            <TopNav user={user} />

            <div className="max-w-2xl mx-auto px-4 pt-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5 fade-rise">
                    <FloatingIcon Icon={Activity} color="bg-purple-100 text-purple-600" size="md" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{isBn ? 'লক্ষণ ট্র্যাকার' : 'Symptom Tracker'}</h1>
                        <p className="text-xs text-gray-500">{isBn ? 'আপনার স্বাস্থ্যের প্যাটার্ন বুঝুন' : 'Understand your health patterns'}</p>
                    </div>
                </div>

                {/* Tab Bar */}
                <div className="flex gap-1 bg-gray-100 rounded-[12px] p-1 mb-5">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-sm font-semibold transition-all ${
                                tab === t.id ? 'bg-white text-[#0F6E56] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <t.icon className="w-4 h-4" />
                            {isBn ? t.labelBn : t.labelEn}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {tab === 'log' && (
                    <SymptomLogForm
                        user={user}
                        today={today}
                        existingLog={todayLog}
                        onSaved={onSaved}
                        isBn={isBn}
                    />
                )}
                {tab === 'chart' && (
                    <SymptomTrendChart logs={logs} isBn={isBn} />
                )}
                {tab === 'history' && (
                    <SymptomHistory logs={logs} isBn={isBn} onDelete={onDelete} />
                )}
            </div>

            <BottomNav />
        </div>
    );
}

export default function SymptomTracker() {
    return (
        <LanguageProvider>
            <SymptomTrackerContent />
        </LanguageProvider>
    );
}