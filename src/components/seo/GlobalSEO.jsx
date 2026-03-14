import { useEffect } from 'react';

/**
 * GlobalSEO — injects all baseline SEO tags once on app load.
 * Covers: title, description, OG, Twitter Card, hreflang,
 * MedicalOrganization JSON-LD, WebSite SearchAction JSON-LD.
 * Pages can override title/description via document.title + SEOHead.
 */
export default function GlobalSEO({ title, description, lang = 'bn' }) {
    const resolvedTitle = title || 'স্বাস্থ্য বন্ধু | Bangladesh\'s AI Health Companion | bdcare.app';
    const resolvedDesc = description || 'বাংলাদেশের প্রথম AI স্বাস্থ্য সহায়ক। ডাক্তার পরামর্শ, ওষুধ ডেলিভারি, জরুরি সেবা এবং AI ডাক্তার — সব এক জায়গায়। Bangladesh\'s AI-powered telemedicine platform.';
    const OG_IMAGE = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=630&fit=crop&q=80';
    const SITE_URL = 'https://bdcare.app';

    useEffect(() => {
        // html lang
        document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';

        // title
        document.title = resolvedTitle;

        const setMeta = (nameOrProp, content, attr = 'name') => {
            let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, nameOrProp);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        const setLink = (rel, href, extra = {}) => {
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
            el.href = href;
            Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
        };

        // Primary meta
        setMeta('description', resolvedDesc);
        setMeta('keywords', 'স্বাস্থ্য বন্ধু, bdcare, Bangladesh telemedicine, ডাক্তার, হাসপাতাল, AI doctor Bangladesh, online doctor Bangladesh, shasthya bondhu, স্বাস্থ্যসেবা বাংলাদেশ');
        setMeta('author', 'স্বাস্থ্য বন্ধু · bdcare.app');
        setMeta('robots', 'index, follow');

        // OG
        setMeta('og:type',        'website',          'property');
        setMeta('og:site_name',   'স্বাস্থ্য বন্ধু', 'property');
        setMeta('og:title',       resolvedTitle,       'property');
        setMeta('og:description', resolvedDesc,        'property');
        setMeta('og:url',         SITE_URL,            'property');
        setMeta('og:image',       OG_IMAGE,            'property');
        setMeta('og:image:width', '1200',              'property');
        setMeta('og:image:height','630',               'property');
        setMeta('og:image:alt',   'স্বাস্থ্য বন্ধু — Bangladesh AI Health Platform', 'property');
        setMeta('og:locale',      lang === 'bn' ? 'bn_BD' : 'en_US', 'property');

        // Twitter
        setMeta('twitter:card',        'summary_large_image');
        setMeta('twitter:title',       resolvedTitle);
        setMeta('twitter:description', resolvedDesc);
        setMeta('twitter:image',       OG_IMAGE);
        setMeta('twitter:site',        '@bdcareapp');

        // Canonical
        setLink('canonical', typeof window !== 'undefined' ? window.location.origin + window.location.pathname : SITE_URL);

        // hreflang
        const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : SITE_URL;
        [['bn', base], ['en', base + '?lang=en'], ['x-default', base]].forEach(([hl, href]) => {
            let el = document.querySelector(`link[hreflang="${hl}"]`);
            if (!el) { el = document.createElement('link'); el.rel = 'alternate'; el.setAttribute('hreflang', hl); document.head.appendChild(el); }
            el.href = href;
        });

        // Remove old JSON-LD injected by this component
        document.querySelectorAll('script[data-global-seo]').forEach(s => s.remove());

        // MedicalOrganization
        const orgSchema = {
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            "name": "স্বাস্থ্য বন্ধু",
            "alternateName": ["Shasthya Bondhu", "BD Care", "bdcare.app"],
            "url": SITE_URL,
            "logo": OG_IMAGE,
            "image": OG_IMAGE,
            "description": "Bangladesh's first AI-powered healthcare platform providing telemedicine, doctor consultations, medicine delivery, and emergency services 24/7.",
            "areaServed": { "@type": "Country", "name": "Bangladesh" },
            "availableLanguage": ["Bengali", "English"],
            "medicalSpecialty": ["GeneralPractice","Cardiology","Pediatrics","Gynecology","Dermatology","Orthopedics","Neurology","Psychiatry"],
            "contactPoint": [
                { "@type": "ContactPoint", "telephone": "+880-16789", "contactType": "customer service", "availableLanguage": ["Bengali", "English"], "areaServed": "BD" },
                { "@type": "ContactPoint", "telephone": "999", "contactType": "emergency", "areaServed": "BD" }
            ],
            "address": { "@type": "PostalAddress", "addressCountry": "BD", "addressLocality": "Dhaka" },
            "sameAs": [SITE_URL]
        };

        // WebSite SearchAction
        const siteSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "স্বাস্থ্য বন্ধু",
            "url": SITE_URL,
            "potentialAction": {
                "@type": "SearchAction",
                "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/SBDoctors?q={search_term_string}` },
                "query-input": "required name=search_term_string"
            }
        };

        [orgSchema, siteSchema].forEach(schema => {
            const s = document.createElement('script');
            s.type = 'application/ld+json';
            s.setAttribute('data-global-seo', 'true');
            s.textContent = JSON.stringify(schema);
            document.head.appendChild(s);
        });

        return () => {
            document.querySelectorAll('script[data-global-seo]').forEach(s => s.remove());
        };
    }, [resolvedTitle, resolvedDesc, lang]);

    return null;
}