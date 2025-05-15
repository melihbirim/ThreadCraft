import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { Metadata } from 'next'
import ClientLayout from './ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThreadCraft - Write, Schedule, and Analyze X Posts',
  description: 'Create engaging Twitter threads effortlessly with ThreadCraft. Write, schedule, and analyze your X posts with our AI-powered thread creation tool.',
  keywords: 'Twitter threads, X threads, thread maker, social media tool, Twitter analytics, content creation, AI writing assistant',
  authors: [{ name: 'Melih Birim', url: 'https://github.com/melihbirim' }],
  creator: 'Melih Birim',
  publisher: 'ThreadCraft',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://threadcraftx.com',
    siteName: 'ThreadCraft',
    title: 'ThreadCraft - Write Better Twitter Threads',
    description: 'Create engaging Twitter threads effortlessly with ThreadCraft. Write, schedule, and analyze your X posts with our AI-powered thread creation tool.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ThreadCraft - Twitter Thread Creation Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThreadCraft - Write Better Twitter Threads',
    description: 'Create engaging Twitter threads effortlessly with ThreadCraft. Write, schedule, and analyze your X posts with our AI-powered thread creation tool.',
    creator: '@melihbirim',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'your-google-site-verification-code', // Add your Google verification code
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  )
} 