import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'

import { Cursor, Footer, Header, ScrollProgress } from './components/Chrome'
import { Preloader } from './components/Preloader'
import { SiteProvider } from './lib/site'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Project } from './pages/Project'
import { Studio } from './pages/Studio'
import { Work } from './pages/Work'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function Shell() {
  const location = useLocation()
  const inStudio = location.pathname.startsWith('/studio')

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[999] rounded-pill bg-ink px-5 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <ScrollProgress />
      {!inStudio && <Header />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route index element={<Home />} />
            <Route path="work" element={<Work />} />
            <Route path="work/:slug" element={<Project />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="studio" element={<Studio />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>

      {!inStudio && <Footer />}
      <Cursor />
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <SiteProvider>
          <Preloader />
          <ScrollToTop />
          <Shell />
        </SiteProvider>
      </MotionConfig>
    </BrowserRouter>
  )
}
