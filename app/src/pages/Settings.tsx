import { useRef, useState, useEffect } from 'react'
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
  Key,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react'
import { useStore } from '@/store'
import { loadAISettings, saveAISettings, isProviderConfigured, type AISettings, type AIProvider } from '@/lib/aiProvider'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme, toast } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const [aiSettings, setAiSettings] = useState<AISettings>(() => loadAISettings())
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    saveAISettings(aiSettings)
  }, [aiSettings])

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
      useStore.setState({ ...s, ...data.state, toasts: [] })
      toast('تم استيراد البيانات', 'success')
    } catch (e) {
      toast('فشل الاستيراد — ملف غير صالح', 'error')
    }
  }

  const resetAll = () => {
    localStorage.removeItem('academy-suite-v1')
    window.location.reload()
  }

  const testAI = async () => {
    setTesting(true)
    try {
      const { callAI } = await import('@/lib/aiProvider')
      const response = await callAI({
        prompt: 'أجب بكلمة واحدة فقط: "متصل"',
        temperature: 0.1,
        maxTokens: 50,
      })
      toast(`✓ الاتصال ناجح — ${response.slice(0, 60)}`, 'success')
    } catch (e: any) {
      toast(`فشل الاتصال: ${e.message}`, 'error')
    } finally {
      setTesting(false)
    }
  }

  const isConfigured = isProviderConfigured(aiSettings)

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
            <button onClick={() => setTheme('light')} className={`btn !py-2 ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}>
              <Sun className="w-4 h-4" /><span className="text-xs">{t('settings.light')}</span>
            </button>
            <button onClick={() => setTheme('dark')} className={`btn !py-2 ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}>
              <Moon className="w-4 h-4" /><span className="text-xs">{t('settings.dark')}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm">{t('common.language')}</div>
            <div className="text-xs text-slate-500">{t('settings.languageDesc')}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => i18n.changeLanguage('ar')} className={`btn !py-2 ${i18n.language === 'ar' ? 'btn-primary' : 'btn-secondary'}`}>
              <Globe className="w-4 h-4" /><span className="text-xs">عربي</span>
            </button>
            <button onClick={() => i18n.changeLanguage('en')} className={`btn !py-2 ${i18n.language === 'en' ? 'btn-primary' : 'btn-secondary'}`}>
              <Globe className="w-4 h-4" /><span className="text-xs">English</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* AI Configuration — the big new section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              {t('settings.ai')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">اختر مزود الذكاء الاصطناعي وأدخل مفتاح API الخاص بك</p>
          </div>
          <div
            className={`chip ${
              isConfigured
                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
            }`}
          >
            {isConfigured ? '✓ متصل' : 'وضع تجريبي'}
          </div>
        </div>

        {/* Provider selector */}
        <div>
          <label className="text-xs text-slate-500 block mb-2">مزود الذكاء الاصطناعي</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(
              [
                { id: 'mock', label: 'تجريبي', desc: 'بدون اتصال', gradient: 'from-slate-400 to-slate-600' },
                { id: 'gemini', label: 'Gemini', desc: 'Google AI', gradient: 'from-blue-400 to-cyan-500' },
                { id: 'claude', label: 'Claude', desc: 'Anthropic', gradient: 'from-orange-400 to-amber-500' },
                { id: 'proxy', label: 'Proxy مخصص', desc: 'Backend', gradient: 'from-violet-500 to-purple-600' },
              ] as { id: AIProvider; label: string; desc: string; gradient: string }[]
            ).map((p) => {
              const active = aiSettings.provider === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setAiSettings({ ...aiSettings, provider: p.id })}
                  className={`p-3 rounded-xl border-2 transition-all text-start ${
                    active
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 shadow-md shadow-brand-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white mb-2`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm">{p.label}</div>
                  <div className="text-[10px] text-slate-500">{p.desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Gemini config */}
        {aiSettings.provider === 'gemini' && (
          <div className="space-y-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div>🔑 احصل على مفتاح مجاني من <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-brand-600 underline">Google AI Studio</a></div>
              <div>⚡ Gemini 2.0 Flash يدعم اللغة العربية بجودة ممتازة ومجاني للاستخدام الشخصي</div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Gemini API Key</label>
              <div className="relative">
                <Key className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={aiSettings.geminiKey || ''}
                  onChange={(e) => setAiSettings({ ...aiSettings, geminiKey: e.target.value })}
                  placeholder="AIza..."
                  dir="ltr"
                  className="input !ps-10 !pe-10 font-mono text-xs"
                />
                <button onClick={() => setShowKey(!showKey)} className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">النموذج</label>
              <select
                value={aiSettings.geminiModel || 'gemini-2.0-flash'}
                onChange={(e) => setAiSettings({ ...aiSettings, geminiModel: e.target.value })}
                className="input text-sm"
                dir="ltr"
              >
                <option value="gemini-2.0-flash">gemini-2.0-flash (موصى به — الأسرع)</option>
                <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (الأعمق)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              </select>
            </div>
          </div>
        )}

        {/* Claude config */}
        {aiSettings.provider === 'claude' && (
          <div className="space-y-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div>🔑 احصل على مفتاح من <a href="https://console.anthropic.com/" target="_blank" rel="noopener" className="text-brand-600 underline">Anthropic Console</a></div>
              <div>⚠️ استخدام المفتاح مباشرة في المتصفح يُظهره في Network tab — للنشر العام استخدم وضع Proxy</div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Anthropic API Key</label>
              <div className="relative">
                <Key className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={aiSettings.anthropicKey || ''}
                  onChange={(e) => setAiSettings({ ...aiSettings, anthropicKey: e.target.value })}
                  placeholder="sk-ant-..."
                  dir="ltr"
                  className="input !ps-10 !pe-10 font-mono text-xs"
                />
                <button onClick={() => setShowKey(!showKey)} className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">النموذج</label>
              <select
                value={aiSettings.anthropicModel || 'claude-opus-4-6'}
                onChange={(e) => setAiSettings({ ...aiSettings, anthropicModel: e.target.value })}
                className="input text-sm"
                dir="ltr"
              >
                <option value="claude-opus-4-6">claude-opus-4-6 (الأعمق)</option>
                <option value="claude-sonnet-4-5">claude-sonnet-4-5 (التوازن)</option>
                <option value="claude-haiku-4-5">claude-haiku-4-5 (الأسرع)</option>
              </select>
            </div>
          </div>
        )}

        {/* Proxy config */}
        {aiSettings.provider === 'proxy' && (
          <div className="space-y-3 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Proxy مخصص على الخادم الخاص بك يحفظ مفاتيح API بأمان. قراءة DEPLOY.md للمواصفات.
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Proxy URL</label>
              <input
                value={aiSettings.proxyUrl || ''}
                onChange={(e) => setAiSettings({ ...aiSettings, proxyUrl: e.target.value })}
                placeholder="https://your-proxy.example.com/api/generate"
                dir="ltr"
                className="input font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Model ID</label>
              <input
                value={aiSettings.proxyModel || ''}
                onChange={(e) => setAiSettings({ ...aiSettings, proxyModel: e.target.value })}
                placeholder="claude-opus-4-6 / gemini-2.0-flash / gpt-4-turbo"
                dir="ltr"
                className="input font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* Mock info */}
        {aiSettings.provider === 'mock' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <div className="font-semibold text-amber-700 dark:text-amber-400 mb-1">الوضع التجريبي مفعّل</div>
                التطبيق يعمل بمحركات توليد محلية عميقة تُنتج محتوى واقعيًا لجميع الخدمات — مناسب للتجربة والعروض.
                لتوليد محتوى خاص بموضوعك بدقة احترافية، اختر مزودًا أعلاه.
              </div>
            </div>
          </div>
        )}

        {/* Test connection */}
        {isConfigured && (
          <button onClick={testAI} disabled={testing} className="btn-primary w-full">
            <Zap className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
            {testing ? 'جاري الاختبار…' : 'اختبار الاتصال'}
          </button>
        )}
      </motion.section>

      {/* Data */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">{t('settings.data')}</h2>
        <p className="text-xs text-slate-500">{t('settings.dataDesc')}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportAllData} className="btn-secondary"><Download className="w-4 h-4" />{t('settings.exportAll')}</button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary"><Upload className="w-4 h-4" />{t('settings.importData')}</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = '' }} />
        </div>

        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="font-semibold text-sm text-rose-600 dark:text-rose-400 mb-1">{t('settings.dangerZone')}</div>
          <div className="text-xs text-slate-500 mb-3">{t('settings.resetDesc')}</div>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="btn-danger"><Trash2 className="w-4 h-4" />{t('settings.resetAll')}</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="btn-secondary">{t('common.cancel')}</button>
              <button onClick={resetAll} className="btn-danger"><AlertTriangle className="w-4 h-4" />{t('settings.confirmReset')}</button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Shortcuts */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6 space-y-3">
        <h2 className="font-display font-bold text-lg">{t('settings.shortcuts')}</h2>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          {[['⌘ + K', t('settings.scCommand')], ['⌘ + Z', t('common.undo')], ['⌘ + Shift + Z', t('common.redo')], ['⌘ + S', t('common.saveDraft')], ['ESC', t('settings.scClose')]].map(([k, label], i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
              <span className="text-slate-600 dark:text-slate-300">{label}</span>
              <kbd className="text-[10px] font-mono px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{k}</kbd>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
