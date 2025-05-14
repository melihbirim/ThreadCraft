import { Button } from '@/components/ui/Button'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
}

export function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = 'Are you sure you want to delete this draft?' 
}: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="mb-6 text-gray-600">
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white transition rounded-full text-[15.5px] font-bold py-2.5"
          >
            Delete
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition rounded-full text-[15.5px] font-bold py-2.5"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
} 