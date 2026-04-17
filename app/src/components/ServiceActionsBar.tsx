import ExportMenu from '@/components/ExportMenu'
import ShareButton from '@/components/ShareButton'
import { exportAssetPDF, exportAssetWord, exportAssetHTML, exportAssetPPT } from '@/lib/genericExport'
import { exportJSON } from '@/lib/export'
import type { ShareableKind } from '@/lib/share'

type AssetKind = 'idea' | 'sales' | 'email' | 'pricing' | 'growth'

interface Props {
  kind: AssetKind
  courseName: string
  data: any
  title?: string
}

/**
 * Unified actions bar (Share + Export) for any non-curriculum service output.
 * Wires the generic exporters and the share button in one line.
 */
export default function ServiceActionsBar({ kind, courseName, data, title }: Props) {
  const shareKind: ShareableKind = kind
  const displayTitle = title || `${courseName} — ${kind}`

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ShareButton kind={shareKind} title={displayTitle} data={data} compact />
      <ExportMenu
        options={['pdf', 'word', 'ppt', 'html', 'json']}
        recommended={recommendedByKind(kind)}
        handlers={{
          pdf: () => exportAssetPDF(kind, data, courseName),
          word: () => exportAssetWord(kind, data, courseName),
          ppt: () => exportAssetPPT(kind, data, courseName),
          html: () => exportAssetHTML(kind, data, courseName),
          json: () => exportJSON(`${courseName}-${kind}`, data),
        }}
        compact
      />
    </div>
  )
}

const recommendedByKind = (kind: AssetKind): Array<'pdf' | 'word' | 'html' | 'ppt' | 'json'> => {
  switch (kind) {
    case 'idea':
      return ['pdf', 'word']
    case 'sales':
      return ['html', 'pdf']
    case 'email':
      return ['word', 'pdf']
    case 'pricing':
      return ['pdf', 'ppt']
    case 'growth':
      return ['pdf', 'ppt']
  }
}
