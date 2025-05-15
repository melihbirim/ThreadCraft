import { Button } from '@/components/ui/Button'

interface SuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  threadUrl?: string
  totalTweets?: number
  postedTweets?: number
}

export function SuccessDialog({ 
  isOpen, 
  onClose, 
  threadUrl,
  totalTweets,
  postedTweets 
}: SuccessDialogProps) {
  if (!isOpen) return null

  const handleViewThread = () => {
    if (threadUrl) {
      window.open(threadUrl, '_blank')
    }
  }

  const isPartialSuccess = totalTweets && postedTweets && postedTweets < totalTweets

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center">
        <div className="mb-4">
          <div className={`mx-auto w-12 h-12 ${isPartialSuccess ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
            {isPartialSuccess ? (
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">
          {isPartialSuccess ? 'Thread Partially Posted' : 'Thread Posted!'}
        </h3>
        <p className="text-gray-600 mb-6">
          {isPartialSuccess ? (
            `${postedTweets} out of ${totalTweets} tweets were successfully posted to X. Some tweets may have failed due to rate limits.`
          ) : (
            'Your thread has been successfully posted to X.'
          )}
        </p>
        <div className="flex gap-2">
          {threadUrl && (
            <Button
              className="flex-1 bg-black text-white hover:bg-gray-900 transition rounded-full"
              onClick={handleViewThread}
            >
              View Thread
            </Button>
          )}
          <Button
            className="flex-1"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        {isPartialSuccess && (
          <p className="mt-4 text-sm text-gray-500">
            Try posting the remaining tweets again in a few minutes.
          </p>
        )}
      </div>
    </div>
  )
} 