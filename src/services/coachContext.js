import { formatPKR } from '../utils/format'

// The only business context Ask IQ may see, assembled from an already-saved
// report. Every value is copied or trimmed — nothing here recalculates a figure,
// so Ask IQ can never answer from a number the report itself does not state.
// Financial Fit, the Scenario Calculator and the score breakdown keep their own
// math untouched.

const IDEA_MAX = 700
const TEXT_MAX = 400
const LIST_MAX = 6
const ACTIONS_PER_PERIOD = 4
const ROUTE_MAX = 3

function text(value, max = TEXT_MAX) {
  if (typeof value !== 'string') return null
  const trimmed = value.replace(/\s+/g, ' ').trim()
  if (!trimmed) return null
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed
}

function list(values, max = LIST_MAX) {
  if (!Array.isArray(values)) return []
  return values.map(v => text(v)).filter(Boolean).slice(0, max)
}

function money(value) {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : null
  return num === null ? null : formatPKR(num)
}

/** The figures the report itself estimates, each under the label the report gave
 *  it. A missing estimate stays explicitly absent rather than becoming a zero. */
function financialFit(fit) {
  if (!fit || typeof fit !== 'object') return null
  const out = {
    status: text(fit.status),
    basis: text(fit.basis, 40),
    verdict: text(fit.verdict),
    biggestConcern: text(fit.biggestConcern),
  }
  const priceLabel = text(fit.priceLabel, 120)
  const costLabel = text(fit.costLabel, 120)
  if (priceLabel || fit.priceEstimate !== undefined) {
    out.price = { label: priceLabel || 'Selling price', amount: money(fit.priceEstimate) }
  }
  if (costLabel || fit.costEstimate !== undefined) {
    out.costPerSale = { label: costLabel || 'Cost per sale', amount: money(fit.costEstimate) }
  }
  if (fit.fixedCosts !== undefined) out.setupCosts = money(fit.fixedCosts)
  const missing = text(fit.missingInformation)
  if (missing) out.notYetEstimated = missing
  return out
}

function sourcing(rec) {
  if (!rec || typeof rec !== 'object') return null
  const routes = Array.isArray(rec.routes)
    ? rec.routes.slice(0, ROUTE_MAX).map(route => ({
        route: text(route.route, 60),
        fitScore: typeof route.fitScore === 'number' ? route.fitScore : null,
        advantage: text(route.advantage, 200),
        limitation: text(route.limitation, 200),
        moq: text(route.moq, 80),
        shipping: text(route.shipping, 80),
      }))
    : []
  const out = {
    summary: text(rec.summary),
    recommendedRoute: text(rec.recommendedRoute, 200),
    nextStep: text(rec.nextStep),
  }
  if (routes.length) out.routes = routes
  return out
}

function roadmap(periods) {
  if (!Array.isArray(periods)) return []
  return periods.slice(0, 6).map(period => ({
    period: text(period.period, 60),
    actions: list(period.actions, ACTIONS_PER_PERIOD),
  }))
}

export function buildCoachContext(report) {
  const source = report && typeof report === 'object' ? report : {}
  const idea = source.idea && typeof source.idea === 'object' ? source.idea : {}
  const analysis = source.analysis && typeof source.analysis === 'object' ? source.analysis : {}
  const market = analysis.marketDemand || {}
  const competition = analysis.competition || {}
  const pricing = analysis.pricingRecommendation || {}
  const customer = analysis.targetCustomerAnalysis || {}

  const context = {
    idea: text(idea.businessIdea, IDEA_MAX),
    businessType: text(idea.businessType, 60),
    targetCustomer: text(idea.targetCustomer, 200),
    location: text(idea.location, 120),
    startingBudget: money(idea.budgetPKR),
    viabilityScore: typeof analysis.viabilityScore === 'number' ? analysis.viabilityScore : null,
    marketDemand: { level: text(market.level, 40), why: text(market.explanation), opportunity: text(market.opportunity) },
    competition: { level: text(competition.level, 40), alternatives: text(competition.existingAlternatives), differentiation: text(competition.differentiation) },
    targetCustomerAnalysis: { primary: text(customer.primaryCustomer), needs: text(customer.needs), buyingFactors: text(customer.buyingFactors) },
    pricingRecommendation: { suggestedRange: text(pricing.suggestedRange, 200), reason: text(pricing.reason) },
    financialFit: financialFit(analysis.financialFit),
    sourcingRecommendation: sourcing(analysis.sourcingRecommendation),
    risks: list(analysis.risks),
    marketingRecommendations: list(analysis.marketingRecommendations),
    launchRoadmap: roadmap(analysis.launchRoadmap),
    nextActions: list(analysis.nextActions),
  }

  return context
}
