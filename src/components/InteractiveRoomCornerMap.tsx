import React, { useState } from 'react';
import { RoomData, Column, Door, WindowOpening } from '../types';
import {
  Building,
  Plus,
  Trash2,
  Check,
  Maximize2,
  HelpCircle,
  Sparkles,
  Sliders
} from 'lucide-react';
import { getWallThickness } from '../utils/wallUtils';

interface InteractiveRoomCornerMapProps {
  room: RoomData;
  onUpdateRoom: (room: RoomData) => void;
  onNotify: (msg: string) => void;
}

type CornerId = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface CornerDef {
  id: CornerId;
  name: string;
  compass: string;
  posClass: string;
}

const CORNERS: CornerDef[] = [
  { id: 'top-left', name: '左上角', compass: '西北', posClass: 'top-2 left-2' },
  { id: 'top-right', name: '右上角', compass: '東北', posClass: 'top-2 right-2' },
  { id: 'bottom-left', name: '左下角', compass: '西南', posClass: 'bottom-2 left-2' },
  { id: 'bottom-right', name: '右下角', compass: '東南', posClass: 'bottom-2 right-2' },
];

export const InteractiveRoomCornerMap: React.FC<InteractiveRoomCornerMapProps> = ({
  room,
  onUpdateRoom,
  onNotify,
}) => {
  const [defaultColSize, setDefaultColSize] = useState<number>(50);
  const [selectedColId, setSelectedColId] = useState<string | null>(null);

  const columns = room.columns || [];

  // 尋找各角落現有的柱子
  const findColumnAtCorner = (corner: CornerId): Column | undefined => {
    return columns.find((c) => c.positionType === 'corner' && c.corner === corner);
  };

  // 1. 點擊角落：若無柱則新增，若有柱則選中/編輯
  const handleCornerClick = (corner: CornerId) => {
    const existing = findColumnAtCorner(corner);
    if (existing) {
      setSelectedColId(existing.id);
      return;
    }

    // 新增角柱
    const cornerDef = CORNERS.find((c) => c.id === corner)!;
    const nextIdx = columns.length + 1;
    const newCol: Column = {
      id: `col_${Date.now()}_${corner}`,
      name: `C${nextIdx} ${cornerDef.name}柱`,
      width: defaultColSize,
      depth: defaultColSize,
      positionType: 'corner',
      corner,
      wall: corner.startsWith('top') ? 'north' : 'south',
      offset: 0,
      x: corner.endsWith('left') ? 0 : Math.max(0, room.width - defaultColSize),
      y: corner.startsWith('top') ? 0 : Math.max(0, room.length - defaultColSize),
    };

    onUpdateRoom({
      ...room,
      columns: [...columns, newCol],
    });
    setSelectedColId(newCol.id);
    onNotify(`✓ 已在【${cornerDef.name} (${cornerDef.compass})】插入 ${defaultColSize}×${defaultColSize}cm 結構柱！`);
  };

  // 2. 移除柱體
  const handleDeleteColumn = (colId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = columns.filter((c) => c.id !== colId);
    onUpdateRoom({
      ...room,
      columns: updated,
    });
    if (selectedColId === colId) setSelectedColId(null);
    onNotify('✓ 已移除柱體');
  };

  // 3. 調整柱體尺寸
  const handleUpdateColumnSize = (colId: string, size: number) => {
    const updated = columns.map((c) =>
      c.id === colId ? { ...c, width: size, depth: size } : c
    );
    onUpdateRoom({
      ...room,
      columns: updated,
    });
    onNotify(`✓ 柱尺寸已調整為 ${size}×${size}cm`);
  };

  // 4. 一鍵四角置柱
  const handleAddAllFourCorners = () => {
    const newCols: Column[] = [...columns];
    let addedCount = 0;

    CORNERS.forEach((cDef, idx) => {
      const exists = newCols.find((c) => c.positionType === 'corner' && c.corner === cDef.id);
      if (!exists) {
        newCols.push({
          id: `col_${Date.now()}_${cDef.id}`,
          name: `C${newCols.length + 1} ${cDef.name}柱`,
          width: defaultColSize,
          depth: defaultColSize,
          positionType: 'corner',
          corner: cDef.id,
          wall: cDef.id.startsWith('top') ? 'north' : 'south',
          offset: 0,
          x: cDef.id.endsWith('left') ? 0 : Math.max(0, room.width - defaultColSize),
          y: cDef.id.startsWith('top') ? 0 : Math.max(0, room.length - defaultColSize),
        });
        addedCount++;
      }
    });

    onUpdateRoom({
      ...room,
      columns: newCols,
    });
    onNotify(`✓ 一鍵完成！已在 4 個角落補齊 ${addedCount} 處結構柱 (${defaultColSize}×${defaultColSize}cm)`);
  };

  // 5. 清空本空間所有柱體
  const handleClearAllColumns = () => {
    onUpdateRoom({
      ...room,
      columns: [],
    });
    setSelectedColId(null);
    onNotify('✓ 已清空本空間所有結構柱');
  };

  // 計算圖面顯示寬高比 (限制在合理預覽範圍)
  const roomRatio = Math.max(0.6, Math.min(1.8, (room.width || 400) / (room.length || 300)));

  return (
    <div className="bg-[#121810] border border-purple-500/40 rounded-2xl p-4 md:p-5 shadow-xl space-y-4">
      {/* 標題與引導說明 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
            <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-purple-400" />
              直觀可視化：點擊房間四角插入柱子
            </span>
            <span className="text-[10px] bg-purple-900/60 text-purple-200 border border-purple-500/50 px-2 py-0.5 rounded-full font-bold">
              解決方位困惑 · 即點即放
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            👉 <strong>不知道柱子放哪？</strong> 直接看下方房間平面示意圖，<strong>點擊四個角落的「＋ 點擊放柱」</strong>即可一秒就位，不必猜方位或座標！
          </p>
        </div>

        {/* 快捷操作按鈕組 */}
        <div className="flex items-center gap-2">
          {/* 預設柱寬快速選擇 */}
          <div className="flex items-center gap-1 bg-[#0d140e] border border-purple-500/30 rounded-xl px-2 py-1 text-xs">
            <span className="text-[11px] text-neutral-400">標準柱寬:</span>
            {[40, 50, 60].map((sz) => (
              <button
                key={sz}
                onClick={() => setDefaultColSize(sz)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                  defaultColSize === sz
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {sz}cm
              </button>
            ))}
          </div>

          <button
            onClick={handleAddAllFourCorners}
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/50 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>一鍵在 4 角放柱</span>
          </button>

          {columns.length > 0 && (
            <button
              onClick={handleClearAllColumns}
              className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs transition cursor-pointer"
              title="清空所有柱子"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 🌟 核心互動房間畫布 (Interactive 2D Room Blueprint Box) */}
      <div className="relative w-full flex flex-col items-center justify-center p-3 sm:p-5 bg-[#0a0f0b] border border-[#23301F] rounded-2xl overflow-hidden select-none">
        {/* 四面方位標註 */}
        <div className="w-full flex items-center justify-center text-[11px] font-mono text-neutral-400 font-bold mb-1">
          <span>▲ 上方牆 (北牆) · 面寬 {room.width} cm</span>
        </div>

        {/* 房間主體矩形 */}
        <div
          className="relative w-full max-w-[480px] bg-[#141b12] border-2 border-emerald-500/60 rounded-xl shadow-2xl transition-all flex items-center justify-center"
          style={{
            aspectRatio: `${roomRatio}`,
            minHeight: '220px',
            maxHeight: '340px',
          }}
        >
          {/* 格線背景 */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none rounded-lg"
            style={{
              backgroundImage: 'radial-gradient(#52796F 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* 房間中央資訊 */}
          <div className="z-10 text-center pointer-events-none px-4 py-2 rounded-xl bg-[#0d140e]/80 border border-[#3F5B63]/30 backdrop-blur-sm">
            <div className="text-xs font-bold text-amber-300">{room.roomName}</div>
            <div className="text-[11px] font-mono text-neutral-300 mt-0.5">
              面寬 {room.width} × 進深 {room.length} cm
            </div>
            <div className="text-[10px] text-purple-300 mt-1 font-mono font-semibold">
              目前已配置 {columns.length} 處柱體
            </div>
          </div>

          {/* 🚪 門洞與窗戶在邊線上的視覺指示 */}
          {(room.doors || []).map((door) => (
            <div
              key={door.id}
              className={`absolute px-2 py-0.5 bg-cyan-700/80 border border-cyan-400 text-cyan-100 text-[9px] font-mono font-bold rounded z-10 ${
                door.wall === 'top' || door.wall === 'north'
                  ? 'top-0 transform -translate-y-1/2'
                  : door.wall === 'bottom' || door.wall === 'south'
                  ? 'bottom-0 transform translate-y-1/2'
                  : door.wall === 'left' || door.wall === 'west'
                  ? 'left-0 transform -translate-x-1/2 rotate-90'
                  : 'right-0 transform translate-x-1/2 -rotate-90'
              }`}
            >
              🚪 {door.name} ({door.width}cm)
            </div>
          ))}

          {(room.windows || []).map((win) => (
            <div
              key={win.id}
              className={`absolute px-2 py-0.5 bg-sky-700/80 border border-sky-400 text-sky-100 text-[9px] font-mono font-bold rounded z-10 ${
                win.wall === 'top' || win.wall === 'north'
                  ? 'top-0 transform -translate-y-1/2'
                  : win.wall === 'bottom' || win.wall === 'south'
                  ? 'bottom-0 transform translate-y-1/2'
                  : win.wall === 'left' || win.wall === 'west'
                  ? 'left-0 transform -translate-x-1/2 rotate-90'
                  : 'right-0 transform translate-x-1/2 -rotate-90'
              }`}
            >
              🪟 {win.name} ({win.width}cm)
            </div>
          ))}

          {/* 🌟 4 個角落互動插柱熱區 (Corner Hotspots) */}
          {CORNERS.map((cornerDef) => {
            const col = findColumnAtCorner(cornerDef.id);
            const isSelected = col && selectedColId === col.id;

            if (col) {
              // 已經有柱子：繪製結構方柱視覺化樣式
              return (
                <div
                  key={cornerDef.id}
                  onClick={() => setSelectedColId(col.id)}
                  className={`absolute ${cornerDef.posClass} z-20 cursor-pointer transition-all transform hover:scale-105`}
                  title={`${cornerDef.name}柱：${col.width}×${col.depth}cm，點擊可調整尺寸或刪除`}
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex flex-col items-center justify-center p-1 border-2 shadow-xl ${
                      isSelected
                        ? 'bg-purple-900/90 border-purple-300 ring-2 ring-purple-400'
                        : 'bg-purple-950/80 border-purple-500/80 hover:border-purple-300'
                    }`}
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, rgba(168, 85, 247, 0.25), rgba(168, 85, 247, 0.25) 4px, transparent 4px, transparent 8px)',
                    }}
                  >
                    <span className="text-[10px] font-bold text-white bg-purple-700 px-1 py-0.2 rounded leading-tight">
                      {cornerDef.name}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-purple-200 mt-0.5">
                      {col.width}×{col.depth}
                    </span>
                    <button
                      onClick={(e) => handleDeleteColumn(col.id, e)}
                      className="mt-0.5 p-0.5 hover:bg-red-500/40 rounded text-neutral-300 hover:text-red-200 transition"
                      title="移除此柱"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // 尚未放置柱子：顯示高對比、超友善的點擊插柱按鈕
            return (
              <div
                key={cornerDef.id}
                onClick={() => handleCornerClick(cornerDef.id)}
                className={`absolute ${cornerDef.posClass} z-20 cursor-pointer group`}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 border-dashed border-purple-400/60 hover:border-purple-400 bg-purple-950/30 hover:bg-purple-600/40 transition-all flex flex-col items-center justify-center p-1 text-center shadow-lg group-hover:scale-105 active:scale-95">
                  <div className="w-5 h-5 rounded-full bg-purple-500/30 group-hover:bg-purple-500 text-purple-200 group-hover:text-black flex items-center justify-center mb-0.5 transition">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] font-bold text-purple-200 group-hover:text-white leading-tight">
                    {cornerDef.name}
                  </span>
                  <span className="text-[8px] text-purple-400 group-hover:text-purple-100 font-mono">
                    點擊插柱
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 下方與左右牆方位標註 */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-neutral-400 font-bold mt-1 px-4 max-w-[480px]">
          <span>◄ 左側牆 (西) {room.length}cm</span>
          <span>▼ 下方牆 (南牆) · 面寬 {room.width} cm</span>
          <span>右側牆 (東) {room.length}cm ►</span>
        </div>
      </div>

      {/* 🌟 選中柱體的微調控制列 (若使用者點擊了某個角柱) */}
      {selectedColId && (
        <div className="p-3 bg-[#182216] border border-purple-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          {(() => {
            const curCol = columns.find((c) => c.id === selectedColId);
            if (!curCol) return null;
            return (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
                    C
                  </span>
                  <span className="font-bold text-white">{curCol.name}</span>
                  <span className="text-[11px] text-purple-300 font-mono">
                    ({curCol.width}×{curCol.depth} cm)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-neutral-400">快速切換尺寸:</span>
                    {[40, 50, 60, 70, 80].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => handleUpdateColumnSize(curCol.id, sz)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                          curCol.width === sz
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-[#0d140e] text-neutral-300 hover:text-white border border-[#3F5B63]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeleteColumn(curCol.id)}
                    className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-800 text-red-300 hover:text-white text-[11px] flex items-center gap-1 transition cursor-pointer border border-red-500/30"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>刪除此柱</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
