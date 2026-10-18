import React from 'react';
import {
  X,
  Sparkles,
  Layers,
  Cpu,
  Eye,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sun,
  ShieldCheck,
  Camera,
  Box,
} from 'lucide-react';

interface ThreeDRenderExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSketchUpExport?: () => void;
  onSwitchTo3DView?: () => void;
}

export const ThreeDRenderExplanationModal: React.FC<ThreeDRenderExplanationModalProps> = ({
  isOpen,
  onClose,
  onOpenSketchUpExport,
  onSwitchTo3DView,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#121724] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700/80 bg-[#161d2d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  3D 渲染技術規格剖析與定位說明
                </h2>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Three.js WebGL PBR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                解答：系統當前 3D 渲染的類型、設計目的與如何達成照片級超擬真效果
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900/50 border border-blue-500/30 rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              核心結論：它是「工程級實時物理交互 3D」，不是慢速照片級光追！
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              您在畫面上看到的 3D 渲染，是專為<strong>現場工務交底與設計放樣</strong>設計的{' '}
              <span className="text-cyan-300 font-semibold">實時 WebGL PBR (物理基元渲染)</span>
              。它不是需要跑 20 分鐘算圖的「超擬真照片級效果圖 (Photo-realistic Ray Tracing)」，也不是單純讓你知道是 3D 的陽春假模型，而是<strong>兼具物理光影、真實尺度與即時碰撞檢查的高精度工程模型</strong>。
            </p>
          </div>

          {/* Comparison Grid: WebGL Real-time vs Photo-realistic Offline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Current In-App 3D Engine */}
            <div className="bg-[#161c2b] border border-cyan-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-white text-sm">本系統內建：實時工程 3D</h4>
                </div>
                <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  60 FPS 零延遲
                </span>
              </div>

              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>立體空間感知：</strong>支援 360° 雙指自由旋轉、仰視/俯視、立面切片剖切。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>精準幾何碰撞檢測：</strong>當家具/吊燈高於大樑 265cm 或空調降板 230cm 時，即刻在 3D 空間中以紅光高亮警示。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>環境光影 (AO & Sunlight)：</strong>具備日光朝向（南向/東向）陰影投影與牆角環境光遮蔽。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>現場即時運算：</strong>在 iPad 或手機上零等待瞬間開啟，適合向業主快速展示空間立體關係。
                  </span>
                </li>
              </ul>
            </div>

            {/* Box 2: Photorealistic Ray-tracing Comparison */}
            <div className="bg-[#161c2b] border border-purple-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <h4 className="font-bold text-white text-sm">外接渲染器：超擬真照片級</h4>
                </div>
                <span className="text-[10px] font-mono bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  V-Ray / Lumion / UE5
                </span>
              </div>

              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>
                    <strong>光線追蹤 (Ray Tracing)：</strong>精確計算玻璃折射、布料次表面散射、金屬毛絲面反射。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>
                    <strong>商業廣告/售樓等級：</strong>每一張單圖需渲染 3~30 分鐘，檔案體積數百 MB。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>
                    <strong>如何無縫接軌？</strong>系統已內建<strong>「SketchUp 自動轉檔」</strong>與<strong>「DXF/GLTF 導出」</strong>通道，直接把本系統的 265/230 降板模型一鍵灌入 3ds Max / SketchUp + V-Ray 進行高階算圖！
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Practical Next Steps for the User */}
          <div className="bg-[#0f1420] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                想體驗現有的 3D 實時空間模擬或進行 SketchUp 轉檔？
              </div>
              <p className="text-slate-400">
                您可以在主畫面隨時切換至「3D 空間模擬」頁籤，或者一鍵匯出模型至專業建模軟體。
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onSwitchTo3DView && (
                <button
                  onClick={() => {
                    onSwitchTo3DView();
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <span>開啟 3D 模擬</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {onOpenSketchUpExport && (
                <button
                  onClick={() => {
                    onOpenSketchUpExport();
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>匯出 SketchUp 模型</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#161d2d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            我知道了，關閉說明
          </button>
        </div>
      </div>
    </div>
  );
};
