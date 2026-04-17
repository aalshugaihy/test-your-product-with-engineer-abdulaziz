import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, X, Link as LinkIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createShareLink, copyToClipboard, type ShareableKind } from '@/lib/share'

interface Props {
  kind: ShareableKind
  title: string
  data: any
  compact?: boolean
}

export default function ShareButton({ kind, title, data, compact }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const link = createShareLink(kind, title, data)
  const short = link.length > 90 ? link.slice(0, 50) + '…' + link.slice(-20) : link

  const handleCopy = async () => {
    const ok = await copyToClipboard(link)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: t('share.body') as string, url: link })
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy()
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={`btn-secondary ${compact ? '!py-2' : ''}`}>
        <Share2 className="w-4 h-4" />
        <span className={compact ? 'hidden sm:inline text-xs' : 'text-xs'}>{t('share.title')}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-brand-500" />
                  {t('share.title')}
                </h3>
                <button onClick={() => setOpen(false)} className="btn-ghost !p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4">{t('share.desc')}</p>

              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0 text-xs font-mono text-slate-600 dark:text-slate-300 truncate" dir="ltr">
                  {short}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={handleCopy} className="btn-primary flex-1">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t('share.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('share.copy')}
                    </>
                  )}
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button onClick={handleNativeShare} className="btn-secondary">
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 text-[10px] text-slate-400 leading-relaxed">
                {t('share.note')}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
