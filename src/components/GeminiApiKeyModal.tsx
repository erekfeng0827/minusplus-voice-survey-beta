import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  X,
  Zap,
} from 'lucide-react';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
  onKeyUpdated?: () => void;
}

export interface KeyStatusInfo {
  configured: boolean;
  keyPreview: string;
  keyLength: number;
  isRuntimeOverridden: boolean;
  activeModel: string;
  lastStatus?: 'OK' | 'ERROR_401' | 'ERROR_OTHER' | 'UNTESTED';
  lastError?: string;
  lastCheckedTime?: string;
}

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({
  isOpen,
  onClose,
  onNotify,
  onKeyUpdated,
}) => {
  const [keyInfo, setKeyInfo] = useState<KeyStatusInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status?: number;
    is401?: boolean;
    message: string;
    model?: string;
    durationMs?: number;
  } | null>(null);

  const [inputKey, setInputKey] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Fetch current key status on open
  const fetchKeyStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/key-status');
      const data = await res.json();
      setKeyInfo(data);
    } catch (err: any) {
      console.error('Failed to fetch key status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchKeyStatus();
      setTestResult(null);
      setInputKey('');
    }
  }, [isOpen]);

  // Run live connection test
  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/gemini/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        onNotify?.('✅ Google Gemini 3.8 Flash API 連線測試成功！金鑰運作正常。');
      } else if (data.is401) {
        onNotify?.('❌ 檢測失敗：401 服務帳號已停用或金鑰失效，請更換有效金鑰。');
      } else {
        onNotify?.(`⚠️ 檢測失敗：${data.message || '未知錯誤'}`);
      }
      fetchKeyStatus();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || '網路通訊失敗，無法連接伺服器',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Submit and test new key
  const handleApplyNewKey = async () => {
    if (!inputKey.trim()) {
      onNotify?.('請輸入有效的 Gemini API Key (如 AIzaSy...)');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/gemini/update-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputKey.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        onNotify?.('🎉 新金鑰已通過 Gemini 驗證並即時生效！已全面切換為真實 AI 運算。');
        setTestResult({
          success: true,
          model: data.model || 'gemini-3.8-flash',
          message: data.message || '金鑰更新成功並通過 Google AI 實機測試',
          durationMs: data.durationMs,
        });
        setInputKey('');
        fetchKeyStatus();
        onKeyUpdated?.();
      } else {
        setTestResult({
          success: false,
          is401: data.is401,
          status: data.status,
          message: data.message || '新金鑰驗證失敗，無法啟用',
        });
        onNotify?.(`❌ 新金鑰驗證失敗：${data.message}`);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || '連線伺服器更新失敗',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to environment process.env
  const handleResetToEnv = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/reset-key', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onNotify?.('已重新同步系統環境變數 (process.env.GEMINI_API_KEY)');
        fetchKeyStatus();
        setTestResult(data.testResult || null);
        onKeyUpdated?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPreview = () => {
    if (keyInfo?.keyPreview) {
      navigator.clipboard.writeText(keyInfo.keyPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Gemini API 金鑰管理與真實連線檢測</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono">
                  gemini-3.8-flash
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                徹底解決 401 服務帳號失效與靜默降級，確保「第 4 步口說解析」直通 Google AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Card 1: Current Key Status */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                當前伺服器運作金鑰
              </span>
              <div className="flex items-center gap-1.5">
                {keyInfo?.isRuntimeOverridden && (
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                    自訂覆寫金鑰
                  </span>
                )}
                <button
                  onClick={fetchKeyStatus}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-white text-[11px] p-1 flex items-center gap-1"
                  title="重新整理狀態"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>整理</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px]">
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                <span className="text-slate-500">金鑰前尾綴：</span>
                <span className="text-white font-semibold tracking-wider">
                  {keyInfo?.keyPreview || '載入中...'}
                </span>
              </div>
              <button
                onClick={handleCopyPreview}
                className="text-slate-400 hover:text-white p-1 text-xs"
                title="複製預覽"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Test Action & Live Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestKey}
                  disabled={isTesting}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                >
                  {isTesting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>正在發送 Google API 實機測試...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>測試此金鑰連線 (Ping Google API)</span>
                    </>
                  )}
                </button>

                {keyInfo?.isRuntimeOverridden && (
                  <button
                    onClick={handleResetToEnv}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                    title="重設並還原回系統環境變數"
                  >
                    還原環境變數
                  </button>
                )}
              </div>
            </div>

            {/* Test Result Feedback Box */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1.5 animate-fadeIn ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/50 text-red-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    <span>
                      {testResult.success
                        ? '連線成功 · Google Gemini 3.8 Flash 真機在線'
                        : testResult.is401
                        ? '401 錯誤 · 服務帳號已失效 / 金鑰被撤銷'
                        : '連線異常'}
                    </span>
                  </div>
                  {testResult.durationMs && (
                    <span className="text-[10px] font-mono opacity-80">
                      延遲: {testResult.durationMs}ms
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {testResult.message}
                </p>
                {testResult.is401 && (
                  <div className="bg-red-950/80 border border-red-800/80 rounded-lg p-2 text-[10px] text-red-300 space-y-1 mt-1">
                    <p className="font-semibold">⚠️ 症狀診斷：</p>
                    <p>
                      此金鑰綁定的 Google Cloud 專案服務帳號已停用或過期，導致呼叫 Gemini 時回傳 401
                      Unauthorized。程式先前為了避免程式中斷才自動降級為內建簡易解析。
                    </p>
                    <p className="font-semibold text-amber-300">
                      👉 請在下方貼上新的有效 Gemini API Key 進行即時替換！
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Hot-Swap Key Replacement */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                更換有效金鑰 (Hot-Swap Key)
              </span>
              <span className="text-[10px] text-slate-400">
                即刻生效，無需重啟容器
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              請在此輸入您的有效 Gemini API Key（格式通常為 <code className="text-cyan-300 font-mono">AIzaSy...</code> 或有效專案權杖）。系統會在送出前先行對 Google 端進行驗證，通過後立即替換當前運算金鑰：
            </p>

            <div className="space-y-2">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="貼入有效 Gemini API Key (例如 AIzaSyDb...)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                >
                  <span>取得新的免費 Google Gemini API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={handleApplyNewKey}
                  disabled={!inputKey.trim() || isSaving}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>正在驗證並啟用新金鑰...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>驗證並立即套用新金鑰</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Platform Settings Guideline */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span>永久保存提示 (Google AI Studio 保管庫)</span>
            </div>
            <p className="leading-relaxed">
              若要在專案重新發佈或容器冷重啟後永久生效，請於 Google AI Studio 右上方「<strong>Settings</strong>」中的「<strong>Secrets / Vault</strong>」面板，將 <code className="text-cyan-300 font-mono">GEMINI_API_KEY</code> 更新為該把有效金鑰。本介面的熱抽換金鑰在當前運行容器中立即生效！
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            支援模型：gemini-3.8-flash、gemini-flash-latest、gemini-3.1-flash-lite
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition"
          >
            完成並返回
          </button>
        </div>
      </div>
    </div>
  );
};
