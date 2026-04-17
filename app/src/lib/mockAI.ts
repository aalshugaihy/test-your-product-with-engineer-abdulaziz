// Mock AI helpers — deterministic, locale-aware stubs that simulate LLM output.
// Replace with real API calls later. Keeps the UX flow intact offline.

import { v4 as uuid } from 'uuid'
import type {
  IdeaReport,
  ResearchReport,
  SalesPageDraft,
  EmailSequence,
  PricingPackages,
  GrowthPlan,
} from '@/types'

const delay = <T,>(v: T, ms = 700): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms))

export const generateIdeas = async (
  courseId: string,
  expertise: string,
  audience: string,
  transformation: string
): Promise<IdeaReport> => {
  const base = expertise || 'مجالك'
  const ideas = [
    {
      id: uuid(),
      title: `${base} للمحترفين: من الأساسيات إلى الإنتاج`,
      demandSignal: 'ارتفاع عمليات البحث بنسبة 38% خلال 6 أشهر + مجتمعات نشطة.',
      credibilityFit: 'قوي — يعتمد على خبرتك المباشرة في المجال.',
      gap: 'معظم الدورات المنافسة نظرية؛ لا يوجد منهج تطبيقي قوي.',
      isStrongest: true,
    },
    {
      id: uuid(),
      title: `ورشة ${base} المكثّفة: 30 يوماً إلى مشروع حقيقي`,
      demandSignal: 'طلب متوسط مع تحويل أعلى لورش قصيرة.',
      credibilityFit: 'متوسط إلى قوي.',
      gap: 'ندرة الورش القصيرة عالية الجودة بالعربية.',
      isStrongest: false,
    },
    {
      id: uuid(),
      title: `دليل ${base} للقادة: قرارات أذكى، نتائج أسرع`,
      demandSignal: 'طلب عالي من الشرائح الإدارية مع استعداد أعلى للدفع.',
      credibilityFit: 'قوي إذا كان لديك تجارب قيادية.',
      gap: 'قلّة المحتوى الموجّه لصنّاع القرار.',
      isStrongest: false,
    },
  ]
  const positioning = `لـ${audience || 'المحترفين الطموحين'}، الذين يعانون من ${transformation || 'الفجوة بين المعرفة والتطبيق'}، نقدم ${ideas[0].title} — منهج تطبيقي مبني على نتائج ملموسة، لا نظريات.`

  return delay({
    id: uuid(),
    courseId,
    ideas,
    positioningStatement: positioning,
    updatedAt: Date.now(),
    status: 'draft',
  })
}

