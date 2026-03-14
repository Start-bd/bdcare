import React from 'react';
import { useLang } from './LanguageContext';

export default function LangToggle({ className = '' }) {
    const { lang, toggleLang } = useLang();
    return (
        <button
            onClick={toggleLang}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#e0e8e4] bg-white text-sm font-semibold text-[#0F6E56] hover:bg-[#eefaf5] transition-colors ${className}`}
        >
            <span className={lang === 'bn' ? 'opacity-100' : 'opacity-40'}>বাং</span>
            <span className="text-gray-300 mx-0.5">|</span>
            <span className={lang === 'en' ? 'opacity-100' : 'opacity-40'}>EN</span>
        </button>
    );
}