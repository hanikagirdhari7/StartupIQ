import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    <section className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">
      <h3 className="text-lg font-extrabold text-slate-900 mb-2">
        <span aria-hidden="true">🗂️</span> Your Recent Reports
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
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 leading-snug break-words">
                    {entry.summary.title}
                    {isCurrent && (
                      <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                        Viewing
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{meta.join(' · ')}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCurrent ? (
                    <span className="text-sm font-semibold text-slate-400">Current report</span>
                  ) : (
                    <Link
                      to={`/results?report=${encodeURIComponent(entry.id)}`}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      View <span aria-hidden="true">→</span>
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
