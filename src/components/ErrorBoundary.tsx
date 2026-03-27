import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  public render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-8 lg:p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto text-rose-500 shadow-inner">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Terjadi Kesalahan</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Aplikasi mengalami kendala teknis saat memuat data. Jangan khawatir, data Anda tetap aman di server.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Detail Teknis:</p>
              <p className="text-xs font-mono text-rose-600 break-words line-clamp-3">
                {error?.message || 'Unknown error occurred'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
              >
                <RefreshCw size={18} />
                Muat Ulang Aplikasi
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Home size={18} />
                Kembali ke Login & Reset Cache
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-medium">
              Jika masalah berlanjut, silakan hubungi Administrator Sekolah.
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}
