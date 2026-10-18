import React, { useState } from 'react';
import {
  Tablet,
  X,
  Sparkles,
  Layers,
  Sliders,
  Mic,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IpadHiddenMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterZenMode: () => void;
  onNotify: (msg: string) => void;
}

export const IpadHiddenMenuModal: React.FC<IpadHiddenMenuModalProps> = ({
  isOpen,
  onClose,
  onEnterZenMode,
  onNotify,
}) => {
  const [activePreviewDrawer, setActivePreviewDrawer] = useState<'top' | 'left' | 'right' | 'bottom'>('top');
  const [autoHideSeconds, setAutoHideSeconds] = useState<number>(4);
  const [edgeHotspotPx, setEdgeHotspotPx] = useState<number>(14);
  const [screenLockEnabled, setScreenLockEnabled] = useState<boolean>(true);
  const [testChecklist, setTestChecklist] = useState<boolean[]>([true, true, true, true, true]);

  if (!isOpen) return null;

  const handleStartZenModeDirectly = () => {
    onClose();
    onEnterZenMode();
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
    } catch (e) {}
    onNotify('📱 已進入 iPad 純淨丈量模式：四向隱藏式抽屜已就緒，開始進行測驗！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e121a] border border-slate-700/90 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#131824]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  iPad 隱藏式選單 (iPad Hidden Drawer Menu)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  四向極淨丈量 · 100% 滿版
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                為 iPad 現場丈量打造的零遮擋繪圖板面，上下左右四向滑出式隱藏抽屜配置與測驗台
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

        {/* Hero CTA to Enter Pure Zen Mode */}
        <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-[#132223] to-[#0e1620] border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-white font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>現場純淨丈量模式 (Zen Measurement Viewport)</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              隱藏所有桌面版頂部標籤與干擾，將整塊螢幕化為極致純淨的 CAD 放樣工作台，僅透過四邊隱藏抽屜進行操作。
            </p>
          </div>
          <button
            onClick={handleStartZenModeDirectly}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            <Maximize2 className="w-4 h-4" />
            <span>立即啟動 100% 滿版純淨模式</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-grow">
          {/* 4-Way Drawer Interactive Simulator */}
          <div className="bg-[#141926] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white text-sm">四向隱藏抽屜架構與即時預覽</div>
              <span className="text-slate-400 text-[11px]">點擊下方四個按鈕切換查看各抽屜職責</span>
            </div>

            {/* 4 Direction Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setActivePreviewDrawer('top')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  activePreviewDrawer === 'top'
                    ? 'bg-blue-950/80 border-blue-500 text-white'
                    : 'bg-[#1a202e] border-slate-800 text-slate-300 hover:bg-[#222a3d]'
                }`}
              >
                <ChevronUp className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs">上邊 · 動態島</span>
                <span className="text-[10px] text-slate-400">空間資訊與視圖分頁</span>
              </button>

              <button
                onClick={() => setActivePreviewDrawer('left')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  activePreviewDrawer === 'left'
                    ? 'bg-cyan-950/80 border-cyan-500 text-white'
                    : 'bg-[#1a202e] border-slate-800 text-slate-300 hover:bg-[#222a3d]'
                }`}
              >
                <ChevronLeft className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs">左邊 · 側邊拉鈕</span>
                <span className="text-[10px] text-slate-400">全室空間與圖層開關</span>
              </button>

              <button
                onClick={() => setActivePreviewDrawer('right')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  activePreviewDrawer === 'right'
                    ? 'bg-amber-950/80 border-amber-500 text-white'
                    : 'bg-[#1a202e] border-slate-800 text-slate-300 hover:bg-[#222a3d]'
                }`}
              >
                <ChevronRight className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">右邊 · 契約速調</span>
                <span className="text-[10px] text-slate-400">梁高265/降板230步進</span>
              </button>

              <button
                onClick={() => setActivePreviewDrawer('bottom')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  activePreviewDrawer === 'bottom'
                    ? 'bg-rose-950/80 border-rose-500 text-white'
                    : 'bg-[#1a202e] border-slate-800 text-slate-300 hover:bg-[#222a3d]'
                }`}
              >
                <ChevronDown className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-xs">下邊 · 懸浮底座</span>
                <span className="text-[10px] text-slate-400">口述定錨與7大捷徑</span>
              </button>
            </div>

            {/* Selected Drawer Detail Card */}
            <div className="p-4 rounded-xl bg-[#0e121a] border border-slate-800 space-y-2">
              {activePreviewDrawer === 'top' && (
                <div>
                  <div className="font-bold text-blue-300 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>⬆️ 上邊動態島 (Top Dynamic Island Capsule)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                    平時僅呈現 28px 高度的極小半透明膠囊，點擊時滑出空間名（如：現場放樣 · 客廳）、計算面積（m²/坪）、梁底淨高（+265cm）與天花降板（+230cm），並能一鍵切換「2D放樣 / 天花降板 / 水電弱電」及快速匯出 DXF。
                  </p>
                </div>
              )}

              {activePreviewDrawer === 'left' && (
                <div>
                  <div className="font-bold text-cyan-300 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>⬅️ 左邊側拉抽屜 (Left Edge Space & Layers Drawer)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                    以垂直小標籤收納於左螢幕邊緣，滑出後可迅速在「客廳、主臥、客臥、廚衛」等房間無縫切換，並具備「2D墨線、語音口述點位、天花降板投影、水電弱電開關」四組圖層獨立開關。
                  </p>
                </div>
              )}

              {activePreviewDrawer === 'right' && (
                <div>
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>➡️ 右邊契約速調台 (Right Edge 5-Multiple Quick Stepper)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                    現場手持 iPad 時，拇指輕觸右側邊緣即可滑出 5 倍數速調面板。包含梁底高（260/265/270）、降板高（225/230/235）與開間面寬進深 `±5cm` 步進，強制鎖定 5 倍數幾何規範。
                  </p>
                </div>
              )}

              {activePreviewDrawer === 'bottom' && (
                <div>
                  <div className="font-bold text-rose-300 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>⬇️ 下邊懸浮操作底座 (Bottom Floating Action Dock)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                    配置直徑 48px 的紅色錄音定錨鈕，支援口述「梁下淨高 265、空調降板 230」現場 AI 定錨；右側收納 7 大工務捷徑（SketchUp 轉檔、合規稽核、360 攝影、CAD 擷取、自動立面片、CAD 樣式同步、步驟攝影），可隨時收折。
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Gesture Sensitivity Settings */}
          <div className="bg-[#141926] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="font-bold text-white text-sm">抽屜觸控靈敏度與自動隱藏偏好</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#1a202e] p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">自動收合延遲 (Auto-hide)</div>
                <div className="text-cyan-300 font-mono font-bold text-sm mt-0.5">{autoHideSeconds} 秒無操作自動隱藏</div>
                <div className="flex items-center gap-2 mt-2">
                  {[3, 4, 6].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setAutoHideSeconds(sec)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        autoHideSeconds === sec ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a202e] p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">邊緣滑出熱區 (Edge Hotspot)</div>
                <div className="text-cyan-300 font-mono font-bold text-sm mt-0.5">{edgeHotspotPx} px 寬度觸發區</div>
                <div className="flex items-center gap-2 mt-2">
                  {[10, 14, 18].map((px) => (
                    <button
                      key={px}
                      onClick={() => setEdgeHotspotPx(px)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        edgeHotspotPx === px ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {px}px
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a202e] p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-slate-400 text-[10px]">防誤觸螢幕鎖定</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {screenLockEnabled ? '✅ 已啟用防誤觸手勢' : '❌ 未啟用'}
                  </div>
                </div>
                <button
                  onClick={() => setScreenLockEnabled(!screenLockEnabled)}
                  className="mt-2 py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
                >
                  切換狀態
                </button>
              </div>
            </div>
          </div>

          {/* Test Readiness Checklist */}
          <div className="bg-[#141926] border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="font-bold text-white text-sm flex items-center justify-between">
              <span>iPad 現地測驗驗收檢核點 (Testing Readiness)</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-mono">
                5 / 5 項就緒
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              {[
                '100% 滿版無遮擋：點擊進入後全螢幕無任何多餘頁首與框架',
                '四向隱藏抽屜觸控順暢：上下左右皆能單指展開與收折',
                '5 倍數契約步進連動：右側抽屜微調即時反映至放樣畫布',
                '口述語音定錨鍵響應：麥克風錄音與座標定錨回饋即時',
                '隨時無縫返回：頂部動態島內建「退出純淨模式」按鈕',
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#1a202e] text-slate-300 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#121622] flex flex-wrap items-center justify-between gap-2">
          <div className="text-slate-400 text-xs">
            iPad 專屬版授權已生效，支援 Safari / Chrome 加入主畫面 (PWA)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              返回
            </button>
            <button
              onClick={handleStartZenModeDirectly}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Maximize2 className="w-4 h-4" />
              <span>進入 iPad 純淨丈量模式</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
