import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Megaphone, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react'
import { useStore } from '@/store'
import { aiGenerateSalesPage as generateSalesPage } from '@/lib/aiGenerators'
import ServiceActionsBar from '@/components/ServiceActionsBar'
import NextSteps from '@/components/NextSteps'
import DetailedProgress from '@/components/DetailedProgress'

export default function SalesPage() {
  const { t } = useTranslation()
  const { currentCourseId, courses, salesPages, saveSalesPage, createCourse, toast } = useStore()
  const [offer, setOffer] = useState('')
  const [audience, setAudience] = useState('')
  const [price, setPrice] = useState(297)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const draft = currentCourseId ? salesPages[currentCourseId] : null
  const course = courses.find((c) => c.id === currentCourseId)
  const courseName = course?.name || offer || 'Venture'

  const subTasks = [
    { id: 'sp1', label: 'Crafting headline…', estimatedMs: 300 },
    { id: 'sp2', label: 'Framing the problem…', estimatedMs: 300 },
    { id: 'sp3', label: 'Presenting the solution…', estimatedMs: 300 },
    { id: 'sp4', label: 'Building offer structure…', estimatedMs: 300 },
    { id: 'sp5', label: 'Handling objections…', estimatedMs: 200 },
  ]

  const handleGenerate = async () => {
    setError(null)
    let cid = currentCourseId
    if (!cid) cid = createCourse(offer || 'New Venture')
    setLoading(true)
    try {
      const d = await generateSalesPage(cid, offer, audience, price)
      saveSalesPage(cid, d)
      toast('تم توليد صفحة المبيعات', 'success')
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
          <Megaphone className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('sales.title')}</h1>
          <p className="text-xs text-slate-500">{t('services.S4.desc')}</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1.5">{t('sales.offer')}</label>
            <input value={offer} onChange={(e) => setOffer(e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1.5">{t('sales.audience')}</label>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1.5">{t('sales.price')}</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="input"
            />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '...' : t('sales.generate')}
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
        {draft && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {[
              ['sales.headline', draft.headline],
              ['sales.problem', draft.problem],
              ['sales.solution', draft.solution],
              ['sales.cta', draft.cta],
            ].map(([k, v], i) => (
              <div key={i} className="card p-5">
                <div className="text-xs text-slate-500 font-medium mb-1">{t(k as string)}</div>
                <div className="font-semibold">{v}</div>
              </div>
            ))}
            <div className="card p-5">
              <div className="text-xs text-slate-500 font-medium mb-2">{t('sales.offerStructure')}</div>
              <ul className="space-y-1 text-sm">
                {draft.offerStructure.map((it, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-brand-500">✓</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <div className="text-xs text-slate-500 font-medium mb-2">{t('sales.objections')}</div>
              <ul className="space-y-2 text-sm">
                {draft.objections.map((it, i) => (
                  <li key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            <ServiceActionsBar
              kind="sales"
              courseName={courseName}
              title={`${courseName} — Sales Page`}
              data={draft}
            />

            <NextSteps currentService="sales" hasEnoughForBlueprint={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
