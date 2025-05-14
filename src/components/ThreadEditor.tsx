import React, { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { cleanNewlines } from '@/lib/utils'

interface ThreadEditorProps {
  fullText: string
  setFullText: (text: string) => void
  onSplit: (text: string) => void
  onPublish: () => void
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

export function ThreadEditor({ fullText, setFullText, onSplit, onPublish }: ThreadEditorProps) {
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
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Write your thread
        </label>
        <div className="grid">
          <textarea
            ref={textareaRef}
            className="w-full min-h-[8rem] p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 resize-none shadow-sm h-auto overflow-hidden"
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
              minHeight: '8rem',
              height: 'auto',
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
      <div className="flex">
        <Button
          className="w-full bg-black text-white hover:bg-gray-900 transition rounded-full text-lg font-bold py-3"
          onClick={onPublish}
        >
          Post
        </Button>
      </div>
    </div>
  )
} 