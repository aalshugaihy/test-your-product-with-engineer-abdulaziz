import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import './i18n'

// MotionConfig with reducedMotion="user" respects prefers-reduced-motion.
// We also run animations instantly when the page is hidden (prevents stuck
// opacity:0 states in headless/background browsers where rAF is throttled).
const instant = typeof document !== 'undefined' && document.hidden

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion={instant ? 'always' : 'user'}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </MotionConfig>
  </React.StrictMode>,
)
