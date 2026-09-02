import { Link } from 'react-router-dom'

function MetricCard({ label, value, trend, trendUp }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className={`text-xs font-semibold mt-1 ${trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>{trend}</p>
    </div>
  )
}

function InsightRow({ icon, text, type }) {
  const styles = {
    strength: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    risk: 'bg-rose-50 border-rose-200 text-rose-800',
    tip: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  }
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${styles[type]}`}>
      <span className="text-lg leading-none mt-0.5">{icon}</span>
      <span className="leading-snug">{text}</span>
    </div>
  )
}

export default function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Dashboard Preview</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Everything You Need in One Place
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            A report covers market demand, competition, pricing, financial fit, sourcing and a launch
            roadmap — all estimated from what you describe.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <span className="bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest text-center">
            Sample / Illustrative Preview — Not Real Data
          </span>
        </div>

        {/* Dashboard mock */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Title bar */}
          <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="ml-3 text-slate-400 text-xs font-mono">startupiq.app/results</span>
          </div>

          <div className="p-6 sm:p-8">
            {/* Idea header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Analyzing idea:</p>
                <h3 className="text-xl font-bold text-slate-900">"Handmade Leather Accessories Store"</h3>
                <p className="text-sm text-slate-500 mt-1">Ecommerce · Lahore, Pakistan · Budget PKR 120,000</p>
              </div>
              <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3 shrink-0">
                <div>
                  <p className="text-xs text-indigo-500 font-medium">Viability Score</p>
                  <p className="text-4xl font-extrabold text-indigo-700 leading-none">74</p>
                </div>
                <div className="text-2xl">📈</div>
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <MetricCard label="Market Demand" value="High" trend="85/100 in the breakdown" trendUp />
              <MetricCard label="Competition" value="Moderate" trend="60/100 room to enter" trendUp={false} />
              <MetricCard label="Profit per Sale" value="PKR 1,850" trend="≈41% of each sale" trendUp />
              <MetricCard label="Break-even" value="28 sales" trend="Covers PKR 50,000 setup" trendUp={false} />
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <InsightRow icon="✅" text="High demand in gifting & lifestyle niches on Daraz & social media" type="strength" />
              <InsightRow icon="⚠️" text="Pricing pressure from Chinese imports — differentiate on quality/story" type="risk" />
              <InsightRow icon="💡" text="Start with Instagram + WhatsApp before investing in a full website" type="tip" />
            </div>

            {/* Blurred launch plan teaser */}
            <div className="relative rounded-xl border border-slate-100 overflow-hidden">
              <div className="blur-sm pointer-events-none select-none p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Your Launch Roadmap</p>
                <div className="space-y-2">
                  {['Week 1: Validate with 10 potential customers via Instagram DMs', 'Week 2: Source materials from Liberty Market or Alibaba (3 suppliers compared)', 'Week 3: Create product photos & launch Daraz storefront', 'Week 4: Run first Rs.2000 ad campaign — target gifting audience'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-4 h-4 rounded-full border-2 border-indigo-300 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-slate-700 font-bold text-lg mb-2">🔒 Full Launch Plan Included</p>
                  <Link to="/validate" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                    Validate My Idea to Unlock
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
