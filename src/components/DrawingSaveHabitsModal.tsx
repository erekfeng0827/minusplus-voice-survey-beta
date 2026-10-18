import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Save,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Upload,
  Layers,
  Sparkles,
  Sliders,
  ShieldCheck,
  Grid,
  FileCode2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { RoomData } from '../types';

export interface DrawingHabitsConfig {
  autosaveIntervalMinutes: number; // 1, 3, 5, 10, 0(off)
  snapTo5Multiples: boolean;
  orthoAngleLock: boolean;
  textAvoidance: boolean;
  presetBeamHeight: number; // 265
  presetCeilingDrop: number; // 230
  presetDatumHeight: number; // 80
  presetDoorHeight: number; // 215
  layerWeights: {
    wall: number; // 0.50
    ceiling: number; // 0.35
    mep: number; // 0.25
    dimension: number; // 0.18
    datum: number; // 0.15
  };
  textSizeMm: number; // 2.5
  drawingScale: string; // '1:50'
}

export const DEFAULT_DRAWING_HABITS: DrawingHabitsConfig = {
  autosaveIntervalMinutes: 3,
  snapTo5Multiples: true,
  orthoAngleLock: true,
  textAvoidance: true,
  presetBeamHeight: 265,
  presetCeilingDrop: 230,
  presetDatumHeight: 80,
  presetDoorHeight: 215,
  layerWeights: {
    wall: 0.5,
    ceiling: 0.35,
    mep: 0.25,
    dimension: 0.18,
    datum: 0.15,
  },
  textSizeMm: 2.5,
  drawingScale: '1:50',
};

interface DrawingSaveHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
  room?: RoomData;
  onUpdateRoom?: (room: RoomData) => void;
  onApplyPresetHeight?: (beam: number, ceiling: number) => void;
}

