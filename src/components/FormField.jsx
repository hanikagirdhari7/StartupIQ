export const inputClasses = (hasError) =>
  [
    'w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder-slate-400',
    'transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/40',
    hasError
      ? 'border-rose-300 focus:border-rose-400'
      : 'border-slate-200 focus:border-accent-500',
  ].join(' ')

export default function FormField({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
      {children}
      {error && (
        <p className="mt-1.5 text-sm text-rose-600 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
