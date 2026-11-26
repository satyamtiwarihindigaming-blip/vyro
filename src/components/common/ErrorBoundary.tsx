import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('VYRO UI Error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060812] flex items-center justify-center p-4 select-none">
          <div className="max-w-md w-full liquid-glass rounded-[32px] p-8 text-center border border-white/15 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl liquid-pill-cta mx-auto flex items-center justify-center text-white shadow-lg">
              <AlertCircle className="w-7 h-7 text-rose-300" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">VYRO Spatial Engine</h2>
            <p className="text-xs text-white/60 leading-relaxed">
              A temporary display glitch occurred. Tap below to refresh your spatial stream.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-6 rounded-full liquid-pill-cta text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Stream</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
