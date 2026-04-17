/**
 * AI-powered generators. Each function tries the real AI provider first,
 * and falls back to the rich deterministic mocks on any failure (rate
 * limit, missing key, invalid response, etc.).
 */

import { v4 as uuid } from 'uuid'
import type {
  IdeaReport,
  ResearchReport,
  SalesPageDraft,
  EmailSequence,
  PricingPackages,
  GrowthPlan,
  CurriculumBlueprint,
  Module,
} from '@/types'
import { callAI, extractJSON, withAIFallback } from './aiProvider'
import * as mock from './mockAI'
import { generateExpertCurriculum } from './expertCurriculum'

const SYSTEM_PROMPT_AR = `أنت استشاري تنفيذي محنك في تصميم المنتجات التعليمية، تتحدث العربية بطلاقة.
مخرجاتك عميقة، واقعية، قابلة للتنفيذ — ليست عبارات عامة.
اكتب دائماً بلغة المستخدم (العربية) ما لم يُطلب غير ذلك.
عندما يُطلب JSON، أعطِ JSON صحيحًا فقط بدون أي نص خارجه.`

// --------------------------------------------------------------------
// Idea Discovery
// --------------------------------------------------------------------
export const aiGenerateIdeas = async (
  courseId: string,
  expertise: string,
  audience: string,
  transformation: string
): Promise<IdeaReport> =>
  withAIFallback(
    async () => {
      const prompt = `أنشئ تقرير اكتشاف فكرة دورة تدريبية:
- مجال الخبرة: ${expertise}
- الجمهور المستهدف: ${audience}
- التحوّل المطلوب: ${transformation}

أعطني JSON بالهيكل التالي بالضبط (بدون أي نص خارج JSON):
{
  "ideas": [
    { "title": "...", "demandSignal": "...", "credibilityFit": "...", "gap": "...", "isStrongest": true },
    { "title": "...", "demandSignal": "...", "credibilityFit": "...", "gap": "...", "isStrongest": false },
    { "title": "...", "demandSignal": "...", "credibilityFit": "...", "gap": "...", "isStrongest": false }
  ],
  "positioningStatement": "لـ[الجمهور] الذين يعانون من [المشكلة]، نقدم [الحل] — [التمايز]."
}

قواعد صارمة:
- 3 أفكار بالضبط
- واحدة فقط isStrongest = true
- كل فكرة بعنوان واقعي (ليس عامًا)
- demandSignal باستشهاد بمؤشر سوق حقيقي
- gap يحدد ما لا يقدمه المنافسون الحاليون
- positioningStatement بصيغة الجملة الواحدة الشهيرة (Madsen formula)`

      const raw = await callAI({
        system: SYSTEM_PROMPT_AR,
        prompt,
        temperature: 0.8,
        json: true,
      })

      const parsed = extractJSON<{
        ideas: { title: string; demandSignal: string; credibilityFit: string; gap: string; isStrongest: boolean }[]
        positioningStatement: string
      }>(raw)

      const result: IdeaReport = {
        id: uuid(),
        courseId,
        ideas: parsed.ideas.map((i) => ({ ...i, id: uuid() })),
        positioningStatement: parsed.positioningStatement,
        updatedAt: Date.now(),
        status: 'draft',
      }
      return result
    },
    () => mock.generateIdeas(courseId, expertise, audience, transformation)
  )

