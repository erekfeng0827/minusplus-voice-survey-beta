import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('minusplus_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.error('Error clearing minusplus_ keys from localStorage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d140e] text-[#F8F8F6] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-[#141d16] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#DDD7CE]">系統安全防護觸發</h2>
              <p className="text-sm text-[#8E8E93] leading-relaxed">
                偵測到介面渲染異常，已自動攔截避免畫面全白。您可以點選下方按鈕立即重整復原，或重置暫存快取以乾淨模式啟動。
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#090e0a] border border-red-500/20 rounded-xl p-3 text-left overflow-auto max-h-36">
                <p className="text-xs font-mono text-red-400 font-semibold break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#121810] font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>立即重整頁面</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="px-5 py-2.5 rounded-xl bg-[#23301F] hover:bg-[#2c3d27] border border-[#3F5B63]/40 text-[#DDD7CE] font-medium text-sm flex items-center justify-center gap-2 transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>清除快取並安全重啟</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
