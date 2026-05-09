import React from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const MOOD_EMOJI = { great: '😄', good: '🙂', okay: '😐', bad: '😔', terrible: '😫' };
const SEVERITY_LABELS_EN = ['', 'Very Mild', 'Mild', 'Moderate', 'Severe', 'Very Severe'];
const SEVERITY_LABELS_BN = ['', 'খুব কম', 'কম', 'মাঝারি', 'বেশি', 'অতি বেশি'];
const SEVERITY_COLORS = ['', 'text-green-600 bg-green-50', 'text-lime-600 bg-lime-50', 'text-yellow-600 bg-yellow-50', 'text-orange-600 bg-orange-50', 'text-red-600 bg-red-50'];

export default function SymptomHistory({ logs, isBn, onDelete }) {
    const [expanded, setExpanded] = useState({});
    const [deleting, setDeleting] = useState(null);

    const sorted = [...logs].sort((a, b) => b.log_date.localeCompare(a.log_date));

    const handleDelete = async (id) => {
        setDeleting(id);
        await base44.entities.SymptomLog.delete(id);
        onDelete(id);
        setDeleting(null);
    };

    if (sorted.length === 0) return (
        <div className="card-sb p-10 text-center text-gray-400">
            <p className="font-medium">{isBn ? 'কোনো ইতিহাস নেই' : 'No history yet'}</p>
        </div>
    );

    return (
        <div className="space-y-3">
            {sorted.map(log => {
                const isOpen = expanded[log.id];
                const sev = log.overall_severity || 1;
                return (
                    <div key={log.id} className="card-sb overflow-hidden">
                        <button
                            className="w-full flex items-center gap-3 p-4 text-left"
                            onClick={() => setExpanded(e => ({ ...e, [log.id]: !e[log.id] }))}
                        >
                            <span className="text-xl">{MOOD_EMOJI[log.mood] || '😐'}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm">
                                    {new Date(log.log_date + 'T00:00:00').toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {log.symptoms?.length > 0
                                        ? log.symptoms.map(s => s.name).join(', ').slice(0, 40) + (log.symptoms.map(s => s.name).join(', ').length > 40 ? '…' : '')
                                        : (isBn ? 'কোনো লক্ষণ নেই' : 'No symptoms')}
                                </p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${SEVERITY_COLORS[sev]}`}>
                                {isBn ? SEVERITY_LABELS_BN[sev] : SEVERITY_LABELS_EN[sev]}
                            </span>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        </button>

                        {isOpen && (
                            <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                                {log.symptoms?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-2">{isBn ? 'লক্ষণসমূহ' : 'Symptoms'}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {log.symptoms.map((s, i) => (
                                                <span key={i} className={`text-xs font-semibold px-2 py-1 rounded-full ${SEVERITY_COLORS[s.severity] || 'bg-gray-100 text-gray-600'}`}>
                                                    {s.name} ({isBn ? SEVERITY_LABELS_BN[s.severity] : SEVERITY_LABELS_EN[s.severity]})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {log.notes && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-1">{isBn ? 'নোট' : 'Notes'}</p>
                                        <p className="text-sm text-gray-600 bg-gray-50 rounded-[8px] p-2">{log.notes}</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => handleDelete(log.id)}
                                    disabled={deleting === log.id}
                                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    {deleting === log.id ? (isBn ? 'মুছছে...' : 'Deleting...') : (isBn ? 'মুছুন' : 'Delete')}
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}