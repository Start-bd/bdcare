import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import TopNav from '../components/sb/TopNav';
import BottomNav from '../components/sb/BottomNav';
import { base44 } from '@/api/base44Client';
import { Send, Bot, User, Loader2, Stethoscope } from 'lucide-react';

const QUICK_SYMPTOMS = [
    { bn: 'জ্বর', en: 'Fever' },
    { bn: 'মাথাব্যথা', en: 'Headache' },
    { bn: 'বুকব্যথা', en: 'Chest pain' },
    { bn: 'পেটব্যথা', en: 'Stomach pain' },
    { bn: 'শ্বাসকষ্ট', en: 'Breathing difficulty' },
    { bn: 'বমি', en: 'Nausea' },
];

function AIDoctorContent() {
    const { isBn } = useLang();
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: isBn
                ? 'আমি আপনার AI স্বাস্থ্য সহায়ক। আপনার স্বাস্থ্য সমস্যা বলুন, আমি সাধারণ পরামর্শ দিতে পারি।\n\n⚠️ এটি সাধারণ তথ্য। বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন।'
                : 'I am your AI health assistant. Tell me your health problem and I can provide general guidance.\n\n⚠️ This is general information. Please consult a specialist doctor.'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text) => {
        const userText = text || input.trim();
        if (!userText) return;
        setInput('');

        const newMessages = [...messages, { role: 'user', content: userText }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const conversationHistory = newMessages.map(m => `${m.role === 'user' ? 'Patient' : 'AI Doctor'}: ${m.content}`).join('\n');
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are a helpful AI health assistant for Bangladesh. The user may write in Bengali or English. Always respond in the same language they use.

Provide helpful, empathetic health information. Always include:
1. General information about the symptoms
2. Basic first aid or home remedies if appropriate  
3. When to see a doctor urgently
4. A disclaimer to consult a real doctor

Keep responses concise and practical for Bangladeshi context.

Conversation so far:
${conversationHistory}

Respond as the AI Doctor in a caring, helpful manner.`,
            });

            const aiMessage = response + (isBn
                ? '\n\n---\n⚠️ এটি সাধারণ তথ্য। বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন।'
                : '\n\n---\n⚠️ This is general information. Please consult a specialist doctor.');

            setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);

            if (user) {
                await base44.entities.AIChat.create({
                    user_id: user.id,
                    messages_json: JSON.stringify([...newMessages, { role: 'assistant', content: aiMessage }])
                }).catch(() => {});
            }
        } catch (e) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: isBn ? 'দুঃখিত, এই মুহূর্তে সেবা দেওয়া সম্ভব হচ্ছে না।' : 'Sorry, service unavailable at this moment.'
            }]);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#f8faf9] flex flex-col pb-16 md:pb-0">
            <TopNav user={user} />

            {/* Chat header */}
            <div className="bg-white border-b border-[#e0e8e4] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 green-gradient rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-bold text-gray-900 text-sm">{isBn ? 'AI স্বাস্থ্য সহায়ক' : 'AI Health Assistant'}</p>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {isBn ? 'সক্রিয়' : 'Active'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-2xl mx-auto w-full">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full green-gradient flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user'
                                ? 'bg-[#0F6E56] text-white rounded-br-sm'
                                : 'bg-white border border-[#e0e8e4] text-gray-700 rounded-bl-sm'
                        }`}>
                            {msg.content}
                            {msg.role === 'assistant' && i > 0 && (
                                <div className="mt-3 pt-3 border-t border-[#e0e8e4]">
                                    <Link
                                        to={createPageUrl('SBDoctors')}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#eefaf5] text-[#0F6E56] rounded-[8px] text-xs font-semibold hover:bg-[#0F6E56] hover:text-white transition-colors"
                                    >
                                        <Stethoscope className="w-3 h-3" />
                                        {isBn ? 'ডাক্তারের সাথে কথা বলুন' : 'Talk to a Doctor'}
                                    </Link>
                                </div>
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="w-4 h-4 text-gray-500" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full green-gradient flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-[#e0e8e4] p-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#0F6E56] animate-spin" />
                            <span className="text-xs text-gray-400">{isBn ? 'লিখছি...' : 'Typing...'}</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick symptoms */}
            {messages.length <= 1 && (
                <div className="px-4 pb-2 max-w-2xl mx-auto w-full">
                    <p className="text-xs text-gray-400 mb-2">{isBn ? 'দ্রুত নির্বাচন:' : 'Quick select:'}</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {QUICK_SYMPTOMS.map((s, i) => (
                            <button key={i} onClick={() => sendMessage(isBn ? s.bn : s.en)}
                                className="flex-shrink-0 px-3 py-1.5 bg-white border border-[#e0e8e4] rounded-full text-xs font-medium text-gray-600 hover:border-[#0F6E56] hover:text-[#0F6E56] transition-colors"
                            >
                                {isBn ? s.bn : s.en}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="bg-white border-t border-[#e0e8e4] px-4 py-3 max-w-2xl mx-auto w-full">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder={isBn ? 'আপনার স্বাস্থ্য সমস্যা বলুন...' : 'Describe your health problem...'}
                        className="flex-1 px-4 py-2.5 bg-[#f8faf9] border border-[#e0e8e4] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
                        disabled={loading}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="w-10 h-10 rounded-full green-gradient flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}

export default function SBAIDoctor() {
    return <LanguageProvider><AIDoctorContent /></LanguageProvider>;
}