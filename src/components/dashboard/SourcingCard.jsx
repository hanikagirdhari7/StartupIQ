import { useState } from 'react'
import { ArrowRight, Package, Target } from 'lucide-react'
import SourceTag from './SourceTag'

// Route vocabulary comes from the analysis (server/schemas/analysisResponse.js).
// An unknown id still renders, just with a prettified id instead of a label.
const ROUTES = {
  localSuppliers: {
    label: 'Local Pakistan suppliers',
    blurb: 'Wholesalers, markets and makers in your own city.',
    action: 'Find Local Suppliers',
    // Documented Google Maps URL API, fed only with the category words already in
    // the analysis plus the founder's own location. It opens a map search, not a
    // StartupIQ supplier list.
    useLocation: true,
    search: query => `https://www.google.com/maps/search/?api=1&query=${query}`,
  },
  directManufacturers: {
    label: 'Direct manufacturers',
    blurb: 'Buy straight from the factory that makes the product.',
  },
  distributors: {
    label: 'Distributors and wholesalers',
    blurb: 'They already import and hold stock close to you.',
  },
  regionalImporters: {
    label: 'Regional importers',
    blurb: 'Suppliers nearer Pakistan than China.',
  },
  dropshipping: {
    label: 'Dropshipping',
    blurb: 'The supplier ships each order straight to your customer.',
  },
  alibaba: {
    label: 'Alibaba',
    blurb: 'Bulk orders from manufacturers, usually overseas.',
    action: 'Search Alibaba',
    search: query => `https://www.alibaba.com/trade/search?SearchText=${query}`,
  },
  aliexpress: {
    label: 'AliExpress',
    blurb: 'Small trial orders and samples, shipped to you.',
    action: 'Search AliExpress',
    search: query => `https://www.aliexpress.com/wholesale?SearchText=${query}`,
  },
  '1688': {
    label: '1688',
    blurb: 'Domestic Chinese wholesale - low prices, harder to use from abroad.',
    action: 'Explore 1688',
    search: query => `https://s.1688.com/selloffer/offer_search.htm?keywords=${query}`,
  },
  turkey: {
    label: 'Turkey suppliers',
    blurb: 'Clothing, fabric and homeware made closer to Pakistan.',
  },
  uae: {
    label: 'UAE and Dubai suppliers',
    blurb: 'Re-export hubs with short shipping to Pakistan.',
  },
}

const POSITIVE = /low|easy|good|simple|fast|quick/i
const HARD = /high|difficult|hard|slow|complex|costly/i
const CAUTION = /medium|moderate|limited|average|partial/i

const TONE_CLASSES = {
  positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  caution: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-rose-50 text-rose-700 border-rose-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
}

function routeConfig(id) {
  return ROUTES[id] || null
}

function routeLabel(id) {
  const config = routeConfig(id)
  if (config) return config.label
  return String(id || 'Option')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/^\w/, letter => letter.toUpperCase())
}

function clampScore(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(100, Math.max(0, Math.round(number))) : 0
}

function toneFor(value) {
  const text = String(value || '')
  if (POSITIVE.test(text)) return 'positive'
  if (HARD.test(text)) return 'hard'
  if (CAUTION.test(text)) return 'caution'
  return 'neutral'
}

// Links are built here from a fixed platform list, never taken from the model,
// so no invented URL can reach the page.
//
// `searchTerms` is still model prose, and it can carry the fulfilment wording meant
// for the card body — "(Nationwide via courier delivery)" — straight into a search
// box, where only the product words are useful. Hyphens inside a phrase and the
// comma between a city and its country survive; brackets, delivery asides and
// clause-ending punctuation do not. The bracket patterns allow a missing closer
// because the model sometimes truncates its own parenthetical, and a half-written
// "(" would otherwise carry the whole explanation into the query.
const SEARCH_NOISE = [
  /\([^)]*\)?/g,
  /\[[^\]]*\]?/g,
  /\{[^}]*\}?/g,
  // The same aside unpunctuated: "with nationwide delivery across Pakistan via
  // courier". Bounded by punctuation so it stops at the end of its own clause.
  /\bwith\s+[^,.;:!)]*\b(?:delivery|shipping|courier|dispatch|freight|post)\b[^,.;:!)]*/gi,
  /\b(?:via|by|through)\s+(?:courier|delivery|post|air|sea|road)(?:\s+delivery)?\b/gi,
  /\b(?:nationwide|countrywide|statewide|door[\s-]*to[\s-]*door(?:\s+(?:delivery|shipping))?|home\s+delivery|online\s+delivery|doorstep\s+delivery|cash\s+on\s+delivery|cod)\b/gi,
  /\b(?:all|everywhere)\s+(?:over|across|in)\s+(?:the\s+)?(?:country|nation|city)\b/gi,
]

