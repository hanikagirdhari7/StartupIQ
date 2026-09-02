export function ScoreMeter({ value }) {
  const pct = Math.min(100, Math.max(0, value))
  const circumference = 2 * Math.PI * 52
  const offset = circumference - (pct / 100) * circumference

  const color =
    pct >= 70 ? '#4f46e5' : pct >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center w-36 h-36">
      <svg className="rotate-[-90deg]" width="144" height="144" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="52"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-slate-900">{pct}</span>
        <span className="text-xs text-slate-500 font-medium">/ 100</span>
      </div>
    </div>
  )
}

// Same band colours as the real ScoreBreakdownCard, so the sample cannot show a
// confident bar for a score the product would paint amber or rose.
function barClasses(score) {
  if (score === null) return 'bg-slate-200'
  if (score >= 70) return 'bg-indigo-600'
  if (score >= 45) return 'bg-amber-500'
  return 'bg-rose-500'
}

function SubScore({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        {value === null ? (
          <span className="text-xs font-semibold text-slate-400">Not enough data</span>
        ) : (
          <span className="font-semibold text-slate-800">{value}/100</span>
        )}
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barClasses(value)}`}
          style={{ width: `${value === null ? 0 : value}%` }}
        />
      </div>
    </div>
  )
}

// Only values the real derivation rules can emit (see utils/subScores.js):
// demand high=85, competition moderate=60, a 41% margin=70, setup at 42% of
// budget=70. Growth gets no returning figure, so it stays unscored.
const SAMPLE_SCORES = [
  { label: 'Market Demand', value: 85 },
  { label: 'Competition', value: 60 },
  { label: 'Profit Potential', value: 70 },
  { label: 'Ease of Entry', value: 70 },
  { label: 'Long-term Growth', value: null },
]

export default function ScorePreview() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Your Business Viability Score
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            See how an idea is scored — market demand, competition, profitability, ease of entry, and growth
            potential — based on what you tell us about it.
          </p>
        </div>

        {/* Sample label banner */}
        <div className="flex justify-center mb-6">
          <span className="bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest text-center">
            Sample / Illustrative Result — Not Real Analysis
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Left: big score */}
            <div className="flex flex-col items-center gap-3 lg:w-56 shrink-0">
              <ScoreMeter value={74} />
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">Strong Potential</p>
                <p className="text-sm text-slate-500 mt-1">
                  Your idea holds up on the details you provided. Focus on the risks and the first roadmap
                  phase before you spend.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-48 bg-slate-100" />

            {/* Right: sub-scores */}
            <div className="flex-1 w-full space-y-5">
              {SAMPLE_SCORES.map(row => (
                <SubScore key={row.label} label={row.label} value={row.value} />
              ))}
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                An empty bar means the analysis returned no figure to score — nothing is guessed. In a real
                report, each bar states the numbers it was worked out from.
              </p>
            </div>
          </div>

          {/* Founder's own submission details, as the real report header shows them */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              From the submission
            </p>
            <div className="flex flex-wrap gap-2">
              {['Ecommerce', 'Lahore, Pakistan', 'Budget PKR 120,000', 'Gift buyers aged 25–40'].map(tag => (
                <span key={tag} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          * This is a sample to illustrate how your results will look. A real report is scored from your own idea
          and the details you provide — it is AI guidance, not live market data.
        </p>
      </div>
    </section>
  )
}
