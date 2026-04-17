import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="card p-8 max-w-md text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-2">{this.state.error.message}</p>
            <details className="text-xs text-slate-400 text-start mt-3 mb-5">
              <summary className="cursor-pointer">Stack</summary>
              <pre className="whitespace-pre-wrap mt-2 max-h-40 overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
            <button
              onClick={() => {
                this.setState({ error: null })
                window.location.reload()
              }}
              className="btn-primary mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
