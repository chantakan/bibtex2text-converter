// app/page.tsx
import { Metadata } from 'next'
import CitationFormatter from '@/components/CitationFormatter'

export const metadata: Metadata = {
  title: 'Citation Formatter - Convert Citations Online',
  description: 'Transform your academic citations into various citation styles. Support for BibTeX and YAML formats.',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <CitationFormatter />
    </main>
  )
}

