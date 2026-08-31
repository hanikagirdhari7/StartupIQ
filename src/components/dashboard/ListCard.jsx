const VARIANTS = {
  actions: {
    card: 'border-indigo-100',
    marker: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    dot: 'bg-indigo-500',
  },
  marketing: {
    card: 'border-slate-100',
    marker: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dot: 'bg-emerald-500',
  },
  risks: {
    card: 'border-rose-100',
    marker: 'bg-rose-50 text-rose-700 border-rose-100',
    dot: 'bg-rose-500',
  },
}

export default function ListCard({ title, items, variant = 'actions', ordered = false }) {
  const styles = VARIANTS[variant] || VARIANTS.actions
  const list = Array.isArray(items) ? items.filter(item => typeof item === 'string' && item.trim()) : []

  return (
    <section className={`bg-white rounded-2xl shadow-lg border p-6 sm:p-8 h-full ${styles.card}`}>
      <h3 className="text-lg font-extrabold text-slate-900 mb-5">{title}</h3>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">The analysis did not include items for this section.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-3">
              {ordered ? (
                <span className={`shrink-0 w-6 h-6 rounded-full border text-[11px] font-bold flex items-center justify-center ${styles.marker}`}>
                  {index + 1}
                </span>
              ) : (
                <span className={`shrink-0 mt-2 w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              )}
              <span className="text-slate-600 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
