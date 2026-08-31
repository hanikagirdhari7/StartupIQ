import ClosingCTA from '../components/ClosingCTA'
import DashboardPreview from '../components/DashboardPreview'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Navbar from '../components/Navbar'
import ScorePreview from '../components/ScorePreview'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ScorePreview />
        <HowItWorks />
        <DashboardPreview />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  )
}
