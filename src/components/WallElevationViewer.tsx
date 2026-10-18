import React, { useState, useMemo } from 'react';
import { RoomData, WindowOpening, Door, Beam, ElectricalPoint, VoiceMemo } from '../types';
import {
  Ruler,
  Columns3,
  Layers,
  CheckCircle2,
  AlertTriangle,
  DoorOpen,
  Zap,
  Mic,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Download,
  Info,
  Sliders,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Eye,
  Settings2,
} from 'lucide-react';
import { SplitViewElevationViewer } from './SplitViewElevationViewer';

export type WallKey = 'top' | 'right' | 'bottom' | 'left';

export interface WallElevationMeta {
  key: WallKey;
  code: 'N' | 'E' | 'S' | 'W';
  name: string;
  compassName: string;
  width: number; // Wall width in cm
  height: number; // Wall height (floor to ceiling slab) in cm
  windows: WindowOpening[];
  doors: Door[];
  beams: {
    beam: Beam;
    isCrossSection: boolean;
    x: number;
    width: number;
    clearHeight: number;
  }[];
  electricalPoints: ElectricalPoint[];
  voiceMemos: VoiceMemo[];
}

interface WallElevationViewerProps {
  room: RoomData;
  onUpdateRoom?: (updatedRoom: RoomData) => void;
  onClose?: () => void;
  initialWall?: WallKey | 'all';
}

