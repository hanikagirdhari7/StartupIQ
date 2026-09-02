import { GoogleGenAI, Type } from '@google/genai'
import { aiConfig, redactSecrets } from '../config.js'
import { buildAnalysisPrompt } from '../prompt.js'
import { parseModelJson } from '../parseModelJson.js'
import { assertValidAnalysis } from '../schemaGuard.js'
import {
  FINANCIAL_FIT_BASES,
  FINANCIAL_FIT_MODEL_TYPES,
  FINANCIAL_FIT_STATUSES,
  SOURCING_ROUTE_IDS,
} from '../../schemas/analysisResponse.js'

/**
 * Gemini via the official @google/genai SDK.
 *
 * The API key is read from GEMINI_API_KEY (loaded from .env) and passed only to
 * the SDK constructor. It is never interpolated into a message, logged, or
 * returned to the client. Every thrown error carries a safe, code-labelled
 * message so the route can respond without leaking internals.
 */

const STRING = { type: Type.STRING }
const STRING_LIST = { type: Type.ARRAY, items: STRING }
// Financial estimates are honestly nullable — a null means "not enough context to
// estimate", which is never replaced by a made-up zero.
const NULLABLE_NUMBER = { type: Type.NUMBER, nullable: true }
const NULLABLE_STRING = { type: Type.STRING, nullable: true }

// Mirrors server/schemas/analysisResponse.js so the API enforces the same shape
// the prompt asks for and the guard validates.
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    viabilityScore: { type: Type.NUMBER },
    marketDemand: {
      type: Type.OBJECT,
      properties: { level: STRING, explanation: STRING, opportunity: STRING },
      required: ['level', 'explanation', 'opportunity'],
    },
    targetCustomerAnalysis: {
      type: Type.OBJECT,
      properties: { primaryCustomer: STRING, needs: STRING, buyingFactors: STRING },
      required: ['primaryCustomer', 'needs', 'buyingFactors'],
    },
    competition: {
      type: Type.OBJECT,
      properties: { level: STRING, existingAlternatives: STRING, differentiation: STRING },
      required: ['level', 'existingAlternatives', 'differentiation'],
    },
    pricingRecommendation: {
      type: Type.OBJECT,
      properties: { suggestedRange: STRING, reason: STRING },
      required: ['suggestedRange', 'reason'],
    },
    financialFit: {
      type: Type.OBJECT,
      properties: {
        modelType: { type: Type.STRING, enum: FINANCIAL_FIT_MODEL_TYPES },
        basis: { type: Type.STRING, enum: FINANCIAL_FIT_BASES },
        priceLabel: STRING,
        priceEstimate: NULLABLE_NUMBER,
        costLabel: STRING,
        costEstimate: NULLABLE_NUMBER,
        fixedCosts: NULLABLE_NUMBER,
        status: { type: Type.STRING, enum: FINANCIAL_FIT_STATUSES },
        verdict: STRING,
        biggestConcern: STRING,
        howEstimated: STRING,
        missingInformation: NULLABLE_STRING,
      },
      required: [
        'modelType',
        'basis',
        'priceLabel',
        'costLabel',
        'status',
        'verdict',
        'biggestConcern',
        'howEstimated',
      ],
    },
    marketingRecommendations: STRING_LIST,
    sourcingRecommendation: {
      type: Type.OBJECT,
      properties: {
        needsPhysicalProducts: { type: Type.BOOLEAN },
        summary: STRING,
        recommendedRoute: STRING,
        nextStep: STRING,
        routes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              route: { type: Type.STRING, enum: SOURCING_ROUTE_IDS },
              fitScore: { type: Type.NUMBER },
              why: STRING,
              advantage: STRING,
              limitation: STRING,
              switchWhen: STRING,
              moq: STRING,
              shipping: STRING,
              customization: STRING,
              bestFor: STRING,
              detail: STRING,
              searchTerms: STRING,
            },
            required: [
              'route',
              'fitScore',
              'why',
              'advantage',
              'limitation',
              'switchWhen',
              'moq',
              'shipping',
              'customization',
              'bestFor',
            ],
          },
        },
        digitalResources: STRING_LIST,
      },
      required: ['needsPhysicalProducts', 'summary', 'nextStep', 'routes'],
    },
    risks: STRING_LIST,
    launchRoadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { period: STRING, actions: STRING_LIST },
        required: ['period', 'actions'],
      },
    },
    nextActions: STRING_LIST,
  },
  required: [
    'viabilityScore',
    'marketDemand',
    'targetCustomerAnalysis',
    'competition',
    'pricingRecommendation',
    'financialFit',
    'marketingRecommendations',
    'sourcingRecommendation',
    'risks',
    'launchRoadmap',
    'nextActions',
  ],
}

