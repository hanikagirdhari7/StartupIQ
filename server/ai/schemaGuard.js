import {
  ANALYSIS_NESTED_REQUIREMENTS,
  ANALYSIS_TOP_LEVEL_KEYS,
  FINANCIAL_FIT_BASES,
  FINANCIAL_FIT_MODEL_TYPES,
  FINANCIAL_FIT_STATUSES,
  LAUNCH_ROADMAP_STEP_KEYS,
  SOURCING_ROUTE_IDS,
} from '../schemas/analysisResponse.js'

// Guards model output against the schema before it reaches the client. Models
// answer off-format or truncate; in that case we throw rather than hand over a
// half-filled report. Missing fields are never back-filled with invented values.

const SOURCING_ROUTE_TEXT_KEYS = [
  'why',
  'advantage',
  'limitation',
  'switchWhen',
  'moq',
  'shipping',
  'customization',
  'bestFor',
]

// The prompt asks for 2-4 routes; the guard allows one route of slack so a
// near-miss does not cost the founder the whole report, but never a long list.
const SOURCING_MAX_ROUTES = 4

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function isOptionalText(value) {
  return value === undefined || value === null || value === '' || isNonEmptyString(value)
}

function fail(message) {
  const error = new Error(message)
  error.code = 'AI_BAD_OUTPUT'
  throw error
}

// Sourcing carries a ranked array, a score and a boolean, so it cannot be
// checked by the flat string rules used for the other nested objects.
function assertValidSourcing(sourcing) {
  if (!isPlainObject(sourcing)) fail('sourcingRecommendation must be an object.')

  if (typeof sourcing.needsPhysicalProducts !== 'boolean') {
    fail('sourcingRecommendation.needsPhysicalProducts must be true or false.')
  }
  for (const key of ['summary', 'nextStep']) {
    if (!isNonEmptyString(sourcing[key])) {
      fail(`sourcingRecommendation.${key} must be a non-empty string.`)
    }
  }

  const routes = sourcing.routes
  if (!Array.isArray(routes)) fail('sourcingRecommendation.routes must be an array.')
  if (sourcing.needsPhysicalProducts && routes.length === 0) {
    fail('sourcingRecommendation.routes must list at least one route when the idea needs physical products.')
  }
  if (routes.length > SOURCING_MAX_ROUTES) {
    fail(`sourcingRecommendation.routes must stay to the few most relevant routes (max ${SOURCING_MAX_ROUTES}).`)
  }

  routes.forEach((route, index) => {
    const where = `sourcingRecommendation.routes[${index}]`
    if (!isPlainObject(route)) fail(`${where} must be an object.`)
    if (!SOURCING_ROUTE_IDS.includes(route.route)) {
      fail(`${where}.route must be one of: ${SOURCING_ROUTE_IDS.join(', ')}.`)
    }

    const fit = route.fitScore
    if (typeof fit !== 'number' || !Number.isFinite(fit) || fit < 0 || fit > 100) {
      fail(`${where}.fitScore must be a number between 0 and 100.`)
    }

    const absent = SOURCING_ROUTE_TEXT_KEYS.filter(key => !isNonEmptyString(route[key]))
    if (absent.length > 0) {
      fail(`${where} is missing or has empty values for: ${absent.join(', ')}.`)
    }
    for (const key of ['detail', 'searchTerms']) {
      if (!isOptionalText(route[key])) fail(`${where}.${key} must be a string when present.`)
    }
  })

  if (routes.length > 0) {
    const wanted = String(sourcing.recommendedRoute || '').trim().toLowerCase()
    const match = routes.find(route => String(route.route).toLowerCase() === wanted)
    if (match) {
      sourcing.recommendedRoute = match.route
    } else {
      // The pointer came back as a label or with different casing. Rather than
      // throw away a complete analysis, use the route the model itself scored
      // highest — still the model's own judgement, never an invented option.
      const top = routes.reduce((best, route) => (route.fitScore > best.fitScore ? route : best), routes[0])
      sourcing.recommendedRoute = top.route
    }
  }

  if (sourcing.digitalResources !== undefined && sourcing.digitalResources !== null) {
    if (!Array.isArray(sourcing.digitalResources) || !sourcing.digitalResources.every(isNonEmptyString)) {
      fail('sourcingRecommendation.digitalResources must be an array of non-empty strings.')
    }
  }
}