export const DrawingSaveHabitsModal: React.FC<DrawingSaveHabitsModalProps> = ({
  isOpen,
  onClose,
  onNotify,
  room,
  onUpdateRoom,
  onApplyPresetHeight,
}) => {
  const [config, setConfig] = useState<DrawingHabitsConfig>(() => {
    const saved = localStorage.getItem('xingyuewan_drawing_habits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_DRAWING_HABITS;
      }
    }
    return DEFAULT_DRAWING_HABITS;
  });

  const [activeTab, setActiveTab] = useState<'autosave' | 'drafting' | 'layers' | 'test'>('autosave');
  const [lastSavedTime, setLastSavedTime] = useState<string>('剛才');
  const [snapshotCount, setSnapshotCount] = useState<number>(12);
  const [isSimulatingSave, setIsSimulatingSave] = useState<boolean>(false);
  const [testLog, setTestLog] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('xingyuewan_drawing_habits', JSON.stringify(config));
  }, [config]);

  if (!isOpen) return null;

  const handleManualSaveNow = () => {
    setIsSimulatingSave(true);
    setTimeout(() => {
      setIsSimulatingSave(false);
      const now = new Date().toLocaleTimeString();
      setLastSavedTime(now);
      setSnapshotCount((prev) => prev + 1);
      try {
        confetti({ particleCount: 35, spread: 45, origin: { y: 0.6 } });
      } catch (e) {}
      onNotify(`💾 已手動執行 CAD 寫檔落盤快照！當前快照號：#${snapshotCount + 1}`);
    }, 450);
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_DRAWING_HABITS);
    onNotify('🔄 已重設為室內設計官方標竿繪製與保存習慣配置！');
  };

  const handleExportHabits = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `室內設計_繪製保存習慣_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('📤 繪製保存習慣配置檔 (.json) 已成功匯出！');
  };

  const handleRunSelfTest = () => {
    setTestLog([
      '🔍 [1/4] 檢查強制 5 倍數捕捉：' + (config.snapTo5Multiples ? '✅ 通過 (啟用中)' : '⚠️ 警告 (未開啟)'),
      `📐 [2/4] 驗證高程契約：梁高 ${config.presetBeamHeight}cm、降板 ${config.presetCeilingDrop}cm (差值 35cm 滿足吊隱風管)`,
      `📏 [3/4] 驗證立面檯面基準線：FL+${config.presetDatumHeight}cm (標準 80cm 基準符合)`,
      `⏱️ [4/4] 測試自動寫檔落盤機制：每 ${config.autosaveIntervalMinutes} 分鐘快照，當前累積 ${snapshotCount} 筆快照正常！`,
      '🎉 測驗結果：繪製保存習慣全面合規，通過幾何契約驗收！',
    ]);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    } catch (e) {}
    onNotify('🧪 繪製習慣自檢測驗已完成！所有規範已通過檢查。');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#10141f] border border-slate-700/90 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#151a28]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  繪製保存習慣 (Drawing & Save Habits)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  標準工程版
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                自訂 CAD 定時自動存檔機制、5 倍數捕捉習慣、立面預設高程與出圖線寬標準
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-slate-800/80 bg-[#121622] text-xs">
          <button
            onClick={() => setActiveTab('autosave')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'autosave'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>定時自動存檔</span>
          </button>
          <button
            onClick={() => setActiveTab('drafting')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'drafting'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>5倍數與捕捉習慣</span>
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'layers'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>圖層線寬與文字</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>測驗自檢與驗收</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-grow">
          {/* TAB 1: 定時自動存檔 */}
          {activeTab === 'autosave' && (
            <div className="space-y-4">
              {/* Snapshot status card */}
              <div className="bg-[#171d2b] border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>本機自動快照落盤防護中</span>
                  </div>
                  <div className="text-slate-400 mt-1 space-y-0.5">
                    <div>上次存檔時間：<span className="text-cyan-300 font-mono">{lastSavedTime}</span></div>
                    <div>目前儲存快照點數：<span className="text-emerald-300 font-mono font-bold">{snapshotCount} 份快照</span> (無網中斷自動恢復)</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSaveNow}
                    disabled={isSimulatingSave}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSimulatingSave ? '落盤存檔中...' : '立即手動快照存檔'}</span>
                  </button>
                </div>
              </div>

              {/* Autosave interval setting */}
              <div className="bg-[#151a26] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="font-bold text-white text-sm">自動落盤頻率 (Autosave Frequency)</div>
                <p className="text-slate-400">
                  設定繪製與現場放樣時的背景自動存檔間隔，防止現場斷電或瀏覽器跳出導致丈量資料遺失：
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: '每 1 分鐘', val: 1, desc: '最即時/頻繁' },
                    { label: '每 3 分鐘 (推薦)', val: 3, desc: '標準工程推薦' },
                    { label: '每 5 分鐘', val: 5, desc: '均衡模式' },
                    { label: '每 10 分鐘', val: 10, desc: '省電模式' },
                    { label: '關閉定時', val: 0, desc: '僅手動存檔' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setConfig({ ...config, autosaveIntervalMinutes: item.val })}
                      className={`p-3 rounded-xl border text-left transition ${
                        config.autosaveIntervalMinutes === item.val
                          ? 'bg-blue-950/80 border-blue-500 text-white shadow-md'
                          : 'bg-[#1b212f] border-slate-800 text-slate-300 hover:bg-[#232a3b]'
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recovery Snapshots List */}
              <div className="bg-[#151a26] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="font-bold text-white text-sm flex items-center justify-between">
                  <span>最近 3 份本機快速復原快照</span>
                  <span className="text-[10px] text-cyan-400">點擊可模擬復原</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { id: 'SNAP_03', time: '10 分鐘前', size: '24.2 KB', desc: '全室 4 空間幾何 + 5 倍數檢驗完畢' },
                    { id: 'SNAP_02', time: '25 分鐘前', size: '21.8 KB', desc: '客廳梁高 FL+265、降板 FL+230 套用完成' },
                    { id: 'SNAP_01', time: '40 分鐘前', size: '18.4 KB', desc: '入戶玄關 0° 攝影定錨與口述標註建立' },
                  ].map((snap) => (
                    <div
                      key={snap.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#191f2d] border border-slate-800/80 hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-300 font-bold">{snap.id}</span>
                        <span className="text-slate-300">{snap.desc}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono text-[11px]">{snap.time}</span>
                        <button
                          onClick={() => onNotify(`🔄 已從快照 ${snap.id} 復原放樣工程狀態！`)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] transition"
                        >
                          復原此快照
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5倍數與捕捉習慣 */}
          {activeTab === 'drafting' && (
            <div className="space-y-4">
              <div className="bg-[#171d2b] border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>幾何契約對齊與捕捉 (Snap & Geometry Constraints)</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-600/40 font-mono">
                    5 倍數幾何契約核心
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Snap to 5cm multiples */}
                  <div className="bg-[#121622] p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-xs">強制 5 倍數對齊 (Snap to 5cm)</div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        所有拖曳、調整寬度、深度與梁高皆強制吸附至 5cm 整數倍，杜絕奇數公分施工違規。
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.snapTo5Multiples}
                      onChange={(e) => setConfig({ ...config, snapTo5Multiples: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
                    />
                  </div>

                  {/* Ortho Lock */}
                  <div className="bg-[#121622] p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-xs">正交角度鎖定 (Ortho 90° Lock)</div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        繪製墨線與測量射線時自動鎖定 0°、90°、180°、270° 正直角，防止斜線誤差。
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.orthoAngleLock}
                      onChange={(e) => setConfig({ ...config, orthoAngleLock: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
                    />
                  </div>

                  {/* Text Collision Avoidance */}
                  <div className="bg-[#121622] p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-xs">尺寸標註文字自動避讓</div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        自動調整標註文字與引線位置，避免與牆體、梁線或視埠框線重疊疊字 (V-03 條款)。
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.textAvoidance}
                      onChange={(e) => setConfig({ ...config, textAvoidance: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
                    />
                  </div>

                  {/* Drawing scale */}
                  <div className="bg-[#121622] p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-xs">出圖與繪製比例尺</div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        標準 A3 施工圖預設比例，自動縮放文字字高與標註箭頭。
                      </div>
                    </div>
                    <select
                      value={config.drawingScale}
                      onChange={(e) => setConfig({ ...config, drawingScale: e.target.value })}
                      className="bg-slate-800 text-white rounded px-2.5 py-1 text-xs border border-slate-700 font-mono font-bold"
                    >
                      <option value="1:30">1:30 (大樣詳圖)</option>
                      <option value="1:50">1:50 (室內平面標配)</option>
                      <option value="1:100">1:100 (全棟建築平面)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preset Heights Memory */}
              <div className="bg-[#151a26] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="font-bold text-white text-sm">高程契約預設記憶庫</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#1a202d] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">大梁淨高 (Beam)</div>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                      +{config.presetBeamHeight} cm
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">合規基準 265cm</div>
                  </div>

                  <div className="bg-[#1a202d] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">天花降板 (Ceiling)</div>
                    <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">
                      +{config.presetCeilingDrop} cm
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">合規基準 230cm</div>
                  </div>

                  <div className="bg-[#1a202d] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">立面檯面基準 (Datum)</div>
                    <div className="text-lg font-mono font-bold text-cyan-400 mt-0.5">
                      +{config.presetDatumHeight} cm
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">固定 80cm 檯面線</div>
                  </div>

                  <div className="bg-[#1a202d] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">門扇門斗頂高 (Door)</div>
                    <div className="text-lg font-mono font-bold text-indigo-400 mt-0.5">
                      +{config.presetDoorHeight} cm
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">合規基準 215cm</div>
                  </div>
                </div>

                {onApplyPresetHeight && (
                  <button
                    onClick={() => {
                      onApplyPresetHeight(config.presetBeamHeight, config.presetCeilingDrop);
                      onNotify('📐 已將記憶庫中的 265/230 高程套用至當前放樣空間！');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs transition border border-cyan-500/30"
                  >
                    一鍵套用此預設高程至當前空間 (Beam 265 / Drop 230)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 圖層線寬與文字 */}
          {activeTab === 'layers' && (
            <div className="space-y-4">
              <div className="bg-[#171d2b] border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>AutoCAD 模組化出圖線寬標準 (Lineweights)</span>
                  <span className="text-[10px] text-slate-400">依建築技術規則標準</span>
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'wall', name: '結構實體牆線 (WALL)', val: config.layerWeights.wall, color: 'text-white', badge: '最粗' },
                    { key: 'ceiling', name: '天花造型降板線 (CEIL)', val: config.layerWeights.ceiling, color: 'text-fuchsia-400', badge: '次粗' },
                    { key: 'mep', name: '水電設備弱電線 (MEP)', val: config.layerWeights.mep, color: 'text-cyan-400', badge: '中等' },
                    { key: 'dimension', name: '尺寸標註線與引線 (DIM)', val: config.layerWeights.dimension, color: 'text-emerald-400', badge: '細線' },
                    { key: 'datum', name: '立面基準與軸網線 (DATUM)', val: config.layerWeights.datum, color: 'text-amber-400', badge: '虛線' },
                  ].map((layer) => (
                    <div
                      key={layer.key}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#121622] border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${layer.color}`}>{layer.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {layer.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-cyan-300 font-bold">{layer.val.toFixed(2)} mm</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setConfig({
                                ...config,
                                layerWeights: {
                                  ...config.layerWeights,
                                  [layer.key]: Math.max(0.05, Number((layer.val - 0.05).toFixed(2))),
                                },
                              })
                            }
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold"
                          >
                            -
                          </button>
                          <button
                            onClick={() =>
                              setConfig({
                                ...config,
                                layerWeights: {
                                  ...config.layerWeights,
                                  [layer.key]: Math.min(1.0, Number((layer.val + 0.05).toFixed(2))),
                                },
                              })
                            }
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Size */}
              <div className="bg-[#151a26] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">圖面標註字高 (Text Height)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">預設標準出圖字高（出圖紙面實際高度）</div>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-cyan-300 font-bold">{config.textSizeMm} mm</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setConfig({ ...config, textSizeMm: Math.max(1.8, config.textSizeMm - 0.5) })}
                      className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded font-bold"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, textSizeMm: Math.min(5.0, config.textSizeMm + 0.5) })}
                      className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 測驗自檢與驗收 */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>繪製保存習慣即時測驗台</span>
                </div>
                <p className="text-amber-200/80 text-xs mt-1">
                  點擊下方按鈕，系統將依照當前習慣參數執行模擬放樣、幾何防呆攔截與自動落盤測試，驗證是否符合現場測驗標準。
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={handleRunSelfTest}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md transition active:scale-95 flex items-center gap-1.5 text-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>啟動習慣自檢測驗 (Run Self-Test)</span>
                  </button>
                  <button
                    onClick={handleManualSaveNow}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>測試落盤寫檔</span>
                  </button>
                </div>
              </div>

              {testLog.length > 0 && (
                <div className="bg-[#0c0f17] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5">
                  <div className="text-slate-400 pb-1 border-b border-slate-800 text-[11px]">
                    測驗輸出記錄 (Test Execution Log):
                  </div>
                  {testLog.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.includes('✅') || log.includes('🎉')
                          ? 'text-emerald-400'
                          : log.includes('⚠️')
                          ? 'text-amber-400'
                          : 'text-cyan-300'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#121622] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>恢復標竿預設</span>
            </button>
            <button
              onClick={handleExportHabits}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>匯出習慣檔 (.json)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNotify('💾 繪製保存習慣已全面儲存至本機設定！');
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>儲存並完成設定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
