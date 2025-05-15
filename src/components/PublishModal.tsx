import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  onPublish: () => void
  isPublishing: boolean
  threadLength: number
}

export function PublishModal({ 
  isOpen, 
  onClose, 
  onPublish, 
  isPublishing, 
  threadLength 
}: PublishModalProps) {
  const { data: session } = useSession()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full">
        <h3 className="text-xl font-bold mb-4">Publish Thread to X</h3>
        <p className="mb-6 text-gray-700">
          {!session ? (
            'Please log in with X to publish threads.'
          ) : (
            `Ready to publish your thread of ${threadLength} tweets!`
          )}
        </p>
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-black text-white hover:bg-gray-900 transition rounded-full text-lg font-bold py-3 flex items-center justify-center gap-2"
            onClick={onPublish}
            disabled={isPublishing || !session}
          >
            {isPublishing ? (
              <>
                <LoadingSpinner />
                Publishing...
              </>
            ) : !session ? (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Log in with X
              </>
            ) : 'Post Thread'}
          </Button>
          <Button 
            className="flex-1" 
            variant="outline" 
            onClick={onClose}
            disabled={isPublishing}
          >
            Cancel
          </Button>
        </div>
        {isPublishing && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            Publishing your thread... This may take a few moments.
          </p>
        )}
      </div>
    </div>
  )
} 