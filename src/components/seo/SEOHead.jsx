import { useEffect } from 'react';

/**
 * SEOHead — dynamic document head manager (no external lib needed).
 * Sets <title>, <meta>, JSON-LD and hreflang tags for every page.
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
}) {
    const resolvedTitle = lang === 'bn' && titleBn ? titleBn : title;
    const resolvedDesc  = lang === 'bn' && descriptionBn ? descriptionBn : description;
    const canonical     = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

    useEffect(() => {
        // ── <html lang> ──
        document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';

        // ── <title> ──
        document.title = resolvedTitle || 'BDCare – স্বাস্থ্য বন্ধু';

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
        setMeta('og:title',       resolvedTitle, 'property');
        setMeta('og:description', resolvedDesc,  'property');
        setMeta('og:type',        doctor ? 'profile' : 'website', 'property');
        setMeta('og:url',         canonical,     'property');
        setMeta('og:site_name',   'BD Care',     'property');
        setMeta('og:locale',      lang === 'bn' ? 'bn_BD' : 'en_US', 'property');

        // ── Twitter Card ──
        setMeta('twitter:card',        'summary');
        setMeta('twitter:title',       resolvedTitle);
        setMeta('twitter:description', resolvedDesc);

        // ── Canonical & hreflang ──
        setLink('canonical', canonical);

        // hreflang – Bengali and English alternate
        const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
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
        // x-default
        let xDefault = document.querySelector('link[hreflang="x-default"]');
        if (!xDefault) {
            xDefault = document.createElement('link');
            xDefault.rel = 'alternate';
            xDefault.setAttribute('hreflang', 'x-default');
            document.head.appendChild(xDefault);
        }
        xDefault.href = baseUrl;

        // ── JSON-LD ──
        // Remove any existing json-ld scripts injected by this component
        document.querySelectorAll('script[data-seo-jsonld]').forEach(s => s.remove());

        const schemas = [];

        // Always include MedicalOrganization for the site
        schemas.push({
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            "name": "BD Care",
            "url": typeof window !== 'undefined' ? window.location.origin : 'https://bdcare.app',
            "description": "Bangladesh's AI-powered telemedicine and healthcare platform.",
            "areaServed": "BD",
            "availableLanguage": ["Bengali", "English"],
            "medicalSpecialty": [
                "GeneralPractice", "Cardiology", "Pediatrics", "Gynecology",
                "Dermatology", "Orthopedics", "Neurology"
            ],
            "sameAs": ["https://bdcare.app"]
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
                "worksFor": doctor.hospital_name ? {
                    "@type": "MedicalOrganization",
                    "name": doctor.hospital_name
                } : undefined,
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

        // Custom caller-supplied JSON-LD
        if (jsonLd) schemas.push(jsonLd);

        schemas.forEach(schema => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-seo-jsonld', 'true');
            script.textContent = JSON.stringify(schema, null, 2);
            document.head.appendChild(script);
        });

        // Cleanup on unmount
        return () => {
            document.querySelectorAll('script[data-seo-jsonld]').forEach(s => s.remove());
        };
    }, [resolvedTitle, resolvedDesc, lang, canonical, doctor, averageRating, reviewCount]);

    return null; // renders nothing into the React tree
}