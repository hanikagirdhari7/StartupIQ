// Score breakdown — derived, not returned.
//
// The analysis contract (server/schemas/analysisResponse.js) carries ONE
// overall viabilityScore plus qualitative fields. Gemini never returns
// per-dimension scores, so guessing five numbers or reusing the landing-page
// sample would be invented data. Instead each dimension below is calculated
// from fields the analysis already returned, with a fixed rule that never
// changes between runs: same analysis, same breakdown.
//
// Rules are deliberately coarse (three or five bands) because a precise-looking
// number from coarse inputs would overstate the evidence. Any dimension whose
// inputs are missing scores null, and the card shows "Not enough data".

const DEMAND_SCORES = { low: 40, moderate: 65, high: 85 }

// Competition scores how open the field is: a crowded market scores lower.
const COMPETITION_SCORES = { low: 85, moderate: 60, high: 35 }

function levelKey(value) {
  return String(value || '').trim().toLowerCase()
}

function finite(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function band(score) {
  return score === null ? null : Math.min(100, Math.max(0, Math.round(score)))
}

// Margin bands: half or more left over is strong; break-even-or-worse is weak.
function profitScore(margin) {
  if (margin >= 0.5) return 85
  if (margin >= 0.3) return 70
  if (margin >= 0.15) return 55
  if (margin > 0) return 40
  return 20
}

// How much of the founder's own budget goes into setup before revenue.
function entryScore(ratio) {
  if (ratio <= 0.25) return 85
  if (ratio <= 0.5) return 70
  if (ratio <= 0.75) return 55
  if (ratio <= 1) return 40
  return 25
}

export function deriveSubScores(analysis, idea) {
  const data = analysis || {}
  const market = data.marketDemand || {}
  const competition = data.competition || {}
  const fit = data.financialFit || {}
  const budget = finite(idea && idea.budgetPKR)
  const price = finite(fit.priceEstimate)
  const cost = finite(fit.costEstimate)
  const fixed = finite(fit.fixedCosts)
  const hasEstimates = price !== null && cost !== null && price > 0

  const demandScore = DEMAND_SCORES[levelKey(market.level)] || null
  const competitionScore = COMPETITION_SCORES[levelKey(competition.level)] || null
  const margin = hasEstimates ? (price - cost) / price : null
  const setupRatio = fixed !== null && budget !== null && budget > 0 ? fixed / budget : null

  return [
    {
      key: 'marketDemand',
      label: 'Market Demand',
      score: band(demandScore),
      basis: demandScore
        ? `Derived from the market demand level above: ${levelKey(market.level)}.`
        : 'No usable market demand level came back, so this bar is left empty.',
    },
    {
      key: 'competition',
      label: 'Competition',
      score: band(competitionScore),
      basis: competitionScore
        ? `Higher means more room to enter. Derived from the competition level above: ${levelKey(competition.level)}.`
        : 'No usable competition level came back, so this bar is left empty.',
    },
    {
      key: 'profitPotential',
      label: 'Profit Potential',
      score: band(margin === null ? null : profitScore(margin)),
      basis: margin === null
        ? `Needs both a selling price and a cost estimate above. ${
            fit.priceLabel || 'Price'
          } or ${fit.costLabel || 'cost'} was not estimated.`
        : `Derived from the estimate above: ${Math.round(margin * 100)}% of each sale is left after cost.`,
    },
    {
      key: 'easeOfEntry',
      label: 'Ease of Entry',
      score: band(setupRatio === null ? null : entryScore(setupRatio)),
      basis: setupRatio === null
        ? 'Needs your budget plus a fixed setup cost estimate. When setup costs are unknown this stays empty rather than guessed.'
        : `Derived from the numbers above: setup costs are about ${Math.round(setupRatio * 100)}% of your starting budget.`,
    },
    {
      key: 'longTermGrowth',
      label: 'Long-term Growth',
      score: null,
      basis:
        'Not enough data. The analysis returns no growth, repeat-purchase or market-size figures, so any score here would be invented.',
    },
  ]
}