// --------------------------------------------------------------------
// Deep Research
// --------------------------------------------------------------------
export const aiRunDeepResearch = async (
  courseId: string,
  topic: string,
  audience: string,
  depth: 'shallow' | 'medium' | 'deep'
): Promise<ResearchReport> =>
  withAIFallback(
    async () => {
      const prompt = `أنت محلل أبحاث سوق خبير. أنشئ تقريرًا ${depth === 'deep' ? 'عميقًا شاملاً' : depth === 'medium' ? 'متوسط العمق' : 'سريعًا'} عن:
- الموضوع: ${topic}
- الجمهور: ${audience}

أعطني JSON بالهيكل التالي فقط:
{
  "findings": ["نتيجة 1 محددة ومدعومة", "...", "..."],
  "competitors": ["منافس مع السعر والنموذج", "...", "..."],
  "trends": ["اتجاه ناشئ", "...", "..."],
  "painPoints": ["ألم حقيقي للجمهور", "...", "..."],
  "keywords": ["كلمة مفتاحية", "..."],
  "sources": ["Google Trends", "..."],
  "marketSize": "$X–Y مليار/مليون",
  "growthRate": "CAGR X%",
  "priorityScore": 72,
  "swot": {
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "opportunities": ["...", "..."],
    "threats": ["...", "..."]
  },
  "personas": [
    { "name": "اسم — المسمى", "demographics": "...", "motivations": "...", "objections": "..." },
    { "name": "...", "demographics": "...", "motivations": "...", "objections": "..." },
    { "name": "...", "demographics": "...", "motivations": "...", "objections": "..." }
  ],
  "pricingBand": { "low": 297, "mid": 697, "high": 1497, "currency": "USD" },
  "coreAnalysis": "تحليل عميق بصيغة Markdown — استخدم # ## جداول قوائم >= 400 كلمة"
}

قواعد:
- coreAnalysis يجب أن يكون تحليلاً استشاريًا حقيقيًا بعمق، بـ Markdown صحيح مع جداول وقوائم
- 3 منافسين محددين بالاسم (تقديريًا إن لزم)
- priorityScore رقم 0-100 منطقي
- كل عناصر SWOT ≥ 2 نقاط
- 3 شخصيات مختلفة الخلفيات`

      const raw = await callAI({
        system: SYSTEM_PROMPT_AR,
        prompt,
        temperature: 0.7,
        maxTokens: 8000,
        json: true,
      })

      const parsed = extractJSON<any>(raw)

      const result: ResearchReport = {
        id: uuid(),
        courseId,
        topic,
        audience,
        depth,
        findings: parsed.findings || [],
        competitors: parsed.competitors || [],
        trends: parsed.trends || [],
        painPoints: parsed.painPoints || [],
        keywords: parsed.keywords || [],
        sources: parsed.sources || [],
        marketSize: parsed.marketSize,
        growthRate: parsed.growthRate,
        priorityScore: parsed.priorityScore,
        swot: parsed.swot,
        personas: parsed.personas,
        pricingBand: parsed.pricingBand,
        coreAnalysis: parsed.coreAnalysis,
        updatedAt: Date.now(),
      }
      return result
    },
    () => mock.runDeepResearch(courseId, topic, audience, depth)
  )

// --------------------------------------------------------------------
// Sales Page
// --------------------------------------------------------------------
export const aiGenerateSalesPage = async (
  courseId: string,
  offer: string,
  audience: string,
  price: number
): Promise<SalesPageDraft> =>
  withAIFallback(
    async () => {
      const prompt = `أنت كاتب إعلانات تحويلية خبير. أنشئ مسودة صفحة مبيعات:
- المنتج: ${offer}
- الجمهور: ${audience}
- السعر: $${price}

JSON بالهيكل:
{
  "headline": "عنوان عاطفي يربط بألم الجمهور ووعد تحوّل محدد",
  "problem": "فقرة تُسمّي ألم الجمهور بدقة ولا تعظيمًا مصطنعًا — 3–5 جمل",
  "solution": "فقرة تقدّم الحل مع آليته المميزة وليس مجرد مزايا — 3–5 جمل",
  "offerStructure": ["بند في العرض 1", "...", "...", "...", "..."],
  "objections": ["اعتراض محتمل + إجابة موجزة", "...", "..."],
  "cta": "نص الزر النهائي بعبارة أمرية واضحة"
}

قواعد:
- headline ليس عامًا — يحتوي رقمًا أو تحولاً محددًا
- 5 عناصر في offerStructure
- 3 اعتراضات مع إجاباتها
- CTA ≤ 8 كلمات`

      const raw = await callAI({
        system: SYSTEM_PROMPT_AR,
        prompt,
        temperature: 0.8,
        json: true,
      })

      const parsed = extractJSON<any>(raw)

      const result: SalesPageDraft = {
        id: uuid(),
        courseId,
        headline: parsed.headline,
        problem: parsed.problem,
        solution: parsed.solution,
        offerStructure: parsed.offerStructure || [],
        objections: parsed.objections || [],
        cta: parsed.cta,
        status: 'draft',
      }
      return result
    },
    () => mock.generateSalesPage(courseId, offer, audience, price)
  )

