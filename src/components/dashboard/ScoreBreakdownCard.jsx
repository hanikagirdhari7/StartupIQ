import { deriveSubScores } from '../../utils/subScores'

// Same bands as the overall score ring, so the bars read as part of one system.
function barClasses(score) {
  if (score === null) return 'bg-slate-200'
  if (score >= 70) return 'bg-indigo-600'
  if (score >= 45) return 'bg-amber-500'
  return 'bg-rose-500'
}

export default function ScoreBreakdownCard({ analysis, idea }) {
  const rows = deriveSubScores(analysis, idea)

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h3 className="text-lg font-extrabold text-slate-900">
          <span aria-hidden="true">📊</span> Business Score Breakdown
        </h3>
        <span className="border border-slate-200 bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Calculated on this page
        </span>
      </div>
      <p className="text-sm text-slate-500 mb-5">
        Each bar is worked out from the findings above using fixed rules. These are derived readings of
        the same analysis, not extra facts from the AI — and an empty bar means the data was not there.
      </p>

      <ul className="space-y-5">
        {rows.map(row => (
          <li key={row.key}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 mb-1">
              <span className="text-sm font-semibold text-slate-700">{row.label}</span>
              {row.score === null ? (
                <span className="text-xs font-semibold text-slate-400">Not enough data</span>
              ) : (
                <span className="text-sm font-extrabold text-slate-900">{row.score}/100</span>
              )}
            </div>
            <div
              className="h-2 bg-slate-100 rounded-full overflow-hidden"
              role="img"
              aria-label={
                row.score === null
                  ? `${row.label}: not enough data`
                  : `${row.label}: ${row.score} out of 100`
              }
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${barClasses(row.score)}`}
                style={{ width: `${row.score === null ? 0 : row.score}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{row.basis}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
