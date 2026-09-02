import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center bg-gradient-to-b from-slate-50 to-white pt-24 pb-14 sm:pt-28 sm:pb-20 sm:min-h-screen overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-5 sm:mb-6">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" aria-hidden="true"></span>
          AI-Powered Business Validation
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.12] sm:leading-tight tracking-tight text-balance mb-5 sm:mb-6">
          Validate Your Business Idea
          <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Before You Invest a Rupee
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed text-pretty">
          StartupIQ analyzes your business idea using AI-driven insights to show you
          what works, what doesn&apos;t, and how to plan your first steps — so you stop guessing
          and start building with confidence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/validate"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base sm:text-lg px-8 py-3.5 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5"
          >
            Validate My Idea <span aria-hidden="true">→</span>
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto text-slate-700 hover:text-indigo-600 font-semibold text-base sm:text-lg px-8 py-3.5 sm:py-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors bg-white"
          >
            See How It Works
          </a>
        </div>

        <p className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm text-slate-400">
          <span>No credit card required</span>
          <span aria-hidden="true">·</span>
          <span>Analysis usually takes a minute or two</span>
        </p>
      </div>
    </section>
  )
}
