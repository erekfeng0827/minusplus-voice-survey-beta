import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Layers,
  CheckCircle2,
  Check,
  AlertCircle,
  Maximize2,
  Sliders,
  Ruler,
  DoorOpen,
  Sun,
  Droplets,
  Zap,
  ArrowRight,
  Eye,
  Box,
  Copy,
  LayoutGrid,
  Bed,
  Sofa,
  UtensilsCrossed,
  Bath,
  RotateCcw,
} from 'lucide-react';
import { RoomData } from '../types';
import {
  RoomFunctionType,
  ROOM_FUNCTION_NAMES,
  classifyRoomFunction,
  generateStandardBlocksForFunction,
  applyRoomFunctionAndBlocks,
} from '../utils/roomFunctionClassifier';

interface RoomFunctionClassifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  allRooms?: RoomData[];
  onUpdateRoom: (updatedRoom: RoomData) => void;
  onUpdateAllRooms?: (updatedRooms: RoomData[]) => void;
  onNotify: (msg: string) => void;
  onNavigateToTab?: (tab: '2d_staking' | '3d_simulation' | 'blueprints' | 'audit_dashboard') => void;
}

export const RoomFunctionClassifierModal: React.FC<RoomFunctionClassifierModalProps> = ({
  isOpen,
  onClose,
  room,
  allRooms = [],
  onUpdateRoom,
  onUpdateAllRooms,
  onNotify,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  // Run geometric classification
  const initialClassification = useMemo(() => classifyRoomFunction(room), [room]);

  // User selected target function (defaults to AI detected)
  const [selectedFunction, setSelectedFunction] = useState<RoomFunctionType>(
    initialClassification.primaryFunction
  );
  const [replaceExistingBlocks, setReplaceExistingBlocks] = useState<boolean>(true);
  const [appendMepPoints, setAppendMepPoints] = useState<boolean>(true);
  const [updateRoomName, setUpdateRoomName] = useState<boolean>(true);

  // Preview generated blocks for the chosen function
  const previewBlocks = useMemo(() => {
    return generateStandardBlocksForFunction(selectedFunction, room);
  }, [selectedFunction, room]);

  // Apply to current room
  const handleApply = (navigateTo?: '2d_staking' | '3d_simulation' | 'blueprints') => {
    const updated = applyRoomFunctionAndBlocks(room, selectedFunction, {
      replaceExisting: replaceExistingBlocks,
      updateRoomName,
      appendMep: appendMepPoints,
    });
    onUpdateRoom(updated);
    onNotify(
      `✨ 已成功將「${updated.roomName}」判定並套用【${ROOM_FUNCTION_NAMES[selectedFunction]}】標準圖塊 (${previewBlocks.placedBlocks.length} 項圖塊)！`
    );
    if (navigateTo && onNavigateToTab) {
      onNavigateToTab(navigateTo);
    }
    onClose();
  };

  // Batch apply to all rooms in project
  const handleBatchClassifyAll = () => {
    if (!onUpdateAllRooms || allRooms.length === 0) {
      handleApply();
      return;
    }

    const updatedList = allRooms.map((r) => {
      const cls = classifyRoomFunction(r);
      return applyRoomFunctionAndBlocks(r, cls.primaryFunction, {
        replaceExisting: true,
        updateRoomName: true,
        appendMep: true,
      });
    });

    onUpdateAllRooms(updatedList);
    onNotify(`🚀 案場全屋 ${updatedList.length} 個空間已全數完成幾何特徵自動分類與標準圖塊套用！`);
    onClose();
  };

  // SVG Dimension Calculations
  const padding = 40;
  const svgW = room.width + padding * 2;
  const svgH = room.length + padding * 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-[#121810] border border-[#3F5B63]/60 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#182216] px-5 py-4 border-b border-[#3F5B63]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E0A83C] to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-900/30">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  自動空間功能分類器 (Room Function Classifier)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-[#E0A83C] border border-amber-500/40">
                  幾何特徵工程 + 標準圖塊庫
                </span>
              </div>
              <p className="text-xs text-slate-400">
                依據長寬比例、開口位置、門窗尺寸、水電特徵自動判定空間，並自動套用 5 倍數標準工程圖塊
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#23301F] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Summary Card: Current Detection Result */}
          <div className="bg-[#182216] border border-[#3F5B63]/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#23301F] border border-amber-500/30 flex items-center justify-center shrink-0">
                {initialClassification.primaryFunction === 'bedroom' && <Bed className="w-7 h-7 text-amber-400" />}
                {initialClassification.primaryFunction === 'living_room' && <Sofa className="w-7 h-7 text-cyan-400" />}
                {initialClassification.primaryFunction === 'kitchen' && <UtensilsCrossed className="w-7 h-7 text-emerald-400" />}
                {initialClassification.primaryFunction === 'bathroom' && <Bath className="w-7 h-7 text-blue-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">當前空間檢測結果：</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300">
                    {room.roomName}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lg font-bold text-white">
                    {ROOM_FUNCTION_NAMES[initialClassification.primaryFunction]}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    置信度 {Math.round(initialClassification.confidence * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {initialClassification.explanation}
                </p>
              </div>
            </div>

            {/* Geometry Chips */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0 text-[11px] font-mono">
              <div className="bg-[#23301F] px-3 py-1.5 rounded-lg border border-[#3F5B63]/30 flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300">開間進深: {room.width} × {room.length} cm</span>
              </div>
              <div className="bg-[#23301F] px-3 py-1.5 rounded-lg border border-[#3F5B63]/30 flex items-center gap-2">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300">
                  實坪: {((room.width * room.length) / 10000 * 0.3025).toFixed(2)} 坪 ({((room.width * room.length) / 10000).toFixed(2)} m²)
                </span>
              </div>
              <div className="bg-[#23301F] px-3 py-1.5 rounded-lg border border-[#3F5B63]/30 flex items-center gap-2">
                <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">開口: {room.doors?.length || 0} 門 / {room.windows?.length || 0} 窗</span>
              </div>
            </div>
          </div>

          {/* 4 Classification Category Selection Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#E0A83C] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 空間類型判定與手動指定：
              </h3>
              <span className="text-[11px] text-slate-400">點選即可即時預覽對應標準圖塊</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. 客廳 */}
              <div
                onClick={() => setSelectedFunction('living_room')}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                  selectedFunction === 'living_room'
                    ? 'bg-[#23301F] border-cyan-400 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400'
                    : 'bg-[#182216] border-[#3F5B63]/30 hover:border-[#3F5B63]/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                      <Sofa className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      幾何匹配 {initialClassification.scores.living_room} 分
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">客廳 (公領域)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    沙發、大茶几、電視矮櫃、單人椅、大面採光開窗
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#3F5B63]/30 flex items-center justify-between text-[10px] text-slate-300">
                  <span>標準圖塊: 5 件</span>
                  {selectedFunction === 'living_room' && (
                    <span className="text-cyan-300 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 目前選中
                    </span>
                  )}
                </div>
              </div>

              {/* 2. 臥室 */}
              <div
                onClick={() => setSelectedFunction('bedroom')}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                  selectedFunction === 'bedroom'
                    ? 'bg-[#23301F] border-amber-400 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400'
                    : 'bg-[#182216] border-[#3F5B63]/30 hover:border-[#3F5B63]/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300">
                      <Bed className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono text-amber-400 font-bold">
                      幾何匹配 {initialClassification.scores.bedroom} 分
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">臥室 (起居睡眠)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    5×6.2尺雙人床組、雙床頭櫃、頂天衣櫃、床頭水電
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#3F5B63]/30 flex items-center justify-between text-[10px] text-slate-300">
                  <span>標準圖塊: 5 件</span>
                  {selectedFunction === 'bedroom' && (
                    <span className="text-amber-300 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 目前選中
                    </span>
                  )}
                </div>
              </div>

              {/* 3. 廚房 */}
              <div
                onClick={() => setSelectedFunction('kitchen')}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                  selectedFunction === 'kitchen'
                    ? 'bg-[#23301F] border-emerald-400 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400'
                    : 'bg-[#182216] border-[#3F5B63]/30 hover:border-[#3F5B63]/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                      <UtensilsCrossed className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      幾何匹配 {initialClassification.scores.kitchen} 分
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">廚房 (料理烹飪)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    一字型/L型流理台、IH感應爐、大單槽水槽、變頻冰箱
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#3F5B63]/30 flex items-center justify-between text-[10px] text-slate-300">
                  <span>標準圖塊: 5 件</span>
                  {selectedFunction === 'kitchen' && (
                    <span className="text-emerald-300 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 目前選中
                    </span>
                  )}
                </div>
              </div>

              {/* 4. 浴廁 */}
              <div
                onClick={() => setSelectedFunction('bathroom')}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                  selectedFunction === 'bathroom'
                    ? 'bg-[#23301F] border-blue-400 shadow-lg shadow-blue-950/40 ring-1 ring-blue-400'
                    : 'bg-[#182216] border-[#3F5B63]/30 hover:border-[#3F5B63]/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300">
                      <Bath className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono text-blue-400 font-bold">
                      幾何匹配 {initialClassification.scores.bathroom} 分
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">浴廁 (盥洗衛浴)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    單體省水馬桶、洗手台浴櫃、乾濕分離淋浴門、防臭地排
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#3F5B63]/30 flex items-center justify-between text-[10px] text-slate-300">
                  <span>標準圖塊: 4 件</span>
                  {selectedFunction === 'bathroom' && (
                    <span className="text-blue-300 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 目前選中
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: SVG Layout Preview + Evidence Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SVG Layout Preview */}
            <div className="lg:col-span-7 bg-[#182216] border border-[#3F5B63]/40 rounded-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                  標準圖塊即時放樣視圖 (符合 5 倍數工程模數)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {ROOM_FUNCTION_NAMES[selectedFunction]}
                </span>
              </div>

              {/* 2D Canvas SVG Representation */}
              <div className="flex-1 w-full bg-[#0d130c] border border-[#3F5B63]/20 rounded-lg p-2 flex items-center justify-center min-h-[300px] overflow-hidden">
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="w-full h-auto max-h-[340px] drop-shadow-md select-none"
                >
                  <defs>
                    <pattern id="grid5x" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#23301F" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  {/* Room Boundary Rect */}
                  <rect
                    x={padding}
                    y={padding}
                    width={room.width}
                    height={room.length}
                    fill="url(#grid5x)"
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />

                  {/* Walls with thickness fill */}
                  <rect
                    x={padding}
                    y={padding}
                    width={room.width}
                    height={room.length}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="10"
                    opacity="0.4"
                  />

                  {/* Existing Doors */}
                  {room.doors?.map((door, idx) => {
                    let dx = padding;
                    let dy = padding;
                    let dw = door.width;
                    let dh = 6;
                    if (door.wall === 'bottom') {
                      dx = padding + door.offset;
                      dy = padding + room.length - 3;
                      dw = door.width;
                    } else if (door.wall === 'top') {
                      dx = padding + door.offset;
                      dy = padding - 3;
                      dw = door.width;
                    } else if (door.wall === 'left') {
                      dx = padding - 3;
                      dy = padding + door.offset;
                      dw = 6;
                      dh = door.width;
                    } else if (door.wall === 'right') {
                      dx = padding + room.width - 3;
                      dy = padding + door.offset;
                      dw = 6;
                      dh = door.width;
                    }
                    return (
                      <g key={idx}>
                        <rect x={dx} y={dy} width={dw} height={dh} fill="#10b981" />
                        <text
                          x={dx + dw / 2}
                          y={dy + 12}
                          fill="#34d399"
                          fontSize="9"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          門 {door.width}cm
                        </text>
                      </g>
                    );
                  })}

                  {/* Existing Windows */}
                  {room.windows?.map((win, idx) => {
                    let wx = padding + win.offset;
                    let wy = padding - 4;
                    let ww = win.width;
                    let wh = 8;
                    if (win.wall === 'bottom') {
                      wy = padding + room.length - 4;
                    }
                    return (
                      <g key={idx}>
                        <rect x={wx} y={wy} width={ww} height={wh} fill="#38bdf8" />
                        <text
                          x={wx + ww / 2}
                          y={wy - 4}
                          fill="#38bdf8"
                          fontSize="9"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          窗 {win.width}cm
                        </text>
                      </g>
                    );
                  })}

                  {/* Placed Standard Blocks */}
                  {previewBlocks.placedBlocks.map((blk, idx) => {
                    const bx = padding + blk.x;
                    const by = padding + blk.y;
                    const bw = blk.widthCm;
                    const bh = blk.depthCm;
                    return (
                      <g key={blk.id} className="transition-all">
                        {/* Block body */}
                        <rect
                          x={bx}
                          y={by}
                          width={bw}
                          height={bh}
                          fill="#E0A83C"
                          fillOpacity="0.22"
                          stroke="#E0A83C"
                          strokeWidth="2"
                          strokeDasharray={blk.subCategory.includes('固定') ? 'none' : '4,2'}
                          rx="3"
                        />
                        {/* Diagonal cross for furniture */}
                        <line x1={bx} y1={by} x2={bx + bw} y2={by + bh} stroke="#E0A83C" strokeWidth="0.8" opacity="0.4" />
                        <line x1={bx + bw} y1={by} x2={bx} y2={by + bh} stroke="#E0A83C" strokeWidth="0.8" opacity="0.4" />

                        {/* Label */}
                        <text
                          x={bx + bw / 2}
                          y={by + bh / 2 - 2}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                        >
                          {blk.name.split(' ')[0]}
                        </text>
                        <text
                          x={bx + bw / 2}
                          y={by + bh / 2 + 10}
                          fill="#FAD175"
                          fontSize="8"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {bw}×{bh}
                        </text>
                      </g>
                    );
                  })}

                  {/* Water / Socket Points */}
                  {previewBlocks.recommendedMep.map((mep, idx) => (
                    <g key={mep.id}>
                      <circle
                        cx={padding + mep.x}
                        cy={padding + mep.y}
                        r="5"
                        fill={mep.type === 'water_supply' ? '#38bdf8' : '#f59e0b'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#3F5B63]/20 text-[10px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-400 inline-block" />
                    標準配置圖塊 (5x網格)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> 門洞
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block" /> 採光窗
                  </span>
                </div>
                <span className="text-emerald-400 font-mono">100% 契約模矩保真</span>
              </div>
            </div>

            {/* Right: Detailed Evidence & Proposed Blocks List */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              {/* Evidence Panel */}
              <div className="bg-[#182216] border border-[#3F5B63]/40 rounded-xl p-4">
                <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  幾何特徵決策依據 (Geometric Decision Rules)：
                </h4>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {initialClassification.evidences.map((evi, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#23301F]/80 border border-[#3F5B63]/30 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{evi.feature}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          實測: <span className="font-mono text-cyan-300">{evi.observedValue}</span> · {evi.indication}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0 ml-2">
                        +{evi.scoreContribution}分
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposed Blocks List */}
              <div className="bg-[#182216] border border-[#3F5B63]/40 rounded-xl p-4 flex-1">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    即將套用之標準圖塊清單 ({previewBlocks.placedBlocks.length} 項)：
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">AutoCAD 05_木作櫃體</span>
                </h4>

                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                  {previewBlocks.placedBlocks.map((blk) => (
                    <div
                      key={blk.id}
                      className="px-2.5 py-1.5 rounded-lg bg-[#121810] border border-[#3F5B63]/30 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-200 font-medium">{blk.name}</span>
                      <span className="text-[11px] font-mono text-amber-300">
                        {blk.widthCm}×{blk.depthCm} cm (FL+{blk.elevationCm || 0})
                      </span>
                    </div>
                  ))}
                </div>

                {/* Additional Settings Toggles */}
                <div className="mt-3 pt-3 border-t border-[#3F5B63]/30 space-y-1.5 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceExistingBlocks}
                      onChange={(e) => setReplaceExistingBlocks(e.target.checked)}
                      className="rounded border-[#3F5B63] text-amber-500 focus:ring-0 bg-[#121810]"
                    />
                    <span>清除當前已置放之圖塊，以標準圖塊全新覆蓋</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appendMepPoints}
                      onChange={(e) => setAppendMepPoints(e.target.checked)}
                      className="rounded border-[#3F5B63] text-amber-500 focus:ring-0 bg-[#121810]"
                    />
                    <span>自動同步配置水電專用迴路與專用插座/給排水點位</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={updateRoomName}
                      onChange={(e) => setUpdateRoomName(e.target.checked)}
                      className="rounded border-[#3F5B63] text-amber-500 focus:ring-0 bg-[#121810]"
                    />
                    <span>同步更新房間名稱為「{ROOM_FUNCTION_NAMES[selectedFunction].split(' ')[0]}」</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#182216] px-5 py-3.5 border-t border-[#3F5B63]/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchClassifyAll}
              className="px-3.5 py-2 rounded-xl bg-[#23301F] hover:bg-[#3F5B63]/60 text-amber-300 hover:text-amber-200 text-xs font-bold border border-amber-500/40 transition active:scale-95 flex items-center gap-1.5"
              title="一鍵對整份案場所有房間進行幾何特徵分類並套用對應標準圖塊"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>全案場批次自動分類</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApply('2d_staking')}
              className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Ruler className="w-3.5 h-3.5 text-cyan-400" />
              <span>套用並進入 2D 放樣</span>
            </button>

            <button
              onClick={() => handleApply('3d_simulation')}
              className="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Box className="w-3.5 h-3.5 text-indigo-400" />
              <span>套用並進入 3D 渲染</span>
            </button>

            <button
              onClick={() => handleApply()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-900/30 transition active:scale-95"
            >
              <Check className="w-4 h-4 text-slate-950" />
              <span>一鍵套用標準配置圖塊</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
