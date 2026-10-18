import React from 'react';
import {
  Zap,
  Lightbulb,
  Radio,
  Sliders,
  Trash2,
  CheckCircle2,
  Sparkles,
  MousePointer,
  Maximize2,
  X,
  Droplets,
} from 'lucide-react';
import { RoomData, ElectricalPoint, LightingPoint } from '../types';

export type StakingToolType =
  | 'select'
  | 'socket_110v'
  | 'socket_220v'
  | 'switch'
  | 'network'
  | 'water_supply'
  | 'downlight'
  | 'spotlight'
  | 'pendant';

interface FieldStakingControlBarProps {
  activeTool: StakingToolType;
  setActiveTool: (tool: StakingToolType) => void;
  snap5x: boolean;
  setSnap5x: (snap: boolean) => void;
  selectedMepId: string | null;
  selectedLightingId: string | null;
  room: RoomData;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  onLoadStandardPresets: () => void;
}

export const FieldStakingControlBar: React.FC<FieldStakingControlBarProps> = ({
  activeTool,
  setActiveTool,
  snap5x,
  setSnap5x,
  selectedMepId,
  selectedLightingId,
  room,
  onDeleteSelected,
  onClearSelection,
  onLoadStandardPresets,
}) => {
  const mepList = room.electricalPoints || [];
  const lightingList = room.lightingPoints || [];

  const selectedMep = mepList.find((p) => p.id === selectedMepId);
  const selectedLight = lightingList.find((p) => p.id === selectedLightingId);
  const activeSelected = selectedMep || selectedLight;

  return (
    <div className="flex flex-col gap-2 bg-slate-950/95 border border-slate-700/80 backdrop-blur-md rounded-xl p-3 shadow-xl text-xs">
      {/* Top row: Tool picker & Mode indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            現場水電與燈具即時放樣標示 (iPad/現場模式)
          </span>
          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded-full font-mono">
            {mepList.length} 水電 + {lightingList.length} 燈具
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 5-multiple snap toggle */}
          <button
            onClick={() => setSnap5x(!snap5x)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition ${
              snap5x
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
            title="開啟後點擊落點座標強制鎖定在 5 倍數網格 (符合幾何契約)"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>5倍數吸附：{snap5x ? '開啟' : '關閉'}</span>
          </button>

          {/* Quick preset */}
          <button
            onClick={onLoadStandardPresets}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="一鍵置入標準客廳水電與四角崁燈放樣陣列"
          >
            載入典型配置
          </button>
        </div>
      </div>

      {/* Tool Selection Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <button
          onClick={() => setActiveTool('select')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
            activeTool === 'select'
              ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>選取/拖曳</span>
        </button>

        <span className="w-px h-5 bg-slate-800 mx-1" />

        {/* 110V Socket */}
        <button
          onClick={() => setActiveTool('socket_110v')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
            activeTool === 'socket_110v'
              ? 'bg-red-600 text-white font-bold shadow-md'
              : 'bg-slate-900 text-red-300 hover:bg-red-950/50 border border-red-900/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span>+ 110V插座</span>
        </button>

        {/* 220V Socket */}
        <button
          onClick={() => setActiveTool('socket_220v')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
            activeTool === 'socket_220v'
              ? 'bg-orange-600 text-white font-bold shadow-md'
              : 'bg-slate-900 text-orange-300 hover:bg-orange-950/50 border border-orange-900/40'
          }`}
        >
          <Zap className="w-3 h-3 text-orange-400" />
          <span>+ 220V專用</span>
        </button>

        {/* Switch */}
        <button
          onClick={() => setActiveTool('switch')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
            activeTool === 'switch'
              ? 'bg-emerald-600 text-white font-bold shadow-md'
              : 'bg-slate-900 text-emerald-300 hover:bg-emerald-950/50 border border-emerald-900/40'
          }`}
        >
          <Sliders className="w-3 h-3 text-emerald-400" />
          <span>+ 開關面板</span>
        </button>

        {/* Water supply */}
        <button
          onClick={() => setActiveTool('water_supply')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
            activeTool === 'water_supply'
              ? 'bg-cyan-600 text-white font-bold shadow-md'
              : 'bg-slate-900 text-cyan-300 hover:bg-cyan-950/50 border border-cyan-900/40'
          }`}
        >
          <Droplets className="w-3 h-3 text-cyan-400" />
          <span>+ 給排水口</span>
        </button>

        <span className="w-px h-5 bg-slate-800 mx-1" />

        {/* Downlight */}
        <button
          onClick={() => setActiveTool('downlight')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
            activeTool === 'downlight'
              ? 'bg-amber-600 text-white font-bold shadow-md'
              : 'bg-slate-900 text-amber-300 hover:bg-amber-950/50 border border-amber-900/40'
          }`}
        >
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>+ 崁燈 Ø7.5</span>
        </button>

        {/* Spotlight */}
        <button
          onClick={() => setActiveTool('spotlight')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
            activeTool === 'spotlight'
              ? 'bg-amber-600 text-white font-bold shadow-md'
              : 'bg-slate-900 text-amber-200 hover:bg-amber-950/50 border border-amber-900/40'
          }`}
        >
          <Radio className="w-3 h-3 text-amber-400" />
          <span>+ 軌道射燈</span>
        </button>

        {/* Pendant */}
        <button
          onClick={() => setActiveTool('pendant')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
            activeTool === 'pendant'
              ? 'bg-purple-600 text-white font-bold shadow-md'
              : 'bg-slate-900 text-purple-300 hover:bg-purple-950/50 border border-purple-900/40'
          }`}
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>+ 造型吊燈</span>
        </button>
      </div>

      {/* Selected Item Quick Action Bar */}
      {activeSelected && (
        <div className="mt-1 bg-slate-900 border border-cyan-500/50 rounded-lg p-2 flex items-center justify-between gap-3 text-[11px] animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-300">{activeSelected.name}</span>
            <span className="text-slate-400 font-mono">
              座標: [X: {activeSelected.x}, Y: {activeSelected.y}]
            </span>
            <span className="text-amber-400 font-mono">
              {selectedMep ? `高程: H+${activeSelected.elevation}cm` : `天花: FL+${activeSelected.elevation}cm`}
            </span>
            {activeSelected.x % 5 === 0 && activeSelected.y % 5 === 0 && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 font-bold">
                ✓ 5倍數原則
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDeleteSelected}
              className="px-2 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 rounded border border-red-800 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3 h-3" />
              <span>刪除圖標</span>
            </button>
            <button
              onClick={onClearSelection}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="取消選取"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
