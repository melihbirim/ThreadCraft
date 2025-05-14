const STORAGE_KEYS = {
  API_KEY: 'threadcraft_xai_key',
  DRAFTS: 'threadcraft_drafts'
} as const

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || ''
}

export function setStoredApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return
  if (apiKey) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey)
  } else {
    localStorage.removeItem(STORAGE_KEYS.API_KEY)
  }
} 