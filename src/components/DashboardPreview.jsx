import { Link } from 'react-router-dom'
import { CircleCheck, Lightbulb, Lock, TriangleAlert } from 'lucide-react'

function MetricCard({ label, value, trend, tone = 'slate' }) {
  const tones = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-300',
  }
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 tabular-nums leading-tight break-words">{value}</p>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full shrink-0 ${tones[tone] || tones.slate}`} />
        <span className="min-w-0">{trend}</span>
      </p>
    </div>
  )
}

function InsightRow({ icon: Icon, label, text, type }) {
  const styles = {
    strength: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    risk: 'bg-amber-50 border-amber-200 text-amber-700',
    tip: 'bg-accent-50 border-accent-200 text-accent-700',
  }
  return (
    <div className={`p-4 rounded-xl border min-w-0 ${styles[type]}`}>
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-1.5">
        <Icon size={14} strokeWidth={2} aria-hidden="true" />
        {label}
      </p>
      <p className="text-sm leading-snug text-pretty">{text}</p>
    </div>
  )
}

export default function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-accent-600 font-semibold text-sm uppercase tracking-widest mb-3">Dashboard Preview</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 text-balance">
            Practical Feasibility, Built for Early Founders
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-pretty">
            Clear demand scoring, unit economics, and step-by-step launch roadmaps tailored to your market.
          </p>
        </div>

        {/* Dashboard mock */}
        <div className="bg-white rounded-card shadow-raise border border-slate-200 overflow-hidden">
          {/* Title bar */}
          <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="ml-3 text-slate-400 text-xs font-mono min-w-0 truncate">startupiq.app/results</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium shrink-0 whitespace-nowrap">Interactive Demo</span>
          </div>

          <div className="p-6 sm:p-8">
            {/* Idea header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Business idea</p>
                <h3 className="text-xl font-bold text-slate-900 leading-snug text-balance break-words">
                  “Online Women’s Clothing Boutique”
                </h3>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-500">
                  <span>Ecommerce</span>
                  <span aria-hidden="true" className="h-3.5 w-px bg-slate-200 shrink-0" />
                  <span>Lahore, Pakistan</span>
                  <span aria-hidden="true" className="h-3.5 w-px bg-slate-200 shrink-0" />
                  <span className="break-words">Budget PKR 150,000</span>
                </p>
              </div>
              <div className="bg-accent-50 border border-accent-200 rounded-xl px-5 py-3 shrink-0 text-center sm:text-right">
                <p className="text-[11px] text-accent-700 font-bold uppercase tracking-wider">Viability Score</p>
                <p className="text-4xl font-extrabold text-accent-700 leading-none tabular-nums">
                  78<span className="text-base font-bold text-accent-600">/100</span>
                </p>
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard label="Market Demand" value="High" trend="85/100 in the breakdown" tone="emerald" />
              <MetricCard label="Competition" value="High" trend="35/100 in a crowded market" tone="amber" />
              <MetricCard label="Margin per Sale" value="PKR 2,100" trend="35% after its full cost" tone="emerald" />
              <MetricCard label="Break-even" value="32 sales" trend="Covers PKR 67,000 setup" tone="slate" />
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <InsightRow
                icon={CircleCheck}
                label="Demand"
                type="strength"
                text="Strong demand for affordable, trend-led women’s fashion through Instagram, TikTok and online marketplaces."
              />
              <InsightRow
                icon={TriangleAlert}
                label="Risk"
                type="risk"
                text="The market is crowded and price-sensitive. Product selection, sizing consistency and reliable delivery need to stand out."
              />
              <InsightRow
                icon={Lightbulb}
                label="Action"
                type="tip"
                text="Start with a focused collection and small inventory. Test demand through Instagram and WhatsApp, then scale the best-selling styles."
              />
            </div>

            {/* Blurred launch plan teaser */}
            <div className="relative rounded-xl border border-slate-100 overflow-hidden">
              <div className="blur-sm pointer-events-none select-none p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Your Launch Kit</p>
                <div className="space-y-2">
                  {['Week 1: Validate with 10 potential customers via Instagram DMs', 'Week 2: Compare 3 wholesale clothing suppliers on price and sizing', 'Week 3: Create product photos & launch Daraz storefront', 'Week 4: Run first PKR 2,000 ad campaign targeting women aged 18–35'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-4 h-4 rounded-full border-2 border-accent-300 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-slate-700 font-bold text-lg mb-2">This is what your launch plan looks like</p>
                  <Link to="/validate" className="inline-flex items-center gap-1.5 bg-accent-600 hover:bg-accent-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                    <Lock size={13} strokeWidth={1.75} aria-hidden="true" />
                    Validate Your Idea
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          * This preview uses fictional data. Your actual report is built from the idea and details you enter.
        </p>
      </div>
    </section>
  )
}
