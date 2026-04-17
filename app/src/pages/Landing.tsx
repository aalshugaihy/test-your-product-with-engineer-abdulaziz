import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
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
  Zap,
  Clock,
  Award,
  Target,
  BarChart3,
  FileText,
  Layers,
  Brain,
  Cpu,
  Globe as GlobeIcon,
  Star,
  ChevronDown,
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

// Animated counter
function AnimatedCounter({ value, suffix = '', duration = 1.5 }: { value: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return
    const start = Date.now()
    const end = start + duration * 1000
    const tick = () => {
      const now = Date.now()
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setDisplay(Math.floor(value * eased))
      if (now < end) requestAnimationFrame(tick)
      else setDisplay(value)
    }
    tick()
  }, [isInView, value, duration])

  return (
    <span ref={ref}>
      {display.toLocaleString()}{suffix}
    </span>
  )
}

export default function Landing() {
  const { t } = useTranslation()
  const { setStage, createCourse } = useStore()
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({ q1: null, q2: null, q3: null, q4: null })
  const [recommend, setRecommend] = useState<StageKey | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3])

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
    <div className="space-y-24 overflow-hidden">
      {/* ============ HERO ============ */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 p-8 md:p-16 text-white overflow-hidden"
      >
        {/* Animated particles */}
        <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent-400/30 blur-3xl" />
        <motion.div animate={{ y: [0, 20, 0], x: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-brand-300/30 blur-3xl" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="absolute top-10 left-10 opacity-20">
          <Sparkles className="w-24 h-24" />
        </motion.div>

        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-xs font-semibold mb-6 border border-white/20"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {t('landing.hero.eyebrow')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-black leading-[1.15]"
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

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
            {t('landing.hero.subtitle')}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap gap-3">
            <button onClick={startJourney} className="btn bg-white text-brand-700 hover:bg-white/95 font-bold text-base px-7 py-3.5 group shadow-2xl shadow-brand-900/50">
              <Rocket className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              {t('landing.hero.ctaPrimary')}
              <ArrowRight className="w-4 h-4 flip-rtl" />
            </button>
            <button onClick={() => setStage('catalog')} className="btn bg-white/10 backdrop-blur text-white hover:bg-white/20 border border-white/20 font-medium text-base px-6 py-3.5">
              {t('landing.hero.ctaSecondary')}
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 flex flex-wrap items-center gap-6 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>بدون تسجيل أو بطاقة ائتمان</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>بياناتك على جهازك — لا خوادم</span>
            </div>
            <div className="flex items-center gap-2">
              <GlobeIcon className="w-4 h-4 text-emerald-300" />
              <span>عربي + إنجليزي</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs flex flex-col items-center gap-1"
        >
          <span>اكتشف المزيد</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.section>

      {/* ============ METRICS BAND ============ */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 16, suffix: '', label: 'خدمة متكاملة', icon: Layers, gradient: 'from-brand-500 to-indigo-600' },
            { value: 100, suffix: '%', label: 'يعمل أوفلاين', icon: ShieldCheck, gradient: 'from-emerald-400 to-green-600' },
            { value: 5, suffix: '', label: 'صيغ تصدير', icon: FileText, gradient: 'from-amber-400 to-orange-500' },
            { value: 2, suffix: '', label: 'لغة مدعومة', icon: GlobeIcon, gradient: 'from-accent-500 to-pink-600' },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-6 relative overflow-hidden group hover:shadow-xl transition-shadow"
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${m.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
                <m.icon className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                <AnimatedCounter value={m.value} suffix={m.suffix} />
              </div>
              <div className="text-sm text-slate-500 mt-1 font-medium">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ VALUE PROPOSITION ============ */}
      <section>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">
            <Target className="w-3.5 h-3.5" />
            ثلاث ركائز
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-black">{t('landing.value.title')}</h2>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto">منظومة متكاملة لكل مرحلة من رحلة منتجك التعليمي — من الفكرة إلى أول 100 طالب</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {['Validate', 'Design', 'Launch'].map((_, i) => {
            const items = t('landing.value.items', { returnObjects: true }) as any[]
            const Icon = [Lightbulb, BookOpen, Rocket][i]
            const gradient = ['from-amber-400 to-orange-500', 'from-brand-500 to-indigo-600', 'from-accent-500 to-pink-600'][i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="card card-hover p-8 relative overflow-hidden"
              >
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`} />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-5`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display font-black text-2xl mb-3">{items[i]?.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{items[i]?.desc}</p>
                <div className="mt-5 text-xs text-slate-400 flex items-center gap-1">
                  <span>مدة مقترحة</span>
                  <Clock className="w-3 h-3" />
                  <span className="font-semibold">{['3-7 أيام', '1-2 أسبوع', '2-4 أسابيع'][i]}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ============ AI POWER ============ */}
      <section className="relative">
        <div className="card p-8 md:p-14 bg-gradient-to-br from-slate-900 to-brand-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-xs font-semibold mb-4">
                <Cpu className="w-3.5 h-3.5 text-accent-300" />
                AI-POWERED
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black leading-tight mb-4">
                مدعوم بـ <span className="bg-gradient-to-r from-amber-300 to-accent-300 bg-clip-text text-transparent">Gemini</span> و <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">Claude</span>
              </h2>
              <p className="text-white/75 leading-relaxed mb-6">
                أحدث نماذج الذكاء الاصطناعي تُولّد محتوى تفصيليًا عميقًا بلغتك — ليس outlines سطحية، بل منهج كامل بدروس ومشاريع وتمارين وتقييمات.
                استخدم مفتاحك الخاص مجانًا من Google AI Studio، أو اربط proxy آمن.
              </p>
              <div className="space-y-3">
                {[
                  { icon: Brain, text: 'توليد محتوى عميق وليس مجرد outlines' },
                  { icon: Zap, text: 'اللغة العربية بجودة أصلية' },
                  { icon: ShieldCheck, text: 'مفتاحك على جهازك — بلا خادم وسيط' },
                  { icon: BarChart3, text: 'fallback ذكي إذا تعطل الاتصال' },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-4 h-4 text-accent-300" />
                    </div>
                    <span className="text-sm text-white/90">{f.text}</span>
                  </motion.div>
                ))}
              </div>
              <button onClick={() => setStage('settings' as any)} className="mt-8 btn bg-white text-slate-900 hover:bg-white/95 font-bold">
                <Sparkles className="w-4 h-4" />
                تفعيل الذكاء الاصطناعي
              </button>
            </div>

            <div className="relative">
              {/* Fake code/output preview */}
              <div className="bg-slate-950/60 backdrop-blur rounded-2xl p-5 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-white/40 ms-2 font-mono">curriculum.md</span>
                </div>
                <pre className="text-xs text-white/80 font-mono leading-relaxed whitespace-pre-wrap" dir="rtl">
{`# الوحدة 1: الأساسيات والإطار الذهني

## 💡 المفاهيم الجوهرية
• النظام الذهني قبل المحتوى
• قاعدة 80/20 التطبيقية
• دورة الإتقان القصيرة

## 📖 محتوى الدرس
السبب الجذري ليس نقص المعلومات — بل
غياب النظام. معظم من يتعلمون هذا
المجال يراكمون مفاهيم دون إطار تشغيلي...

## 💪 التمرين التطبيقي
1. اختر آخر مشروع حقيقي قمت به
2. قيّمه على مقياس 1-5 في: الوضوح، الجودة
3. حدد السبب الأول لكل نقص
4. اكتب هدف SMART للأسبوع القادم`}
                </pre>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
                  <span className="font-mono">✓ AI-generated · عربي أصيل</span>
                  <span className="font-mono text-emerald-400">1,247 token</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHO IS IT FOR ============ */}
      <section>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-black">{t('landing.who.title')}</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(t('landing.who.items', { returnObjects: true }) as string[]).map((item, i) => {
            const Icon = [Users, Building2, Palette, GraduationCap][i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card p-6 text-center card-hover group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 mx-auto mb-4 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="font-bold">{item}</div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-100 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 text-xs font-semibold mb-4">
            <Layers className="w-3.5 h-3.5" />
            الرحلة الكاملة
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-black">كيف تعمل المنظومة؟</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">أربع مراحل منطقية متتابعة — يمكنك المرور بها كاملة أو استخدام أي خدمة لوحدها</p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 start-[10%] end-[10%] h-1 bg-gradient-to-r from-amber-400 via-brand-500 to-accent-500 rounded-full opacity-20" />

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { step: 1, icon: Lightbulb, title: 'اكتشاف', desc: 'اختبر فكرتك، افهم السوق', gradient: 'from-amber-400 to-orange-500', stage: 'idea' },
              { step: 2, icon: BookOpen, title: 'تصميم', desc: 'ابنِ منهجك التفصيلي', gradient: 'from-brand-500 to-indigo-600', stage: 'curriculum' },
              { step: 3, icon: Megaphone, title: 'إطلاق', desc: 'صفحة مبيعات + إيميلات + تسعير', gradient: 'from-pink-500 to-rose-500', stage: 'sales' },
              { step: 4, icon: TrendingUp, title: 'نمو', desc: 'خطة الوصول لأول 100 طالب', gradient: 'from-teal-400 to-cyan-600', stage: 'growth' },
            ].map((s, i) => (
              <motion.button
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                onClick={() => setStage(s.stage as any)}
                className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-start group hover:shadow-xl transition-shadow"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg mx-auto relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                  <s.icon className="w-10 h-10" />
                </div>
                <div className="text-center mt-4">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">المرحلة {s.step}</div>
                  <h3 className="font-display font-bold text-xl mt-1">{s.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICE CATALOG ============ */}
      <section>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-black">{t('landing.services.title')}</h2>
          <p className="text-slate-500 mt-3">10 خدمات أساسية — كل واحدة قابلة للتشغيل مستقلة</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map(({ code, stage, icon: Icon, gradient }, i) => (
            <motion.button
              key={code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setStage(stage)}
              className="card card-hover p-5 text-start group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all relative`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-sm mb-1 relative">{t(`services.${code}.name`)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 relative">{t(`services.${code}.desc`)}</div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ============ TESTIMONIALS / SOCIAL PROOF ============ */}
      <section>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-5xl font-black">ماذا تنتج؟</h2>
          <p className="text-slate-500 mt-3">مخرجات احترافية جاهزة للعرض على المستثمرين والمجالس والعملاء</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              title: 'منهج تفصيلي',
              meta: 'PDF · Word · HTML · PPT',
              desc: 'وحدات عميقة بدروس ومفاهيم جوهرية وتمارين تطبيقية ومعايير تقييم',
              icon: BookOpen,
              gradient: 'from-brand-500 to-indigo-600',
              bullets: ['5–10 وحدات تفصيلية', 'تمارين بمعايير نجاح', 'أمثلة واقعية', 'ملاحظات للمدرب'],
            },
            {
              title: 'تقرير بحث سوق',
              meta: 'PDF · HTML · JSON',
              desc: 'تحليل SWOT، شخصيات المشترين، منافسون بالأسعار، واتجاهات ناشئة',
              icon: BarChart3,
              gradient: 'from-cyan-400 to-blue-500',
              bullets: ['تحليل استشاري عميق', 'SWOT كامل', '3 Buyer Personas', 'نطاق تسعير السوق'],
            },
            {
              title: 'حزمة الإطلاق',
              meta: 'كل الصيغ · Bundle واحد',
              desc: 'صفحة مبيعات + تسلسل بريدي + حزم تسعير + خطة نمو في ملف واحد احترافي',
              icon: Rocket,
              gradient: 'from-accent-500 to-pink-600',
              bullets: ['5 رسائل بريدية', '3 باقات تسعير', 'خطة 8 أسابيع للنمو', 'قابل للتصدير كحزمة'],
            },
          ].map((o, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card card-hover p-6 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${o.gradient} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                <o.icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">{o.meta}</div>
              <h3 className="font-display font-bold text-xl mb-2">{o.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{o.desc}</p>
              <ul className="space-y-1.5 text-xs">
                {o.bullets.map((b, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES MATRIX ============ */}
      <section>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-5xl font-black">كل ما تحتاجه في مكان واحد</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Zap, title: 'سرعة فائقة', desc: 'توليد منهج متكامل في أقل من دقيقة' },
            { icon: Brain, title: 'محتوى عميق', desc: 'ليس outline — بل دروس تفصيلية وتمارين ومصادر' },
            { icon: GlobeIcon, title: 'عربي + إنجليزي', desc: 'RTL/LTR تلقائي بكل تفاصيله' },
            { icon: FileText, title: '5 صيغ تصدير', desc: 'PDF و Word و HTML و PowerPoint و JSON' },
            { icon: ShieldCheck, title: 'خصوصية كاملة', desc: 'كل شيء على جهازك — لا خوادم تخزن بياناتك' },
            { icon: Clock, title: 'يعمل أوفلاين', desc: 'بعد التحميل الأول، التطبيق يعمل بلا إنترنت' },
            { icon: Award, title: 'جودة احترافية', desc: 'مخرجات جاهزة للعرض على مستثمرين ومجالس' },
            { icon: Layers, title: 'Undo/Redo', desc: 'تراجع غير محدود في محرر المناهج' },
            { icon: BarChart3, title: 'تحليلات مدمجة', desc: 'KPIs على 3 مستويات: خدمة، رحلة، أعمال' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="card p-5 card-hover group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500/10 to-accent-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5" />
                </div>
                <div className="font-bold">{f.title}</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ DIAGNOSTIC ============ */}
      <section className="card p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
            <Target className="w-3.5 h-3.5" />
            تشخيص ذكي
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-black">{t('landing.diagnostic.title')}</h2>
          <p className="text-slate-500 mt-3">{t('landing.diagnostic.subtitle')}</p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-3 relative">
          {(['q1', 'q2', 'q3', 'q4'] as const).map((q, i) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-sm font-medium">{t(`landing.diagnostic.${q}`)}</span>
              <div className="flex gap-2">
                <button onClick={() => setAnswers({ ...answers, [q]: true })} className={`btn !px-5 !py-1.5 text-xs ${answers[q] === true ? 'btn-primary' : 'btn-secondary'}`}>
                  {t('landing.diagnostic.yes')}
                </button>
                <button onClick={() => setAnswers({ ...answers, [q]: false })} className={`btn !px-5 !py-1.5 text-xs ${answers[q] === false ? 'btn-primary' : 'btn-secondary'}`}>
                  {t('landing.diagnostic.no')}
                </button>
              </div>
            </motion.div>
          ))}
          <button disabled={Object.values(answers).some((a) => a === null)} onClick={() => setRecommend(getRecommendation())} className="btn-primary w-full mt-5">
            {t('landing.diagnostic.recommend')}
            <ArrowRight className="w-4 h-4 flip-rtl" />
          </button>
          {recommend && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-5 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-950/40 dark:to-accent-950/40 border border-brand-200 dark:border-brand-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">{t('landing.diagnostic.result')}</div>
                  <div className="font-bold text-lg">{t(`nav.${recommend}`)}</div>
                </div>
                <button onClick={() => setStage(recommend)} className="btn-primary !text-xs !py-2 !px-3">{t('common.start')}</button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-5xl font-black">الأسئلة الشائعة</h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {[
            { q: 'هل التطبيق مجاني؟', a: 'نعم، التطبيق مجاني بالكامل. في الوضع التجريبي تحصل على محتوى عميق بلا اتصال. لتوليد محتوى مخصص لموضوعك بدقة، أضف مفتاح Gemini المجاني من Google AI Studio.' },
            { q: 'هل بياناتي آمنة؟', a: 'بياناتك على جهازك فقط في localStorage. لا نرسل أي شيء لخوادمنا. إذا فعّلت AI، مفتاحك يُستخدم مباشرة بين متصفحك والمزوّد.' },
            { q: 'هل يعمل بدون إنترنت؟', a: 'نعم، بعد التحميل الأول يعمل أوفلاين. الاتصال يُستخدم فقط عند استدعاء AI خارجي.' },
            { q: 'ما الفرق بين الخدمة المنفردة والرحلة الكاملة؟', a: 'الخدمة المنفردة تحل مهمة واحدة (مثلاً فقط صفحة المبيعات). الرحلة الكاملة تمر بالخدمات متتابعة وتورث المخرجات بينها.' },
            { q: 'هل يمكنني تصدير المخرجات؟', a: 'نعم، كل خدمة تدعم التصدير إلى PDF و Word و HTML و PowerPoint و JSON — مع دعم كامل للعربية و RTL.' },
            { q: 'ما الذي يميّز هذا التطبيق عن ChatGPT مباشرة؟', a: 'التطبيق يطبّق إطارًا استشاريًا مُنظمًا عبر 16 خدمة متكاملة، مع مخرجات احترافية جاهزة بتصدير متعدد الصيغ، تاريخ، مراجعة، وحوكمة — كل ذلك بدون الحاجة لتكرار prompts.' },
          ].map((f, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="card p-5 cursor-pointer group"
            >
              <summary className="flex items-center justify-between list-none">
                <span className="font-semibold">{f.q}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative">
        <div className="card p-10 md:p-16 bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 text-white text-center relative overflow-hidden">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-0 left-1/4 w-64 h-64 bg-accent-400/30 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-300/30 rounded-full blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-xs font-semibold mb-6 border border-white/20">
              <Star className="w-3.5 h-3.5 text-amber-300" />
              ابدأ الآن — بلا مخاطر
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-black mb-4 leading-tight">
              منتجك التعليمي القادم<br />
              <span className="bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent">على بُعد دقائق</span>
            </h2>
            <p className="text-lg text-white/85 max-w-2xl mx-auto mb-10">
              لا تنتظر أكثر. ابدأ بإحدى خدمات المنظومة الآن، وانظر كيف يتحول التخطيط إلى مخرجات جاهزة للعرض.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={startJourney} className="btn bg-white text-brand-700 hover:bg-white/95 font-bold text-base px-7 py-3.5 shadow-2xl shadow-brand-900/50">
                <Rocket className="w-5 h-5" />
                ابدأ رحلتي الكاملة الآن
              </button>
              <button onClick={() => setStage('catalog')} className="btn bg-white/10 backdrop-blur text-white hover:bg-white/20 border border-white/20 text-base px-6 py-3.5">
                استكشف الخدمات
              </button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300" /><span>يعمل فورًا بدون حساب</span></div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-300" /><span>بياناتك ملكك</span></div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-300" /><span>تفعيل AI اختياري</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
