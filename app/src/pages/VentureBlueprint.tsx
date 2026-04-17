import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Package,
  CheckCircle2,
  Circle,
  Lightbulb,
  Search,
  BookOpen,
  Megaphone,
  Mail,
  DollarSign,
  TrendingUp,
  Sparkles,
  Crown,
} from 'lucide-react'
import { useStore } from '@/store'
import { exportCourseBundle } from '@/lib/export'
import ShareButton from '@/components/ShareButton'
import ExportMenu from '@/components/ExportMenu'
import { exportJSON } from '@/lib/export'

/**
 * Final Venture Blueprint — a consolidated, story-driven view of everything
 * the user has built for a course. Acts as the "executive summary" of a
 * complete journey, and a launchpad for the full-bundle PDF export.
 */
export default function VentureBlueprint() {
  const { t } = useTranslation()
  const {
    currentCourseId,
    courses,
    curricula,
    ideas,
    research,
    salesPages,
    emailSequences,
    pricingPackages,
    growthPlans,
    toast,
    selectCourse,
    setStage,
  } = useStore()

  if (!currentCourseId) {
    // No course selected — pick one
    return (
      <div className="space-y-6">
        <Header />
        <div className="card p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h2 className="font-display font-bold text-xl mb-2">
            {t('blueprint.chooseCourse')}
          </h2>
          <p className="text-slate-500 text-sm mb-6">{t('blueprint.chooseCourseDesc')}</p>
          {courses.length === 0 ? (
            <button onClick={() => setStage('idea')} className="btn-primary">
              <Sparkles className="w-4 h-4" />
              {t('blueprint.startFirst')}
            </button>
          ) : (
            <div className="space-y-2 max-w-md mx-auto">
              {courses.map((c) => {
                const done = Object.values(c.progress).filter(Boolean).length
                return (
                  <button
                    key={c.id}
                    onClick={() => selectCourse(c.id)}
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 transition text-start flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white font-bold flex items-center justify-center">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-xs text-slate-500">{done}/7 stages</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  const course = courses.find((c) => c.id === currentCourseId)!
  const idea = ideas[currentCourseId]
  const rsh = research[currentCourseId]
  const curriculum = curricula[currentCourseId]
  const sales = salesPages[currentCourseId]
  const email = emailSequences[currentCourseId]
  const pricing = pricingPackages[currentCourseId]
  const growth = growthPlans[currentCourseId]

  const stages = [
    { key: 'idea', label: t('nav.idea'), icon: Lightbulb, data: idea, gradient: 'from-amber-400 to-orange-500' },
    { key: 'research', label: t('nav.research'), icon: Search, data: rsh, gradient: 'from-cyan-400 to-blue-500' },
    { key: 'curriculum', label: t('nav.curriculum'), icon: BookOpen, data: curriculum, gradient: 'from-brand-500 to-indigo-600' },
    { key: 'sales', label: t('nav.sales'), icon: Megaphone, data: sales, gradient: 'from-pink-500 to-rose-500' },
    { key: 'email', label: t('nav.email'), icon: Mail, data: email, gradient: 'from-violet-500 to-purple-600' },
    { key: 'pricing', label: t('nav.pricing'), icon: DollarSign, data: pricing, gradient: 'from-emerald-400 to-green-600' },
    { key: 'growth', label: t('nav.growth'), icon: TrendingUp, data: growth, gradient: 'from-teal-400 to-cyan-600' },
  ]

  const completed = stages.filter((s) => s.data).length
  const total = stages.length
  const percent = Math.round((completed / total) * 100)

  const bundle = {
    courseName: course.name,
    curriculum,
    idea,
    sales,
    email,
    pricing,
    growth,
  }

  const handleBundleExport = () => {
    exportCourseBundle(bundle)
    toast('جاري تصدير الحزمة الكاملة...', 'info')
  }

  return (
    <div className="space-y-6">
      <Header />

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 text-white border-0"
      >
        <div className="absolute -top-10 -end-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -start-10 w-60 h-60 bg-accent-400/30 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-200" />
            <span className="text-xs uppercase tracking-[0.2em] opacity-80">
              {t('blueprint.title')}
            </span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-2">{course.name}</h1>
          <p className="text-sm opacity-80 max-w-2xl">{t('blueprint.heroDesc')}</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span>{t('blueprint.completion')}</span>
                <span className="font-bold tabular-nums">
                  {completed}/{total} · {percent}%
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-amber-200 to-white rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={handleBundleExport}
              className="btn bg-white text-brand-700 hover:bg-white/90 font-bold"
            >
              <Package className="w-4 h-4" />
              {t('blueprint.exportBundle')}
            </button>
            <div className="[&_button]:!bg-white/10 [&_button]:!text-white [&_button]:!border-white/20">
              <ShareButton
                kind="bundle"
                title={`${course.name} — Complete Venture Blueprint`}
                data={bundle}
                compact
              />
            </div>
            <div className="[&_button]:!bg-white/10 [&_button]:!text-white [&_button]:!border-white/20">
              <ExportMenu
                options={['json']}
                handlers={{ json: () => exportJSON(`${course.name}-bundle`, bundle) }}
                compact
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stage timeline */}
      <div className="space-y-3">
        {stages.map((s, i) => {
          const hasData = !!s.data
          const Icon = s.icon
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`card p-5 cursor-pointer hover:shadow-xl transition-all ${
                hasData ? '' : 'opacity-60'
              }`}
              onClick={() => setStage(s.key as any)}
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  {hasData ? (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Icon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      Stage {i + 1}
                    </span>
                    {hasData ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </div>
                  <div className="font-display font-bold text-base">{s.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{stageSummary(s.key, s.data)}</div>
                </div>
                {hasData && (
                  <div className="chip bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                    {t('blueprint.complete')}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {percent === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-6 text-center bg-gradient-to-br from-emerald-50 to-brand-50 dark:from-emerald-950/40 dark:to-brand-950/40 border border-emerald-200 dark:border-emerald-800"
        >
          <Crown className="w-10 h-10 mx-auto mb-2 text-amber-500" />
          <h3 className="font-display font-black text-xl mb-1">{t('blueprint.allDone')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('blueprint.allDoneDesc')}
          </p>
        </motion.div>
      )}
    </div>
  )
}

function Header() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-lg">
        <Package className="w-5 h-5" />
      </div>
      <div>
        <h1 className="font-display font-black text-2xl">{t('blueprint.title')}</h1>
        <p className="text-xs text-slate-500">{t('blueprint.subtitle')}</p>
      </div>
    </div>
  )
}

function stageSummary(key: string, data: any): string {
  if (!data) return '—'
  switch (key) {
    case 'idea':
      return `${data.ideas?.length || 0} ideas · strongest: ${data.ideas?.find((i: any) => i.isStrongest)?.title || '-'}`
    case 'research':
      return `${data.depth} · ${data.marketSize || ''} · Score: ${data.priorityScore || 0}/100`
    case 'curriculum':
      return `${data.modules?.length || 0} modules · Lean: ${data.leanScore || 0}/100`
    case 'sales':
      return data.headline?.substring(0, 80) || '-'
    case 'email':
      return `${data.emails?.length || 0} emails ready`
    case 'pricing':
      return `${data.tiers?.length || 0} tiers · $${data.tiers?.[0]?.price || 0}–$${data.tiers?.[data.tiers.length - 1]?.price || 0}`
    case 'growth':
      return `${data.channels?.length || 0} channels · ${data.timelineWeeks || 0} weeks`
    default:
      return ''
  }
}
