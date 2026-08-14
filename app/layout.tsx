import React from "react"
import type { Metadata, Viewport } from 'next'
import { Host_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site-config'

const hostGrotesk = Host_Grotesk({ subsets: ["latin"], variable: "--font-host-grotesk" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Music 3.0 | AI Music Generator for Original Songs',
    template: '%s | Music 3.0',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Music 3.0',
    'Music3',
    'Music 3',
    'Music 3.0 AI music generator',
    'Music 3.0 AI',
    'AI music generator',
    'AI song generator',
    'text to song',
    'AI vocals',
  ],
  generator: 'v0.app',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Music 3.0 | AI Music Generator for Original Songs',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Music 3.0 — AI music generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music 3.0 | AI Music Generator for Original Songs',
    description: SITE_DESCRIPTION,
    images: ['/images/hero-bg.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/app-icon.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon-180.png',
    shortcut: '/icon-32x32.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#18181b',
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Music 3.0',
      alternateName: ['Music3', 'Music 3', 'Music 3.0 AI music generator', 'Music 3.0 AI'],
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        category: 'Freemium',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Music 3.0?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Music 3.0 is an AI music generation model and studio that turns text prompts, lyrics, style references, or a mood description into complete, original songs — including vocals, instrumentation, and arrangement, ready to export.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the generator on this page connected to a live model?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              "Yes. Music 3.0 calls Kie's documented Suno generate endpoint. Simple mode sends only a prompt. Custom mode can send title, style, lyrics, vocal gender, negative tags, and V5_5 duration. Each request can return multiple audio variations.",
          },
        },
        {
          '@type': 'Question',
          name: 'Can Music 3.0 write and perform original lyrics?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Yes. You can paste your own lyrics for the model to perform, or describe an idea and let Music 3.0 write verses, hooks, and a chorus structure before generating vocals in your chosen style.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I generate instrumental-only tracks?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Yes. Toggle the generator to instrumental mode to get a fully arranged track without vocals, useful for background scoring, podcasts, or beats.',
          },
        },
        {
          '@type': 'Question',
          name: 'What can I export once a song is generated?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Creator and Studio plans support exporting a finished mix or separated stems for vocals, drums, and instrumentation.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I own the rights to songs I generate?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Paid plans include a commercial usage license for tracks you generate. Free plan exports are watermarked and intended for evaluation only.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-zinc-900">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${hostGrotesk.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
