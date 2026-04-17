export type Status =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'revision_requested'
  | 'ready_to_publish'
  | 'published'
  | 'archived'

export type StageKey =
  | 'landing'
  | 'idea'
  | 'research'
  | 'curriculum'
  | 'sales'
  | 'email'
  | 'pricing'
  | 'growth'
  | 'review'
  | 'templates'
  | 'output'
  | 'dashboard'
  | 'catalog'
  | 'analytics'
  | 'settings'
  | 'blueprint'

export interface Comment {
  id: string
  author: string
  text: string
  moduleId?: string // null for curriculum-level
  createdAt: number
  reasonCode?: string
  resolved?: boolean
}

export interface LearningObjective {
  id: string
  text: string
}

export interface LessonSection {
  heading: string
  body: string // markdown-formatted
}

export interface Exercise {
  id: string
  title: string
  instructions: string
  successCriteria: string[]
  estimatedMins?: number
}

export interface Resource {
  type: 'book' | 'article' | 'video' | 'tool' | 'template'
  title: string
  note?: string
}

export interface AssessmentCriterion {
  criterion: string
  weight: number // 0-100
  description: string
}

export interface Module {
  id: string
  order: number
  title: string
  summary: string
  content: string // main lesson body (markdown)
  transformation: string
  objectives: LearningObjective[]
  durationMins?: number
  // Detailed expert content
  keyConcepts?: string[]
  lessonSections?: LessonSection[] // structured deep content
  exercises?: Exercise[]
  examples?: string[] // real-world examples
  commonMistakes?: string[]
  resources?: Resource[]
  assessment?: AssessmentCriterion[]
  instructorNotes?: string
}

export interface CurriculumBlueprint {
  id: string
  courseId: string
  title: string
  startingPoint: string
  destination: string
  audience: string
  modality: string
  duration: string
  maxModules: number
  modules: Module[]
  leanScore: number
  transformationMap: string
  status: Status
  comments: Comment[]
  updatedAt: number
  lastDraftSavedAt?: number
}

export interface Idea {
  id: string
  title: string
  demandSignal: string
  credibilityFit: string
  gap: string
  isStrongest: boolean
}

export interface IdeaReport {
  id: string
  courseId: string
  ideas: Idea[]
  positioningStatement: string
  updatedAt: number
  status: Status
}

export interface ResearchReport {
  id: string
  courseId: string
  topic: string
  audience: string
  depth: 'shallow' | 'medium' | 'deep'
  findings: string[]
  competitors: string[]
  trends: string[]
  painPoints: string[]
  keywords: string[]
  sources: string[]
  // Enhanced analytical fields
  marketSize?: string
  growthRate?: string
  swot?: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }
  personas?: { name: string; demographics: string; motivations: string; objections: string }[]
  pricingBand?: { low: number; mid: number; high: number; currency: string }
  priorityScore?: number // 0-100 confidence score
  coreAnalysis?: string // markdown-formatted deep analysis
  updatedAt: number
}

export interface SalesPageDraft {
  id: string
  courseId: string
  headline: string
  problem: string
  solution: string
  offerStructure: string[]
  objections: string[]
  cta: string
  status: Status
}

export interface EmailItem {
  id: string
  subject: string
  job: string
  timing: string
  body: string
}

export interface EmailSequence {
  id: string
  courseId: string
  emails: EmailItem[]
  status: Status
}

export interface PricingTier {
  id: string
  name: string
  price: number
  upgradeReason: string
  valueJustification: string
  features: string[]
}

export interface PricingPackages {
  id: string
  courseId: string
  outcomeValue: string
  tiers: PricingTier[]
  status: Status
}

export interface GrowthPlan {
  id: string
  courseId: string
  audienceSize: number
  timelineWeeks: number
  channels: { name: string; reason: string }[]
  waitlistStrategy: string
  earlyBird: string
  milestones: { week: number; goal: string }[]
  status: Status
}

export interface Course {
  id: string
  name: string
  createdAt: number
  currentStage: StageKey
  progress: {
    idea: boolean
    research: boolean
    curriculum: boolean
    sales: boolean
    email: boolean
    pricing: boolean
    growth: boolean
  }
}

export interface Template {
  id: string
  name: string
  category: 'idea' | 'curriculum' | 'sales' | 'email' | 'pricing' | 'growth'
  payload: any
  createdAt: number
}
