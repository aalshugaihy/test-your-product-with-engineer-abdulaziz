import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Sparkles, Lightbulb, CheckCircle2, ArrowRight, Crown, Plus, AlertTriangle, RefreshCw } from 'lucide-react'
import { useStore } from '@/store'
import { generateIdeas } from '@/lib/mockAI'
import ServiceActionsBar from '@/components/ServiceActionsBar'
import NextSteps from '@/components/NextSteps'
import DetailedProgress from '@/components/DetailedProgress'

export default function IdeaDiscovery() {
  const { t } = useTranslation()
  const { currentCourseId, courses, ideas, saveIdeaReport, createCourse, selectCourse, setStage, toast } =
    useStore()
  const [expertise, setExpertise] = useState('')
  const [audience, setAudience] = useState('')
  const [transformation, setTransformation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const courseId = currentCourseId
  const report = courseId ? ideas[courseId] : null
  const course = courses.find((c) => c.id === courseId)
  const courseName = course?.name || expertise || 'Venture'

  const subTasks = [
    { id: 'i1', label: 'Analyzing expertise & audience…', estimatedMs: 300 },
    { id: 'i2', label: 'Scanning market signals…', estimatedMs: 300 },
    { id: 'i3', label: 'Generating 3 ideas…', estimatedMs: 300 },
    { id: 'i4', label: 'Scoring credibility & gap…', estimatedMs: 300 },
    { id: 'i5', label: 'Drafting positioning statement…', estimatedMs: 200 },
  ]

  const handleGenerate = async () => {
    setError(null)
    let cid = courseId
    if (!cid) {
      cid = createCourse(expertise || 'New Venture')
    }
    setLoading(true)
    try {
      const r = await generateIdeas(cid, expertise, audience, transformation)
      saveIdeaReport(cid, r)
      toast('تم توليد الأفكار بنجاح', 'success')
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('idea.title')}</h1>
          <p className="text-xs text-slate-500">{t('services.S2.desc')}</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="text-xs text-slate-500 block mb-1.5">{t('idea.expertise')}</label>
          <input
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            className="input"
            placeholder="مثل: تسويق محتوى B2B"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1.5">{t('idea.audience')}</label>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="input"
            placeholder="مثل: مدراء تسويق الشركات الناشئة"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1.5">{t('idea.transformation')}</label>
          <textarea
            value={transformation}
            onChange={(e) => setTransformation(e.target.value)}
            rows={3}
            className="input resize-none"
            placeholder="التحوّل من ... إلى ..."
          />
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '...' : t('idea.generate')}
        </button>
      </div>

      {loading && <DetailedProgress tasks={subTasks} running={loading} />}

      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
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
      </AnimatePresence>

      <AnimatePresence>
        {report && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="font-display font-bold text-xl">{t('idea.ideas')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {report.ideas.map((idea, i) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card p-5 relative ${
                    idea.isStrongest ? 'ring-2 ring-brand-500 shadow-xl shadow-brand-500/10' : ''
                  }`}
                >
                  {idea.isStrongest && (
                    <div className="absolute -top-3 left-4 chip bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg">
                      <Crown className="w-3 h-3" />
                      {t('idea.strongest')}
                    </div>
                  )}
                  <h3 className="font-bold text-base mb-3">{idea.title}</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">{t('idea.demand')}: </span>
                      <span>{idea.demandSignal}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">{t('idea.credibility')}: </span>
                      <span>{idea.credibilityFit}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">{t('idea.gap')}: </span>
                      <span>{idea.gap}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="card p-6 bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-950/40 dark:to-accent-950/40 border-brand-200 dark:border-brand-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1 font-medium">{t('idea.positioning')}</div>
                  <div className="text-sm leading-relaxed">{report.positioningStatement}</div>
                </div>
              </div>
            </div>

            <ServiceActionsBar
              kind="idea"
              courseName={courseName}
              title={`${courseName} — Idea Report`}
              data={report}
            />

            <NextSteps currentService="idea" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