export const runDeepResearch = async (
  courseId: string,
  topic: string,
  audience: string,
  depth: 'shallow' | 'medium' | 'deep'
): Promise<ResearchReport> => {
  const multiplier = depth === 'deep' ? 3 : depth === 'medium' ? 2 : 1
  const findings = [
    `السوق في ${topic} ينمو بوتيرة صحية مع تنوع في نماذج الأعمال.`,
    `${audience || 'الجمهور المستهدف'} يبحث عن حلول عملية وسريعة التطبيق.`,
    'المحتوى النظري مُشبع؛ الفجوة في التطبيق العملي والمتابعة.',
    'التسعير المتوسط للسوق بين 300–1200 دولار للدورات الاحترافية.',
    'القنوات الأكثر فعالية: المحتوى الطويل + البريد + المجتمعات المتخصصة.',
    'معدل إتمام الدورات المنافسة لا يتجاوز 15% — فرصة لمنصة بنموذج تفاعلي.',
    'الشركات الناشئة تدفع أعلى من الأفراد بمتوسط 3x.',
  ].slice(0, 3 + multiplier)

  const coreAnalysis = `## تحليل عميق لسوق ${topic}

### حجم السوق والنمو
السوق العالمي لـ **${topic}** يُقدَّر بين 2.5–4 مليار دولار، مع معدل نمو سنوي مركب (CAGR) بين **12% و 18%**. الشريحة المستهدفة (${audience || 'المحترفون الطموحون'}) تمثل ~35% من القيمة الكلية.

### ديناميكيات التنافس
| الفئة | اللاعبون | نقاط القوة | الثغرات |
|---|---|---|---|
| المناهج الطويلة | A, B | عمق المحتوى | ضعف التطبيق |
| الورش القصيرة | C, D | سرعة النتائج | سطحية |
| المحتوى المجاني | YouTube, Medium | وصول | لا مساءلة |

### أكبر ثلاث فرص مكتشفة
1. **التطبيق المُراقَب** — منصة تربط المحتوى بمشاريع حقيقية وتقييم دوري.
2. **المجتمع المُنظَّم** — شبكة نظراء موجهة ومُهيكلة بدلاً من دردشة عشوائية.
3. **التسعير القائم على النتيجة** — نموذج "ادفع عند الإنجاز" كميزة تنافسية.

### السلوك الشرائي
- **دورة القرار**: 7–14 يومًا للأفراد، 30–60 يومًا للشركات.
- **محركات القرار**: دراسات حالة > سمعة المدرب > السعر > المنهج المفصّل.
- **أهم اعتراض**: "لا أملك الوقت" — يُحسم بتصميم دورات بنمط 4 ساعات أسبوعيًا.

> **التوصية التنفيذية:** ركّز على شريحة ${audience || 'المحترفين'} في الشركات متوسطة الحجم، بنموذج هجين: محتوى مُسجَّل + جلسات حية أسبوعية + مشروع تطبيقي موثّق.`

  return delay({
    id: uuid(),
    courseId,
    topic,
    audience,
    depth,
    findings,
    competitors: [
      'منافس A — منهج طويل نظري (6 أشهر، $1,200)',
      'منافس B — ورش قصيرة (أسبوعين، $400)',
      'منافس C — محتوى مجاني على YouTube',
      'منافس D — Bootcamp مكثّف (شهر، $2,500)',
    ],
    trends: [
      'التعلم الدقيق (Micro-learning) — جلسات 15 دقيقة',
      'الذكاء الاصطناعي كمساعد تعلم شخصي',
      'المجتمعات المغلقة المدفوعة (Discord, Circle)',
      'التوثيق العام للتعلّم (Build in Public)',
    ],
    painPoints: [
      'كثرة المحتوى، قلة النتائج — شلل التحليل',
      'غياب المساءلة الشخصية والمتابعة',
      'صعوبة قياس التقدم الفعلي',
      'الفجوة بين النظرية والتطبيق المهني',
    ],
    keywords: [topic, `دورة ${topic}`, `${topic} للمحترفين`, `تعلّم ${topic}`, `${topic} عملي`],
    sources: [
      'Google Trends — آخر 24 شهرًا',
      'Reddit Communities (r/learn, r/${topic})',
      'YouTube Analytics — القنوات المنافسة',
      ...(depth === 'deep'
        ? [
            'LinkedIn Sales Navigator — ${audience}',
            'Industry Reports (Gartner, Statista)',
            'Product Hunt — منتجات مشابهة',
            'Glassdoor — اتجاهات التوظيف',
          ]
        : []),
    ],
    // Enhanced fields
    marketSize: '$2.5B–$4B عالميًا',
    growthRate: 'CAGR 12–18% سنويًا',
    swot: {
      strengths: [
        'طلب مُثبت ومستقر',
        'هامش ربح مرتفع',
        'بنية تحتية جاهزة (منصات، بريد، دفع)',
      ],
      weaknesses: [
        'كثرة البدائل المجانية',
        'دورة قرار طويلة للشركات',
        'تكلفة اكتساب العملاء في ارتفاع',
      ],
      opportunities: [
        'شريحة الشركات الناشئة غير مخدومة جيدًا',
        'فجوة في التطبيق العملي',
        'إدماج AI كمساعد تعلم',
      ],
      threats: [
        'دخول لاعبين كبار (Coursera, Udemy for Business)',
        'تغيّر خوارزميات القنوات المجانية',
        'تراجع انتباه المستهلك',
      ],
    },
    personas: [
      {
        name: 'سارة — مديرة تسويق في شركة ناشئة',
        demographics: '28–34 سنة، حضرية، شركات 10–50 موظف',
        motivations: 'ترقية، إثبات أثر مقاس، مهارات جديدة',
        objections: 'لا وقت كافٍ، شك في جودة الدورات السابقة',
      },
      {
        name: 'خالد — مستشار مستقل',
        demographics: '35–45 سنة، خبرة 10+ سنوات',
        motivations: 'توسيع خدماته، رفع معدل الأتعاب',
        objections: 'السعر، هل سيتعلم شيئًا جديدًا فعلاً؟',
      },
      {
        name: 'ليلى — مديرة تدريب في شركة',
        demographics: '32–42 سنة، قرارات جماعية',
        motivations: 'تطوير الفريق، KPIs واضحة',
        objections: 'موافقة الإدارة، ROI مُثبت',
      },
    ],
    pricingBand: { low: 297, mid: 697, high: 1497, currency: 'USD' },
    priorityScore: depth === 'deep' ? 85 : depth === 'medium' ? 72 : 58,
    coreAnalysis,
    updatedAt: Date.now(),
  }, 1200)
}

export const generateSalesPage = async (
  courseId: string,
  offer: string,
  audience: string,
  price: number
): Promise<SalesPageDraft> =>
  delay({
    id: uuid(),
    courseId,
    headline: `${offer} — النتيجة التي انتظرتها، بدون التشتت`,
    problem: `إذا كنت ${audience}، فأنت تعرف شعور الاستثمار في دورات لا تُغيّر شيئاً.`,
    solution: `${offer} منهج تطبيقي مبني على التحوّل لا على المحتوى، مع مخرجات ملموسة في كل وحدة.`,
    offerStructure: [
      'منهج كامل ${offer}',
      '5 جلسات أسئلة وأجوبة مباشرة',
      'مكتبة قوالب جاهزة',
      'مجتمع مغلق للخريجين',
      'شهادة إتمام',
    ],
    objections: [
      'ليس لديّ وقت — الدورة مصممة لـ 4 ساعات أسبوعياً.',
      'هل سينجح معي؟ — ضمان استرداد 14 يوماً.',
      'السعر مرتفع — الاستثمار يعود خلال أول تطبيق.',
    ],
    cta: `سجّل الآن — بسعر افتتاحي ${price}`,
    status: 'draft',
  }, 700)

