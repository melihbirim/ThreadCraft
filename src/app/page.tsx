'use client'

import React, { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Header } from '@/components/Header'
import { ThreadEditor } from '@/components/ThreadEditor'
import { ThreadPreview } from '@/components/ThreadPreview'
import { PublishModal } from '@/components/PublishModal'
import { splitTextToThread } from '@/lib/utils'

interface TweetImage {
  url: string
  type: 'local'
}

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

  const publishToX = async () => {
    if (!session?.accessToken) {
      signIn('twitter')
      return
    }

    if (thread.length === 0) return

    try {
      setIsPublishing(true)
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread,
          images: Object.entries(tweetImages).map(([index, image]) => ({
            index: parseInt(index),
            url: image.url,
          })),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to post thread')
      }

      setShowPublishModal(false)
      setPublishSuccess(true)
      setTimeout(() => {
        setPublishSuccess(false)
        setThread([''])
        setFullText('')
        setTweetImages({})
      }, 2500)
    } catch (error) {
      console.error('Publishing error:', error)
      alert(error instanceof Error ? error.message : 'Failed to publish thread')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <p className="text-gray-600 mb-8">Write and split your X threads with ease</p>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Editor */}
          <ThreadEditor
            fullText={fullText}
            setFullText={setFullText}
            onSplit={(text) => setThread(splitTextToThread(text))}
            onPublish={() => setShowPublishModal(true)}
          />

          {/* Right column - Preview */}
          <ThreadPreview
            thread={thread}
            tweetImages={tweetImages}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            onTweetUpdate={handleTweetUpdate}
          />
        </div>
      </div>

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={publishToX}
        isPublishing={isPublishing}
        threadLength={thread.length}
      />

      {/* Success Toast */}
      {publishSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          Thread published successfully!
        </div>
      )}
    </div>
  )
} 