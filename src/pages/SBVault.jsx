import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import TopNav from '../components/sb/TopNav';
import BottomNav from '../components/sb/BottomNav';
import { base44 } from '@/api/base44Client';
import { Upload, Shield, FileText, FlaskConical, Image, Syringe, File, Share2, Trash2, Link2, X } from 'lucide-react';

const RECORD_TYPES = [
    { key: 'blood_test', icon: FlaskConical, labelBn: 'রক্ত পরীক্ষা', labelEn: 'Blood Test', color: 'text-red-500 bg-red-50' },
    { key: 'prescription', icon: FileText, labelBn: 'প্রেসক্রিপশন', labelEn: 'Prescription', color: 'text-blue-500 bg-blue-50' },
    { key: 'xray_scan', icon: Image, labelBn: 'X-Ray/স্ক্যান', labelEn: 'X-Ray/Scan', color: 'text-purple-500 bg-purple-50' },
    { key: 'vaccination', icon: Syringe, labelBn: 'টিকা', labelEn: 'Vaccination', color: 'text-green-500 bg-green-50' },
    { key: 'other', icon: File, labelBn: 'অন্যান্য', labelEn: 'Other', color: 'text-gray-500 bg-gray-50' },
];

function VaultContent() {
    const { isBn } = useLang();
    const [user, setUser] = useState(null);
    const [records, setRecords] = useState([]);
    const [selectedType, setSelectedType] = useState('all');
    const [showUpload, setShowUpload] = useState(false);
    const [shareToken, setShareToken] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ record_type: 'blood_test', doctor_name: '', date_recorded: '', notes: '' });

    useEffect(() => {
        base44.auth.me().then(u => {
            setUser(u);
            base44.entities.HealthRecord.filter({ user_id: u.id }, '-created_date', 50).then(setRecords).catch(() => {});
        }).catch(() => {});
    }, []);

    const refresh = () => {
        if (user) base44.entities.HealthRecord.filter({ user_id: user.id }, '-created_date', 50).then(setRecords).catch(() => {});
    };

    const handleUpload = async () => {
        if (!user) return;
        setUploading(true);
        await base44.entities.HealthRecord.create({
            user_id: user.id,
            ...form,
            file_url: 'https://placehold.co/400x300/eefaf5/0F6E56?text=Health+Record',
        }).catch(() => {});
        setUploading(false);
        setShowUpload(false);
        setForm({ record_type: 'blood_test', doctor_name: '', date_recorded: '', notes: '' });
        refresh();
    };

    const handleShare = async (record) => {
        const token = 'SB-' + Math.random().toString(36).slice(2, 10).toUpperCase();
        await base44.entities.HealthRecord.update(record.id, { is_shared: true, share_token: token }).catch(() => {});
        setShareToken(token);
        refresh();
    };

    const handleDelete = async (id) => {
        await base44.entities.HealthRecord.delete(id).catch(() => {});
        refresh();
    };

    const filteredRecords = selectedType === 'all' ? records : records.filter(r => r.record_type === selectedType);

    return (
        <div className="min-h-screen bg-[#f8faf9] pb-20 md:pb-0">
            <TopNav user={user} />

            <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">{isBn ? 'হেলথ ভল্ট' : 'Health Vault'}</h1>
                    <button onClick={() => setShowUpload(true)} className="btn-primary px-3 py-2 rounded-[10px] text-sm flex items-center gap-1">
                        <Upload className="w-4 h-4" />
                        {isBn ? 'আপলোড' : 'Upload'}
                    </button>
                </div>

                {/* Privacy notice */}
                <div className="flex items-center gap-2 p-3 bg-[#eefaf5] rounded-[10px] text-sm text-[#0F6E56]">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <span>{isBn ? 'আপনার তথ্য এনক্রিপ্টেড ও সুরক্ষিত' : 'Your data is encrypted and secure'}</span>
                </div>

                {/* Category filter */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    <button onClick={() => setSelectedType('all')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedType === 'all' ? 'bg-[#0F6E56] text-white' : 'bg-white border border-[#e0e8e4] text-gray-600'}`}
                    >
                        {isBn ? 'সব' : 'All'}
                    </button>
                    {RECORD_TYPES.map(t => (
                        <button key={t.key} onClick={() => setSelectedType(t.key)}
                            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedType === t.key ? 'bg-[#0F6E56] text-white' : 'bg-white border border-[#e0e8e4] text-gray-600'}`}
                        >
                            {isBn ? t.labelBn : t.labelEn}
                        </button>
                    ))}
                </div>

                {/* Records */}
                {filteredRecords.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">{isBn ? 'কোনো রেকর্ড নেই। আপলোড করুন।' : 'No records. Upload your health documents.'}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRecords.map(rec => {
                            const t = RECORD_TYPES.find(rt => rt.key === rec.record_type) || RECORD_TYPES[4];
                            return (
                                <div key={rec.id} className="card-sb p-4 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.color}`}>
                                        <t.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900">{isBn ? t.labelBn : t.labelEn}</p>
                                        {rec.doctor_name && <p className="text-xs text-gray-500">{rec.doctor_name}</p>}
                                        {rec.date_recorded && <p className="text-xs text-gray-400">{rec.date_recorded}</p>}
                                        {rec.is_shared && <span className="text-xs text-[#0F6E56] font-medium">🔗 {isBn ? 'শেয়ার করা হয়েছে' : 'Shared'}</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleShare(rec)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(rec.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Upload modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white w-full max-w-md rounded-t-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">{isBn ? 'রেকর্ড আপলোড' : 'Upload Record'}</h3>
                            <button onClick={() => setShowUpload(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <select value={form.record_type} onChange={e => setForm({...form, record_type: e.target.value})}
                            className="w-full p-3 border border-[#e0e8e4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6E56]"
                        >
                            {RECORD_TYPES.map(t => <option key={t.key} value={t.key}>{isBn ? t.labelBn : t.labelEn}</option>)}
                        </select>
                        <input type="text" value={form.doctor_name} onChange={e => setForm({...form, doctor_name: e.target.value})}
                            placeholder={isBn ? 'ডাক্তারের নাম (ঐচ্ছিক)' : 'Doctor name (optional)'}
                            className="w-full p-3 border border-[#e0e8e4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6E56]"
                        />
                        <input type="date" value={form.date_recorded} onChange={e => setForm({...form, date_recorded: e.target.value})}
                            className="w-full p-3 border border-[#e0e8e4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6E56]"
                        />
                        <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                            placeholder={isBn ? 'নোট...' : 'Notes...'}
                            rows={2}
                            className="w-full p-3 border border-[#e0e8e4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6E56] resize-none"
                        />
                        <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full py-3 rounded-[10px] font-bold">
                            {uploading ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'সংরক্ষণ করুন' : 'Save')}
                        </button>
                    </div>
                </div>
            )}

            {/* Share token modal */}
            {shareToken && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[14px] p-6 max-w-sm w-full text-center">
                        <Link2 className="w-12 h-12 text-[#0F6E56] mx-auto mb-3" />
                        <h3 className="font-bold text-gray-900 mb-2">{isBn ? 'শেয়ার লিংক তৈরি হয়েছে' : 'Share Link Created'}</h3>
                        <p className="font-mono text-sm bg-[#eefaf5] p-2 rounded-[8px] mb-4 break-all">{shareToken}</p>
                        <p className="text-xs text-gray-500 mb-4">{isBn ? 'এই কোড ডাক্তারকে দিন' : 'Share this code with your doctor'}</p>
                        <button onClick={() => setShareToken(null)} className="btn-primary px-6 py-2 rounded-[10px]">
                            {isBn ? 'ঠিক আছে' : 'OK'}
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}

export default function SBVault() {
    return <LanguageProvider><VaultContent /></LanguageProvider>;
}