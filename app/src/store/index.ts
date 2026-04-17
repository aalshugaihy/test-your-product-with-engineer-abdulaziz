import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type {
  Course,
  CurriculumBlueprint,
  Module,
  Comment,
  IdeaReport,
  ResearchReport,
  SalesPageDraft,
  EmailSequence,
  PricingPackages,
  GrowthPlan,
  Template,
  StageKey,
  Status,
  LearningObjective,
} from '@/types'
import { generateExpertCurriculum } from '@/lib/expertCurriculum'
import { aiGenerateCurriculumModules } from '@/lib/aiGenerators'

interface HistoryState<T> {
  past: T[]
  present: T | null
  future: T[]
}

interface AppState {
  // UI
  currentCourseId: string | null
  currentStage: StageKey
  theme: 'light' | 'dark'
  toasts: { id: string; message: string; kind: 'info' | 'success' | 'error' }[]

  // Data
  courses: Course[]
  curricula: Record<string, CurriculumBlueprint>
  ideas: Record<string, IdeaReport>
  research: Record<string, ResearchReport>
  salesPages: Record<string, SalesPageDraft>
  emailSequences: Record<string, EmailSequence>
  pricingPackages: Record<string, PricingPackages>
  growthPlans: Record<string, GrowthPlan>
  templates: Template[]

  // History (per-curriculum undo/redo)
  curriculumHistory: Record<string, HistoryState<CurriculumBlueprint>>

  // Actions — UI
  setTheme: (t: 'light' | 'dark') => void
  toggleTheme: () => void
  setStage: (s: StageKey) => void
  selectCourse: (id: string | null) => void
  toast: (message: string, kind?: 'info' | 'success' | 'error') => void
  dismissToast: (id: string) => void

  // Actions — Course
  createCourse: (name: string) => string
  deleteCourse: (id: string) => void
  goToNextStageOfCourse: (id: string) => void

  // Actions — Curriculum
  ensureCurriculum: (courseId: string) => CurriculumBlueprint
  updateCurriculum: (
    courseId: string,
    updater: (c: CurriculumBlueprint) => CurriculumBlueprint,
    opts?: { recordHistory?: boolean }
  ) => void
  addModule: (courseId: string, afterIndex?: number) => void
  deleteModule: (courseId: string, moduleId: string) => void
  updateModule: (courseId: string, moduleId: string, patch: Partial<Module>) => void
  reorderModules: (courseId: string, fromId: string, toId: string) => void
  addObjective: (courseId: string, moduleId: string) => void
  updateObjective: (courseId: string, moduleId: string, objId: string, text: string) => void
  deleteObjective: (courseId: string, moduleId: string, objId: string) => void
  generateCurriculumAI: (courseId: string) => Promise<void>
  saveCurriculumDraft: (courseId: string) => void
  sendCurriculumForReview: (courseId: string) => void
  addComment: (courseId: string, text: string, moduleId?: string, reasonCode?: string) => void
  approveCurriculum: (courseId: string) => void
  requestRevision: (courseId: string, reasonCode: string) => void

  // Undo / Redo
  undoCurriculum: (courseId: string) => void
  redoCurriculum: (courseId: string) => void
  canUndo: (courseId: string) => boolean
  canRedo: (courseId: string) => boolean

  // Other services
  saveIdeaReport: (courseId: string, report: IdeaReport) => void
  saveResearchReport: (courseId: string, report: ResearchReport) => void
  saveSalesPage: (courseId: string, draft: SalesPageDraft) => void
  saveEmailSequence: (courseId: string, seq: EmailSequence) => void
  savePricingPackages: (courseId: string, pkg: PricingPackages) => void
  saveGrowthPlan: (courseId: string, plan: GrowthPlan) => void

  // Templates
  saveTemplate: (t: Omit<Template, 'id' | 'createdAt'>) => void
  deleteTemplate: (id: string) => void
}

const now = () => Date.now()

const createEmptyCurriculum = (courseId: string): CurriculumBlueprint => ({
  id: uuid(),
  courseId,
  title: '',
  startingPoint: '',
  destination: '',
  audience: '',
  modality: 'online',
  duration: '6 weeks',
  maxModules: 8,
  modules: [],
  leanScore: 0,
  transformationMap: '',
  status: 'draft',
  comments: [],
  updatedAt: now(),
})

const computeLeanScore = (c: CurriculumBlueprint): number => {
  if (c.modules.length === 0) return 0
  let score = 0
  const hasTransformationMap = c.transformationMap.trim().length > 20
  if (hasTransformationMap) score += 20
  const modulesWithObjectives = c.modules.filter((m) => m.objectives.length > 0).length
  score += Math.round((modulesWithObjectives / c.modules.length) * 40)
  const modulesWithTransformation = c.modules.filter((m) => m.transformation.trim().length > 5).length
  score += Math.round((modulesWithTransformation / c.modules.length) * 30)
  if (c.modules.length <= c.maxModules) score += 10
  return Math.min(100, score)
}

