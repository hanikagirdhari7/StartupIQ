import { useNavigate } from 'react-router-dom'

export default function ClosingCTA() {
  const navigate = useNavigate()

  return (
    <section id="cta" className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
          Stop Guessing. Start Knowing.
        </h2>
        <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
          Your next business could be your best one — but only if you validate it first.
          Enter your idea and get a full AI-powered analysis in under 2 minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/validate')}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-indigo-700 font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            Validate My Idea — It&apos;s Free
          </button>
        </div>

        <p className="mt-6 text-indigo-200 text-sm">
          Join early users getting ahead of the market &nbsp;·&nbsp; No signup needed to try
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-indigo-200">
          <div className="flex items-center gap-2"><span>✅</span> AI-Powered Analysis</div>
          <div className="flex items-center gap-2"><span>✅</span> Viability Score</div>
          <div className="flex items-center gap-2"><span>✅</span> Market Insights</div>
          <div className="flex items-center gap-2"><span>✅</span> Step-by-Step Launch Plan</div>
        </div>
      </div>
    </section>
  )
}
