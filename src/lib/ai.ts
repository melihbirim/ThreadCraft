import { AISettings } from '@/types'
import { createXai } from '@ai-sdk/xai'
import { generateText } from 'ai'

// Create XAI instance with API key
const createXaiInstance = (apiKey: string) => createXai({
  apiKey,
  baseURL: 'https://api.x.ai/v1'
})

export async function generateAIContent(
  text: string,
  settings: AISettings
): Promise<string> {
  if (!settings.apiKey) {
    throw new Error('API key is required')
  }

  try {
    console.log('Making XAI request...')
    
    // Create system prompt
    const systemPrompt = generateSystemPrompt(settings)
    
    // Create XAI instance with the provided API key
    const xai = createXaiInstance(settings.apiKey)
    
    // Create model with user identifier and selected model
    const model = xai(settings.model || 'grok-2-1212', {
      user: 'threadcraft-user'
    })

    // Generate text with proper settings
    const { text: improvedText } = await generateText({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: mapAIRateToTemperature(settings.aiRate)
    })

    return improvedText
  } catch (error) {
    console.error('AI generation error:', error)
    if (error instanceof Error) {
      throw new Error(`XAI error: ${error.message}`)
    }
    throw new Error('Failed to generate content')
  }
}

function generateSystemPrompt(settings: AISettings): string {
  const toneGuide = {
    professional: 'Use professional and business-appropriate language',
    casual: 'Keep the tone casual and conversational',
    friendly: 'Maintain a warm and approachable tone',
    formal: 'Use formal and academic language'
  }

  const emojiGuide = settings.useEmojis 
    ? 'Include relevant emojis where appropriate'
    : 'Do not use emojis'

  const hashtagGuide = settings.suggestHashtags
    ? 'Suggest 2-3 relevant hashtags at the end of the thread (before the last tweet)'
    : 'Do not add any hashtags'

  return `
    You are an expert at improving X (Twitter) threads. Help enhance the given text with these guidelines:

    Content Guidelines:
    - ${toneGuide[settings.tone]}
    - ${emojiGuide}
    - ${hashtagGuide}
    - Each section should naturally fit within 280 characters
    - Maintain the original message's intent and key points
    - Focus on clarity, engagement, and readability
    - Use clear transitions between ideas
    - Add engaging hooks and strong conclusions

    Important:
    - DO NOT add thread count numbers or "1/" style markers
    - DO NOT add "Thread 🧵" or similar thread indicators
    - DO NOT use line numbers or bullet points
    - Keep paragraphs separated by blank lines
    - Preserve the natural flow of ideas
    - Focus on making each section impactful and self-contained
    - If suggesting hashtags, make them relevant to the topic and trending
  `.trim()
}

function mapAIRateToTemperature(rate: number): number {
  // Map AI rate (0-100) to temperature (0.1-1.0)
  // Higher rate = lower temperature for more focused outputs
  return 1 - (rate / 125) // ensures minimum 0.2 temperature
} 