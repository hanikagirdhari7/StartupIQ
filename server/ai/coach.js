import { GoogleGenAI } from '@google/genai'
import { aiConfig, redactSecrets } from './config.js'
import { getActiveProvider } from './index.js'
import { COACH_SYSTEM_INSTRUCTION, buildCoachUserMessage } from './coachPrompt.js'

// Ask IQ's model call. It reads the same aiConfig and resolves the same active
// provider as the analysis route, so the model, the key and AI_TIMEOUT_MS are all
// still configured in exactly one place — but it asks for plain text with its own
// system instruction, so no report-generation prompt, response schema or guard is
// involved. Only Gemini is wired: the MVP ships on gemini, and inventing a chat
// path for a local runtime that nobody configured would be a guess, not a feature.

function safeError(message, code) {
  const error = new Error(message)
  error.code = code
  return error
}

function one(value, max = 60) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return 'none'
  return text.length > max ? `${text.slice(0, max)}…` : text
}

// The SDK reports a revoked key as a 400 carrying API_KEY_INVALID, so the reason
// text is read as well as the status. The raw message never leaves this file.
function classifyFailure(err) {
  const status = err?.status ?? err?.code ?? err?.response?.status
  const detail = String(err?.message ?? '')

  if (status === 401 || status === 403 || /API_KEY_INVALID|API key not valid|UNAUTHENTICATED/i.test(detail)) {
    return safeError('Ask IQ could not authenticate with the configured AI service.', 'AI_AUTH_FAILED')
  }
  if (status === 429 || /RESOURCE_EXHAUSTED|rate limit/i.test(detail)) {
    return safeError('Ask IQ is rate limited by the AI service right now.', 'AI_RATE_LIMITED')
  }
  if (status === 503 || /UNAVAILABLE|high demand|overload/i.test(detail)) {
    return safeError('Ask IQ is waiting on a busy AI service.', 'AI_OVERLOADED')
  }
  if (typeof status === 'string' && /timeout|unavailable|network|fetch failed|ENOTFOUND|ECONN/i.test(status)) {
    return safeError('Ask IQ could not reach the AI service.', 'AI_UNREACHABLE')
  }
  return safeError('Ask IQ could not answer.', 'AI_REQUEST_FAILED')
}

export function describeCoachFailure(err) {
  return {
    code: err?.code || 'AI_REQUEST_FAILED',
    name: one(err?.name),
    status: one(err?.status ?? err?.code),
    message: one(redactSecrets(err?.message), 240),
  }
}

export async function askCoach({ question, messages, context }) {
  const active = await getActiveProvider()

  if (!active.provider) {
    throw safeError(active.reason || 'AI is not configured.', active.status === 'misconfigured' ? 'AI_MISCONFIGURED' : 'AI_NOT_CONFIGURED')
  }
  if (active.provider.id !== 'gemini') {
    throw safeError(`Ask IQ only speaks to ${active.provider.label} in this build.`, 'COACH_UNSUPPORTED_PROVIDER')
  }

  const ai = new GoogleGenAI({
    apiKey: aiConfig.gemini.apiKey,
    httpOptions: { timeout: aiConfig.timeoutMs },
  })

  let response
  try {
    response = await ai.models.generateContent({
      model: active.model,
      contents: buildCoachUserMessage({ question, messages, context }),
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    })
  } catch (err) {
    throw classifyFailure(err)
  }

  const reply = typeof response?.text === 'string' ? response.text.trim() : ''
  if (!reply) throw safeError('Ask IQ returned no answer.', 'AI_BAD_OUTPUT')

  return { reply, provider: active.provider.id, model: active.model }
}
