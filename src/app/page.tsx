'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { pipeline } from '@huggingface/transformers'

// Utility to clean up newlines in text
function cleanNewlines(text: string): string {
  // Replace 3 or more newlines with two newlines
  // This preserves intentional paragraph breaks while cleaning up excessive spacing
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+/, '')  // Trim start
    .replace(/\s+$/, ''); // Trim end
}

// Provided smart thread splitting function (renamed for consistency)
function splitTextToThread(
  text: string,
  maxLength: number = 280,
  options: { emojiPrefix?: string } = {}
): string[] {
  const { emojiPrefix = '' } = options;
  // Split by paragraphs first
  const paragraphs = text.split(/\n{2,}/).map((p: string) => p.trim()).filter(Boolean);
  const rawThreads = [];
  for (const para of paragraphs) {
    const sentences = para.match(/[^.!?]+[.!?]?\s*/g) || [];
    let current = '';
    for (const sentence of sentences) {
      if ((current + sentence).length <= maxLength) {
        current += sentence;
      } else {
        if (current) {
          rawThreads.push(current.trim());
          current = sentence;
        } else {
          // Sentence too long: split by words
          const words = sentence.split(' ');
          let chunk = '';
          for (const word of words) {
            if ((chunk + word + ' ').length <= maxLength) {
              chunk += word + ' ';
            } else {
              rawThreads.push(chunk.trim());
              chunk = word + ' ';
            }
          }
          if (chunk) rawThreads.push(chunk.trim());
          current = '';
        }
      }
    }
    if (current) rawThreads.push(current.trim());
  }
  // Remove empty tweets
  const filtered = rawThreads.filter(Boolean);
  // Remove numbering/emoji for now (handled in UI)
  return filtered;
}

const AVATAR = '/threadcraft-logo.png'
const USERNAME = ''
const HANDLE = '@threadcraft'

