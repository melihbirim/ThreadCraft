import { Suspense } from 'react'
import ErrorContent from './ErrorContent'

export default function Error() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
} 