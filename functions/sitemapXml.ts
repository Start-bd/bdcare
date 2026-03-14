import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BASE_URL = 'https://bdcare.app';
const TODAY = new Date().toISOString().split('T')[0];

const STATIC_URLS = [
    { loc: '/',           changefreq: 'weekly',  priority: '1.0' },
    { loc: '/SBLanding',  changefreq: 'weekly',  priority: '0.95' },
    { loc: '/SBDoctors',  changefreq: 'daily',   priority: '0.95' },
    { loc: '/SBEmergency',changefreq: 'monthly', priority: '0.9'  },
    { loc: '/SBMedicine', changefreq: 'daily',   priority: '0.85' },
    { loc: '/Hospitals',  changefreq: 'weekly',  priority: '0.85' },
    { loc: '/BloodBank',  changefreq: 'weekly',  priority: '0.8'  },
    { loc: '/Forum',      changefreq: 'daily',   priority: '0.75' },
    { loc: '/MedicineChecker', changefreq: 'monthly', priority: '0.7' },
    { loc: '/SkinChecker',     changefreq: 'monthly', priority: '0.7' },
    { loc: '/DrugInteractionChecker', changefreq: 'monthly', priority: '0.65' },
    { loc: '/HealthRiskAssessment',   changefreq: 'monthly', priority: '0.65' },
];

const DISTRICTS = ['dhaka','chittagong','sylhet','rajshahi','khulna','barisal','rangpur','mymensingh'];
const SPECIALTIES = ['general-physician','cardiologist','dermatologist','pediatrician','orthopedic','gynecologist','psychiatrist','neurologist','diabetologist'];

function urlEntry({ loc, lastmod, changefreq, priority, altBn, altEn }) {
    const hreflang = (altBn && altEn) ? `
    <xhtml:link rel="alternate" hreflang="bn" href="${altBn}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${altEn}"/>` : '';
    return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${lastmod || TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${hreflang}
  </url>`;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Fetch all doctors dynamically
        let doctors = [];
        try {
            doctors = await base44.asServiceRole.entities.Doctor.list('-updated_date', 200);
        } catch (_) {}

        const entries = [];

        // Static pages
        for (const u of STATIC_URLS) {
            entries.push(urlEntry({
                ...u,
                altBn: `${BASE_URL}${u.loc}?lang=bn`,
                altEn: `${BASE_URL}${u.loc}?lang=en`,
            }));
        }

        // District pages
        for (const d of DISTRICTS) {
            entries.push(urlEntry({
                loc: `/SBDoctors?district=${d}`,
                changefreq: 'daily',
                priority: '0.88',
            }));
        }

        // Specialty pages
        for (const s of SPECIALTIES) {
            entries.push(urlEntry({
                loc: `/SBDoctors?specialty=${s}`,
                changefreq: 'weekly',
                priority: '0.85',
            }));
        }

        // Dynamic doctor profile pages
        for (const doc of doctors) {
            const lastmod = doc.updated_date
                ? new Date(doc.updated_date).toISOString().split('T')[0]
                : TODAY;
            entries.push(urlEntry({
                loc: `/SBDoctorProfile?id=${doc.id}`,
                lastmod,
                changefreq: 'weekly',
                priority: '0.85',
            }));
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

${entries.join('\n\n')}

</urlset>`;

        return new Response(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
});