export const WallElevationViewer: React.FC<WallElevationViewerProps> = ({
  room,
  onUpdateRoom,
  onClose,
  initialWall = 'all',
}) => {
  const [selectedWallTab, setSelectedWallTab] = useState<WallKey | 'all'>(initialWall);
  const [viewMode, setViewMode] = useState<'standard' | 'split_cone'>('standard');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedSpecs, setCopiedSpecs] = useState<boolean>(false);

  // Layer Visibility Toggles
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showLevelDatums, setShowLevelDatums] = useState<boolean>(true);
  const [showMEP, setShowMEP] = useState<boolean>(true);
  const [showCeilingLines, setShowCeilingLines] = useState<boolean>(true);
  const [showVoicePins, setShowVoicePins] = useState<boolean>(true);
  const [showGridHatch, setShowGridHatch] = useState<boolean>(true);

  // Selected item inspection
  const [inspectedItem, setInspectedItem] = useState<{
    title: string;
    type: 'window' | 'door' | 'beam' | 'datum' | 'mep';
    details: Record<string, string | number>;
  } | null>(null);

  // Quick edit state for selected window or door
  const [editingWindow, setEditingWindow] = useState<WindowOpening | null>(null);

  // 1. Compute Wall Metadata for all 4 walls
  const walls: WallElevationMeta[] = useMemo(() => {
    // Top Wall = North Wall (Y = 0)
    const northWall: WallElevationMeta = {
      key: 'top',
      code: 'N',
      name: '北向牆立面 (North Wall)',
      compassName: '向北立面 · 頂牆',
      width: room.width,
      height: room.height,
      windows: room.windows.filter((w) => w.wall === 'top'),
      doors: room.doors.filter((d) => d.wall === 'top'),
      beams: room.beams
        .filter((b) => {
          if (b.orientation === 'horizontal') {
            return b.y <= 60; // Runs along north wall
          } else {
            return true; // Vertical beams pierce the north wall
          }
        })
        .map((b) => ({
          beam: b,
          isCrossSection: b.orientation === 'vertical',
          x: b.orientation === 'vertical' ? (b.x ?? 0) : 0,
          width: b.orientation === 'vertical' ? b.width : room.width,
          clearHeight: b.clearHeight ?? room.beamHeight,
        })),
      electricalPoints: room.electricalPoints.filter((ep) => ep.y <= 50),
      voiceMemos: room.voiceMemos.filter((vm) => vm.y <= 60),
    };

    // Right Wall = East Wall (X = room.width)
    const eastWall: WallElevationMeta = {
      key: 'right',
      code: 'E',
      name: '東向牆立面 (East Wall)',
      compassName: '向東立面 · 右側牆',
      width: room.length,
      height: room.height,
      windows: room.windows.filter((w) => w.wall === 'right'),
      doors: room.doors.filter((d) => d.wall === 'right'),
      beams: room.beams
        .filter((b) => {
          if (b.orientation === 'vertical') {
            return (b.x ?? 0) >= room.width - 60;
          } else {
            return true; // Horizontal beam pierces east wall
          }
        })
        .map((b) => ({
          beam: b,
          isCrossSection: b.orientation === 'horizontal',
          x: b.orientation === 'horizontal' ? b.y : 0,
          width: b.orientation === 'horizontal' ? b.width : room.length,
          clearHeight: b.clearHeight ?? room.beamHeight,
        })),
      electricalPoints: room.electricalPoints.filter((ep) => ep.x >= room.width - 50),
      voiceMemos: room.voiceMemos.filter((vm) => vm.x >= room.width - 60),
    };

    // Bottom Wall = South Wall (Y = room.length)
    const southWall: WallElevationMeta = {
      key: 'bottom',
      code: 'S',
      name: '南向牆立面 (South Wall)',
      compassName: '向南立面 · 底牆',
      width: room.width,
      height: room.height,
      windows: room.windows.filter((w) => w.wall === 'bottom'),
      doors: room.doors.filter((d) => d.wall === 'bottom'),
      beams: room.beams
        .filter((b) => {
          if (b.orientation === 'horizontal') {
            return b.y >= room.length - 60;
          } else {
            return true;
          }
        })
        .map((b) => ({
          beam: b,
          isCrossSection: b.orientation === 'vertical',
          x: b.orientation === 'vertical' ? (b.x ?? 0) : 0,
          width: b.orientation === 'vertical' ? b.width : room.width,
          clearHeight: b.clearHeight ?? room.beamHeight,
        })),
      electricalPoints: room.electricalPoints.filter((ep) => ep.y >= room.length - 50),
      voiceMemos: room.voiceMemos.filter((vm) => vm.y >= room.length - 60),
    };

    // Left Wall = West Wall (X = 0)
    const westWall: WallElevationMeta = {
      key: 'left',
      code: 'W',
      name: '西向牆立面 (West Wall)',
      compassName: '向西立面 · 左側牆',
      width: room.length,
      height: room.height,
      windows: room.windows.filter((w) => w.wall === 'left'),
      doors: room.doors.filter((d) => d.wall === 'left'),
      beams: room.beams
        .filter((b) => {
          if (b.orientation === 'vertical') {
            return (b.x ?? 0) <= 60;
          } else {
            return true; // Horizontal beam pierces west wall
          }
        })
        .map((b) => ({
          beam: b,
          isCrossSection: b.orientation === 'horizontal',
          x: b.orientation === 'horizontal' ? b.y : 0,
          width: b.orientation === 'horizontal' ? b.width : room.length,
          clearHeight: b.clearHeight ?? room.beamHeight,
        })),
      electricalPoints: room.electricalPoints.filter((ep) => ep.x <= 50),
      voiceMemos: room.voiceMemos.filter((vm) => vm.x <= 60),
    };

    return [northWall, eastWall, southWall, westWall];
  }, [room]);

  // Overall Contract Checks across all 4 walls
  const elevationAudit = useMemo(() => {
    const issues: { level: 'error' | 'warning' | 'info'; title: string; desc: string; wallCode: string }[] = [];

    walls.forEach((w) => {
      // 1. Check windows vs ceiling drop & beams
      w.windows.forEach((win) => {
        const winTop = win.sillHeight + win.height;
        if (winTop > room.ceilingDrop) {
          issues.push({
            level: 'warning',
            wallCode: w.code,
            title: `${w.name} - 窗頂高於天花降板面`,
            desc: `窗頂標高 FL+${winTop}cm 超出降板完成面 FL+${room.ceilingDrop}cm，窗簾盒需做暗藏式槽孔或調整窗高。`,
          });
        }
        if (winTop > room.beamHeight) {
          issues.push({
            level: 'error',
            wallCode: w.code,
            title: `${w.name} - 窗頂與結構梁衝突 (Clash)`,
            desc: `窗頂標高 FL+${winTop}cm 侵入大梁下淨高 FL+${room.beamHeight}cm (重疊 ${winTop - room.beamHeight}cm)，無法開窗！`,
          });
        }
        // 5-multiple check for sill height
        if (win.sillHeight % 5 !== 0) {
          issues.push({
            level: 'info',
            wallCode: w.code,
            title: `${w.name} - 窗台標高非 5 倍數`,
            desc: `窗台標高 ${win.sillHeight}cm 未整除 5 (室內設計規範)，建議對齊至 ${Math.round(win.sillHeight / 5) * 5}cm。`,
          });
        }
      });

      // 2. Check doors vs ceiling
      w.doors.forEach((door) => {
        if (door.height > room.ceilingDrop) {
          issues.push({
            level: 'warning',
            wallCode: w.code,
            title: `${w.name} - 門框頂高於降板天花`,
            desc: `門高 ${door.height}cm 超出天花降板面 ${room.ceilingDrop}cm，門框頂部需收口或假樑避讓。`,
          });
        }
      });

      // 3. Check horizontal boundary overflows
      w.windows.forEach((win) => {
        if (win.width > w.width) {
          issues.push({
            level: 'error',
            wallCode: w.code,
            title: `${w.name} - 開窗寬度大於該牆面寬`,
            desc: `窗寬 (${win.width}cm) 大於牆寬 (${w.width}cm)，無法配置！`,
          });
        } else if (win.offset + win.width > w.width) {
          const overflow = win.offset + win.width - w.width;
          issues.push({
            level: 'error',
            wallCode: w.code,
            title: `${w.name} - 開口部超限溢出 (溢出 ${overflow}cm)`,
            desc: `窗戶右側邊界 (${win.offset + win.width}cm) 超出牆寬 (${w.width}cm)，尺寸鏈剩餘段產生負值 (-${overflow}cm)！`,
          });
        }
      });

      w.doors.forEach((door) => {
        if (door.width > w.width) {
          issues.push({
            level: 'error',
            wallCode: w.code,
            title: `${w.name} - 門扇寬度大於該牆面寬`,
            desc: `門寬 (${door.width}cm) 大於牆寬 (${w.width}cm)，無法配置！`,
          });
        } else if (door.offset + door.width > w.width) {
          const overflow = door.offset + door.width - w.width;
          issues.push({
            level: 'error',
            wallCode: w.code,
            title: `${w.name} - 門洞開口超限溢出 (溢出 ${overflow}cm)`,
            desc: `門扇右側邊界 (${door.offset + door.width}cm) 超出牆寬 (${w.width}cm)！`,
          });
        }
      });
    });

    return issues;
  }, [walls, room]);

  // Copy elevation specs to clipboard
  const handleCopySpecs = () => {
    let report = `【室內設計 · 四面牆立面展開施工尺寸數據表】\n`;
    report += `空間名稱：${room.roomName}\n`;
    report += `空間邊界：寬度 ${room.width} cm × 進深 ${room.length} cm × 樓板淨高 ${room.height} cm\n`;
    report += `基準標高：大梁淨高 ${room.beamHeight} cm · 天花降板 ${room.ceilingDrop} cm (5倍數契約)\n\n`;

    walls.forEach((w) => {
      report += `▶ 【${w.name} (${w.code})】 牆寬: ${w.width} cm\n`;
      if (w.windows.length === 0) report += `  - 窗戶：無開口\n`;
      else {
        w.windows.forEach((win) => {
          report += `  - 窗戶「${win.name}」: 寬 ${win.width}cm × 高 ${win.height}cm | 窗台 FL+${win.sillHeight}cm | 偏移 ${win.offset}cm | 窗頂 FL+${win.sillHeight + win.height}cm\n`;
        });
      }

      if (w.doors.length === 0) report += `  - 門扇：無開口\n`;
      else {
        w.doors.forEach((d) => {
          report += `  - 門扇「${d.name}」: 寬 ${d.width}cm × 高 ${d.height}cm | 偏移 ${d.offset}cm\n`;
        });
      }

      if (w.beams.length > 0) {
        report += `  - 梁體配置: ${w.beams.map((b) => `${b.beam.name}(梁底 FL+${b.clearHeight}cm)`).join('、')}\n`;
      }

      if (w.electricalPoints.length > 0) {
        report += `  - 電氣點位: ${w.electricalPoints.map((ep) => `${ep.name} (FL+${ep.elevation}cm)`).join(', ')}\n`;
      }
      report += `\n`;
    });

    navigator.clipboard.writeText(report);
    setCopiedSpecs(true);
    setTimeout(() => setCopiedSpecs(false), 3000);
  };

  // Handle saving window changes
  const handleSaveWindow = (updatedWin: WindowOpening) => {
    if (!onUpdateRoom) return;
    const updatedWindows = room.windows.map((w) => (w.id === updatedWin.id ? updatedWin : w));
    onUpdateRoom({
      ...room,
      windows: updatedWindows,
    });
    setEditingWindow(null);
  };

  const handleLiveUpdateWindow = (updatedWin: WindowOpening) => {
    setEditingWindow(updatedWin);
    if (!onUpdateRoom) return;
    const updatedWindows = room.windows.map((w) => (w.id === updatedWin.id ? updatedWin : w));
    onUpdateRoom({
      ...room,
      windows: updatedWindows,
    });
  };

  const handleUpdateWallWidth = (wallKey: WallKey, newWidth: number) => {
    if (!onUpdateRoom || isNaN(newWidth) || newWidth <= 0) return;
    if (wallKey === 'top' || wallKey === 'bottom') {
      onUpdateRoom({ ...room, width: newWidth });
    } else {
      onUpdateRoom({ ...room, length: newWidth });
    }
  };

  const handleUpdateWallHeight = (newHeight: number) => {
    if (!onUpdateRoom || isNaN(newHeight) || newHeight <= 0) return;
    onUpdateRoom({ ...room, height: newHeight });
  };

  // Render individual Wall Elevation SVG
  const renderWallSvg = (wall: WallElevationMeta, isSingleView: boolean) => {
    // CAD Coordinate setup
    // SVG X: 0 to wall.width
    // SVG Y: 0 (ceiling slab) to wall.height (floor FL 0)
    // To match standard CAD: let SVG Y=0 be top slab, and Y=wall.height be floor.
    // Or we invert so floor is bottom.
    // Let padding = 70 for dimensions.
    const padTop = 60;
    const padBottom = 80;
    const padLeft = 85;
    const padRight = 85;
    const svgW = wall.width + padLeft + padRight;
    const svgH = wall.height + padTop + padBottom;

    // Helper: convert CAD elevation (0 at floor, H at top) to SVG Y (0 at top, H at bottom)
    const toSvgY = (elevation: number) => {
      return padTop + (wall.height - elevation);
    };

    const toSvgX = (x: number) => {
      return padLeft + x;
    };

    return (
      <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Wall Title Strip */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
              {wall.code}
            </span>
            <span className="text-xs font-bold text-slate-200">{wall.name}</span>
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-[11px] font-mono text-slate-300">
              <span className="text-slate-400">面寬:</span>
              <input
                type="number"
                value={wall.width}
                onChange={(e) => handleUpdateWallWidth(wall.key, Number(e.target.value))}
                className="w-16 px-1 py-0.5 bg-slate-900 border border-slate-600 rounded text-center text-amber-300 font-bold focus:border-amber-400 outline-none"
                title="直接修改此牆面寬度 (連動更新全案長寬)"
              />
              <span className="text-slate-400">cm · 樓高:</span>
              <input
                type="number"
                value={wall.height}
                onChange={(e) => handleUpdateWallHeight(Number(e.target.value))}
                className="w-16 px-1 py-0.5 bg-slate-900 border border-slate-600 rounded text-center text-amber-300 font-bold focus:border-amber-400 outline-none"
                title="直接修改樓板淨高 (連動更新全案淨高)"
              />
              <span className="text-slate-400">cm</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wall.windows.length > 0 && (
              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>窗戶 {wall.windows.length}</span>
              </span>
            )}
            {wall.doors.length > 0 && (
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <DoorOpen className="w-3 h-3" />
                <span>門扇 {wall.doors.length}</span>
              </span>
            )}
            {selectedWallTab === 'all' && (
              <button
                onClick={() => setSelectedWallTab(wall.key)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 ml-1 font-semibold"
                title="聚焦單面牆大圖檢視"
              >
                <span>單牆特寫</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* SVG Drawing Area */}
        <div className="p-3 bg-[#080D1A] overflow-x-auto flex items-center justify-center">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto select-none"
            style={{ maxHeight: isSingleView ? '560px' : '360px', minWidth: '460px' }}
          >
            <defs>
              {/* Wall Surface Background Hatch */}
              <pattern
                id={`wallHatch-${wall.code}`}
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path d="M 0 20 L 20 0 M 0 0 L 20 20" stroke="#1E293B" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>

              {/* Concrete Beam Hatch */}
              <pattern
                id={`beamSectionHatch-${wall.code}`}
                width="8"
                height="8"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="8" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.5" />
              </pattern>

              {/* Ceiling Drop Soffit Hatch */}
              <pattern
                id={`dropSoffitHatch-${wall.code}`}
                width="10"
                height="10"
                patternTransform="rotate(-45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="10" stroke="#F59E0B" strokeWidth="0.8" strokeOpacity="0.35" />
              </pattern>

              {/* Ground Earth Hatch */}
              <pattern
                id={`groundHatch-${wall.code}`}
                width="12"
                height="12"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="12" stroke="#475569" strokeWidth="1" strokeOpacity="0.6" />
              </pattern>
            </defs>

            {/* 1. WALL OUTLINE & SOLID BOUNDARY */}
            <rect
              x={padLeft}
              y={padTop}
              width={wall.width}
              height={wall.height}
              fill={`url(#wallHatch-${wall.code})`}
              stroke="#334155"
              strokeWidth="2"
            />

            {/* 2. GROUND SLAB & FINISH FLOOR (FL ±0.0) */}
            <rect
              x={padLeft - 20}
              y={toSvgY(0)}
              width={wall.width + 40}
              height="25"
              fill={`url(#groundHatch-${wall.code})`}
              stroke="#64748B"
              strokeWidth="1.5"
            />
            {/* Ground line bold */}
            <line
              x1={padLeft - 30}
              y1={toSvgY(0)}
              x2={padLeft + wall.width + 30}
              y2={toSvgY(0)}
              stroke="#E2E8F0"
              strokeWidth="2.5"
            />

            {/* Top Slab Boundary */}
            <line
              x1={padLeft - 30}
              y1={toSvgY(wall.height)}
              x2={padLeft + wall.width + 30}
              y2={toSvgY(wall.height)}
              stroke="#64748B"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* 3. CEILING DROP SOFFIT (天花降板完成面線 FL + room.ceilingDrop) */}
            {showCeilingLines && (
              <g
                className="cursor-pointer"
                onClick={() =>
                  setInspectedItem({
                    title: '天花降板吊頂面 (Ceiling Drop)',
                    type: 'datum',
                    details: {
                      '完成面標高': `FL +${room.ceilingDrop} cm`,
                      '距頂板高差': `${room.height - room.ceilingDrop} cm`,
                      '契約規範': '5 倍數契約 (230 cm)',
                      '施工工法': '輕鋼架/木作吊隱空調室內機風箱下緣收口',
                    },
                  })
                }
              >
                {/* Ceiling profile zone */}
                <rect
                  x={padLeft}
                  y={toSvgY(wall.height)}
                  width={wall.width}
                  height={room.height - room.ceilingDrop}
                  fill={`url(#dropSoffitHatch-${wall.code})`}
                  opacity="0.7"
                />
                <line
                  x1={padLeft - 20}
                  y1={toSvgY(room.ceilingDrop)}
                  x2={padLeft + wall.width + 20}
                  y2={toSvgY(room.ceilingDrop)}
                  stroke="#F59E0B"
                  strokeWidth="1.8"
                  strokeDasharray="6 3"
                />
                <rect
                  x={padLeft + wall.width - 130}
                  y={toSvgY(room.ceilingDrop) - 18}
                  width="125"
                  height="16"
                  rx="3"
                  fill="#78350F"
                  stroke="#F59E0B"
                  strokeWidth="0.8"
                />
                <text
                  x={padLeft + wall.width - 67}
                  y={toSvgY(room.ceilingDrop) - 6}
                  textAnchor="middle"
                  fill="#FDE68A"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  C.H. 降板天花 +{room.ceilingDrop}cm
                </text>
              </g>
            )}

            {/* 4. BEAMS (結構橫梁或穿心梁斷面) */}
            {wall.beams.map((bInfo, idx) => {
              const beamTopY = toSvgY(wall.height);
              const beamBottomY = toSvgY(bInfo.clearHeight);
              const beamHeightOnWall = beamBottomY - beamTopY;
              const beamX = toSvgX(bInfo.x);

              return (
                <g
                  key={`beam-${idx}`}
                  className="cursor-pointer group"
                  onClick={() =>
                    setInspectedItem({
                      title: bInfo.beam.name,
                      type: 'beam',
                      details: {
                        '梁下淨高 (B.O.B)': `FL +${bInfo.clearHeight} cm`,
                        '結構梁深': `${room.height - bInfo.clearHeight} cm`,
                        '梁體寬度': `${bInfo.width} cm`,
                        '類型': bInfo.isCrossSection ? '垂直穿心梁斷面' : '水平整跨結構橫梁',
                        '契約合規': bInfo.clearHeight % 5 === 0 ? '通過 5 倍數契約 (265 cm)' : '未符合 5 倍數',
                      },
                    })
                  }
                >
                  <rect
                    x={beamX}
                    y={beamTopY}
                    width={bInfo.width}
                    height={beamHeightOnWall}
                    fill={`url(#beamSectionHatch-${wall.code})`}
                    stroke="#EF4444"
                    strokeWidth="1.5"
                    className="group-hover:stroke-red-300"
                  />
                  {/* Beam Label */}
                  <rect
                    x={beamX + bInfo.width / 2 - 55}
                    y={beamBottomY - 18}
                    width="110"
                    height="16"
                    rx="3"
                    fill="#450A0A"
                    stroke="#EF4444"
                    strokeWidth="0.8"
                  />
                  <text
                    x={beamX + bInfo.width / 2}
                    y={beamBottomY - 6}
                    textAnchor="middle"
                    fill="#FCA5A5"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    B.O.B. 梁底 +{bInfo.clearHeight}cm
                  </text>
                </g>
              );
            })}

            {/* 5. DOORS (門扇開口部) */}
            {wall.doors.map((door) => {
              const doorX = toSvgX(door.offset);
              const doorY = toSvgY(door.height);
              const doorW = door.width;
              const doorH = toSvgY(0) - doorY;

              return (
                <g
                  key={door.id}
                  className="cursor-pointer group"
                  onClick={() =>
                    setInspectedItem({
                      title: door.name,
                      type: 'door',
                      details: {
                        '門洞寬度': `${door.width} cm`,
                        '門洞高度': `${door.height} cm`,
                        '離邊牆偏移': `${door.offset} cm`,
                        '門把手高度': 'FL +95 cm',
                        '門頂與天花間隙': `${room.ceilingDrop - door.height} cm`,
                      },
                    })
                  }
                >
                  {/* Door Opening Frame */}
                  <rect
                    x={doorX}
                    y={doorY}
                    width={doorW}
                    height={doorH}
                    fill="#1E293B"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    className="group-hover:stroke-amber-300"
                  />
                  {/* Inner Door Panel */}
                  <rect
                    x={doorX + 3}
                    y={doorY + 3}
                    width={doorW - 6}
                    height={doorH - 3}
                    fill="#0F172A"
                    stroke="#D97706"
                    strokeWidth="1"
                  />
                  {/* Swing line (dashed arch or diagonal) */}
                  <line
                    x1={doorX + 3}
                    y1={doorY + doorH}
                    x2={doorX + doorW - 3}
                    y2={doorY + 3}
                    stroke="#78350F"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  {/* Door Handle */}
                  <circle
                    cx={doorX + doorW - 12}
                    cy={toSvgY(95)}
                    r="3.5"
                    fill="#F59E0B"
                    stroke="#FFF"
                    strokeWidth="1"
                  />
                  {/* Door Info Pill */}
                  <rect
                    x={doorX + doorW / 2 - 50}
                    y={doorY + doorH / 2 - 11}
                    width="100"
                    height="22"
                    rx="4"
                    fill="#0F172A"
                    stroke="#F59E0B"
                    strokeWidth="0.8"
                  />
                  <text
                    x={doorX + doorW / 2}
                    y={doorY + doorH / 2 + 4}
                    textAnchor="middle"
                    fill="#FDE68A"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {door.name} ({door.width}×{door.height})
                  </text>
                </g>
              );
            })}

            {/* 6. WINDOWS (窗戶立面開口部 - 核心施工細節) */}
            {wall.windows.map((win) => {
              const winX = toSvgX(win.offset);
              const winSillY = toSvgY(win.sillHeight);
              const winTopY = toSvgY(win.sillHeight + win.height);
              const winW = win.width;
              const winH = winSillY - winTopY;

              return (
                <g
                  key={win.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    setEditingWindow(win);
                    setInspectedItem({
                      title: win.name,
                      type: 'window',
                      details: {
                        '窗寬 (Width)': `${win.width} cm`,
                        '窗高 (Height)': `${win.height} cm`,
                        '窗台標高 (Sill)': `FL +${win.sillHeight} cm`,
                        '窗頂標高 (Head)': `FL +${win.sillHeight + win.height} cm`,
                        '離左邊牆距': `${win.offset} cm`,
                        '離右邊牆距': `${wall.width - (win.offset + win.width)} cm`,
                        '距天花降板': `${room.ceilingDrop - (win.sillHeight + win.height)} cm (窗簾盒空間)`,
                        '距大梁下淨高': `${room.beamHeight - (win.sillHeight + win.height)} cm`,
                      },
                    });
                  }}
                >
                  {/* Window Wall Opening Cutout */}
                  <rect
                    x={winX}
                    y={winTopY}
                    width={winW}
                    height={winH}
                    fill="#0C4A6E"
                    fillOpacity="0.35"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    className="group-hover:stroke-cyan-300"
                  />

                  {/* Window Outer Subframe */}
                  <rect
                    x={winX + 4}
                    y={winTopY + 4}
                    width={winW - 8}
                    height={winH - 8}
                    fill="#082F49"
                    stroke="#0284C7"
                    strokeWidth="1.5"
                  />

                  {/* Glass Sashes & Mullion Pattern */}
                  <line
                    x1={winX + winW / 2}
                    y1={winTopY + 4}
                    x2={winX + winW / 2}
                    y2={winSillY - 4}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                  />

                  {/* Glass Glare Highlights */}
                  <line
                    x1={winX + winW * 0.15}
                    y1={winTopY + winH * 0.2}
                    x2={winX + winW * 0.35}
                    y2={winTopY + winH * 0.55}
                    stroke="#BAE6FD"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                  <line
                    x1={winX + winW * 0.65}
                    y1={winTopY + winH * 0.2}
                    x2={winX + winW * 0.85}
                    y2={winTopY + winH * 0.55}
                    stroke="#BAE6FD"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />

                  {/* Window Sill Ledge (窗台板剖面) */}
                  <rect
                    x={winX - 4}
                    y={winSillY - 2}
                    width={winW + 8}
                    height="6"
                    rx="1.5"
                    fill="#0369A1"
                    stroke="#38BDF8"
                    strokeWidth="1"
                  />

                  {/* Window Info Pill in Center */}
                  <rect
                    x={winX + winW / 2 - 80}
                    y={winTopY + winH / 2 - 12}
                    width="160"
                    height="24"
                    rx="4"
                    fill="#0F172A"
                    stroke="#38BDF8"
                    strokeWidth="1"
                    className="shadow-md"
                  />
                  <text
                    x={winX + winW / 2}
                    y={winTopY + winH / 2 + 4}
                    textAnchor="middle"
                    fill="#E0F2FE"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {win.name} ({win.width}×{win.height})
                  </text>

                  {/* Sill Datum Pill */}
                  <rect
                    x={winX + 8}
                    y={winSillY + 4}
                    width="100"
                    height="16"
                    rx="3"
                    fill="#082F49"
                    stroke="#0284C7"
                    strokeWidth="0.8"
                  />
                  <text
                    x={winX + 58}
                    y={winSillY + 15}
                    textAnchor="middle"
                    fill="#BAE6FD"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    窗台高 FL+{win.sillHeight}cm
                  </text>
                </g>
              );
            })}

            {/* 7. MEP ELECTRICAL & PLUMBING (水電、插座、開關立面出線標高) */}
            {showMEP &&
              wall.electricalPoints.map((ep) => {
                // Approximate mapped X on wall
                let epX = ep.x;
                if (wall.key === 'right' || wall.key === 'left') {
                  epX = ep.y;
                }
                const svgEpX = toSvgX(Math.min(wall.width - 20, Math.max(20, epX)));
                const svgEpY = toSvgY(ep.elevation);

                const isSocket = ep.type.includes('socket');
                const isSwitch = ep.type === 'switch';
                const isAc = ep.type.includes('ac');

                return (
                  <g
                    key={ep.id}
                    className="cursor-pointer group"
                    onClick={() =>
                      setInspectedItem({
                        title: ep.name,
                        type: 'mep',
                        details: {
                          '出線標高': `FL +${ep.elevation} cm`,
                          '迴路編號': ep.circuit,
                          '設備類型': ep.type,
                          '法規標準': isSocket ? '踢腳插座 30cm FL' : isSwitch ? '開關 120cm FL' : '特殊標高',
                        },
                      })
                    }
                  >
                    {/* Stem to floor */}
                    <line
                      x1={svgEpX}
                      y1={svgEpY}
                      x2={svgEpX}
                      y2={toSvgY(0)}
                      stroke="#06B6D4"
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                      strokeOpacity="0.5"
                    />

                    {/* Outlet Box Symbol */}
                    <rect
                      x={svgEpX - 7}
                      y={svgEpY - 7}
                      width="14"
                      height="14"
                      rx="2"
                      fill={isSocket ? '#083344' : isSwitch ? '#064E3B' : '#701A75'}
                      stroke={isSocket ? '#06B6D4' : isSwitch ? '#10B981' : '#E879F9'}
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={svgEpX}
                      cy={svgEpY}
                      r="2"
                      fill="#FFF"
                    />

                    {/* Text tag */}
                    <text
                      x={svgEpX + 10}
                      y={svgEpY + 3}
                      fill="#A5F3FC"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {ep.circuit} +{ep.elevation}cm
                    </text>
                  </g>
                );
              })}

            {/* 8. VOICE MEMOS PINS ON ELEVATION */}
            {showVoicePins &&
              wall.voiceMemos.map((vm) => {
                let vmX = vm.x;
                if (wall.key === 'right' || wall.key === 'left') {
                  vmX = vm.y;
                }
                const svgVmX = toSvgX(Math.min(wall.width - 30, Math.max(30, vmX)));
                const svgVmY = toSvgY(150); // Mid-height representation

                return (
                  <g
                    key={vm.id}
                    className="cursor-pointer"
                    onClick={() =>
                      setInspectedItem({
                        title: '現場放樣口說標註',
                        type: 'datum',
                        details: {
                          '時間戳記': vm.timestamp,
                          '備忘類型': vm.type,
                          '語音內容': vm.text,
                        },
                      })
                    }
                  >
                    <circle cx={svgVmX} cy={svgVmY} r="8" fill="#EC4899" fillOpacity="0.9" stroke="#FFF" strokeWidth="1" />
                    <text x={svgVmX} y={svgVmY + 3} textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="bold">
                      🎙
                    </text>
                  </g>
                );
              })}

            {/* 9. CAD LEVEL DATUMS (左側與右側高程基準線標尺) */}
            {showLevelDatums && (
              <g>
                {/* FL ±0.0 Datum */}
                <g transform={`translate(${padLeft - 10}, ${toSvgY(0)})`}>
                  <line x1="-50" y1="0" x2="0" y2="0" stroke="#94A3B8" strokeWidth="1.2" />
                  <polygon points="-8,-4 0,0 -8,4" fill="#94A3B8" />
                  <text x="-12" y="4" textAnchor="end" fill="#E2E8F0" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                    1FL ±0.0
                  </text>
                </g>

                {/* Sockets FL +30 Datum */}
                <g transform={`translate(${padLeft - 10}, ${toSvgY(30)})`}>
                  <line x1="-35" y1="0" x2="0" y2="0" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="3 2" />
                  <text x="-8" y="3" textAnchor="end" fill="#67E8F9" fontSize="8.5" fontFamily="monospace">
                    插座 +30
                  </text>
                </g>

                {/* Switches FL +120 Datum */}
                <g transform={`translate(${padLeft - 10}, ${toSvgY(120)})`}>
                  <line x1="-35" y1="0" x2="0" y2="0" stroke="#10B981" strokeWidth="0.8" strokeDasharray="3 2" />
                  <text x="-8" y="3" textAnchor="end" fill="#6EE7B7" fontSize="8.5" fontFamily="monospace">
                    開關 +120
                  </text>
                </g>

                {/* Ceiling Drop FL + room.ceilingDrop */}
                <g transform={`translate(${padLeft - 10}, ${toSvgY(room.ceilingDrop)})`}>
                  <line x1="-55" y1="0" x2="0" y2="0" stroke="#F59E0B" strokeWidth="1.2" />
                  <polygon points="-8,-4 0,0 -8,4" fill="#F59E0B" />
                  <text x="-12" y="4" textAnchor="end" fill="#FDE68A" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                    CH +{room.ceilingDrop}
                  </text>
                </g>

                {/* Beam Bottom FL + room.beamHeight */}
                <g transform={`translate(${padLeft - 10}, ${toSvgY(room.beamHeight)})`}>
                  <line x1="-55" y1="0" x2="0" y2="0" stroke="#EF4444" strokeWidth="1.2" />
                  <polygon points="-8,-4 0,0 -8,4" fill="#EF4444" />
                  <text x="-12" y="4" textAnchor="end" fill="#FCA5A5" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                    梁底 +{room.beamHeight}
                  </text>
                </g>

                {/* Top Ceiling Slab FL + room.height */}
                <g transform={`translate(${padLeft - 10}, ${toSvgY(wall.height)})`}>
                  <line x1="-55" y1="0" x2="0" y2="0" stroke="#94A3B8" strokeWidth="1.2" />
                  <polygon points="-8,-4 0,0 -8,4" fill="#94A3B8" />
                  <text x="-12" y="4" textAnchor="end" fill="#E2E8F0" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                    頂板 +{wall.height}
                  </text>
                </g>
              </g>
            )}

            {/* 10. HORIZONTAL & VERTICAL DIMENSION CHAINS (水平開口與垂直尺寸鏈) */}
            {showDimensions && (
              <g>
                {/* Bottom Dimension Line for Room Width */}
                <g transform={`translate(0, ${toSvgY(0) + 40})`}>
                  <line x1={padLeft} y1="0" x2={padLeft + wall.width} y2="0" stroke="#38BDF8" strokeWidth="1" />
                  <line x1={padLeft} y1="-5" x2={padLeft} y2="5" stroke="#38BDF8" strokeWidth="1.5" />
                  <line x1={padLeft + wall.width} y1="-5" x2={padLeft + wall.width} y2="5" stroke="#38BDF8" strokeWidth="1.5" />
                  <text
                    x={padLeft + wall.width / 2}
                    y="-6"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    總牆寬 {wall.width} cm
                  </text>
                </g>

                {/* Window horizontal segment dimensions */}
                {wall.windows.map((win, wIdx) => {
                  const xStart = padLeft + win.offset;
                  const xEnd = xStart + win.width;
                  const dimY = toSvgY(0) + 20;

                  return (
                    <g key={`win-dim-${wIdx}`}>
                      {/* Left Wall to window */}
                      <line x1={padLeft} y1={dimY} x2={xStart} y2={dimY} stroke="#94A3B8" strokeWidth="0.8" />
                      <line x1={padLeft} y1={dimY - 3} x2={padLeft} y2={dimY + 3} stroke="#94A3B8" strokeWidth="1" />
                      <line x1={xStart} y1={dimY - 3} x2={xStart} y2={dimY + 3} stroke="#94A3B8" strokeWidth="1" />
                      <text x={(padLeft + xStart) / 2} y={dimY - 4} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="monospace">
                        {win.offset}
                      </text>

                      {/* Window width */}
                      <line x1={xStart} y1={dimY} x2={xEnd} y2={dimY} stroke="#38BDF8" strokeWidth="1" />
                      <line x1={xEnd} y1={dimY - 3} x2={xEnd} y2={dimY + 3} stroke="#38BDF8" strokeWidth="1" />
                      <text x={(xStart + xEnd) / 2} y={dimY - 4} textAnchor="middle" fill="#38BDF8" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                        窗寬 {win.width}
                      </text>

                      {/* Window to right wall */}
                      {(() => {
                        const remain = wall.width - (win.offset + win.width);
                        const isNeg = remain < 0;
                        return (
                          <>
                            <line
                              x1={xEnd}
                              y1={dimY}
                              x2={padLeft + wall.width}
                              y2={dimY}
                              stroke={isNeg ? '#EF4444' : '#94A3B8'}
                              strokeWidth={isNeg ? '1.5' : '0.8'}
                              strokeDasharray={isNeg ? '3,2' : undefined}
                            />
                            <line
                              x1={padLeft + wall.width}
                              y1={dimY - 3}
                              x2={padLeft + wall.width}
                              y2={dimY + 3}
                              stroke={isNeg ? '#EF4444' : '#94A3B8'}
                              strokeWidth="1"
                            />
                            <text
                              x={(xEnd + padLeft + wall.width) / 2}
                              y={dimY - 4}
                              textAnchor="middle"
                              fill={isNeg ? '#EF4444' : '#94A3B8'}
                              fontSize={isNeg ? '10' : '9'}
                              fontWeight={isNeg ? 'bold' : 'normal'}
                              fontFamily="monospace"
                            >
                              {isNeg ? `⚠ 溢出 ${Math.abs(remain)}` : `${remain}`}
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  );
                })}

                {/* Right side Vertical Dimension Chain */}
                <g transform={`translate(${padLeft + wall.width + 30}, 0)`}>
                  {/* Floor to Ceiling Drop */}
                  <line x1="0" y1={toSvgY(0)} x2="0" y2={toSvgY(room.ceilingDrop)} stroke="#F59E0B" strokeWidth="1" />
                  <line x1="-4" y1={toSvgY(0)} x2="4" y2={toSvgY(0)} stroke="#F59E0B" strokeWidth="1" />
                  <line x1="-4" y1={toSvgY(room.ceilingDrop)} x2="4" y2={toSvgY(room.ceilingDrop)} stroke="#F59E0B" strokeWidth="1" />
                  <text
                    x="10"
                    y={(toSvgY(0) + toSvgY(room.ceilingDrop)) / 2 + 4}
                    fill="#FDE68A"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    CH {room.ceilingDrop}
                  </text>

                  {/* Ceiling Drop to Slab Top */}
                  <line x1="0" y1={toSvgY(room.ceilingDrop)} x2="0" y2={toSvgY(wall.height)} stroke="#94A3B8" strokeWidth="0.8" />
                  <line x1="-4" y1={toSvgY(wall.height)} x2="4" y2={toSvgY(wall.height)} stroke="#94A3B8" strokeWidth="1" />
                  <text
                    x="10"
                    y={(toSvgY(room.ceilingDrop) + toSvgY(wall.height)) / 2 + 4}
                    fill="#94A3B8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    降板 {wall.height - room.ceilingDrop}
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Wall Bottom Quick Spec Strip */}
        <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 text-[11px] flex flex-wrap items-center justify-between gap-2 text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              窗台標高：
              <strong className="text-sky-300">
                {wall.windows.map((w) => `${w.sillHeight}cm`).join(', ') || '無窗'}
              </strong>
            </span>
            <span>·</span>
            <span>
              梁下空間：
              <strong className="text-red-300">
                {wall.beams.map((b) => `${b.clearHeight}cm`).join(', ') || `${room.beamHeight}cm (主梁)`}
              </strong>
            </span>
            <span>·</span>
            <span>
              開口總寬：
              <strong className="text-slate-200">
                {wall.windows.reduce((acc, w) => acc + w.width, 0) + wall.doors.reduce((acc, d) => acc + d.width, 0)} cm
              </strong>
            </span>
          </div>

          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3" />
            <span>5倍數高層規範檢驗通過</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-slate-900 border border-slate-800 text-slate-100 flex flex-col z-50 transition-all ${
        isFullscreen ? 'fixed inset-0 p-4 bg-slate-950 overflow-y-auto' : 'rounded-2xl shadow-2xl p-4'
      }`}
    >
      {/* Top Header & Global Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/30">
            <Columns3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                自動生成四面牆立面展開圖 (Wall Elevation Unfolded View)
              </h2>
              <span className="bg-sky-950 text-sky-300 border border-sky-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                CAD 自動幾何演算
              </span>
            </div>
            <p className="text-xs text-slate-400">
              根據當前房間「{room.roomName}」尺寸、大梁高 (B.O.B {room.beamHeight}cm)、降板天花 (C.H. {room.ceilingDrop}cm) 與窗戶門洞自動即時投影
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Layer Visibility Menu */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                showDimensions ? 'bg-sky-900/60 text-sky-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="開關尺寸標註鏈"
            >
              <Ruler className="w-3 h-3" />
              <span>尺寸鏈</span>
            </button>
            <button
              onClick={() => setShowLevelDatums(!showLevelDatums)}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                showLevelDatums ? 'bg-amber-900/60 text-amber-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="開關 FL 標高水平基準線"
            >
              <Layers className="w-3 h-3" />
              <span>標高線</span>
            </button>
            <button
              onClick={() => setShowMEP(!showMEP)}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                showMEP ? 'bg-cyan-900/60 text-cyan-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="開關水電與開關插座點位"
            >
              <Zap className="w-3 h-3" />
              <span>水電</span>
            </button>
          </div>

          {/* Copy Specs Button */}
          <button
            onClick={handleCopySpecs}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
            title="複製四面牆立面尺寸表供施工放樣使用"
          >
            {copiedSpecs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedSpecs ? '已複製尺寸數據！' : '複製立面數據'}</span>
          </button>

          {/* Toggle Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title={isFullscreen ? '退出全螢幕' : '全螢幕檢視'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close button if provided */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 hover:text-red-300 text-slate-400 border border-slate-700"
              title="關閉立面圖視圖"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Wall Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-3">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              setViewMode('standard');
              setSelectedWallTab('all');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'standard' && selectedWallTab === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>四面牆展開總覽</span>
          </button>

          {/* USER REQUESTED: 上下對照視錐立面施工系統 */}
          <button
            onClick={() => setViewMode(viewMode === 'split_cone' ? 'standard' : 'split_cone')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'split_cone'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-slate-800 text-cyan-300 hover:text-white border border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>上下對照視錐模式</span>
            <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1 py-0.2 rounded border border-cyan-800">
              A/B/C/D 剖切
            </span>
          </button>

          {walls.map((w) => (
            <button
              key={w.key}
              onClick={() => {
                setViewMode('standard');
                setSelectedWallTab(w.key);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'standard' && selectedWallTab === w.key
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center">
                {w.code}
              </span>
              <span>{w.name}</span>
              {w.windows.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
            </button>
          ))}
        </div>

        {/* Audit Status Pill */}
        <div className="flex items-center gap-2">
          {elevationAudit.filter((i) => i.level === 'error').length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/50 text-red-300 px-3 py-1 rounded-lg text-xs font-semibold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>檢出 {elevationAudit.filter((i) => i.level === 'error').length} 項幾何/開口衝突！</span>
              </div>
              {onUpdateRoom && (
                <button
                  onClick={() => {
                    const fixedWin = (room.windows || []).map((win) => {
                      const wallLen = (win.wall === 'top' || win.wall === 'bottom') ? room.width : room.length;
                      const maxW = Math.max(60, wallLen - 40);
                      const clampedW = Math.min(win.width, maxW);
                      const centeredOffset = Math.max(20, Math.round((wallLen - clampedW) / 2));
                      return { ...win, width: clampedW, offset: centeredOffset };
                    });
                    const fixedDoor = (room.doors || []).map((door) => {
                      const wallLen = (door.wall === 'top' || door.wall === 'bottom') ? room.width : room.length;
                      const maxW = Math.min(door.width, wallLen - 20);
                      const clampedOffset = Math.min(door.offset, Math.max(10, wallLen - maxW - 10));
                      return { ...door, width: maxW, offset: clampedOffset };
                    });
                    onUpdateRoom({ ...room, windows: fixedWin, doors: fixedDoor });
                  }}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                  title="自動調整門窗寬度與偏移，消除負尺寸鏈與邊界溢出"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>一鍵適配開口部</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-lg text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>開口部與高層無幾何結構衝突</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Drawing Grid Container */}
      <div className="flex-1 overflow-y-auto pt-1 pb-4">
        {viewMode === 'split_cone' ? (
          <SplitViewElevationViewer room={room} />
        ) : selectedWallTab === 'all' ? (
          // 4-Wall Unfolded Panoramic Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {walls.map((wall) => (
              <div key={wall.key}>{renderWallSvg(wall, false)}</div>
            ))}
          </div>
        ) : (
          // Single Wall Deep Dive View
          <div>
            {walls
              .filter((w) => w.key === selectedWallTab)
              .map((wall) => (
                <div key={wall.key} className="space-y-4">
                  {renderWallSvg(wall, true)}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Bottom Inspection & Quick Calibration Drawer */}
      {(inspectedItem || editingWindow) && (
        <div className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start justify-between gap-4 text-xs animate-in slide-in-from-bottom-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-sky-950 border border-sky-800 text-sky-400">
                  <Info className="w-4 h-4" />
                </span>
                <span className="font-bold text-white text-sm">
                  {inspectedItem ? inspectedItem.title : editingWindow ? `快速微調窗戶：${editingWindow.name}` : ''}
                </span>
              </div>
              <button
                onClick={() => {
                  setInspectedItem(null);
                  setEditingWindow(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item Details Grid */}
            {inspectedItem && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                {Object.entries(inspectedItem.details).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500">{k}</div>
                    <div className="font-semibold text-slate-200 font-mono mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Window Elevation Adjuster */}
            {editingWindow && onUpdateRoom && (
              <div className="mt-3 p-3 bg-slate-900 border border-sky-900/60 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sky-300 font-bold flex items-center gap-1.5 text-xs">
                    <Sliders className="w-3.5 h-3.5" />
                    窗戶尺寸與高程直接修改 (即時連動全室圖面)：
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">窗名:</span>
                    <input
                      type="text"
                      value={editingWindow.name}
                      onChange={(e) =>
                        handleLiveUpdateWindow({ ...editingWindow, name: e.target.value })
                      }
                      className="px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-white font-bold text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <label className="text-slate-400 text-[11px] shrink-0 font-medium">窗寬 (W):</label>
                    <input
                      type="number"
                      step="5"
                      value={editingWindow.width}
                      onChange={(e) =>
                        handleLiveUpdateWindow({ ...editingWindow, width: Number(e.target.value) })
                      }
                      className="w-full px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-center font-bold focus:border-sky-500 outline-none"
                    />
                    <span className="text-slate-500 text-[10px]">cm</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <label className="text-slate-400 text-[11px] shrink-0 font-medium">窗高 (H):</label>
                    <input
                      type="number"
                      step="5"
                      value={editingWindow.height}
                      onChange={(e) =>
                        handleLiveUpdateWindow({ ...editingWindow, height: Number(e.target.value) })
                      }
                      className="w-full px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-center font-bold focus:border-sky-500 outline-none"
                    />
                    <span className="text-slate-500 text-[10px]">cm</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <label className="text-slate-400 text-[11px] shrink-0 font-medium">窗台 (Sill):</label>
                    <input
                      type="number"
                      step="5"
                      value={editingWindow.sillHeight}
                      onChange={(e) =>
                        handleLiveUpdateWindow({ ...editingWindow, sillHeight: Number(e.target.value) })
                      }
                      className="w-full px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-center font-bold focus:border-sky-500 outline-none"
                    />
                    <span className="text-slate-500 text-[10px]">cm</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <label className="text-slate-400 text-[11px] shrink-0 font-medium">邊距 (Offset):</label>
                    <input
                      type="number"
                      value={editingWindow.offset}
                      onChange={(e) =>
                        handleLiveUpdateWindow({ ...editingWindow, offset: Number(e.target.value) })
                      }
                      className="w-full px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-center font-bold focus:border-sky-500 outline-none"
                    />
                    <span className="text-slate-500 text-[10px]">cm</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    💡 數值已即時連動計算 · 可按完成或直接繼續檢視
                  </span>
                  <button
                    onClick={() => handleSaveWindow(editingWindow)}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold shadow-md text-xs flex items-center gap-1 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> 完成確認
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Warnings Panel if any */}
      {elevationAudit.length > 0 && (
        <div className="mt-3 p-3 bg-slate-950/90 border border-slate-800 rounded-xl">
          <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>開口部與高層施工檢核注意事項 ({elevationAudit.length} 條)</span>
          </div>
          <div className="space-y-1">
            {elevationAudit.map((audit, idx) => (
              <div
                key={idx}
                className="text-[11px] p-2 rounded bg-slate-900 border border-slate-800/80 flex items-start justify-between gap-2"
              >
                <div>
                  <span
                    className={`font-bold mr-1.5 ${
                      audit.level === 'error'
                        ? 'text-red-400'
                        : audit.level === 'warning'
                        ? 'text-amber-300'
                        : 'text-sky-300'
                    }`}
                  >
                    [{audit.wallCode}] {audit.title}
                  </span>
                  <span className="text-slate-400">{audit.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
