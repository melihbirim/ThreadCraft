import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { AISettings, Draft } from '@/types'
import { loadDrafts, deleteDraft } from '@/lib/drafts'
import { formatDistanceToNow } from 'date-fns'
import { DeleteModal } from '@/components/DeleteModal'

interface SidebarProps {
  aiSettings: AISettings
  onAISettingsChange: (settings: AISettings) => void
  onDraftSelect: (draft: Draft) => void
  currentDraftId?: string
  onNewThread: () => void
}

export function Sidebar({ 
  aiSettings, 
  onAISettingsChange, 
  onDraftSelect,
  currentDraftId,
  onNewThread
}: SidebarProps) {
  const { data: session } = useSession()
  const [showApiInput, setShowApiInput] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [showDrafts, setShowDrafts] = useState(true)
  const [showPublished, setShowPublished] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [draftToDelete, setDraftToDelete] = useState<string>()

  // Load drafts on mount and when currentDraftId changes
  useEffect(() => {
    setDrafts(loadDrafts())
  }, [currentDraftId])

  const handleDeleteDraft = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation()
    setDraftToDelete(draftId)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (draftToDelete) {
      deleteDraft(draftToDelete)
      setDrafts(loadDrafts())
      setDeleteModalOpen(false)
      setDraftToDelete(undefined)
    }
  }

  return (
    <>
      <div className="w-64 h-screen border-r bg-white p-4 flex flex-col" style={{ fontFamily: 'inherit' }}>
        {/* New Thread Button */}
        <Button
          onClick={onNewThread}
          className="mb-6 bg-black text-white hover:bg-gray-900 transition rounded-full text-[15.5px] font-bold py-3 flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Thread
        </Button>

        {/* Drafts & Published Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">My Threads</h3>
          <div className="space-y-2">
            <button 
              className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-[15.5px] flex items-center justify-between"
              onClick={() => setShowDrafts(!showDrafts)}
            >
              <span>📝 Drafts ({drafts.length})</span>
              <span className="text-xs">{showDrafts ? '▼' : '▶'}</span>
            </button>
            
            {/* Drafts List */}
            {showDrafts && (
              <div className="pl-2 space-y-1">
                {drafts.map(draft => (
                  <div
                    key={draft.id}
                    className={`p-2 rounded-lg cursor-pointer text-[15.5px] hover:bg-gray-100 ${
                      currentDraftId === draft.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => onDraftSelect(draft)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-2">
                        <div className="font-medium">{draft.title || 'Untitled'}</div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                        </div>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500 text-sm p-1"
                        onClick={(e) => handleDeleteDraft(e, draft.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {drafts.length === 0 && (
                  <div className="text-gray-500 text-sm p-2">No drafts yet</div>
                )}
              </div>
            )}

            <button 
              className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-[15.5px] flex items-center justify-between"
              onClick={() => setShowPublished(!showPublished)}
            >
              <span>✅ Published</span>
              <span className="text-xs">{showPublished ? '▼' : '▶'}</span>
            </button>
            
            {/* Published List (placeholder) */}
            {showPublished && (
              <div className="pl-2">
                <div className="text-gray-500 text-sm p-2">
                  Coming soon...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Settings Section */}
        {session && (
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-4">XAI Assistant</h3>
            
            {/* API Key Input */}
            <div className="mb-4">
              {showApiInput ? (
                <input
                  type="password"
                  placeholder="Enter XAI API Key"
                  className="w-full p-2 border rounded text-[15.5px]"
                  value={aiSettings.apiKey}
                  onChange={(e) => onAISettingsChange({...aiSettings, apiKey: e.target.value})}
                  style={{ fontFamily: 'inherit' }}
                />
              ) : (
                <Button 
                  onClick={() => setShowApiInput(true)}
                  className="w-full text-[15.5px]"
                >
                  {aiSettings.apiKey ? 'Update API Key' : 'Add API Key'}
                </Button>
              )}
            </div>

            {/* Model Selection */}
            <div className="mb-4">
              <label className="block text-[15.5px] mb-2">Model</label>
              <select 
                className="w-full p-2 border rounded text-[15.5px]"
                value={aiSettings.model || 'grok-2-1212'}
                onChange={(e) => onAISettingsChange({
                  ...aiSettings, 
                  model: e.target.value as AISettings['model']
                })}
                style={{ fontFamily: 'inherit' }}
              >
                <option value="grok-2-1212">Grok 2</option>
                <option value="grok-3">Grok 3</option>
                <option value="grok-3-fast">Grok 3 (Fast)</option>
                <option value="grok-3-mini">Grok 3 Mini</option>
                <option value="grok-3-mini-fast">Grok 3 Mini (Fast)</option>
              </select>
            </div>

            {/* Tone Selection */}
            <div className="mb-4">
              <label className="block text-[15.5px] mb-2">Tone</label>
              <select 
                className="w-full p-2 border rounded text-[15.5px]"
                value={aiSettings.tone}
                onChange={(e) => onAISettingsChange({
                  ...aiSettings, 
                  tone: e.target.value as AISettings['tone']
                })}
                style={{ fontFamily: 'inherit' }}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
              </select>
            </div>

            {/* Emoji Toggle */}
            <div className="mb-4">
              <label className="flex items-center text-[15.5px]">
                <input
                  type="checkbox"
                  checked={aiSettings.useEmojis}
                  onChange={(e) => onAISettingsChange({
                    ...aiSettings,
                    useEmojis: e.target.checked
                  })}
                  className="mr-2"
                />
                Use Emojis
              </label>
            </div>

            {/* AI Rate Slider */}
            <div className="mb-4">
              <label className="block text-[15.5px] mb-2">
                AI Assistance Level: {aiSettings.aiRate}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={aiSettings.aiRate}
                onChange={(e) => onAISettingsChange({
                  ...aiSettings,
                  aiRate: parseInt(e.target.value)
                })}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1" style={{ fontSize: '13px' }}>
                Higher = More aggressive corrections
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDraftToDelete(undefined)
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
} 