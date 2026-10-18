import React from 'react';
import { StitchedFloorPlanResult, RoomData } from '../types';
import { Box, Eye, Layers, Compass, ExternalLink, Layout } from 'lucide-react';

interface MasterFloorPlanViewProps {
  result: StitchedFloorPlanResult;
  selectedRoomId?: string;
  onSelectRoom?: (roomId: string) => void;
  onOpen3DDeepLink?: (roomId?: string) => void;
  onOpenMinusPlusWorkspace?: () => void;
  onOpenStitcher?: () => void;
}

export const MasterFloorPlanView: React.FC<MasterFloorPlanViewProps> = ({
  result,
  selectedRoomId,
  onSelectRoom,
  onOpen3DDeepLink,
  onOpenMinusPlusWorkspace,
  onOpenStitcher,
}) => {
  if (!result || !result.placements || result.placements.length === 0) {
    return (
      <div className="h-64 bg-[#121810] rounded-2xl flex flex-col items-center justify-center text-[#3F5B63] border border-[#3F5B63]/30 p-4 text-center">
        <Layers className="w-8 h-8 text-[#3F5B63] mb-2" />
        <p className="text-xs text-[#DDD7CE]/70">無可用全案平面配置資料</p>
      </div>
    );
  }

  const { boundingBox, placements } = result;
  const padding = 60;
  const viewW = Math.max(boundingBox.maxX - boundingBox.minX + padding * 2, 200);
  const viewH = Math.max(boundingBox.maxY - boundingBox.minY + padding * 2, 200);
  const minX = boundingBox.minX - padding;
  const minY = boundingBox.minY - padding;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="relative w-full h-64 bg-[#0d140e] border border-[#3F5B63]/60 rounded-2xl overflow-hidden shadow-inner group">
        {/* SVG Floorplan View */}
        <svg
          viewBox={`${minX} ${minY} ${viewW} ${viewH}`}
          className="w-full h-full cursor-pointer select-none"
        >
          {/* Subtle Grid */}
          <defs>
            <pattern id="masterGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2d22" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect x={minX} y={minY} width={viewW} height={viewH} fill="url(#masterGrid)" />

          {/* Rooms */}
          {placements.map((p) => {
            const isSelected = selectedRoomId === p.roomId;
            return (
              <g
                key={p.roomId}
                onClick={() => onSelectRoom?.(p.roomId)}
                className="transition-all hover:opacity-90"
              >
                {/* Room Floor Rectangle */}
                <rect
                  x={p.x}
                  y={p.y}
                  width={p.width}
                  height={p.length}
                  fill={isSelected ? '#1e3323' : '#141d16'}
                  stroke={isSelected ? '#E0A83C' : '#3F5B63'}
                  strokeWidth={isSelected ? 4 : 2}
                  rx={3}
                />

                {/* Wall border accent */}
                <rect
                  x={p.x + 4}
                  y={p.y + 4}
                  width={Math.max(p.width - 8, 1)}
                  height={Math.max(p.length - 8, 1)}
                  fill="none"
                  stroke={isSelected ? '#E0A83C' : '#23301F'}
                  strokeWidth={1}
                  strokeDasharray="4 2"
                />

                {/* Room Title */}
                <text
                  x={p.x + p.width / 2}
                  y={p.y + p.length / 2 - 8}
                  textAnchor="middle"
                  fill={isSelected ? '#F8F8F6' : '#DDD7CE'}
                  fontSize={p.width > 250 ? 22 : 18}
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {p.roomName}
                </text>

                {/* Dimensions text */}
                <text
                  x={p.x + p.width / 2}
                  y={p.y + p.length / 2 + 16}
                  textAnchor="middle"
                  fill={isSelected ? '#E0A83C' : '#8E8E93'}
                  fontSize={14}
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {p.width} × {p.length} cm
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Actions */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {onOpenStitcher && (
            <button
              onClick={onOpenStitcher}
              className="px-2.5 py-1 rounded-lg bg-cyan-700/90 hover:bg-cyan-600 text-white text-[10px] font-black flex items-center gap-1 shadow-md transition active:scale-95"
              title="開啟建築級全案剛體拓撲咬合器 (雙線實體牆與 AutoCAD DXF 匯出)"
            >
              <Layers className="w-3 h-3 text-cyan-200" />
              <span>📐 剛體幾何咬合 (真正平面圖)</span>
            </button>
          )}

          {onOpenMinusPlusWorkspace && (
            <button
              onClick={onOpenMinusPlusWorkspace}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 shadow-md transition active:scale-95"
              title="開啟加減設計 1:1 全層施工圖與 CAD/LayOut 批次交接工作台"
            >
              <Layout className="w-3 h-3 text-white" />
              <span>加減設計 1:1 施工圖</span>
            </button>
          )}

          <button
            onClick={() => onOpen3DDeepLink?.(selectedRoomId)}
            className="px-2.5 py-1 rounded-lg bg-[#E0A83C]/90 hover:bg-[#E0A83C] text-[#121810] text-[10px] font-black flex items-center gap-1 shadow-md transition active:scale-95"
            title="實景 3D 深度連結：以真實梁高與門窗開口深入當前空間"
          >
            <Box className="w-3 h-3 text-[#121810]" />
            <span>實景 3D 深度連結</span>
          </button>
        </div>
      </div>

      {/* Room list chips */}
      <div className="grid grid-cols-2 gap-1.5">
        {placements.map((p) => {
          const isSelected = selectedRoomId === p.roomId;
          return (
            <button
              key={p.roomId}
              onClick={() => onSelectRoom?.(p.roomId)}
              className={`p-2 rounded-xl text-left border text-xs transition-all ${
                isSelected
                  ? 'bg-[#23301F] border-[#E0A83C] text-[#F8F8F6] font-bold shadow-sm'
                  : 'bg-[#121810] border-[#3F5B63]/40 text-[#DDD7CE]/70 hover:border-[#3F5B63]'
              }`}
            >
              <div className="truncate">{p.roomName}</div>
              <div className="text-[10px] font-mono text-amber-400/80">
                {p.width}×{p.length}cm
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
