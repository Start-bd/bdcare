import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, X, CheckCircle2 } from 'lucide-react';

const COMMON_SYMPTOMS = [
    { bn: 'মাথাব্যথা', en: 'Headache' },
    { bn: 'জ্বর', en: 'Fever' },
    { bn: 'কাশি', en: 'Cough' },
    { bn: 'গলা ব্যথা', en: 'Sore Throat' },
    { bn: 'পেটে ব্যথা', en: 'Stomach Pain' },
    { bn: 'বমি বমি ভাব', en: 'Nausea' },
    { bn: 'ক্লান্তি', en: 'Fatigue' },
    { bn: 'শ্বাস কষ্ট', en: 'Shortness of Breath' },
    { bn: 'পিঠ ব্যথা', en: 'Back Pain' },
    { bn: 'মাথা ঘোরা', en: 'Dizziness' },
    { bn: 'ঘুমের সমস্যা', en: 'Sleep Issues' },
    { bn: 'ক্ষুধামন্দা', en: 'Loss of Appetite' },
];

const SEVERITY_LABELS = [
    { val: 1, bn: 'খুব কম', en: 'Very Mild', color: 'bg-green-100 text-green-700 border-green-300' },
    { val: 2, bn: 'কম', en: 'Mild', color: 'bg-lime-100 text-lime-700 border-lime-300' },
    { val: 3, bn: 'মাঝারি', en: 'Moderate', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { val: 4, bn: 'বেশি', en: 'Severe', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { val: 5, bn: 'অতি বেশি', en: 'Very Severe', color: 'bg-red-100 text-red-700 border-red-300' },
];

const MOODS = [
    { val: 'great', emoji: '😄', bn: 'দারুণ', en: 'Great' },
    { val: 'good', emoji: '🙂', bn: 'ভালো', en: 'Good' },
    { val: 'okay', emoji: '😐', bn: 'ঠিকঠাক', en: 'Okay' },
    { val: 'bad', emoji: '😔', bn: 'খারাপ', en: 'Bad' },
    { val: 'terrible', emoji: '😫', bn: 'ভয়াবহ', en: 'Terrible' },
];

export default function SymptomLogForm({ user, today, existingLog, onSaved, isBn }) {
    const [selected, setSelected] = useState([]); // [{name, severity}]
    const [custom, setCustom] = useState('');
    const [overallSeverity, setOverallSeverity] = useState(3);
    const [mood, setMood] = useState('okay');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Populate from existing log
    useEffect(() => {
        if (existingLog) {
            setSelected(existingLog.symptoms || []);
            setOverallSeverity(existingLog.overall_severity || 3);
            setMood(existingLog.mood || 'okay');
            setNotes(existingLog.notes || '');
        }
    }, [existingLog]);

    const toggleSymptom = (name) => {
        setSelected(prev => {
            const exists = prev.find(s => s.name === name);
            if (exists) return prev.filter(s => s.name !== name);
            return [...prev, { name, severity: 3 }];
        });
    };

    const setSymptomSeverity = (name, severity) => {
        setSelected(prev => prev.map(s => s.name === name ? { ...s, severity } : s));
    };

    const addCustom = () => {
        const trimmed = custom.trim();
        if (!trimmed || selected.find(s => s.name === trimmed)) return;
        setSelected(prev => [...prev, { name: trimmed, severity: 3 }]);
        setCustom('');
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            user_id: user.id,
            log_date: today,
            symptoms: selected,
            overall_severity: overallSeverity,
            mood,
            notes: notes.trim(),
        };
        let log;
        if (existingLog) {
            log = await base44.entities.SymptomLog.update(existingLog.id, payload);
        } else {
            log = await base44.entities.SymptomLog.create(payload);
        }
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        onSaved(log);
    };

    const severityInfo = SEVERITY_LABELS.find(s => s.val === overallSeverity);

    return (
        <div className="space-y-5">
            {/* Date badge */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">
                    📅 {new Date(today + 'T00:00:00').toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                {existingLog && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{isBn ? 'আপডেট মোড' : 'Editing today'}</span>}
            </div>

            {/* Mood */}
            <div className="card-sb p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">{isBn ? 'আজ আপনি কেমন অনুভব করছেন?' : 'How are you feeling today?'}</p>
                <div className="flex justify-between gap-1">
                    {MOODS.map(m => (
                        <button key={m.val} onClick={() => setMood(m.val)}
                            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-[10px] border-2 transition-all ${mood === m.val ? 'border-[#0F6E56] bg-[#eefaf5]' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <span className="text-xl">{m.emoji}</span>
                            <span className="text-[10px] font-medium text-gray-600">{isBn ? m.bn : m.en}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Common Symptoms */}
            <div className="card-sb p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">{isBn ? 'লক্ষণ নির্বাচন করুন' : 'Select Symptoms'}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                    {COMMON_SYMPTOMS.map(s => {
                        const isSelected = !!selected.find(sel => sel.name === (isBn ? s.bn : s.en));
                        const name = isBn ? s.bn : s.en;
                        return (
                            <button key={name} onClick={() => toggleSymptom(name)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${isSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
                            >
                                {name}
                            </button>
                        );
                    })}
                </div>
                {/* Custom input */}
                <div className="flex gap-2">
                    <input
                        value={custom}
                        onChange={e => setCustom(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustom()}
                        placeholder={isBn ? 'অন্য লক্ষণ লিখুন...' : 'Add custom symptom...'}
                        className="flex-1 border border-[#e0e8e4] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                    <button onClick={addCustom} className="w-9 h-9 rounded-[10px] bg-purple-600 text-white flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Selected Symptoms with per-symptom severity */}
            {selected.length > 0 && (
                <div className="card-sb p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">{isBn ? 'তীব্রতা নির্ধারণ করুন' : 'Set Severity per Symptom'}</p>
                    <div className="space-y-3">
                        {selected.map(s => (
                            <div key={s.name}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                                    <button onClick={() => setSelected(prev => prev.filter(p => p.name !== s.name))}>
                                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                    </button>
                                </div>
                                <div className="flex gap-1.5">
                                    {SEVERITY_LABELS.map(sv => (
                                        <button key={sv.val} onClick={() => setSymptomSeverity(s.name, sv.val)}
                                            className={`flex-1 py-1.5 rounded-[8px] text-xs font-bold border-2 transition-all ${s.severity === sv.val ? sv.color + ' border-current' : 'bg-gray-50 text-gray-400 border-transparent'}`}
                                        >
                                            {sv.val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Overall Severity */}
            <div className="card-sb p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                    {isBn ? 'সামগ্রিক অনুভূতি' : 'Overall Wellness'}: <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${severityInfo?.color}`}>{isBn ? severityInfo?.bn : severityInfo?.en}</span>
                </p>
                <div className="flex gap-2">
                    {SEVERITY_LABELS.map(sv => (
                        <button key={sv.val} onClick={() => setOverallSeverity(sv.val)}
                            className={`flex-1 py-3 rounded-[10px] text-sm font-bold border-2 transition-all ${overallSeverity === sv.val ? sv.color + ' border-current' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}
                        >
                            {sv.val}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                    <span>{isBn ? 'সুস্থ' : 'Healthy'}</span>
                    <span>{isBn ? 'অসুস্থ' : 'Unwell'}</span>
                </div>
            </div>

            {/* Notes */}
            <div className="card-sb p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{isBn ? 'নোট (ঐচ্ছিক)' : 'Notes (optional)'}</p>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={isBn ? 'আজ কোনো বিশেষ কিছু...' : 'Any additional details about how you feel today...'}
                    rows={3}
                    className="w-full border border-[#e0e8e4] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                />
            </div>

            {/* Save */}
            <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full py-3 rounded-[12px] font-bold text-sm transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'btn-primary'} disabled:opacity-50`}
            >
                {saved ? <><CheckCircle2 className="w-4 h-4" />{isBn ? 'সংরক্ষিত!' : 'Saved!'}</> : saving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'আজকের লগ সংরক্ষণ করুন' : 'Save Today\'s Log')}
            </button>
        </div>
    );
}