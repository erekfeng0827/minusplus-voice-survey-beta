import React, { useState } from 'react';
import { Sparkles, Layers, Sliders, Layout, Ruler } from 'lucide-react';

interface ThreeActionCardsBannerProps {
  onOpenSuLayout?: () => void;
  onOpenCadBatch?: () => void;
  onOpenPersonalSpec?: () => void;
  onOpenClashDetection?: () => void;
  onOpenBeamDepthCalculator?: () => void;
  onOpenLayerColorContrast?: () => void;
  className?: string;
}

export const ThreeActionCardsBanner: React.FC<ThreeActionCardsBannerProps> = ({
  onOpenSuLayout,
  onOpenCadBatch,
  onOpenPersonalSpec,
  onOpenClashDetection,
  onOpenBeamDepthCalculator,
  onOpenLayerColorContrast,
  className = '',
}) => {
  const [activeSet, setActiveSet] = useState<'batch_layout_spec' | 'clash_beam_layer'>('batch_layout_spec');

  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      {/* Header matching user screenshot IMG_1430.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#DDD7CE] font-bold">
            <span className="text-amber-400">✦</span>
            <span>丈量口說評量與CAD/3D施工圖自動化系統</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Pay per request</span>
          </span>
        </div>

        {/* Tab switch between IMG_1430 and IMG_1425 */}
        <div className="flex items-center gap-1 bg-[#12161f] p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveSet('batch_layout_spec')}
            className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
              activeSet === 'batch_layout_spec'
                ? 'bg-slate-700/80 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>SU/CAD/個人規格 (新)</span>
          </button>
          <button
            onClick={() => setActiveSet('clash_beam_layer')}
            className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
              activeSet === 'clash_beam_layer'
                ? 'bg-slate-700/80 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>幾何審計</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
        <span>Suggestions</span>
      </div>

      {/* 🌟 1:1 REPRODUCTION OF USER SCREENSHOT IMG_1430.png */}
      {activeSet === 'batch_layout_spec' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch w-full">
          {/* Card 1: 實作 SU Layout 輸出 (Watermark: 2x2 rounded squares) */}
          <button
            type="button"
            onClick={onOpenSuLayout}
            className="w-full text-left bg-gradient-to-br from-[#181b25] via-[#151720] to-[#12141c] hover:from-[#1e2332] hover:to-[#171b26] border border-slate-800/90 hover:border-purple-500/60 rounded-2xl p-5 transition-all shadow-lg hover:shadow-purple-950/20 group relative overflow-hidden flex flex-col justify-center cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <h4 className="text-white font-bold text-base tracking-wide group-hover:text-purple-200 transition-colors select-none">
                實作 SU Layout 輸出
              </h4>
            </div>

            {/* Watermark Icon: 2x2 grid of 4 rounded squares (matching IMG_1430.png) */}
            <div className="absolute right-4 bottom-2 text-slate-700/25 group-hover:text-purple-400/40 pointer-events-none transition-colors">
              <svg
                width="68"
                height="68"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="10" y="10" width="18" height="18" rx="4.5" />
                <rect x="36" y="10" width="18" height="18" rx="4.5" />
                <rect x="10" y="36" width="18" height="18" rx="4.5" />
                <rect x="36" y="36" width="18" height="18" rx="4.5" />
              </svg>
            </div>
          </button>

          {/* Card 2: CAD 批次輸出引擎 (Watermark: 2x2 rounded squares) */}
          <button
            type="button"
            onClick={onOpenCadBatch}
            className="w-full text-left bg-gradient-to-br from-[#181b25] via-[#151720] to-[#12141c] hover:from-[#1e2332] hover:to-[#171b26] border border-slate-800/90 hover:border-cyan-500/60 rounded-2xl p-5 transition-all shadow-lg hover:shadow-cyan-950/20 group relative overflow-hidden flex flex-col justify-center cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <h4 className="text-white font-bold text-base tracking-wide group-hover:text-cyan-200 transition-colors select-none">
                CAD 批次輸出引擎
              </h4>
            </div>

            {/* Watermark Icon: 2x2 grid of 4 rounded squares (matching IMG_1430.png) */}
            <div className="absolute right-4 bottom-2 text-slate-700/25 group-hover:text-cyan-400/40 pointer-events-none transition-colors">
              <svg
                width="68"
                height="68"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="10" y="10" width="18" height="18" rx="4.5" />
                <rect x="36" y="10" width="18" height="18" rx="4.5" />
                <rect x="10" y="36" width="18" height="18" rx="4.5" />
                <rect x="36" y="36" width="18" height="18" rx="4.5" />
              </svg>
            </div>
          </button>

          {/* Card 3: 個人規格自動套用 (Watermark: Crossed drafting ruler and pencil) */}
          <button
            type="button"
            onClick={onOpenPersonalSpec}
            className="w-full text-left bg-gradient-to-br from-[#181b25] via-[#151720] to-[#12141c] hover:from-[#1e2332] hover:to-[#171b26] border border-slate-800/90 hover:border-amber-500/60 rounded-2xl p-5 transition-all shadow-lg hover:shadow-amber-950/20 group relative overflow-hidden flex flex-col justify-center cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <h4 className="text-white font-bold text-base tracking-wide group-hover:text-amber-200 transition-colors select-none">
                個人規格自動套用
              </h4>
            </div>

            {/* Watermark Icon: Crossed drafting ruler and pencil (matching IMG_1430.png) */}
            <div className="absolute right-4 bottom-2 text-slate-700/25 group-hover:text-amber-400/40 pointer-events-none transition-colors">
              <svg
                width="68"
                height="68"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 50L50 14" />
                <path d="M22 42l4-4" />
                <path d="M30 34l4-4" />
                <path d="M38 26l4-4" />
                <rect x="12" y="12" width="12" height="40" rx="2" transform="rotate(-45 20 32)" />
                <path d="M48 16l-4-4-24 24v4h4l24-24z" />
              </svg>
            </div>
          </button>
        </div>
      ) : (
        /* Original IMG_1425 Set */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch w-full">
          <button
            type="button"
            onClick={onOpenClashDetection}
            className="w-full text-left bg-gradient-to-br from-[#181b25] via-[#151720] to-[#12141c] hover:from-[#1e2332] hover:to-[#171b26] border border-slate-800/90 hover:border-slate-600/80 rounded-2xl p-4 sm:p-5 transition-all shadow-lg hover:shadow-cyan-950/20 group relative overflow-hidden flex flex-col justify-center min-h-[96px] cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <h4 className="text-white font-bold text-base sm:text-lg tracking-wide group-hover:text-cyan-200 transition-colors select-none">
                自動化碰撞檢測
              </h4>
            </div>
            <div className="absolute right-4 bottom-2 text-slate-700/25 group-hover:text-slate-600/40 pointer-events-none transition-colors">
              <svg width="68" height="68" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="10" y="10" width="18" height="18" rx="4.5" />
                <rect x="36" y="10" width="18" height="18" rx="4.5" />
                <rect x="10" y="36" width="18" height="18" rx="4.5" />
                <rect x="36" y="36" width="18" height="18" rx="4.5" />
              </svg>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenBeamDepthCalculator}
            className="w-full text-left bg-gradient-to-br from-[#181b25] via-[#151720] to-[#12141c] hover:from-[#1e2332] hover:to-[#171b26] border border-slate-800/90 hover:border-slate-600/80 rounded-2xl p-4 sm:p-5 transition-all shadow-lg hover:shadow-amber-950/20 group relative overflow-hidden flex flex-col justify-center min-h-[96px] cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <h4 className="text-white font-bold text-base sm:text-lg tracking-wide group-hover:text-amber-200 transition-colors select-none">
                新增樑深自動計算
              </h4>
            </div>
            <div className="absolute right-4 bottom-2 text-slate-700/25 group-hover:text-slate-600/40 pointer-events-none transition-colors">
              <svg width="68" height="68" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="10" y="10" width="18" height="18" rx="4.5" />
                <rect x="36" y="10" width="18" height="18" rx="4.5" />
                <rect x="10" y="36" width="18" height="18" rx="4.5" />
                <rect x="36" y="36" width="18" height="18" rx="4.5" />
              </svg>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenLayerColorContrast}
            className="w-full text-left bg-gradient-to-br from-[#181b25] via-[#151720] to-[#12141c] hover:from-[#1e2332] hover:to-[#171b26] border border-slate-800/90 hover:border-slate-600/80 rounded-2xl p-4 sm:p-5 transition-all shadow-lg hover:shadow-purple-950/20 group relative overflow-hidden flex flex-col justify-center min-h-[96px] cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <h4 className="text-white font-bold text-base sm:text-lg tracking-wide group-hover:text-purple-200 transition-colors select-none">
                優化圖層顏色對比
              </h4>
            </div>
            <div className="absolute right-4 bottom-2 text-slate-700/25 group-hover:text-slate-600/40 pointer-events-none transition-colors">
              <svg width="68" height="68" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 50L50 14" />
                <path d="M22 42l4-4" />
                <path d="M30 34l4-4" />
                <path d="M38 26l4-4" />
                <rect x="12" y="12" width="12" height="40" rx="2" transform="rotate(-45 20 32)" />
                <path d="M48 16l-4-4-24 24v4h4l24-24z" />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
