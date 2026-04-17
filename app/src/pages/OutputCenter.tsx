import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { PackageCheck, FileDown, FileText, Code2, Globe } from 'lucide-react'
import { useStore } from '@/store'
import { exportCurriculumPDF, exportCurriculumWord, exportCurriculumHTML, exportJSON } from '@/lib/export'

export default function OutputCenter() {
  const { t } = useTranslation()
  const { curricula, ideas, salesPages, emailSequences, pricingPackages, growthPlans, courses } =
    useStore()

  const items: {
    title: string
    type: string
    recommended: string[]
    onPdf?: () => void
    onWord?: () => void
    onHtml?: () => void
    onJson: () => void
  }[] = []

  Object.values(curricula).forEach((c) => {
    const course = courses.find((cc) => cc.id === c.courseId)
    items.push({
      title: c.title || course?.name || 'Curriculum',
      type: 'Curriculum Blueprint',
      recommended: ['PDF', 'Word', 'HTML'],
      onPdf: () => exportCurriculumPDF(c),
      onWord: () => exportCurriculumWord(c),
      onHtml: () => exportCurriculumHTML(c),
      onJson: () => exportJSON('curriculum', c),
    })
  })
  Object.values(ideas).forEach((r) => {
    items.push({
      title: `Idea Report — ${r.ideas[0]?.title || ''}`,
      type: 'Idea Discovery',
      recommended: ['PDF'],
      onJson: () => exportJSON('ideas', r),
    })
  })
  Object.values(salesPages).forEach((s) => {
    items.push({
      title: s.headline,
      type: 'Sales Page',
      recommended: ['HTML'],
      onJson: () => exportJSON('sales', s),
    })
  })
  Object.values(emailSequences).forEach((e) => {
    items.push({
      title: `Email Sequence (${e.emails.length})`,
      type: 'Email Sequence',
      recommended: ['Word'],
      onJson: () => exportJSON('emails', e),
    })
  })
  Object.values(pricingPackages).forEach((p) => {
    items.push({
      title: `Pricing (${p.tiers.length} tiers)`,
      type: 'Pricing Packages',
      recommended: ['PDF', 'PPT'],
      onJson: () => exportJSON('pricing', p),
    })
  })
  Object.values(growthPlans).forEach((g) => {
    items.push({
      title: `Growth Plan — ${g.timelineWeeks}w`,
      type: 'Growth Plan',
      recommended: ['PDF', 'PPT'],
      onJson: () => exportJSON('growth', g),
    })
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-brand-600 flex items-center justify-center text-white">
          <PackageCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">{t('output.title')}</h1>
          <p className="text-xs text-slate-500">{t('services.SE.desc')}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">No deliverables yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-5 flex items-center gap-4 flex-wrap"
            >
              <div className="flex-1 min-w-0">
                <div className="chip bg-slate-100 dark:bg-slate-800 !text-[10px] mb-1 uppercase">
                  {item.type}
                </div>
                <div className="font-semibold truncate">{item.title}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {t('output.recommended')}: {item.recommended.join(', ')}
                </div>
              </div>
              <div className="flex gap-2">
                {item.onPdf && (
                  <button onClick={item.onPdf} className="btn-secondary !text-xs">
                    <FileDown className="w-3.5 h-3.5" /> PDF
                  </button>
                )}
                {item.onWord && (
                  <button onClick={item.onWord} className="btn-secondary !text-xs">
                    <FileText className="w-3.5 h-3.5" /> Word
                  </button>
                )}
                {item.onHtml && (
                  <button onClick={item.onHtml} className="btn-secondary !text-xs">
                    <Globe className="w-3.5 h-3.5" /> HTML
                  </button>
                )}
                <button onClick={item.onJson} className="btn-ghost !text-xs">
                  <Code2 className="w-3.5 h-3.5" /> JSON
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
