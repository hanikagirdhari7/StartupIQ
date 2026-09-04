import { useState } from 'react'
import { ChevronDown, CircleAlert, CircleCheck, Info, Lightbulb, TriangleAlert, Wallet } from 'lucide-react'
import ScenarioCalculator from './ScenarioCalculator'
import SourceTag from './SourceTag'
import { formatPKR as money } from '../../utils/format'

const STATUS = {
  goodToTest: {
    label: 'Good for testing',
    Icon: CircleCheck,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  needsCaution: {
    label: 'Needs caution',
    Icon: TriangleAlert,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  financiallyChallenging: {
    label: 'Financially challenging',
    Icon: CircleAlert,
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

function figure(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function Row({ label, value, muted }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 border-b border-slate-100 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      {muted ? (
        <dd className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
          <Info size={13} strokeWidth={1.75} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span className="break-words">{value}</span>
        </dd>
      ) : (
        <dd className="text-base font-extrabold tabular-nums break-words text-slate-900">
          {value}
        </dd>
      )}
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
    ? 'Estimated margin per sale (before marketing and overheads)'
    : 'Estimated monthly margin per customer (before overheads)'
  const profitNoun = perSale ? 'margin per sale' : 'monthly margin per customer'
  const breakEvenGap = !breakEven
    ? fixed === null
      ? 'Break-even needs your fixed setup costs. Rather than guess an amount, the line above says "Not enough information to estimate reliably".'
      : profit === null
        ? 'We need the missing price or cost estimate above before break-even can be worked out.'
        : profit <= 0
          ? `Your ${profitNoun} is not above zero, so there is nothing yet to recover setup costs from.`
          : 'Your fixed setup costs are 0, so there is nothing to recover: every sale is ahead from the first one.'
    : null

  return (
    <section className="surface-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h3 className="flex items-center gap-2.5 card-title">
          <Wallet size={18} strokeWidth={1.75} className="text-accent-600 shrink-0" aria-hidden="true" />
          Financial Fit
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <SourceTag source="ai" />
          {status && (
            <span className={`inline-flex items-center gap-1.5 border rounded-full px-3.5 py-1.5 text-sm font-bold ${status.classes}`}>
              <status.Icon size={15} strokeWidth={2} aria-hidden="true" />
              {status.label}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Can you realistically test this business with the budget you have?
      </p>

      <dl>
        <Row label="Starting budget" value={money(budget)} />
        <Row
          label={data.priceLabel || 'Estimated income'}
          value={price === null ? 'Not estimated' : money(price)}
          muted={price === null}
        />
        <Row
          label={data.costLabel || 'Estimated cost'}
          value={cost === null ? 'Not estimated' : money(cost)}
          muted={cost === null}
        />
        <Row
          label={profitLabel}
          value={profit === null ? 'Not estimated' : money(profit)}
          muted={profit === null}
        />
        <Row
          label="Fixed setup costs (before your first revenue)"
          value={fixed === null ? 'Not enough information to estimate reliably' : money(fixed)}
          muted={fixed === null}
        />
        <Row
          label="Break-even"
          value={breakEven || 'Cannot be estimated reliably yet'}
          muted={!breakEven}
        />
      </dl>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <p className="flex items-center gap-1.5 meta-label mb-1.5">
          <Info size={13} strokeWidth={2} className="text-slate-400" aria-hidden="true" />
          AI-generated estimates
        </p>
        <p className="text-xs text-slate-500 leading-relaxed text-pretty">
          Pricing and cost figures are estimates based on the information provided and should be
          validated with suppliers and current market prices. Where they apply, a per-sale cost already
          includes packaging, courier and the expected loss from failed or returned deliveries — it is not
          only what the stock cost. What is left after it is therefore not profit either: marketing, rent and
          your own time come out of that. These figures are guidance, not verified live market data.
        </p>
      </div>

      {breakEvenGap && (
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">{breakEvenGap}</p>
      )}

      {data.verdict && (
        <div className="mt-5 rounded-xl bg-accent-50 border border-accent-100 p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent-700 mb-1">
            <Lightbulb size={13} strokeWidth={2} aria-hidden="true" />
            StartupIQ says
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
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 hover:text-accent-800"
          >
            <ChevronDown
              size={15}
              strokeWidth={2.25}
              aria-hidden="true"
              className={`transition-transform duration-200 ${showCalculation ? 'rotate-180' : ''}`}
            />
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

      <ScenarioCalculator financialFit={financialFit} budget={budget} />
    </section>
  )
}
