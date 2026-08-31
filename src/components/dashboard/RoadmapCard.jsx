export default function RoadmapCard({ steps }) {
  const list = Array.isArray(steps)
    ? steps.filter(step => step && typeof step === 'object')
    : []

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">
      <h3 className="text-lg font-extrabold text-slate-900 mb-6">Launch Roadmap</h3>

      {list.length === 0 ? (
        <p className="text-sm text-slate-500">The analysis did not include a roadmap.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {list.map((step, index) => {
            const actions = Array.isArray(step.actions)
              ? step.actions.filter(action => typeof action === 'string' && action.trim())
              : []
            return (
              <div
                key={`phase-${index}`}
                className="py-5 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-2 sm:gap-6"
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                    {step.period || `Phase ${index + 1}`}
                  </p>
                </div>
                <ul className="space-y-2 sm:pl-0">
                  {actions.length === 0 ? (
                    <li className="text-sm text-slate-500">No actions listed for this phase.</li>
                  ) : (
                    actions.map((action, inner) => (
                      <li key={`action-${inner}`} className="flex gap-2">
                        <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span className="text-slate-600 leading-relaxed">{action}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
