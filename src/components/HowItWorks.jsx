import { ChartColumn, Lightbulb, Rocket, Search } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Lightbulb,
    title: 'Enter Your Idea',
    description:
      'Describe your business idea in plain language. No jargon needed. Just tell us what you want to sell or offer.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Structured AI Analysis',
    description:
      'Your idea is examined against a structured business framework — demand, competition, pricing, and startup costs — using what you described and general knowledge of the category.',
  },
  {
    number: '03',
    icon: ChartColumn,
    title: 'Understand Your Potential',
    description:
      'Get your Viability Score, strengths, risks, and a clear breakdown of profit potential and target audience.',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Get Your Launch Plan',
    description:
      'Receive a step-by-step action plan including sourcing options, pricing strategy, and a phased launch roadmap.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-accent-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">How It Works</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Four clear steps from idea to launch-ready plan. No experience required.
          </p>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto mt-3 leading-relaxed">
            StartupIQ works from what you tell us. It does not pull live market data, browse competitor
            listings, or verify prices — every figure is an AI estimate to check before you spend money.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-11 left-[calc(100%+1px)] w-full h-0.5 bg-gradient-to-r from-accent-200 to-transparent z-0" />
              )}
              <div className="relative z-10 bg-slate-50 hover:bg-accent-50 border border-slate-100 hover:border-accent-200 rounded-2xl p-6 h-full transition-colors group">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-accent-700 transition-colors group-hover:border-accent-200">
                  <step.icon size={20} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-accent-600 tracking-widest uppercase">Step {step.number}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2 group-hover:text-accent-700 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
