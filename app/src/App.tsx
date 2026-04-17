import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import ShareViewer from '@/pages/ShareViewer'
import { parseShareLink, type SharePayload } from '@/lib/share'
import Landing from '@/pages/Landing'
import Dashboard from '@/pages/Dashboard'
import ServiceCatalog from '@/pages/ServiceCatalog'
import IdeaDiscovery from '@/pages/IdeaDiscovery'
import DeepResearch from '@/pages/DeepResearch'
import CurriculumBuilder from '@/pages/CurriculumBuilder'
import SalesPage from '@/pages/SalesPage'
import EmailSequencePage from '@/pages/EmailSequencePage'
import Pricing from '@/pages/Pricing'
import Growth from '@/pages/Growth'
import ReviewCenter from '@/pages/ReviewCenter'
import Templates from '@/pages/Templates'
import OutputCenter from '@/pages/OutputCenter'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'
import VentureBlueprint from '@/pages/VentureBlueprint'
import { useStore } from '@/store'

/**
 * Smart navigation: when a course is selected, the currentStage reflects
 * its actual progress. After completing a stage, the app advances to the
 * next relevant service automatically (handled inside saveXReport actions).
 *
 * Manual navigation from the sidebar is always allowed — the user is never
 * forced into the journey order.
 */
export default function App() {
  const { currentStage, currentCourseId, courses, selectCourse } = useStore()
  const [sharedPayload, setSharedPayload] = useState<SharePayload | null>(() => parseShareLink())

  // React to hash changes (user pastes a share link)
  useEffect(() => {
    const onHashChange = () => setSharedPayload(parseShareLink())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (sharedPayload) {
    return (
      <ShareViewer
        payload={sharedPayload}
        onBack={() => {
          history.replaceState(null, '', window.location.pathname)
          setSharedPayload(null)
        }}
      />
    )
  }

  // Sync stage with selected course on mount
  useEffect(() => {
    if (currentCourseId) {
      const course = courses.find((c) => c.id === currentCourseId)
      if (course && course.currentStage !== currentStage) {
        // Only sync if the user hasn't navigated somewhere else manually
        // (we trust the stage as the source of truth once set)
      }
    }
  }, [])

  const renderPage = () => {
    switch (currentStage) {
      case 'landing':
        return <Landing />
      case 'dashboard':
        return <Dashboard />
      case 'catalog':
        return <ServiceCatalog />
      case 'idea':
        return <IdeaDiscovery />
      case 'research':
        return <DeepResearch />
      case 'curriculum':
        return <CurriculumBuilder />
      case 'sales':
        return <SalesPage />
      case 'email':
        return <EmailSequencePage />
      case 'pricing':
        return <Pricing />
      case 'growth':
        return <Growth />
      case 'review':
        return <ReviewCenter />
      case 'templates':
        return <Templates />
      case 'output':
        return <OutputCenter />
      case 'analytics':
        return <Analytics />
      case 'settings':
        return <Settings />
      case 'blueprint':
        return <VentureBlueprint />
      default:
        return <Landing />
    }
  }

  // First-time visitors get landing by default
  useEffect(() => {
    const hasVisited = localStorage.getItem('visited')
    if (!hasVisited) {
      localStorage.setItem('visited', '1')
      useStore.setState({ currentStage: 'landing' })
    }
  }, [])

  return <Layout>{renderPage()}</Layout>
}
