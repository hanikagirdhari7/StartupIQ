// Models occasionally wrap JSON in markdown fences or add a sentence of
// prose. This extracts the single JSON object, or throws — it never guesses.

export function parseModelJson(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Model returned an empty response.')
  }

  const unfenced = text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  try {
    return JSON.parse(unfenced)
  } catch {
    // fall through to brace-matching
  }

  const start = unfenced.indexOf('{')
  const end = unfenced.lastIndexOf('}')
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(unfenced.slice(start, end + 1))
    } catch {
      // fall through
    }
  }

  throw new Error('Model did not return valid JSON.')
}
