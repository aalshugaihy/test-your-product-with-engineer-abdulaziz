import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Sparkles, Eye } from 'lucide-react'
import type { SharePayload } from '@/lib/share'
import Markdown from '@/components/Markdown'
import ExportMenu from '@/components/ExportMenu'
import {
  exportCurriculumPDF,
  exportCurriculumWord,
  exportCurriculumHTML,
  exportCurriculumPPT,
  exportJSON,
} from '@/lib/export'

interface Props {
  payload: SharePayload
  onBack: () => void
}

export default function ShareViewer({ payload, onBack }: Props) {
  const { t } = useTranslation()
  const { kind, title, data, createdAt } = payload

  const curriculumHandlers =
    kind === 'curriculum'
      ? {
          pdf: () => exportCurriculumPDF(data),
          word: () => exportCurriculumWord(data),
          ppt: () => exportCurriculumPPT(data),
          html: () => exportCurriculumHTML(data),
          json: () => exportJSON('curriculum', data),
        }
      : { json: () => exportJSON(kind, data) }

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              {t('share.viewerTitle')}
            </div>
            <div className="font-display font-bold text-sm truncate">{title}</div>
          </div>
          <ExportMenu
            options={['pdf', 'word', 'ppt', 'html', 'json']}
            handlers={curriculumHandlers}
            recommended={['pdf']}
            compact
          />
          <button onClick={onBack} className="btn-ghost !p-2">
            <ArrowLeft className="w-4 h-4 flip-rtl" />
            <span className="hidden sm:inline text-xs">{t('share.viewerBack')}</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-5 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 md:p-10"
        >
          <div className="chip bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 mb-3 uppercase text-[10px]">
            {kind}
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-2">{title}</h1>
          <div className="text-xs text-slate-500 mb-6">
            {t('share.sharedOn')}: {new Date(createdAt).toLocaleString()}
          </div>

          {/* Render content based on kind */}
          {kind === 'curriculum' && <CurriculumView data={data} />}
          {kind === 'research' && <ResearchView data={data} />}
          {kind !== 'curriculum' && kind !== 'research' && <GenericView data={data} />}
        </motion.div>

        <div className="mt-6 text-center text-xs text-slate-500">
          {t('app.tagline')}
        </div>
      </main>
    </div>
  )
}

function CurriculumView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {data.transformationMap && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-950/40 dark:to-accent-950/40 border border-brand-200 dark:border-brand-800">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Transformation Map</div>
          <div className="text-sm">{data.transformationMap}</div>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <div><strong className="text-slate-500">Starting:</strong> {data.startingPoint || '-'}</div>
        <div><strong className="text-slate-500">Destination:</strong> {data.destination || '-'}</div>
        <div><strong className="text-slate-500">Audience:</strong> {data.audience || '-'}</div>
        <div><strong className="text-slate-500">Duration:</strong> {data.duration || '-'}</div>
      </div>
      <div>
        <h2 className="font-display font-bold text-xl mb-3">Modules ({data.modules?.length || 0})</h2>
        <div className="space-y-3">
          {data.modules?.map((m: any, i: number) => (
            <div key={m.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border-s-4 border-brand-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white font-bold text-xs flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="font-bold">{m.title || 'Untitled'}</div>
              </div>
              {m.transformation && (
                <div className="text-xs text-accent-600 dark:text-accent-400 mb-2 italic">
                  → {m.transformation}
                </div>
              )}
              {m.summary && <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">{m.summary}</div>}
              {m.content && <div className="text-sm text-slate-600 dark:text-slate-300 mb-2 whitespace-pre-wrap">{m.content}</div>}
              {m.objectives?.length > 0 && (
                <ul className="text-xs space-y-1 mt-2">
                  {m.objectives.map((o: any, j: number) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-brand-500">✓</span>
                      <span>{o.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResearchView({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {data.coreAnalysis && <Markdown content={data.coreAnalysis} />}
      {data.findings?.length > 0 && (
        <div>
          <h3 className="font-bold mb-2">Findings</h3>
          <ul className="space-y-1 text-sm">
            {data.findings.map((f: string, i: number) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand-500">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function GenericView({ data }: { data: any }) {
  return (
    <pre className="text-xs p-4 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-x-auto font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
