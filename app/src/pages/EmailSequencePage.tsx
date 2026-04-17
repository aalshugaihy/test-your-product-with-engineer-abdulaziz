import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Mail, Sparkles, Clock, AlertTriangle, RefreshCw } from 'lucide-react'
import { useStore } from '@/store'
import { aiGenerateEmailSequence as generateEmailSequence } from '@/lib/aiGenerators'
import ServiceActionsBar from '@/components/ServiceActionsBar'
import NextSteps from '@/components/NextSteps'
import DetailedProgress from '@/components/DetailedProgress'

export default function EmailSequencePage() {
  const { t } = useTranslation()
  const { currentCourseId, courses, emailSequences, saveEmailSequence, createCourse, toast } = useStore()
  const [offer, setOffer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const seq = currentCourseId ? emailSequences[currentCourseId] : null
  const course = courses.find((c) => c.id === currentCourseId)
  const courseName = course?.name || offer || 'Venture'

  const subTasks = [
    { id: 'e1', label: 'Email 1 — Story hook…', estimatedMs: 200 },
    { id: 'e2', label: 'Email 2 — Solution reveal…', estimatedMs: 200 },
    { id: 'e3', label: 'Email 3 — Offer unveil…', estimatedMs: 200 },
    { id: 'e4', label: 'Email 4 — Objection handling…', estimatedMs: 200 },
    { id: 'e5', label: 'Email 5 — Urgency close…', estimatedMs: 200 },
  ]

  const handleGenerate = async () => {
    setError(null)
    let cid = currentCourseId
    if (!cid) cid = createCourse(offer || 'New Venture')
    setLoading(true)
    try {
      const r = await generateEmailSequence(cid, offer)
      saveEmailSequence(cid, r)
      toast('تم توليد تسلسل البريد', 'success')
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('email.title')}</h1>
          <p className="text-xs text-slate-500">{t('services.S5.desc')}</p>
        </div>
      </div>

      <div className="card p-6 flex gap-3">
        <input
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder={t('sales.offer') as string}
          className="input flex-1"
        />
        <button onClick={handleGenerate} disabled={loading} className="btn-primary">
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('email.generate')}
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
        {seq && !loading && (
          <div className="space-y-4">
            <ServiceActionsBar
              kind="email"
              courseName={courseName}
              title={`${courseName} — Launch Emails`}
              data={seq}
            />
            {seq.emails.map((email, i) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <Clock className="w-3 h-3" />
                      {email.timing}
                      <span>•</span>
                      <span>{email.job}</span>
                    </div>
                    <h3 className="font-bold text-base mb-2">{email.subject}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {email.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            <NextSteps currentService="email" hasEnoughForBlueprint={true} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
