import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import TopNav from '../components/sb/TopNav';
import BottomNav from '../components/sb/BottomNav';
import { Plus, Trash2, Bell, CheckCircle2, Circle, Pill, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const FREQUENCIES = [
    { value: 'once_daily',       bn: 'দিনে একবার',       en: 'Once daily' },
    { value: 'twice_daily',      bn: 'দিনে দুইবার',      en: 'Twice daily' },
    { value: 'three_times_daily',bn: 'দিনে তিনবার',      en: 'Three times daily' },
    { value: 'four_times_daily', bn: 'দিনে চারবার',      en: 'Four times daily' },
    { value: 'as_needed',        bn: 'প্রয়োজনে',         en: 'As needed' },
];

const FREQ_TIMES = {
    once_daily: 1, twice_daily: 2, three_times_daily: 3, four_times_daily: 4, as_needed: 1
};

function defaultTimes(freq) {
    const count = FREQ_TIMES[freq] || 1;
    const defaults = ['08:00', '14:00', '20:00', '22:00'];
    return defaults.slice(0, count);
}

function today() {
    return new Date().toISOString().split('T')[0];
}

function MedicineReminderContent() {
    const { isBn } = useLang();
    const [user, setUser] = useState(null);
    const [reminders, setReminders] = useState([]);
    const [adherence, setAdherence] = useState({}); // { `${reminderId}_${time}_${date}`: bool }
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState({});

    const [form, setForm] = useState({
        medication_name: '',
        dosage: '',
        frequency: 'once_daily',
        times: ['08:00'],
        start_date: today(),
        end_date: '',
        instructions: '',
    });

    useEffect(() => {
        const init = async () => {
            try {
                const u = await base44.auth.me();
                setUser(u);
                const data = await base44.entities.MedicationReminder.filter({ user_id: u.id }, '-created_date', 50);
                setReminders(data);
                // Load adherence from localStorage
                const stored = localStorage.getItem(`med_adherence_${u.id}`);
                if (stored) setAdherence(JSON.parse(stored));
            } catch {}
            setLoading(false);
        };
        init();
    }, []);

    const saveAdherence = (next) => {
        setAdherence(next);
        if (user) localStorage.setItem(`med_adherence_${user.id}`, JSON.stringify(next));
    };

    const toggleDose = (reminderId, time) => {
        const key = `${reminderId}_${time}_${today()}`;
        const next = { ...adherence, [key]: !adherence[key] };
        saveAdherence(next);
    };

    const isDoseTaken = (reminderId, time) => !!adherence[`${reminderId}_${time}_${today()}`];

    const handleFreqChange = (freq) => {
        setForm(f => ({ ...f, frequency: freq, times: defaultTimes(freq) }));
    };

    const handleTimeChange = (idx, val) => {
        const times = [...form.times];
        times[idx] = val;
        setForm(f => ({ ...f, times }));
    };

    const handleAdd = async () => {
        if (!form.medication_name.trim()) return;
        setSaving(true);
        try {
            const record = await base44.entities.MedicationReminder.create({
                user_id: user.id,
                medication_name: form.medication_name.trim(),
                dosage: form.dosage.trim(),
                frequency: form.frequency,
                times: form.times,
                start_date: form.start_date,
                end_date: form.end_date || undefined,
                instructions: form.instructions.trim(),
                is_active: true,
                reminder_enabled: true,
            });
            setReminders(r => [record, ...r]);
            setForm({ medication_name: '', dosage: '', frequency: 'once_daily', times: ['08:00'], start_date: today(), end_date: '', instructions: '' });
            setShowForm(false);
        } catch {}
        setSaving(false);
    };

    const handleDelete = async (id) => {
        await base44.entities.MedicationReminder.delete(id);
        setReminders(r => r.filter(m => m.id !== id));
    };

    const toggleActive = async (reminder) => {
        const updated = await base44.entities.MedicationReminder.update(reminder.id, { is_active: !reminder.is_active });
        setReminders(r => r.map(m => m.id === reminder.id ? { ...m, is_active: updated.is_active } : m));
    };

    const activeReminders = reminders.filter(r => r.is_active);
    const inactiveReminders = reminders.filter(r => !r.is_active);

    // Today's adherence summary
    const totalDoses = activeReminders.reduce((acc, r) => acc + (r.times?.length || 1), 0);
    const takenDoses = activeReminders.reduce((acc, r) => acc + (r.times || ['08:00']).filter(t => isDoseTaken(r.id, t)).length, 0);
    const pct = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
            <div className="w-10 h-10 border-4 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
            <div className="card-sb p-8 text-center max-w-sm mx-auto">
                <Pill className="w-12 h-12 text-[#0F6E56] mx-auto mb-3" />
                <p className="font-semibold text-lg mb-2">{isBn ? 'লগইন প্রয়োজন' : 'Login Required'}</p>
                <p className="text-gray-500 text-sm mb-4">{isBn ? 'ওষুধ রিমাইন্ডার ব্যবহার করতে লগইন করুন।' : 'Please log in to use Medicine Reminders.'}</p>
                <button onClick={() => base44.auth.redirectToLogin(window.location.pathname)} className="btn-primary w-full">
                    {isBn ? 'লগইন' : 'Login'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8faf9] pb-24">
            <TopNav user={user} />

            <div className="max-w-2xl mx-auto px-4 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-xl font-bold text-[#0F6E56]">{isBn ? '💊 ওষুধ রিমাইন্ডার' : '💊 Medicine Reminder'}</h1>
                        <p className="text-sm text-gray-500">{isBn ? 'আপনার দৈনিক ওষুধ ট্র্যাক করুন' : 'Track your daily medications'}</p>
                    </div>
                    <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                        <Plus className="w-4 h-4" />
                        {isBn ? 'যোগ করুন' : 'Add'}
                    </button>
                </div>

                {/* Today's Progress */}
                {activeReminders.length > 0 && (
                    <div className="card-sb p-4 mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-700">{isBn ? 'আজকের অগ্রগতি' : "Today's Progress"}</span>
                            <span className="text-lg font-bold text-[#0F6E56]">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                                className="h-3 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: pct === 100 ? '#0F6E56' : '#1D9E75' }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{takenDoses}/{totalDoses} {isBn ? 'ডোজ নেওয়া হয়েছে' : 'doses taken'}</p>
                    </div>
                )}

                {/* Add Form */}
                {showForm && (
                    <div className="card-sb p-5 mb-5 border-l-4 border-[#0F6E56]">
                        <h2 className="font-bold text-gray-800 mb-4">{isBn ? 'নতুন ওষুধ যোগ করুন' : 'Add New Medication'}</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">{isBn ? 'ওষুধের নাম *' : 'Medication Name *'}</label>
                                <input
                                    className="w-full border border-[#e0e8e4] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                                    placeholder={isBn ? 'যেমন: Napa 500mg' : 'e.g. Paracetamol 500mg'}
                                    value={form.medication_name}
                                    onChange={e => setForm(f => ({ ...f, medication_name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">{isBn ? 'ডোজ' : 'Dosage'}</label>
                                <input
                                    className="w-full border border-[#e0e8e4] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                                    placeholder={isBn ? 'যেমন: ১ টি ট্যাবলেট' : 'e.g. 1 tablet'}
                                    value={form.dosage}
                                    onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">{isBn ? 'কতবার' : 'Frequency'}</label>
                                <select
                                    className="w-full border border-[#e0e8e4] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                                    value={form.frequency}
                                    onChange={e => handleFreqChange(e.target.value)}
                                >
                                    {FREQUENCIES.map(f => (
                                        <option key={f.value} value={f.value}>{isBn ? f.bn : f.en}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">{isBn ? 'সময়' : 'Time(s)'}</label>
                                <div className="flex flex-wrap gap-2">
                                    {form.times.map((t, idx) => (
                                        <input
                                            key={idx}
                                            type="time"
                                            className="border border-[#e0e8e4] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                                            value={t}
                                            onChange={e => handleTimeChange(idx, e.target.value)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{isBn ? 'শুরুর তারিখ' : 'Start Date'}</label>
                                    <input type="date" className="w-full border border-[#e0e8e4] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                                        value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{isBn ? 'শেষের তারিখ' : 'End Date'}</label>
                                    <input type="date" className="w-full border border-[#e0e8e4] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                                        value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">{isBn ? 'বিশেষ নির্দেশনা' : 'Instructions'}</label>
                                <input
                                    className="w-full border border-[#e0e8e4] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                                    placeholder={isBn ? 'যেমন: খাওয়ার পরে' : 'e.g. After meals'}
                                    value={form.instructions}
                                    onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={handleAdd} disabled={saving || !form.medication_name.trim()} className="btn-primary flex-1 py-2 disabled:opacity-50">
                                    {saving ? (isBn ? 'সেভ হচ্ছে...' : 'Saving...') : (isBn ? 'সংরক্ষণ করুন' : 'Save')}
                                </button>
                                <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-200 rounded-[10px] text-gray-600 text-sm font-semibold hover:bg-gray-50">
                                    {isBn ? 'বাতিল' : 'Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Reminders */}
                {activeReminders.length === 0 && !showForm ? (
                    <div className="card-sb p-10 text-center">
                        <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="font-semibold text-gray-500">{isBn ? 'কোনো ওষুধ নেই' : 'No medications added'}</p>
                        <p className="text-sm text-gray-400 mt-1">{isBn ? '"যোগ করুন" বাটনে ক্লিক করুন' : 'Click "Add" to get started'}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeReminders.map(reminder => (
                            <ReminderCard
                                key={reminder.id}
                                reminder={reminder}
                                isBn={isBn}
                                isDoseTaken={isDoseTaken}
                                toggleDose={toggleDose}
                                toggleActive={toggleActive}
                                handleDelete={handleDelete}
                                expanded={expanded}
                                setExpanded={setExpanded}
                            />
                        ))}
                    </div>
                )}

                {/* Inactive / Paused */}
                {inactiveReminders.length > 0 && (
                    <div className="mt-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{isBn ? 'বন্ধ করা ওষুধ' : 'Paused'}</p>
                        <div className="space-y-2">
                            {inactiveReminders.map(reminder => (
                                <ReminderCard
                                    key={reminder.id}
                                    reminder={reminder}
                                    isBn={isBn}
                                    isDoseTaken={isDoseTaken}
                                    toggleDose={toggleDose}
                                    toggleActive={toggleActive}
                                    handleDelete={handleDelete}
                                    expanded={expanded}
                                    setExpanded={setExpanded}
                                    dimmed
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}

function ReminderCard({ reminder, isBn, isDoseTaken, toggleDose, toggleActive, handleDelete, expanded, setExpanded, dimmed }) {
    const isExpanded = expanded[reminder.id];
    const freq = FREQUENCIES.find(f => f.value === reminder.frequency);
    const times = reminder.times || ['08:00'];
    const takenCount = times.filter(t => isDoseTaken(reminder.id, t)).length;
    const allTaken = takenCount === times.length;

    return (
        <div className={`card-sb overflow-hidden ${dimmed ? 'opacity-60' : ''}`}>
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${allTaken ? 'bg-green-100' : 'bg-[#eefaf5]'}`}>
                            <Pill className={`w-5 h-5 ${allTaken ? 'text-green-600' : 'text-[#0F6E56]'}`} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{reminder.medication_name}</p>
                            {reminder.dosage && <p className="text-xs text-gray-500">{reminder.dosage}</p>}
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-[#eefaf5] text-[#0F6E56] px-2 py-0.5 rounded-full font-medium">
                                    {isBn ? freq?.bn : freq?.en}
                                </span>
                                <span className="text-xs text-gray-400">{takenCount}/{times.length} {isBn ? 'আজ' : 'today'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setExpanded(e => ({ ...e, [reminder.id]: !e[reminder.id] }))} className="text-gray-400 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* Time checkboxes — always visible */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {times.map(time => {
                        const taken = isDoseTaken(reminder.id, time);
                        return (
                            <button
                                key={time}
                                onClick={() => reminder.is_active && toggleDose(reminder.id, time)}
                                disabled={!reminder.is_active}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                                    taken
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#0F6E56]'
                                }`}
                            >
                                {taken ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                                <Clock className="w-3 h-3" />
                                {time}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                    {reminder.instructions && (
                        <p className="text-xs text-gray-500 mb-3">📝 {reminder.instructions}</p>
                    )}
                    {reminder.start_date && (
                        <p className="text-xs text-gray-400 mb-3">
                            📅 {reminder.start_date}{reminder.end_date ? ` → ${reminder.end_date}` : ''}
                        </p>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => toggleActive(reminder)}
                            className="flex-1 text-xs py-2 border border-gray-200 rounded-[10px] font-semibold hover:bg-gray-50 text-gray-600"
                        >
                            <Bell className="w-3.5 h-3.5 inline mr-1" />
                            {reminder.is_active ? (isBn ? 'বন্ধ করুন' : 'Pause') : (isBn ? 'চালু করুন' : 'Resume')}
                        </button>
                        <button
                            onClick={() => handleDelete(reminder.id)}
                            className="flex-1 text-xs py-2 border border-red-200 rounded-[10px] font-semibold hover:bg-red-50 text-red-500"
                        >
                            <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                            {isBn ? 'মুছুন' : 'Delete'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MedicineReminder() {
    return (
        <LanguageProvider>
            <MedicineReminderContent />
        </LanguageProvider>
    );
}