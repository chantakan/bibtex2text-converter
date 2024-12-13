// app/sitemap.ts
import { MetadataRoute } from 'next'

// Added static generation settings
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://bib.tompython.com' // Change to the actual domain at the time of deployment

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
    ]
}
