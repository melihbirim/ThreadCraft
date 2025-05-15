export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <div className="mt-6 h-8 w-48 mx-auto bg-gray-200 animate-pulse rounded"></div>
          <div className="mt-4 h-4 w-64 mx-auto bg-gray-200 animate-pulse rounded"></div>
          <div className="mt-8 h-10 w-full bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  )
} 