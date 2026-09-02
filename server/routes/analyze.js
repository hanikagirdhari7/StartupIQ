import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { analyzeIdea, getActiveProvider } from '../ai/index.js'
import { redactSecrets } from '../ai/config.js'
import { analysisRateLimit } from '../middleware/analysisRateLimit.js'
import { ANALYSIS_RESPONSE_SCHEMA } from '../schemas/analysisResponse.js'
import { validateIdeaSubmission } from '../validation/ideaSubmission.js'

const router = Router()

// Client-facing failure copy. Never derived from the thrown message, so no
// credential, response body, or stack detail can reach the client.
const SAFE_ERRORS = {
  AI_MISCONFIGURED: { status: 503, code: 'AI_CONFIGURATION_ERROR', message: 'AI analysis is enabled but not configured correctly. Please check the server setup.' },
  AI_AUTH_FAILED: { status: 503, code: 'AI_CONFIGURATION_ERROR', message: 'AI analysis credentials were rejected. Please check the server configuration.' },
  AI_RATE_LIMITED: { status: 429, code: 'AI_RATE_LIMITED', message: 'The AI analysis service is busy. Please try again in a moment.' },
  AI_BAD_OUTPUT: { status: 502, code: 'AI_ANALYSIS_FAILED', message: 'The AI analysis was incomplete. Please try again.' },
  AI_UNREACHABLE: { status: 502, code: 'AI_UNREACHABLE', message: 'The AI analysis service could not be reached. Please try again shortly.' },
  AI_REQUEST_FAILED: { status: 502, code: 'AI_ANALYSIS_FAILED', message: 'We could not complete the AI analysis. Please try again shortly.' },
}

function toSafeFailure(err) {
  return SAFE_ERRORS[err?.code] || SAFE_ERRORS.AI_REQUEST_FAILED
}

// Provider-supplied values are echoed into the log, so each is flattened to one
// short line: a multi-line or oversized error could otherwise forge new records.
function logField(value, max = 60) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return 'none'
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function secondsSince(startedAt) {
  return `${((Date.now() - startedAt) / 1000).toFixed(1)}s`
}

// UTC so a line can be placed on the wall clock without guessing the operator's
// offset. Local time here is UTC-04:00.
function stamp() {
  return new Date().toISOString()
}

router.post('/analyze', analysisRateLimit, async (req, res) => {
  // One id per request: without it, a slow provider call, an upstream failure
  // and an extra submission all read the same in the log.
  const requestId = randomUUID().slice(0, 8)
  const startedAt = Date.now()
  // One closing line per request, whatever path answered it: status and byte
  // count come from the finished response, so nothing has to be threaded through
  // the handlers below.
  res.on('finish', () => {
    console.log(
      `${stamp()} [analyze] ${requestId} responded status=${res.statusCode} ` +
        `bytes=${res.bytesWritten ?? 'unknown'} elapsed=${secondsSince(startedAt)}`
    )
  })
  const { valid, errors, data } = validateIdeaSubmission(req.body)

  if (!valid) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Some fields need attention before we can analyze your idea.',
      errors,
    })
  }

  const active = await getActiveProvider()

  if (!active.provider) {
    // Selected a provider but it is not configured — surface that clearly rather
    // than pretending the analysis simply came back empty.
    if (active.status === 'misconfigured') {
      console.error(`${stamp()} [analyze] ${requestId} ${redactSecrets(active.reason)}`)
      return res.status(503).json({
        success: false,
        error: 'AI_CONFIGURATION_ERROR',
        message: 'AI analysis is enabled but not configured correctly. Please check the server setup.',
      })
    }

    // AI intentionally off, or a local runtime is not running: validate and
    // accept the idea, but return null analysis rather than fabricate a result.
    return res.status(200).json({
      success: true,
      message:
        'Your idea was validated successfully. AI analysis is not connected yet, so no results are included — expectedAnalysisShape shows what will be returned once a provider is connected.',
      providerStatus: active.status,
      analysis: null,
      expectedAnalysisShape: ANALYSIS_RESPONSE_SCHEMA,
      received: data,
      receivedAt: new Date().toISOString(),
    })
  }

  try {
    console.log(`${stamp()} [analyze] ${requestId} accepted provider=${active.provider.id} model=${active.model}`)
    const analysis = await analyzeIdea(data)
    console.log(`${stamp()} [analyze] ${requestId} ${active.provider.id} succeeded in ${secondsSince(startedAt)}`)
    return res.status(200).json({
      success: true,
      provider: active.provider.id,
      model: active.model,
      analysis,
      received: data,
      receivedAt: new Date().toISOString(),
    })
  } catch (err) {
    const safe = toSafeFailure(err)
    console.error(
      `${stamp()} [analyze] ${requestId} ${active.provider.id} failed (${err?.code || 'UNKNOWN'}) ` +
      `name=${logField(err?.name)} status=${logField(err?.status)} after ${secondsSince(startedAt)}: ` +
      logField(redactSecrets(err?.message), 240)
    )
    return res.status(safe.status).json({ success: false, error: safe.code, message: safe.message })
  }
})

export default router
