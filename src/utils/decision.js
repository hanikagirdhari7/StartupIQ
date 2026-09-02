import { formatPKR } from './format'

// The final decision — read off the analysis, never a second opinion.
//
// The score band is the only ranking signal (70+ GO, 45+ MODIFY, below that
// DON'T LAUNCH YET). Everything else here reuses text and enums the analysis
// already returned: no new market data, no invented competitors, no extra
// arithmetic beyond comparing the founder's own budget to the setup estimate.
// A field that is missing is skipped, and a report with no score at all gets
// no decision rather than a guessed one.

const STATUS_LABELS = {
  goodToTest: 'The financial fit looks good enough to test',
  needsCaution: 'The financial fit needs caution',
  financiallyChallenging: 'The financial fit is challenging',
}

const DECISIONS = {
  go: { label: 'GO', headline: 'Clear to start testing' },
  // "fix these gaps" and "not ready" both point at blockers. When the analysis
  // named none, the score came from the overall picture, so say that instead.
  modify: {
    label: 'MODIFY',
    headline: 'Worth pursuing — fix these gaps first',
    openHeadline: 'Worth pursuing — strengthen the findings first',
  },
  dontLaunch: {
    label: "DON'T LAUNCH YET",
    headline: 'Not ready as described',
    openHeadline: 'Scored low, with no single blocker to fix',
  },
  unknown: { label: 'NO DECISION', headline: 'No decision available' },
}

// Which factors matter most for each band, so the card explains the decision
// the founder actually got instead of listing the same five lines every time.
const FACTOR_PRIORITY = {
  go: ['Financial fit', 'Market demand', 'Competition', 'Pricing', 'Risks'],
  modify: ['Financial fit', 'Competition', 'Market demand', 'Pricing', 'Risks'],
  dontLaunch: ['Financial fit', 'Risks', 'Competition', 'Market demand', 'Pricing'],
  unknown: ['Market demand', 'Competition', 'Financial fit', 'Pricing', 'Risks'],
}

const LEVELS = ['low', 'moderate', 'high']

function number(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function sentences(value) {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.trim() !== '').map(item => item.trim())
    : []
}

function levelOf(value) {
  const key = String(value || '').trim().toLowerCase()
  return LEVELS.includes(key) ? key : null
}

function join(parts) {
  return parts.filter(Boolean).join(' ')
}

function collectFactors({ demandLevel, competitionLevel, market, competition, fit, pricing, risks }) {
  const factors = []

  if (fit.status && STATUS_LABELS[fit.status]) {
    factors.push({
      label: 'Financial fit',
      text: join([`${STATUS_LABELS[fit.status]}.`, fit.verdict]),
    })
  }
  if (demandLevel) {
    factors.push({
      label: 'Market demand',
      text: join([`Demand is rated ${demandLevel}.`, market.opportunity || market.explanation]),
    })
  }
  if (competitionLevel) {
    factors.push({
      label: 'Competition',
      text: join([`Competition is rated ${competitionLevel}.`, competition.differentiation || competition.existingAlternatives]),
    })
  }
  if (pricing.suggestedRange) {
    factors.push({ label: 'Pricing', text: `The analysis suggests ${pricing.suggestedRange}.` })
  }
  if (risks.length > 0) {
    factors.push({
      label: 'Risks',
      text: join([
        `${risks.length} risk${risks.length === 1 ? '' : 's'} ${risks.length === 1 ? 'was' : 'were'} flagged.`,
        risks[0],
      ]),
    })
  }

  return factors
}

