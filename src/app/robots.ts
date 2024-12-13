// app/robots.ts
import { MetadataRoute } from 'next'

// Added static generation settings
export const dynamic = 'force-static'


export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: 'https://bib.tompython.com/sitemap.xml', // デプロイ時の実際のドメインに変更
    }
}