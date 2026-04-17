import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Sparkles,
  TrendingUp,
  Users,
  AlertTriangle,
  Hash,
  Globe,
  BarChart3,
  Shield,
  Target,
  DollarSign,
  RefreshCw,
} from 'lucide-react'
import { useStore } from '@/store'
import { aiRunDeepResearch as runDeepResearch } from '@/lib/aiGenerators'
import Markdown from '@/components/Markdown'
import DetailedProgress from '@/components/DetailedProgress'
import NextSteps from '@/components/NextSteps'
import ShareButton from '@/components/ShareButton'
import ExportMenu from '@/components/ExportMenu'
import { exportJSON } from '@/lib/export'

export default function DeepResearch() {
  const { t } = useTranslation()
  const { currentCourseId, research, saveResearchReport, createCourse, toast } = useStore()
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [depth, setDepth] = useState<'shallow' | 'medium' | 'deep'>('deep')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const report = currentCourseId ? research[currentCourseId] : null

  const subTasks = [
    { id: 's1', label: t('progress.analyzing'), estimatedMs: 400 },
    { id: 's2', label: 'Fetching market signals…', estimatedMs: 350 },
    { id: 's3', label: 'Mapping competitor landscape…', estimatedMs: 350 },
    { id: 's4', label: 'Building personas & SWOT…', estimatedMs: 350 },
    { id: 's5', label: 'Synthesizing core analysis…', estimatedMs: 300 },
    { id: 's6', label: t('progress.finalizing'), estimatedMs: 150 },
  ]

  const handleRun = async () => {
    setError(null)
    let cid = currentCourseId
    if (!cid) cid = createCourse(topic || 'New Venture')
    setLoading(true)
    try {
      const r = await runDeepResearch(cid, topic, audience, depth)
      saveResearchReport(cid, r)
      toast('تم إنجاز البحث العميق', 'success')
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('research.title')}</h1>
          <p className="text-xs text-slate-500">{t('research.subtitle')}</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="card p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1.5">{t('research.topic')}</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input"
              placeholder="مثل: تسويق المحتوى B2B"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1.5">{t('research.audience')}</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="input"
              placeholder="مثل: مدراء تسويق في الشركات الناشئة"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-2">{t('research.depth')}</label>
          <div className="flex gap-2">
            {(['shallow', 'medium', 'deep'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                disabled={loading}
                className={`flex-1 btn !py-2 ${depth === d ? 'btn-primary' : 'btn-secondary'}`}
              >
                {t(`research.${d}`)}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleRun} disabled={loading} className="btn-primary w-full">
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '...' : t('research.run')}
        </button>
      </div>

      {/* Loading — Detailed Progress */}
      {loading && <DetailedProgress tasks={subTasks} running={loading} />}

      {/* Error with retry */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card p-4 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-sm text-rose-700 dark:text-rose-300">
                  {t('errors.title')}
                </div>
                <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</div>
              </div>
              <button onClick={handleRun} className="btn-primary !py-2">
                <RefreshCw className="w-3.5 h-3.5" />
                {t('errors.retry')}
              </button>
              <button onClick={() => setError(null)} className="btn-ghost !p-2">
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {report && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Actions row: share + export */}
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <ShareButton
                kind="research"
                title={`Research: ${report.topic}`}
                data={report}
                compact
              />
              <ExportMenu
                options={['json']}
                handlers={{
                  json: () => exportJSON('research', report),
                }}
                recommended={['json']}
                compact
              />
            </div>

            {/* Top metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: BarChart3, label: 'Market Size', value: report.marketSize || '-', gradient: 'from-brand-500 to-indigo-600' },
                { icon: TrendingUp, label: 'Growth Rate', value: report.growthRate || '-', gradient: 'from-emerald-400 to-green-600' },
                { icon: DollarSign, label: 'Pricing Band', value: report.pricingBand ? `$${report.pricingBand.low}-${report.pricingBand.high}` : '-', gradient: 'from-amber-400 to-orange-500' },
                { icon: Target, label: 'Priority Score', value: `${report.priorityScore || 0}/100`, gradient: 'from-accent-500 to-pink-600' },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-4"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white mb-2`}>
                    <m.icon className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black">{m.value}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{m.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Core analysis — markdown rendered */}
            {report.coreAnalysis && (
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                  Core Analysis
                </h3>
                <Markdown content={report.coreAnalysis} />
              </div>
            )}

            {/* Classic blocks */}
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: t('research.findings'), items: report.findings, icon: Sparkles, gradient: 'from-brand-500 to-indigo-600' },
                { title: t('research.competitors'), items: report.competitors, icon: Users, gradient: 'from-amber-400 to-orange-500' },
                { title: t('research.trends'), items: report.trends, icon: TrendingUp, gradient: 'from-emerald-400 to-green-600' },
                { title: t('research.painPoints'), items: report.painPoints, icon: AlertTriangle, gradient: 'from-rose-500 to-pink-600' },
                { title: t('research.keywords'), items: report.keywords, icon: Hash, gradient: 'from-cyan-400 to-blue-500' },
                { title: t('research.sources'), items: report.sources, icon: Globe, gradient: 'from-violet-500 to-purple-600' },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-5"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${b.gradient} flex items-center justify-center text-white mb-3`}>
                    <b.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold mb-2">{b.title}</h3>
                  <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                    {b.items.map((it, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-brand-500 shrink-0">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* SWOT */}
            {report.swot && (
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-500" />
                  SWOT Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {(['strengths', 'weaknesses', 'opportunities', 'threats'] as const).map((k, i) => {
                    const colors = {
                      strengths: 'from-emerald-400 to-green-600',
                      weaknesses: 'from-rose-500 to-pink-600',
                      opportunities: 'from-brand-500 to-indigo-600',
                      threats: 'from-amber-500 to-orange-600',
                    }
                    return (
                      <motion.div
                        key={k}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-4 rounded-xl bg-gradient-to-br ${colors[k]} text-white`}
                      >
                        <div className="text-[10px] uppercase tracking-wider opacity-75 mb-2">
                          {k}
                        </div>
                        <ul className="space-y-1 text-sm">
                          {report.swot![k].map((item, j) => (
                            <li key={j} className="flex gap-2">
                              <span>•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Personas */}
            {report.personas && report.personas.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-500" />
                  Buyer Personas
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {report.personas.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50"
                    >
                      <div className="font-bold text-sm mb-2">{p.name}</div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-slate-500 font-medium">Demographics: </span>
                          <span className="text-slate-700 dark:text-slate-300">{p.demographics}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Motivations: </span>
                          <span className="text-slate-700 dark:text-slate-300">{p.motivations}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Objections: </span>
                          <span className="text-slate-700 dark:text-slate-300">{p.objections}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <NextSteps currentService="research" hasEnoughForBlueprint={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
