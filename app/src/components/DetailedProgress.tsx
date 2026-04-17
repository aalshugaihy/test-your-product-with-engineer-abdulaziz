import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, Circle } from 'lucide-react'

export interface SubTask {
  id: string
  label: string
  estimatedMs?: number
}

interface Props {
  tasks: SubTask[]
  running: boolean
  onComplete?: () => void
}

/**
 * Detailed progress indicator with sub-tasks — replaces the generic spinner.
 *
 * Drives sub-tasks through `pending → in_progress → done` based on each
 * task's `estimatedMs`. When `running` becomes false, all remaining tasks
 * are marked done and `onComplete` fires.
 */
export default function DetailedProgress({ tasks, running, onComplete }: Props) {
  const [active, setActive] = useState(0)
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!running) {
      setDoneSet(new Set(tasks.map((t) => t.id)))
      setActive(tasks.length)
      onComplete?.()
      return
    }
    let cancelled = false
    let idx = 0
    const run = () => {
      if (cancelled || idx >= tasks.length) return
      const task = tasks[idx]
      setActive(idx)
      const ms = task.estimatedMs ?? 600
      setTimeout(() => {
        if (cancelled) return
        setDoneSet((prev) => {
          const next = new Set(prev)
          next.add(task.id)
          return next
        })
        idx++
        if (idx < tasks.length) run()
        else setActive(tasks.length)
      }, ms)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [running])

  const total = tasks.length
  const completed = doneSet.size
  const percent = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className="card p-5 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {running ? 'Processing' : 'Complete'}
          </div>
          <div className="text-sm font-bold text-brand-600 dark:text-brand-400 tabular-nums">
            {percent}%
          </div>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full"
          />
        </div>
      </div>

      <ul className="space-y-2">
        {tasks.map((task, i) => {
          const isDone = doneSet.has(task.id)
          const isActive = i === active && !isDone && running
          return (
            <li key={task.id} className="flex items-center gap-3 text-sm">
              <div className="shrink-0">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </motion.div>
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                )}
              </div>
              <span
                className={`flex-1 ${
                  isDone
                    ? 'text-slate-600 dark:text-slate-400 line-through'
                    : isActive
                    ? 'text-slate-900 dark:text-slate-100 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {task.label}
              </span>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-brand-500 font-medium"
                >
                  ...
                </motion.div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
