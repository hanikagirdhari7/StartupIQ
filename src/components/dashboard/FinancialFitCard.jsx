import { useState } from 'react'

const STATUS = {
  goodToTest: {
    label: 'Good for testing',
    dot: '🟢',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  needsCaution: {
    label: 'Needs caution',
    dot: '🟡',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  financiallyChallenging: {
    label: 'Financially challenging',
    dot: '🔴',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

function money(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  const rounded = Math.round(number)
  const sign = rounded < 0 ? '-' : ''
  return `${sign}PKR ${Math.abs(rounded).toLocaleString('en-US')}`
}

function figure(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function Row({ label, value, estimated, muted }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 border-b border-slate-100 last:border-0">
      <dt className="text-sm text-slate-500">
        {label}
        {estimated && (
          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            AI estimate
          </span>
        )}
      </dt>
      <dd className={`text-base font-extrabold ${muted ? 'text-slate-400 font-semibold text-sm' : 'text-slate-900'}`}>
        {value}
      </dd>
    </div>
  )
}

export default function FinancialFitCard({ financialFit, budget }) {
  const [showCalculation, setShowCalculation] = useState(false)
  const data = financialFit || {}
  const status = STATUS[data.status]

  const price = figure(data.priceEstimate)
  const cost = figure(data.costEstimate)
  const fixed = figure(data.fixedCosts)
  const perSale = data.basis === 'perSale'
  const profit = price !== null && cost !== null ? price - cost : null

  // Break-even is stated only as a COUNT of sales or paying customers. A recovery
  // period would need an assumed customer count or sales volume, which the founder
  // never provided, so the card must not imply one.
  const breakEvenUnit = perSale ? 'sale' : 'paying customer'
  let breakEvenCount = null
  if (profit !== null && profit > 0 && fixed !== null && fixed > 0) {
    breakEvenCount = Math.ceil(fixed / profit)
  }
  const breakEven =
    breakEvenCount === null
      ? null
      : `About ${breakEvenCount} ${breakEvenUnit}${breakEvenCount === 1 ? '' : 's'}${
          perSale ? '' : ' for one month'
        }`

  const profitLabel = perSale
    ? 'Estimated profit per sale'
    : 'Estimated monthly contribution per customer'
  const profitNoun = perSale ? 'profit per sale' : 'monthly contribution per customer'
  const breakEvenGap = !breakEven
    ? fixed === null
      ? 'Break-even needs your fixed setup costs. Rather than guess an amount, the line above says "Not enough information to estimate reliably".'
      : profit === null
        ? 'We need the missing price or cost estimate above before break-even can be worked out.'
        : `Your ${profitNoun} is not above zero, so there is nothing yet to recover setup costs from.`
    : null

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h3 className="text-lg font-extrabold text-slate-900">
          <span aria-hidden="true">💰</span> Financial Fit
        </h3>
        {status && (
          <span className={`border rounded-full px-4 py-1.5 text-sm font-bold ${status.classes}`}>
            <span aria-hidden="true">{status.dot}</span> {status.label}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Can you realistically test this business with the budget you have?
      </p>

      <dl>
        <Row label="Starting budget" value={money(budget)} />
        <Row
          label={data.priceLabel || 'Estimated income'}
          value={price === null ? 'Not estimated' : money(price)}
          estimated={price !== null}
          muted={price === null}
        />
        <Row
          label={data.costLabel || 'Estimated cost'}
          value={cost === null ? 'Not estimated' : money(cost)}
          estimated={cost !== null}
          muted={cost === null}
        />
        <Row
          label={profitLabel}
          value={profit === null ? 'Not estimated' : money(profit)}
          estimated={profit !== null}
          muted={profit === null}
        />
        <Row
          label="Fixed setup costs (before your first revenue)"
          value={fixed === null ? 'Not enough information to estimate reliably' : money(fixed)}
          estimated={fixed !== null}
          muted={fixed === null}
        />
        <Row
          label="Break-even"
          value={breakEven || 'Cannot be estimated reliably yet'}
          estimated={Boolean(breakEven)}
          muted={!breakEven}
        />
      </dl>

      {breakEvenGap && (
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">{breakEvenGap}</p>
      )}

      {data.verdict && (
        <div className="mt-5 rounded-xl bg-indigo-50 border border-indigo-100 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-1">
            <span aria-hidden="true">💡</span> StartupIQ says
          </p>
          <p className="text-slate-800 leading-relaxed font-medium">{data.verdict}</p>
        </div>
      )}

      {data.biggestConcern && (
        <div className="mt-3 rounded-xl border border-slate-200 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Biggest financial concern
          </p>
          <p className="text-slate-700 leading-relaxed">{data.biggestConcern}</p>
        </div>
      )}

      {data.howEstimated && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowCalculation(open => !open)}
            aria-expanded={showCalculation}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            {showCalculation ? 'Hide calculation' : 'See calculation'}
          </button>
          {showCalculation && (
            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed">{data.howEstimated}</p>
              {profit !== null && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {money(profit)} {perSale ? 'per sale' : 'per paying customer each month'} ={' '}
                  {money(price)} minus {money(cost)}.
                  {breakEvenCount !== null && (
                    <>
                      {' '}
                      {money(fixed)} of setup costs divided by that {profitNoun} comes to{' '}
                      {breakEvenCount} {breakEvenUnit}
                      {breakEvenCount === 1 ? '' : 's'}
                      {perSale ? '' : ' each paying for one month'}. That is a count, not a date —
                      turning it into a time needs your own target for how many{' '}
                      {breakEvenUnit}s you expect each month, and only you know that.
                    </>
                  )}
                </p>
              )}
              {data.missingInformation && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Still needed: </span>
                  {data.missingInformation}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400 leading-relaxed">
        Every figure marked as an estimate is the AI&apos;s reasonable guess from what you described,
        not a verified market price. Nothing here guarantees a sale, a margin or a profit — confirm
        real costs with suppliers or service providers before you spend.
      </p>
    </section>
  )
}
