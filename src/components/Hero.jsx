import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white pt-16 overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          AI-Powered Business Validation
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
          Validate Your Business Idea
          <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Before You Invest a Rupee
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          StartupIQ analyzes your business idea using AI-driven insights to tell you
          what works, what doesn&apos;t, and exactly how to launch — so you stop guessing
          and start building with confidence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/validate"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5"
          >
            Validate My Idea →
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto text-slate-700 hover:text-indigo-600 font-semibold text-lg px-8 py-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors bg-white"
          >
            See How It Works
          </a>
        </div>

        <p className="mt-6 text-sm text-slate-400">No credit card required &nbsp;·&nbsp; Results in under 2 minutes</p>
      </div>
    </section>
  )
}
