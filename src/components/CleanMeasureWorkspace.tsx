import React, { useState } from 'react';
import { RoomData, Door, WindowOpening, Beam, Column, WallConfigs } from '../types';
import {
  Ruler,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Maximize2,
  Box,
  Compass,
  Check,
  Flame,
  Droplets,
  Wind,
  Layers,
  ArrowRight,
  Info,
  CornerDownRight,
  Eye,
  Building,
  Upload,
  Shield,
  HelpCircle,
  Mic,
  DoorClosed,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import {
  getWallThickness,
  isExteriorWall,
  updateWallConfig,
  getWallCornerDescriptions,
  calculateOpeningDualOffsets,
  getColumnCoordinates,
  WallDirection
} from '../utils/wallUtils';
import { InteractiveRoomCornerMap } from './InteractiveRoomCornerMap';
import { VoiceQuickMeasureBar } from './VoiceQuickMeasureBar';
import { PerimeterSurveyGuide } from './PerimeterSurveyGuide';

interface CleanMeasureWorkspaceProps {
  rooms: RoomData[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onUpdateRoom: (room: RoomData) => void;
  onAddNewRoom: () => void;
  onProceedToStitch: () => void;
  onNotify: (msg: string) => void;
  onOpenPdfImport?: () => void;
}

export const CleanMeasureWorkspace: React.FC<CleanMeasureWorkspaceProps> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onUpdateRoom,
  onAddNewRoom,
  onProceedToStitch,
  onNotify,
  onOpenPdfImport,
}) => {
  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // 頁籤導航：預設開啟「⚡ 快速丈量 (語音長寬 · 點擊放柱 · 常用門窗)」
  // 徹底解決客人反應「一打開介面太亂不知道從哪開始」的問題！
  const [activeTab, setActiveTab] = useState<'quick' | 'walls' | 'elevations' | 'cutouts'>('quick');

  if (!currentRoom) return null;

  // 1. 牆面尺寸快速調整
  const handleUpdateDimensions = (w: number, l: number, h?: number) => {
    onUpdateRoom({
      ...currentRoom,
      width: Math.max(30, Number(w) || currentRoom.width),
      length: Math.max(30, Number(l) || currentRoom.length),
      height: h !== undefined ? Math.max(100, Number(h) || currentRoom.height) : currentRoom.height,
    });
  };

  // 2. 切換各牆體外牆/內牆屬性 (外牆 15cm，內隔間 10cm，紅磚 12cm)
  const handleToggleWallType = (
    wallDir: 'north' | 'south' | 'east' | 'west',
    type: 'interior' | 'exterior' | 'brick',
    customThickness?: number
  ) => {
    const thickness = customThickness || (type === 'exterior' ? 15 : type === 'brick' ? 12 : 10);
    const updated = updateWallConfig(currentRoom, wallDir, type, thickness);
    onUpdateRoom(updated);
    const wallLabel =
      wallDir === 'north' ? '北牆 (上)' : wallDir === 'south' ? '南牆 (下)' : wallDir === 'east' ? '東牆 (右)' : '西牆 (左)';
    const typeLabel = type === 'exterior' ? '外牆 (15cm)' : type === 'brick' ? '紅磚牆 (12cm)' : '內牆 (10cm)';
    onNotify(`✓ 已將「${wallLabel}」設定為 ${typeLabel}`);
  };

  // 3. 新增柱體
  const handleAddColumn = (
    positionType: 'corner' | 'wall' | 'free' = 'corner',
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-left',
    width = 50,
    depth = 50
  ) => {
    const cols = currentRoom.columns || [];
    const nextIdx = cols.length + 1;
    const cornerName =
      corner === 'top-left'
        ? '左上角 (西北)'
        : corner === 'top-right'
        ? '右上角 (東北)'
        : corner === 'bottom-left'
        ? '左下角 (西南)'
        : '右下角 (東南)';
    const newCol: Column = {
      id: `col_${Date.now()}`,
      name: positionType === 'corner' ? `C${nextIdx} ${cornerName}柱` : `C${nextIdx} 結構柱`,
      width,
      depth,
      positionType,
      corner,
      wall: 'north',
      offset: 0,
      x: corner.endsWith('left') ? 0 : Math.max(0, currentRoom.width - width),
      y: corner.startsWith('top') ? 0 : Math.max(0, currentRoom.length - depth),
    };
    onUpdateRoom({
      ...currentRoom,
      columns: [...cols, newCol],
    });
    onNotify(`✓ 已新增「${newCol.name}」(${width}×${depth}cm)！`);
  };

  // 刪除柱體
  const handleDeleteColumn = (colId: string) => {
    const cols = (currentRoom.columns || []).filter((c) => c.id !== colId);
    onUpdateRoom({
      ...currentRoom,
      columns: cols,
    });
    onNotify('✓ 已移除柱體');
  };

  // 4. 新增門洞
  const handleAddDoor = (
    wallDir: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
    doorType: 'balcony' | 'entryway' | 'kitchen_fire' | 'room' | 'bathroom' = 'room'
  ) => {
    let width = 90;
    let height = 210;
    let name = '房間門';

    switch (doorType) {
      case 'balcony':
        width = 80;
        name = '陽台門';
        break;
      case 'entryway':
        width = 120;
        height = 225;
        name = '玄關大門';
        break;
      case 'kitchen_fire':
        width = 80;
        height = 210;
        name = '廚房防火門';
        break;
      case 'bathroom':
        width = 80;
        height = 210;
        name = '衛浴門';
        break;
      default:
        width = 90;
        height = 210;
        name = '房間門';
        break;
    }

    const newDoor: Door = {
      id: `door_${Date.now()}`,
      type: doorType,
      name: `${name} ${(currentRoom.doors || []).length + 1}`,
      width,
      height,
      wall: wallDir,
      offset: 30,
      offsetReference: 'left',
      anchorTag: String.fromCharCode(65 + ((currentRoom.doors || []).length % 26)),
    };
    onUpdateRoom({
      ...currentRoom,
      doors: [...(currentRoom.doors || []), newDoor],
    });
    onNotify(`✓ 已新增「${name}」(${width}×${height}cm)！`);
  };

  // 5. 新增窗戶
  const handleAddWindow = (wallDir: 'top' | 'bottom' | 'left' | 'right' = 'top') => {
    const newWin: WindowOpening = {
      id: `win_${Date.now()}`,
      name: `採光窗 ${(currentRoom.windows || []).length + 1}`,
      width: 160,
      height: 140,
      sillHeight: 45,
      wall: wallDir,
      offset: 40,
      offsetReference: 'left',
    };
    onUpdateRoom({
      ...currentRoom,
      windows: [...(currentRoom.windows || []), newWin],
    });
    onNotify('✓ 已新增採光窗 (160×140cm，台度 45cm)！');
  };

  // 6. 新增凹凸缺角
  const handleAddCutout = () => {
    const cutouts = currentRoom.recessedCutouts || [];
    const newCutout = {
      id: `cut_${Date.now()}`,
      name: `穿插客用衛浴/畸角扣除 ${cutouts.length + 1}`,
      wall: 'right' as const,
      offset: 50,
      width: 160,
      depth: 120,
      targetRoomName: '客用衛浴',
    };
    onUpdateRoom({
      ...currentRoom,
      recessedCutouts: [...cutouts, newCutout],
    });
    onNotify('✓ 已新增空間凹凸扣除缺角！可模擬主臥與客衛穿插內縮結構。');
  };

  // 地坪坪數與平方公尺
  const floorAreaM2 = ((currentRoom.width * currentRoom.length) / 10000).toFixed(2);
  const floorAreaPing = (((currentRoom.width * currentRoom.length) / 10000) * 0.3025).toFixed(2);

  return (
    <div className="survey-app survey-light-surface flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      {/* ⬅️ 左側：空間清單與導航 (乾淨俐落) */}
      <aside className="survey-sidebar flex w-full min-w-0 shrink-0 flex-col border-r md:w-80">
        {/* 頂部操作列 */}
        <div className="p-3.5 border-b border-[#3F5B63]/30 bg-[#0d140e] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              待丈量空間清單 ({rooms.length})
            </span>
            <button
              onClick={onAddNewRoom}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-xs font-bold border border-amber-500/40 flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增空間</span>
            </button>
          </div>

          {/* 📄 建商圖面 / PDF 匯入快捷入口 */}
          {onOpenPdfImport && (
            <button
              onClick={onOpenPdfImport}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-950/80 to-[#102018] hover:from-cyan-900/90 hover:to-[#162e22] border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center justify-between shadow transition active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>匯入建商圖/PDF/圖片</span>
              </div>
              <span className="text-[10px] bg-cyan-900/60 px-1.5 py-0.5 rounded text-cyan-300 border border-cyan-700">
                自動切割
              </span>
            </button>
          )}
        </div>

        {/* 房間列表 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-[#3F5B63]/10">
          {rooms.map((r, idx) => {
            const isSelected = r.id === currentRoom.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRoom(r.id)}
                className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border border-amber-400 text-amber-300 shadow-md'
                    : 'bg-[#182216]/60 border border-transparent text-neutral-300 hover:bg-[#1A2417]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                        isSelected ? 'bg-amber-500 text-black' : 'bg-[#121810] text-neutral-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-[#F8F8F6]">{r.roomName}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 pl-7 font-mono">
                    長 {r.length} × 寬 {r.width} cm (高 {r.height}cm)
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono">
                  <div className="text-amber-400 font-bold">
                    {(((r.width * r.length) / 10000) * 0.3025).toFixed(1)} 坪
                  </div>
                  <div className="text-neutral-500">
                    {((r.width * r.length) / 10000).toFixed(1)} m²
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 下一步：引導至階段二 */}
        <div className="p-3.5 border-t border-[#3F5B63]/40 bg-[#0d140e]">
          <button
            onClick={onProceedToStitch}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition active:scale-95 cursor-pointer"
          >
            <span>完成本階段，進入階段二 (空間拼湊放樣)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ➡️ 右側核心主工作區：結構化、無負擔的純淨丈量空間 */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4">
        {/* 🌟 1. 當前空間標題卡片與頁籤導航列 (明確直觀，不雜亂) */}
        <div className="bg-[#121810] border border-[#3F5B63]/50 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3F5B63]/30 pb-3">
            <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <input
                type="text"
                value={currentRoom.roomName}
                onChange={(e) => onUpdateRoom({ ...currentRoom, roomName: e.target.value })}
                className="min-w-0 max-w-full bg-transparent border-b border-transparent hover:border-emerald-500/50 focus:border-emerald-400 text-lg font-bold survey-text focus:outline-none px-1"
                placeholder="空間名稱，如：主臥房"
              />
              <span className="text-xs text-neutral-400 font-mono">
                (實測坪數：<strong className="text-amber-400">{floorAreaPing} 坪</strong> / {floorAreaM2} m²)
              </span>
            </div>

            <div className="text-[11px] text-neutral-400">所有尺寸都可直接點數字修改</div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="field-dimensions-first-screen">
            {[
              { label: '總長', value: currentRoom.length, update: (value: number) => handleUpdateDimensions(currentRoom.width, value) },
              { label: '總寬', value: currentRoom.width, update: (value: number) => handleUpdateDimensions(value, currentRoom.length) },
              { label: '淨高', value: currentRoom.height, update: (value: number) => handleUpdateDimensions(currentRoom.width, currentRoom.length, value) },
              { label: '牆厚', value: currentRoom.wallThickness || 10, update: (value: number) => onUpdateRoom({ ...currentRoom, wallThickness: Math.max(1, Number(value) || 10), lastUpdated: new Date().toISOString() }) },
            ].map((field) => (
              <label key={field.label} className="rounded-xl border border-[#3F5B63]/60 bg-[#0d140e] px-3 py-2">
                <span className="block text-[10px] font-bold text-neutral-400">{field.label}</span>
                <span className="flex items-center gap-1">
                  <input
                    aria-label={`${field.label}（公分）`}
                    type="number"
                    inputMode="decimal"
                    value={field.value}
                    onChange={(event) => field.update(Number(event.target.value))}
                    className="min-w-0 w-full bg-transparent text-lg font-black text-amber-200 outline-none"
                  />
                  <span className="text-[10px] text-neutral-500">cm</span>
                </span>
              </label>
            ))}
          </div>

          {/* 🌟 頂部頁籤切換：將雜亂的多個面板分流，預設開啟【⚡ 極簡快速丈量】 */}
          <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 xl:grid-cols-4">
            <button
              onClick={() => setActiveTab('quick')}
              className={`min-w-0 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/50'
                  : 'bg-[#182216] text-neutral-300 hover:text-white hover:bg-[#202c1e] border border-[#3F5B63]/40'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="truncate">快速丈量</span>
            </button>

            <button
              onClick={() => setActiveTab('walls')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'walls'
                  ? 'bg-sky-500 text-black font-bold shadow-md'
                  : 'bg-[#182216] text-neutral-300 hover:text-white hover:bg-[#202c1e] border border-[#3F5B63]/40'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="truncate">牆體與梁位 ({currentRoom.beams?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('elevations')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'elevations'
                  ? 'bg-amber-500 text-black font-bold shadow-md'
                  : 'bg-[#182216] text-neutral-300 hover:text-white hover:bg-[#202c1e] border border-[#3F5B63]/40'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="truncate">垂直標高</span>
            </button>

            <button
              onClick={() => setActiveTab('cutouts')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'cutouts'
                  ? 'bg-rose-500 text-white font-bold shadow-md'
                  : 'bg-[#182216] text-neutral-300 hover:text-white hover:bg-[#202c1e] border border-[#3F5B63]/40'
              }`}
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span className="truncate">凹凸缺角 ({currentRoom.recessedCutouts?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 頁籤 A：⚡ 極簡快速丈量 (完全響應客訴：一打開直接給空間，用嘴巴報總長總寬，點擊放柱) */}
        {/* ========================================================================= */}
        {activeTab === 'quick' && (
          <div className="space-y-4 animate-fadeIn">
            <PerimeterSurveyGuide
              room={currentRoom}
              onUpdateRoom={onUpdateRoom}
              onNotify={onNotify}
            />
            {/* 1. 🎙️ 語音極速丈量列 (支援口述總長總寬、米數自動換算、語音插柱) */}
            <VoiceQuickMeasureBar
              room={currentRoom}
              onUpdateRoom={onUpdateRoom}
              onNotify={onNotify}
            />

            {/* 2. 總長、總寬、RC挑高大字體調整卡片 (極度清晰直覺) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 總長 (進深 Y) */}
              <div className="bg-[#121810] border border-sky-500/40 rounded-2xl p-4 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-300 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-sky-400" />
                    空間總長 (進深 Y)
                  </span>
                  <span className="text-[10px] text-neutral-400">前後垂直向</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateDimensions(currentRoom.width, currentRoom.length - 10)}
                    className="w-8 h-8 rounded-lg bg-[#182216] hover:bg-sky-500/20 text-neutral-300 hover:text-sky-300 font-bold text-sm border border-[#3F5B63] transition"
                  >
                    -10
                  </button>
                  <div className="flex-1 flex items-center bg-[#0d140e] border border-sky-500/50 rounded-xl px-3 py-2">
                    <input
                      type="number"
                      value={currentRoom.length}
                      onChange={(e) => handleUpdateDimensions(currentRoom.width, Number(e.target.value))}
                      className="w-full bg-transparent text-xl font-bold font-mono text-sky-200 text-center outline-none"
                    />
                    <span className="text-xs text-neutral-400 font-mono">cm</span>
                  </div>
                  <button
                    onClick={() => handleUpdateDimensions(currentRoom.width, currentRoom.length + 10)}
                    className="w-8 h-8 rounded-lg bg-[#182216] hover:bg-sky-500/20 text-neutral-300 hover:text-sky-300 font-bold text-sm border border-[#3F5B63] transition"
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* 總寬 (面寬 X) */}
              <div className="bg-[#121810] border border-sky-500/40 rounded-2xl p-4 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-300 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-sky-400" />
                    空間總寬 (面寬 X)
                  </span>
                  <span className="text-[10px] text-neutral-400">左右橫向</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateDimensions(currentRoom.width - 10, currentRoom.length)}
                    className="w-8 h-8 rounded-lg bg-[#182216] hover:bg-sky-500/20 text-neutral-300 hover:text-sky-300 font-bold text-sm border border-[#3F5B63] transition"
                  >
                    -10
                  </button>
                  <div className="flex-1 flex items-center bg-[#0d140e] border border-sky-500/50 rounded-xl px-3 py-2">
                    <input
                      type="number"
                      value={currentRoom.width}
                      onChange={(e) => handleUpdateDimensions(Number(e.target.value), currentRoom.length)}
                      className="w-full bg-transparent text-xl font-bold font-mono text-sky-200 text-center outline-none"
                    />
                    <span className="text-xs text-neutral-400 font-mono">cm</span>
                  </div>
                  <button
                    onClick={() => handleUpdateDimensions(currentRoom.width + 10, currentRoom.length)}
                    className="w-8 h-8 rounded-lg bg-[#182216] hover:bg-sky-500/20 text-neutral-300 hover:text-sky-300 font-bold text-sm border border-[#3F5B63] transition"
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* RC 結構原淨高 */}
              <div className="bg-[#121810] border border-emerald-500/40 rounded-2xl p-4 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    RC 結構樓板原淨高
                  </span>
                  <span className="text-[10px] text-neutral-400">完成地坪至頂</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateDimensions(currentRoom.width, currentRoom.length, currentRoom.height - 5)}
                    className="w-8 h-8 rounded-lg bg-[#182216] hover:bg-emerald-500/20 text-neutral-300 hover:text-emerald-300 font-bold text-sm border border-[#3F5B63] transition"
                  >
                    -5
                  </button>
                  <div className="flex-1 flex items-center bg-[#0d140e] border border-emerald-500/50 rounded-xl px-3 py-2">
                    <input
                      type="number"
                      value={currentRoom.height}
                      onChange={(e) => handleUpdateDimensions(currentRoom.width, currentRoom.length, Number(e.target.value))}
                      className="w-full bg-transparent text-xl font-bold font-mono text-emerald-200 text-center outline-none"
                    />
                    <span className="text-xs text-neutral-400 font-mono">cm</span>
                  </div>
                  <button
                    onClick={() => handleUpdateDimensions(currentRoom.width, currentRoom.length, currentRoom.height + 5)}
                    className="w-8 h-8 rounded-lg bg-[#182216] hover:bg-emerald-500/20 text-neutral-300 hover:text-emerald-300 font-bold text-sm border border-[#3F5B63] transition"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>

            {/* 3. 🌟 直觀可視化：點擊房間四角插入柱子 (徹底解決不知道在哪裡插入柱子的痛點！) */}
            <InteractiveRoomCornerMap
              room={currentRoom}
              onUpdateRoom={onUpdateRoom}
              onNotify={onNotify}
            />

            {/* 4. 常用門窗快速新增卡片 */}
            <div className="bg-[#121810] border border-cyan-500/40 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
                <div>
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <DoorClosed className="w-4 h-4 text-cyan-400" />
                    常用門洞與窗戶一鍵新增 (目前門 {currentRoom.doors?.length || 0} 樘 · 窗 {currentRoom.windows?.length || 0} 樘)
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    點擊常用標準規格即可快速放置，系統統一以面向該牆「離左側牆角」起算並自動折算雙向邊距！
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">快捷放門：</span>
                <button
                  onClick={() => handleAddDoor('bottom', 'room')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-800 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  + 房間門 (90×210)
                </button>
                <button
                  onClick={() => handleAddDoor('bottom', 'entryway')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-800 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  + 玄關大門 (120×225)
                </button>
                <button
                  onClick={() => handleAddDoor('bottom', 'balcony')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-800 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  + 陽台門 (80×210)
                </button>
                <button
                  onClick={() => handleAddDoor('bottom', 'bathroom')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-800 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  + 衛浴門 (80×210)
                </button>
                <button
                  onClick={() => handleAddDoor('bottom', 'kitchen_fire')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-800 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  + 廚房防火門 (80×210)
                </button>

                <div className="h-4 w-[1px] bg-[#3F5B63] mx-1"></div>

                <span className="text-xs text-neutral-400 font-medium">快捷放窗：</span>
                <button
                  onClick={() => handleAddWindow('top')}
                  className="px-3 py-1.5 rounded-xl bg-sky-950/60 hover:bg-sky-800 text-sky-200 hover:text-white border border-sky-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  + 景觀採光窗 (160×140)
                </button>
              </div>

              {/* 門窗清單與簡易列表 */}
              {((currentRoom.doors && currentRoom.doors.length > 0) || (currentRoom.windows && currentRoom.windows.length > 0)) && (
                <div className="pt-2 border-t border-[#3F5B63]/20 flex flex-wrap gap-2 text-xs">
                  {(currentRoom.doors || []).map((d) => (
                    <div
                      key={d.id}
                      className="px-2.5 py-1 bg-[#0d140e] border border-cyan-500/30 rounded-lg flex items-center gap-2 text-cyan-200 font-mono"
                    >
                      <span>🚪 {d.name} ({d.width}cm)</span>
                      <button
                        onClick={() => {
                          const updated = (currentRoom.doors || []).filter((item) => item.id !== d.id);
                          onUpdateRoom({ ...currentRoom, doors: updated });
                        }}
                        className="text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(currentRoom.windows || []).map((w) => (
                    <div
                      key={w.id}
                      className="px-2.5 py-1 bg-[#0d140e] border border-sky-500/30 rounded-lg flex items-center gap-2 text-sky-200 font-mono"
                    >
                      <span>🪟 {w.name} ({w.width}cm)</span>
                      <button
                        onClick={() => {
                          const updated = (currentRoom.windows || []).filter((item) => item.id !== w.id);
                          onUpdateRoom({ ...currentRoom, windows: updated });
                        }}
                        className="text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 底部醒目完成導引按鈕 */}
            <div className="p-4 bg-gradient-to-r from-cyan-950/60 via-[#102018] to-cyan-950/60 border border-cyan-500/40 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl">
              <div>
                <div className="text-sm font-bold text-white">丈量完成！準備進行多空間咬合？</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  空間長寬、柱位與門窗已記錄完成，點擊右側按鈕即可進入階段二進行全案共壁咬合與放樣。
                </div>
              </div>
              <button
                onClick={onProceedToStitch}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition active:scale-95 cursor-pointer"
              >
                <span>進入階段二：空間拼湊放樣</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 頁籤 B：📐 牆體詳情與突出梁位 (四面牆體厚度切換、突出梁位自訂)             */}
        {/* ========================================================================= */}
        {activeTab === 'walls' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#121810] border border-[#3F5B63]/50 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#3F5B63]/30 pb-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Ruler className="w-4 h-4" />
                  四面牆體淨空實測與外牆(15cm)/內牆(10cm)獨立厚度調整
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'north', name: '上方牆 (北)', label: '面寬', dimension: currentRoom.width },
                  { id: 'south', name: '下方牆 (南)', label: '面寬', dimension: currentRoom.width },
                  { id: 'east', name: '右側牆 (東)', label: '進深', dimension: currentRoom.length },
                  { id: 'west', name: '左側牆 (西)', label: '進深', dimension: currentRoom.length },
                ].map((wall) => {
                  const wallIsExt =
                    currentRoom.wallConfigs?.[wall.id as keyof WallConfigs]?.type === 'exterior';

                  return (
                    <div
                      key={wall.id}
                      className={`p-3 rounded-xl border transition ${
                        wallIsExt
                          ? 'bg-[#18241b] border-amber-500/60 shadow-md'
                          : 'bg-[#182216] border-sky-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-sky-300">{wall.name}</span>
                        <span className="text-[10px] text-neutral-400">{wall.label}</span>
                      </div>

                      {/* 梁體管理 (新增 Beam 功能) */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <button
                          onClick={() => {
                            const extension = prompt('請輸入梁突出牆面距離 (cm):', '50');
                            if (extension) {
                              const newBeam: Beam = {
                                id: Date.now().toString(),
                                wallId: wall.id,
                                name: `梁_${wall.name}`,
                                width: 50,
                                depth: 50,
                                extension: Number(extension),
                                clearHeight: 265,
                                orientation: 'horizontal',
                                y: 0,
                              };
                              onUpdateRoom({ ...currentRoom, beams: [...(currentRoom.beams || []), newBeam] });
                            }
                          }}
                          className="text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded cursor-pointer hover:bg-rose-500/20"
                        >
                          + 加梁
                        </button>
                        <span className="text-[10px] text-neutral-500">
                          {(currentRoom.beams || []).filter((b) => b.wallId === wall.id).length} 支梁
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-2">
                        <input
                          type="number"
                          value={wall.dimension}
                          onChange={(e) =>
                            wall.label === '面寬'
                              ? handleUpdateDimensions(Number(e.target.value), currentRoom.length)
                              : handleUpdateDimensions(currentRoom.width, Number(e.target.value))
                          }
                          className="w-full bg-[#0d140e] border border-sky-500/40 rounded-lg p-2 text-center text-base font-mono font-bold text-sky-200 focus:border-sky-400 outline-none"
                        />
                        <span className="text-xs text-neutral-400 font-mono">cm</span>
                      </div>

                      {/* 內外牆快速切換 */}
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => handleToggleWallType(wall.id as any, 'interior', 10)}
                          className={`text-[9px] px-1.5 py-0.5 rounded border ${
                            !wallIsExt
                              ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
                              : 'bg-[#0d140e] border-[#3F5B63] text-neutral-400'
                          }`}
                        >
                          內牆(10)
                        </button>
                        <button
                          onClick={() => handleToggleWallType(wall.id as any, 'exterior', 15)}
                          className={`text-[9px] px-1.5 py-0.5 rounded border ${
                            wallIsExt
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                              : 'bg-[#0d140e] border-[#3F5B63] text-neutral-400'
                          }`}
                        >
                          外牆(15)
                        </button>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1 font-mono">
                        厚度: {getWallThickness(currentRoom, wall.id as any)}cm
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 頁籤 C：🏢 現場垂直標高 (RC樓板原淨高、消防灑水、冷氣排水、冷媒孔洞)        */}
        {/* ========================================================================= */}
        {activeTab === 'elevations' && (
          <div className="space-y-4 animate-fadeIn">
            {/* 全局專案標高設定 */}
            <div className="bg-[#181f16] border border-emerald-500/30 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Sliders className="w-5 h-5" /> 專案全局垂直實測標高基準 (全案公用)
                </span>
                <span className="text-xs text-neutral-400">
                  丈量時記錄結構與管線真實離地高度，木作天花板高度交由後續設計決定
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {[
                  { label: 'RC樓板原淨高', value: 290, key: 'globalRcSlabHeight' },
                  { label: '消防灑水下緣', value: 255, key: 'globalSprinklerHeight' },
                  { label: '冷氣排水下緣', value: 210, key: 'globalAcDrainHeight' },
                  { label: '冷媒孔洞下緣', value: 240, key: 'globalRefrigerantHoleHeight' },
                ].map((item) => (
                  <div key={item.key} className="bg-[#0d140e] p-3 rounded-xl border border-emerald-500/20">
                    <label className="text-[11px] text-emerald-300 block mb-1 font-bold">{item.label}</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        defaultValue={item.value}
                        className="w-full bg-transparent text-white font-mono font-bold text-sm outline-none"
                      />
                      <span className="text-[10px] text-neutral-500">cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 本空間垂直實測細項 */}
            <div className="bg-[#121810] border border-[#3F5B63]/40 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                「{currentRoom.roomName}」空間專屬實測高度
              </span>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. RC樓板淨高 */}
                <div className="bg-[#161f14] p-3 rounded-xl border border-emerald-500/40">
                  <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                    1. RC樓板原淨高
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={currentRoom.height}
                      onChange={(e) => onUpdateRoom({ ...currentRoom, height: Number(e.target.value) || 280 })}
                      className="w-full bg-[#0d140e] border border-emerald-500/30 rounded px-2 py-1 text-center font-mono font-bold text-white text-xs outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 font-mono">cm</span>
                  </div>
                </div>

                {/* 2. 結構大梁底淨高 */}
                <div className="bg-[#161f14] p-3 rounded-xl border border-rose-500/40">
                  <label className="text-[11px] font-bold text-rose-300 block mb-1">
                    2. 結構大梁底淨高 (自動計算)
                  </label>
                  <div className="flex items-center gap-1">
                    {currentRoom.beams && currentRoom.beams.length > 0 ? (
                      <div className="w-full bg-[#0d140e] border border-rose-500/30 rounded px-2 py-1 text-center font-mono font-bold text-white text-xs">
                        {Math.min(...currentRoom.beams.map((b) => b.clearHeight))} cm
                      </div>
                    ) : (
                      <div className="w-full bg-[#0d140e] border border-rose-500/30 rounded px-2 py-1 text-center font-mono font-bold text-neutral-500 text-[10px]">
                        尚未建立梁體
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. 消防灑水頭 */}
                <div className="bg-[#161f14] p-3 rounded-xl border border-amber-500/40">
                  <label className="text-[11px] font-bold text-amber-300 block mb-1 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    3. 消防灑水頭高度
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={currentRoom.sprinklerHeight || 255}
                      onChange={(e) =>
                        onUpdateRoom({ ...currentRoom, sprinklerHeight: Number(e.target.value) || 255 })
                      }
                      className="w-full bg-[#0d140e] border border-amber-500/30 rounded px-2 py-1 text-center font-mono font-bold text-amber-300 text-xs outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 font-mono">cm</span>
                  </div>
                </div>

                {/* 4. 冷氣排水孔 */}
                <div className="bg-[#161f14] p-3 rounded-xl border border-sky-500/40">
                  <label className="text-[11px] font-bold text-sky-300 block mb-1 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-sky-400" />
                    4. 冷氣排水管高度
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={currentRoom.acDrainHeight || 210}
                      onChange={(e) =>
                        onUpdateRoom({ ...currentRoom, acDrainHeight: Number(e.target.value) || 210 })
                      }
                      className="w-full bg-[#0d140e] border border-sky-500/30 rounded px-2 py-1 text-center font-mono font-bold text-sky-300 text-xs outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 font-mono">cm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 頁籤 D：🧩 空間凹凸與穿插缺角 (更衣室/客用衛浴扣除缺角)                    */}
        {/* ========================================================================= */}
        {activeTab === 'cutouts' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#121810] border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#3F5B63]/30 pb-2">
                <div>
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <CornerDownRight className="w-4 h-4 text-amber-400" />
                    空間凹凸與畸角扣除 (如主臥與客用衛浴穿插內縮結構)
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    當更衣區與床區中間穿插客用衛浴，空間非矩形時，在此處直接新增扣除凹槽！
                  </p>
                </div>
                <button
                  onClick={handleAddCutout}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> 新增內凹缺角
                </button>
              </div>

              <div className="space-y-2">
                {(currentRoom.recessedCutouts || []).map((cut, idx) => (
                  <div
                    key={cut.id}
                    className="p-3 rounded-xl bg-[#182216] border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                        凹{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={cut.name}
                        onChange={(e) => {
                          const updated = (currentRoom.recessedCutouts || []).map((c) =>
                            c.id === cut.id ? { ...c, name: e.target.value } : c
                          );
                          onUpdateRoom({ ...currentRoom, recessedCutouts: updated });
                        }}
                        className="bg-transparent border-b border-transparent hover:border-amber-500/50 text-white font-bold text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-neutral-400 text-[10px]">所在牆面:</span>
                        <select
                          value={cut.wall}
                          onChange={(e) => {
                            const updated = (currentRoom.recessedCutouts || []).map((c) =>
                              c.id === cut.id ? { ...c, wall: e.target.value as any } : c
                            );
                            onUpdateRoom({ ...currentRoom, recessedCutouts: updated });
                          }}
                          className="bg-[#0d140e] border border-[#3F5B63] rounded px-1.5 py-0.5 text-xs text-amber-300"
                        >
                          <option value="right">東牆 (右牆內凹)</option>
                          <option value="left">西牆 (左牆內凹)</option>
                          <option value="top">北牆 (頂牆內凹)</option>
                          <option value="bottom">南牆 (底牆內凹)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-neutral-400 text-[10px]">缺口面寬:</span>
                        <input
                          type="number"
                          value={cut.width}
                          onChange={(e) => {
                            const updated = (currentRoom.recessedCutouts || []).map((c) =>
                              c.id === cut.id ? { ...c, width: Number(e.target.value) } : c
                            );
                            onUpdateRoom({ ...currentRoom, recessedCutouts: updated });
                          }}
                          className="w-16 bg-[#0d140e] border border-[#3F5B63] rounded text-center text-white font-bold"
                        />
                        <span className="text-neutral-500 text-[10px]">cm</span>
                      </div>

                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-neutral-400 text-[10px]">內凹進深:</span>
                        <input
                          type="number"
                          value={cut.depth}
                          onChange={(e) => {
                            const updated = (currentRoom.recessedCutouts || []).map((c) =>
                              c.id === cut.id ? { ...c, depth: Number(e.target.value) } : c
                            );
                            onUpdateRoom({ ...currentRoom, recessedCutouts: updated });
                          }}
                          className="w-16 bg-[#0d140e] border border-[#3F5B63] rounded text-center text-white font-bold"
                        />
                        <span className="text-neutral-500 text-[10px]">cm</span>
                      </div>

                      <button
                        onClick={() => {
                          const updated = (currentRoom.recessedCutouts || []).filter((c) => c.id !== cut.id);
                          onUpdateRoom({ ...currentRoom, recessedCutouts: updated });
                        }}
                        className="text-neutral-500 hover:text-red-400 p-1"
                        title="刪除此缺角"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {(!currentRoom.recessedCutouts || currentRoom.recessedCutouts.length === 0) && (
                  <div className="text-center py-4 text-xs text-neutral-500 italic">
                    本空間為標準封閉四面牆矩形；若有置入衛浴、走道缺口或凹凸畸角，點擊上方按鈕即可加入。
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
