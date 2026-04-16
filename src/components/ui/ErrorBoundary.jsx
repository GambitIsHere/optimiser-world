import { Component } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red/10 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red" />
            </div>
            <h2 className="text-2xl font-bold text-[#151515] mb-3">Something went wrong</h2>
            <p className="text-[#6B6E66] mb-8 text-sm leading-relaxed">
              An unexpected error occurred. This has been logged and we'll look into it.
            </p>
            {this.state.error?.message && (
              <pre className="mb-8 p-4 rounded-lg bg-[#E3E4DD] border border-[#D0D1C9] text-left text-xs text-[#6B6E66] overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FEE8DE] text-[#F54E00] hover:bg-[#FDDACC] transition-colors text-sm font-medium"
              >
                <RotateCcw size={16} />
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E3E4DD] text-[#6B6E66] hover:bg-[#D0D1C9] transition-colors text-sm font-medium"
              >
                <Home size={16} />
                Go home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