function cleanSearchTerms(value) {
  let text = String(value || '')
  for (const pattern of SEARCH_NOISE) text = text.replace(pattern, ' ')
  return text
    .replace(/[()[\]{}]+/g, ' ')
    .replace(/[;:.!?]+/g, ' ')
    .replace(/\s+[-–—/|]\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[-–—/&]+|[-–—/&]+$/g, '')
    .replace(/,+$/, '')
    .trim()
}

function searchLink(route, location) {
  const config = routeConfig(route.route)
  const terms = cleanSearchTerms(route.searchTerms)
  if (!config || typeof config.search !== 'function' || !terms) return null
  const query = config.useLocation && location ? `${terms} ${location}` : terms
  return {
    href: config.search(encodeURIComponent(query)),
    label: config.action || 'Find Products',
    terms: query,
  }
}

function Trait({ label, value }) {
  if (!value) return null
  return (
    <span className={`border rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[toneFor(value)]}`}>
      {label}: {value}
    </span>
  )
}

function Point({ label, value }) {
  if (!value) return null
  return (
    <div className="bg-white rounded-xl border border-accent-100 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-accent-700 mb-1">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
    </div>
  )
}

function NextStep({ text }) {
  if (!text) return null
  return (
    <div className="mt-6 rounded-xl bg-accent-600 p-5 text-white">
      <p className="text-[11px] font-bold uppercase tracking-widest text-accent-200 mb-1">Next step</p>
      <p className="text-lg font-bold leading-snug">{text}</p>
    </div>
  )
}