function safeError(message, code) {
  const error = new Error(message)
  error.code = code
  return error
}

// Map SDK/API failures onto safe codes. The raw error is never forwarded —
// Google reports a bad key as HTTP 400 carrying 'API_KEY_INVALID', so the reason
// text is inspected to keep "your key is wrong" distinct from a generic failure.
// Provider diagnostics only. classifyFailure replaces the SDK error, so this is
// the last moment the original name/status/cause still exist. Values are run
// through redactSecrets and flattened to one short line, so a key, a prompt or a
// multi-line payload cannot reach the log or forge an extra record.
function one(value, max = 60) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return 'none'
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function logRawFailure(err) {
  const cause = (err && err.cause) || {}
  console.error(
    `${new Date().toISOString()} [gemini] raw failure name=${one(err?.name)} status=${one(err?.status ?? err?.code)} ` +
      `message=${one(redactSecrets(err?.message), 200)} causeName=${one(cause.name)} ` +
      `causeCode=${one(cause.code)} causeMessage=${one(redactSecrets(cause.message), 200)}`
  )
}

function classifyFailure(err) {
  logRawFailure(err)
  const status = err?.status ?? err?.code ?? err?.response?.status
  const numeric = typeof status === 'string' && /^\d+$/.test(status) ? Number(status) : status
  const detail = String(err?.message ?? '')

  if (numeric === 401 || numeric === 403 || /API_KEY_INVALID|API key not valid|UNAUTHENTICATED/i.test(detail)) {
    return safeError('Gemini rejected the configured API key.', 'AI_AUTH_FAILED')
  }
  if (numeric === 429 || /RESOURCE_EXHAUSTED|rate limit/i.test(detail)) {
    return safeError('Gemini rate limit reached.', 'AI_RATE_LIMITED')
  }
  if (numeric === 400 || numeric === 404) {
    return safeError('Gemini rejected the analysis request.', 'AI_REQUEST_FAILED')
  }
  if (typeof status === 'string' && /timeout|unavailable|network|fetch failed|ENOTFOUND|ECONN/i.test(status)) {
    return safeError('Gemini could not be reached.', 'AI_UNREACHABLE')
  }
  return safeError('Gemini request failed.', 'AI_REQUEST_FAILED')
}

export const geminiProvider = {
  id: 'gemini',
  label: 'Gemini',

  async detect() {
    if (!aiConfig.gemini.apiKey) {
      return {
        ready: false,
        misconfigured: true,
        reason: 'GEMINI_API_KEY is not set. Add it to the root .env file and restart the server.',
      }
    }
    return { ready: true, model: aiConfig.gemini.model }
  },

  async analyze(idea, { model }) {
    const { system, user } = buildAnalysisPrompt(idea)

    // Constructed per call so the key is never held in module scope.
    // httpOptions.timeout is the SDK-documented per-request timeout (ms).
    const ai = new GoogleGenAI({
      apiKey: aiConfig.gemini.apiKey,
      httpOptions: { timeout: aiConfig.timeoutMs },
    })

    let response
    try {
      response = await ai.models.generateContent({
        model,
        contents: user,
        config: {
          systemInstruction: system,
          temperature: 0.4,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      })
    } catch (err) {
      throw classifyFailure(err)
    }

    const text = response?.text
    if (!text) {
      throw safeError('Gemini returned no usable analysis text.', 'AI_BAD_OUTPUT')
    }

    let parsed
    try {
      parsed = parseModelJson(text)
    } catch {
      throw safeError('Gemini returned output that was not valid JSON.', 'AI_BAD_OUTPUT')
    }

    return assertValidAnalysis(parsed)
  },
}
