import React, { useState } from 'react';
import { useLang } from './LanguageContext';
import { X, CheckCircle } from 'lucide-react';

export default function PaymentModal({ amount, onClose, onSuccess, showCOD = false }) {
    const { isBn } = useLang();
    const [selected, setSelected] = useState('bkash');
    const [step, setStep] = useState('select'); // select | confirm | done
    const [txnId] = useState('TXN' + Math.random().toString(36).slice(2, 10).toUpperCase());

    const methods = [
        { id: 'bkash',  label: 'bKash',  subLabel: isBn ? 'বিকাশ নম্বরে পাঠান' : 'Send to bKash', color: 'bg-pink-50 border-pink-300', textColor: 'text-pink-600', emoji: '🩷' },
        { id: 'nagad',  label: 'Nagad',  subLabel: isBn ? 'নগদ নম্বরে পাঠান' : 'Send to Nagad',  color: 'bg-orange-50 border-orange-300', textColor: 'text-orange-600', emoji: '🟠' },
        { id: 'card',   label: isBn ? 'কার্ড' : 'Card', subLabel: 'Visa / Mastercard', color: 'bg-blue-50 border-blue-300', textColor: 'text-blue-600', emoji: '💳' },
        ...(showCOD ? [{ id: 'cod', label: isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery', subLabel: isBn ? 'ডেলিভারিতে পরিশোধ' : 'Pay on delivery', color: 'bg-gray-50 border-gray-300', textColor: 'text-gray-600', emoji: '💵' }] : []),
    ];

    if (step === 'done') return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="card-sb p-8 max-w-sm w-full text-center">
                <CheckCircle className="w-16 h-16 text-[#0F6E56] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{isBn ? 'পেমেন্ট সফল!' : 'Payment Successful!'}</h3>
                <p className="text-gray-500 text-sm mb-1">{isBn ? 'লেনদেন আইডি:' : 'Transaction ID:'}</p>
                <p className="font-mono font-bold text-[#0F6E56] text-lg mb-6">{txnId}</p>
                <button onClick={onSuccess} className="btn-primary w-full py-3 rounded-[10px]">
                    {isBn ? 'সম্পন্ন' : 'Done'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="card-sb w-full sm:max-w-md rounded-t-2xl sm:rounded-[14px] p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-900 text-lg">{isBn ? 'পেমেন্ট' : 'Payment'}</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                <div className="mb-4 p-4 bg-[#eefaf5] rounded-[10px] text-center">
                    <p className="text-sm text-gray-500">{isBn ? 'পরিমাণ' : 'Amount'}</p>
                    <p className="text-3xl font-bold text-[#0F6E56]">৳{amount}</p>
                </div>

                <div className="space-y-2 mb-6">
                    {methods.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setSelected(m.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-[10px] border-2 transition-all ${selected === m.id ? m.color + ' ' + m.textColor : 'border-[#e0e8e4] bg-white'}`}
                        >
                            <span className="text-xl">{m.emoji}</span>
                            <div className="text-left">
                                <p className="font-semibold text-sm">{m.label}</p>
                                <p className="text-xs opacity-70">{m.subLabel}</p>
                            </div>
                            {selected === m.id && <span className="ml-auto text-lg">✓</span>}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setStep('done')}
                    className="btn-primary w-full py-3 rounded-[10px] text-base font-bold"
                >
                    {isBn ? `৳${amount} পরিশোধ করুন` : `Pay ৳${amount}`}
                </button>
            </div>
        </div>
    );
}