import { formatDateTime, formatPKR } from '../../utils/format'

export default function ReportHeader({ idea, meta }) {
  const analyzedAt = formatDateTime(meta && meta.analyzedAt)

  const facts = [
    { label: 'Target customer', value: idea.targetCustomer || 'Not provided' },
    { label: 'Market', value: idea.location || 'Not provided' },
    { label: 'Business type', value: idea.businessType || 'Not provided' },
    { label: 'Budget', value: formatPKR(idea.budgetPKR, 'Not provided') },
  ]

  return (
    <header className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" aria-hidden="true" />
          AI-Powered Analysis
        </div>
        <p className="text-xs text-slate-400">
          {analyzedAt ? `Analyzed ${analyzedAt}` : 'Analysis complete'}
        </p>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 leading-tight tracking-tight text-balance">
        Your Business Validation Report
      </h1>
      <p className="text-slate-600 leading-relaxed mb-6 text-pretty break-words">{idea.businessIdea}</p>

      <div className="pt-5 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Your submission</p>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4">
          {facts.map(fact => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {fact.label}
              </dt>
              <dd className="text-sm font-semibold text-slate-800 break-words tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {idea.additionalInfo && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Your extra notes
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">{idea.additionalInfo}</p>
        </div>
      )}
    </header>
  )
}
