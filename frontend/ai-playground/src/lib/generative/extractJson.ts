export function extractJSON(content: string): any | null {
  const jsonPattern = /{[\s\S]*}(?![\s\S]*})/
  const match = content.match(jsonPattern)
  if (!match) {
    return null
  }

  const jsonString = match[0]
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    return null
  }
}
