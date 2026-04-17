import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { DollarSign, Sparkles, Check, AlertTriangle, RefreshCw } from 'lucide-react'
import { useStore } from '@/store'
import { aiGeneratePricingPackages as generatePricingPackages } from '@/lib/aiGenerators'
import ServiceActionsBar from '@/components/ServiceActionsBar'
import NextSteps from '@/components/NextSteps'
import DetailedProgress from '@/components/DetailedProgress'

export default function Pricing() {
  const { t } = useTranslation()
  const { currentCourseId, courses, pricingPackages, savePricingPackages, createCourse, toast } = useStore()
  const [outcomeValue, setOutcomeValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pkg = currentCourseId ? pricingPackages[currentCourseId] : null
  const course = courses.find((c) => c.id === currentCourseId)
  const courseName = course?.name || 'Venture'

  const subTasks = [
    { id: 'p1', label: 'Calculating outcome value…', estimatedMs: 250 },
    { id: 'p2', label: 'Computing price floor & ceiling…', estimatedMs: 250 },
    { id: 'p3', label: 'Building 3-tier logic…', estimatedMs: 250 },
    { id: 'p4', label: 'Drafting upgrade reasons…', estimatedMs: 200 },
  ]

  const handleGenerate = async () => {
    setError(null)
    let cid = currentCourseId
    if (!cid) cid = createCourse('New Venture')
    setLoading(true)
    try {
      const r = await generatePricingPackages(cid, outcomeValue)
      savePricingPackages(cid, r)
      toast('تم توليد الحزم', 'success')
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('pricing.title')}</h1>
          <p className="text-xs text-slate-500">{t('services.S6.desc')}</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="text-xs text-slate-500 block mb-1.5">{t('pricing.outcomeValue')}</label>
          <textarea
            value={outcomeValue}
            onChange={(e) => setOutcomeValue(e.target.value)}
            rows={3}
            className="input resize-none"
            placeholder="مثال: توفير 10 ساعات أسبوعياً + زيادة التحويلات 30%"
          />
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('pricing.generate')}
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
        {pkg && !loading && (
          <div className="space-y-5">
            <ServiceActionsBar
              kind="pricing"
              courseName={courseName}
              title={`${courseName} — Pricing`}
              data={pkg}
            />
            <div className="grid md:grid-cols-3 gap-4">
            {pkg.tiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`card p-6 relative ${
                  i === 1
                    ? 'ring-2 ring-brand-500 shadow-xl shadow-brand-500/10 md:scale-105'
                    : ''
                }`}
              >
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 chip bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg">
                    الأكثر شعبية
                  </div>
                )}
                <div className="text-sm text-slate-500 mb-1">{tier.name}</div>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-black">${tier.price}</span>
                </div>
                <div className="text-xs text-slate-500 mb-3">{tier.valueJustification}</div>
                <ul className="space-y-2 text-sm">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-brand-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {tier.upgradeReason !== '—' && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500">
                    <strong>سبب الترقية:</strong> {tier.upgradeReason}
                  </div>
                )}
              </motion.div>
            ))}
            </div>
            <NextSteps currentService="pricing" hasEnoughForBlueprint={true} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
