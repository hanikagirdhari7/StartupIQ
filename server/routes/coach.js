import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { askCoach, describeCoachFailure } from '../ai/coach.js'
import { coachRateLimit } from '../middleware/coachRateLimit.js'

// Ask IQ's own route. Nothing here imports the analysis route, its validator, its
// schema guard or its prompt — /api/analyze is untouched and keeps its behaviour.

const router = Router()

const QUESTION_MAX = 1200
const HISTORY_MAX = 6
const HISTORY_TEXT_MAX = 1500

// The keys services/coachContext.js may produce. Anything else a caller posts is
// dropped rather than forwarded to the model, so this route cannot be turned into
// a general-purpose proxy for arbitrary text.
const CONTEXT_KEYS = new Set([
  'idea', 'businessType', 'targetCustomer', 'location', 'startingBudget', 'viabilityScore',
  'marketDemand', 'competition', 'targetCustomerAnalysis', 'pricingRecommendation',
  'financialFit', 'sourcingRecommendation', 'risks', 'marketingRecommendations',
  'launchRoadmap', 'nextActions',
])

const CONTEXT_STRING_MAX = 800
const CONTEXT_ARRAY_MAX = 8

function sanitizeValue(value, depth) {
  if (value === null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const trimmed = value.replace(/\s+/g, ' ').trim()
    if (!trimmed) return null
    return trimmed.length > CONTEXT_STRING_MAX ? `${trimmed.slice(0, CONTEXT_STRING_MAX)}…` : trimmed
  }
  if (Array.isArray(value)) {
    if (depth >= 2) return null
    return value.slice(0, CONTEXT_ARRAY_MAX).map(v => sanitizeValue(v, depth + 1)).filter(v => v !== null)
  }
  if (value && typeof value === 'object' && depth < 2) {
    const out = {}
    for (const [key, inner] of Object.entries(value)) {
      if (!/^[a-zA-Z][a-zA-Z0-9]{0,30}$/.test(key)) continue
      const clean = sanitizeValue(inner, depth + 1)
      if (clean !== null) out[key] = clean
    }
    return Object.keys(out).length ? out : null
  }
  return null
}

function sanitizeContext(context) {
  if (!context || typeof context !== 'object' || Array.isArray(context)) return null
  const out = {}
  for (const [key, value] of Object.entries(context)) {
    if (!CONTEXT_KEYS.has(key)) continue
    const clean = sanitizeValue(value, 0)
    if (clean !== null) out[key] = clean
  }
  if (!Object.keys(out).length) return null
  // Trimming keys is not enough on its own: cap the rendered size so a maximal
  // payload stays a report digest rather than a bulk upload into the prompt.
  const json = JSON.stringify(out)
  return json && json.length <= 12000 ? out : null
}

function sanitizeHistory(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
    .slice(-HISTORY_MAX)
    .map(m => ({ role: m.role, text: m.text.trim().slice(0, HISTORY_TEXT_MAX) }))
}

// Client-facing failure copy. Never derived from the thrown message, so no
// credential, response body, or stack detail can reach the client.
const SAFE_ERRORS = {
  AI_NOT_CONFIGURED: { status: 503, code: 'AI_NOT_CONFIGURED', message: 'Ask IQ is not connected to the AI service yet, so it cannot answer right now. Your report is unaffected.' },
  AI_MISCONFIGURED: { status: 503, code: 'AI_CONFIGURATION_ERROR', message: 'Ask IQ is not configured correctly on the server, so it cannot answer right now. Your report is unaffected.' },
  COACH_UNSUPPORTED_PROVIDER: { status: 503, code: 'COACH_UNSUPPORTED_PROVIDER', message: 'Ask IQ is only available with the AI provider used to build this report. Your report is unaffected.' },
  AI_AUTH_FAILED: { status: 503, code: 'AI_CONFIGURATION_ERROR', message: 'Ask IQ could not sign in to the AI service. Your report is unaffected.' },
  AI_RATE_LIMITED: { status: 429, code: 'AI_RATE_LIMITED', message: 'Ask IQ is being rate limited by the AI service. Please wait a minute and ask again.' },
  AI_OVERLOADED: { status: 503, code: 'AI_OVERLOADED', message: 'Ask IQ is waiting on a busy AI service. Please try again in a minute.' },
  AI_BAD_OUTPUT: { status: 502, code: 'AI_REQUEST_FAILED', message: 'Ask IQ did not return a usable answer. Please try again.' },
  AI_UNREACHABLE: { status: 502, code: 'AI_UNREACHABLE', message: 'Ask IQ could not be reached. Please try again shortly.' },
  AI_REQUEST_FAILED: { status: 502, code: 'AI_REQUEST_FAILED', message: 'Ask IQ could not answer right now. Please try again shortly.' },
}

function toSafeFailure(err) {
  return SAFE_ERRORS[err?.code] || SAFE_ERRORS.AI_REQUEST_FAILED
}

function secondsSince(startedAt) {
  return `${((Date.now() - startedAt) / 1000).toFixed(1)}s`
}

// UTC so a line can be placed on the wall clock without guessing the operator's
// offset. Local time here is UTC-04:00.
function stamp() {
  return new Date().toISOString()
}

router.post('/coach', coachRateLimit, async (req, res) => {
  const requestId = randomUUID().slice(0, 8)
  const startedAt = Date.now()
  res.on('finish', () => {
    console.log(
      `${stamp()} [coach] ${requestId} responded status=${res.statusCode} ` +
        `bytes=${res.bytesWritten ?? 'unknown'} elapsed=${secondsSince(startedAt)}`
    )
  })

  const question = typeof req.body?.question === 'string' ? req.body.question.replace(/\s+/g, ' ').trim() : ''
  if (!question) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Ask IQ needs a question to answer.',
    })
  }
  if (question.length > QUESTION_MAX) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: `Ask IQ answers one question at a time, up to ${QUESTION_MAX} characters. Please shorten it and ask again.`,
    })
  }

  const body = {
    question,
    messages: sanitizeHistory(req.body?.messages),
    context: sanitizeContext(req.body?.context),
  }

  try {
    const result = await askCoach(body)
    console.log(
      `${stamp()} [coach] ${requestId} ${result.provider} model=${result.model} answered in ` +
        `${secondsSince(startedAt)} chars=${result.reply.length} context=${body.context ? 'yes' : 'no'} history=${body.messages.length}`
    )
    return res.status(200).json({
      success: true,
      provider: result.provider,
      model: result.model,
      reply: result.reply,
    })
  } catch (err) {
    const safe = toSafeFailure(err)
    const detail = describeCoachFailure(err)
    console.error(
      `${stamp()} [coach] ${requestId} failed (${detail.code}) name=${detail.name} ` +
        `status=${detail.status} after ${secondsSince(startedAt)}: ${detail.message}`
    )
    return res.status(safe.status).json({ success: false, error: safe.code, message: safe.message })
  }
})

export default router
