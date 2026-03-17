import { useEffect } from 'react';

const SITE_NAME = 'BDCare';
const SITE_URL = 'https://bdcare.app';
const DEFAULT_OG_IMAGE = 'https://bdcare.app/og-default.jpg';

/**
 * SEOHead — dynamic document head manager (no external lib).
 * Sets <title>, <meta>, JSON-LD, hreflang, OG image, Twitter card, FAQ schema.
 */
export default function SEOHead({
    title,
    description,
    titleBn,
    descriptionBn,
    lang = 'bn',
    canonicalUrl,
    jsonLd,
    doctor = null,
    averageRating = 0,
    reviewCount = 0,
    // NEW
    ogImageUrl = DEFAULT_OG_IMAGE,
    faqs = null,
}) {
    const resolvedTitle = lang === 'bn' && titleBn ? titleBn : title;
    const resolvedDesc  = lang === 'bn' && descriptionBn ? descriptionBn : description;
    const canonical     = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
    const resolvedImage = ogImageUrl || DEFAULT_OG_IMAGE;

    const fullTitle = resolvedTitle && resolvedTitle.includes(SITE_NAME)
        ? resolvedTitle
        : `${resolvedTitle} | ${SITE_NAME}`;

    useEffect(() => {
        // ── <html lang> ──
        document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';

        // ── <title> ──
        document.title = fullTitle || `BD Care – AI Healthcare Platform Bangladesh`;

        const setMeta = (name, content, attr = 'name') => {
            let el = document.querySelector(`meta[${attr}="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content || '');
        };

        const setLink = (rel, href, extra = {}) => {
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement('link');
                el.rel = rel;
                document.head.appendChild(el);
            }
            el.href = href;
            Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
        };

        // ── Meta description ──
        setMeta('description', resolvedDesc);
        setMeta('keywords', 'bdcare, bangladesh healthcare, telemedicine bangladesh, ডাক্তার, হাসপাতাল, স্বাস্থ্যসেবা');

        // ── Open Graph ──
        setMeta('og:site_name',    SITE_NAME,                                  'property');
        setMeta('og:title',        fullTitle,                                   'property');
        setMeta('og:description',  resolvedDesc,                                'property');
        setMeta('og:type',         doctor ? 'profile' : 'website',             'property');
        setMeta('og:url',          canonical,                                   'property');
        setMeta('og:locale',       lang === 'bn' ? 'bn_BD' : 'en_US',         'property');
        setMeta('og:image',        resolvedImage,                               'property');
        setMeta('og:image:width',  '1200',                                      'property');
        setMeta('og:image:height', '630',                                       'property');
        setMeta('og:image:alt',    fullTitle,                                   'property');

        // ── Twitter Card ──
        setMeta('twitter:card',        'summary_large_image');
        setMeta('twitter:site',        '@bdcareapp');
        setMeta('twitter:title',       fullTitle);
        setMeta('twitter:description', resolvedDesc);
        setMeta('twitter:image',       resolvedImage);
        setMeta('twitter:image:alt',   fullTitle);

        // ── Mobile / Robots ──
        setMeta('viewport',    'width=device-width, initial-scale=1');
        setMeta('robots',      'index, follow');
        setMeta('theme-color', '#0ea5e9');

        // ── Canonical & hreflang ──
        setLink('canonical', canonical);

        const baseUrl = typeof window !== 'undefined'
            ? window.location.origin + window.location.pathname
            : SITE_URL;

        ['bn', 'en'].forEach(l => {
            let el = document.querySelector(`link[hreflang="${l}"]`);
            if (!el) {
                el = document.createElement('link');
                el.rel = 'alternate';
                el.setAttribute('hreflang', l);
                document.head.appendChild(el);
            }
            el.href = `${baseUrl}?lang=${l}`;
        });

        let xDefault = document.querySelector('link[hreflang="x-default"]');
        if (!xDefault) {
            xDefault = document.createElement('link');
            xDefault.rel = 'alternate';
            xDefault.setAttribute('hreflang', 'x-default');
            document.head.appendChild(xDefault);
        }
        xDefault.href = baseUrl;

        // ── JSON-LD ──
        document.querySelectorAll('script[data-seo-jsonld]').forEach(s => s.remove());

        const schemas = [];

        // Always: MedicalOrganization
        schemas.push({
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            "name": SITE_NAME,
            "url": SITE_URL,
            "logo": `${SITE_URL}/logo.png`,
            "telephone": "+8801XXXXXXXXX",
            "description": "Bangladesh's AI-powered telemedicine and healthcare platform.",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Dhaka",
                "addressLocality": "Dhaka",
                "addressRegion": "Dhaka Division",
                "postalCode": "1000",
                "addressCountry": "BD"
            },
            "areaServed": "BD",
            "availableLanguage": ["Bengali", "English"],
            "medicalSpecialty": [
                "GeneralPractice", "Cardiology", "Pediatrics", "Gynecology",
                "Dermatology", "Orthopedics", "Neurology"
            ],
            "sameAs": [
                "https://www.facebook.com/bdcareapp",
                "https://twitter.com/bdcareapp"
            ]
        });

        // Physician schema on doctor profile pages
        if (doctor) {
            const specs = doctor.doctor_specializations?.length > 0
                ? doctor.doctor_specializations
                : (doctor.doctor_specialization ? [doctor.doctor_specialization] : []);

            schemas.push({
                "@context": "https://schema.org",
                "@type": "Physician",
                "name": doctor.full_name,
                "description": `${specs[0] || 'General Physician'} with ${doctor.years_experience || 0} years of experience.`,
                "medicalSpecialty": specs[0] || "General Practice",
                "availableService": specs.map(s => ({ "@type": "MedicalTherapy", "name": s })),
                "affiliation": { "@type": "MedicalOrganization", "name": SITE_NAME, "url": SITE_URL },
                "worksFor": doctor.hospital_name
                    ? { "@type": "MedicalOrganization", "name": doctor.hospital_name }
                    : undefined,
                "identifier": doctor.doctor_license_number || undefined,
                ...(averageRating > 0 ? {
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": averageRating.toFixed(1),
                        "reviewCount": reviewCount,
                        "bestRating": "5",
                        "worstRating": "1"
                    }
                } : {}),
                "url": canonical
            });
        }

        // FAQPage schema
        if (faqs && faqs.length > 0) {
            schemas.push({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqs.map(f => ({
                    "@type": "Question",
                    "name": f.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": f.answer
                    }
                }))
            });
        }

        // Custom caller-supplied JSON-LD
        if (jsonLd) schemas.push(jsonLd);

        schemas.forEach(schema => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-seo-jsonld', 'true');
            script.textContent = JSON.stringify(schema, null, 2);
            document.head.appendChild(script);
        });

        return () => {
            document.querySelectorAll('script[data-seo-jsonld]').forEach(s => s.remove());
        };
    }, [fullTitle, resolvedDesc, lang, canonical, doctor, averageRating, reviewCount, resolvedImage, faqs]);

    return null;
}