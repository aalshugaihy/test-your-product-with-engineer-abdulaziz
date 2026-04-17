import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileDown, FileText, Globe, Presentation, Code2, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface ExportOption {
  id: 'pdf' | 'word' | 'html' | 'ppt' | 'json'
  label: string
  icon: any
  handler: () => void | Promise<void>
  recommended?: boolean
}

interface Props {
  options: Array<'pdf' | 'word' | 'html' | 'ppt' | 'json'>
  handlers: Partial<Record<'pdf' | 'word' | 'html' | 'ppt' | 'json', () => void | Promise<void>>>
  recommended?: Array<'pdf' | 'word' | 'html' | 'ppt' | 'json'>
  compact?: boolean
}

const meta: Record<string, { label: string; icon: any }> = {
  pdf: { label: 'PDF', icon: FileDown },
  word: { label: 'Word', icon: FileText },
  html: { label: 'HTML', icon: Globe },
  ppt: { label: 'PowerPoint', icon: Presentation },
  json: { label: 'JSON', icon: Code2 },
}

export default function ExportMenu({ options, handlers, recommended = [], compact }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const available = options.filter((o) => handlers[o])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`btn-secondary ${compact ? '!py-2' : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <FileDown className="w-4 h-4" />
        <span className={compact ? 'hidden sm:inline text-xs' : 'text-xs'}>
          {t('common.export')}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute end-0 mt-2 w-52 card p-1.5 z-40 shadow-xl"
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1.5">
              {t('common.export')}
            </div>
            {available.map((opt) => {
              const { label, icon: Icon } = meta[opt]
              const isRec = recommended.includes(opt)
              return (
                <button
                  key={opt}
                  role="menuitem"
                  onClick={() => {
                    handlers[opt]?.()
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-start text-sm transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="flex-1">{label}</span>
                  {isRec && (
                    <span className="chip !text-[9px] bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300">
                      {t('output.recommended')}
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