// --------------------------------------------------------------------
// Email Sequence
// --------------------------------------------------------------------
export const aiGenerateEmailSequence = async (
  courseId: string,
  offer: string
): Promise<EmailSequence> =>
  withAIFallback(
    async () => {
      const prompt = `أنت خبير email marketing. صمم تسلسل إطلاق 5 رسائل لمنتج: ${offer}

JSON:
{
  "emails": [
    { "subject": "عنوان جذاب لـ open rate عالي", "job": "مهمة واحدة واضحة", "timing": "اليوم X - HH:MM", "body": "محتوى الرسالة كاملاً 150-250 كلمة — مع قصة، حجة، CTA واضح" },
    ... (5 رسائل)
  ]
}

ترتيب الرسائل:
1. قصة + طرح المشكلة
2. شرح الحل والآلية
3. كشف العرض + السعر
4. معالجة الاعتراضات + اجتماعي
5. إغلاق بعجلة حقيقية (ليست مصطنعة)

قواعد:
- 5 رسائل
- كل body ≥ 150 كلمة بمحتوى حقيقي
- subject لا يتجاوز 50 حرفًا`

      const raw = await callAI({
        system: SYSTEM_PROMPT_AR,
        prompt,
        temperature: 0.8,
        maxTokens: 6000,
        json: true,
      })

      const parsed = extractJSON<any>(raw)
      const result: EmailSequence = {
        id: uuid(),
        courseId,
        emails: (parsed.emails || []).map((e: any) => ({ ...e, id: uuid() })),
        status: 'draft',
      }
      return result
    },
    () => mock.generateEmailSequence(courseId, offer)
  )

// --------------------------------------------------------------------
// Pricing
// --------------------------------------------------------------------
export const aiGeneratePricingPackages = async (
  courseId: string,
  outcomeValue: string
): Promise<PricingPackages> =>
  withAIFallback(
    async () => {
      const prompt = `أنت استراتيجي تسعير. صمم 3 باقات لمنتج تعليمي بناء على قيمة النتيجة التالية:
${outcomeValue}

JSON:
{
  "tiers": [
    { "name": "أساسية", "price": 297, "upgradeReason": "—", "valueJustification": "مبرر القيمة", "features": ["ميزة", "..."] },
    { "name": "احترافية", "price": 697, "upgradeReason": "لمن يريدون X", "valueJustification": "...", "features": ["كل ما سبق", "...", "..."] },
    { "name": "نخبة", "price": 1497, "upgradeReason": "لمن يريدون Y", "valueJustification": "...", "features": ["كل ما سبق", "...", "..."] }
  ]
}

قواعد:
- الأسعار تتضاعف تقريبًا بين المستويات
- كل tier features يشمل "كل ما سبق" + مميزات إضافية
- upgradeReason تحدد شريحة ترفعها`

      const raw = await callAI({
        system: SYSTEM_PROMPT_AR,
        prompt,
        temperature: 0.7,
        json: true,
      })

      const parsed = extractJSON<any>(raw)
      const result: PricingPackages = {
        id: uuid(),
        courseId,
        outcomeValue,
        tiers: (parsed.tiers || []).map((t: any) => ({ ...t, id: uuid() })),
        status: 'draft',
      }
      return result
    },
    () => mock.generatePricingPackages(courseId, outcomeValue)
  )

// --------------------------------------------------------------------
// Growth Plan
// --------------------------------------------------------------------
export const aiGenerateGrowthPlan = async (
  courseId: string,
  audienceSize: number,
  timelineWeeks: number
): Promise<GrowthPlan> =>
  withAIFallback(
    async () => {
      const prompt = `أنت استراتيجي نمو لمنتجات تعليمية. صمم خطة وصول إلى 100 طالب:
- الجمهور الحالي: ${audienceSize}
- الإطار الزمني: ${timelineWeeks} أسبوع

JSON:
{
  "channels": [
    { "name": "اسم القناة", "reason": "لماذا هذه تحديدًا لهذا المنتج" },
    ... (4 قنوات)
  ],
  "waitlistStrategy": "فقرة استراتيجية مفصّلة",
  "earlyBird": "عرض التبكير بشروط محددة",
  "milestones": [
    { "week": 1, "goal": "..." },
    ... (${timelineWeeks} محطات)
  ]
}

قواعد:
- 4 قنوات مخصصة (ليست قوالب عامة)
- محطة لكل أسبوع
- earlyBird له سقف واضح وحافز محدد`

      const raw = await callAI({
        system: SYSTEM_PROMPT_AR,
        prompt,
        temperature: 0.7,
        maxTokens: 4000,
        json: true,
      })

      const parsed = extractJSON<any>(raw)
      const result: GrowthPlan = {
        id: uuid(),
        courseId,
        audienceSize,
        timelineWeeks,
        channels: parsed.channels || [],
        waitlistStrategy: parsed.waitlistStrategy || '',
        earlyBird: parsed.earlyBird || '',
        milestones: parsed.milestones || [],
        status: 'draft',
      }
      return result
    },
    () => mock.generateGrowthPlan(courseId, audienceSize, timelineWeeks)
  )