function PlatformLink({ link, variant = 'solid' }) {
  const styles = variant === 'solid'
    ? 'bg-accent-600 hover:bg-accent-700 text-white'
    : 'bg-white hover:bg-accent-50 text-accent-700 border border-accent-200'
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors ${styles}`}
      >
        {link.label}
        <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" />
      </a>
      <span className="text-xs text-slate-500">Searches &ldquo;{link.terms}&rdquo;</span>
    </span>
  )
}

function Card({ children }) {
  return (
    <section className="surface-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="flex items-center gap-2.5 card-title">
          <Package size={18} strokeWidth={1.75} className="text-accent-600 shrink-0" aria-hidden="true" />
          Smart Sourcing
        </h3>
        <SourceTag source="ai" />
      </div>
      {children}
    </section>
  )
}

export default function SourcingCard({ sourcing, location: ideaLocation }) {
  const [openRoutes, setOpenRoutes] = useState([])
  const data = sourcing || {}
  const routes = Array.isArray(data.routes) ? data.routes.filter(route => route && route.route) : []
  const digital = Array.isArray(data.digitalResources) ? data.digitalResources.filter(Boolean) : []

  function toggleDetails(id) {
    setOpenRoutes(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  if (typeof data.needsPhysicalProducts !== 'boolean') {
    return (
      <Card>
        <p className="text-sm text-slate-500">
          Sourcing guidance was not included in this analysis.
        </p>
      </Card>
    )
  }

  // Non-physical ideas get a plain answer, not a forced product comparison.
  if (data.needsPhysicalProducts === false || routes.length === 0) {
    return (
      <Card>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
          <p className="font-bold text-slate-900 mb-1">
            Physical product sourcing isn&apos;t applicable to this business.
          </p>
          {data.summary && <p className="text-slate-600 leading-relaxed">{data.summary}</p>}
        </div>
        {digital.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              What you need instead
            </p>
            <ul className="space-y-2">
              {digital.map((item, index) => (
                <li key={`digital-${index}`} className="flex gap-2">
                  <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-accent-500" />
                  <span className="text-slate-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <NextStep text={data.nextStep} />
      </Card>
    )
  }

  const bestIndex = Math.max(0, routes.findIndex(route => route.route === data.recommendedRoute))
  const best = routes[bestIndex]
  const alternatives = routes
    .filter((route, index) => index !== bestIndex)
    .sort((a, b) => clampScore(b.fitScore) - clampScore(a.fitScore))
  const bestLink = searchLink(best, ideaLocation)
  const bestScore = clampScore(best.fitScore)

  return (
    <Card>
      {data.summary && <p className="text-slate-600 leading-relaxed mb-6 text-pretty">{data.summary}</p>}

      {/* The single decision first; everything else supports it. */}
      <div className="rounded-card border-2 border-accent-600 bg-accent-50/60 p-5 sm:p-6">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent-700 mb-3">
          <Target size={13} strokeWidth={2} aria-hidden="true" />
          Best sourcing option
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Package size={22} strokeWidth={1.75} className="text-accent-700 shrink-0" aria-hidden="true" />
          <h4 className="text-xl font-extrabold text-slate-900 leading-tight break-words">
            {routeLabel(best.route)}
          </h4>
          <span className="bg-white border border-accent-200 text-accent-700 rounded-full px-3 py-1 text-xs font-bold tabular-nums">
            {bestScore}/100 fit for you
          </span>
        </div>
        <div className="h-2 max-w-xs bg-white rounded-full overflow-hidden mt-3 mb-4">
          <div className="h-full bg-accent-600 rounded-full" style={{ width: `${bestScore}%` }} />
        </div>
        {best.why && <p className="text-slate-700 leading-relaxed mb-5">{best.why}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Point label="Main advantage" value={best.advantage} />
          <Point label="Main limitation" value={best.limitation} />
          <Point label="Switch when" value={best.switchWhen} />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {bestLink && <PlatformLink link={bestLink} />}
          {best.searchTerms && !bestLink && (
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Search for: </span>
              {best.searchTerms}
            </p>
          )}
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="mt-7">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            Your alternatives
          </p>
          <div className="space-y-3">
            {alternatives.map(route => {
              const link = searchLink(route, ideaLocation)
              const isOpen = openRoutes.includes(route.route)
              return (
                <div key={route.route} className="rounded-xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="font-bold text-slate-900 break-words">{routeLabel(route.route)}</h5>
                    <span className="text-xs font-semibold text-slate-500 tabular-nums">
                      {clampScore(route.fitScore)}/100 fit
                    </span>
                  </div>
                  {routeConfig(route.route) && (
                    <p className="text-sm text-slate-500 mt-1">{routeConfig(route.route).blurb}</p>
                  )}
                  {route.why && (
                    <p className="text-sm text-slate-600 leading-relaxed mt-2 mb-3">{route.why}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {route.bestFor && (
                      <span className="bg-accent-50 text-accent-700 border border-accent-100 rounded-full px-3 py-1 text-xs font-semibold">
                        {route.bestFor}
                      </span>
                    )}
                    <Trait label="MOQ" value={route.moq} />
                    <Trait label="Shipping" value={route.shipping} />
                    <Trait label="Customising" value={route.customization} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {link && <PlatformLink link={link} variant="outline" />}
                    {!link && route.searchTerms && (
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">Search for: </span>
                        {route.searchTerms}
                      </p>
                    )}
                    {route.detail && (
                      <button
                        type="button"
                        onClick={() => toggleDetails(route.route)}
                        aria-expanded={isOpen}
                        className="text-sm font-semibold text-accent-600 hover:text-accent-800"
                      >
                        {isOpen ? 'Hide details' : 'See details'}
                      </button>
                    )}
                  </div>
                  {isOpen && route.detail && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-sm text-slate-600 leading-relaxed">{route.detail}</p>
                      {route.limitation && (
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold text-slate-800">Watch out: </span>
                          {route.limitation}
                        </p>
                      )}
                      {route.switchWhen && (
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold text-slate-800">Move on when: </span>
                          {route.switchWhen}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <NextStep text={data.nextStep} />

      <p className="mt-4 text-xs text-slate-400 leading-relaxed">
        Each button opens the platform&apos;s own search results for the words shown, or Google Maps
        for local options. StartupIQ does not list, rank or endorse specific suppliers, and prices,
        minimum orders and delivery times only appear once you search for yourself.
      </p>
    </Card>
  )
}
