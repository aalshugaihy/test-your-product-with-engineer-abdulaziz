import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Play,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Users,
  Repeat,
  Trophy,
  Zap,
} from 'lucide-react'
import { useStore } from '@/store'

export default function Analytics() {
  const { t } = useTranslation()
  const {
    courses,
    curricula,
    ideas,
    research,
    salesPages,
    emailSequences,
    pricingPackages,
    growthPlans,
    templates,
  } = useStore()

  // Level 1 — Service KPIs
  const serviceRuns = {
    idea: Object.keys(ideas).length,
    research: Object.keys(research).length,
    curriculum: Object.keys(curricula).length,
    sales: Object.keys(salesPages).length,
    email: Object.keys(emailSequences).length,
    pricing: Object.keys(pricingPackages).length,
    growth: Object.keys(growthPlans).length,
  }
  const totalRuns = Object.values(serviceRuns).reduce((a, b) => a + b, 0)
  const curriculaArr = Object.values(curricula)
  const approvedCount = curriculaArr.filter((c) => c.status === 'approved').length
  const inReviewCount = curriculaArr.filter((c) => c.status === 'in_review').length
  const draftCount = curriculaArr.filter((c) => c.status === 'draft').length
  const approvalRate = curriculaArr.length
    ? Math.round((approvedCount / curriculaArr.length) * 100)
    : 0
  const avgQuality = curriculaArr.length
    ? Math.round(curriculaArr.reduce((s, c) => s + c.leanScore, 0) / curriculaArr.length)
    : 0

  // Level 2 — Journey KPIs
  const fullJourneyCount = courses.filter(
    (c) => Object.values(c.progress).filter(Boolean).length >= 6
  ).length
  const journeyConversionRate = courses.length
    ? Math.round((fullJourneyCount / courses.length) * 100)
    : 0
  const avgProgress = courses.length
    ? Math.round(
        (courses.reduce((s, c) => s + Object.values(c.progress).filter(Boolean).length, 0) /
          (courses.length * 7)) *
          100
      )
    : 0
  const reuseRate = templates.length ? Math.min(100, templates.length * 20) : 0

  // Level 3 — Business KPIs
  const launchReadyCount = courses.filter(
    (c) => c.progress.curriculum && c.progress.sales && c.progress.pricing
  ).length

  const level1 = [
    { key: 'totalRuns', label: t('analytics.totalRuns'), value: totalRuns, icon: Play, color: 'from-brand-500 to-indigo-600' },
    { key: 'approved', label: t('dashboard.stats.approved'), value: approvedCount, icon: CheckCircle2, color: 'from-emerald-400 to-green-600' },
    { key: 'inReview', label: t('analytics.inReview'), value: inReviewCount, icon: Clock, color: 'from-amber-400 to-orange-500' },
    { key: 'drafts', label: t('dashboard.stats.drafts'), value: draftCount, icon: FileText, color: 'from-slate-400 to-slate-600' },
    { key: 'approvalRate', label: t('analytics.approvalRate'), value: `${approvalRate}%`, icon: Trophy, color: 'from-accent-500 to-pink-600' },
    { key: 'avgQuality', label: t('analytics.avgQuality'), value: `${avgQuality}/100`, icon: Zap, color: 'from-cyan-400 to-blue-500' },
  ]

  const level2 = [
    { key: 'conversion', label: t('analytics.journeyConversion'), value: `${journeyConversionRate}%`, icon: TrendingUp, color: 'from-teal-400 to-cyan-600' },
    { key: 'avgProgress', label: t('analytics.avgProgress'), value: `${avgProgress}%`, icon: BarChart3, color: 'from-brand-500 to-indigo-600' },
    { key: 'reuseRate', label: t('analytics.reuseRate'), value: `${reuseRate}%`, icon: Repeat, color: 'from-fuchsia-400 to-pink-500' },
  ]

  const level3 = [
    { key: 'launchReady', label: t('analytics.launchReady'), value: launchReadyCount, icon: Trophy, color: 'from-emerald-400 to-green-600' },
    { key: 'firstHundred', label: t('analytics.firstHundred'), value: Object.keys(growthPlans).length, icon: Users, color: 'from-accent-500 to-pink-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('nav.analytics')}</h1>
          <p className="text-xs text-slate-500">{t('analytics.subtitle')}</p>
        </div>
      </div>

      {/* Level 1 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="chip bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 !text-[10px] uppercase">
            Level 1
          </div>
          <h2 className="font-display font-bold">{t('analytics.level1')}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {level1.map((m, i) => (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-4 relative overflow-hidden"
            >
              <div
                className={`absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br ${m.color} opacity-10 blur-xl`}
              />
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center text-white mb-2`}
              >
                <m.icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black">{m.value}</div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Service runs breakdown */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="chip bg-slate-100 dark:bg-slate-800 !text-[10px] uppercase">
            Service Runs
          </div>
          <h2 className="font-display font-bold">{t('analytics.runsBreakdown')}</h2>
        </div>
        <div className="space-y-2">
          {Object.entries(serviceRuns).map(([key, count], i) => {
            const max = Math.max(...Object.values(serviceRuns), 1)
            const pct = (count / max) * 100
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-24 text-xs text-slate-500 shrink-0">{t(`nav.${key}`)}</div>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.05, duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg"
                  />
                </div>
                <div className="w-10 text-xs text-slate-500 text-end shrink-0">{count}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Level 2 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="chip bg-accent-100 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 !text-[10px] uppercase">
            Level 2
          </div>
          <h2 className="font-display font-bold">{t('analytics.level2')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {level2.map((m, i) => (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white mb-3`}
              >
                <m.icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black">{m.value}</div>
              <div className="text-xs text-slate-500 mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Level 3 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="chip bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 !text-[10px] uppercase">
            Level 3
          </div>
          <h2 className="font-display font-bold">{t('analytics.level3')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {level3.map((m, i) => (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-6"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white mb-3`}
              >
                <m.icon className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black">{m.value}</div>
              <div className="text-sm text-slate-500 mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