function collectBlockers({ fit, budget, price, cost, fixed, demandLevel, competitionLevel, market, competition }) {
  const blockers = []

  if (fit.status === 'financiallyChallenging' || fit.status === 'needsCaution') {
    blockers.push(join([`${STATUS_LABELS[fit.status]}.`, fit.biggestConcern || fit.verdict]))
  }
  if (fixed !== null && budget !== null && fixed > budget) {
    blockers.push(
      `The setup estimate of ${formatPKR(fixed)} is more than the ${formatPKR(budget)} budget you entered.`,
    )
  }
  const missingFigures = [
    price === null ? 'selling price' : null,
    cost === null ? 'cost per sale' : null,
  ].filter(Boolean)
  if (missingFigures.length > 0) {
    blockers.push(
      join([
        `No ${missingFigures.join(' or ')} estimate could be made from what you described.`,
        fit.missingInformation ? `Still needed: ${fit.missingInformation}` : '',
      ]),
    )
  }
  if (competitionLevel === 'high') {
    blockers.push(join(['Competition is rated high.', competition.differentiation]))
  }
  if (demandLevel === 'low') {
    blockers.push(join(['Market demand is rated low.', market.explanation]))
  }

  return blockers.slice(0, 3)
}

export function deriveDecision(analysis, idea) {
  const data = analysis || {}
  const market = data.marketDemand || {}
  const competition = data.competition || {}
  const pricing = data.pricingRecommendation || {}
  const fit = data.financialFit || {}
  const risks = sentences(data.risks)
  const nextActions = sentences(data.nextActions).slice(0, 3)

  const score = number(data.viabilityScore)
  const budget = number(idea && idea.budgetPKR)
  const price = number(fit.priceEstimate)
  const cost = number(fit.costEstimate)
  const fixed = number(fit.fixedCosts)
  const demandLevel = levelOf(market.level)
  const competitionLevel = levelOf(competition.level)

  const key = score === null ? 'unknown' : score >= 70 ? 'go' : score >= 45 ? 'modify' : 'dontLaunch'
  const decision = DECISIONS[key]

  const candidates = collectFactors({
    demandLevel,
    competitionLevel,
    market,
    competition,
    fit,
    pricing,
    risks,
  })
  const priority = FACTOR_PRIORITY[key]
  const factors = candidates
    .sort((a, b) => priority.indexOf(a.label) - priority.indexOf(b.label))
    .slice(0, 3)

  // A GO is not a clean bill of health. The same rules apply at every band and
  // only the framing changes, so a 72/100 carrying high competition or a setup
  // estimate above budget still shows what to watch, instead of going quiet on
  // the founder who is about to spend money.
  const blockers =
    key === 'unknown'
      ? []
      : collectBlockers({
          fit,
          budget,
          price,
          cost,
          fixed,
          demandLevel,
          competitionLevel,
          market,
          competition,
        })

  const blockerHeading =
    key === 'go'
      ? 'Worth watching'
      : blockers.length === 1
        ? 'Main blocker'
        : 'Main blockers'

  const headline =
    blockers.length === 0 && decision.openHeadline ? decision.openHeadline : decision.headline

  const explanation =
    key === 'unknown'
      ? 'The analysis did not return a viability score, so there is nothing to base a decision on. The findings below are still worth reading, and a fresh analysis with more detail would let StartupIQ decide.'
      : join([
          `Your viability score of ${score}/100 falls in the ${decision.label} band.`,
          factors.length > 0
            ? factors[0].text
            : 'The analysis returned no supporting detail to explain it with.',
          blockers.length === 0
            ? key === 'go'
              ? 'Nothing in the analysis blocks a first test.'
              : 'Nothing in the findings blocks a first test outright, so this score comes from the overall picture above.'
            : key === 'go'
              ? `It clears the bar to test, with ${blockers.length} thing${blockers.length === 1 ? '' : 's'} worth watching as you spend.`
              : `${blockers.length} thing${blockers.length === 1 ? '' : 's'} still need${blockers.length === 1 ? 's' : ''} to be settled before money is spent.`,
        ])

  return {
    key,
    label: decision.label,
    headline,
    score,
    explanation,
    factors,
    blockers,
    blockerHeading,
    nextActions,
  }
}
