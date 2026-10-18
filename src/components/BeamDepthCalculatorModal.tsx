import React, { useState, useMemo } from 'react';
import {
  Box,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  Layers,
  Ruler,
  Sliders,
  Download,
  RotateCcw,
  Check,
  Building,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { RoomData, Beam } from '../types';

interface BeamDepthCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onUpdateRoom?: (updatedRoom: RoomData) => void;
  onNotify?: (msg: string) => void;
}

export const BeamDepthCalculatorModal: React.FC<BeamDepthCalculatorModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdateRoom,
  onNotify,
}) => {
  // Preset rooms for quick testing
  const benchmarkRooms = [
    { id: 'living', name: '客廳／餐廳／玄關', floorH: 296, beamClearH: 233, beamW: 35, span: 311 },
    { id: 'master', name: '標竿主臥房', floorH: 296, beamClearH: 218, beamW: 40, span: 298 },
    { id: 'daughter', name: '女兒房', floorH: 296, beamClearH: 218, beamW: 30, span: 280 },
    { id: 'son', name: '兒子房', floorH: 297, beamClearH: 218, beamW: 45, span: 226 },
  ];

  const [floorHeight, setFloorHeight] = useState<number>(room.height || 296);
  const [beamClearHeight, setBeamClearHeight] = useState<number>(
    room.beams && room.beams.length > 0 ? room.beams[0].clearHeight : 218
  );
  const [beamWidth, setBeamWidth] = useState<number>(
    room.beams && room.beams.length > 0 ? room.beams[0].width : 35
  );
  const [beamSpan, setBeamSpan] = useState<number>(room.width || 311);
  const [casingThickness, setCasingThickness] = useState<number>(3.8); // 木作角材與矽酸鈣板完成面厚度 (cm)
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');

  // 計算核心
  const calculation = useMemo(() => {
    // 梁深 D = 樓板完成面/板底高 - 梁底淨高
    const depth = Math.max(0, floorHeight - beamClearHeight);

    // 結構跨距梁深估算比 (RC 典型跨深比 L/10 ~ L/14)
    const estDepthMin = Math.round(beamSpan / 14);
    const estDepthMax = Math.round(beamSpan / 10);
    const spanDepthRatio = depth > 0 ? (beamSpan / depth).toFixed(1) : 'N/A';

    // 木作包梁假梁完成面尺寸
    const wrappedDepth = depth + casingThickness;
    const wrappedWidth = beamWidth + casingThickness * 2;
    const wrappedClearHeight = beamClearHeight - casingThickness;

    // 居室最低淨高門禁 (台灣建築技術規則 210cm)
    const headroomMargin = wrappedClearHeight - 210;
    const isHeadroomCompliant = wrappedClearHeight >= 210;

    // 空調穿梁洗孔容許極限 (孔徑不得大於梁深 1/3)
    const maxCoreHoleDiameter = Math.floor(depth / 3);

    return {
      depth,
      estDepthMin,
      estDepthMax,
      spanDepthRatio,
      wrappedDepth,
      wrappedWidth,
      wrappedClearHeight,
      headroomMargin,
      isHeadroomCompliant,
      maxCoreHoleDiameter,
    };
  }, [floorHeight, beamClearHeight, beamWidth, beamSpan, casingThickness]);

  const handleApplyPreset = (preset: typeof benchmarkRooms[0]) => {
    setSelectedPreset(preset.id);
    setFloorHeight(preset.floorH);
    setBeamClearHeight(preset.beamClearH);
    setBeamWidth(preset.beamW);
    setBeamSpan(preset.span);
    onNotify?.(`✓ 已載入「${preset.name}」現場實測梁位數據 (梁深 ${preset.floorH - preset.beamClearH}cm)`);
  };

  const handleSaveToRoom = () => {
    if (!onUpdateRoom) return;

    const existingBeams = room.beams || [];
    let updatedBeams: Beam[];

    if (existingBeams.length > 0) {
      updatedBeams = existingBeams.map((b, idx) =>
        idx === 0
          ? {
              ...b,
              width: beamWidth,
              depth: calculation.depth,
              clearHeight: beamClearHeight,
            }
          : b
      );
    } else {
      updatedBeams = [
        {
          id: `beam_${Date.now()}`,
          name: '主橫梁 (自動計深)',
          width: beamWidth,
          depth: calculation.depth,
          clearHeight: beamClearHeight,
          orientation: 'horizontal',
          y: Math.round(room.length / 2),
        },
      ];
    }

    const updated: RoomData = {
      ...room,
      height: floorHeight,
      beams: updatedBeams,
      notes: [
        ...(room.notes || []),
        `[梁深自動計算] 樓高 ${floorHeight}cm, 梁底 FL+${beamClearHeight}cm, 計算梁深 ${calculation.depth}cm, 木作包梁淨高 FL+${calculation.wrappedClearHeight.toFixed(1)}cm`,
      ],
    };

    onUpdateRoom(updated);
    onNotify?.(`✓ 梁深計算結果 (${calculation.depth}cm) 已寫入「${room.roomName}」並同步 3D/2D 放樣模型！`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#12161f] border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[90vh] max-h-[820px] shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#171d2b] via-[#1a2233] to-[#141924] border-b border-slate-700/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-black text-lg tracking-wide">
                  新增樑深自動計算工具
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  D = H_floor - H_beam
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                精準反推結構大梁與假梁深度 · 包梁尺寸 · 穿梁洗孔極限 · 台灣建築技術規則 210cm 淨高門禁
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Benchmark Preset Bar */}
        <div className="px-4 py-2.5 bg-[#0e121a] border-b border-slate-800 flex items-center gap-2 overflow-x-auto hide-scrollbar text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>星玥灣 8F 案場實測快速載入：</span>
          </span>
          {benchmarkRooms.map((b) => (
            <button
              key={b.id}
              onClick={() => handleApplyPreset(b)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition border ${
                selectedPreset === b.id
                  ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span>{b.name}</span>
              <span className="ml-1 text-[10px] text-slate-400">({b.floorH - b.beamClearH}cm)</span>
            </button>
          ))}
        </div>

        {/* Body Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Panel: Inputs & Controls */}
          <div className="w-full md:w-5/12 border-r border-slate-800 p-4 sm:p-5 overflow-y-auto space-y-5 bg-[#11151e]">
            {/* Live Result Highlight Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4" />
                  <span>自動計算結構梁深 (Beam Depth)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/50 text-amber-200 border border-amber-600/40">
                  {calculation.depth} cm
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-black font-mono text-white">
                  {calculation.depth} <span className="text-sm font-normal text-slate-400">cm</span>
                </div>
                <div className="text-xs text-right text-slate-300">
                  <div>跨深比：<span className="font-mono font-bold text-amber-300">1 : {calculation.spanDepthRatio}</span></div>
                  <div className="text-[10px] text-slate-400">建議梁深範圍：{calculation.estDepthMin}~{calculation.estDepthMax}cm</div>
                </div>
              </div>

              {/* Headroom Compliance Alert */}
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  calculation.isHeadroomCompliant
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/60 border-red-500/40 text-red-300'
                }`}
              >
                {calculation.isHeadroomCompliant ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                )}
                <div>
                  <span className="font-bold">
                    {calculation.isHeadroomCompliant ? '居室淨高門禁合規' : '淨高低於建築法規 210cm 門檻！'}
                  </span>
                  <div className="text-[11px] opacity-80">
                    木作包梁後淨高 FL+{calculation.wrappedClearHeight.toFixed(1)}cm (安全裕度 +{calculation.headroomMargin.toFixed(1)}cm)
                  </div>
                </div>
              </div>
            </div>

            {/* Input Sliders */}
            <div className="space-y-4 text-xs">
              {/* 1. Floor Height */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <label className="font-bold flex items-center gap-1.5">
                    <span>樓板下緣淨高 (H_floor)</span>
                    <span className="text-slate-500 font-normal">清水板底</span>
                  </label>
                  <span className="font-mono font-bold text-amber-300">{floorHeight} cm</span>
                </div>
                <input
                  type="range"
                  min="260"
                  max="380"
                  step="1"
                  value={floorHeight}
                  onChange={(e) => {
                    setSelectedPreset('custom');
                    setFloorHeight(Number(e.target.value));
                  }}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                />
              </div>

              {/* 2. Beam Clear Height */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <label className="font-bold flex items-center gap-1.5">
                    <span>梁底淨高標高 (H_beam_clear)</span>
                    <span className="text-slate-500 font-normal">梁下緣</span>
                  </label>
                  <span className="font-mono font-bold text-amber-300">{beamClearHeight} cm</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max={floorHeight - 5}
                  step="1"
                  value={beamClearHeight}
                  onChange={(e) => {
                    setSelectedPreset('custom');
                    setBeamClearHeight(Number(e.target.value));
                  }}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                />
              </div>

              {/* 3. Beam Width */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <label className="font-bold">結構梁寬度 (Beam Width)</label>
                  <span className="font-mono font-bold text-amber-300">{beamWidth} cm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="1"
                  value={beamWidth}
                  onChange={(e) => {
                    setSelectedPreset('custom');
                    setBeamWidth(Number(e.target.value));
                  }}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                />
              </div>

              {/* 4. Beam Span */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <label className="font-bold">空間開口跨距 (Span L)</label>
                  <span className="font-mono font-bold text-amber-300">{beamSpan} cm</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="650"
                  step="1"
                  value={beamSpan}
                  onChange={(e) => {
                    setSelectedPreset('custom');
                    setBeamSpan(Number(e.target.value));
                  }}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                />
              </div>

              {/* 5. Casing Finish Thickness */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-slate-300">
                  <label className="font-bold">木作包覆角材厚度 (角材+矽酸鈣板)</label>
                  <span className="font-mono font-bold text-slate-400">{casingThickness} cm</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  {[
                    { label: '超薄貼皮 (1.5cm)', val: 1.5 },
                    { label: '標準木作 (3.8cm)', val: 3.8 },
                    { label: '厚實包管 (5.0cm)', val: 5.0 },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setCasingThickness(opt.val)}
                      className={`p-2 rounded-lg border font-medium transition ${
                        casingThickness === opt.val
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveToRoom}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
              >
                <Check className="w-4 h-4" />
                <span>套用計算結果至當前空間 ({room.roomName})</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Live SVG CAD Section & Structural Audit Report */}
          <div className="w-full md:w-7/12 flex flex-col bg-[#141822] overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* SVG Interactive Cross-Section */}
            <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-bold text-slate-200">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>CAD 剖面結構與包梁尺寸放樣圖 (Section Detail)</span>
                </span>
                <span className="text-amber-400 font-mono text-[10px]">即時向量幾何</span>
              </div>

              <div className="h-60 w-full flex items-center justify-center bg-gradient-to-b from-[#0f141d] to-[#0b0e14] rounded-lg border border-slate-900 p-2">
                <svg viewBox="0 0 520 220" className="w-full h-full">
                  {/* Background Lines */}
                  <line x1="30" y1="200" x2="490" y2="200" stroke="#475569" strokeWidth="2.5" />
                  <text x="35" y="195" fill="#94a3b8" fontSize="10" fontFamily="monospace">FL±0.0 (室內地坪完成面)</text>

                  {/* Slab line */}
                  <line x1="30" y1="25" x2="490" y2="25" stroke="#334155" strokeWidth="2" strokeDasharray="5 3" />
                  <text x="35" y="20" fill="#64748b" fontSize="9" fontFamily="monospace">
                    樓板底 FL+{floorHeight}cm
                  </text>

                  {/* Concrete Beam */}
                  {/* scaled beam rect */}
                  <g transform="translate(180, 25)">
                    {/* RC Beam hatching/fill */}
                    <rect
                      x="0"
                      y="0"
                      width="120"
                      height={Math.min(130, Math.max(40, calculation.depth * 1.3))}
                      fill="#333b4d"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <text x="25" y="35" fill="#f8fafc" fontSize="11" fontWeight="bold">RC 結構梁</text>
                    <text x="20" y="55" fill="#94a3b8" fontSize="9" fontFamily="monospace">寬 {beamWidth}cm</text>
                    <text x="15" y="70" fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      深 {calculation.depth}cm
                    </text>

                    {/* Wooden Casing Wrapper Outline */}
                    <rect
                      x="-8"
                      y="0"
                      width="136"
                      height={Math.min(138, Math.max(48, calculation.depth * 1.3 + 8))}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                    <text
                      x="-8"
                      y={Math.min(138, Math.max(48, calculation.depth * 1.3 + 8)) + 14}
                      fill="#f59e0b"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      包梁完成底 FL+{calculation.wrappedClearHeight.toFixed(1)}cm
                    </text>
                  </g>

                  {/* Headroom 210cm Threshold line */}
                  <line x1="40" y1="110" x2="480" y2="110" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="380" y="106" fill="#ef4444" fontSize="9" fontFamily="monospace">法定居室淨高 210cm</text>

                  {/* Vertical Dimension Chain */}
                  <line x1="120" y1="25" x2="120" y2="200" stroke="#38bdf8" strokeWidth="1" />
                  <text x="60" y="115" fill="#38bdf8" fontSize="9" fontFamily="monospace">總高 {floorHeight}cm</text>
                </svg>
              </div>
            </div>

            {/* Engineering Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400">木作包梁完成面淨高</span>
                <div className="text-base font-bold text-white font-mono">
                  FL+{calculation.wrappedClearHeight.toFixed(1)} cm
                </div>
                <div className="text-[10px] text-slate-400">
                  斷面：{calculation.wrappedWidth.toFixed(1)} × {calculation.wrappedDepth.toFixed(1)} cm
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400">容許穿梁洗孔最大管徑</span>
                <div className="text-base font-bold text-amber-300 font-mono">
                  Φ ≤ {calculation.maxCoreHoleDiameter} cm
                </div>
                <div className="text-[10px] text-slate-400">
                  (D/3 結構開孔上限，距柱邊 ≥ L/4)
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400">法規居室淨裕度</span>
                <div
                  className={`text-base font-bold font-mono ${
                    calculation.isHeadroomCompliant ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {calculation.headroomMargin >= 0 ? `+${calculation.headroomMargin.toFixed(1)}` : calculation.headroomMargin.toFixed(1)} cm
                </div>
                <div className="text-[10px] text-slate-400">
                  門檻：台灣技術規則 210cm
                </div>
              </div>
            </div>

            {/* Construction Guidance Note */}
            <div className="bg-[#121620] border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>施工現場放樣與水電冷媒避讓規範</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed text-[11px]">
                <li>
                  <strong>空調吊隱室內機：</strong>若冷媒管與排水管須繞經大梁下方，天花板降板需至少預留梁底再向下 15~20cm。
                </li>
                <li>
                  <strong>免洗孔假梁方案：</strong>梁深達 {calculation.depth}cm 時，建議優先使用側吹風管或假梁包覆出風，避免破壞主梁箍筋。
                </li>
                <li>
                  <strong>5 倍數放樣契約：</strong>目前計算梁深 {calculation.depth}cm，如欲遵循整數放樣契約，建議木作封板標高收在整數模數。
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeamDepthCalculatorModal;
