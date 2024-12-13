// app/layout.tsx
import type { Metadata } from 'next'
import "./globals.css";

export const metadata: Metadata = {
  title: 'Citation Formatter - Format Academic Citations Online',
  description: 'Free online tool to format academic citations in various styles including IEEE, APA, MLA, Chicago, and Harvard. Support for BibTeX and YAML input.',
  keywords: ['citation formatter', 'bibliography formatter', 'citation styles', 'BibTeX formatter', 'academic citations'],
  openGraph: {
    title: 'Citation Formatter - Format Academic Citations Online',
    description: 'Convert your citations to popular academic styles including IEEE, APA, MLA, Chicago, and Harvard.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Citation Formatter'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Citation Formatter - Format Academic Citations Online',
    description: 'Convert your citations to popular academic styles including IEEE, APA, MLA, Chicago, and Harvard.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

