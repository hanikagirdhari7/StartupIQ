import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center bg-gradient-to-b from-slate-50 to-white pt-24 pb-14 sm:pt-28 sm:pb-20 sm:min-h-screen overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent-200 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-accent-50 border border-accent-200 text-accent-700 text-sm font-medium px-4 py-1.5 rounded-full mb-5 sm:mb-6">
          <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" aria-hidden="true"></span>
          AI-Powered Business Validation
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.12] sm:leading-tight tracking-tight text-balance mb-5 sm:mb-6">
          Validate Your Business Idea
          <span className="block text-accent-700">
            Before You Invest a Rupee
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed text-pretty">
          StartupIQ turns your idea into a clear verdict — demand, competition, pricing, unit economics and
          the risks — and lays out the launch plan to act on it, so you stop guessing and start building
          with confidence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/validate"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 active:bg-accent-800 text-white font-bold text-base sm:text-lg px-8 py-3.5 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-accent-200 hover:-translate-y-0.5"
          >
            Validate Your Idea
            <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
          </Link>
          <a
            href="#dashboard-preview"
            className="w-full sm:w-auto text-slate-700 hover:text-accent-600 font-semibold text-base sm:text-lg px-8 py-3.5 sm:py-4 rounded-xl border border-slate-200 hover:border-accent-200 transition-colors bg-white"
          >
            Explore Sample Report
          </a>
        </div>

        <p className="mt-5 sm:mt-6 text-sm text-slate-400 leading-relaxed text-balance">
          <span className="whitespace-nowrap">AI-powered validation</span>{' '}
          <span className="whitespace-nowrap">
            <span className="text-slate-300" aria-hidden="true">
              •
            </span>{' '}
            Financial clarity
          </span>{' '}
          <span className="whitespace-nowrap">
            <span className="text-slate-300" aria-hidden="true">
              •
            </span>{' '}
            Actionable launch plan
          </span>
        </p>
      </div>
    </section>
  )
}
