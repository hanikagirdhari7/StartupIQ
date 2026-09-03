import SourceTag from './SourceTag'
import { ScoreMeter } from '../ScorePreview'
import { Target } from 'lucide-react'

function bandFor(score) {
  if (score >= 70) {
    return {
      title: 'Strong Potential',
      pill: 'bg-accent-50 border-accent-200 text-accent-700',
      copy: 'Your idea holds up on the details you provided. Focus on the risks and the first roadmap phase before you spend.',
    }
  }
  if (score >= 45) {
    return {
      title: 'Promising, Needs Work',
      pill: 'bg-amber-50 border-amber-200 text-amber-700',
      copy: 'There is a real opportunity here, but specific gaps need to be closed before this is safe to fund.',
    }
  }
  return {
    title: 'High Risk',
    pill: 'bg-rose-50 border-rose-200 text-rose-700',
    copy: 'As described, this idea faces serious headwinds. Read the competition, pricing and risk sections before committing money.',
  }
}

export default function ScoreCard({ score }) {
  const value = Number(score)
  const hasScore = Number.isFinite(value)
  const clamped = hasScore ? Math.min(100, Math.max(0, Math.round(value))) : null
  const band = hasScore ? bandFor(clamped) : null

  return (
    <section className="surface-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 className="flex items-center gap-2.5 card-title">
          <Target size={18} strokeWidth={1.75} className="text-accent-600 shrink-0" aria-hidden="true" />
          Business Viability Score
        </h3>
        <SourceTag source="ai" />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <div className="shrink-0">
          {hasScore ? (
            <ScoreMeter value={clamped} />
          ) : (
            <div className="w-36 h-36 rounded-full border-8 border-slate-100 flex items-center justify-center text-sm font-semibold text-slate-400">
              N/A
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          {band ? (
            <span className={`inline-block border px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3 ${band.pill}`}>
              {band.title}
            </span>
          ) : (
            <span className="inline-block border border-slate-200 bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
              Score not returned
            </span>
          )}
          <p className="text-slate-600 leading-relaxed mb-4">
            {band ? band.copy : 'The AI response did not include a viability score, so none is shown here.'}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            This score is an AI estimate based only on the idea, customer, market and budget you
            submitted. It is guidance for your own judgement — not a guarantee of business results.
          </p>
        </div>
      </div>
    </section>
  )
}