const recomputed = (c: CurriculumBlueprint): CurriculumBlueprint => ({
  ...c,
  leanScore: computeLeanScore(c),
  updatedAt: now(),
})

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentCourseId: null,
      currentStage: 'landing',
      theme: 'light',
      toasts: [],

      courses: [],
      curricula: {},
      ideas: {},
      research: {},
      salesPages: {},
      emailSequences: {},
      pricingPackages: {},
      growthPlans: {},
      templates: [],

      curriculumHistory: {},

      setTheme: (t) => {
        set({ theme: t })
        document.documentElement.classList.toggle('dark', t === 'dark')
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        get().setTheme(next)
      },
      setStage: (s) => set({ currentStage: s }),
      selectCourse: (id) => {
        if (!id) {
          set({ currentCourseId: null })
          return
        }
        const course = get().courses.find((c) => c.id === id)
        if (course) {
          set({ currentCourseId: id, currentStage: course.currentStage })
        }
      },
      toast: (message, kind = 'info') => {
        const id = uuid()
        set({ toasts: [...get().toasts, { id, message, kind }] })
        setTimeout(() => get().dismissToast(id), 3200)
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

      createCourse: (name) => {
        const id = uuid()
        const course: Course = {
          id,
          name,
          createdAt: now(),
          currentStage: 'idea',
          progress: {
            idea: false,
            research: false,
            curriculum: false,
            sales: false,
            email: false,
            pricing: false,
            growth: false,
          },
        }
        set({
          courses: [course, ...get().courses],
          currentCourseId: id,
          currentStage: 'idea',
        })
        return id
      },
      deleteCourse: (id) => {
        set({
          courses: get().courses.filter((c) => c.id !== id),
          currentCourseId: get().currentCourseId === id ? null : get().currentCourseId,
        })
      },
      goToNextStageOfCourse: (id) => {
        const course = get().courses.find((c) => c.id === id)
        if (!course) return
        const order: StageKey[] = [
          'idea',
          'research',
          'curriculum',
          'sales',
          'email',
          'pricing',
          'growth',
          'output',
        ]
        const idx = order.indexOf(course.currentStage)
        const next = order[Math.min(order.length - 1, idx + 1)]
        set({
          courses: get().courses.map((c) =>
            c.id === id ? { ...c, currentStage: next } : c
          ),
          currentStage: next,
        })
      },

      ensureCurriculum: (courseId) => {
        const existing = get().curricula[courseId]
        if (existing) return existing
        const fresh = createEmptyCurriculum(courseId)
        set({ curricula: { ...get().curricula, [courseId]: fresh } })
        return fresh
      },

      updateCurriculum: (courseId, updater, opts = { recordHistory: true }) => {
        const current = get().curricula[courseId]
        if (!current) return
        const next = recomputed(updater(current))

        // History
        if (opts.recordHistory !== false) {
          const hist = get().curriculumHistory[courseId] || { past: [], present: null, future: [] }
          const newHist: HistoryState<CurriculumBlueprint> = {
            past: [...hist.past, current].slice(-50),
            present: next,
            future: [],
          }
          set({
            curricula: { ...get().curricula, [courseId]: next },
            curriculumHistory: { ...get().curriculumHistory, [courseId]: newHist },
          })
        } else {
          set({ curricula: { ...get().curricula, [courseId]: next } })
        }
      },

      addModule: (courseId, afterIndex) => {
        get().ensureCurriculum(courseId)
        get().updateCurriculum(courseId, (c) => {
          const newModule: Module = {
            id: uuid(),
            order: 0,
            title: '',
            summary: '',
            content: '',
            transformation: '',
            objectives: [{ id: uuid(), text: '' }],
          }
          const modules = [...c.modules]
          const insertAt = afterIndex !== undefined ? afterIndex + 1 : modules.length
          modules.splice(insertAt, 0, newModule)
          return { ...c, modules: modules.map((m, i) => ({ ...m, order: i + 1 })) }
        })
      },

      deleteModule: (courseId, moduleId) => {
        get().updateCurriculum(courseId, (c) => ({
          ...c,
          modules: c.modules.filter((m) => m.id !== moduleId).map((m, i) => ({ ...m, order: i + 1 })),
          comments: c.comments.filter((cm) => cm.moduleId !== moduleId),
        }))
      },

      updateModule: (courseId, moduleId, patch) => {
        get().updateCurriculum(courseId, (c) => ({
          ...c,
          modules: c.modules.map((m) => (m.id === moduleId ? { ...m, ...patch } : m)),
        }))
      },

      reorderModules: (courseId, fromId, toId) => {
        get().updateCurriculum(courseId, (c) => {
          const modules = [...c.modules]
          const from = modules.findIndex((m) => m.id === fromId)
          const to = modules.findIndex((m) => m.id === toId)
          if (from === -1 || to === -1) return c
          const [moved] = modules.splice(from, 1)
          modules.splice(to, 0, moved)
          return { ...c, modules: modules.map((m, i) => ({ ...m, order: i + 1 })) }
        })
      },

      addObjective: (courseId, moduleId) => {
        get().updateCurriculum(courseId, (c) => ({
          ...c,
          modules: c.modules.map((m) =>
            m.id === moduleId
              ? { ...m, objectives: [...m.objectives, { id: uuid(), text: '' }] }
              : m
          ),
        }))
      },

      updateObjective: (courseId, moduleId, objId, text) => {
        get().updateCurriculum(courseId, (c) => ({
          ...c,
          modules: c.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  objectives: m.objectives.map((o) => (o.id === objId ? { ...o, text } : o)),
                }
              : m
          ),
        }))
      },

      deleteObjective: (courseId, moduleId, objId) => {
        get().updateCurriculum(courseId, (c) => ({
          ...c,
          modules: c.modules.map((m) =>
            m.id === moduleId
              ? { ...m, objectives: m.objectives.filter((o) => o.id !== objId) }
              : m
          ),
        }))
      },

      generateCurriculumAI: async (courseId) => {
        const course = get().courses.find((c) => c.id === courseId)
        const idea = get().ideas[courseId]
        const research = get().research[courseId]
        const existing = get().ensureCurriculum(courseId)

        const baseTitle =
          idea?.ideas.find((i) => i.isStrongest)?.title ||
          course?.name ||
          'منهج جديد'

        const topic = baseTitle.replace(/^(ورشة|دليل|دورة|منهج|للمحترفين)/g, '').trim() || baseTitle

        // Use AI if configured, otherwise fall back to expert templates.
        const modules = await aiGenerateCurriculumModules(
          topic,
          existing.audience || research?.audience || 'المحترفون الطموحون',
          existing.startingPoint || 'معرفة عامة بالمجال دون قدرة على التطبيق',
          existing.destination || `القدرة على إنتاج ${topic} بجودة احترافية`,
          existing.maxModules || 5
        )

        get().updateCurriculum(courseId, (c) => ({
          ...c,
          title: baseTitle,
          startingPoint: c.startingPoint || 'معرفة عامة بالمجال دون قدرة على التطبيق',
          destination: c.destination || `القدرة على إنتاج ${topic} بجودة احترافية`,
          audience: c.audience || research?.audience || 'المحترفون الطموحون',
          transformationMap:
            c.transformationMap ||
            `رحلة 5 تحولات من ${c.startingPoint || 'المعرفة السطحية'} إلى ${c.destination || 'الإتقان المهني'}:
1. بناء الإطار الذهني ومعايير النجاح
2. استيعاب المنظومة الجوهرية
3. إنتاج أول مخرج قابل للعرض
4. الانتقال إلى مستوى المتقدم
5. تتويج الرحلة بمشروع احترافي وخطة مستقبلية`,
          modules,
        }))

        // Mark progress and return early — the old inline modules block below is skipped
        set({
          courses: get().courses.map((c) =>
            c.id === courseId
              ? { ...c, progress: { ...c.progress, curriculum: true }, currentStage: 'curriculum' }
              : c
          ),
        })
        get().toast('تم توليد المنهج التفصيلي — كل وحدة تحتوي على محتوى عميق', 'success')
      },

      saveCurriculumDraft: (courseId) => {
        const current = get().curricula[courseId]
        if (!current) return
        get().updateCurriculum(
          courseId,
          (c) => ({ ...c, lastDraftSavedAt: now(), status: c.status === 'approved' ? c.status : 'draft' }),
          { recordHistory: false }
        )
        get().toast('تم حفظ المسودة', 'success')
      },

      sendCurriculumForReview: (courseId) => {
        get().updateCurriculum(courseId, (c) => ({ ...c, status: 'in_review' }))
        get().toast('تم إرسال المنهج للمراجعة', 'success')
      },

      addComment: (courseId, text, moduleId, reasonCode) => {
        get().updateCurriculum(
          courseId,
          (c) => ({
            ...c,
            comments: [
              ...c.comments,
              {
                id: uuid(),
                author: 'أنت',
                text,
                moduleId,
                reasonCode,
                createdAt: now(),
              },
            ],
          }),
          { recordHistory: false }
        )
      },

      approveCurriculum: (courseId) => {
        get().updateCurriculum(courseId, (c) => ({ ...c, status: 'approved' }))
        get().toast('تم اعتماد المنهج', 'success')
      },

      requestRevision: (courseId, reasonCode) => {
        get().updateCurriculum(courseId, (c) => ({ ...c, status: 'revision_requested' }))
        get().addComment(courseId, `طلب مراجعة: ${reasonCode}`, undefined, reasonCode)
      },

      undoCurriculum: (courseId) => {
        const hist = get().curriculumHistory[courseId]
        if (!hist || hist.past.length === 0) return
        const prev = hist.past[hist.past.length - 1]
        const current = get().curricula[courseId]
        if (!current) return
        const newHist: HistoryState<CurriculumBlueprint> = {
          past: hist.past.slice(0, -1),
          present: prev,
          future: [current, ...hist.future],
        }
        set({
          curricula: { ...get().curricula, [courseId]: prev },
          curriculumHistory: { ...get().curriculumHistory, [courseId]: newHist },
        })
      },
      redoCurriculum: (courseId) => {
        const hist = get().curriculumHistory[courseId]
        if (!hist || hist.future.length === 0) return
        const next = hist.future[0]
        const current = get().curricula[courseId]
        if (!current) return
        const newHist: HistoryState<CurriculumBlueprint> = {
          past: [...hist.past, current],
          present: next,
          future: hist.future.slice(1),
        }
        set({
          curricula: { ...get().curricula, [courseId]: next },
          curriculumHistory: { ...get().curriculumHistory, [courseId]: newHist },
        })
      },
      canUndo: (courseId) => (get().curriculumHistory[courseId]?.past.length || 0) > 0,
      canRedo: (courseId) => (get().curriculumHistory[courseId]?.future.length || 0) > 0,

      saveIdeaReport: (courseId, report) => {
        set({ ideas: { ...get().ideas, [courseId]: report } })
        set({
          courses: get().courses.map((c) =>
            c.id === courseId
              ? { ...c, progress: { ...c.progress, idea: true }, currentStage: 'research' }
              : c
          ),
          currentStage: 'research',
        })
      },
      saveResearchReport: (courseId, report) => {
        set({ research: { ...get().research, [courseId]: report } })
        set({
          courses: get().courses.map((c) =>
            c.id === courseId
              ? { ...c, progress: { ...c.progress, research: true }, currentStage: 'curriculum' }
              : c
          ),
          currentStage: 'curriculum',
        })
      },
      saveSalesPage: (courseId, draft) => {
        set({ salesPages: { ...get().salesPages, [courseId]: draft } })
        set({
          courses: get().courses.map((c) =>
            c.id === courseId ? { ...c, progress: { ...c.progress, sales: true }, currentStage: 'email' } : c
          ),
          currentStage: 'email',
        })
      },
      saveEmailSequence: (courseId, seq) => {
        set({ emailSequences: { ...get().emailSequences, [courseId]: seq } })
        set({
          courses: get().courses.map((c) =>
            c.id === courseId ? { ...c, progress: { ...c.progress, email: true }, currentStage: 'pricing' } : c
          ),
          currentStage: 'pricing',
        })
      },
      savePricingPackages: (courseId, pkg) => {
        set({ pricingPackages: { ...get().pricingPackages, [courseId]: pkg } })
        set({
          courses: get().courses.map((c) =>
            c.id === courseId ? { ...c, progress: { ...c.progress, pricing: true }, currentStage: 'growth' } : c
          ),
          currentStage: 'growth',
        })
      },
      saveGrowthPlan: (courseId, plan) => {
        set({ growthPlans: { ...get().growthPlans, [courseId]: plan } })
        set({
          courses: get().courses.map((c) =>
            c.id === courseId ? { ...c, progress: { ...c.progress, growth: true }, currentStage: 'output' } : c
          ),
          currentStage: 'output',
        })
      },

      saveTemplate: (t) => {
        set({
          templates: [
            ...get().templates,
            { ...t, id: uuid(), createdAt: now() },
          ],
        })
        get().toast('تم حفظ القالب', 'success')
      },
      deleteTemplate: (id) => {
        set({ templates: get().templates.filter((t) => t.id !== id) })
      },
    }),
    {
      name: 'academy-suite-v1',
      partialize: (s) => ({
        theme: s.theme,
        courses: s.courses,
        curricula: s.curricula,
        ideas: s.ideas,
        research: s.research,
        salesPages: s.salesPages,
        emailSequences: s.emailSequences,
        pricingPackages: s.pricingPackages,
        growthPlans: s.growthPlans,
        templates: s.templates,
        currentCourseId: s.currentCourseId,
      }),
    }
  )
)

// Apply theme on load
if (typeof window !== 'undefined') {
  const t = useStore.getState().theme
  document.documentElement.classList.toggle('dark', t === 'dark')
}
