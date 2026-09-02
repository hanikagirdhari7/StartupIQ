import { deriveDecision } from '../../utils/decision'

const STYLES = {
  go: {
    card: 'border-emerald-300 bg-emerald-50/60',
    badge: 'bg-emerald-600 text-white',
    heading: 'text-emerald-800',
    panel: 'bg-white border-emerald-100',
    marker: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  modify: {
    card: 'border-amber-300 bg-amber-50/60',
    badge: 'bg-amber-500 text-white',
    heading: 'text-amber-800',
    panel: 'bg-white border-amber-100',
    marker: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  dontLaunch: {
    card: 'border-rose-300 bg-rose-50/60',
    badge: 'bg-rose-600 text-white',
    heading: 'text-rose-800',
    panel: 'bg-white border-rose-100',
    marker: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  unknown: {
    card: 'border-slate-200 bg-slate-50',
    badge: 'bg-slate-500 text-white',
    heading: 'text-slate-700',
    panel: 'bg-white border-slate-200',
    marker: 'bg-slate-100 text-slate-700 border-slate-200',
  },
}

function Block({ title, children }) {
  return (
    <div className="mt-6">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">{title}</h4>
      {children}
    </div>
  )
}

export default function DecisionCard({ analysis, idea }) {
  const decision = deriveDecision(analysis, idea)
  const styles = STYLES[decision.key] || STYLES.unknown

  return (
    <section
      aria-labelledby="decision-heading"
      className={`rounded-2xl shadow-xl border-2 p-6 sm:p-8 ${styles.card}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">
        Final business decision
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          className={`inline-block px-5 py-2 rounded-full text-base sm:text-lg font-extrabold uppercase tracking-widest ${styles.badge}`}
        >
          {decision.label}
        </span>
        <h3 id="decision-heading" className={`text-xl sm:text-2xl font-extrabold leading-tight ${styles.heading}`}>
          {decision.headline}
        </h3>
      </div>

      <p className="mt-4 text-slate-700 leading-relaxed max-w-3xl">{decision.explanation}</p>

      {decision.factors.length > 0 && (
        <Block title="Why StartupIQ says this">
          <ul className="space-y-2">
            {decision.factors.map(factor => (
              <li key={factor.label} className={`rounded-xl border p-4 ${styles.panel}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {factor.label}
                </p>
                <p className="text-slate-700 leading-relaxed">{factor.text}</p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {decision.blockers.length > 0 && (
        <Block title={decision.blockers.length === 1 ? 'Main blocker' : 'Main blockers'}>
          <ul className="space-y-2">
            {decision.blockers.map(blocker => (
              <li key={blocker} className="flex gap-3">
                <span aria-hidden="true" className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-slate-700 leading-relaxed">{blocker}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block title="What to do next">
        {decision.nextActions.length > 0 ? (
          <ol className="space-y-3">
            {decision.nextActions.map((action, index) => (
              <li key={action} className="flex gap-3">
                <span
                  className={`shrink-0 w-6 h-6 rounded-full border text-[11px] font-bold flex items-center justify-center ${styles.marker}`}
                >
                  {index + 1}
                </span>
                <span className="text-slate-700 leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500 leading-relaxed">
            The analysis returned no next actions, so work through the blockers and risks above first.
          </p>
        )}
      </Block>

      <p className="mt-6 text-xs text-slate-500 leading-relaxed">
        This recommendation is an AI-assisted assessment based on the information provided. It is
        guidance, not a guarantee.
      </p>
    </section>
  )
}
