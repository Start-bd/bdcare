Deno.serve(async (req) => {
    const content = `# robots.txt for bdcare.app — স্বাস্থ্য বন্ধু
# Updated: March 2026

User-agent: *

# Allow all public pages for indexing
Allow: /
Allow: /SBLanding
Allow: /SBDoctors
Allow: /SBEmergency
Allow: /SBMedicine
Allow: /Hospitals
Allow: /BloodBank
Allow: /Forum

# Block authenticated/private user pages
Disallow: /SBDashboard
Disallow: /SBProfile
Disallow: /SBVault
Disallow: /SBAIDoctor
Disallow: /Appointments
Disallow: /Settings
Disallow: /Profile
Disallow: /MedicalRecords
Disallow: /AdminDashboard

# Block API endpoints
Disallow: /api/
Disallow: /functions/

# Block utility/system paths
Disallow: /*?token=
Disallow: /*?session=
Disallow: /*?otp=

# Sitemap location
Sitemap: https://bdcare.app/sitemap.xml

# Crawl rate
Crawl-delay: 2
`;

    return new Response(content, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
        },
    });
});