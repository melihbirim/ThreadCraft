import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
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
  const [showXAISection, setShowXAISection] = useState(false)
  const [showXAISettings, setShowXAISettings] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Load drafts on mount and when currentDraftId changes
  useEffect(() => {
    setDrafts(loadDrafts())
  }, [currentDraftId])

  // Handle click outside sidebar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  const models = [
    { value: 'grok-2-1212', label: 'Grok 2' },
    { value: 'grok-3', label: 'Grok 3' },
    { value: 'grok-3-fast', label: 'Grok 3 Fast' },
    { value: 'grok-3-mini', label: 'Grok 3 Mini' },
    { value: 'grok-3-mini-fast', label: 'Grok 3 Mini Fast' }
  ]

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' }
  ]

  return (
    <div className="relative" ref={sidebarRef}>
      {/* Sidebar Toggle Button - Always Visible */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-20 left-0 z-50 p-2 bg-white rounded-r-lg shadow-md transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-64 sm:translate-x-80 lg:translate-x-96' : 'translate-x-0'
        }`}
      >
        <svg 
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isSidebarOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Main Sidebar */}
      <div 
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r shadow-lg transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-full sm:w-80 lg:w-96 flex flex-col z-40`}
      >
        {/* My Threads Section - Fixed Header */}
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex-none bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Threads</h3>
              <button
                onClick={onNewThread}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-black text-white hover:bg-gray-900 transition shadow-sm"
                title="New Thread"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Threads List - Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              <button 
                className="w-full text-left p-2.5 hover:bg-gray-50 rounded-lg text-[15px] flex items-center justify-between transition-colors duration-200"
                onClick={() => setShowDrafts(!showDrafts)}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 2L22 6M22 2L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Drafts ({drafts.length})
                </span>
                <span className="text-xs text-gray-400">{showDrafts ? '▼' : '▶'}</span>
              </button>
              
              {/* Drafts List */}
              {showDrafts && (
                <div className="pl-2 space-y-1">
                  {drafts.map(draft => (
                    <div
                      key={draft.id}
                      className={`p-2.5 rounded-lg cursor-pointer text-[15px] hover:bg-gray-50 transition-colors duration-200 ${
                        currentDraftId === draft.id ? 'bg-gray-50 shadow-sm' : ''
                      }`}
                      onClick={() => onDraftSelect(draft)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-2">
                          <div className="font-medium text-gray-900">{draft.title || 'Untitled'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                          </div>
                        </div>
                        <button
                          className="text-gray-400 hover:text-red-500 text-sm p-1 transition-colors duration-200"
                          onClick={(e) => handleDeleteDraft(e, draft.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  {drafts.length === 0 && (
                    <div className="text-gray-500 text-sm p-2.5">No drafts yet</div>
                  )}
                </div>
              )}

              <button 
                className="w-full text-left p-2.5 hover:bg-gray-50 rounded-lg text-[15px] flex items-center justify-between transition-colors duration-200"
                onClick={() => setShowPublished(!showPublished)}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Published
                </span>
                <span className="text-xs text-gray-400">{showPublished ? '▼' : '▶'}</span>
              </button>
              
              {showPublished && (
                <div className="pl-2">
                  <div className="text-gray-500 text-sm p-2.5">
                    Coming soon...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* XAI Assistant Section - Fixed to Bottom */}
          {session && (
            <div className="border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <button 
                onClick={() => setShowXAISection(!showXAISection)}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">XAI Assistant</span>
                  <span className="text-sm text-gray-400">{showXAISection ? '▼' : '▶'}</span>
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                  showXAISection 
                    ? 'max-h-[600px] opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 bg-white">
                  {/* API Key Input */}
                  <div className="mb-4">
                    {showApiInput ? (
                      <input
                        type="password"
                        placeholder="Enter XAI API Key"
                        className="w-full p-2.5 border rounded-lg text-[15px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        value={aiSettings.apiKey}
                        onChange={(e) => onAISettingsChange({...aiSettings, apiKey: e.target.value})}
                        style={{ fontFamily: 'inherit' }}
                      />
                    ) : (
                      <Button 
                        onClick={() => setShowApiInput(true)}
                        className="w-full text-[15px] rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                      >
                        {aiSettings.apiKey ? 'Update API Key' : 'Add API Key'}
                      </Button>
                    )}
                  </div>

                  {/* Model Selection as Tags */}
                  <div className="mb-4">
                    <label className="block text-[15px] text-gray-700 mb-2">Model</label>
                    <div className="flex flex-wrap gap-2">
                      {models.map(model => (
                        <button
                          key={model.value}
                          onClick={() => onAISettingsChange({
                            ...aiSettings,
                            model: model.value as AISettings['model']
                          })}
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-200 ${
                            aiSettings.model === model.value
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                              : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {model.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tone Selection as Tags */}
                  <div className="mb-4">
                    <label className="block text-[15px] text-gray-700 mb-2">Tone</label>
                    <div className="flex flex-wrap gap-2">
                      {tones.map(tone => (
                        <button
                          key={tone.value}
                          onClick={() => onAISettingsChange({
                            ...aiSettings,
                            tone: tone.value as AISettings['tone']
                          })}
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-200 ${
                            aiSettings.tone === tone.value
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                              : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Emoji Toggle */}
                  <div className="mb-4">
                    <label className="flex items-center text-[15px] text-gray-700">
                      <input
                        type="checkbox"
                        checked={aiSettings.useEmojis}
                        onChange={(e) => onAISettingsChange({
                          ...aiSettings,
                          useEmojis: e.target.checked
                        })}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Use Emojis
                    </label>
                  </div>

                  {/* AI Rate Slider */}
                  <div className="mb-4">
                    <label className="block text-[15px] text-gray-700 mb-2">
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
                      className="w-full accent-blue-600"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Higher = More aggressive corrections
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
    </div>
  )
} 