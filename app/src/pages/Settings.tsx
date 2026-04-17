import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { useStore } from '@/store'
import { isClaudeConfigured } from '@/lib/claude'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme, toast } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const exportAllData = async () => {
    const { saveAs } = await import('file-saver')
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      state: useStore.getState(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    saveAs(blob, `academy-suite-backup-${Date.now()}.json`)
    toast('تم تصدير البيانات', 'success')
  }

  const importData = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.state) throw new Error('Invalid backup file')
      const s = useStore.getState()
      useStore.setState({
        ...s,
        ...data.state,
        toasts: [], // don't restore toasts
      })
      toast('تم استيراد البيانات', 'success')
    } catch (e) {
      toast('فشل الاستيراد — ملف غير صالح', 'error')
    }
  }

  const resetAll = () => {
    localStorage.removeItem('academy-suite-v1')
    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('nav.settings')}</h1>
          <p className="text-xs text-slate-500">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Appearance */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 space-y-4"
      >
        <h2 className="font-display font-bold text-lg">{t('settings.appearance')}</h2>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm">{t('settings.theme')}</div>
            <div className="text-xs text-slate-500">{t('settings.themeDesc')}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`btn !py-2 ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Sun className="w-4 h-4" />
              <span className="text-xs">{t('settings.light')}</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`btn !py-2 ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Moon className="w-4 h-4" />
              <span className="text-xs">{t('settings.dark')}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm">{t('common.language')}</div>
            <div className="text-xs text-slate-500">{t('settings.languageDesc')}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => i18n.changeLanguage('ar')}
              className={`btn !py-2 ${i18n.language === 'ar' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs">عربي</span>
            </button>
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`btn !py-2 ${i18n.language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs">English</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* AI */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-6 space-y-3"
      >
        <h2 className="font-display font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          {t('settings.ai')}
        </h2>
        <div
          className={`p-4 rounded-xl flex items-start gap-3 ${
            isClaudeConfigured()
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800'
          }`}
        >
          {isClaudeConfigured() ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-sm">
            <div className="font-semibold">
              {isClaudeConfigured() ? t('settings.aiLive') : t('settings.aiMock')}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {isClaudeConfigured()
                ? t('settings.aiLiveDesc')
                : t('settings.aiMockDesc')}
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 space-y-1 font-mono bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg">
          <div># app/.env.local</div>
          <div>VITE_CLAUDE_PROXY_URL=https://your-proxy.example.com/claude</div>
          <div>VITE_CLAUDE_MODEL=claude-opus-4-6</div>
        </div>
      </motion.section>

      {/* Data */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 space-y-4"
      >
        <h2 className="font-display font-bold text-lg">{t('settings.data')}</h2>
        <p className="text-xs text-slate-500">{t('settings.dataDesc')}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportAllData} className="btn-secondary">
            <Download className="w-4 h-4" />
            {t('settings.exportAll')}
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary">
            <Upload className="w-4 h-4" />
            {t('settings.importData')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importData(f)
              e.target.value = ''
            }}
          />
        </div>

        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="font-semibold text-sm text-rose-600 dark:text-rose-400 mb-1">
            {t('settings.dangerZone')}
          </div>
          <div className="text-xs text-slate-500 mb-3">{t('settings.resetDesc')}</div>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="btn-danger">
              <Trash2 className="w-4 h-4" />
              {t('settings.resetAll')}
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="btn-secondary">
                {t('common.cancel')}
              </button>
              <button onClick={resetAll} className="btn-danger">
                <AlertTriangle className="w-4 h-4" />
                {t('settings.confirmReset')}
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Keyboard shortcuts reference */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-6 space-y-3"
      >
        <h2 className="font-display font-bold text-lg">{t('settings.shortcuts')}</h2>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            ['⌘ + K', t('settings.scCommand')],
            ['⌘ + Z', t('common.undo')],
            ['⌘ + Shift + Z', t('common.redo')],
            ['⌘ + S', t('common.saveDraft')],
            ['ESC', t('settings.scClose')],
          ].map(([k, label], i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60"
            >
              <span className="text-slate-600 dark:text-slate-300">{label}</span>
              <kbd className="text-[10px] font-mono px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {k}
              </kbd>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
