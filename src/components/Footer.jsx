export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            <span className="text-white font-bold text-lg">StartupIQ</span>
          </div>

          <p className="text-sm text-center text-slate-500">
            Validate smarter. Launch faster. Build with confidence.
          </p>

          <div className="flex gap-6 text-sm">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#dashboard-preview" className="hover:text-white transition-colors">Preview</a>
            <a href="#cta" className="hover:text-white transition-colors">Get Started</a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} StartupIQ. All rights reserved. &nbsp;·&nbsp;
          Sample scores and dashboards shown are illustrative only and do not represent real business analysis.
        </div>
      </div>
    </footer>
  )
}
