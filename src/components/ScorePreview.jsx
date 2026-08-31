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

function SubScore({ label, value, max = 100 }) {
  const pct = (value / max) * 100
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{value}/{max}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function ScorePreview() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Your Business Viability Score
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Get a clear, data-backed score on your idea&apos;s chances of success — covering market demand,
            competition, profitability, and more.
          </p>
        </div>

        {/* Sample label banner */}
        <div className="flex justify-center mb-6">
          <span className="bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
            Sample / Illustrative Result — Not Real Analysis
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Left: big score */}
            <div className="flex flex-col items-center gap-3 lg:w-56 shrink-0">
              <ScoreMeter value={74} />
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">Good Potential</p>
                <p className="text-sm text-slate-500 mt-1">
                  Your idea shows strong market fit with a few areas to address before launching.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-48 bg-slate-100" />

            {/* Right: sub-scores */}
            <div className="flex-1 w-full space-y-5">
              <SubScore label="Market Demand" value={82} />
              <SubScore label="Competition Level" value={61} />
              <SubScore label="Profit Potential" value={78} />
              <SubScore label="Ease of Entry" value={55} />
              <SubScore label="Long-term Growth" value={80} />
            </div>
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
            {['E-commerce', 'Low Startup Cost', 'B2C', 'High Demand Niche', 'Scalable'].map(tag => (
              <span key={tag} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          * This is a sample to illustrate how your results will look. Real analysis uses your actual idea and market data.
        </p>
      </div>
    </section>
  )
}
