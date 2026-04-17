import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LibraryBig, Trash2 } from 'lucide-react'
import { useStore } from '@/store'

const seedTemplates = [
  { name: 'Transformation Curriculum — 5 Modules', category: 'curriculum' as const },
  { name: 'High-Converting Sales Page', category: 'sales' as const },
  { name: '5-Email Launch Sequence', category: 'email' as const },
  { name: 'Value-Based 3-Tier Pricing', category: 'pricing' as const },
  { name: 'First 100 Students — 8 Weeks', category: 'growth' as const },
]

export default function Templates() {
  const { t } = useTranslation()
  const { templates, saveTemplate, deleteTemplate } = useStore()

  const all = templates.length
    ? templates
    : seedTemplates.map((s, i) => ({
        id: `seed-${i}`,
        createdAt: Date.now(),
        payload: {},
        ...s,
      }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center text-white">
          <LibraryBig className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('templates.title')}</h1>
          <p className="text-xs text-slate-500">{t('services.S9.desc')}</p>
        </div>
      </div>

      {all.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">{t('templates.noTemplates')}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {all.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card card-hover p-5"
            >
              <div className="chip bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 mb-3 !text-[10px] uppercase">
                {tpl.category}
              </div>
              <h3 className="font-bold mb-4">{tpl.name}</h3>
              <div className="flex gap-2">
                <button className="btn-secondary !text-xs flex-1">{t('templates.use')}</button>
                <button className="btn-secondary !text-xs flex-1">{t('templates.fork')}</button>
                {templates.find((x) => x.id === tpl.id) && (
                  <button
                    onClick={() => deleteTemplate(tpl.id)}
                    className="btn-ghost !p-2 text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
