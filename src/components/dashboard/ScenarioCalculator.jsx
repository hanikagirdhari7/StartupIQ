import { useMemo, useState } from 'react'
import { Calculator } from 'lucide-react'
import { formatPKR } from '../../utils/format'

// A "what if" sandbox. It reads the AI estimates as a starting point and lets
// the founder change them, but nothing is written back to the analysis and no
// request is made — every figure below is arithmetic done in this browser.

const FIELDS = [
  { key: 'budget', label: 'Available budget', aiKey: null },
  { key: 'price', label: 'Selling price per sale', aiKey: 'priceEstimate' },
  { key: 'cost', label: 'Full cost per sale', aiKey: 'costEstimate' },
  { key: 'fixed', label: 'Setup costs before first sale', aiKey: 'fixedCosts' },
]

// null, undefined and '' all coerce to 0 through Number(), which would turn an
// estimate the analysis refused to make into a stated zero. Refuse them first.
function seed(value) {
  if (value === null || value === undefined || value === '') return ''
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? String(number) : ''
}

// Blank stays blank so each row can say exactly what it needs; anything
// unparsable or negative is flagged instead of quietly becoming a number.
function parseEntry(raw) {
  const text = String(raw ?? '').trim()
  if (text === '') return { value: null, invalid: false }
  const number = Number(text)
  if (!Number.isFinite(number) || number < 0) return { value: null, invalid: true }
  return { value: number, invalid: false }
}

function missing(text) {
  return { text, muted: true }
}

function Field({ label, hint, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
        {label}
      </span>
      <span className="relative block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none select-none">
          PKR
        </span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder="0"
          className="w-full border border-slate-200 rounded-xl bg-white pl-11 pr-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        />
      </span>
      <span className="block text-[11px] text-slate-400 mt-1 tabular-nums">{hint}</span>
    </label>
  )
}

function Result({ label, value, note }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={value.muted ? 'text-sm font-semibold text-slate-400 leading-relaxed' : 'text-lg font-extrabold text-slate-900 tabular-nums'}>
        {value.text}
      </p>
      {note && <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{note}</p>}
    </div>
  )
}

export default function ScenarioCalculator({ financialFit, budget }) {
  const fit = financialFit || {}
  const baseline = useMemo(
    () => ({
      budget: seed(budget),
      price: seed(fit.priceEstimate),
      cost: seed(fit.costEstimate),
      fixed: seed(fit.fixedCosts),
    }),
    [budget, fit.priceEstimate, fit.costEstimate, fit.fixedCosts],
  )
  const [draft, setDraft] = useState(baseline)
  const isChanged = FIELDS.some(({ key }) => draft[key] !== baseline[key])

  const entries = FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: parseEntry(draft[key]) }), {})
  const invalid = FIELDS.filter(({ key }) => entries[key].invalid).map(({ label }) => label)
  const funds = entries.budget.value
  const price = entries.price.value
  const cost = entries.cost.value
  const fixed = entries.fixed.value

  const profit = price !== null && cost !== null ? price - cost : null
  const margin = profit !== null && price > 0 ? (profit / price) * 100 : null
  const recoverSales = profit !== null && profit > 0 && fixed !== null && fixed > 0
    ? Math.ceil(fixed / profit)
    : null
  const afterSetup = funds !== null && fixed !== null ? funds - fixed : null

  const recoverGap =
    profit === null ? 'Enter a selling price and a cost per sale.'
      : profit <= 0 ? 'There is no profit at these numbers, so nothing recovers setup costs yet.'
        : fixed === null ? 'Enter your setup costs to see how many sales recover them.'
          : 'Your setup costs are 0, so there is nothing to recover.'
  const leftoverGap =
    funds === null ? 'Enter your available budget.'
      : 'Enter your setup costs to see what is left after them.'

  const results = [
    {
      label: 'Estimated margin per sale',
      value: profit === null ? missing('Enter a selling price and a cost per sale.') : { text: formatPKR(profit) },
      note: profit === null ? null : `${formatPKR(price)} minus ${formatPKR(cost)}.`,
    },
    {
      label: 'Margin on each sale',
      value: margin === null
        ? missing(profit === null ? 'Enter a selling price and a cost per sale.' : 'Needs a selling price above 0.')
        : { text: `${Math.round(margin)}%` },
      note: margin === null ? null : 'Share of each sale left after its full cost. Marketing, rent and your own time still come out of it.',
    },
    {
      label: 'Sales to recover setup costs',
      value: recoverSales === null
        ? missing(recoverGap)
        : { text: `About ${recoverSales} sale${recoverSales === 1 ? '' : 's'}` },
      note: recoverSales === null
        ? null
        : 'A count, not a date. How long it takes depends on your own sales volume.',
    },
    {
      label: 'Budget left after setup costs',
      value: afterSetup === null ? missing(leftoverGap) : { text: formatPKR(afterSetup) },
      note: afterSetup === null
        ? null
        : afterSetup < 0
          ? 'These setup costs are more than the budget you entered.'
          : 'What is left for stock, marketing and running costs.',
    },
  ]

  return (
    <div className="mt-6 rounded-2xl border border-accent-100 bg-accent-50/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h4 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
          <Calculator size={16} strokeWidth={1.75} className="text-accent-600 shrink-0" aria-hidden="true" />
          What if you change the numbers?
        </h4>
        <span className="border border-accent-200 bg-white text-accent-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Your scenario
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-5">
        This starts from the AI estimates above. Change any amount to see what it would mean. The
        report itself stays untouched, and for a monthly service read each
        &ldquo;sale&rdquo; as one customer&apos;s month.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map(field => (
          <Field
            key={field.key}
            label={field.label}
            value={draft[field.key]}
            hint={
              field.aiKey
                ? `AI estimate: ${formatPKR(fit[field.aiKey], 'not given')}`
                : 'The budget you entered in the form.'
            }
            onChange={next => setDraft(prev => ({ ...prev, [field.key]: next }))}
          />
        ))}
      </div>

      {invalid.length > 0 && (
        <p className="mt-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-sm font-medium" role="alert">
          Please enter an amount of 0 or more for: {invalid.join(', ')}.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        {results.map(row => (
          <Result key={row.label} label={row.label} value={row.value} note={row.note} />
        ))}
      </div>

      {isChanged && (
        <button
          type="button"
          onClick={() => setDraft(baseline)}
          className="mt-4 text-sm font-semibold text-accent-600 hover:text-accent-800"
        >
          Reset to the AI estimates
        </button>
      )}

      <p className="mt-4 text-xs text-slate-500 leading-relaxed">
        Scenario Estimate: worked out only from the amounts typed above. It uses no market data and
        predicts nothing; real supplier prices, costs and sales volume will differ, so verify them
        before you spend.
      </p>
    </div>
  )
}
