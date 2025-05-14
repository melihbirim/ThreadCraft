import { Inter } from 'next/font/google'
import './globals.css'
import { Metadata } from 'next'
import ClientLayout from './ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThreadCraft - Write, Schedule, and Analyze X Posts',
  description: 'A free, open-source tool for writing, scheduling, and analyzing X posts',
  icons: {
    icon: '/favicon.ico',
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
      </body>
    </html>
  )
} 