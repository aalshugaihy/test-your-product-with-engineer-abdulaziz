import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  GripVertical,
  Trash2,
  ChevronDown,
  Plus,
  X,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Module, Comment } from '@/types'
import { useStore } from '@/store'

interface Props {
  courseId: string
  module: Module
  index: number
  onComment: (moduleId: string) => void
  comments: Comment[]
}

export default function ModuleCard({ courseId, module, index, onComment, comments }: Props) {
  const { t } = useTranslation()
  const { updateModule, deleteModule, addObjective, updateObjective, deleteObjective } = useStore()
  const [open, setOpen] = useState(index === 0)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const moduleComments = comments.filter((c) => c.moduleId === module.id)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
          aria-label="drag"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
          {index + 1}
        </div>
        <input
          value={module.title}
          onChange={(e) => updateModule(courseId, module.id, { title: e.target.value })}
          placeholder={t('curriculum.moduleTitle') as string}
          className="flex-1 bg-transparent font-semibold text-base outline-none focus:ring-2 focus:ring-brand-500/30 rounded px-2 py-1"
        />
        <button
          onClick={() => onComment(module.id)}
          className="btn-ghost !p-2 relative"
          aria-label="comment"
        >
          <MessageCircle className="w-4 h-4" />
          {moduleComments.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-500 text-white text-[10px] flex items-center justify-center font-bold">
              {moduleComments.length}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            if (confirm(t('curriculum.deleteConfirm') as string)) deleteModule(courseId, module.id)
          }}
          className="btn-ghost !p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          aria-label="delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="btn-ghost !p-2"
          aria-label="toggle"
        >
          <motion.div animate={{ rotate: open ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-200/70 dark:border-slate-800/70"
          >
            <div className="p-5 space-y-4">
              {/* Transformation */}
              <div>
                <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  {t('curriculum.transformationMap')}
                </label>
                <input
                  value={module.transformation}
                  onChange={(e) =>
                    updateModule(courseId, module.id, { transformation: e.target.value })
                  }
                  className="input"
                  placeholder="From X to Y..."
                />
              </div>

              {/* Summary */}
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">
                  {t('curriculum.moduleSummary')}
                </label>
                <textarea
                  value={module.summary}
                  onChange={(e) => updateModule(courseId, module.id, { summary: e.target.value })}
                  rows={2}
                  className="input resize-none"
                />
              </div>

              {/* Content (inline edit) */}
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">
                  {t('curriculum.content')}
                </label>
                <textarea
                  value={module.content}
                  onChange={(e) => updateModule(courseId, module.id, { content: e.target.value })}
                  rows={5}
                  className="input resize-y font-mono text-sm"
                />
              </div>

              {/* Objectives */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-500 font-medium">
                    {t('curriculum.objectives')}
                  </label>
                  <button
                    onClick={() => addObjective(courseId, module.id)}
                    className="btn-ghost !text-xs !py-1 !px-2"
                  >
                    <Plus className="w-3 h-3" />
                    {t('curriculum.addObjective')}
                  </button>
                </div>
                <div className="space-y-2">
                  {module.objectives.map((obj, i) => (
                    <div key={obj.id} className="flex items-center gap-2">
                      <div className="text-xs text-slate-400 w-5">{i + 1}.</div>
                      <input
                        value={obj.text}
                        onChange={(e) => updateObjective(courseId, module.id, obj.id, e.target.value)}
                        placeholder={t('curriculum.moduleObjective') as string}
                        className="input !py-2 text-sm flex-1"
                      />
                      <button
                        onClick={() => deleteObjective(courseId, module.id, obj.id)}
                        className="btn-ghost !p-1.5 text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module-level comments */}
              {moduleComments.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1.5">
                    <MessageCircle className="w-3 h-3" />
                    {t('review.comments')} ({moduleComments.length})
                  </div>
                  <div className="space-y-2">
                    {moduleComments.map((c) => (
                      <div
                        key={c.id}
                        className="text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border-s-2 border-brand-500"
                      >
                        <div className="font-semibold">{c.author}</div>
                        <div className="text-slate-600 dark:text-slate-300 mt-0.5">{c.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
