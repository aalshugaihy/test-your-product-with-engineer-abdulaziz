import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, MessageCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useStore } from '@/store'

const REASON_CODES = [
  { code: 'R001', label: 'Missing transformation clarity' },
  { code: 'R002', label: 'Weak evidence' },
  { code: 'R003', label: 'Off-brand tone' },
  { code: 'R004', label: 'Pricing without value basis' },
  { code: 'R005', label: 'Curriculum fluff detected' },
  { code: 'R006', label: 'Missing CTA' },
  { code: 'R007', label: 'Factual correction needed' },
]

export default function ReviewCenter() {
  const { t } = useTranslation()
  const {
    curricula,
    courses,
    approveCurriculum,
    requestRevision,
    addComment,
    selectCourse,
    setStage,
  } = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [reasonCode, setReasonCode] = useState(REASON_CODES[0].code)

  const items = Object.values(curricula).filter(
    (c) => c.status === 'in_review' || c.status === 'revision_requested'
  )
  const selected = selectedId ? curricula[selectedId] : null
  const selectedCourse = selected ? courses.find((c) => c.id === selected.courseId) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('review.title')}</h1>
          <p className="text-xs text-slate-500">{t('services.S8.desc')}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
          <p className="text-slate-500 text-sm">{t('review.noItems')}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-5">
          {/* List */}
          <div className="space-y-2">
            {items.map((c) => {
              const cc = courses.find((co) => co.id === c.courseId)
              return (
                <motion.button
                  key={c.id}
                  onClick={() => setSelectedId(c.courseId)}
                  whileHover={{ x: 3 }}
                  className={`card p-4 w-full text-start ${
                    selectedId === c.courseId ? 'ring-2 ring-brand-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`chip text-[10px] ${
                        c.status === 'in_review'
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {t(`statuses.${c.status}`)}
                    </span>
                  </div>
                  <div className="font-semibold text-sm truncate">{c.title || cc?.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {c.modules.length} modules · {c.comments.length} {t('curriculum.commentsCount')}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Detail */}
          <div className="card p-6">
            {!selected ? (
              <div className="text-center text-slate-500 py-12">Select an item to review</div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="text-xs text-slate-500 mb-1">{selectedCourse?.name}</div>
                  <h2 className="font-display font-black text-xl">{selected.title}</h2>
                  <button
                    onClick={() => {
                      selectCourse(selected.courseId)
                      setStage('curriculum')
                    }}
                    className="btn-ghost !text-xs !py-1 mt-2"
                  >
                    فتح في المحرر →
                  </button>
                </div>

                {/* Modules */}
                <div>
                  <h3 className="font-bold text-sm mb-2">Modules ({selected.modules.length})</h3>
                  <div className="space-y-1.5">
                    {selected.modules.map((m, i) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60"
                      >
                        <span className="text-xs font-bold text-brand-500 w-6">{i + 1}.</span>
                        <span className="flex-1 truncate">{m.title || 'Untitled'}</span>
                        <span className="text-xs text-slate-500">
                          {m.objectives.length} obj
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {t('review.comments')} ({selected.comments.length})
                  </h3>
                  {selected.comments.length === 0 ? (
                    <div className="text-xs text-slate-400">—</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selected.comments.map((c) => (
                        <div
                          key={c.id}
                          className="text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border-s-2 border-brand-500"
                        >
                          <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <span className="font-semibold">{c.author}</span>
                            {c.reasonCode && <span className="chip bg-rose-100 dark:bg-rose-950/40 text-rose-600 !text-[9px]">{c.reasonCode}</span>}
                          </div>
                          <div>{c.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* New comment */}
                <div className="space-y-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('review.newComment') as string}
                    rows={2}
                    className="input text-sm resize-none"
                  />
                  <button
                    onClick={() => {
                      if (!commentText.trim()) return
                      addComment(selected.courseId, commentText)
                      setCommentText('')
                    }}
                    className="btn-secondary text-sm w-full"
                  >
                    {t('review.addComment')}
                  </button>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={reasonCode}
                      onChange={(e) => setReasonCode(e.target.value)}
                      className="input !py-2 text-xs flex-1"
                    >
                      {REASON_CODES.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.code} — {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => requestRevision(selected.courseId, reasonCode)}
                      className="btn-danger flex-1"
                    >
                      <XCircle className="w-4 h-4" />
                      {t('review.requestRevision')}
                    </button>
                    <button
                      onClick={() => approveCurriculum(selected.courseId)}
                      className="btn-primary flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t('review.approve')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
