import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'

export default function ClosingCTA() {
  const navigate = useNavigate()

  return (
    <section id="cta" className="py-20 sm:py-24 bg-accent-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight tracking-tight text-balance">
          Stop Guessing. Start Knowing.
        </h2>
        <p className="text-accent-100 text-lg mb-9 leading-relaxed text-pretty">
          Your next business could be your best one, but only if you validate it first. Enter your
          idea to get a complete report with your score, unit economics, risks, and launch plan. It
          usually takes a minute or two.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate('/validate')}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-accent-700 font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            Validate Your Idea
          </button>
        </div>

        <p className="mt-7 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-sm font-medium text-accent-100">
          <span>No account to create</span>
          <span aria-hidden="true" className="hidden sm:block h-3.5 w-px bg-accent-600" />
          <span>Your reports stay in this browser</span>
        </p>

        <ul className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3 text-sm text-accent-100">
          {['Viability Score', 'Market Insights', 'Unit Economics', 'Step-by-Step Launch Plan'].map(item => (
            <li key={item} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5">
              <Check size={14} strokeWidth={2.5} className="text-accent-200" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
