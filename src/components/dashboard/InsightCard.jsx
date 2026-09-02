const TONES = {
  neutral: {
    low: 'bg-slate-100 text-slate-700 border-slate-200',
    moderate: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  risk: {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    moderate: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

const FALLBACK = 'bg-slate-100 text-slate-700 border-slate-200'

export function LevelBadge({ level, tone = 'neutral' }) {
  const key = String(level || '').trim().toLowerCase()
  const palette = TONES[tone] || TONES.neutral
  const label = key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Not stated'

  return (
    <span className={`shrink-0 border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${palette[key] || FALLBACK}`}>
      {label}
    </span>
  )
}

export function InsightRow({ label, children }) {
  if (!children) return null
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className="text-slate-600 leading-relaxed break-words text-pretty">{children}</p>
    </div>
  )
}

export default function InsightCard({ title, badge, children }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 h-full">
      <div className="flex items-start justify-between gap-4 mb-5">
        <h3 className="text-lg font-extrabold text-slate-900 leading-tight text-balance">{title}</h3>
        {badge}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
