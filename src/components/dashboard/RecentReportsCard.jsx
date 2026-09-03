import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FolderOpen } from 'lucide-react'
import { deleteReport, listReports } from '../../services/storage'
import { formatDate, formatPKR } from '../../utils/format'

export default function RecentReportsCard({ currentId }) {
  const [reports, setReports] = useState(() => listReports())

  if (reports.length === 0) return null

  function remove(id) {
    deleteReport(id)
    setReports(listReports())
  }

  return (
    <section className="surface-card p-6 sm:p-8">
      <h3 className="flex items-center gap-2.5 card-title mb-2">
        <FolderOpen size={18} strokeWidth={1.75} className="text-accent-600 shrink-0" aria-hidden="true" />
        Your Recent Reports
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Saved on this device only, for quick comparison. Remove any of them at any time.
      </p>

      <ul className="divide-y divide-slate-100">
        {reports.map(entry => {
          const isCurrent = entry.id === currentId
          const meta = [
            entry.summary.businessType,
            entry.summary.location,
            formatPKR(entry.summary.budgetPKR, 'Budget not given'),
            `Saved ${formatDate(entry.savedAt) || 'recently'}`,
          ]

          return (
            <li key={entry.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                  <p className="text-sm font-semibold text-slate-800 leading-snug break-words">
                    {entry.summary.title}
                    {isCurrent && (
                      <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wider text-accent-700">
                        Viewing
                      </span>
                    )}
                  </p>
                  <ul className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                    {meta.map((item, index) => (
                      <li key={`meta-${index}`} className="flex items-center gap-x-2.5">
                        {index > 0 && <span aria-hidden="true" className="h-2.5 w-px bg-slate-200 shrink-0" />}
                        <span className="break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCurrent ? (
                    <span className="text-sm font-semibold text-slate-400">Current report</span>
                  ) : (
                    <Link
                      to={`/results?report=${encodeURIComponent(entry.id)}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-700 hover:text-accent-800 border border-accent-200 hover:bg-accent-50 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      View
                      <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(entry.id)}
                    aria-label={`Delete saved report: ${entry.summary.title}`}
                    className="text-sm font-semibold text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
