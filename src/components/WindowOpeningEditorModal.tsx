import React, { useState, useEffect } from 'react';
import { X, Check, Sliders, Maximize2, MoveHorizontal, Compass, Layers, ShieldCheck, RefreshCw, Sparkles, Ruler } from 'lucide-react';
import { RoomData, Window } from '../types';

interface WindowOpeningEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  rooms?: RoomData[];
  onUpdateRoom: (updated: RoomData) => void;
  onSelectRoom?: (roomId: string) => void;
  initialWindowId?: string;
  onNotify?: (msg: string) => void;
}

const PRESET_WINDOWS = [
  { name: '客廳景觀落地窗', width: 240, height: 212, sillHeight: 8, wall: 'north' as const, offset: 6, desc: '星玥灣客廳標準 (240×212, 台度8)' },
  { name: '主臥景觀窗', width: 200, height: 158, sillHeight: 37, wall: 'north' as const, offset: 40, desc: '星玥灣主臥標準 (200×158, 台度37)' },
  { name: '兒子房氣密窗', width: 164, height: 168, sillHeight: 52, wall: 'north' as const, offset: 30, desc: '星玥灣兒子房標準 (164×168, 台度52)' },
  { name: '女兒房氣密窗', width: 124, height: 171, sillHeight: 49, wall: 'north' as const, offset: 40, desc: '星玥灣女兒房標準 (124×171, 台度49)' },
];

