'use client'

import React, { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Header } from '@/components/Header'
import { ThreadEditor } from '@/components/ThreadEditor'
import { ThreadPreview } from '@/components/ThreadPreview'
import { PublishModal } from '@/components/PublishModal'
import { Sidebar } from '@/components/Sidebar'
import { splitTextToThread } from '@/lib/utils'
import { generateAIContent } from '@/lib/ai'
import { saveDraft, updateDraft } from '@/lib/drafts'
import { getStoredApiKey, setStoredApiKey } from '@/lib/storage'
import { AISettings, Draft, TweetImage } from '@/types'
import { SuccessDialog } from '@/components/SuccessDialog'

const INITIAL_CONTENT = `🧵 Ready to craft an epic thread?

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

export default function Home() {
  const { data: session } = useSession()
  const [isPublishing, setIsPublishing] = useState(false)
  const [thread, setThread] = useState<string[]>(() => splitTextToThread(INITIAL_CONTENT))
  const [fullText, setFullText] = useState(INITIAL_CONTENT)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [tweetImages, setTweetImages] = useState<{[key: number]: TweetImage}>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const [aiSettings, setAiSettings] = useState<AISettings>({
    apiKey: '',
    model: 'grok-2-1212',
    tone: 'professional',
    useEmojis: true,
    aiRate: 50
  })
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [publishedThreadUrl, setPublishedThreadUrl] = useState<string>()
  const [postedTweetsCount, setPostedTweetsCount] = useState<number>(0)
  const [publishError, setPublishError] = useState<string | null>(null)

  // Load stored API key on mount
  useEffect(() => {
    const storedApiKey = getStoredApiKey()
    if (storedApiKey) {
      setAiSettings(prev => ({ ...prev, apiKey: storedApiKey }))
    }
  }, [])

  // Handle AI settings changes
  const handleAISettingsChange = (newSettings: AISettings) => {
    setAiSettings(newSettings)
    // Store API key when it changes
    if (newSettings.apiKey !== aiSettings.apiKey) {
      setStoredApiKey(newSettings.apiKey)
    }
  }

  // Auto-save draft when content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fullText.trim() && fullText !== INITIAL_CONTENT) {
        if (currentDraftId) {
          updateDraft(currentDraftId, fullText, tweetImages)
        } else {
          const draft = saveDraft(fullText, tweetImages)
          setCurrentDraftId(draft.id)
        }
      }
    }, 1000) // Save after 1 second of no typing

    return () => clearTimeout(timeoutId)
  }, [fullText, tweetImages, currentDraftId])

  const handleImageUpload = (index: number, file: File) => {
    if (file) {
      const url = URL.createObjectURL(file)
      setTweetImages(prev => ({
        ...prev,
        [index]: { url, type: 'local' }
      }))
    }
  }

  const handleImageRemove = (index: number) => {
    if (tweetImages[index]?.type === 'local') {
      URL.revokeObjectURL(tweetImages[index].url)
    }
    setTweetImages(prev => {
      const newImages = { ...prev }
      delete newImages[index]
      return newImages
    })
  }

  const handleTweetUpdate = (index: number, content: string) => {
    const newThread = [...thread]
    newThread[index] = content
    setThread(newThread)
  }

  const handleDraftSelect = (draft: Draft) => {
    setFullText(draft.content)
    setTweetImages(draft.images)
    setCurrentDraftId(draft.id)
    setThread(splitTextToThread(draft.content))
  }

  const handleNewThread = () => {
    // Clear current draft
    setCurrentDraftId(undefined)
    // Reset content to initial template
    setFullText(INITIAL_CONTENT)
    // Clear images
    setTweetImages({})
    // Reset thread
    setThread(splitTextToThread(INITIAL_CONTENT))
  }

  const handleAIGenerate = async () => {
    if (!aiSettings.apiKey || !fullText) {
      setError('Please enter your API key first')
      return
    }

    try {
      setIsGenerating(true)
      setError(null)
      const improvedText = await generateAIContent(fullText, aiSettings)
      setFullText(improvedText)
      setThread(splitTextToThread(improvedText))
    } catch (error) {
      console.error('AI generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate AI content')
    } finally {
      setIsGenerating(false)
    }
  }

  const publishToX = async () => {
    console.log('Current session:', session); // Log session data

    if (!session?.accessToken) {
      console.log('Missing access token, redirecting to sign in');
      signIn('twitter');
      return;
    }

    if (thread.length === 0) return;

    try {
      setIsPublishing(true);
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({
          thread,
          images: Object.entries(tweetImages).map(([index, image]) => ({
            index: parseInt(index),
            url: image.url,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to post thread')
      }

      const result = await response.json()
      setShowPublishModal(false)
      
      // Get the URL of the first tweet in the thread
      const threadUrl = result[0]?.data?.id 
        ? `https://twitter.com/i/web/status/${result[0].data.id}`
        : undefined
      
      setPublishedThreadUrl(threadUrl)
      setPostedTweetsCount(result.length)
      setShowSuccessDialog(true)

      // Reset the editor after a short delay
      setTimeout(() => {
        setThread([''])
        setFullText('')
        setTweetImages({})
        setCurrentDraftId(undefined)
      }, 500)

    } catch (error) {
      console.error('Error publishing thread:', error);
      setPublishError(error instanceof Error ? error.message : 'Failed to publish thread');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar 
        aiSettings={aiSettings} 
        onAISettingsChange={handleAISettingsChange}
        onDraftSelect={handleDraftSelect}
        currentDraftId={currentDraftId}
        onNewThread={handleNewThread}
      />

      {/* Main Content */}
      <div className="flex-1 h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-6 py-8 h-full">
          <div className="max-w-7xl mx-auto h-full">
            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              {/* Left column - Editor */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 overflow-auto">
                <ThreadEditor
                  fullText={fullText}
                  setFullText={setFullText}
                  onSplit={(text) => setThread(splitTextToThread(text))}
                  onPublish={() => setShowPublishModal(true)}
                  onAIGenerate={handleAIGenerate}
                  isGenerating={isGenerating}
                  showAIButton={!!aiSettings.apiKey}
                />
              </div>

              {/* Right column - Preview */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 overflow-auto">
                <ThreadPreview
                  thread={thread}
                  tweetImages={tweetImages}
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  onTweetUpdate={handleTweetUpdate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={publishToX}
        isPublishing={isPublishing}
        threadLength={thread.length}
      />

      {/* Error Toast */}
      {error && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
          onClick={() => setError(null)}
          style={{ cursor: 'pointer' }}
        >
          <span>{error}</span>
          <button className="ml-2 hover:text-gray-200">✕</button>
        </div>
      )}

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false)
          setPublishedThreadUrl(undefined)
          setPostedTweetsCount(0)
        }}
        threadUrl={publishedThreadUrl}
        totalTweets={thread.length}
        postedTweets={postedTweetsCount}
      />
    </div>
  )
} 