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
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <label className="text-lg font-semibold text-gray-900">
            Write your thread
          </label>
          <span className="text-sm text-gray-500">
            {fullText.length} characters
          </span>
        </div>
        <div className="grid h-[calc(100%-2rem)]">
          <textarea
            ref={textareaRef}
            className="w-full h-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 resize-none shadow-sm transition-colors duration-200"
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
              fontSize: '15.5px',
              lineHeight: '1.5',
              gridArea: '1 / 1 / 2 / 2',
            }}
          />
          <div 
            className="invisible whitespace-pre-wrap break-words overflow-hidden"
            style={{
              gridArea: '1 / 1 / 2 / 2',
              padding: '1rem',
              fontFamily: 'inherit',
              fontSize: '15.5px',
              lineHeight: '1.5',
            }}
            aria-hidden="true"
          >
            {fullText || ' '}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4 sticky bottom-0 bg-white pt-4 border-t">
        <Button
          className="flex-1 bg-black text-white hover:bg-gray-900 transition rounded-xl text-[15px] font-semibold py-3 shadow-sm"
          onClick={onPublish}
        >
          Post Thread
        </Button>
        
        {showAIButton && onAIGenerate && (
          <Button
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition rounded-xl text-[15px] font-semibold py-3 shadow-sm relative"
            onClick={onAIGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="opacity-0">Improve with AI</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                </div>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Improve with AI
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
} 