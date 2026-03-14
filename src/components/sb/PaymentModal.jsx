import React, { useState } from 'react';
import { useLang } from './LanguageContext';
import { X, CheckCircle, Copy, CreditCard } from 'lucide-react';

const MERCHANT = {
    bkash: '01712-345678',
    nagad: '01812-345678',
};

const TABS = [
    { id: 'bkash', label: 'bKash', emoji: '🩷', color: 'bg-pink-500', activeTab: 'border-pink-500 text-pink-600', ring: 'focus:ring-pink-300' },
    { id: 'nagad', label: 'Nagad', emoji: '🟠', color: 'bg-orange-500', activeTab: 'border-orange-500 text-orange-600', ring: 'focus:ring-orange-300' },
    { id: 'card',  label: 'Card',  emoji: '💳', color: 'bg-blue-500',   activeTab: 'border-blue-500 text-blue-600',   ring: 'focus:ring-blue-300'   },
];

const MFS_INSTRUCTIONS = {
    bkash: [
        'আপনার বিকাশ অ্যাপ বা *247# ডায়াল করুন',
        '"Send Money" বা "পাঠাও" সিলেক্ট করুন',
        'মার্চেন্ট নম্বরে নির্ধারিত পরিমাণ পাঠান',
        'PIN দিয়ে নিশ্চিত করুন',
        'বার্তায় পাওয়া Transaction ID লিখুন',
    ],
    nagad: [
        'আপনার নগদ অ্যাপ বা *167# ডায়াল করুন',
        '"Send Money" বা "পাঠান" সিলেক্ট করুন',
        'মার্চেন্ট নম্বরে নির্ধারিত পরিমাণ পাঠান',
        'PIN দিয়ে নিশ্চিত করুন',
        'বার্তায় পাওয়া Transaction ID লিখুন',
    ],
};