export const WindowOpeningEditorModal: React.FC<WindowOpeningEditorModalProps> = ({
  isOpen,
  onClose,
  room,
  rooms = [],
  onUpdateRoom,
  onSelectRoom,
  initialWindowId,
  onNotify,
}) => {
  const [selectedWinId, setSelectedWinId] = useState<string>('');
  const [width, setWidth] = useState<number>(240);
  const [height, setHeight] = useState<number>(212);
  const [sillHeight, setSillHeight] = useState<number>(8);
  const [wall, setWall] = useState<'north' | 'south' | 'east' | 'west' | 'top' | 'bottom' | 'left' | 'right'>('north');
  const [offset, setOffset] = useState<number>(30);
  const [winName, setWinName] = useState<string>('氣密窗');

  // Door editor tab
  const [activeTab, setActiveTab] = useState<'windows' | 'doors'>('windows');
  const [selectedDoorId, setSelectedDoorId] = useState<string>('');
  const [doorWidth, setDoorWidth] = useState<number>(110);
  const [doorHeight, setDoorHeight] = useState<number>(215);
  const [doorOffset, setDoorOffset] = useState<number>(45);
  const [doorWall, setDoorWall] = useState<'north' | 'south' | 'east' | 'west' | 'top' | 'bottom' | 'left' | 'right'>('south');
  const [doorName, setDoorName] = useState<string>('玄關大門');

  useEffect(() => {
    if (room && room.windows && room.windows.length > 0) {
      const target = initialWindowId
        ? room.windows.find((w) => w.id === initialWindowId) || room.windows[0]
        : room.windows[0];
      setSelectedWinId(target.id);
      setWidth(Number(target.width) || 240);
      setHeight(Number(target.height) || 212);
      setSillHeight(target.sillHeight !== undefined ? Number(target.sillHeight) : 8);
      setWall((target.wall as any) || 'north');
      setOffset(Number(target.offset) || 30);
      setWinName(target.name || '氣密窗');
    } else {
      setSelectedWinId('new_win');
      setWidth(240);
      setHeight(212);
      setSillHeight(8);
      setWall('north');
      setOffset(30);
      setWinName('客廳景觀落地窗');
    }

    if (room && room.doors && room.doors.length > 0) {
      const d = room.doors[0];
      setSelectedDoorId(d.id);
      setDoorWidth(Number(d.width) || 110);
      setDoorHeight(Number(d.height) || 215);
      setDoorOffset(Number(d.offset) || 45);
      setDoorWall((d.wall as any) || 'south');
      setDoorName(d.name || '大門');
    }
  }, [room, initialWindowId, isOpen]);

  if (!isOpen) return null;

  // Wall span for offset limit
  const getWallSpan = (w: string) => {
    const isEW = w === 'east' || w === 'west' || w === 'left' || w === 'right';
    return isEW ? (room.length || 754) : (room.width || 311);
  };
  const maxSpan = getWallSpan(wall);

  const handleSelectWindow = (id: string) => {
    setSelectedWinId(id);
    const win = room.windows?.find((w) => w.id === id);
    if (win) {
      setWidth(Number(win.width) || 240);
      setHeight(Number(win.height) || 212);
      setSillHeight(win.sillHeight !== undefined ? Number(win.sillHeight) : 8);
      setWall((win.wall as any) || 'north');
      setOffset(Number(win.offset) || 30);
      setWinName(win.name || '氣密窗');
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_WINDOWS[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setSillHeight(preset.sillHeight);
    setWall(preset.wall);
    setOffset(preset.offset);
    setWinName(preset.name);
    if (onNotify) onNotify(`已填入規範預設：「${preset.name}」(${preset.width}×${preset.height} 台度${preset.sillHeight})`);
  };

  const handleCenterAlign = () => {
    const span = getWallSpan(wall);
    const centeredOffset = Math.max(0, Math.round((span - width) / 2));
    setOffset(centeredOffset);
  };

  const handleSaveWindow = () => {
    const currentWindows = room.windows || [];
    let updatedWindows: Window[] = [];

    const normalizedWall = (wall === 'top' ? 'north' : wall === 'bottom' ? 'south' : wall === 'left' ? 'west' : wall === 'right' ? 'east' : wall) as any;

    if (selectedWinId === 'new_win' || !currentWindows.some((w) => w.id === selectedWinId)) {
      const newWin: Window = {
        id: `win_${Date.now()}`,
        name: winName,
        width,
        height,
        sillHeight,
        wall: normalizedWall,
        offset,
      };
      updatedWindows = [...currentWindows, newWin];
    } else {
      updatedWindows = currentWindows.map((w) =>
        w.id === selectedWinId
          ? {
              ...w,
              name: winName,
              width,
              height,
              sillHeight,
              wall: normalizedWall,
              offset,
            }
          : w
      );
    }

    onUpdateRoom({
      ...room,
      windows: updatedWindows,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });

    if (onNotify) {
      onNotify(`✓ 已成功更新窗戶「${winName}」：尺寸 ${width}×${height}cm、台度 ${sillHeight}cm、偏移 ${offset}cm！已同步至 2D、3D、16面立面與出圖端點。`);
    }
    onClose();
  };

  const handleSaveDoor = () => {
    const currentDoors = room.doors || [];
    const normalizedWall = (doorWall === 'top' ? 'north' : doorWall === 'bottom' ? 'south' : doorWall === 'left' ? 'west' : doorWall === 'right' ? 'east' : doorWall) as any;

    const updatedDoors = currentDoors.map((d) =>
      d.id === selectedDoorId
        ? {
            ...d,
            name: doorName,
            width: doorWidth,
            height: doorHeight,
            offset: doorOffset,
            wall: normalizedWall,
          }
        : d
    );

    onUpdateRoom({
      ...room,
      doors: updatedDoors,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });

    if (onNotify) {
      onNotify(`✓ 已成功更新門扇「${doorName}」：寬度 ${doorWidth}cm、高度 ${doorHeight}cm、偏移 ${doorOffset}cm！`);
    }
    onClose();
  };

  const handleAddWindow = () => {
    const newId = `win_${Date.now()}`;
    setSelectedWinId(newId);
    setWidth(160);
    setHeight(150);
    setSillHeight(45);
    setWall('north');
    setOffset(30);
    setWinName('新增景觀氣密窗');
  };

  const handleDeleteWindow = () => {
    const updatedWindows = (room.windows || []).filter((w) => w.id !== selectedWinId);
    onUpdateRoom({
      ...room,
      windows: updatedWindows,
    });
    if (onNotify) onNotify('已刪除此窗戶開口。');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-sky-500/30 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-lg">開口尺寸與位置自訂編輯器</h3>
                <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-400 border border-sky-500/20">
                  即時雙向連動
                </span>
              </div>
              <p className="text-xs text-slate-400">
                可自由修改窗寬、窗高、窗台離地台度、所在牆面與沿牆偏移位置，全案 2D、3D、16面立面與 PDF/DXF 即時同步。
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Space Selection Bar & Wall Dimensions Direct Input */}
        <div className="bg-slate-950/40 border-b border-slate-800/80 px-6 py-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">目前編輯空間：</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelectRoom && onSelectRoom(r.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      r.id === room.id
                        ? 'bg-sky-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {r.roomName}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Selector: Windows vs Doors */}
            <div className="flex items-center rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60">
              <button
                onClick={() => setActiveTab('windows')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === 'windows' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🪟 窗戶開口 ({room.windows?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('doors')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === 'doors' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🚪 門洞扇型 ({room.doors?.length || 0})
              </button>
            </div>
          </div>

          {/* 牆面尺寸直接輸入區域 (直接修改當前房間牆面寬度、長度、挑高、壁厚) */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-700/70 rounded-xl px-3.5 py-2">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1 shrink-0">
              📐 牆面淨尺寸直接修改：
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">面寬 (北/南牆):</span>
              <input
                type="number"
                value={room.width}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (onUpdateRoom && val > 0) onUpdateRoom({ ...room, width: val });
                }}
                className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono font-bold text-xs focus:border-sky-400 outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">cm</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">進深 (東/西牆):</span>
              <input
                type="number"
                value={room.length}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (onUpdateRoom && val > 0) onUpdateRoom({ ...room, length: val });
                }}
                className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono font-bold text-xs focus:border-sky-400 outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">cm</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">天花淨高:</span>
              <input
                type="number"
                value={room.height}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (onUpdateRoom && val > 0) onUpdateRoom({ ...room, height: val });
                }}
                className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono font-bold text-xs focus:border-sky-400 outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">cm</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">放樣壁厚:</span>
              <input
                type="number"
                value={room.wallThickness || 15}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (onUpdateRoom && val > 0) onUpdateRoom({ ...room, wallThickness: val });
                }}
                className="w-14 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono font-bold text-xs focus:border-sky-400 outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">cm</span>
            </div>

            <div className="ml-auto text-[10px] text-slate-400 font-mono">
              地坪面積: <span className="text-amber-400 font-bold">{((room.width * room.length) / 10000).toFixed(2)}</span> m² / <span className="text-sky-400 font-bold">{((room.width * room.length * 0.0001) * 0.3025).toFixed(2)}</span> 坪
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'windows' ? (
            <>
              {/* Preset Quick-Fill Bar */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  星玥灣契約規範快速預設套用：
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PRESET_WINDOWS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="text-left rounded-xl border border-slate-700/70 bg-slate-800/50 p-2.5 hover:border-sky-500/50 hover:bg-slate-800 transition-all group"
                    >
                      <div className="font-semibold text-xs text-sky-300 group-hover:text-sky-200">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        W:{p.width} × H:{p.height}
                      </div>
                      <div className="text-[10px] text-amber-400/90 mt-0.5">
                        窗台離地: {p.sillHeight} cm
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Window List Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">選擇欲修改之窗戶：</label>
                  <button
                    onClick={handleAddWindow}
                    className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    + 新增一樘窗戶
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {(room.windows || []).map((w) => (
                    <button
                      key={w.id}
                      onClick={() => handleSelectWindow(w.id)}
                      className={`rounded-xl border px-3.5 py-2 text-left transition-all shrink-0 ${
                        selectedWinId === w.id
                          ? 'border-sky-500 bg-sky-500/10 text-sky-200 shadow'
                          : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{w.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {w.width}×{w.height} (台度{w.sillHeight}cm)
                      </div>
                    </button>
                  ))}
                  {(!room.windows || room.windows.length === 0) && (
                    <div className="text-xs text-slate-500 italic py-2">
                      當前空間尚未建立窗戶，請點擊上方按鈕新增。
                    </div>
                  )}
                </div>
              </div>

              {/* Main Parameter Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-400 block mb-1">窗戶標稱名稱</label>
                  <input
                    type="text"
                    value={winName}
                    onChange={(e) => setWinName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                    placeholder="如：客廳景觀落地窗、臥室氣密窗"
                  />
                </div>

                {/* Width */}
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    窗戶寬度 (W, cm)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Math.max(30, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 font-mono">cm</span>
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    窗戶高度 (H, cm)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Math.max(30, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 font-mono">cm</span>
                  </div>
                </div>

                {/* Sill Height */}
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 flex items-center justify-between">
                    <span>窗台離地高度 (台度, cm)</span>
                    <span className="text-[10px] text-amber-400 font-normal">
                      落地窗為 8cm，腰窗 37~52cm
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={sillHeight}
                      onChange={(e) => setSillHeight(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 font-mono">cm</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    窗頂完成標高: FL + {sillHeight + height} cm
                  </div>
                </div>

                {/* Wall Orientation */}
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    所在牆面方位 (立面方向)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: 'north', label: '北牆 (A向)' },
                      { key: 'east', label: '東牆 (B向)' },
                      { key: 'south', label: '南牆 (C向)' },
                      { key: 'west', label: '西牆 (D向)' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setWall(item.key as any)}
                        className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                          wall === item.key || (wall === 'top' && item.key === 'north') || (wall === 'bottom' && item.key === 'south') || (wall === 'left' && item.key === 'west') || (wall === 'right' && item.key === 'east')
                            ? 'bg-sky-500 text-slate-950 shadow font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wall Offset Slider & Direct Input */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-400">
                      開口沿牆面起點偏移位置 (Offset: {offset} cm / 牆長: {maxSpan} cm)
                    </label>
                    <button
                      type="button"
                      onClick={handleCenterAlign}
                      className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                    >
                      🎯 居中對齊
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, maxSpan - width)}
                      value={Math.min(offset, Math.max(0, maxSpan - width))}
                      onChange={(e) => setOffset(Number(e.target.value))}
                      className="flex-1 accent-sky-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-1 w-24">
                      <input
                        type="number"
                        value={offset}
                        onChange={(e) => setOffset(Math.max(0, Number(e.target.value)))}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-sm font-mono text-slate-100 text-right focus:border-sky-500 focus:outline-none"
                      />
                      <span className="text-xs text-slate-500 font-mono">cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Preview Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>牆面與窗戶開口投影即時預覽</span>
                  <span className="font-mono text-sky-400">
                    牆寬 {maxSpan}cm · 窗開口 [{offset} ~ {offset + width}]cm
                  </span>
                </div>
                <div className="relative h-16 w-full bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center px-4">
                  {/* Wall Line */}
                  <div className="absolute inset-x-4 h-2 bg-slate-700 rounded-full" />
                  {/* Window Line */}
                  <div
                    className="absolute h-4 bg-sky-500/40 border-2 border-sky-400 rounded flex items-center justify-center text-[10px] font-bold text-sky-200 shadow-lg"
                    style={{
                      left: `calc(1rem + ${(offset / maxSpan) * 100}% * 0.88)`,
                      width: `calc(${(width / maxSpan) * 100}% * 0.88)`,
                    }}
                  >
                    {width}×{height} (台度{sillHeight})
                  </div>
                </div>
              </div>

              {/* 🧱 當前牆面尺寸直接輸入修改區 (Wall Dimensions Quick Edit) */}
              <div className="rounded-xl border border-amber-500/30 bg-slate-900/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-amber-400" />
                    當前所在牆面與空間尺寸直接修改 (即時連動全室圖面)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    空間：{room.roomName}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {wall === 'east' || wall === 'west' || wall === 'left' || wall === 'right' ? '東/西牆進深 (Length)' : '北/南牆面寬 (Width)'}
                    </label>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        value={wall === 'east' || wall === 'west' || wall === 'left' || wall === 'right' ? room.length : room.width}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (wall === 'east' || wall === 'west' || wall === 'left' || wall === 'right') {
                            onUpdateRoom({ ...room, length: val });
                          } else {
                            onUpdateRoom({ ...room, width: val });
                          }
                        }}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-amber-300 font-bold text-xs focus:border-amber-400 outline-none"
                      />
                      <span className="text-slate-500 text-[10px]">cm</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">樓板淨高 (Ceiling Height)</label>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        value={room.height}
                        onChange={(e) => onUpdateRoom({ ...room, height: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white font-bold text-xs focus:border-amber-400 outline-none"
                      />
                      <span className="text-slate-500 text-[10px]">cm</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">梁下淨高 (Beam Height)</label>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        value={room.beamHeight}
                        onChange={(e) => onUpdateRoom({ ...room, beamHeight: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-amber-300 font-bold text-xs focus:border-amber-400 outline-none"
                      />
                      <span className="text-slate-500 text-[10px]">cm</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">天花降板 (Ceiling Drop)</label>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        value={room.ceilingDrop}
                        onChange={(e) => onUpdateRoom({ ...room, ceilingDrop: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-amber-300 font-bold text-xs focus:border-amber-400 outline-none"
                      />
                      <span className="text-slate-500 text-[10px]">cm</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Door Editor View */
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">門扇名稱</label>
                  <input
                    type="text"
                    value={doorName}
                    onChange={(e) => setDoorName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                    placeholder="如：玄關大門、房間門、衛浴門"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">
                      門洞淨寬 (寬度, cm)
                    </label>
                    <input
                      type="number"
                      value={doorWidth}
                      onChange={(e) => setDoorWidth(Math.max(50, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      玄關大門規範要求 110cm；臥室房門 90cm；浴廁 75cm
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">
                      門洞淨高 (高度, cm)
                    </label>
                    <input
                      type="number"
                      value={doorHeight}
                      onChange={(e) => setDoorHeight(Math.max(150, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      玄關大門 215cm；臥室房門 205cm
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">所在牆面</label>
                    <select
                      value={doorWall}
                      onChange={(e) => setDoorWall(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                    >
                      <option value="south">南牆 (C向 - 玄關大門)</option>
                      <option value="north">北牆 (A向)</option>
                      <option value="west">西牆 (D向 - 走道/房門)</option>
                      <option value="east">東牆 (B向)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">沿牆偏移 (Offset, cm)</label>
                    <input
                      type="number"
                      value={doorOffset}
                      onChange={(e) => setDoorOffset(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-4">
          <div>
            {activeTab === 'windows' && selectedWinId !== 'new_win' && (
              <button
                type="button"
                onClick={handleDeleteWindow}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
              >
                刪除此窗戶
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={activeTab === 'windows' ? handleSaveWindow : handleSaveDoor}
              className="rounded-xl bg-sky-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg hover:bg-sky-400 transition-all flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              保存並即時同步全案
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
