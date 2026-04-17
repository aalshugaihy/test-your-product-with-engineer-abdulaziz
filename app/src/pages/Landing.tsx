import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  Rocket,
  Users,
  Building2,
  Palette,
  GraduationCap,
  Search,
  Megaphone,
  Mail,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  LibraryBig,
  PackageCheck,
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

const whoIcons = [Users, Building2, Palette, GraduationCap]

export default function Landing() {
  const { t } = useTranslation()
  const { setStage, createCourse } = useStore()
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
  })
  const [recommend, setRecommend] = useState<StageKey | null>(null)

  const getRecommendation = (): StageKey => {
    if (answers.q1 === false) return 'idea'
    if (answers.q2 === false) return 'research'
    if (answers.q3 === false) return 'curriculum'
    if (answers.q4 === false) return 'sales'
    return 'output'
  }

  const startJourney = () => {
    createCourse(t('app.name') as string)
    setStage('idea')
  }

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 p-8 md:p-14 text-white">
        {/* Animated blobs */}
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent-400/30 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-brand-300/30 blur-3xl"
        />

        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-xs font-medium mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('landing.hero.eyebrow')}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-black leading-tight"
          >
            {t('landing.hero.title')}{' '}
            <motion.span
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: '100% 50%' }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
              className="bg-gradient-to-r from-amber-200 via-white to-accent-200 bg-clip-text text-transparent"
              style={{ backgroundSize: '200% auto' }}
            >
              {t('landing.hero.highlight')}
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-white/80 max-w-2xl"
          >
            {t('landing.hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              onClick={startJourney}
              className="btn bg-white text-brand-700 hover:bg-white/90 font-bold text-base px-6 py-3 group"
            >
              <Rocket className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              {t('landing.hero.ctaPrimary')}
              <ArrowRight className="w-4 h-4 flip-rtl" />
            </button>
            <button
              onClick={() => setStage('catalog')}
              className="btn bg-white/10 backdrop-blur text-white hover:bg-white/20 border border-white/20 font-medium"
            >
              {t('landing.hero.ctaSecondary')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Value pillars */}
      <section>
        <h2 className="font-display text-3xl font-black text-center mb-10">
          {t('landing.value.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {['Validate', 'Design', 'Launch'].map((_, i) => {
            const items = t('landing.value.items', { returnObjects: true }) as any[]
            const Icon = [Lightbulb, BookOpen, Rocket][i]
            const gradient = ['from-amber-400 to-orange-500', 'from-brand-500 to-indigo-600', 'from-accent-500 to-pink-600'][i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card card-hover p-6"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2">{items[i]?.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {items[i]?.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Who */}
      <section>
        <h2 className="font-display text-3xl font-black text-center mb-10">
          {t('landing.who.title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(t('landing.who.items', { returnObjects: true }) as string[]).map((item, i) => {
            const Icon = whoIcons[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 text-center card-hover"
              >
                <Icon className="w-8 h-8 mx-auto mb-3 text-brand-500" />
                <div className="font-semibold text-sm">{item}</div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Service catalog */}
      <section>
        <h2 className="font-display text-3xl font-black text-center mb-10">
          {t('landing.services.title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map(({ code, stage, icon: Icon, gradient }, i) => (
            <motion.button
              key={code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              onClick={() => setStage(stage)}
              className="card card-hover p-5 text-start group"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-sm mb-1">{t(`services.${code}.name`)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                {t(`services.${code}.desc`)}
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Diagnostic */}
      <section className="card p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
        <h2 className="font-display text-3xl font-black mb-2 text-center">
          {t('landing.diagnostic.title')}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
          {t('landing.diagnostic.subtitle')}
        </p>
        <div className="max-w-2xl mx-auto space-y-4">
          {(['q1', 'q2', 'q3', 'q4'] as const).map((q, i) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60"
            >
              <span className="text-sm font-medium">{t(`landing.diagnostic.${q}`)}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setAnswers({ ...answers, [q]: true })}
                  className={`btn !px-4 !py-1.5 text-xs ${
                    answers[q] === true ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {t('landing.diagnostic.yes')}
                </button>
                <button
                  onClick={() => setAnswers({ ...answers, [q]: false })}
                  className={`btn !px-4 !py-1.5 text-xs ${
                    answers[q] === false ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {t('landing.diagnostic.no')}
                </button>
              </div>
            </motion.div>
          ))}
          <button
            disabled={Object.values(answers).some((a) => a === null)}
            onClick={() => setRecommend(getRecommendation())}
            className="btn-primary w-full mt-4"
          >
            {t('landing.diagnostic.recommend')}
            <ArrowRight className="w-4 h-4 flip-rtl" />
          </button>
          {recommend && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-5 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-950/40 dark:to-accent-950/40 border border-brand-200 dark:border-brand-800"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">{t('landing.diagnostic.result')}</div>
                  <div className="font-bold text-lg">{t(`nav.${recommend}`)}</div>
                </div>
                <button onClick={() => setStage(recommend)} className="btn-primary !text-xs !py-2 !px-3">
                  {t('common.start')}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-12">
        <h2 className="font-display text-3xl md:text-4xl font-black mb-4">
          {t('landing.cta.title')}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">{t('landing.cta.desc')}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={startJourney} className="btn-primary text-base px-6 py-3">
            <Rocket className="w-5 h-5" />
            {t('landing.hero.ctaPrimary')}
          </button>
          <button onClick={() => setStage('catalog')} className="btn-secondary text-base px-6 py-3">
            {t('landing.hero.ctaSecondary')}
          </button>
        </div>
      </section>
    </div>
  )
}
