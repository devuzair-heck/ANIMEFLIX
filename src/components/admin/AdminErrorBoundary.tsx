import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

export class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred in the admin panel.',
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Admin Error Boundary] Caught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/30 text-[#DC143C] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-950/50">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-[#DC143C] bg-[#DC143C]/10 border border-[#DC143C]/20 px-2.5 py-1 rounded-md inline-block mb-2">
              System Notice
            </span>

            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white mb-2">
              Admin panel encountered an error
            </h2>

            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              We encountered a temporary interface issue. You can retry loading the panel or return to the main portal.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#DC143C] hover:bg-[#b01030] text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#DC143C]/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>

              <Link
                to="/admin/login"
                onClick={() => this.setState({ hasError: false })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl border border-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
