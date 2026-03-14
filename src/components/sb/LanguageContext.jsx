import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => localStorage.getItem('sb_lang') || 'bn');

    const toggleLang = () => {
        const next = lang === 'bn' ? 'en' : 'bn';
        setLang(next);
        localStorage.setItem('sb_lang', next);
    };

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, toggleLang, isBn: lang === 'bn' }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLang = () => useContext(LanguageContext);

export function t(strings, lang) {
    return lang === 'bn' ? strings.bn : strings.en;
}