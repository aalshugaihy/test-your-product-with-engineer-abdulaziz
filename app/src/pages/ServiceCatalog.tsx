import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Lightbulb,
  Search,
  BookOpen,
  Megaphone,
  Mail,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  LibraryBig,
  PackageCheck,
  ArrowRight,
  Info,
} from 'lucide-react'
import { useStore } from '@/store'
import type { StageKey } from '@/types'

const services: { code: string; stage: StageKey; icon: any; gradient: string }[] = [
  { code: 'S2', stage: 'idea', icon: Lightbulb, gradient: 'from-amber-400 to-orange-500' },
  { code: 'DR', stage: 'research', icon: Search, gradient: 'from-cyan-400 to-blue-500' },
  { code: 'S3', stage: 'curriculum', icon: BookOpen, gradient: 'from-brand-500 to-indigo-600' },
  { code: 'S4', stage: 'sales', icon: Megaphone, gradient: 'from-pink-500 to-rose-500' },
  { code: 'S5', stage: 'email', icon: Mail, gradient: 'from-violet-500 to-purple-600' },
  { code: 'S6', stage: 'pricing', icon: DollarSign, gradient: 'from-emerald-400 to-green-600' },
  { code: 'S7', stage: 'growth', icon: TrendingUp, gradient: 'from-teal-400 to-cyan-600' },
  { code: 'S8', stage: 'review', icon: ShieldCheck, gradient: 'from-slate-400 to-slate-600' },
  { code: 'S9', stage: 'templates', icon: LibraryBig, gradient: 'from-fuchsia-400 to-pink-500' },
  { code: 'SE', stage: 'output', icon: PackageCheck, gradient: 'from-indigo-400 to-brand-600' },
]

export default function ServiceCatalog() {
  const { t } = useTranslation()
  const { setStage } = useStore()
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-black text-3xl">{t('nav.catalog')}</h1>
        <p className="text-slate-500 mt-1">{t('landing.services.title')}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(({ code, stage, icon: Icon, gradient }, i) => (
          <motion.button
            key={code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            onClick={() => setStage(stage)}
            onMouseEnter={() => setHoveredCode(code)}
            onMouseLeave={() => setHoveredCode(null)}
            className="card card-hover p-6 text-start group relative overflow-hidden"
          >
            {/* Animated gradient tint on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info className="w-4 h-4 text-brand-500" />
                </div>
              </div>

              <h3 className="font-display font-bold text-lg mb-2">{t(`services.${code}.name`)}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t(`services.${code}.desc`)}
              </p>

              <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 text-sm font-medium">
                {t('landing.services.cardCta')}
                <ArrowRight className="w-4 h-4 flip-rtl group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Hover tooltip — expanded description */}
            <AnimatePresence>
              {hoveredCode === code && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute -bottom-1 start-4 end-4 p-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs shadow-2xl z-10 pointer-events-none"
                  role="tooltip"
                >
                  <div className="font-bold mb-1 text-[11px]">{t(`services.${code}.name`)}</div>
                  <div className="opacity-80 leading-relaxed">{t(`services.${code}.desc`)}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
