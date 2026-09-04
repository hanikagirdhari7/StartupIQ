import { useEffect } from 'react'
import ClosingCTA from '../components/ClosingCTA'
import DashboardPreview from '../components/DashboardPreview'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Navbar from '../components/Navbar'
import ScorePreview from '../components/ScorePreview'

export default function LandingPage() {
  // Arriving from another page uses a root-relative hash, and on a full load the
  // browser tries to scroll before this tree exists. `scrollIntoView` still gets
  // the html `scroll-padding-top`, so the heading lands below the fixed navbar.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
    if (!id) return
    document.getElementById(id)?.scrollIntoView()
  }, [])

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
