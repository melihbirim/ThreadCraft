'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Error() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error || 'An error occurred during authentication'}
          </p>
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="flex w-full justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 