// components/JsonLd.tsx
export default function JsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Citation Formatter',
        applicationCategory: 'Academic Tool',
        description: 'Online tool for formatting academic citations in various styles',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
        },
        operatingSystem: 'Web Browser'
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}