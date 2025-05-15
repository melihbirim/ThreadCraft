import React, { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { cleanNewlines } from '@/lib/utils'

interface ThreadEditorProps {
  fullText: string
  setFullText: (text: string) => void
  onSplit: (text: string) => void
  onPublish: () => void
  onAIGenerate?: () => void
  isGenerating?: boolean
  showAIButton?: boolean
}

const PLACEHOLDER = `🧵 Ready to craft an epic thread?

Start with a bang! Share your insights, tell a story, or teach something amazing.

Pro tips:
• Hook your readers with a strong opening
• Break down complex ideas into digestible parts
• Add relevant images to boost engagement
• End with a clear call-to-action

Need inspiration? Try writing about:
'Here's what I learned from...'
'The ultimate guide to...'
'5 mind-blowing facts about...'`

export function ThreadEditor({ 
  fullText, 
  setFullText, 
  onSplit, 
  onPublish,
  onAIGenerate,
  isGenerating,
  showAIButton 
}: ThreadEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const cleaned = cleanNewlines(pasted)
    
    // Get cursor position
    const textarea = e.currentTarget
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // Combine the text before cursor + pasted text + text after cursor
    const newText = fullText.substring(0, start) + cleaned + fullText.substring(end)
    setFullText(newText)
    
    // Update thread after paste
    setTimeout(() => {
      onSplit(newText)
      
      // Set cursor position after pasted text
      textarea.selectionStart = start + cleaned.length
      textarea.selectionEnd = start + cleaned.length
    }, 0)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none">
        <div className="flex items-center justify-between mb-4">
          <label className="text-base font-medium text-gray-800">
            Write your thread
          </label>
          <span className="text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
            {fullText.length} characters
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full relative">
          <textarea
            ref={textareaRef}
            className="w-full h-full p-5 border rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 bg-gray-50/50 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-colors duration-200"
            value={fullText}
            onChange={(e) => {
              const cleaned = cleanNewlines(e.target.value)
              setFullText(e.target.value)
              onSplit(cleaned)
            }}
            onPaste={handlePaste}
            placeholder={PLACEHOLDER}
            style={{
              fontFamily: 'inherit',
              fontSize: '15px',
              lineHeight: '1.6',
            }}
          />
          
          {/* Floating AI Button */}
          {showAIButton && onAIGenerate && (
            <button
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="absolute bottom-4 right-4 bg-black text-white rounded-full p-3 hover:bg-gray-900 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg"
              title="Improve with AI"
            >
              {isGenerating ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 flex-none pt-4 border-t border-surface-200">
        <Button
          variant="dark"
          size="lg"
          className="flex-1"
          onClick={onPublish}
        >
          Post Thread
        </Button>
      </div>
    </div>
  )
} 