import { Draft, TweetImage } from '@/types'

const STORAGE_KEY = 'threadcraft_drafts'

// Generate a unique ID for drafts
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Get title from content (first line or first N characters)
function generateTitle(content: string): string {
  const firstLine = content.split('\n')[0].trim()
  return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine
}

// Save drafts to local storage
function saveDraftsToStorage(drafts: Draft[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
}

// Load drafts from local storage
export function loadDrafts(): Draft[] {
  try {
    const drafts = localStorage.getItem(STORAGE_KEY)
    return drafts ? JSON.parse(drafts) : []
  } catch (error) {
    console.error('Error loading drafts:', error)
    return []
  }
}

// Add a new draft
export function saveDraft(content: string, images: {[key: number]: TweetImage} = {}): Draft {
  const drafts = loadDrafts()
  const newDraft: Draft = {
    id: generateId(),
    content,
    title: generateTitle(content),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images
  }
  
  drafts.unshift(newDraft)
  saveDraftsToStorage(drafts)
  return newDraft
}

// Update an existing draft
export function updateDraft(id: string, content: string, images: {[key: number]: TweetImage} = {}): Draft | null {
  const drafts = loadDrafts()
  const index = drafts.findIndex(d => d.id === id)
  
  if (index === -1) return null
  
  const updatedDraft: Draft = {
    ...drafts[index],
    content,
    title: generateTitle(content),
    updatedAt: new Date().toISOString(),
    images
  }
  
  drafts[index] = updatedDraft
  saveDraftsToStorage(drafts)
  return updatedDraft
}

// Delete a draft
export function deleteDraft(id: string): boolean {
  const drafts = loadDrafts()
  const filteredDrafts = drafts.filter(d => d.id !== id)
  
  if (filteredDrafts.length === drafts.length) return false
  
  saveDraftsToStorage(filteredDrafts)
  return true
}

// Get a single draft by ID
export function getDraft(id: string): Draft | null {
  const drafts = loadDrafts()
  return drafts.find(d => d.id === id) || null
} 