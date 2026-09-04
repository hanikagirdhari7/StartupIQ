import { useLocation } from 'react-router-dom'

// The landing page shows sample dashboards, so it needs the illustrative wording by
// default. Pages backed by a real analysis pass their own copy instead.
export default function Footer({
  disclaimer = 'Sample scores and dashboards shown are illustrative only and do not represent real business analysis.',
}) {
  // These section ids only exist on the landing page, so off it the anchor has to
  // carry the path with it.
  const { pathname } = useLocation()
  const anchor = id => (pathname === '/' ? `#${id}` : `/#${id}`)

  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            <span className="text-white font-bold text-lg">StartupIQ</span>
          </div>

          <p className="text-sm text-center text-slate-500">
            Validate smarter. Launch faster. Build with confidence.
          </p>

          <div className="flex gap-6 text-sm font-medium">
            <a href={anchor('how-it-works')} className="hover:text-white transition-colors">How It Works</a>
            <a href={anchor('dashboard-preview')} className="hover:text-white transition-colors">Preview</a>
            <a href={anchor('cta')} className="hover:text-white transition-colors">Get Started</a>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center">
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} StartupIQ. All rights reserved.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 max-w-2xl mx-auto text-pretty">
            {disclaimer}
          </p>
        </div>
      </div>
    </footer>
  )
}
