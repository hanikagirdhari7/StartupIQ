import { Router } from 'express'
import { analyzeIdea, getActiveProvider } from '../ai/index.js'
import { redactSecrets } from '../ai/config.js'
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

router.post('/analyze', async (req, res) => {
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
      console.error(`[analyze] ${redactSecrets(active.reason)}`)
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
    const analysis = await analyzeIdea(data)
    console.log(`[analyze] ${active.provider.id} succeeded for model ${active.model}`)
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
    console.error(`[analyze] ${active.provider.id} failed (${err?.code || 'UNKNOWN'}): ${redactSecrets(err?.message)}`)
    return res.status(safe.status).json({ success: false, error: safe.code, message: safe.message })
  }
})

export default router