// --------------------------------------------------------------------
// Curriculum — AI-powered deep content
// --------------------------------------------------------------------
export const aiGenerateCurriculumModules = async (
  topic: string,
  audience: string,
  startingPoint: string,
  destination: string,
  maxModules: number
): Promise<Module[]> =>
  withAIFallback(
    async () => {
      const prompt = `أنت خبير تصميم مناهج تدريبية بخبرة 15 سنة. صمم منهج تدريبي عميق ومفصّل:
- الموضوع: ${topic}
- الجمهور: ${audience}
- نقطة البداية: ${startingPoint}
- الوجهة: ${destination}
- عدد الوحدات: ${maxModules}

لكل وحدة، أنشئ محتوى حقيقيًا (ليس placeholder):

JSON:
{
  "modules": [
    {
      "title": "عنوان الوحدة المحدد",
      "summary": "ملخص 2-3 جمل يصف القيمة",
      "transformation": "من ... إلى ... في ${topic}",
      "content": "فقرة افتتاحية 80-120 كلمة للوحدة",
      "durationMins": 90,
      "objectives": ["يُعرّف المتعلم...", "يُطبّق المتعلم...", ...3-4 أهداف],
      "keyConcepts": ["مفهوم 1 محدد", ...4-5 مفاهيم],
      "lessonSections": [
        { "heading": "عنوان الدرس 1", "body": "محتوى Markdown عميق 250-400 كلمة مع جداول وقوائم عند الحاجة" },
        { "heading": "عنوان الدرس 2", "body": "..." },
        { "heading": "عنوان الدرس 3", "body": "..." }
      ],
      "exercises": [
        { "title": "تمرين 1", "instructions": "تعليمات مفصلة بخطوات عملية", "successCriteria": ["معيار 1", "معيار 2", "معيار 3"], "estimatedMins": 60 },
        { "title": "تمرين 2", "instructions": "...", "successCriteria": [...], "estimatedMins": 45 }
      ],
      "examples": ["مثال واقعي 1 بـ 60-100 كلمة", "مثال 2"],
      "commonMistakes": ["خطأ 1 شائع في هذا الموضوع", ...4 أخطاء],
      "resources": [
        { "type": "book", "title": "...", "note": "..." },
        { "type": "article", "title": "...", "note": "..." },
        { "type": "tool", "title": "...", "note": "..." }
      ],
      "assessment": [
        { "criterion": "معيار التقييم", "weight": 30, "description": "الوصف" },
        ...4 معايير بأوزان تجمع 100%
      ],
      "instructorNotes": "ملاحظة عملية للمدرب حول هذه الوحدة"
    }
    ... ${maxModules} وحدات
  ]
}

قواعد صارمة:
- المحتوى باللغة العربية تمامًا
- lessonSections body بـ Markdown صحيح مع **bold**, جداول | |, قوائم
- كل content حقيقي وليس "placeholder" أو "أضف هنا"
- أوزان معايير التقييم تجمع 100%
- التدرج منطقي من الوحدة 1 إلى ${maxModules}`

      const raw = await callAI({
        system: SYSTEM_PROMPT_AR,
        prompt,
        temperature: 0.7,
        maxTokens: 16000,
        json: true,
      })

      const parsed = extractJSON<{ modules: any[] }>(raw)

      const modules: Module[] = (parsed.modules || []).slice(0, maxModules).map((m: any, i: number) => ({
        id: uuid(),
        order: i + 1,
        title: m.title,
        summary: m.summary,
        content: m.content,
        transformation: m.transformation,
        durationMins: m.durationMins,
        objectives: (m.objectives || []).map((text: string) => ({ id: uuid(), text })),
        keyConcepts: m.keyConcepts,
        lessonSections: m.lessonSections,
        exercises: (m.exercises || []).map((e: any) => ({ ...e, id: uuid() })),
        examples: m.examples,
        commonMistakes: m.commonMistakes,
        resources: m.resources,
        assessment: m.assessment,
        instructorNotes: m.instructorNotes,
      }))
      return modules
    },
    async () =>
      generateExpertCurriculum({
        topic,
        audience,
        startingPoint,
        destination,
        duration: '6 weeks',
        modality: 'online',
        maxModules,
      })
  )
