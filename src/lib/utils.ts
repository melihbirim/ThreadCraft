import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility to clean up newlines in text
export function cleanNewlines(text: string): string {
  // Replace 3 or more newlines with two newlines
  // This preserves intentional paragraph breaks while cleaning up excessive spacing
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+/, '')  // Trim start
    .replace(/\s+$/, ''); // Trim end
}

// Provided smart thread splitting function
export function splitTextToThread(
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
  return rawThreads.filter(Boolean);
} 