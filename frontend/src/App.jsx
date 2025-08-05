import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { RootLayout } from '@/components/RootLayout'
import { TranslationProvider } from '@/context/TranslationContext'

// Pages
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import WorkPage from '@/pages/WorkPage'
import ProcessPage from '@/pages/ProcessPage'
import JobPage from '@/pages/JobPage'
import ContactPage from '@/pages/ContactPage'

function App() {
  const location = useLocation()

  return (
    <TranslationProvider>
      <RootLayout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/:locale" element={<HomePage />} />
            <Route path="/:locale/about" element={<AboutPage />} />
            <Route path="/:locale/work" element={<WorkPage />} />
            <Route path="/:locale/process" element={<ProcessPage />} />
            <Route path="/:locale/job" element={<JobPage />} />
            <Route path="/:locale/contact" element={<ContactPage />} />
            {/* Fallback routes without locale */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/process" element={<ProcessPage />} />
            <Route path="/job" element={<JobPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </AnimatePresence>
      </RootLayout>
    </TranslationProvider>
  )
}

export default App