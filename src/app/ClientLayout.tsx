'use client'

import { SessionProvider } from 'next-auth/react'
import { Header } from '@/components/Header'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
} 