// A live run flattened the range "1,300 PKR - 1,600 PKR" into 140085015000. A
// figure over a thousand times the model's own pricing range is a formatting
// artefact rather than an estimate, so it becomes null and the card shows
// "Not estimated" instead of a nonsense price.
function largestNumberIn(text) {
  const found = String(text || '').match(/\d[\d,]*(?:\.\d+)?/g) || []
  return found.reduce((max, digits) => Math.max(max, Number(digits.replace(/,/g, ''))), 0)
}

// Financial figures are nullable by design: null means the model honestly could
// not estimate, which must never be confused with a real zero.
function assertValidFinancialFit(fit, pricing) {
  if (!isPlainObject(fit)) fail('financialFit must be an object.')

  const enums = {
    modelType: FINANCIAL_FIT_MODEL_TYPES,
    basis: FINANCIAL_FIT_BASES,
    status: FINANCIAL_FIT_STATUSES,
  }
  for (const [key, allowed] of Object.entries(enums)) {
    if (!allowed.includes(fit[key])) {
      fail(`financialFit.${key} must be one of: ${allowed.join(', ')}.`)
    }
  }

  for (const key of ['priceLabel', 'costLabel', 'verdict', 'biggestConcern', 'howEstimated']) {
    if (!isNonEmptyString(fit[key])) {
      fail(`financialFit.${key} must be a non-empty string.`)
    }
  }

  for (const key of ['priceEstimate', 'costEstimate', 'fixedCosts']) {
    const value = fit[key]
    if (value === undefined || value === null) {
      fit[key] = null
      continue
    }
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      fail(`financialFit.${key} must be a positive number or null.`)
    }
  }

  const rangeMax = largestNumberIn(isPlainObject(pricing) ? pricing.suggestedRange : '')
  // Only judge when the range parsed as a real money amount: abbreviated figures
  // like "4.8M" or "1.2k" parse down to single digits, so skipping those keeps a
  // legitimate high-ticket estimate on screen.
  if (rangeMax >= 100) {
    for (const key of ['priceEstimate', 'costEstimate']) {
      if (fit[key] !== null && fit[key] > rangeMax * 1000) fit[key] = null
    }
  }

  if (
    fit.missingInformation === undefined ||
    fit.missingInformation === null ||
    fit.missingInformation === ''
  ) {
    fit.missingInformation = null
  } else if (!isNonEmptyString(fit.missingInformation)) {
    fail('financialFit.missingInformation must be a non-empty string or null.')
  }
}

export function assertValidAnalysis(raw) {
  if (!isPlainObject(raw)) fail('Model output is not a JSON object.')

  const missing = ANALYSIS_TOP_LEVEL_KEYS.filter((key) => !(key in raw))
  if (missing.length > 0) fail(`Model output is missing required fields: ${missing.join(', ')}.`)

  const score = raw.viabilityScore
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100) {
    fail('viabilityScore must be a number between 0 and 100.')
  }

  for (const [field, requiredKeys] of Object.entries(ANALYSIS_NESTED_REQUIREMENTS)) {
    if (!isPlainObject(raw[field])) fail(`${field} must be an object.`)
    const absent = requiredKeys.filter((key) => !isNonEmptyString(raw[field][key]))
    if (absent.length > 0) fail(`${field} is missing or has empty values for: ${absent.join(', ')}.`)
  }

  assertValidSourcing(raw.sourcingRecommendation)
  assertValidFinancialFit(raw.financialFit, raw.pricingRecommendation)

  for (const field of ['marketingRecommendations', 'risks', 'nextActions']) {
    if (!Array.isArray(raw[field]) || raw[field].length === 0 || !raw[field].every(isNonEmptyString)) {
      fail(`${field} must be a non-empty array of strings.`)
    }
  }

  if (!Array.isArray(raw.launchRoadmap) || raw.launchRoadmap.length === 0) {
    fail('launchRoadmap must be a non-empty array of steps.')
  }
  raw.launchRoadmap.forEach((step, index) => {
    if (!isPlainObject(step)) fail(`launchRoadmap[${index}] must be an object.`)
    const absent = LAUNCH_ROADMAP_STEP_KEYS.filter((key) => !(key in step))
    if (absent.length > 0) fail(`launchRoadmap[${index}] is missing: ${absent.join(', ')}.`)
    if (!isNonEmptyString(step.period)) fail(`launchRoadmap[${index}].period must be a non-empty string.`)
    if (!Array.isArray(step.actions) || step.actions.length === 0 || !step.actions.every(isNonEmptyString)) {
      fail(`launchRoadmap[${index}].actions must be a non-empty array of strings.`)
    }
  })

  return raw
}
