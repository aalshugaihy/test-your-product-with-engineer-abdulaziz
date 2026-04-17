import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
  className?: string
}

/**
 * Rich markdown renderer with GFM (tables, task lists, strikethrough).
 * Styled to match the app's design language.
 */
export default function Markdown({ content, className = '' }: Props) {
  return (
    <div className={`prose-custom ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...p }) => <h1 className="text-xl font-bold mb-3 mt-4" {...p} />,
          h2: ({ node, ...p }) => <h2 className="text-lg font-bold mb-2 mt-4 text-brand-600 dark:text-brand-400" {...p} />,
          h3: ({ node, ...p }) => <h3 className="text-base font-semibold mb-2 mt-3" {...p} />,
          p: ({ node, ...p }) => <p className="text-sm leading-relaxed mb-2 text-slate-700 dark:text-slate-300" {...p} />,
          ul: ({ node, ...p }) => <ul className="list-disc ps-6 mb-3 space-y-1 text-sm text-slate-700 dark:text-slate-300" {...p} />,
          ol: ({ node, ...p }) => <ol className="list-decimal ps-6 mb-3 space-y-1 text-sm text-slate-700 dark:text-slate-300" {...p} />,
          li: ({ node, ...p }) => <li className="text-sm leading-relaxed" {...p} />,
          a: ({ node, ...p }) => <a className="text-brand-600 dark:text-brand-400 underline" target="_blank" rel="noopener" {...p} />,
          code: ({ node, className, children, ...p }: any) => {
            const isBlock = String(className || '').startsWith('language-')
            if (isBlock) {
              return (
                <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs my-3 font-mono">
                  <code {...p}>{children}</code>
                </pre>
              )
            }
            return (
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-brand-300 font-mono text-xs">
                {children}
              </code>
            )
          },
          table: ({ node, ...p }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full text-xs border-collapse" {...p} />
            </div>
          ),
          thead: ({ node, ...p }) => <thead className="bg-brand-50 dark:bg-brand-950/40" {...p} />,
          th: ({ node, ...p }) => <th className="border border-slate-200 dark:border-slate-800 p-2 text-start font-semibold" {...p} />,
          td: ({ node, ...p }) => <td className="border border-slate-200 dark:border-slate-800 p-2 align-top" {...p} />,
          blockquote: ({ node, ...p }) => (
            <blockquote className="border-s-4 border-brand-500 ps-4 my-3 italic text-slate-600 dark:text-slate-400" {...p} />
          ),
          hr: () => <hr className="my-4 border-slate-200 dark:border-slate-800" />,
          strong: ({ node, ...p }) => <strong className="font-bold text-slate-900 dark:text-slate-100" {...p} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
