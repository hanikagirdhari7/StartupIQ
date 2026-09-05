// Ask IQ's own request path. Kept separate from services/api.js so the analysis
// client — its payload shape, its 150s ceiling and its validation-error branch —
// stays exactly as it shipped.

// A chat answer is a few sentences, so 60s is already far past a normal reply.
// The server still holds its own AI_TIMEOUT_MS for the provider call; this only
// stops a dead connection from leaving the drawer thinking forever.
const COACH_TIMEOUT_MS = 60_000
const HISTORY_MAX = 6
const HISTORY_TEXT_MAX = 1500

function trimmedHistory(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
    .slice(-HISTORY_MAX)
    .map(m => ({ role: m.role, text: m.text.trim().slice(0, HISTORY_TEXT_MAX) }))
}

export async function askCoach({ question, messages, context }) {
  let response
  try {
    response = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(COACH_TIMEOUT_MS),
      body: JSON.stringify({
        question: String(question || '').trim(),
        messages: trimmedHistory(messages),
        context: context || null,
      }),
    })
  } catch (err) {
    if (err && err.name === 'TimeoutError') {
      throw new Error('Ask IQ took too long to answer, so this stopped waiting. Please try again in a moment.')
    }
    throw new Error('Could not reach Ask IQ. Make sure the StartupIQ server is running (npm run server) and try again.')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // A non-JSON answer is treated as a failure by the status check below.
  }

  if (!response.ok) {
    const error = new Error((data && data.message) || 'Ask IQ could not answer right now. Please try again.')
    error.code = data && data.error ? data.error : `HTTP_${response.status}`
    error.retryAfter = typeof data?.retryAfterSeconds === 'number' ? data.retryAfterSeconds : null
    throw error
  }

  const reply = data && typeof data.reply === 'string' ? data.reply.trim() : ''
  if (!reply) throw new Error('Ask IQ came back with no answer. Please try again.')
  return reply
}
