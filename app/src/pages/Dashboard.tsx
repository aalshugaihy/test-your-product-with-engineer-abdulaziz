import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/store'
import {
  Plus,
  Play,
  FileText,
  CheckCircle2,
  Download,
  Clock,
  Trash2,
  ArrowRight,
  Package,
} from 'lucide-react'
import { exportCourseBundle } from '@/lib/export'

export default function Dashboard() {
  const { t } = useTranslation()
  const {
    courses,
    curricula,
    ideas,
    salesPages,
    emailSequences,
    pricingPackages,
    growthPlans,
    createCourse,
    selectCourse,
    deleteCourse,
    setStage,
    toast,
  } = useStore()

  const stats = [
    { key: 'runs', value: courses.length, icon: Play, color: 'from-brand-500 to-indigo-600' },
    { key: 'drafts', value: Object.values(curricula).filter((c) => c.status === 'draft').length, icon: FileText, color: 'from-amber-400 to-orange-500' },
    { key: 'approved', value: Object.values(curricula).filter((c) => c.status === 'approved').length, icon: CheckCircle2, color: 'from-emerald-400 to-green-600' },
    { key: 'exports', value: 0, icon: Download, color: 'from-accent-500 to-pink-600' },
  ]

  const handleCreate = () => {
    const name = prompt(t('common.add') + ' — Course name?') || 'New Course'
    createCourse(name)
    setStage('idea')
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">{t('dashboard.welcome')}</div>
          <h1 className="font-display text-3xl font-black mt-1">{t('dashboard.title')}</h1>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t('common.add')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5 relative overflow-hidden"
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${s.color} opacity-10 blur-xl`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-black">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{t(`dashboard.stats.${s.key}`)}</div>
          </motion.div>
        ))}
      </div>

      {/* Courses list */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl">{t('dashboard.recentRuns')}</h2>
        </div>
        {courses.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <div className="text-sm">No courses yet.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((c) => {
              const doneCount = Object.values(c.progress).filter(Boolean).length
              return (
                <motion.div
                  key={c.id}
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                  onClick={() => {
                    selectCourse(c.id)
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Stage: {t(`nav.${c.currentStage}`)} · {doneCount}/7
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(doneCount / 7) * 100}%` }}
                        className="h-full bg-gradient-to-r from-brand-500 to-accent-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      exportCourseBundle({
                        courseName: c.name,
                        curriculum: curricula[c.id],
                        idea: ideas[c.id],
                        sales: salesPages[c.id],
                        email: emailSequences[c.id],
                        pricing: pricingPackages[c.id],
                        growth: growthPlans[c.id],
                      })
                      toast('جاري تصدير الحزمة الكاملة...', 'info')
                    }}
                    className="btn-ghost !p-2 text-brand-500"
                    aria-label="export-bundle"
                    title="Export full bundle"
                  >
                    <Package className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      selectCourse(c.id)
                    }}
                    className="btn-ghost !p-2"
                    aria-label="open"
                  >
                    <ArrowRight className="w-4 h-4 flip-rtl" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Delete?')) deleteCourse(c.id)
                    }}
                    className="btn-ghost !p-2 text-rose-500"
                    aria-label="delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
