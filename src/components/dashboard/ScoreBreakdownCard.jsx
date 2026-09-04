import SourceTag from './SourceTag'
import { deriveSubScores } from '../../utils/subScores'
import { ChartColumn, Info } from 'lucide-react'

// Same bands as the overall score ring, so the bars read as part of one system.
function barClasses(score) {
  if (score === null) return 'bg-slate-200'
  if (score >= 70) return 'bg-accent-600'
  if (score >= 45) return 'bg-amber-500'
  return 'bg-rose-500'
}

export default function ScoreBreakdownCard({ analysis, idea }) {
  const rows = deriveSubScores(analysis, idea)

  return (
    <section className="surface-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="flex items-center gap-2.5 card-title">
          <ChartColumn size={18} strokeWidth={1.75} className="text-accent-600 shrink-0" aria-hidden="true" />
          Business Score Breakdown
        </h3>
        <SourceTag source="calculated" />
      </div>
      <p className="text-sm text-slate-500 mb-5">
        Each bar is worked out from the findings above using fixed rules. These are derived readings of
        the same analysis, not extra facts from the AI — and a dimension with no bar at all is one the
        data could not score.
      </p>

      <ul className="space-y-5">
        {rows.map(row => (
          <li key={row.key}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 mb-1">
              <span className="text-sm font-semibold text-slate-700">{row.label}</span>
              {row.score === null ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  <Info size={12} strokeWidth={2} className="shrink-0 text-slate-400" aria-hidden="true" />
                  Not enough data
                </span>
              ) : (
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">{row.score}/100</span>
              )}
            </div>
            {/* No bar at all when unscored: an empty track still reads as a zero. */}
            {row.score !== null && (
              <div
                className="h-2 bg-slate-100 rounded-full overflow-hidden"
                role="img"
                aria-label={`${row.label}: ${row.score} out of 100`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barClasses(row.score)}`}
                  style={{ width: `${row.score}%` }}
                />
              </div>
            )}
            <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{row.basis}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