export const generateEmailSequence = async (
  courseId: string,
  offer: string
): Promise<EmailSequence> =>
  delay({
    id: uuid(),
    courseId,
    emails: [
      {
        id: uuid(),
        subject: `قصة غيّرت نظرتي لـ ${offer}`,
        job: 'بناء علاقة + طرح المشكلة',
        timing: 'اليوم 1 — 9 صباحاً',
        body: `مرحباً،\n\nأريد أن أحكي لك قصة قصيرة...`,
      },
      {
        id: uuid(),
        subject: `السبب الحقيقي وراء ${offer}`,
        job: 'شرح الحل والفلسفة',
        timing: 'اليوم 2 — 10 صباحاً',
        body: 'معظم الدورات تعلّمك "ماذا"، أما نحن فنعلمك "كيف ولماذا"...',
      },
      {
        id: uuid(),
        subject: 'هذا هو العرض الكامل',
        job: 'كشف العرض',
        timing: 'اليوم 3 — 11 صباحاً',
        body: 'اليوم أكشف لك المنهج الكامل + المكافآت + السعر...',
      },
      {
        id: uuid(),
        subject: 'اعتراضات صادقة — وإجاباتي عليها',
        job: 'معالجة الاعتراضات',
        timing: 'اليوم 4 — 3 عصراً',
        body: 'تلقيت أسئلة مهمة، أريد أن أجيب عنها بوضوح...',
      },
      {
        id: uuid(),
        subject: 'آخر فرصة — التسجيل يُغلق الليلة',
        job: 'إغلاق بعجلة حقيقية',
        timing: 'اليوم 5 — 6 مساءً',
        body: 'في منتصف الليل يُغلق التسجيل لهذه الدفعة...',
      },
    ],
    status: 'draft',
  }, 700)

export const generatePricingPackages = async (
  courseId: string,
  outcomeValue: string
): Promise<PricingPackages> =>
  delay({
    id: uuid(),
    courseId,
    outcomeValue,
    tiers: [
      {
        id: uuid(),
        name: 'أساسية',
        price: 297,
        upgradeReason: '—',
        valueJustification: 'وصول كامل للمنهج + المجتمع.',
        features: ['المنهج الكامل', 'المجتمع', 'شهادة إتمام'],
      },
      {
        id: uuid(),
        name: 'احترافية',
        price: 597,
        upgradeReason: 'للمحترفين الذين يريدون مساراً أسرع ومتابعة.',
        valueJustification: 'جلسات أسئلة مباشرة + قوالب + مراجعات فردية.',
        features: ['كل ما سبق', '5 جلسات Q&A', 'قوالب احترافية', 'مراجعة مشروع واحد'],
      },
      {
        id: uuid(),
        name: 'نخبة',
        price: 1497,
        upgradeReason: 'لمن يريدون نتائج مضمونة بإشراف شخصي.',
        valueJustification: 'إشراف شخصي مباشر + ضمان إنجاز المشروع.',
        features: ['كل ما سبق', '3 جلسات 1:1', 'مراجعة غير محدودة', 'وصول مدى الحياة'],
      },
    ],
    status: 'draft',
  }, 600)

export const generateGrowthPlan = async (
  courseId: string,
  audienceSize: number,
  timelineWeeks: number
): Promise<GrowthPlan> =>
  delay({
    id: uuid(),
    courseId,
    audienceSize,
    timelineWeeks,
    channels: [
      { name: 'محتوى طويل (مقالات/نشرة)', reason: 'بناء الثقة وتحقيق SEO' },
      { name: 'LinkedIn + X', reason: 'وصول عضوي سريع لصنّاع القرار' },
      { name: 'شراكات مع مجتمعات', reason: 'وصول مكثّف لجمهور مؤهل' },
      { name: 'ويبينار مجاني', reason: 'تحويل مباشر لقائمة الانتظار' },
    ],
    waitlistStrategy: 'صفحة هبوط + نموذج مكافآت حصرية لأول 50 مسجّل.',
    earlyBird: 'خصم 40% لأول 20 طالب + مكافأة جلسة فردية.',
    milestones: Array.from({ length: Math.max(4, timelineWeeks) }, (_, i) => ({
      week: i + 1,
      goal:
        i === 0
          ? 'إطلاق صفحة قائمة الانتظار + 3 محتويات رئيسية'
          : i === 1
          ? 'ويبينار مجاني + شراكتان'
          : i === 2
          ? 'فتح التسجيل المبكر'
          : i === 3
          ? 'حملة إطلاق رسمية'
          : `متابعة + تحسين — الأسبوع ${i + 1}`,
    })),
    status: 'draft',
  }, 700)
