'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { pipeline } from '@huggingface/transformers'

function splitTextToThread(text: string): string[] {
  if (!text.trim()) return ['']
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []
  const tweets: string[] = []
  let current = ''

  for (let sentence of sentences) {
    sentence = sentence.trim()
    if (sentence.length > 280) {
      // Split long sentence
      for (let i = 0; i < sentence.length; i += 280) {
        if (current) {
          tweets.push(current)
          current = ''
        }
        tweets.push(sentence.slice(i, i + 280))
      }
      continue
    }
    if ((current + ' ' + sentence).trim().length <= 280) {
      current = (current ? current + ' ' : '') + sentence
    } else {
      if (current) tweets.push(current)
      current = sentence
    }
  }
  if (current) tweets.push(current)
  return tweets
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
    setFullText(pasted)
    setTimeout(() => splitIntoThread(pasted), 0)
    e.preventDefault()
    // Run sentiment analysis on paste
    await analyzeMainSentiment(pasted)
  }

  const updateTweet = (index: number, content: string) => {
    const newThread = [...thread]
    newThread[index] = content
    setThread(newThread)
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
                setFullText(e.target.value)
                const mainTextarea = textareaRefs.current[0];
                if (mainTextarea) {
                  mainTextarea.style.height = 'auto';
                  mainTextarea.style.height = mainTextarea.scrollHeight + 'px';
                }
                splitIntoThread(e.target.value)
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
              <div key={index} className="relative flex flex-col items-center w-full" style={{maxWidth: '368px', marginLeft: 'auto', marginRight: 'auto'}}>
                <div className="flex flex-col items-center w-full">
                  {/* Connection line above except for first */}
                  {index > 0 && (
                    <div style={{height: '24px', width: '2px', background: '#e5e7eb', position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', zIndex: 0}} />
                  )}
                  {/* Logo Icon */}
                  <img src={AVATAR} alt="logo" className="w-9 h-9 rounded-full object-cover bg-gray-100 border border-gray-200 mt-1 z-10" />
                </div>
                <div className="flex space-x-3 w-full relative z-10 py-2">
                  <div className="flex-1">
                    <div className="flex items-center space mb-1">
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