import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium p-10 text-center border border-rose-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-rose-600" size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase italic mb-4">System Interrupted</h1>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                The application encountered an unexpected error. This is often due to a temporary database sync issue or an expired session.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 text-left mb-8 overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Error Detail</p>
                <p className="text-xs font-mono text-rose-600 break-words">{this.state.error?.message}</p>
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-[#002855] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-2 hover:bg-[#003875] transition-all"
            >
                <RefreshCcw size={18} />
                Restart Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
