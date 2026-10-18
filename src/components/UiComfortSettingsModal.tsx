import React, { useState } from 'react';
import {
  X,
  Palette,
  Eye,
  Sliders,
  Check,
  CheckCircle2,
  Sparkles,
  Layout,
  Maximize2,
  Minimize2,
  Type,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';

export interface UiComfortConfig {
  mode: 'minimal_comfort' | 'standard_pro';
  theme: 'midnight' | 'slate_neutral' | 'pure_dark';
  spacing: 'comfortable' | 'compact';
  showBreadcrumbs: boolean;
  showQuickPills: boolean;
}

export const DEFAULT_UI_COMFORT: UiComfortConfig = {
  mode: 'minimal_comfort',
  theme: 'midnight',
  spacing: 'comfortable',
  showBreadcrumbs: true,
  showQuickPills: true,
};

interface UiComfortSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UiComfortConfig;
  onChangeConfig: (newConfig: UiComfortConfig) => void;
  onNotify?: (msg: string) => void;
}

export const UiComfortSettingsModal: React.FC<UiComfortSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onNotify,
}) => {
  const [localConfig, setLocalConfig] = useState<UiComfortConfig>(config);

  if (!isOpen) return null;

  const handleSave = () => {
    onChangeConfig(localConfig);
    onNotify?.('✨ 介面舒適度偏好已成功更新！畫面已套用您所客製的風格。');
    onClose();
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_UI_COMFORT);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#151922] border border-slate-700/80 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden text-slate-200 font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1c2230] to-[#161a24] border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>介面設計與視覺舒適度自訂</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                依據您的工作偏好自由調整排版、間距與配色，享受最舒心的操作體驗
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Options */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh] text-xs">
          {/* 1. 工作視覺模式選擇 */}
          <div className="space-y-2">
            <label className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Layout className="w-4 h-4 text-cyan-400" />
              工作排版模式 (Layout Mode)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Minimal Comfort Mode */}
              <div
                onClick={() => setLocalConfig({ ...localConfig, mode: 'minimal_comfort' })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  localConfig.mode === 'minimal_comfort'
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/40'
                    : 'bg-[#1a202c] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    極簡舒適模式 (推薦)
                  </span>
                  {localConfig.mode === 'minimal_comfort' && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  減少視覺干擾，加大畫布負空間與文字行距，隱藏冗長警報標籤，呈現洗練高雅的設計師工作環境。
                </p>
              </div>

              {/* Standard Pro Engineering Mode */}
              <div
                onClick={() => setLocalConfig({ ...localConfig, mode: 'standard_pro' })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  localConfig.mode === 'standard_pro'
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/40'
                    : 'bg-[#1a202c] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-300" />
                    全方位工程模式
                  </span>
                  {localConfig.mode === 'standard_pro' && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  完整展示所有雷達圖、審計流水線指標、7 大圖層規範與次要機電監控數據。
                </p>
              </div>
            </div>
          </div>

          {/* 2. 背景視覺主題 */}
          <div className="space-y-2">
            <label className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Moon className="w-4 h-4 text-indigo-400" />
              背景視覺主題 (Theme & Contrast)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'midnight', name: '深邃午夜 (Midnight)', desc: '經典舒適微藍暗底' },
                { id: 'slate_neutral', name: '洗練灰黑 (Neutral)', desc: '溫潤低飽和純淨灰' },
                { id: 'pure_dark', name: '極黑極簡 (Pure Dark)', desc: 'OLED 極限高對比' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setLocalConfig({ ...localConfig, theme: t.id as any })}
                  className={`p-2.5 rounded-xl border cursor-pointer text-center transition ${
                    localConfig.theme === t.id
                      ? 'bg-slate-800 border-cyan-400 font-bold text-white'
                      : 'bg-[#1a202c] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold">{t.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 間距與字體舒適度 */}
          <div className="space-y-2">
            <label className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Type className="w-4 h-4 text-amber-400" />
              間距與字體尺度 (Spacing & Typography)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setLocalConfig({ ...localConfig, spacing: 'comfortable' })}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  localConfig.spacing === 'comfortable'
                    ? 'bg-amber-950/30 border-amber-500/70 text-white font-bold'
                    : 'bg-[#1a202c] border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs">寬鬆舒適 (Comfortable)</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                  16px+ 基礎字高，行高 1.6，給予雙眼最不費力的閱讀體驗
                </div>
              </div>

              <div
                onClick={() => setLocalConfig({ ...localConfig, spacing: 'compact' })}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  localConfig.spacing === 'compact'
                    ? 'bg-amber-950/30 border-amber-500/70 text-white font-bold'
                    : 'bg-[#1a202c] border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs">緊湊高效 (Compact)</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                  資訊密度高，單屏容納更多放樣參數
                </div>
              </div>
            </div>
          </div>

          {/* 4. 捷徑列偏好 */}
          <div className="bg-[#121620] border border-slate-800 p-3.5 rounded-xl space-y-2.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              自訂捷徑列顯示
            </div>
            <div className="space-y-2 text-[11px] text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.showQuickPills}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, showQuickPills: e.target.checked })
                  }
                  className="rounded accent-cyan-500"
                />
                <span>
                  常駐顯示您截圖要求的 4 大快捷鍵（實作SketchUp自動轉檔、自動化合規稽核分析、創辦360攝影教學、新增 CAD 擷取預覽）
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.showBreadcrumbs}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, showBreadcrumbs: e.target.checked })
                  }
                  className="rounded accent-cyan-500"
                />
                <span>顯示高程契約標註標籤列 (FL+265 梁底 / FL+230 降板 / FL+80 檯面)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#121620] border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            恢復原廠預設
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>套用並儲存設計設定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
