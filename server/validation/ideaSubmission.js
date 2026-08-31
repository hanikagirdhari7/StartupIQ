// Server-side validation for POST /api/analyze.
// Mirrors the client-side rules in src/pages/IdeaFormPage.jsx — the client is
// never trusted, so every rule is enforced again here.

const BUSINESS_TYPES = ['Product', 'Service', 'Ecommerce', 'Local Business', 'SaaS / App', 'Other']
const MIN_IDEA_LENGTH = 20
const MAX_IDEA_LENGTH = 2000
const MAX_ADDITIONAL_LENGTH = 1000

export function validateIdeaSubmission(body) {
  const errors = {}

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return {
      valid: false,
      errors: { _request: 'Request body must be a JSON object.' },
      data: null,
    }
  }

  const data = {}

  const businessIdea = typeof body.businessIdea === 'string' ? body.businessIdea.trim() : ''
  if (!businessIdea) {
    errors.businessIdea = 'Please describe your business idea.'
  } else if (businessIdea.length < MIN_IDEA_LENGTH) {
    errors.businessIdea = 'Please add a bit more detail — at least 20 characters.'
  } else if (businessIdea.length > MAX_IDEA_LENGTH) {
    errors.businessIdea = `Please keep your idea under ${MAX_IDEA_LENGTH} characters.`
  } else {
    data.businessIdea = businessIdea
  }

  const targetCustomer = typeof body.targetCustomer === 'string' ? body.targetCustomer.trim() : ''
  if (!targetCustomer) {
    errors.targetCustomer = 'Tell us who your customers are.'
  } else if (targetCustomer.length < 3) {
    errors.targetCustomer = 'Please be a bit more specific about your target customer.'
  } else {
    data.targetCustomer = targetCustomer
  }

  const location = typeof body.location === 'string' ? body.location.trim() : ''
  if (!location) {
    errors.location = 'Please enter your city or target market.'
  } else {
    data.location = location
  }

  if (!BUSINESS_TYPES.includes(body.businessType)) {
    errors.businessType = `Please select a valid business type (${BUSINESS_TYPES.join(', ')}).`
  } else {
    data.businessType = body.businessType
  }

  const budget = body.budget
  const isBudgetObject = typeof budget === 'object' && budget !== null && !Array.isArray(budget)
  if (!isBudgetObject || budget.amount === undefined || budget.amount === null || budget.amount === '') {
    errors.budget = 'Please provide your estimated budget as { amount, currency }.'
  } else {
    const amount = Number(budget.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.budget = 'Budget amount must be a number greater than 0.'
    } else {
      data.budget = {
        amount,
        currency:
          typeof budget.currency === 'string' && budget.currency.trim()
            ? budget.currency.trim().toUpperCase()
            : 'PKR',
      }
    }
  }

  // The API contract uses `additionalInformation`; `additionalInfo` is accepted
  // as an alias because that is the field name the current form sends.
  const rawAdditional = body.additionalInformation !== undefined ? body.additionalInformation : body.additionalInfo
  if (rawAdditional !== undefined && rawAdditional !== null) {
    if (typeof rawAdditional !== 'string') {
      errors.additionalInformation = 'Additional information must be text.'
    } else {
      const additional = rawAdditional.trim()
      if (additional.length > MAX_ADDITIONAL_LENGTH) {
        errors.additionalInformation = `Please keep additional information under ${MAX_ADDITIONAL_LENGTH} characters.`
      } else {
        data.additionalInformation = additional || null
      }
    }
  } else {
    data.additionalInformation = null
  }

  return { valid: Object.keys(errors).length === 0, errors, data }
}
