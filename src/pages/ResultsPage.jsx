import { useEffect, useMemo } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import AICoach from '../components/AICoach'
import DecisionCard from '../components/dashboard/DecisionCard'
import FinancialFitCard from '../components/dashboard/FinancialFitCard'
import InsightCard, { InsightRow, LevelBadge } from '../components/dashboard/InsightCard'
import LaunchKitCard from '../components/dashboard/LaunchKitCard'
import ListCard from '../components/dashboard/ListCard'
import RecentReportsCard from '../components/dashboard/RecentReportsCard'
import ReportHeader from '../components/dashboard/ReportHeader'
import ScoreBreakdownCard from '../components/dashboard/ScoreBreakdownCard'
import ScoreCard from '../components/dashboard/ScoreCard'
import SourcingCard from '../components/dashboard/SourcingCard'
import { ArrowRight, House } from 'lucide-react'
import { getLatestReport, getReport, saveReport } from '../services/storage'

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const fresh = location.state && location.state.analysis && location.state.idea ? location.state : null

  useEffect(() => { window.scrollTo(0, 0) }, [location.key])

  // Saved while rendering, not in an effect, so the recent-reports list holds
  // this report on its first pass. The id comes from the report itself, so the
  // double render in development cannot store one analysis twice.
  const savedId = useMemo(() => (fresh ? saveReport(fresh) : null), [fresh])

  // A refresh, a back gesture or a bookmarked link carries no router state.
  // Recover what this device already holds instead of dropping the founder back
  // at the form — and invent nothing when no report was ever saved here.
  let report = fresh
  let currentId = savedId
  if (!report) {
    const requestedId = new URLSearchParams(location.search).get('report')
    const stored = requestedId ? getReport(requestedId) : null
    if (stored) {
      report = stored.report
      currentId = stored.id
    } else {
      const latest = getLatestReport()
      if (latest) {
        report = latest.report
        currentId = latest.id
      }
    }
  }

  if (!report) {
    return <Navigate to="/validate" replace />
  }

  const { analysis, idea } = report
  const market = analysis.marketDemand || {}
  const customer = analysis.targetCustomerAnalysis || {}
  const competition = analysis.competition || {}
  const pricing = analysis.pricingRecommendation || {}
  const sourcing = analysis.sourcingRecommendation || {}

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20 bg-gradient-to-b from-slate-50 to-white min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <ReportHeader idea={idea} meta={report} />
          <ScoreCard score={analysis.viabilityScore} />

          <ScoreBreakdownCard analysis={analysis} idea={idea} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InsightCard title="Market Demand" badge={<LevelBadge level={market.level} />}>
              <InsightRow label="Why this level">{market.explanation}</InsightRow>
              <InsightRow label="Opportunity to fill">{market.opportunity}</InsightRow>
            </InsightCard>

            <InsightCard title="Competition" badge={<LevelBadge level={competition.level} tone="risk" />}>
              <InsightRow label="Existing alternatives">{competition.existingAlternatives}</InsightRow>
              <InsightRow label="Startup opportunity">{competition.differentiation}</InsightRow>
            </InsightCard>

            <InsightCard title="Target Customer">
              <InsightRow label="Primary customer">{customer.primaryCustomer}</InsightRow>
              <InsightRow label="What they need">{customer.needs}</InsightRow>
              <InsightRow label="Buying factors">{customer.buyingFactors}</InsightRow>
            </InsightCard>

            <InsightCard title="Pricing Recommendation">
              <InsightRow label="Suggested range">{pricing.suggestedRange}</InsightRow>
              <InsightRow label="Why this range">{pricing.reason}</InsightRow>
            </InsightCard>
          </div>

          <FinancialFitCard key={`financial-${currentId}`} financialFit={analysis.financialFit} budget={idea.budgetPKR} />

          <SourcingCard sourcing={sourcing} location={idea.location} />

          <ListCard title="Risks To Watch" items={analysis.risks} variant="risks" />

          <LaunchKitCard
            key={`launch-kit-${currentId}`}
            analysis={analysis}
            idea={idea}
            analyzedAt={report.analyzedAt}
            reportId={currentId}
            initialChecked={report.launchKit && report.launchKit.checked}
          />

          <DecisionCard analysis={analysis} idea={idea} />

          <RecentReportsCard currentId={currentId} />

          <AICoach key={`coach-${currentId}`} reportData={report} />

          <div className="bg-accent-600 rounded-card shadow-raise p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">Ready for the next step?</h2>
            <p className="text-accent-100 mb-6 max-w-xl">
              Work through your Launch Kit step by step, or validate another idea while this report
              is still fresh.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/validate')}
                className="inline-flex items-center gap-2 bg-white text-accent-700 font-bold px-6 py-3 rounded-xl hover:bg-accent-50 transition-colors"
              >
                Validate Another Idea
                <ArrowRight size={17} strokeWidth={2.25} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 border border-accent-400 text-white font-semibold px-6 py-3 rounded-xl hover:bg-accent-700 transition-colors"
              >
                <House size={17} strokeWidth={2} aria-hidden="true" />
                Back to Home
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 pt-2">
            StartupIQ reports are AI-generated from the details you provide. Prices, timelines and
            estimates are guidance to research further, not verified live market data.
          </p>
        </div>
      </main>
      <Footer disclaimer="AI-generated guidance based on the information provided. Verify key assumptions and figures before making business or financial decisions." />
    </div>
  )
}
