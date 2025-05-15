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
  const [showXAISection, setShowXAISection] = useState(false)
  const [showXAISettings, setShowXAISettings] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
    <div className="relative">
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
          <div className="flex-1 overflow-hidden">
            <div className="h-[calc(100vh-20rem)] overflow-y-auto">
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowXAISettings(!showXAISettings);
                }}
                className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${showXAISettings ? 'bg-gray-100' : ''}`}
                title="Toggle Settings"
              >
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3765 17.7642 20.3765 18.295C20.3765 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2965 18.375 20.2965C17.8442 20.2965 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74486 20.1656 6.23582 20.3765 5.705 20.3765C5.17418 20.3765 4.66514 20.1656 4.29 19.79C3.91445 19.4149 3.70351 18.9058 3.70351 18.375C3.70351 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95231 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87231 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74486 3.62351 6.23582 3.62351 5.705C3.62351 5.17418 3.83445 4.66514 4.21 4.29C4.58514 3.91445 5.09418 3.70351 5.625 3.70351C6.15582 3.70351 6.66486 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95231 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87231 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62351 18.295 3.62351C18.8258 3.62351 19.3349 3.83445 19.71 4.21C20.0856 4.58514 20.2965 5.09418 20.2965 5.625C20.2965 6.15582 20.0856 6.66486 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </button>
            
            <div 
              className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                showXAISection 
                  ? 'max-h-[calc(100vh-400px)] opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="overflow-y-auto max-h-[calc(100vh-400px)] p-4 bg-white overscroll-contain">
                {showXAISettings ? (
                  <>
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
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Click the settings icon to configure XAI Assistant
                  </div>
                )}
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
    </div>
  )
} 