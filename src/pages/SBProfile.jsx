import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import TopNav from '../components/sb/TopNav';
import BottomNav from '../components/sb/BottomNav';
import { base44 } from '@/api/base44Client';
import { User, Calendar, Shield, Pill, CreditCard, Globe, Bell, LogOut, ChevronRight, Edit2, Check, X } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function ProfileContent() {
    const { isBn, toggleLang } = useLang();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        base44.auth.me().then(u => {
            setUser(u);
            setForm({
                blood_group: u.blood_group || '',
                weight: u.weight || '',
                height: u.height || '',
                address_district: u.address_district || '',
            });
        }).catch(() => {});
    }, []);

    const healthId = user ? ('BDH-' + (user.id?.slice(0, 6) || '000000').toUpperCase()) : 'BDH-......';

    const handleSave = async () => {
        setSaving(true);
        await base44.auth.updateMe(form).catch(() => {});
        const updated = await base44.auth.me().catch(() => user);
        setUser(updated);
        setSaving(false);
        setEditing(false);
    };

    const menuItems = [
        { icon: Calendar, labelBn: 'আমার অ্যাপয়েন্টমেন্ট', labelEn: 'My Appointments', action: () => {} },
        { icon: Shield, labelBn: 'হেলথ রেকর্ড', labelEn: 'Health Records', action: () => navigate(createPageUrl('SBVault')) },
        { icon: Pill, labelBn: 'প্রেসক্রিপশন', labelEn: 'Prescriptions', action: () => {} },
        { icon: CreditCard, labelBn: 'পেমেন্ট ইতিহাস', labelEn: 'Payment History', action: () => {} },
        { icon: Globe, labelBn: 'ভাষা পরিবর্তন', labelEn: 'Language Setting', action: toggleLang },
        { icon: Bell, labelBn: 'নোটিফিকেশন', labelEn: 'Notifications', action: () => {} },
    ];

    return (
        <div className="min-h-screen bg-[#f8faf9] pb-20 md:pb-0">
            <TopNav user={user} />

            <main className="max-w-md mx-auto px-4 py-5 space-y-5">
                {/* Profile header */}
                <div className="card-sb p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full green-gradient flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-gray-900 text-lg truncate">{user?.full_name || (isBn ? 'ব্যবহারকারী' : 'User')}</h2>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        <div className="mt-1 inline-flex items-center gap-1 bg-[#eefaf5] text-[#0F6E56] px-2 py-0.5 rounded-full">
                            <Shield className="w-3 h-3" />
                            <span className="text-xs font-mono font-semibold">{healthId}</span>
                        </div>
                    </div>
                    <button onClick={() => setEditing(!editing)} className="p-2 text-gray-400 hover:text-[#0F6E56]">
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Health stats */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { labelBn: 'রক্তের গ্রুপ', labelEn: 'Blood', value: user?.blood_group || '—', color: 'text-red-500' },
                        { labelBn: 'ওজন', labelEn: 'Weight', value: user?.weight ? user.weight + 'kg' : '—', color: 'text-blue-500' },
                        { labelBn: 'উচ্চতা', labelEn: 'Height', value: user?.height ? user.height + 'cm' : '—', color: 'text-green-500' },
                        { labelBn: 'জেলা', labelEn: 'District', value: user?.address_district || '—', color: 'text-purple-500' },
                    ].map((stat, i) => (
                        <div key={i} className="card-sb p-3 text-center">
                            <p className={`font-bold text-sm ${stat.color}`}>{stat.value}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{isBn ? stat.labelBn : stat.labelEn}</p>
                        </div>
                    ))}
                </div>

                {/* Edit form */}
                {editing && (
                    <div className="card-sb p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900">{isBn ? 'তথ্য আপডেট করুন' : 'Update Info'}</h3>
                        <select value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})}
                            className="w-full p-2.5 border border-[#e0e8e4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6E56]"
                        >
                            <option value="">{isBn ? 'রক্তের গ্রুপ' : 'Blood Group'}</option>
                            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})}
                                placeholder={isBn ? 'ওজন (kg)' : 'Weight (kg)'}
                                className="p-2.5 border border-[#e0e8e4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6E56]"
                            />
                            <input type="number" value={form.height} onChange={e => setForm({...form, height: e.target.value})}
                                placeholder={isBn ? 'উচ্চতা (cm)' : 'Height (cm)'}
                                className="p-2.5 border border-[#e0e8e4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6E56]"
                            />
                        </div>
                        <input type="text" value={form.address_district} onChange={e => setForm({...form, address_district: e.target.value})}
                            placeholder={isBn ? 'জেলা' : 'District'}
                            className="w-full p-2.5 border border-[#e0e8e4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6E56]"
                        />
                        <div className="flex gap-2">
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 btn-primary py-2.5 rounded-[10px] text-sm font-semibold flex items-center justify-center gap-1"
                            >
                                <Check className="w-4 h-4" />
                                {saving ? (isBn ? 'সংরক্ষণ...' : 'Saving...') : (isBn ? 'সংরক্ষণ' : 'Save')}
                            </button>
                            <button onClick={() => setEditing(false)}
                                className="px-4 py-2.5 border border-[#e0e8e4] rounded-[10px] text-sm text-gray-500 hover:bg-gray-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Menu */}
                <div className="card-sb overflow-hidden">
                    {menuItems.map((item, i) => (
                        <button key={i} onClick={item.action}
                            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#f8faf9] transition-colors border-b border-[#e0e8e4] last:border-0 text-left"
                        >
                            <item.icon className="w-5 h-5 text-[#0F6E56] flex-shrink-0" />
                            <span className="flex-1 text-sm font-medium text-gray-700">{isBn ? item.labelBn : item.labelEn}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                    ))}
                </div>

                {/* Sign out */}
                <button
                    onClick={() => base44.auth.logout()}
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-semibold text-sm hover:bg-red-50 rounded-[14px] border border-red-100 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    {isBn ? 'সাইন আউট' : 'Sign Out'}
                </button>
            </main>

            <BottomNav />
        </div>
    );
}

export default function SBProfile() {
    return <LanguageProvider><ProfileContent /></LanguageProvider>;
}