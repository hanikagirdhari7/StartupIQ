import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav aria-label="Main" className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            <span className="text-xl font-bold text-slate-900">StartupIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-accent-600 transition-colors">How It Works</a>
            <a href="#dashboard-preview" className="text-sm text-slate-600 hover:text-accent-600 transition-colors">Preview</a>
          </div>
          <Link
            to="/validate"
            className="bg-accent-600 hover:bg-accent-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
