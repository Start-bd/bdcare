import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MOOD_EMOJI = { great: '😄', good: '🙂', okay: '😐', bad: '😔', terrible: '😫' };
const MOOD_SCORE = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };

const SEVERITY_COLOR = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

function formatDate(dateStr, isBn) {
    const d = new Date(dateStr + 'T00:00:00');
    if (isBn) {
        return `${d.getDate()}/${d.getMonth() + 1}`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getSeverityColor(val) {
    return SEVERITY_COLOR[Math.min(val - 1, 4)] || '#94a3b8';
}

const CustomTooltip = ({ active, payload, label, isBn }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
            <p className="font-bold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-medium">
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
};

export default function SymptomTrendChart({ logs, isBn }) {
    const [range, setRange] = useState(14); // days

    const sorted = [...logs]
        .sort((a, b) => a.log_date.localeCompare(b.log_date))
        .slice(-range);

    if (logs.length === 0) {
        return (
            <div className="card-sb p-10 text-center">
                <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">{isBn ? 'কোনো ডেটা নেই' : 'No data yet'}</p>
                <p className="text-sm text-gray-300 mt-1">{isBn ? 'প্রথমে একটি লগ তৈরি করুন' : 'Start by logging your first entry'}</p>
            </div>
        );
    }

    const chartData = sorted.map(l => ({
        date: formatDate(l.log_date, isBn),
        rawDate: l.log_date,
        severity: l.overall_severity || 0,
        mood: MOOD_SCORE[l.mood] || 3,
        symptoms: l.symptoms?.length || 0,
        moodEmoji: MOOD_EMOJI[l.mood] || '😐',
    }));

    // Stats
    const last7 = sorted.slice(-7);
    const prev7 = sorted.slice(-14, -7);
    const avgSeverity = last7.length ? (last7.reduce((a, l) => a + (l.overall_severity || 0), 0) / last7.length).toFixed(1) : 0;
    const prevAvg = prev7.length ? (prev7.reduce((a, l) => a + (l.overall_severity || 0), 0) / prev7.length).toFixed(1) : null;
    const trend = prevAvg !== null ? (avgSeverity - prevAvg) : 0;

    // Most frequent symptoms
    const symptomCount = {};
    sorted.forEach(l => (l.symptoms || []).forEach(s => { symptomCount[s.name] = (symptomCount[s.name] || 0) + 1; }));
    const topSymptoms = Object.entries(symptomCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return (
        <div className="space-y-5">
            {/* Range selector */}
            <div className="flex gap-2">
                {[7, 14, 30].map(r => (
                    <button key={r} onClick={() => setRange(r)}
                        className={`flex-1 py-2 rounded-[10px] text-sm font-semibold border transition-all ${range === r ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300'}`}
                    >
                        {isBn ? `${r} দিন` : `${r} days`}
                    </button>
                ))}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="card-sb p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">{avgSeverity}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{isBn ? 'গড় তীব্রতা' : 'Avg Severity'}</p>
                    {trend !== 0 && (
                        <div className={`flex items-center justify-center gap-0.5 text-xs mt-1 font-medium ${trend < 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {trend < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                            {Math.abs(trend).toFixed(1)}
                        </div>
                    )}
                </div>
                <div className="card-sb p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{last7.length}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{isBn ? 'লগ এন্ট্রি' : 'Log Entries'}</p>
                </div>
                <div className="card-sb p-3 text-center">
                    <p className="text-2xl">{MOOD_EMOJI[last7[last7.length - 1]?.mood] || '—'}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{isBn ? 'সর্বশেষ মুড' : 'Latest Mood'}</p>
                </div>
            </div>

            {/* Severity trend line */}
            <div className="card-sb p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">{isBn ? 'তীব্রতার ধারা' : 'Severity Trend'}</p>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip isBn={isBn} />} />
                        <Line
                            type="monotone" dataKey="severity"
                            name={isBn ? 'তীব্রতা' : 'Severity'}
                            stroke="#9333ea" strokeWidth={2.5}
                            dot={{ r: 4, fill: '#9333ea' }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone" dataKey="mood"
                            name={isBn ? 'মুড' : 'Mood'}
                            stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 3"
                            dot={{ r: 3, fill: '#06b6d4' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 justify-center text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-600 inline-block rounded" />{isBn ? 'তীব্রতা' : 'Severity'}</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan-500 inline-block rounded border-dashed" />{isBn ? 'মুড' : 'Mood'}</span>
                </div>
            </div>

            {/* Symptom frequency */}
            {topSymptoms.length > 0 && (
                <div className="card-sb p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">{isBn ? 'ঘন ঘন লক্ষণ' : 'Frequent Symptoms'}</p>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={topSymptoms.map(([name, count]) => ({ name: name.length > 12 ? name.slice(0, 10) + '…' : name, count }))}
                            margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" name={isBn ? 'দিন' : 'Days'} fill="#9333ea" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Daily severity colored dots */}
            <div className="card-sb p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">{isBn ? 'দৈনিক ক্যালেন্ডার' : 'Daily Calendar'}</p>
                <div className="flex flex-wrap gap-2">
                    {sorted.map(l => (
                        <div key={l.log_date} className="flex flex-col items-center gap-1">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: getSeverityColor(l.overall_severity || 1) }}
                                title={`${l.log_date}: severity ${l.overall_severity}`}
                            >
                                {new Date(l.log_date + 'T00:00:00').getDate()}
                            </div>
                            <span className="text-[10px] text-gray-400">{MOOD_EMOJI[l.mood]}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                    {SEVERITY_COLOR.map((c, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                            <span className="text-[10px] text-gray-400">{i + 1}</span>
                        </div>
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">({isBn ? 'তীব্রতা' : 'severity'})</span>
                </div>
            </div>
        </div>
    );
}