function genRef() {
    return 'SB-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function PaymentModal({ amount, onClose, onSuccess, showCOD = false }) {
    const { isBn } = useLang();
    const [tab, setTab] = useState('bkash');
    const [txnInput, setTxnInput] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [ref] = useState(genRef());
    const [done, setDone] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConfirm = () => {
        setDone(true);
        // Signal parent with pending_verification status
        // onSuccess is called when user clicks "Done" on confirmation screen
    };

    const canConfirm = tab === 'card'
        ? cardNumber.replace(/\s/g, '').length >= 12 && cardExpiry.length >= 4 && cardCvv.length >= 3
        : txnInput.trim().length >= 5;

    if (done) return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-9 h-9 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {isBn ? 'যাচাই প্রক্রিয়াধীন' : 'Verification Pending'}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                    {isBn
                        ? 'আপনার পেমেন্ট যাচাই করা হচ্ছে। সাধারণত ১–৩০ মিনিট সময় লাগে।'
                        : 'Your payment is being verified. Usually takes 1–30 minutes.'}
                </p>
                <div className="bg-[#f8faf9] rounded-[10px] p-4 mb-6 space-y-1">
                    <p className="text-xs text-gray-400">{isBn ? 'রেফারেন্স নম্বর' : 'Reference Number'}</p>
                    <p className="font-mono font-bold text-[#0F6E56] text-xl tracking-widest">{ref}</p>
                    <p className="text-xs text-gray-400">{isBn ? 'পরিমাণ' : 'Amount'}: <span className="font-semibold text-gray-700">৳{amount}</span></p>
                    <p className="text-xs text-gray-400">{isBn ? 'মাধ্যম' : 'Method'}: <span className="font-semibold text-gray-700">{tab === 'bkash' ? 'bKash' : tab === 'nagad' ? 'Nagad' : 'Card'}</span></p>
                </div>
                <button onClick={onSuccess} className="btn-primary w-full py-3 rounded-[10px] font-bold text-base">
                    {isBn ? 'সম্পন্ন' : 'Done'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <h3 className="font-bold text-gray-900 text-lg">{isBn ? 'পেমেন্ট' : 'Payment'}</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                {/* Amount */}
                <div className="mx-5 mb-4 p-3 bg-[#eefaf5] rounded-[10px] flex items-center justify-between">
                    <span className="text-sm text-gray-500">{isBn ? 'মোট পরিমাণ' : 'Total Amount'}</span>
                    <span className="text-2xl font-bold text-[#0F6E56]">৳{amount}</span>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#e0e8e4] px-5">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => { setTab(t.id); setTxnInput(''); }}
                            className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5
                                ${tab === t.id ? t.activeTab : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            <span>{t.emoji}</span> {t.label}
                        </button>
                    ))}
                </div>

                <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* bKash / Nagad tab */}
                    {(tab === 'bkash' || tab === 'nagad') && (
                        <>
                            {/* Merchant number */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    {tab === 'bkash' ? 'বিকাশ' : 'নগদ'} {isBn ? 'মার্চেন্ট নম্বর' : 'Merchant Number'}
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-[#f8faf9] border border-[#e0e8e4] rounded-[10px]">
                                    <span className="font-mono font-bold text-gray-900 flex-1 tracking-wider">{MERCHANT[tab]}</span>
                                    <button
                                        onClick={() => handleCopy(MERCHANT[tab])}
                                        className="text-xs text-[#0F6E56] font-semibold flex items-center gap-1 hover:opacity-70"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        {copied ? (isBn ? 'কপি!' : 'Copied!') : (isBn ? 'কপি' : 'Copy')}
                                    </button>
                                </div>
                            </div>

                            {/* Amount display */}
                            <div className={`p-3 rounded-[10px] border ${tab === 'bkash' ? 'bg-pink-50 border-pink-200' : 'bg-orange-50 border-orange-200'}`}>
                                <p className="text-xs text-gray-500 mb-0.5">{isBn ? 'পাঠাতে হবে' : 'Amount to send'}</p>
                                <p className={`text-2xl font-bold ${tab === 'bkash' ? 'text-pink-600' : 'text-orange-600'}`}>৳{amount}</p>
                            </div>

                            {/* Instructions */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-2">{isBn ? 'নির্দেশাবলী:' : 'Instructions:'}</p>
                                <ol className="space-y-1.5">
                                    {MFS_INSTRUCTIONS[tab].map((step, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                                            <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-[10px] mt-0.5 ${tab === 'bkash' ? 'bg-pink-500' : 'bg-orange-500'}`}>{i + 1}</span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Transaction ID input */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    {isBn ? 'ট্রানজেকশন আইডি (TxnID)' : 'Transaction ID (TxnID)'}
                                    <span className="text-red-400 ml-1">*</span>
                                </label>
                                <input
                                    value={txnInput}
                                    onChange={e => setTxnInput(e.target.value)}
                                    placeholder={isBn ? 'বার্তা থেকে TxnID লিখুন...' : 'Enter TxnID from message...'}
                                    className="w-full p-3 border border-[#e0e8e4] rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30 font-mono"
                                />
                            </div>
                        </>
                    )}

                    {/* Card tab */}
                    {tab === 'card' && (
                        <>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-[10px]">
                                <CreditCard className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <p className="text-xs text-blue-700">{isBn ? 'Visa / Mastercard / AMEX সাপোর্টেড' : 'Visa / Mastercard / AMEX accepted'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{isBn ? 'কার্ড নম্বর' : 'Card Number'}</label>
                                <input
                                    value={cardNumber}
                                    onChange={e => {
                                        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                                        setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
                                    }}
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full p-3 border border-[#e0e8e4] rounded-[10px] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">{isBn ? 'মেয়াদ (MM/YY)' : 'Expiry (MM/YY)'}</label>
                                    <input
                                        value={cardExpiry}
                                        onChange={e => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            setCardExpiry(v.length > 2 ? v.slice(0,2) + '/' + v.slice(2) : v);
                                        }}
                                        placeholder="MM/YY"
                                        className="w-full p-3 border border-[#e0e8e4] rounded-[10px] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">CVV</label>
                                    <input
                                        value={cardCvv}
                                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="•••"
                                        type="password"
                                        className="w-full p-3 border border-[#e0e8e4] rounded-[10px] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Confirm button */}
                <div className="px-5 pb-5 pt-2">
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className={`w-full py-3.5 rounded-[10px] font-bold text-base transition-all
                            ${canConfirm ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        {isBn ? `৳${amount} নিশ্চিত করুন` : `Confirm ৳${amount}`}
                    </button>
                </div>
            </div>
        </div>
    );
}