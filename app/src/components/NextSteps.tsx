import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Lightbulb,
  Search,
  BookOpen,
  Megaphone,
  Mail,
  DollarSign,
  TrendingUp,
  PackageCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useStore } from '@/store'
import type { StageKey } from '@/types'

type ServiceKey = Exclude<StageKey, 'landing' | 'dashboard' | 'catalog' | 'analytics' | 'settings' | 'review' | 'templates' | 'output'>

// Default downstream graph — each service knows what logically follows.
const DEFAULT_NEXT: Partial<Record<ServiceKey, StageKey[]>> = {
  idea: ['research', 'curriculum'],
  research: ['curriculum', 'sales'],
  curriculum: ['sales', 'pricing'],
  sales: ['email', 'pricing'],
  email: ['pricing', 'growth'],
  pricing: ['growth', 'sales'],
  growth: ['output'],
}

const SERVICE_META: Record<string, { icon: any; gradient: string }> = {
  idea: { icon: Lightbulb, gradient: 'from-amber-400 to-orange-500' },
  research: { icon: Search, gradient: 'from-cyan-400 to-blue-500' },
  curriculum: { icon: BookOpen, gradient: 'from-brand-500 to-indigo-600' },
  sales: { icon: Megaphone, gradient: 'from-pink-500 to-rose-500' },
  email: { icon: Mail, gradient: 'from-violet-500 to-purple-600' },
  pricing: { icon: DollarSign, gradient: 'from-emerald-400 to-green-600' },
  growth: { icon: TrendingUp, gradient: 'from-teal-400 to-cyan-600' },
  output: { icon: PackageCheck, gradient: 'from-indigo-400 to-brand-600' },
}

interface Props {
  currentService: ServiceKey
  nextServices?: StageKey[] // optional override from the output itself
  hasEnoughForBlueprint?: boolean
}

export default function NextSteps({ currentService, nextServices, hasEnoughForBlueprint }: Props) {
  const { t } = useTranslation()
  const { setStage } = useStore()

  const recommended = nextServices && nextServices.length > 0
    ? nextServices
    : DEFAULT_NEXT[currentService] || []

  if (recommended.length === 0 && !hasEnoughForBlueprint) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 relative overflow-hidden"
    >
      <div className="absolute -top-10 -end-10 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <h3 className="font-display font-bold text-lg">{t('nextSteps.title')}</h3>
        </div>
        <p className="text-xs text-slate-500 mb-5">{t('nextSteps.description')}</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommended.map((stage, i) => {
            const meta = SERVICE_META[stage as string]
            if (!meta) return null
            const Icon = meta.icon
            return (
              <motion.button
                key={stage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => setStage(stage as any)}
                className="card card-hover p-4 text-start group flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{t(`nav.${stage}`)}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    {t(`services.${stageToCode(stage)}.desc`, '')}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all flip-rtl shrink-0" />
              </motion.button>
            )
          })}

          {hasEnoughForBlueprint && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: recommended.length * 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => setStage('blueprint' as any)}
              className="card card-hover p-4 text-start group flex items-center gap-3 ring-2 ring-brand-500/30 bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-950/40 dark:to-accent-950/40"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{t('nextSteps.finalBlueprint')}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1">
                  {t('nextSteps.finalBlueprintDesc')}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-500 group-hover:translate-x-1 transition-transform flip-rtl shrink-0" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const stageToCode = (s: StageKey): string => {
  const map: Record<string, string> = {
    idea: 'S2', research: 'DR', curriculum: 'S3', sales: 'S4',
    email: 'S5', pricing: 'S6', growth: 'S7', output: 'SE',
  }
  return map[s] || 'S3'
}