export default function Home() {
  const [thread, setThread] = useState<string[]>([''])
  const [fullText, setFullText] = useState('')
  const [loading, setLoading] = useState<{[k:number]:boolean}>({})
  const [sentiments, setSentiments] = useState<{[k:number]:string}>({})
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([])
  const [sentimentPipeline, setSentimentPipeline] = useState<any>(null)
  const [pipelineLoading, setPipelineLoading] = useState(false)

  // NEW: State for main text sentiment
  const [mainSentiment, setMainSentiment] = useState<string | null>(null)
  const [mainSentimentLoading, setMainSentimentLoading] = useState(false)

  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)

  useEffect(() => {
    thread.forEach((_, idx) => {
      const ref = textareaRefs.current[idx];
      if (ref) {
        ref.style.height = 'auto';
        ref.style.height = ref.scrollHeight + 'px';
        // Update the connection line height for the tweet above
        if (idx < thread.length - 1) {
          const tweetContainer = ref.closest('.relative');
          const connectionLine = tweetContainer?.querySelector('[style*="top: 36px"]') as HTMLElement;
          if (connectionLine) {
            connectionLine.style.height = `${ref.scrollHeight + 12}px`;
          }
        }
      }
    });
  }, [thread]);

  // Load the pipeline on first use
  const loadPipeline = async () => {
    if (!sentimentPipeline && !pipelineLoading) {
      setPipelineLoading(true)
      const pipe = await pipeline('sentiment-analysis')
      setSentimentPipeline(() => pipe)
      setPipelineLoading(false)
    }
  }

  const splitIntoThread = (text?: string) => {
    const input = typeof text === 'string' ? text : fullText
    setThread(splitTextToThread(input))
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text')
    const cleaned = cleanNewlines(pasted)
    setFullText(cleaned)
    setTimeout(() => splitIntoThread(cleaned), 0)
    e.preventDefault()
    // Run sentiment analysis on paste
    await analyzeMainSentiment(cleaned)
  }

  const updateTweet = (index: number, content: string) => {
    const newThread = [...thread];
    newThread[index] = content;
    setThread(newThread);
    
    // Immediate height adjustment
    setTimeout(() => {
      const ref = textareaRefs.current[index];
      if (ref) {
        ref.style.height = 'auto';
        ref.style.height = ref.scrollHeight + 'px';
        // Update connection line height
        if (index < thread.length - 1) {
          const tweetContainer = ref.closest('.relative');
          const connectionLine = tweetContainer?.querySelector('[style*="top: 36px"]') as HTMLElement;
          if (connectionLine) {
            connectionLine.style.height = `${ref.scrollHeight + 12}px`;
          }
        }
      }
    }, 0);
  }

  const addTweet = () => {
    setThread([...thread, ''])
  }

  const removeTweet = (index: number) => {
    const newThread = thread.filter((_, i) => i !== index)
    setThread(newThread)
  }

  // Local sentiment analysis using transformers
  const analyzeSentiment = async (index: number) => {
    await loadPipeline()
    if (!sentimentPipeline) return
    setLoading(l => ({...l, [index]: true}))
    try {
      const result = await sentimentPipeline(thread[index])
      setSentiments(s => ({...s, [index]: result[0]?.label || ''}))
    } catch (e) {
      alert('Error analyzing sentiment')
    }
    setLoading(l => ({...l, [index]: false}))
  }

  // Modified analyzeMainSentiment to accept optional text
  const analyzeMainSentiment = async (textOverride?: string) => {
    await loadPipeline()
    if (!sentimentPipeline) return
    setMainSentimentLoading(true)
    try {
      const result = await sentimentPipeline(textOverride ?? fullText)
      setMainSentiment(result[0]?.label || '')
    } catch (e) {
      alert('Error analyzing sentiment')
    }
    setMainSentimentLoading(false)
  }

  // Handle publish
  const handlePublish = () => {
    setShowPublishModal(false)
    setPublishSuccess(true)
    setThread([''])
    setFullText('')
    setTimeout(() => setPublishSuccess(false), 2500)
  }

  // Debounce sentiment analysis for main textarea
  useEffect(() => {
    if (!fullText.trim()) {
      setMainSentiment(null)
      return;
    }
    const timeout = setTimeout(() => {
      analyzeMainSentiment(fullText)
    }, 500)
    return () => clearTimeout(timeout)
  }, [fullText])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <img src={AVATAR} alt="ThreadCraft Logo" className="w-8 h-8 rounded-full bg-gray-200" /> ThreadCraft
        </h1>
        <p className="text-gray-600 mb-8">Write and split your X threads with ease</p>
        {/* Full text input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Write your thread
          </label>
          <div className="relative mx-auto w-full">
            <textarea
              ref={el => { textareaRefs.current[0] = el; }}
              className="w-full min-h-[8rem] p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 resize-none shadow-sm"
              value={fullText}
              onChange={(e) => {
                const cleaned = cleanNewlines(e.target.value)
                setFullText(e.target.value) // Use original value instead of cleaned for better editing experience
                const mainTextarea = textareaRefs.current[0];
                if (mainTextarea) {
                  mainTextarea.style.height = 'auto';
                  mainTextarea.style.height = mainTextarea.scrollHeight + 'px';
                }
                splitIntoThread(cleaned)
              }}
              onPaste={handlePaste}
              placeholder="Write your thread here or paste your content..."
              style={{fontFamily: 'inherit', overflow: 'hidden', height: 'auto', fontSize: '15.5px'}}
            />
          </div>
        </div>
        {/* Main text analysis results */}
        {mainSentiment && (
          <div className="mb-8 p-4 bg-gray-100 rounded shadow-sm">
            <span className="font-semibold">Sentiment:</span> {mainSentiment}
          </div>
        )}
        {/* Thread preview */}
        {fullText.trim() && (
          <div className="space-y-4 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 w-full text-center">Thread Preview</h2>
            {thread.map((tweet, index) => (
              <div key={index} className="relative flex w-full items-start" style={{maxWidth: '368px', marginLeft: 'auto', marginRight: 'auto'}}>
                {/* Connection line above except for first */}
                {index > 0 && (
                  <div style={{height: '24px', width: '2px', background: '#e5e7eb', position: 'absolute', top: '-24px', left: '27px', zIndex: 0}} />
                )}
                {/* Connection line below except for last */}
                {index < thread.length - 1 && (
                  <div style={{height: '100%', width: '2px', background: '#e5e7eb', position: 'absolute', top: '50px', left: '27px', zIndex: 0}} />
                )}
                {/* Logo Icon */}
                <img src={AVATAR} alt="logo" className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200 mt-1 ml-2 flex-shrink-0" style={{alignSelf: 'flex-start'}} />
                <div className="flex-1 pl-3 py-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{USERNAME}</span>
                    <span className="text-gray-500 text-sm">{HANDLE}</span>
                    <span className="text-gray-400 text-xs">· 1m</span>
                  </div>
                  {/* Auto-resizing textarea, no border, no background, flexible height */}
                  <textarea
                    ref={el => { textareaRefs.current[index] = el; }}
                    className="w-full p-0 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 resize-none min-h-[2.5rem] leading-relaxed"
                    value={tweet}
                    onChange={(e) => updateTweet(index, e.target.value)}
                    maxLength={280}
                    rows={1}
                    style={{fontFamily: 'inherit', overflow: 'hidden', height: 'auto', fontSize: '15.5px'}}
                  />
                  {/* Thread indicator */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">🧵 {index + 1}/{thread.length}</span>
                    <span className="text-xs text-gray-400">{tweet.length}/280</span>
                  </div>
                </div>
              </div>
            ))}
            <Button
              onClick={addTweet}
              variant="outline"
              className="w-full max-w-xs mx-auto mt-2"
            >
              Add Tweet
            </Button>
            {/* Publish Button */}
            <Button
              className="w-full max-w-xs mx-auto mt-4 bg-primary text-white text-lg py-3 rounded-xl hover:bg-primary/90 transition"
              onClick={() => setShowPublishModal(true)}
            >
              Publish
            </Button>
          </div>
        )}
        {/* Publish Modal */}
        {showPublishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Publish</h3>
              <p className="mb-6 text-gray-700">Are you sure you want to publish this thread?</p>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handlePublish}>Yes, Publish</Button>
                <Button className="flex-1" variant="outline" onClick={() => setShowPublishModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
        {/* Success Toast */}
        {publishSuccess && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
            Thread published successfully!
          </div>
        )}
      </div>
    </div>
  )
} 