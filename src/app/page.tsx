'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

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

// Add new state for images
interface TweetImage {
  url: string;
  type: 'local';
}

// Constants for layout and styling
const LAYOUT = {
  connection: {
    top: 50,          // top position of connection line
    width: 2,         // width of connection line
    padding: 40,      // padding for connection line height
  },
  tweet: {
    imageSelector: '.relative.mt-2',
    lineSelector: '[style*="top: 50px"]',
  }
} as const;

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
  const [thread, setThread] = useState<string[]>(() => splitTextToThread(INITIAL_CONTENT))
  const [fullText, setFullText] = useState(INITIAL_CONTENT)
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([])
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [tweetImages, setTweetImages] = useState<{[key: number]: TweetImage}>({})

  const adjustTweetHeight = (index: number) => {
    const ref = textareaRefs.current[index];
    if (!ref) return;

    // Reset and set new height
    ref.style.height = 'auto';
    ref.style.height = `${ref.scrollHeight}px`;
    
    // Update connection line height if not the last tweet
    if (index < thread.length - 1) {
      const tweetContainer = ref.closest('.relative');
      if (!tweetContainer) return;

      const connectionLine = tweetContainer.querySelector(LAYOUT.tweet.lineSelector) as HTMLElement;
      const imageContainer = tweetContainer.querySelector(LAYOUT.tweet.imageSelector) as HTMLElement;
      
      if (connectionLine) {
        const imageHeight = imageContainer?.offsetHeight || 0;
        const totalHeight = ref.scrollHeight + imageHeight + LAYOUT.connection.padding;
        connectionLine.style.height = `${totalHeight}px`;
      }
    }
  };

  useEffect(() => {
    const adjustAllHeights = () => {
      thread.forEach((_, idx) => adjustTweetHeight(idx));
    };

    // Initial adjustment
    adjustAllHeights();

    // Adjust on window resize and after images load
    window.addEventListener('resize', adjustAllHeights);
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('load', adjustAllHeights);
    });

    return () => {
      window.removeEventListener('resize', adjustAllHeights);
      document.querySelectorAll('img').forEach(img => {
        img.removeEventListener('load', adjustAllHeights);
      });
    };
  }, [thread, tweetImages]);

  const splitIntoThread = (text?: string) => {
    const input = typeof text === 'string' ? text : fullText
    setThread(splitTextToThread(input))
  }

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
      splitIntoThread(newText)
      
      // Set cursor position after pasted text
      textarea.selectionStart = start + cleaned.length
      textarea.selectionEnd = start + cleaned.length
    }, 0)
  }

  const updateTweet = (index: number, content: string) => {
    const newThread = [...thread];
    newThread[index] = content;
    setThread(newThread);
    
    // Immediate height adjustment
    setTimeout(() => adjustTweetHeight(index), 0);
  };

  const addTweet = () => {
    setThread([...thread, ''])
  }

  const removeTweet = (index: number) => {
    if (tweetImages[index]?.type === 'local') {
      URL.revokeObjectURL(tweetImages[index].url)
    }
    const newThread = thread.filter((_, i) => i !== index)
    setThread(newThread)
    setTweetImages(prev => {
      const newImages = { ...prev }
      delete newImages[index]
      return newImages
    })
  }

  const handleImageUpload = (index: number, file: File) => {
    if (file) {
      const url = URL.createObjectURL(file)
      setTweetImages(prev => ({
        ...prev,
        [index]: { url, type: 'local' }
      }));
      
      // Adjust heights after image is set
      setTimeout(() => adjustTweetHeight(index), 100);
    }
  }

  const removeImage = (index: number) => {
    if (tweetImages[index]?.type === 'local') {
      URL.revokeObjectURL(tweetImages[index].url)
    }
    setTweetImages(prev => {
      const newImages = { ...prev }
      delete newImages[index]
      return newImages
    })
  }

  // Function to encode tweet text for URLs
  const encodeTweet = (text: string) => {
    return encodeURIComponent(text).replace(/'/g, "%27");
  }

  // Function to publish thread to X
  const publishToX = async () => {
    if (thread.length === 0) return;
    
    // Show coming soon message for now
    setShowPublishModal(false);
    alert("Coming soon! We're working on X API integration for proper thread posting. This will require you to authenticate with your X account.");
    
    // For development/testing: log the thread that would be posted
    console.log('Thread to be posted:', thread.map((tweet, index) => ({
      text: tweet,
      threadPosition: `${index + 1}/${thread.length}`,
      mediaIds: tweetImages[index] ? [tweetImages[index].url] : []
    })));
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <img src={AVATAR} alt="ThreadCraft Logo" className="w-8 h-8 rounded-full bg-gray-200" /> ThreadCraft
        </h1>
        <p className="text-gray-600 mb-8">Write and split your X threads with ease</p>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Editor */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write your thread
              </label>
              <div className="relative">
                <textarea
                  ref={el => { textareaRefs.current[0] = el; }}
                  className="w-full min-h-[8rem] p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 resize-none shadow-sm"
                  value={fullText}
                  onChange={(e) => {
                    const cleaned = cleanNewlines(e.target.value)
                    setFullText(e.target.value)
                    const mainTextarea = textareaRefs.current[0];
                    if (mainTextarea) {
                      mainTextarea.style.height = 'auto';
                      mainTextarea.style.height = `${Math.max(mainTextarea.scrollHeight, 128)}px`;
                    }
                    splitIntoThread(cleaned)
                  }}
                  onPaste={handlePaste}
                  placeholder="🧵 Ready to craft an epic thread?

Start with a bang! Share your insights, tell a story, or teach something amazing.

Pro tips:
• Hook your readers with a strong opening
• Break down complex ideas into digestible parts
• Add relevant images to boost engagement
• End with a clear call-to-action

Need inspiration? Try writing about:
'Here's what I learned from...'
'The ultimate guide to...'
'5 mind-blowing facts about...'"
                  style={{fontFamily: 'inherit', overflow: 'hidden', height: 'auto', fontSize: '15.5px'}}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={addTweet}
                variant="outline"
                className="flex-1"
              >
                Add Tweet
              </Button>
              <Button
                className="flex-1 bg-primary text-white hover:bg-primary/90 transition"
                onClick={() => setShowPublishModal(true)}
              >
                Publish
              </Button>
            </div>
          </div>

          {/* Right column - Preview */}
          <div className="lg:border-l lg:pl-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Thread Preview</h2>
            <div className="space-y-4 flex flex-col items-center max-w-[368px] mx-auto">
              {thread.map((tweet, index) => (
                <div key={index} className="relative flex w-full items-start">
                  {/* Connection line below except for last */}
                  {index < thread.length - 1 && (
                    <div style={{
                      height: '83%',
                      width: `${LAYOUT.connection.width}px`,
                      background: '#e5e7eb',
                      position: 'absolute',
                      top: `${LAYOUT.connection.top}px`,
                      left: '27px',
                      zIndex: 0
                    }} />
                  )}
                  {/* Logo Icon */}
                  <img src={AVATAR} alt="logo" className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200 mt-1 ml-2 flex-shrink-0" style={{alignSelf: 'flex-start'}} />
                  <div className="flex-1 pl-3 py-2">
                    <div className="flex items-center space mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{USERNAME}</span>
                      <span className="text-gray-500 text-sm">{HANDLE}</span>
                      <span className="text-gray-400 text-xs">· 1m</span>
                    </div>
                    <textarea
                      ref={el => { textareaRefs.current[index] = el; }}
                      className="w-full p-0 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 resize-none min-h-[2.5rem] leading-relaxed"
                      value={tweet}
                      onChange={(e) => updateTweet(index, e.target.value)}
                      maxLength={280}
                      rows={1}
                      style={{fontFamily: 'inherit', overflow: 'hidden', height: 'auto', fontSize: '15.5px'}}
                    />

                    {/* Image preview */}
                    {tweetImages[index] && (
                      <div className="relative mt-2 rounded-2xl overflow-hidden">
                        <img 
                          src={tweetImages[index].url} 
                          alt="Tweet media" 
                          className="max-h-[300px] w-full object-cover rounded-2xl"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Bottom bar with thread indicator and actions */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">🧵 {index + 1}/{thread.length}</span>
                      <div className="flex items-center gap-4">
                        {/* Image upload button */}
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files && handleImageUpload(index, e.target.files[0])}
                            className="hidden"
                            id={`image-upload-${index}`}
                          />
                          <label
                            htmlFor={`image-upload-${index}`}
                            className="cursor-pointer text-gray-500 hover:text-primary transition-colors"
                            title="Add image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </label>
                        </div>
                        <span className="text-xs text-gray-400">{tweet.length}/280</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Publish Thread to X</h3>
            <p className="mb-6 text-gray-700">
              To publish this thread, you'll need to authenticate with your X account.
              This feature is coming soon!
            </p>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] transition"
                onClick={publishToX}
              >
                Connect X Account
              </Button>
              <Button 
                className="flex-1" 
                variant="outline" 
                onClick={() => setShowPublishModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast - removed for now */}
    </div>
  )
} 