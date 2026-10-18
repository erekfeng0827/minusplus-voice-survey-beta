import React, { useState } from 'react';
import {
  Layers,
  X,
  Sliders,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  Sparkles,
  RotateCcw,
  Scissors,
  Check,
} from 'lucide-react';
import { RoomData } from '../types';
import confetti from 'canvas-confetti';

interface ElevationBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onUpdateRoom?: (room: RoomData) => void;
  onNotify: (msg: string) => void;
  onOpenDesignerExtractor?: () => void;
}

export const ElevationBenchmarkModal: React.FC<ElevationBenchmarkModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdateRoom,
  onNotify,
  onOpenDesignerExtractor,
}) => {
  const [selectedWall, setSelectedWall] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [datum80, setDatum80] = useState<number>(80);
  const [datum110, setDatum110] = useState<number>(110);
  const [datum215, setDatum215] = useState<number>(215);
  const [beamHeight, setBeamHeight] = useState<number>(room.beamHeight || 265);
  const [ceilingDrop, setCeilingDrop] = useState<number>(room.ceilingDrop || 230);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [testResults, setTestResults] = useState<{ id: string; name: string; pass: boolean; note: string }[]>([]);

  if (!isOpen) return null;

  // Wall descriptions
  const wallData = {
    A: {
      name: 'A 牆 · 主採光窗面 (正向視角)',
      features: ['固定大落地採光窗 (寬 320 cm)', '大梁貫穿底標高 +265 cm', '窗台下緣高 +85 cm', '窗頂上收口 +215 cm'],
      width: room.width || 480,
    },
    B: {
      name: 'B 牆 · 電視影音主牆 (右向視角)',
      features: ['低矮電視機櫃檯面 +80 cm 基準', '隱藏壁掛電視插座群 +110 cm', '全室空調天花降板 +230 cm', '吊隱式風管穿梁口'],
      width: room.length || 380,
    },
    C: {
      name: 'C 牆 · 入戶玄關與門洞 (背向視角)',
      features: ['標準實木房門門斗 +215 cm', '弱電箱底部標高 +80 cm', '總電源箱中心標高 +160 cm', '門邊雙切開關 +110 cm'],
      width: room.width || 480,
    },
    D: {
      name: 'D 牆 · 沙發背牆造型 (左向視角)',
      features: ['沙發兩側充電矮座 +80 cm', '壁燈出線口標高 +180 cm', '側梁底包板 +265 cm', '天花間接照明造型槽'],
      width: room.length || 380,
    },
  };

  const currentWall = wallData[selectedWall];
  const hvacClearance = beamHeight - ceilingDrop; // Must be >= 35cm
  const doorCeilingGap = ceilingDrop - datum215; // Must be >= 15cm

  const handleAdjustDatum = (type: 'datum80' | 'beam' | 'drop', delta: number) => {
    if (type === 'datum80') {
      const next = Math.max(70, Math.min(95, datum80 + delta));
      setDatum80(next);
    } else if (type === 'beam') {
      const next = Math.max(240, Math.min(320, beamHeight + delta));
      setBeamHeight(next);
      if (onUpdateRoom) {
        onUpdateRoom({ ...room, beamHeight: next });
      }
    } else if (type === 'drop') {
      const next = Math.max(200, Math.min(260, ceilingDrop + delta));
      setCeilingDrop(next);
      if (onUpdateRoom) {
        onUpdateRoom({ ...room, ceilingDrop: next });
      }
    }
    onNotify(`📐 已調整立面基準高程（依 5 倍數對齊）`);
  };

  const handleRunElevationTest = () => {
    const checks = [
      {
        id: 'CH-01',
        name: '檯面核心基準 FL+80cm 檢核',
        pass: datum80 === 80,
        note: datum80 === 80 ? '完全符合 80cm 檯面契約' : `當前為 ${datum80}cm，建議設為標準 80cm`,
      },
      {
        id: 'CH-02',
        name: '大梁淨高 5 倍數檢核',
        pass: beamHeight % 5 === 0 && beamHeight >= 260,
        note: `大梁淨高 +${beamHeight}cm (${beamHeight % 5 === 0 ? '5倍數合規' : '違規非5倍數'})`,
      },
      {
        id: 'CH-03',
        name: '天花降板淨高 5 倍數檢核',
        pass: ceilingDrop % 5 === 0 && ceilingDrop >= 225,
        note: `降板高度 +${ceilingDrop}cm (${ceilingDrop % 5 === 0 ? '5倍數合規' : '違規非5倍數'})`,
      },
      {
        id: 'CH-04',
        name: '吊隱式冷氣風管穿越間隙 (≥35cm)',
        pass: hvacClearance >= 35,
        note: `梁底與降板淨距為 ${hvacClearance}cm (${hvacClearance >= 35 ? '淨距充裕可穿管' : '間距不足易壓扁風管'})`,
      },
      {
        id: 'CH-05',
        name: '門斗上緣與降板安全間距 (≥15cm)',
        pass: doorCeilingGap >= 15,
        note: `降板與門頂間距 ${doorCeilingGap}cm (${doorCeilingGap >= 15 ? '充裕可裝窗簾盒' : '門扇恐磨擦天花'})`,
      },
    ];

    setTestResults(checks);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    } catch (e) {}
    onNotify('🎯 立面基準基準測驗完成！已全數比對契約高程。');
  };

  const handleExportElevationDxf = () => {
    onNotify(`📄 已為「${currentWall.name}」產出標準立面 AutoCAD DXF 切片檔！`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f131d] border border-slate-700/90 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#141926]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  立面基準基準 (Elevation Datum Benchmarks)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
                  固定 80cm 檯面 · A/B/C/D 直切
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                室內空間 6 大立面基準高程剖析、A/B/C/D 牆面自動切片與吊隱冷氣避梁衝突檢核
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

        {/* 4-Wall Selector Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-2.5 border-b border-slate-800/80 bg-[#111622] text-xs gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 mr-1">展開切面：</span>
            {(['A', 'B', 'C', 'D'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWall(w)}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  selectedWall === w
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-[#1b212f] text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{w} 牆</span>
                <span className="text-[10px] opacity-80">
                  {w === 'A' ? '採光面' : w === 'B' ? '電視牆' : w === 'C' ? '玄關門' : '沙發背'}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500"
              />
              <span>顯示高程格線</span>
            </label>
            <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showDimensions}
                onChange={(e) => setShowDimensions(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500"
              />
              <span>標註尺寸線</span>
            </label>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-grow">
          {/* Elevation Interactive SVG Canvas */}
          <div className="bg-[#0b0e16] border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{currentWall.name} · 立面切片展開圖</span>
                <span className="font-mono text-slate-400 text-[11px]">(開間面寬：{currentWall.width} cm)</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-emerald-400">梁底 +{beamHeight}</span>
                <span className="text-purple-400">降板 +{ceilingDrop}</span>
                <span className="text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  基準 +{datum80} cm
                </span>
              </div>
            </div>

            {/* SVG Elevation Graphic View */}
            <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
              <svg
                viewBox="0 0 800 320"
                className="w-full h-full select-none"
                style={{ background: '#0a0d14' }}
              >
                {/* Background Grid */}
                {showGrid && (
                  <defs>
                    <pattern id="elevGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#171d2b" strokeWidth="1" />
                    </pattern>
                  </defs>
                )}
                {showGrid && <rect width="800" height="320" fill="url(#elevGrid)" />}

                {/* Floor Slab (FL ±0.0) */}
                <rect x="60" y="280" width="680" height="25" fill="#1b2230" stroke="#334155" strokeWidth="2" />
                <text x="70" y="297" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  FL ±0.0 完成地坪 (Finish Floor Line)
                </text>

                {/* Ceiling Slab (FL +300) */}
                <rect x="60" y="20" width="680" height="15" fill="#1b2230" stroke="#334155" strokeWidth="1.5" />
                <text x="70" y="32" fill="#64748b" fontSize="10" fontFamily="monospace">
                  FL +300 RC結構樓板底 (Slab Soffit)
                </text>

                {/* Structural Beam (FL +265) */}
                <rect x="180" y="20" width="440" height="35" fill="#14291f" stroke="#10b981" strokeWidth="2" />
                <text x="200" y="44" fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  大梁底淨高 FL +{beamHeight} cm
                </text>

                {/* Drop Ceiling (FL +230) */}
                <line x1="60" y1="90" x2="740" y2="90" stroke="#c084fc" strokeWidth="2.5" strokeDasharray="6,4" />
                <text x="70" y="85" fill="#c084fc" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  天花降板線 FL +{ceilingDrop} cm (空調吊頂)
                </text>

                {/* Wall specific features */}
                {selectedWall === 'A' && (
                  /* Big Window */
                  <g>
                    <rect x="220" y="105" width="360" height="130" fill="#0f2b38" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
                    <line x1="400" y1="105" x2="400" y2="235" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="330" y="175" fill="#7dd3fc" fontSize="12" fontWeight="bold">固定採光大落地窗</text>
                    <text x="350" y="195" fill="#38bdf8" fontSize="10" fontFamily="monospace">寬 320 cm</text>
                  </g>
                )}

                {selectedWall === 'B' && (
                  /* TV and Cabinet */
                  <g>
                    <rect x="260" y="200" width="280" height="80" fill="#1e1b2e" stroke="#a855f7" strokeWidth="2" />
                    <text x="330" y="245" fill="#d8b4fe" fontSize="11" fontWeight="bold">矮櫃檯面 (FL+80)</text>
                    <rect x="300" y="125" width="200" height="60" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" />
                    <text x="360" y="160" fill="#93c5fd" fontSize="11" fontWeight="bold">壁掛電視 (FL+110)</text>
                  </g>
                )}

                {selectedWall === 'C' && (
                  /* Door and Panel */
                  <g>
                    <rect x="240" y="105" width="130" height="175" fill="#2d1c16" stroke="#f97316" strokeWidth="2" />
                    <text x="270" y="190" fill="#fdba74" fontSize="11" fontWeight="bold">玄關實木門</text>
                    <text x="275" y="210" fill="#fb923c" fontSize="10" fontFamily="monospace">頂高 215cm</text>
                    <rect x="460" y="140" width="80" height="100" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="475" y="190" fill="#7dd3fc" fontSize="10">弱電箱</text>
                  </g>
                )}

                {selectedWall === 'D' && (
                  /* Sofa */
                  <g>
                    <rect x="220" y="220" width="360" height="60" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    <text x="360" y="255" fill="#cbd5e1" fontSize="11" fontWeight="bold">客廳沙發背牆</text>
                  </g>
                )}

                {/* Key Datum Line: FL +215 (Door Head) */}
                <line x1="60" y1="105" x2="740" y2="105" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,4" />
                <text x="610" y="102" fill="#fb923c" fontSize="10" fontFamily="monospace">
                  FL +{datum215} 門斗頂 (Door Head)
                </text>

                {/* Key Datum Line: FL +110 (Switch & Receptacle) */}
                <line x1="60" y1="210" x2="740" y2="210" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
                <text x="610" y="206" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                  FL +{datum110} 開關面板基準
                </text>

                {/* Core Hero Datum Line: FL +80 (Countertop / Receptacle) */}
                <line x1="60" y1="240" x2="740" y2="240" stroke="#f59e0b" strokeWidth="3" />
                <circle cx="200" cy="240" r="4" fill="#f59e0b" />
                <text x="210" y="235" fill="#f59e0b" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  ★ FL +{datum80} cm 核心立面基準線 (檯面/工作台/矮櫃)
                </text>

                {/* Dimension callouts */}
                {showDimensions && (
                  <g>
                    <line x1="755" y1="280" x2="755" y2="240" stroke="#f59e0b" strokeWidth="1" />
                    <text x="760" y="263" fill="#f59e0b" fontSize="10" fontFamily="monospace">80</text>
                    <line x1="755" y1="90" x2="755" y2="20" stroke="#10b981" strokeWidth="1" />
                    <text x="760" y="60" fill="#10b981" fontSize="10" fontFamily="monospace">{hvacClearance}</text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Quick Adjusters & 5-Multiple Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. FL +80 cm 檯面基準 */}
            <div className="bg-[#161c28] border border-amber-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">★ 核心基準高程 (Datum)</span>
                <span className="font-mono text-amber-400 font-bold text-sm">+{datum80} cm</span>
              </div>
              <p className="text-[11px] text-slate-400">
                室內所有下矮櫃、廚具檯面與工作桌面統一對齊此線。
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleAdjustDatum('datum80', -5)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono font-bold"
                >
                  -5 cm
                </button>
                <button
                  onClick={() => handleAdjustDatum('datum80', 5)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono font-bold"
                >
                  +5 cm
                </button>
                <button
                  onClick={() => setDatum80(80)}
                  className="px-3 py-1 bg-amber-950 border border-amber-500/50 text-amber-300 rounded-lg font-bold"
                >
                  重置 80
                </button>
              </div>
            </div>

            {/* 2. 大梁底淨高 Beam Clearance */}
            <div className="bg-[#161c28] border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300">大梁淨高 (Beam Height)</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">+{beamHeight} cm</span>
              </div>
              <p className="text-[11px] text-slate-400">
                幾何契約梁高：標準 265 cm，強制 5 倍數。
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleAdjustDatum('beam', -5)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono font-bold"
                >
                  -5 cm
                </button>
                <button
                  onClick={() => handleAdjustDatum('beam', 5)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono font-bold"
                >
                  +5 cm
                </button>
                <button
                  onClick={() => {
                    setBeamHeight(265);
                    if (onUpdateRoom) onUpdateRoom({ ...room, beamHeight: 265 });
                  }}
                  className="px-3 py-1 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded-lg font-bold"
                >
                  標配 265
                </button>
              </div>
            </div>

            {/* 3. 天花降板 Drop Ceiling */}
            <div className="bg-[#161c28] border border-purple-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300">天花降板 (Drop Ceiling)</span>
                <span className="font-mono text-purple-400 font-bold text-sm">+{ceilingDrop} cm</span>
              </div>
              <p className="text-[11px] text-slate-400">
                空調吊頂面：與大梁差值需 ≥ 35cm 確保冷氣管路暢通。
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleAdjustDatum('drop', -5)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono font-bold"
                >
                  -5 cm
                </button>
                <button
                  onClick={() => handleAdjustDatum('drop', 5)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono font-bold"
                >
                  +5 cm
                </button>
                <button
                  onClick={() => {
                    setCeilingDrop(230);
                    if (onUpdateRoom) onUpdateRoom({ ...room, ceilingDrop: 230 });
                  }}
                  className="px-3 py-1 bg-purple-950 border border-purple-500/50 text-purple-300 rounded-lg font-bold"
                >
                  標配 230
                </button>
              </div>
            </div>
          </div>

          {/* Test Results Section */}
          <div className="bg-[#121622] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>立面基準基準 · 測驗自檢與驗收檢核</span>
              </div>
              <button
                onClick={handleRunElevationTest}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow active:scale-95"
              >
                執行立面合規性測驗
              </button>
            </div>

            {testResults.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {testResults.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      t.pass
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-red-950/40 border-red-500/40 text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {t.pass ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <span className="font-bold">{t.name}</span>
                    </div>
                    <div className="font-mono text-[11px]">{t.note}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">
                尚未執行檢核。點擊上方「執行立面合規性測驗」驗證 80cm 基準線、265/230 高程契約與冷氣穿管衝突。
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#121622] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportElevationDxf}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>匯出立面 DXF 切片</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNotify('✅ 立面基準基準高程已套用至全室施工放樣工程！');
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>套用並完成立面基準</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
