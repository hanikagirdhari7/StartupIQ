import { Navigate, Route, Routes } from 'react-router-dom'
import IdeaFormPage from './pages/IdeaFormPage'
import LandingPage from './pages/LandingPage'
import ResultsPage from './pages/ResultsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/validate" element={<IdeaFormPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
