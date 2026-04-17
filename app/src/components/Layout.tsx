import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/store'
import {
  LayoutDashboard,
  Home,
  Grid3x3,
  Lightbulb,
  Search,
  BookOpen,
  Megaphone,
  Mail,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  LibraryBig,
  PackageCheck,
  Globe,
  Moon,
  Sun,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Menu,
  BarChart3,
  Command,
  Settings as SettingsIcon,
  Package,
} from 'lucide-react'
import type { StageKey } from '@/types'

const navItems: { key: StageKey; icon: any; labelKey: string }[] = [
  { key: 'dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { key: 'landing', icon: Home, labelKey: 'nav.landing' },
  { key: 'catalog', icon: Grid3x3, labelKey: 'nav.catalog' },
  { key: 'idea', icon: Lightbulb, labelKey: 'nav.idea' },
  { key: 'research', icon: Search, labelKey: 'nav.research' },
  { key: 'curriculum', icon: BookOpen, labelKey: 'nav.curriculum' },
  { key: 'sales', icon: Megaphone, labelKey: 'nav.sales' },
  { key: 'email', icon: Mail, labelKey: 'nav.email' },
  { key: 'pricing', icon: DollarSign, labelKey: 'nav.pricing' },
  { key: 'growth', icon: TrendingUp, labelKey: 'nav.growth' },
  { key: 'review', icon: ShieldCheck, labelKey: 'nav.review' },
  { key: 'templates', icon: LibraryBig, labelKey: 'nav.templates' },
  { key: 'blueprint' as any, icon: Package, labelKey: 'nav.blueprint' },
  { key: 'output', icon: PackageCheck, labelKey: 'nav.output' },
  { key: 'analytics' as any, icon: BarChart3, labelKey: 'nav.analytics' },
  { key: 'settings' as any, icon: SettingsIcon, labelKey: 'nav.settings' },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation()
  const { currentStage, setStage, currentCourseId, courses } = useStore()
  const currentCourse = courses.find((c) => c.id === currentCourseId)

  return (
    <>
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200/70 dark:border-slate-800/70">
        <motion.div
          initial={{ rotate: -20, scale: 0.5 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/30"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
        <div className="font-display font-bold text-sm leading-tight min-w-0">
          <div className="gradient-text truncate" title={t('app.name') as string}>
            {t('app.nameShort')}
          </div>
          <div className="text-[10px] text-slate-500 font-normal truncate">
            {t('app.tagline')}
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ key, icon: Icon, labelKey }, idx) => {
          const active = currentStage === (key as any)
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => {
                setStage(key as any)
                onNavigate?.()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                active
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-0 rounded-xl bg-brand-600/20 blur-xl -z-10"
                />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{t(labelKey)}</span>
            </motion.button>
          )
        })}
      </nav>
      {currentCourse && (
        <div className="p-3 border-t border-slate-200/70 dark:border-slate-800/70">
          <div className="card p-3">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Active Course</div>
            <div className="font-semibold text-sm truncate">{currentCourse.name}</div>
            <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (Object.values(currentCourse.progress).filter(Boolean).length / 7) * 100
                  }%`,
                }}
                className="h-full bg-gradient-to-r from-brand-500 to-accent-500"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const { currentStage, theme, toggleTheme, toasts, dismissToast } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  // Cmd+K command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen flex bg-mesh-light dark:bg-mesh-dark">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-e border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 start-0 w-72 z-50 flex flex-col bg-white dark:bg-slate-950 border-e border-slate-200/70 dark:border-slate-800/70 lg:hidden"
            >
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="h-16 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl flex items-center justify-between px-4 sm:px-5 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="btn-ghost !p-2 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-bold text-lg"
            >
              {t(`nav.${currentStage}`, t('nav.dashboard'))}
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCmdOpen(true)}
              className="btn-ghost !p-2 hidden sm:flex items-center gap-2"
              aria-label="command"
            >
              <Command className="w-4 h-4" />
              <kbd className="text-[10px] font-mono text-slate-400 hidden md:inline">⌘K</kbd>
            </button>
            <button
              className="btn-ghost !p-2"
              onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
              aria-label="language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold">{i18n.language === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            <button className="btn-ghost !p-2" onClick={toggleTheme} aria-label="theme">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div
            key={currentStage}
            className="p-4 sm:p-5 md:p-8 max-w-7xl mx-auto animate-fadeInUp"
          >
            {children}
          </div>
        </main>
      </div>

      {/* Command palette */}
      <AnimatePresence>
        {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-6 inset-x-0 flex flex-col items-center gap-2 z-50 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon =
              toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? AlertCircle : Info
            const color =
              toast.kind === 'success'
                ? 'text-emerald-500'
                : toast.kind === 'error'
                ? 'text-rose-500'
                : 'text-brand-500'
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="card px-4 py-3 flex items-center gap-3 pointer-events-auto shadow-xl min-w-[280px]"
              >
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-sm flex-1">{toast.message}</span>
                <button onClick={() => dismissToast(toast.id)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ---------- Command Palette ----------
function CommandPalette({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const { setStage } = useStore()
  const [query, setQuery] = useState('')

  const filtered = navItems.filter((n) =>
    t(n.labelKey).toLowerCase().includes(query.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] flex items-start justify-center pt-24 p-4"
    >
      <motion.div
        initial={{ y: -20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: -10, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-200/70 dark:border-slate-800/70">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.search') as string}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8">No results</div>
          ) : (
            filtered.map(({ key, icon: Icon, labelKey }) => (
              <button
                key={key}
                onClick={() => {
                  setStage(key as any)
                  onClose()
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-start text-sm"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{t(labelKey)}</span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
