import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Sparkles, Target, AlertTriangle, RefreshCw } from 'lucide-react'
import { useStore } from '@/store'
import { aiGenerateGrowthPlan as generateGrowthPlan } from '@/lib/aiGenerators'
import ServiceActionsBar from '@/components/ServiceActionsBar'
import NextSteps from '@/components/NextSteps'
import DetailedProgress from '@/components/DetailedProgress'

export default function Growth() {
  const { t } = useTranslation()
  const { currentCourseId, courses, growthPlans, saveGrowthPlan, createCourse, toast } = useStore()
  const [audienceSize, setAudienceSize] = useState(500)
  const [timeline, setTimeline] = useState(8)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const plan = currentCourseId ? growthPlans[currentCourseId] : null
  const course = courses.find((c) => c.id === currentCourseId)
  const courseName = course?.name || 'Venture'

  const subTasks = [
    { id: 'g1', label: 'Calculating audience-to-student math…', estimatedMs: 250 },
    { id: 'g2', label: 'Ranking channels by ROI…', estimatedMs: 250 },
    { id: 'g3', label: 'Building waitlist strategy…', estimatedMs: 200 },
    { id: 'g4', label: 'Drafting early bird offer…', estimatedMs: 200 },
    { id: 'g5', label: 'Creating weekly milestones…', estimatedMs: 200 },
  ]

  const handleGenerate = async () => {
    setError(null)
    let cid = currentCourseId
    if (!cid) cid = createCourse('New Venture')
    setLoading(true)
    try {
      const r = await generateGrowthPlan(cid, audienceSize, timeline)
      saveGrowthPlan(cid, r)
      toast('تم توليد خطة النمو', 'success')
    } catch (e: any) {
      setError(e?.message || String(e))
      toast(t('errors.title') as string, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('growth.title')}</h1>
          <p className="text-xs text-slate-500">{t('services.S7.desc')}</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1.5">{t('growth.audienceSize')}</label>
            <input
              type="number"
              value={audienceSize}
              onChange={(e) => setAudienceSize(Number(e.target.value))}
              className="input"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1.5">{t('growth.timeline')}</label>
            <input
              type="number"
              value={timeline}
              onChange={(e) => setTimeline(Number(e.target.value))}
              className="input"
            />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('growth.generate')}
        </button>
      </div>

      {loading && <DetailedProgress tasks={subTasks} running={loading} />}

      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-sm text-rose-700 dark:text-rose-300">{t('errors.title')}</div>
            <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</div>
          </div>
          <button onClick={handleGenerate} className="btn-primary !py-2">
            <RefreshCw className="w-3.5 h-3.5" /> {t('errors.retry')}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {plan && !loading && (
          <div className="space-y-4">
            <ServiceActionsBar
              kind="growth"
              courseName={courseName}
              title={`${courseName} — Growth Plan`}
              data={plan}
            />
            <div className="card p-5">
              <h3 className="font-bold mb-3">{t('growth.channels')}</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {plan.channels.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60"
                  >
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{c.reason}</div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-bold mb-3">{t('growth.waitlist')} / {t('growth.earlyBird')}</h3>
              <div className="text-sm space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                  {plan.waitlistStrategy}
                </div>
                <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40">
                  {plan.earlyBird}
                </div>
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-bold mb-3">{t('growth.milestones')}</h3>
              <div className="space-y-2">
                {plan.milestones.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      W{m.week}
                    </div>
                    <div className="flex-1 text-sm">{m.goal}</div>
                    <Target className="w-4 h-4 text-slate-400" />
                  </motion.div>
                ))}
              </div>
            </div>
            <NextSteps currentService="growth" hasEnoughForBlueprint={true} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
