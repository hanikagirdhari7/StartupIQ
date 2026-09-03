import { useEffect, useState } from 'react'

const RING_RADIUS = 52
const SWEEP_MS = 700

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function ScoreMeter({ value }) {
  const pct = Math.min(100, Math.max(0, value))
  const circumference = 2 * Math.PI * RING_RADIUS
  const reduceMotion = prefersReducedMotion()
  const [shown, setShown] = useState(() => (reduceMotion ? pct : 0))
  const current = reduceMotion ? pct : shown

  // One clock drives both the arc and the number, so they always agree. The
  // colour stays on the final value — a band earned mid-count would be a lie.
  useEffect(() => {
    if (reduceMotion) return undefined
    let frame
    const start = performance.now()
    const step = now => {
      const t = Math.min(1, (now - start) / SWEEP_MS)
      setShown(Math.round(pct * (1 - (1 - t) ** 3)))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    // A hidden document never delivers frames, so the count must not end on the
    // starting value: this lands the real score whatever happens to the loop.
    const settle = setTimeout(() => setShown(pct), SWEEP_MS + 100)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settle)
    }
  }, [pct, reduceMotion])

  const offset = circumference - (current / 100) * circumference
  const color = pct >= 70 ? '#21747c' : pct >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex animate-rise items-center justify-center w-36 h-36">
      <svg className="rotate-[-90deg]" width="144" height="144" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{current}</span>
        <span className="text-xs text-slate-500 font-medium">/ 100</span>
      </div>
    </div>
  )
}

// Same band colours as the real ScoreBreakdownCard, so the sample cannot show a
// confident bar for a score the product would paint amber or rose.
function barClasses(score) {
  if (score === null) return 'bg-slate-200'
  if (score >= 70) return 'bg-accent-600'
  if (score >= 45) return 'bg-amber-500'
  return 'bg-rose-500'
}

function SubScore({ label, value, basis }) {
  return (
    <li className="py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        {value === null ? (
          <span className="text-xs font-semibold text-slate-400">Not enough data</span>
        ) : (
          <span className="text-sm font-bold text-slate-900 tabular-nums">
            {value}
            <span className="text-slate-400 font-medium">/100</span>
          </span>
        )}
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barClasses(value)}`}
          style={{ width: `${value === null ? 0 : value}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mt-1.5 text-pretty">{basis}</p>
    </li>
  )
}

// Only values the real derivation rules can emit (see utils/subScores.js):
// demand high=85, competition high=35, a 35% margin=70, setup at 45% of
// budget=70. Growth gets no returning figure, so it stays unscored.
const SAMPLE_SCORES = [
  { label: 'Market Demand', value: 85, basis: 'Market demand level: high.' },
  {
    label: 'Competition',
    value: 35,
    basis: 'Higher means more room to enter. Competition level: high.',
  },
  {
    label: 'Profit Potential',
    value: 70,
    basis: 'About 35% of each sale is left after its full cost — before marketing, rent and your own time.',
  },
  {
    label: 'Ease of Entry',
    value: 70,
    basis: 'Setup costs are about 45% of the starting budget.',
  },
  {
    label: 'Long-term Growth',
    value: null,
    basis: 'The report returns no growth or repeat-purchase figures, so a score here would be invented.',
  },
]

// The same fields, in the same order, the real report header shows (ReportHeader.jsx).
const SAMPLE_SUBMISSION = [
  { label: 'Business type', value: 'Ecommerce' },
  { label: 'Location', value: 'Lahore, Pakistan' },
  { label: 'Budget', value: 'PKR 150,000' },
  { label: 'Target customer', value: 'Women aged 18–35' },
]

export default function ScorePreview() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 text-balance">
            Your Business Viability Score
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-pretty">
            See how an idea is scored — market demand, competition, profitability, ease of entry, and growth
            potential — based on what you tell us about it.
          </p>
        </div>

        <div className="surface-card p-8 sm:p-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10">
            {/* Focal point: the overall score */}
            <div className="w-full md:w-72 shrink-0 rounded-2xl bg-slate-50 ring-1 ring-slate-100 p-5 sm:p-6 md:justify-center flex flex-col items-center text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-5">
                Overall viability
              </p>
              <div className="bg-white rounded-full p-2.5 sm:p-3 shadow-sm ring-1 ring-slate-100 flex items-center justify-center">
                <ScoreMeter value={78} />
              </div>
              <span className="mt-6 inline-block bg-accent-50 border border-accent-200 text-accent-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                Strong Potential
              </span>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed text-pretty">
                Your idea holds up on the details you provided. Focus on the risks and the first roadmap
                phase before you spend.
              </p>
            </div>

            {/* The factors behind it */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 mb-1">Business Score Breakdown</h3>
              <p className="text-sm text-slate-500 mb-5 text-pretty">
                Five readings from the same report, worked out with fixed rules, not extra opinions.
              </p>
              <ul className="divide-y divide-slate-100">
                {SAMPLE_SCORES.map(row => (
                  <SubScore key={row.label} label={row.label} value={row.value} basis={row.basis} />
                ))}
              </ul>
              <p className="mt-5 text-xs text-slate-400 leading-relaxed text-pretty">
                An empty bar means the report returned no figure to score, so nothing was guessed. In a real
                report, every bar shows the numbers behind it.
              </p>
            </div>
          </div>

          {/* Founder's own submission details, as the real report header shows them */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your submission
              </p>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
              {SAMPLE_SUBMISSION.map(item => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-700 break-words">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
