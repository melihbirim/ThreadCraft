export interface AISettings {
  apiKey: string
  tone: 'professional' | 'casual' | 'friendly' | 'formal'
  useEmojis: boolean
  aiRate: number // 0-100
  model?: 'grok-2-1212' | 'grok-3' | 'grok-3-fast' | 'grok-3-mini' | 'grok-3-mini-fast'
  suggestHashtags?: boolean // Whether to suggest relevant hashtags
}

export interface Draft {
  id: string
  content: string
  title?: string
  createdAt: string
  updatedAt: string
  images: {[key: number]: TweetImage}
}

export interface TweetImage {
  url: string
  type: 'local' | 'remote'
} 