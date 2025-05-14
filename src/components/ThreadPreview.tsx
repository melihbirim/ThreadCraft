import React, { useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ThreadPreviewProps {
  thread: string[]
  tweetImages: {[key: number]: TweetImage}
  onImageUpload: (index: number, file: File) => void
  onImageRemove: (index: number) => void
  onTweetUpdate: (index: number, content: string) => void
}

interface TweetImage {
  url: string
  type: 'local'
}

const LAYOUT = {
  connection: {
    top: 50,
    width: 2,
    padding: 40,
  }
}

export function ThreadPreview({ 
  thread, 
  tweetImages, 
  onImageUpload, 
  onImageRemove, 
  onTweetUpdate 
}: ThreadPreviewProps) {
  const { data: session } = useSession()
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  const userAvatar = session?.user?.image || '/threadcraft-logo.png'
  const userName = session?.user?.name || 'ThreadCraft'
  const userHandle = session?.user?.username ? `@${session.user.username}` : '@threadcraft'

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

      const connectionLine = tweetContainer.querySelector('[style*="top: 50px"]') as HTMLElement;
      const imageContainer = tweetContainer.querySelector('.relative.mt-2') as HTMLElement;
      
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

  return (
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
            {/* Profile Icon */}
            <img src={userAvatar} alt="Profile" className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200 mt-1 ml-2 flex-shrink-0" style={{alignSelf: 'flex-start'}} />
            <div className="flex-1 pl-3 py-2">
              <div className="flex items-center space mb-1">
                <span className="font-semibold text-gray-900 text-sm">{userName}</span>
                <span className="text-gray-500 text-sm ml-1">{userHandle}</span>
                <span className="text-gray-400 text-xs ml-1">· 1m</span>
              </div>
              <textarea
                ref={el => { textareaRefs.current[index] = el; }}
                className="w-full p-0 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 resize-none min-h-[2.5rem] leading-relaxed"
                value={tweet}
                onChange={(e) => onTweetUpdate(index, e.target.value)}
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
                    onClick={() => onImageRemove(index)}
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
                      onChange={(e) => e.target.files && onImageUpload(index, e.target.files[0])}
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
  )
} 