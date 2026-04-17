import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-fort-bg flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-3xl font-royal text-noble-red">A Curse has Befallen the Citadel</h1>
            <p className="text-royal-gold/60">An unexpected error occurred in the chronicles.</p>
            <pre className="bg-black/50 p-4 rounded text-xs text-left overflow-auto max-h-40 border border-royal-gold/20 font-mono text-royal-gold">
              {this.state.error?.message}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="noble-button"
            >
              Exorcise & Restart
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

