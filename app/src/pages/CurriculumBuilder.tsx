import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Undo2,
  Redo2,
  Save,
  Sparkles,
  Send,
  BookOpen,
  MessageCircle,
  X,
  Target,
} from 'lucide-react'
import ExportMenu from '@/components/ExportMenu'
import ShareButton from '@/components/ShareButton'
import NextSteps from '@/components/NextSteps'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useStore } from '@/store'
import ModuleCard from '@/components/curriculum/ModuleCard'
import {
  exportCurriculumPDF,
  exportCurriculumWord,
  exportCurriculumHTML,
  exportCurriculumPPT,
  exportJSON,
} from '@/lib/export'

export default function CurriculumBuilder() {
  const { t } = useTranslation()
  const {
    currentCourseId,
    courses,
    curricula,
    ensureCurriculum,
    updateCurriculum,
    addModule,
    reorderModules,
    generateCurriculumAI,
    saveCurriculumDraft,
    sendCurriculumForReview,
    undoCurriculum,
    redoCurriculum,
    canUndo,
    canRedo,
    addComment,
    createCourse,
    selectCourse,
    toast,
  } = useStore()

  const [commentTarget, setCommentTarget] = useState<string | null | 'curriculum'>(null)
  const [commentText, setCommentText] = useState('')

  const course = courses.find((c) => c.id === currentCourseId)
  const curriculum = currentCourseId ? curricula[currentCourseId] : null

  // Ensure curriculum exists when we have a course selected
  useEffect(() => {
    if (currentCourseId && !curricula[currentCourseId]) {
      ensureCurriculum(currentCourseId)
    }
  }, [currentCourseId])

  // Keyboard shortcuts — Ctrl+Z / Ctrl+Shift+Z / Ctrl+S
  useEffect(() => {
    if (!currentCourseId) return
    const handler = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey
      if (!meta) return
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undoCurriculum(currentCourseId)
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        redoCurriculum(currentCourseId)
      } else if (e.key === 's') {
        e.preventDefault()
        saveCurriculumDraft(currentCourseId)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentCourseId, undoCurriculum, redoCurriculum, saveCurriculumDraft])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!currentCourseId || !course) {
    return (
      <div className="card p-12 text-center max-w-xl mx-auto">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <h2 className="font-display font-bold text-xl mb-2">{t('curriculum.title')}</h2>
        <p className="text-slate-500 text-sm mb-6">Select or create a course to start.</p>
        <button
          onClick={() => {
            const id = createCourse('New Course')
            selectCourse(id)
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>
    )
  }

  if (!curriculum) return null

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (over && active.id !== over.id) {
      reorderModules(currentCourseId, String(active.id), String(over.id))
    }
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return
    addComment(
      currentCourseId,
      commentText,
      commentTarget === 'curriculum' ? undefined : (commentTarget as string)
    )
    setCommentText('')
    setCommentTarget(null)
    toast('تمت إضافة التعليق', 'success')
  }

  const readinessColor =
    curriculum.leanScore >= 70
      ? 'from-emerald-500 to-green-600'
      : curriculum.leanScore >= 40
      ? 'from-amber-500 to-orange-500'
      : 'from-rose-500 to-rose-600'

  const statusBadge = {
    draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    in_review: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    approved: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
    revision_requested: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
    ready_to_publish: 'bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300',
    published: 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400',
    archived: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
  }[curriculum.status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`chip ${statusBadge}`}>
                  {t(`statuses.${curriculum.status}`)}
                </span>
                {curriculum.lastDraftSavedAt && (
                  <span className="text-xs text-slate-500">
                    {t('common.lastSaved')}:{' '}
                    {new Date(curriculum.lastDraftSavedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <input
                value={curriculum.title}
                onChange={(e) =>
                  updateCurriculum(currentCourseId, (c) => ({ ...c, title: e.target.value }))
                }
                placeholder={t('curriculum.title') as string}
                className="bg-transparent font-display text-2xl font-black outline-none w-full focus:ring-2 focus:ring-brand-500/30 rounded px-2 py-1 -mx-2"
              />
            </div>
            {/* Lean score */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-slate-500 mb-1">{t('common.readinessScore')}</div>
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="url(#lean-gradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 28 * (1 - curriculum.leanScore / 100),
                    }}
                    transition={{ duration: 0.8 }}
                  />
                  <defs>
                    <linearGradient id="lean-gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                  {curriculum.leanScore}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata inputs */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">{t('curriculum.startingPoint')}</label>
              <input
                value={curriculum.startingPoint}
                onChange={(e) =>
                  updateCurriculum(currentCourseId, (c) => ({ ...c, startingPoint: e.target.value }))
                }
                className="input !py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">{t('curriculum.destination')}</label>
              <input
                value={curriculum.destination}
                onChange={(e) =>
                  updateCurriculum(currentCourseId, (c) => ({ ...c, destination: e.target.value }))
                }
                className="input !py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">{t('curriculum.audience')}</label>
              <input
                value={curriculum.audience}
                onChange={(e) =>
                  updateCurriculum(currentCourseId, (c) => ({ ...c, audience: e.target.value }))
                }
                className="input !py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">{t('curriculum.duration')}</label>
              <input
                value={curriculum.duration}
                onChange={(e) =>
                  updateCurriculum(currentCourseId, (c) => ({ ...c, duration: e.target.value }))
                }
                className="input !py-2 text-sm"
              />
            </div>
          </div>

          {/* Transformation map */}
          <div className="mt-3">
            <label className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
              <Target className="w-3 h-3" />
              {t('curriculum.transformationMap')}
            </label>
            <textarea
              value={curriculum.transformationMap}
              onChange={(e) =>
                updateCurriculum(currentCourseId, (c) => ({
                  ...c,
                  transformationMap: e.target.value,
                }))
              }
              rows={2}
              className="input !py-2 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-16 z-20 card p-3 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => undoCurriculum(currentCourseId)}
          disabled={!canUndo(currentCourseId)}
          className="btn-secondary !py-2"
          title={t('common.undo') as string}
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{t('common.undo')}</span>
        </button>
        <button
          onClick={() => redoCurriculum(currentCourseId)}
          disabled={!canRedo(currentCourseId)}
          className="btn-secondary !py-2"
          title={t('common.redo') as string}
        >
          <Redo2 className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{t('common.redo')}</span>
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
        <button onClick={() => addModule(currentCourseId)} className="btn-secondary !py-2">
          <Plus className="w-4 h-4" />
          <span className="text-xs">{t('curriculum.addModule')}</span>
        </button>
        <button
          onClick={() => generateCurriculumAI(currentCourseId)}
          className="btn !py-2 bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-600/20 hover:shadow-xl hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-xs">{t('curriculum.generateAI')}</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setCommentTarget('curriculum')}
          className="btn-secondary !py-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{t('common.addComment')}</span>
        </button>
        <button onClick={() => saveCurriculumDraft(currentCourseId)} className="btn-secondary !py-2">
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{t('common.saveDraft')}</span>
        </button>
        <ExportMenu
          options={['pdf', 'word', 'ppt', 'html', 'json']}
          recommended={['pdf', 'word']}
          handlers={{
            pdf: () => exportCurriculumPDF(curriculum),
            word: () => exportCurriculumWord(curriculum),
            ppt: () => exportCurriculumPPT(curriculum),
            html: () => exportCurriculumHTML(curriculum),
            json: () => exportJSON('curriculum', curriculum),
          }}
          compact
        />
        <ShareButton
          kind="curriculum"
          title={curriculum.title || 'Curriculum'}
          data={curriculum}
          compact
        />
        <button
          onClick={() => sendCurriculumForReview(currentCourseId)}
          className="btn-primary !py-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{t('curriculum.sendReview')}</span>
        </button>
      </div>

      {/* Modules list */}
      <div className="space-y-3">
        {curriculum.modules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 text-sm mb-6">{t('curriculum.emptyState')}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => addModule(currentCourseId)} className="btn-secondary">
                <Plus className="w-4 h-4" />
                {t('curriculum.addModule')}
              </button>
              <button
                onClick={() => generateCurriculumAI(currentCourseId)}
                className="btn-primary"
              >
                <Sparkles className="w-4 h-4" />
                {t('curriculum.generateAI')}
              </button>
            </div>
          </motion.div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={curriculum.modules.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {curriculum.modules.map((module, index) => (
                  <ModuleCard
                    key={module.id}
                    courseId={currentCourseId}
                    module={module}
                    index={index}
                    onComment={(mid) => setCommentTarget(mid)}
                    comments={curriculum.comments}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Next Steps recommender */}
      {curriculum.modules.length > 0 && (
        <NextSteps
          currentService="curriculum"
          hasEnoughForBlueprint={curriculum.modules.length >= 3}
        />
      )}

      {/* Curriculum-level comments */}
      {curriculum.comments.filter((c) => !c.moduleId).length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-brand-500" />
            {t('review.comments')}
          </h3>
          <div className="space-y-2">
            {curriculum.comments
              .filter((c) => !c.moduleId)
              .map((c) => (
                <div
                  key={c.id}
                  className="text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border-s-2 border-brand-500"
                >
                  <div className="font-semibold text-xs">{c.author}</div>
                  <div className="mt-1">{c.text}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Comment Modal */}
      <AnimatePresence>
        {commentTarget !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommentTarget(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">{t('common.addComment')}</h3>
                <button onClick={() => setCommentTarget(null)} className="btn-ghost !p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                placeholder={t('review.newComment') as string}
                autoFocus
                className="input resize-none"
              />
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setCommentTarget(null)} className="btn-secondary">
                  {t('common.cancel')}
                </button>
                <button onClick={handleAddComment} className="btn-primary">
                  {t('common.send')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
