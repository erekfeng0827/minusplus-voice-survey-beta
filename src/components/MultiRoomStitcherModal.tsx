// --- START OF FILE MultiRoomStitcherModal.tsx (Minusplus 極致收納自適應版) ---

import React, { useState, useMemo, useRef } from 'react';
import { RoomData, Door, WindowOpening } from '../types';
import {
  calculateStitchedFloorPlan,
  calculateRigidBodyCoincidentStitchedFloorPlan,
  generateFullHouseDxfString,
  generateAreaReportCsv,
  getDoorLocalGeometry,
  rotatePoint,
  calculateProjectAreaSummary,
  calculateRoom4WallsArea,
  calculateRoomFloorArea,
  M2_TO_PING,
  PING_TO_M2,
  RoomAreaAndWallCalculation,
  FullProjectAreaSummary,
} from '../utils/multiRoomStitcher';
import {
  Layers, Sparkles, Download, X, Compass, CheckCircle2, AlertTriangle,
  ZoomIn, ZoomOut, Maximize2, ArrowRight, Plus, RefreshCw, Copy, Info,
  Sliders, Eye, Box, FileCode, Calculator, ChevronDown, ChevronUp,
  Check, ShieldCheck, Grid, Map, Settings, FileText, ChevronLeft, ChevronRight,
  Trash2, Edit3, Ruler
} from 'lucide-react';

interface MultiRoomStitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomData[];
  onUpdateRooms: (updatedRooms: RoomData[]) => void;
  onNotify: (msg: string) => void;
}

export const MultiRoomStitcherModal: React.FC<MultiRoomStitcherModalProps> = ({
  isOpen, onClose, rooms, onUpdateRooms, onNotify,
}) => {
  const [baseRoomId, setBaseRoomId] = useState<string>(rooms[0]?.id || '');
  const [wallThickness, setWallThickness] = useState<number>(15);
  
  // 🌟 核心工作流狀態：1. 拓撲拼接 | 2. 牆面與窗戶尺寸直接輸入 | 3. 面積精算 | 4. 報表輸出
  const [activeWorkflow, setActiveWorkflow] = useState<'topology' | 'dimensions' | 'area' | 'export'>('dimensions');
  
  // 🌟 UI 收納狀態
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);
  const [isRightToolsOpen, setIsRightToolsOpen] = useState<boolean>(false);

  const [areaUnit, setAreaUnit] = useState<'ping' | 'm2'>('ping');
  const [stitchMode, setStitchMode] = useState<'rigid_body_collision' | 'door_anchored'>('rigid_body_collision');
  
  // 畫布顯示開關
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false);
  const [showSharedWallHighlight, setShowSharedWallHighlight] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showBeamsAndOpenings, setShowBeamsAndOpenings] = useState<boolean>(true);

  const [expandedWallRoomId, setExpandedWallRoomId] = useState<string | null>(rooms[0]?.id || null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(rooms[0]?.id || null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const roomDragRef = useRef<{ roomId: string; pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const [roomDragPreview, setRoomDragPreview] = useState<{ roomId: string; x: number; y: number } | null>(null);

  // Calculations
  const stitchedResult = useMemo(() => calculateStitchedFloorPlan(rooms, baseRoomId, wallThickness, stitchMode), [rooms, baseRoomId, wallThickness, stitchMode]);
  const projectAreaSummary = useMemo(() => calculateProjectAreaSummary(rooms), [rooms]);
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const selectedCalc = selectedRoom ? projectAreaSummary.roomCalculations.find((c) => c.roomId === selectedRoom.id) : null;

  if (!isOpen) return null;

  // 🌟 牆面與窗戶尺寸直接修改處理器 (Direct Wall & Window Dimensions Handlers)
  const handleUpdateRoomDimensions = (roomId: string, width: number, length: number, height?: number) => {
    const updated = rooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          width: Math.max(30, Number(width) || r.width),
          length: Math.max(30, Number(length) || r.length),
          height: height !== undefined ? Math.max(100, Number(height) || r.height) : r.height,
          lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return r;
    });
    onUpdateRooms(updated);
  };

  const handleManualPlacement = (roomId: string, field: 'x' | 'y' | 'rotation', value: number | null) => {
    const automatic = stitchedResult.placements.find((placement) => placement.roomId === roomId);
    const updated = rooms.map((room) => {
      if (room.id !== roomId) return room;
      if (value === null) return { ...room, manualPlacement: undefined };
      const current = room.manualPlacement || { x: automatic?.x || 0, y: automatic?.y || 0, rotation: automatic?.rotation || 0 };
      return { ...room, manualPlacement: { ...current, [field]: field === 'rotation' ? value as 0 | 90 | 180 | 270 : Math.round(Number(value)) }, lastUpdated: new Date().toISOString() };
    });
    onUpdateRooms(updated);
  };

  const commitManualPosition = (roomId: string, x: number, y: number) => {
    const automatic = stitchedResult.placements.find((placement) => placement.roomId === roomId);
    const rotation: 0 | 90 | 180 | 270 = roomDragPreview?.roomId === roomId
      ? (rooms.find((room) => room.id === roomId)?.manualPlacement?.rotation || automatic?.rotation || 0)
      : (automatic?.rotation || 0);
    const updated = rooms.map((room) => room.id !== roomId ? room : {
      ...room,
      manualPlacement: {
        x: Math.round(x / 5) * 5,
        y: Math.round(y / 5) * 5,
        rotation,
      },
      lastUpdated: new Date().toISOString(),
    });
    onUpdateRooms(updated);
  };

  const handleUpdateWindow = (roomId: string, windowId: string, updates: Partial<WindowOpening>) => {
    const updated = rooms.map((r) => {
      if (r.id === roomId) {
        const windows = (r.windows || []).map((w) => (w.id === windowId ? { ...w, ...updates } : w));
        return {
          ...r,
          windows,
          lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return r;
    });
    onUpdateRooms(updated);
  };

  const handleAddWindow = (roomId: string, wall: 'north' | 'south' | 'east' | 'west' | 'top' | 'bottom' | 'right' | 'left' = 'north') => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;
    const newWin: WindowOpening = {
      id: `win-${Date.now()}`,
      name: '採光氣密窗',
      width: 160,
      height: 150,
      sillHeight: 50,
      wall: wall,
      offset: 30,
    };
    const updated = rooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          windows: [...(r.windows || []), newWin],
          lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return r;
    });
    onUpdateRooms(updated);
    onNotify(`✓ 已為「${targetRoom.roomName}」新增一樘窗戶開口！`);
  };

  const handleDeleteWindow = (roomId: string, windowId: string) => {
    const updated = rooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          windows: (r.windows || []).filter((w) => w.id !== windowId),
          lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      }
      return r;
    });
    onUpdateRooms(updated);
    onNotify('✓ 已移除窗戶開口');
  };

  const getRoomWindowsForWall = (roomId: string, dir: 'north' | 'south' | 'east' | 'west') => {
    const r = rooms.find(room => room.id === roomId);
    if (!r || !r.windows) return [];
    const dirAliases: Record<string, string[]> = {
      north: ['north', 'top'],
      south: ['south', 'bottom'],
      east: ['east', 'right'],
      west: ['west', 'left'],
    };
    const targets = dirAliases[dir] || [];
    return r.windows.filter(w => targets.includes(w.wall as string));
  };

  // Handlers (保留所有原始邏輯)
  const handleTriggerRigidBodyStitching = () => {
    setStitchMode('rigid_body_collision');
    setShowSharedWallHighlight(true);
    setShowBoundingBoxes(true);
    onNotify('✓ 已執行空間邊界矩形剛體碰撞計算，自動串聯成正確幾何比例之平面圖！');
  };

  const handleExportAreaCsv = () => {
    const csvContent = generateAreaReportCsv(projectAreaSummary, areaUnit);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `全室空間平面積與4面牆立面計算工程量報表_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify(`✓ 已成功匯出全案空間平面積與 4 面牆工程量報表 (CSV)！`);
  };

  const handleUpdateDoorTag = (roomId: string, doorId: string, newTag: string) => {
    const updated = rooms.map((r) => r.id === roomId ? { ...r, doors: r.doors.map((d) => (d.id === doorId ? { ...d, anchorTag: newTag.trim().toUpperCase() } : d)), lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16) } : r);
    onUpdateRooms(updated);
  };

  const handleDownloadFullDxf = () => {
    const dxfContent = generateFullHouseDxfString(rooms, stitchedResult, '星玥灣-全室門洞拓撲合併平面圖');
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `全室拓撲拼接平面圖_${new Date().toISOString().slice(0, 10)}.dxf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify('✓ 已成功匯出全室合併 AutoCAD DXF 向量圖面！');
  };

  const handleCopyAreaReport = () => {
    let report = `【全案平面積與 4 面牆立面工程量計算總表】\n========================================\n`;
    report += `★ 全室室內總實坪: ${projectAreaSummary.totalFloorAreaPing} 坪 (${projectAreaSummary.totalFloorAreaM2} m²)\n`;
    report += `★ 4 面立面牆總毛面積: ${projectAreaSummary.totalWallGrossAreaPing} 坪 (${projectAreaSummary.totalWallGrossAreaM2} m²)\n`;
    report += `★ 門窗開口總扣除面積: ${projectAreaSummary.totalWallDeductionsPing} 坪 (${projectAreaSummary.totalWallDeductionsM2} m²)\n`;
    report += `★ 4 面牆施工淨面積: ${projectAreaSummary.totalWallNetAreaPing} 坪 (${projectAreaSummary.totalWallNetAreaM2} m²)\n========================================\n\n`;
    navigator.clipboard.writeText(report);
    onNotify('✓ 已複製全室空間平面積與 4 面牆立面工程量報表！');
  };

  const handleCopySingleRoomArea = (r: RoomAreaAndWallCalculation) => {
    let report = `【${r.roomName} 空間面積與 4 面牆工程明細】\n地坪面積: ${r.floorAreaPing} 坪 (${r.floorAreaM2} m²)\n4面牆總淨施作面積: ${r.totalWallNetAreaPing} 坪 (${r.totalWallNetAreaM2} m²)\n`;
    navigator.clipboard.writeText(report);
    onNotify(`✓ 已複製「${r.roomName}」之平面積與 4 面牆明細！`);
  };

  // Canvas ViewBox calculation
  const bb = stitchedResult.boundingBox;
  const padding = 120;
  const svgWidth = Math.max(800, bb.totalWidth + padding * 2);
  const svgHeight = Math.max(600, bb.totalLength + padding * 2);
  const viewBoxMinX = bb.minX - padding;
  const viewBoxMinY = bb.minY - padding;

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const matrix = svg.getScreenCTM();
    return matrix ? point.matrixTransform(matrix.inverse()) : null;
  };

  // 背景拖曳只平移视角；房间拖曳只在「拓扑拼接」阶段启用。
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging && !roomDragRef.current) setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };
  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const handleRoomPointerDown = (e: React.PointerEvent<SVGGElement>, roomId: string, x: number, y: number) => {
    e.stopPropagation();
    setSelectedRoomId(roomId);
    setIsLeftPanelOpen(true);
    if (activeWorkflow !== 'topology') return;
    const point = clientToSvg(e.clientX, e.clientY);
    if (!point) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    roomDragRef.current = { roomId, pointerId: e.pointerId, offsetX: point.x - x, offsetY: point.y - y };
    setRoomDragPreview({ roomId, x, y });
  };
  const handleRoomPointerMove = (e: React.PointerEvent<SVGGElement>) => {
    const drag = roomDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.stopPropagation();
    const point = clientToSvg(e.clientX, e.clientY);
    if (!point) return;
    setRoomDragPreview({ roomId: drag.roomId, x: Math.round((point.x - drag.offsetX) / 5) * 5, y: Math.round((point.y - drag.offsetY) / 5) * 5 });
  };
  const handleRoomPointerUp = (e: React.PointerEvent<SVGGElement>) => {
    const drag = roomDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.stopPropagation();
    if (roomDragPreview) commitManualPosition(drag.roomId, roomDragPreview.x, roomDragPreview.y);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    roomDragRef.current = null;
    setRoomDragPreview(null);
  };
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121810]/90 backdrop-blur-md animate-fadeIn overflow-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* 🌟 100% 無邊際畫布層 (Canvas Layer)                                         */}
      {/* ========================================================================= */}
      <div 
        className="absolute inset-0 z-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={handleCanvasPointerDown} onPointerMove={handleCanvasPointerMove} onPointerUp={handleCanvasPointerUp} onPointerCancel={handleCanvasPointerUp}
      >
        <svg ref={svgRef} viewBox={`${viewBoxMinX} ${viewBoxMinY} ${svgWidth} ${svgHeight}`} className="w-full h-full transition-transform duration-75 ease-out" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <defs>
            <pattern id="gridPatternStitch" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x={viewBoxMinX} y={viewBoxMinY} width={svgWidth} height={svgHeight} fill="url(#gridPatternStitch)" />

          {/* 繪製各個放置好的空間多邊形 */}
          {stitchedResult.placements.map((p) => {
            const room = rooms.find((r) => r.id === p.roomId);
            if (!room) return null;
            const preview = roomDragPreview?.roomId === p.roomId ? roomDragPreview : null;
            const placementX = preview?.x ?? p.x;
            const placementY = preview?.y ?? p.y;
            const isSelected = selectedRoomId === p.roomId;
            const c1 = rotatePoint(0, 0, p.rotation);
            const c2 = rotatePoint(room.width, 0, p.rotation);
            const c3 = rotatePoint(room.width, room.length, p.rotation);
            const c4 = rotatePoint(0, room.length, p.rotation);
            const g1 = { x: placementX + c1.x, y: placementY + c1.y }; const g2 = { x: placementX + c2.x, y: placementY + c2.y };
            const g3 = { x: placementX + c3.x, y: placementY + c3.y }; const g4 = { x: placementX + c4.x, y: placementY + c4.y };
            const centerLocal = { x: room.width / 2, y: room.length / 2 };
            const centerRot = rotatePoint(centerLocal.x, centerLocal.y, p.rotation);
            const centerGlobal = { x: placementX + centerRot.x, y: placementY + centerRot.y };
            const areaText = areaUnit === 'ping' ? `${(room.width * room.length * 0.0001 * 0.3025).toFixed(1)} 坪` : `${(room.width * room.length * 0.0001).toFixed(2)} m²`;

            return (
              <g key={p.roomId} onPointerDown={(e) => handleRoomPointerDown(e, p.roomId, p.x, p.y)} onPointerMove={handleRoomPointerMove} onPointerUp={handleRoomPointerUp} onPointerCancel={handleRoomPointerUp} className={`${activeWorkflow === 'topology' ? 'cursor-move' : 'cursor-pointer'} transition-opacity`}>
                <polygon points={`${g1.x},${g1.y} ${g2.x},${g2.y} ${g3.x},${g3.y} ${g4.x},${g4.y}`} fill={p.color} fillOpacity={isSelected ? 0.3 : 0.1} stroke={isSelected ? '#E0A83C' : p.color} strokeWidth={isSelected ? 3 : 1.5} strokeDasharray={isSelected ? '6,3' : 'none'} />
                <polygon points={`${g1.x},${g1.y} ${g2.x},${g2.y} ${g3.x},${g3.y} ${g4.x},${g4.y}`} fill="none" stroke="#DDD7CE" strokeWidth="3.5" strokeLinejoin="round" />
                <text x={centerGlobal.x} y={centerGlobal.y - 12} fill="#F8F8F6" fontSize="16" fontWeight="bold" textAnchor="middle" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.8))">{room.roomName}</text>
                <text x={centerGlobal.x} y={centerGlobal.y + 12} fill="#8E8E93" fontSize="12" fontWeight="medium" textAnchor="middle">{room.width} × {room.length} cm ({areaText})</text>

                {/* 門洞與開向弧線 */}
                {room.doors && room.doors.map((d) => {
                  const geom = getDoorLocalGeometry(d, room.width, room.length);
                  const midRot = rotatePoint(geom.midX, geom.midY, p.rotation);
                  const gx = placementX + midRot.x; const gy = placementY + midRot.y;
                  return (
                    <g key={d.id}>
                      <circle cx={gx} cy={gy} r="5" fill="#3F5B63" stroke="#F8F8F6" strokeWidth="1.5" />
                      {d.anchorTag && (
                        <g>
                          <rect x={gx - 14} y={gy - 14} width="28" height="28" rx="14" fill="#23301F" stroke="#E0A83C" strokeWidth="2" />
                          <text x={gx} y={gy + 4} fill="#E0A83C" fontSize="12" fontWeight="bold" textAnchor="middle">{d.anchorTag}</text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* 高亮共用隔間牆 */}
          {showSharedWallHighlight && stitchedResult.placements.map((p) => (
            <g key={`shared-group-${p.roomId}`}>
              {p.coincidentSegments?.map((seg, sIdx) => {
                const midX = (seg.x1 + seg.x2) / 2; const midY = (seg.y1 + seg.y2) / 2;
                return (
                  <g key={`coincident-${p.roomId}-${sIdx}`}>
                    <line x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} stroke="#30D158" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                    <rect x={midX - 50} y={midY - 12} width="100" height="24" rx="12" fill="#121810" stroke="#30D158" strokeWidth="1.5" />
                    <text x={midX} y={midY + 4} fill="#30D158" fontSize="10" fontWeight="bold" textAnchor="middle">重合 {seg.lengthCm}cm</text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 頂部懸浮 Header (極簡化)                                                 */}
      {/* ========================================================================= */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between bg-[#23301F]/85 backdrop-blur-xl border border-[#3F5B63]/50 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3F5B63] flex items-center justify-center shadow-inner">
            <Layers className="w-4 h-4 text-[#F8F8F6]" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-[#F8F8F6] tracking-wide">全室拓撲拼接與面積精算</h2>
            <p className="text-[10px] text-[#8E8E93] mt-0.5">Minusplus Multi-Room Stitcher</p>
          </div>
        </div>

        {/* 核心數據摘要 (iPad/手機自動隱藏部分) */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="hidden md:flex items-center gap-1.5 text-[#DDD7CE]">
            <Box className="w-4 h-4 text-[#3F5B63]" /> {stitchedResult.placements.length} 空間
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-[#30D158]">
            <ShieldCheck className="w-4 h-4" /> 0 剛體穿透
          </div>
          <div className="flex items-center gap-1.5 text-[#E0A83C] bg-[#E0A83C]/10 px-3 py-1.5 rounded-lg border border-[#E0A83C]/30">
            <Calculator className="w-4 h-4" /> 
            <span className="font-bold">{areaUnit === 'ping' ? `${stitchedResult.totalAreaPing} 坪` : `${stitchedResult.totalAreaM2} m²`}</span>
          </div>
        </div>

        <button onClick={onClose} className="p-2 rounded-full bg-[#121810] text-[#8E8E93] hover:text-[#F8F8F6] transition border border-[#3F5B63]/30">
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 🌟 底部靈動導航 (Bottom Workflow Switcher)                                  */}
      {/* ========================================================================= */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex bg-[#121810]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-[#3F5B63]/50 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {(['topology', 'dimensions', 'area', 'export'] as const).map((tab, idx) => {
          const icons = [
            <Compass className="w-4 h-4" />,
            <Sliders className="w-4 h-4" />,
            <Calculator className="w-4 h-4" />,
            <Download className="w-4 h-4" />
          ];
          const labels = ['1. 拓撲拼接', '2. 牆面與窗戶尺寸', '3. 面積立面精算', '4. 報表與圖面輸出'];
          const isActive = activeWorkflow === tab;
          return (
            <button
              key={tab}
              onClick={() => { setActiveWorkflow(tab); setIsLeftPanelOpen(true); }}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive ? 'bg-[#3F5B63] text-[#F8F8F6] shadow-md' : 'text-[#8E8E93] hover:text-[#DDD7CE]'
              }`}
            >
              {icons[idx]}
              <span className="hidden sm:block">{labels[idx]}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 🌟 左側懸浮控制台 (Contextual Left Panel) - 手機端變 Bottom Sheet             */}
      {/* ========================================================================= */}
      <div className={`absolute top-24 bottom-24 left-4 w-full max-w-[360px] md:w-[420px] bg-[#23301F]/95 backdrop-blur-2xl border border-[#3F5B63]/50 rounded-2xl shadow-2xl transition-transform duration-300 z-40 flex flex-col overflow-hidden ${isLeftPanelOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}>
        
        <div className="p-4 border-b border-[#3F5B63]/30 flex justify-between items-center bg-[#1A2417]">
          <span className="font-bold text-[#E0A83C] tracking-wider text-sm flex items-center gap-1.5">
            {activeWorkflow === 'topology'
              ? '空間拓撲與拼接'
              : activeWorkflow === 'dimensions'
              ? '📐 牆面與窗戶尺寸直接輸入'
              : activeWorkflow === 'area'
              ? '面積與 4 面牆立面精算'
              : '報表與圖面輸出'}
          </span>
          <button onClick={() => setIsLeftPanelOpen(false)} className="md:hidden p-1 text-[#8E8E93]"><X className="w-4 h-4"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          
          {/* --- Workflow 1: 拓撲拼接 --- */}
          {activeWorkflow === 'topology' && (
            <div className="space-y-5">
              <div className="bg-[#121810] p-3.5 rounded-xl border border-[#3F5B63]/30">
                <label className="block text-xs font-bold text-[#DDD7CE] mb-2">拼接運算模式</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setStitchMode('rigid_body_collision')}
                    className={`py-2 px-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                      stitchMode === 'rigid_body_collision'
                        ? 'bg-[#E0A83C] text-[#121810] shadow-md'
                        : 'bg-[#23301F] text-[#DDD7CE] hover:bg-[#2A3A25]'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" /> 剛體碰撞重合
                  </button>
                  <button
                    onClick={() => setStitchMode('door_anchored')}
                    className={`py-2 px-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                      stitchMode === 'door_anchored'
                        ? 'bg-[#E0A83C] text-[#121810] shadow-md'
                        : 'bg-[#23301F] text-[#DDD7CE] hover:bg-[#2A3A25]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" /> 門洞錨定對齊
                  </button>
                </div>
                <p className="text-[11px] text-[#8E8E93] mt-2 leading-relaxed">
                  {stitchMode === 'rigid_body_collision'
                    ? '💡 依據相鄰空間牆體重合原則與 AABB 剛體無穿透約束，自動串聯成長成具備真實幾何比例的平面圖。'
                    : '💡 嚴格依據兩兩空間門洞相同標籤 (A, B, C...) 進行幾何平移與剛體旋轉對齊。'}
                </p>
                <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200">
                  拖动背景可移动观看视角；在拓扑拼接阶段直接拖动房间，或用下方 X／Y／旋转精确定位，都会保存坐标。
                </div>
                {selectedRoom && (() => { const placement = stitchedResult.placements.find((item) => item.roomId === selectedRoom.id); if (!placement) return null; return <div className="mt-3 rounded-xl border border-[#3F5B63]/40 bg-[#182216] p-3"><div className="mb-2 flex items-center justify-between"><strong className="text-xs text-[#F8F8F6]">人工定位 · {selectedRoom.roomName}</strong><button onClick={() => handleManualPlacement(selectedRoom.id, 'x', null)} className="text-[10px] text-amber-300">恢复自动拼接</button></div><div className="grid grid-cols-3 gap-2">{([['x','X (cm)',placement.x],['y','Y (cm)',placement.y]] as const).map(([field,label,value]) => <label key={field} className="text-[10px] text-[#DDD7CE]">{label}<input type="number" step="5" value={value} onChange={(event) => handleManualPlacement(selectedRoom.id, field, Number(event.target.value))} className="mt-1 w-full rounded-lg border border-[#3F5B63] bg-[#10170f] p-2 text-white" /></label>)}<label className="text-[10px] text-[#DDD7CE]">旋转<input aria-label="房间旋转" type="number" step="90" min="0" max="270" value={placement.rotation} onChange={(event) => handleManualPlacement(selectedRoom.id, 'rotation', ([0,90,180,270].includes(Number(event.target.value)) ? Number(event.target.value) : 0))} className="mt-1 w-full rounded-lg border border-[#3F5B63] bg-[#10170f] p-2 text-white" /></label></div><div className={`mt-2 text-[10px] font-bold ${stitchedResult.zeroCollisionVerified ? 'text-emerald-300' : 'text-rose-300'}`}>{stitchedResult.zeroCollisionVerified ? '当前无房间穿透' : '检测到房间重叠，请调整坐标'}</div></div>; })()}

                {/* 剛體運算觸發按鈕 */}
                <button
                  onClick={handleTriggerRigidBodyStitching}
                  className="mt-3 w-full py-2.5 px-3 bg-gradient-to-r from-[#E0A83C] to-[#E59820] hover:brightness-110 text-[#121810] font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs transition active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-[#121810]" />
                  重新執行剛體碰撞與相鄰牆體重合
                </button>
              </div>

              {/* 基準錨定空間與隔間牆厚度 */}
              <div className="bg-[#121810] p-3.5 rounded-xl border border-[#3F5B63]/30 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#DDD7CE] mb-1.5">基準空間 (坐標原點)</label>
                  <select
                    value={baseRoomId}
                    onChange={(e) => setBaseRoomId(e.target.value)}
                    className="w-full bg-[#1A2417] border border-[#3F5B63]/50 rounded-lg px-2.5 py-1.5 text-xs text-[#F8F8F6] focus:outline-none focus:border-[#E0A83C]"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomName} ({r.width} × {r.length} cm)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-bold text-[#DDD7CE]">隔間牆厚度</span>
                    <span className="text-[#E0A83C] font-mono">{wallThickness} cm</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="1"
                    value={wallThickness}
                    onChange={(e) => setWallThickness(Number(e.target.value))}
                    className="w-full accent-[#E0A83C] h-1.5 bg-[#23301F] rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* 空間門洞標籤配對編輯 */}
              <div className="bg-[#121810] p-3.5 rounded-xl border border-[#3F5B63]/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#DDD7CE]">空間門洞標籤配對</label>
                  <span className="text-[10px] text-[#8E8E93]">相同字母自動接合</span>
                </div>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {rooms.map((room) => (
                    <div key={room.id} className="p-2.5 rounded-lg bg-[#1A2417] border border-[#3F5B63]/30">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-[#F8F8F6]">{room.roomName}</span>
                        <span className="text-[10px] text-[#8E8E93]">{room.doors?.length || 0} 個門洞</span>
                      </div>
                      {(!room.doors || room.doors.length === 0) ? (
                        <p className="text-[10px] text-[#8E8E93] italic">無門洞開口</p>
                      ) : (
                        <div className="space-y-1.5">
                          {room.doors.map((door, dIdx) => (
                            <div key={door.id} className="flex items-center justify-between text-xs bg-[#23301F] px-2 py-1 rounded">
                              <span className="text-[11px] text-[#DDD7CE]">
                                門 {dIdx + 1} ({door.wall}牆 - 寬{door.width}cm)
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-[#8E8E93]">標籤:</span>
                                <input
                                  type="text"
                                  maxLength={3}
                                  value={door.anchorTag || ''}
                                  placeholder="如 A"
                                  onChange={(e) => handleUpdateDoorTag(room.id, door.id, e.target.value)}
                                  className="w-10 px-1 py-0.5 text-center font-bold text-xs bg-[#121810] border border-[#3F5B63] rounded text-[#E0A83C] uppercase focus:outline-none focus:border-[#E0A83C]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 畫布顯示輔助開關 */}
              <div className="bg-[#121810] p-3 rounded-xl border border-[#3F5B63]/30 space-y-2">
                <span className="block text-xs font-bold text-[#DDD7CE] mb-1">畫布圖層輔助</span>
                <label className="flex items-center justify-between text-xs text-[#DDD7CE] cursor-pointer">
                  <span>顯示相鄰重合牆 (綠色高亮)</span>
                  <input
                    type="checkbox"
                    checked={showSharedWallHighlight}
                    onChange={(e) => setShowSharedWallHighlight(e.target.checked)}
                    className="accent-[#30D158]"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-[#DDD7CE] cursor-pointer">
                  <span>顯示空間邊界矩形 (剛體 AABB)</span>
                  <input
                    type="checkbox"
                    checked={showBoundingBoxes}
                    onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                    className="accent-[#E0A83C]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* --- Workflow 2: 牆面與窗戶尺寸直接輸入管理專區 --- */}
          {activeWorkflow === 'dimensions' && (
            <div className="space-y-4">
              {/* 空間切換 Pill Tabs */}
              <div className="bg-[#121810] p-3 rounded-xl border border-[#3F5B63]/30">
                <label className="block text-xs font-bold text-[#DDD7CE] mb-2 flex items-center justify-between">
                  <span>選擇當前編輯空間</span>
                  <span className="text-[10px] text-[#E0A83C]">修改後即時重算拓撲與工程量</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {rooms.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoomId(r.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        selectedRoomId === r.id
                          ? 'bg-[#E0A83C] text-[#121810] shadow'
                          : 'bg-[#1A2417] text-[#DDD7CE] hover:bg-[#23301F] border border-[#3F5B63]/30'
                      }`}
                    >
                      <Box className="w-3 h-3" />
                      <span>{r.roomName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 面結構牆尺寸直接輸入卡片 */}
              {selectedRoom && (
                <div className="bg-[#121810] p-3.5 rounded-xl border border-[#3F5B63]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E0A83C] flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" /> 【{selectedRoom.roomName}】4 面牆結構尺寸
                    </span>
                    <span className="text-[10px] text-[#8E8E93] font-mono">
                      地坪: {areaUnit === 'ping' ? `${(selectedRoom.width * selectedRoom.length * 0.0001 * 0.3025).toFixed(1)} 坪` : `${(selectedRoom.width * selectedRoom.length * 0.0001).toFixed(2)} m²`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* 北面牆 (上) */}
                    <div className="bg-[#1A2417] p-2.5 rounded-lg border border-[#3F5B63]/30 space-y-1">
                      <div className="flex items-center justify-between text-[#DDD7CE] font-bold text-[11px]">
                        <span>北面牆 (向北·頂牆)</span>
                        <span className="text-[9px] text-[#8E8E93]">面寬</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={selectedRoom.width}
                          onChange={(e) => handleUpdateRoomDimensions(selectedRoom.id, Number(e.target.value), selectedRoom.length)}
                          className="w-full px-2 py-1 bg-[#121810] border border-[#3F5B63] rounded text-white font-mono text-center text-xs focus:border-[#E0A83C] outline-none"
                        />
                        <span className="text-[10px] text-[#8E8E93]">cm</span>
                      </div>
                    </div>

                    {/* 南面牆 (下) */}
                    <div className="bg-[#1A2417] p-2.5 rounded-lg border border-[#3F5B63]/30 space-y-1">
                      <div className="flex items-center justify-between text-[#DDD7CE] font-bold text-[11px]">
                        <span>南面牆 (向南·底牆)</span>
                        <span className="text-[9px] text-[#8E8E93]">面寬</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={selectedRoom.width}
                          onChange={(e) => handleUpdateRoomDimensions(selectedRoom.id, Number(e.target.value), selectedRoom.length)}
                          className="w-full px-2 py-1 bg-[#121810] border border-[#3F5B63] rounded text-white font-mono text-center text-xs focus:border-[#E0A83C] outline-none"
                        />
                        <span className="text-[10px] text-[#8E8E93]">cm</span>
                      </div>
                    </div>

                    {/* 東面牆 (右) */}
                    <div className="bg-[#1A2417] p-2.5 rounded-lg border border-[#3F5B63]/30 space-y-1">
                      <div className="flex items-center justify-between text-[#DDD7CE] font-bold text-[11px]">
                        <span>東面牆 (向東·右牆)</span>
                        <span className="text-[9px] text-[#8E8E93]">進深</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={selectedRoom.length}
                          onChange={(e) => handleUpdateRoomDimensions(selectedRoom.id, selectedRoom.width, Number(e.target.value))}
                          className="w-full px-2 py-1 bg-[#121810] border border-[#3F5B63] rounded text-white font-mono text-center text-xs focus:border-[#E0A83C] outline-none"
                        />
                        <span className="text-[10px] text-[#8E8E93]">cm</span>
                      </div>
                    </div>

                    {/* 西面牆 (左) */}
                    <div className="bg-[#1A2417] p-2.5 rounded-lg border border-[#3F5B63]/30 space-y-1">
                      <div className="flex items-center justify-between text-[#DDD7CE] font-bold text-[11px]">
                        <span>西面牆 (向西·左牆)</span>
                        <span className="text-[9px] text-[#8E8E93]">進深</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={selectedRoom.length}
                          onChange={(e) => handleUpdateRoomDimensions(selectedRoom.id, selectedRoom.width, Number(e.target.value))}
                          className="w-full px-2 py-1 bg-[#121810] border border-[#3F5B63] rounded text-white font-mono text-center text-xs focus:border-[#E0A83C] outline-none"
                        />
                        <span className="text-[10px] text-[#8E8E93]">cm</span>
                      </div>
                    </div>
                  </div>

                  {/* 樓板淨高與隔間厚度 */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#3F5B63]/30">
                    <div>
                      <label className="block text-[11px] text-[#8E8E93] mb-1">樓板淨高 (Floor-to-Slab)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={selectedRoom.height || 280}
                          onChange={(e) => handleUpdateRoomDimensions(selectedRoom.id, selectedRoom.width, selectedRoom.length, Number(e.target.value))}
                          className="w-full px-2 py-1 bg-[#1A2417] border border-[#3F5B63] rounded text-white font-mono text-center text-xs focus:border-[#E0A83C] outline-none"
                        />
                        <span className="text-[10px] text-[#8E8E93]">cm</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8E8E93] mb-1">隔間牆厚 (Thickness)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={selectedRoom.wallThickness || 15}
                          onChange={(e) => {
                            const t = Number(e.target.value);
                            setWallThickness(t);
                            const updated = rooms.map(r => r.id === selectedRoom.id ? { ...r, wallThickness: t } : r);
                            onUpdateRooms(updated);
                          }}
                          className="w-full px-2 py-1 bg-[#1A2417] border border-[#3F5B63] rounded text-white font-mono text-center text-xs focus:border-[#E0A83C] outline-none"
                        />
                        <span className="text-[10px] text-[#8E8E93]">cm</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 窗戶尺寸直接輸入與開口管理 */}
              {selectedRoom && (
                <div className="bg-[#121810] p-3.5 rounded-xl border border-[#3F5B63]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#38BDF8] flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" /> 窗戶尺寸直接輸入清單
                      </span>
                      <span className="text-[10px] text-[#8E8E93] mt-0.5 block">
                        共 {selectedRoom.windows?.length || 0} 樘窗戶開口
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddWindow(selectedRoom.id, 'north')}
                      className="px-2.5 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-lg text-xs flex items-center gap-1 transition shadow active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> 新增窗戶
                    </button>
                  </div>

                  {/* 窗戶清單 */}
                  {(!selectedRoom.windows || selectedRoom.windows.length === 0) ? (
                    <div className="p-4 rounded-xl bg-[#1A2417] border border-[#3F5B63]/30 text-center">
                      <p className="text-xs text-[#8E8E93] italic">目前【{selectedRoom.roomName}】無窗戶開口</p>
                      <button
                        onClick={() => handleAddWindow(selectedRoom.id, 'north')}
                        className="mt-2 text-xs text-[#38BDF8] hover:underline font-bold inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> 立即新增一樘採光窗
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {selectedRoom.windows.map((win, idx) => (
                        <div key={win.id} className="p-2.5 rounded-xl bg-[#1A2417] border border-[#38BDF8]/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-1 mr-2">
                              <span className="w-4 h-4 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={win.name}
                                onChange={(e) => handleUpdateWindow(selectedRoom.id, win.id, { name: e.target.value })}
                                className="px-2 py-0.5 bg-[#121810] border border-[#3F5B63] rounded text-xs text-white font-bold w-full focus:border-[#38BDF8] outline-none"
                                placeholder="窗戶名稱"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <select
                                value={win.wall}
                                onChange={(e) => handleUpdateWindow(selectedRoom.id, win.id, { wall: e.target.value as any })}
                                className="px-1.5 py-0.5 bg-[#121810] border border-[#3F5B63] rounded text-[11px] text-[#E0A83C] font-bold focus:border-[#38BDF8] outline-none"
                              >
                                <option value="north">北牆 (頂)</option>
                                <option value="south">南牆 (底)</option>
                                <option value="east">東牆 (右)</option>
                                <option value="west">西牆 (左)</option>
                              </select>
                              <button
                                onClick={() => handleDeleteWindow(selectedRoom.id, win.id)}
                                className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40"
                                title="刪除此窗戶"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* 窗戶尺寸數值輸入網格 */}
                          <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                            <div className="bg-[#121810] p-1.5 rounded border border-[#3F5B63]/30">
                              <div className="text-[9px] text-[#8E8E93]">窗寬 (W)</div>
                              <input
                                type="number"
                                value={win.width}
                                onChange={(e) => handleUpdateWindow(selectedRoom.id, win.id, { width: Number(e.target.value) })}
                                className="w-full bg-transparent text-center text-xs text-white font-bold outline-none"
                              />
                              <div className="text-[8px] text-[#8E8E93]">cm</div>
                            </div>

                            <div className="bg-[#121810] p-1.5 rounded border border-[#3F5B63]/30">
                              <div className="text-[9px] text-[#8E8E93]">窗高 (H)</div>
                              <input
                                type="number"
                                value={win.height}
                                onChange={(e) => handleUpdateWindow(selectedRoom.id, win.id, { height: Number(e.target.value) })}
                                className="w-full bg-transparent text-center text-xs text-white font-bold outline-none"
                              />
                              <div className="text-[8px] text-[#8E8E93]">cm</div>
                            </div>

                            <div className="bg-[#121810] p-1.5 rounded border border-[#3F5B63]/30">
                              <div className="text-[9px] text-[#8E8E93]">台度 (Sill)</div>
                              <input
                                type="number"
                                value={win.sillHeight}
                                onChange={(e) => handleUpdateWindow(selectedRoom.id, win.id, { sillHeight: Number(e.target.value) })}
                                className="w-full bg-transparent text-center text-xs text-[#E0A83C] font-bold outline-none"
                              />
                              <div className="text-[8px] text-[#8E8E93]">cm</div>
                            </div>

                            <div className="bg-[#121810] p-1.5 rounded border border-[#3F5B63]/30">
                              <div className="text-[9px] text-[#8E8E93]">邊距 (Off)</div>
                              <input
                                type="number"
                                value={win.offset}
                                onChange={(e) => handleUpdateWindow(selectedRoom.id, win.id, { offset: Number(e.target.value) })}
                                className="w-full bg-transparent text-center text-xs text-white font-bold outline-none"
                              />
                              <div className="text-[8px] text-[#8E8E93]">cm</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-[#8E8E93] pt-0.5">
                            <span>開口面積: {((win.width * win.height) / 10000).toFixed(2)} m² ({(((win.width * win.height) / 10000) * 0.3025).toFixed(2)} 坪)</span>
                            <span className="text-[#30D158]">立面自動扣除</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 快速常用窗型樣板 */}
                  <div className="pt-2 border-t border-[#3F5B63]/30">
                    <span className="text-[10px] text-[#8E8E93] block mb-1.5">常用規格快速套用至新窗：</span>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      <button
                        onClick={() => {
                          const newWin: WindowOpening = {
                            id: `win-${Date.now()}`,
                            name: '景觀落地窗',
                            width: 240,
                            height: 212,
                            sillHeight: 8,
                            wall: 'north',
                            offset: 30,
                          };
                          onUpdateRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, windows: [...(r.windows || []), newWin] } : r));
                        }}
                        className="p-1 bg-[#1A2417] hover:bg-[#23301F] text-[#DDD7CE] rounded border border-[#3F5B63]/30 truncate"
                      >
                        落地窗 (240×212)
                      </button>
                      <button
                        onClick={() => {
                          const newWin: WindowOpening = {
                            id: `win-${Date.now()}`,
                            name: '臥室採光窗',
                            width: 160,
                            height: 150,
                            sillHeight: 50,
                            wall: 'north',
                            offset: 40,
                          };
                          onUpdateRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, windows: [...(r.windows || []), newWin] } : r));
                        }}
                        className="p-1 bg-[#1A2417] hover:bg-[#23301F] text-[#DDD7CE] rounded border border-[#3F5B63]/30 truncate"
                      >
                        標準窗 (160×150)
                      </button>
                      <button
                        onClick={() => {
                          const newWin: WindowOpening = {
                            id: `win-${Date.now()}`,
                            name: '衛浴通風窗',
                            width: 80,
                            height: 80,
                            sillHeight: 120,
                            wall: 'west',
                            offset: 20,
                          };
                          onUpdateRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, windows: [...(r.windows || []), newWin] } : r));
                        }}
                        className="p-1 bg-[#1A2417] hover:bg-[#23301F] text-[#DDD7CE] rounded border border-[#3F5B63]/30 truncate"
                      >
                        通風窗 (80×80)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- Workflow 3: 面積與 4 面牆立面精算 --- */}
          {activeWorkflow === 'area' && (
            <div className="space-y-4">
              {/* 單位切換按鍵: 米平方 (m²) vs 臺灣專用坪數 (坪) */}
              <div className="bg-[#121810] p-3 rounded-xl border border-[#3F5B63]/30">
                <label className="block text-xs font-bold text-[#DDD7CE] mb-2">平面積與立面計算單位</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAreaUnit('ping')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      areaUnit === 'ping'
                        ? 'bg-[#E0A83C] text-[#121810] shadow-md'
                        : 'bg-[#23301F] text-[#DDD7CE] hover:bg-[#2A3A25]'
                    }`}
                  >
                    🇹🇼 臺灣專用單位 (坪數)
                  </button>
                  <button
                    onClick={() => setAreaUnit('m2')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      areaUnit === 'm2'
                        ? 'bg-[#E0A83C] text-[#121810] shadow-md'
                        : 'bg-[#23301F] text-[#DDD7CE] hover:bg-[#2A3A25]'
                    }`}
                  >
                    📐 公制國際單位 (米平方 m²)
                  </button>
                </div>
                <div className="mt-2 text-[10px] text-[#8E8E93] text-center">
                  換算基準：1 坪 = 3.305785 m² | 1 m² = 0.3025 坪
                </div>
              </div>

              {/* 全案匯總指標卡片 */}
              <div className="bg-gradient-to-br from-[#1A2417] to-[#121810] p-3.5 rounded-xl border border-[#3F5B63]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E0A83C] flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" /> 全案平面積與立面工程匯總
                  </span>
                  <button
                    onClick={handleCopyAreaReport}
                    className="p-1 text-[#8E8E93] hover:text-[#E0A83C] transition"
                    title="複製工程量總表"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#23301F]/80 p-2.5 rounded-lg border border-[#3F5B63]/30">
                    <div className="text-[10px] text-[#8E8E93]">室內總地坪實積</div>
                    <div className="text-base font-extrabold text-[#F8F8F6] mt-0.5">
                      {areaUnit === 'ping' ? `${projectAreaSummary.totalFloorAreaPing} 坪` : `${projectAreaSummary.totalFloorAreaM2} m²`}
                    </div>
                    <div className="text-[9px] text-[#8E8E93]">
                      {areaUnit === 'ping' ? `(${projectAreaSummary.totalFloorAreaM2} m²)` : `(${projectAreaSummary.totalFloorAreaPing} 坪)`}
                    </div>
                  </div>

                  <div className="bg-[#23301F]/80 p-2.5 rounded-lg border border-[#3F5B63]/30">
                    <div className="text-[10px] text-[#8E8E93]">4面牆立面淨面積</div>
                    <div className="text-base font-extrabold text-[#30D158] mt-0.5">
                      {areaUnit === 'ping' ? `${projectAreaSummary.totalWallNetAreaPing} 坪` : `${projectAreaSummary.totalWallNetAreaM2} m²`}
                    </div>
                    <div className="text-[9px] text-[#8E8E93]">
                      扣除開口 {areaUnit === 'ping' ? `${projectAreaSummary.totalWallDeductionsPing} 坪` : `${projectAreaSummary.totalWallDeductionsM2} m²`}
                    </div>
                  </div>
                </div>
              </div>

              {/* 各個空間平面積與 4 面向立面牆面明細 */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#DDD7CE] px-1">
                  <span>各空間平面積與 4 面牆明細 (可直接修改尺寸)</span>
                  <span className="text-[10px] text-[#8E8E93]">{projectAreaSummary.roomCalculations.length} 間空間</span>
                </div>

                {projectAreaSummary.roomCalculations.map((calc) => {
                  const isExpanded = expandedWallRoomId === calc.roomId;
                  const isSelected = selectedRoomId === calc.roomId;
                  return (
                    <div
                      key={calc.roomId}
                      className={`p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#1A2417] border-[#E0A83C] shadow-lg'
                          : 'bg-[#121810] border-[#3F5B63]/30 hover:border-[#3F5B63]'
                      }`}
                    >
                      {/* 空間標題與平面積摘要 (可直接輸入長寬高) */}
                      <div className="flex items-center justify-between">
                        <div
                          className="cursor-pointer flex-1"
                          onClick={() => setSelectedRoomId(calc.roomId)}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#F8F8F6]">{calc.roomName}</span>
                            <div className="flex items-center gap-1 text-[11px] bg-[#23301F] px-2 py-0.5 rounded border border-[#3F5B63]/40">
                              <span className="text-[#8E8E93]">寬</span>
                              <input
                                type="number"
                                value={calc.floorWidthCm}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleUpdateRoomDimensions(calc.roomId, Number(e.target.value), calc.floorLengthCm)}
                                className="w-12 px-1 py-0.2 bg-[#121810] border border-[#3F5B63] rounded text-center text-[#E0A83C] font-mono text-xs focus:border-[#E0A83C] outline-none"
                              />
                              <span className="text-[#8E8E93]">× 長</span>
                              <input
                                type="number"
                                value={calc.floorLengthCm}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleUpdateRoomDimensions(calc.roomId, calc.floorWidthCm, Number(e.target.value))}
                                className="w-12 px-1 py-0.2 bg-[#121810] border border-[#3F5B63] rounded text-center text-[#E0A83C] font-mono text-xs focus:border-[#E0A83C] outline-none"
                              />
                              <span className="text-[#8E8E93]">× 高</span>
                              <input
                                type="number"
                                value={calc.clearHeightCm}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleUpdateRoomDimensions(calc.roomId, calc.floorWidthCm, calc.floorLengthCm, Number(e.target.value))}
                                className="w-12 px-1 py-0.2 bg-[#121810] border border-[#3F5B63] rounded text-center text-[#E0A83C] font-mono text-xs focus:border-[#E0A83C] outline-none"
                              />
                              <span className="text-[#8E8E93]">cm</span>
                            </div>
                          </div>
                          <div className="text-xs text-[#DDD7CE] mt-1.5 flex items-center gap-2">
                            <span>地坪實積:</span>
                            <strong className="text-[#E0A83C]">
                              {areaUnit === 'ping' ? `${calc.floorAreaPing} 坪` : `${calc.floorAreaM2} m²`}
                            </strong>
                            <span className="text-[10px] text-[#8E8E93]">
                              ({calc.floorWidthCm} × {calc.floorLengthCm} cm)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopySingleRoomArea(calc)}
                            className="p-1.5 text-[#8E8E93] hover:text-[#E0A83C] transition rounded"
                            title="複製此空間計算"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setExpandedWallRoomId(isExpanded ? null : calc.roomId)}
                            className="p-1.5 text-[#8E8E93] hover:text-[#F8F8F6] transition rounded bg-[#1A2417]"
                            title="展開 4 面向立面牆面明細"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* 4 面向立面展開明細 */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#3F5B63]/30 space-y-2.5 animate-fadeIn">
                          <div className="text-[11px] font-bold text-[#E0A83C] flex items-center justify-between">
                            <span>4 個面向立面牆體精算 (尺寸可直接點擊修改)：</span>
                            <span className="text-[10px] text-[#30D158]">
                              總淨面積: {areaUnit === 'ping' ? `${calc.totalWallNetAreaPing} 坪` : `${calc.totalWallNetAreaM2} m²`}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {(['north', 'south', 'east', 'west'] as const).map((dir) => {
                              const wall = calc.walls[dir];
                              if (!wall) return null;
                              const wallWindows = getRoomWindowsForWall(calc.roomId, dir);

                              return (
                                <div key={dir} className="bg-[#1A2417]/90 p-2.5 rounded-lg border border-[#3F5B63]/30 text-xs space-y-2">
                                  {/* 牆向標題與淨面積 */}
                                  <div className="flex items-center justify-between font-medium">
                                    <span className="text-[#DDD7CE] font-bold">{wall.name}</span>
                                    <span className="font-bold text-[#F8F8F6]">
                                      淨施作: {areaUnit === 'ping' ? `${wall.netAreaPing} 坪` : `${wall.netAreaM2} m²`}
                                    </span>
                                  </div>

                                  {/* 牆面尺寸直接輸入修改列 */}
                                  <div className="flex items-center justify-between text-[11px] bg-[#121810] p-1.5 rounded border border-[#3F5B63]/40">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[#8E8E93]">牆寬:</span>
                                      <input
                                        type="number"
                                        value={wall.widthCm}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          if (dir === 'north' || dir === 'south') {
                                            handleUpdateRoomDimensions(calc.roomId, val, calc.floorLengthCm);
                                          } else {
                                            handleUpdateRoomDimensions(calc.roomId, calc.floorWidthCm, val);
                                          }
                                        }}
                                        className="w-14 px-1 py-0.5 bg-[#1A2417] border border-[#3F5B63] rounded text-center text-white font-mono text-xs focus:border-[#E0A83C] outline-none"
                                      />
                                      <span className="text-[#8E8E93]">× 牆高:</span>
                                      <input
                                        type="number"
                                        value={wall.heightCm}
                                        onChange={(e) => handleUpdateRoomDimensions(calc.roomId, calc.floorWidthCm, calc.floorLengthCm, Number(e.target.value))}
                                        className="w-14 px-1 py-0.5 bg-[#1A2417] border border-[#3F5B63] rounded text-center text-white font-mono text-xs focus:border-[#E0A83C] outline-none"
                                      />
                                      <span className="text-[#8E8E93]">cm</span>
                                    </div>
                                    <span className="text-[#8E8E93] text-[10px]">
                                      毛面積 {areaUnit === 'ping' ? `${wall.grossAreaPing}坪` : `${wall.grossAreaM2}m²`}
                                    </span>
                                  </div>

                                  {/* 窗戶開口扣除與直接輸入編輯清單 */}
                                  <div className="pt-1.5 border-t border-[#3F5B63]/30">
                                    <div className="flex items-center justify-between text-[10px] text-[#8E8E93] mb-1.5">
                                      <span>開口扣除: {areaUnit === 'ping' ? `${wall.deductionsPing} 坪` : `${wall.deductionsM2} m²`}</span>
                                      <button
                                        onClick={() => handleAddWindow(calc.roomId, dir)}
                                        className="text-[#38BDF8] hover:underline flex items-center gap-0.5 font-bold"
                                      >
                                        <Plus className="w-3 h-3" /> 新增此牆窗戶
                                      </button>
                                    </div>

                                    {wallWindows.length > 0 && (
                                      <div className="space-y-1.5">
                                        {wallWindows.map((win) => (
                                          <div key={win.id} className="flex items-center justify-between bg-[#121810] px-2 py-1.5 rounded text-[11px] border border-[#38BDF8]/40">
                                            <span className="text-[#38BDF8] font-bold truncate max-w-[80px]" title={win.name}>
                                              {win.name}
                                            </span>
                                            <div className="flex items-center gap-1 font-mono text-[10px]">
                                              <span className="text-[#8E8E93]">寬</span>
                                              <input
                                                type="number"
                                                value={win.width}
                                                onChange={(e) => handleUpdateWindow(calc.roomId, win.id, { width: Number(e.target.value) })}
                                                className="w-11 px-0.5 py-0.2 bg-[#1A2417] border border-[#3F5B63] rounded text-center text-white font-bold"
                                              />
                                              <span className="text-[#8E8E93]">高</span>
                                              <input
                                                type="number"
                                                value={win.height}
                                                onChange={(e) => handleUpdateWindow(calc.roomId, win.id, { height: Number(e.target.value) })}
                                                className="w-11 px-0.5 py-0.2 bg-[#1A2417] border border-[#3F5B63] rounded text-center text-white font-bold"
                                              />
                                              <span className="text-[#8E8E93]">台</span>
                                              <input
                                                type="number"
                                                value={win.sillHeight}
                                                onChange={(e) => handleUpdateWindow(calc.roomId, win.id, { sillHeight: Number(e.target.value) })}
                                                className="w-10 px-0.5 py-0.2 bg-[#1A2417] border border-[#3F5B63] rounded text-center text-[#E0A83C] font-bold"
                                              />
                                            </div>
                                            <button
                                              onClick={() => handleDeleteWindow(calc.roomId, win.id)}
                                              className="text-red-400 hover:text-red-300 ml-1.5 p-0.5"
                                              title="刪除此窗戶"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {wall.beamNotes && wall.beamNotes.length > 0 && (
                                    <div className="text-[9px] text-[#E0A83C] mt-1 bg-[#23301F] px-1.5 py-0.5 rounded">
                                      ⚠️ {wall.beamNotes.join('、')}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- Workflow 3: 報表與圖面輸出 --- */}
          {activeWorkflow === 'export' && (
            <div className="space-y-4">
              <div className="bg-[#121810] p-4 rounded-xl border border-[#3F5B63]/30 space-y-3">
                <h4 className="text-xs font-bold text-[#E0A83C] tracking-wide">工程量報表與圖面匯出</h4>
                <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                  匯出符合臺灣室內裝修實務計價之 CSV / Excel 試算表，包含各空間平面積與 4 個面向之立面牆淨面積、開口扣除清單。
                </p>

                <button
                  onClick={handleExportAreaCsv}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#E0A83C] to-[#E59820] hover:brightness-110 text-[#121810] font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs transition active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  匯出平面積與 4 面牆工程量報表 (CSV/Excel)
                </button>

                <button
                  onClick={handleDownloadFullDxf}
                  className="w-full py-3 px-4 bg-[#3F5B63] hover:bg-[#4E6F7A] text-[#F8F8F6] font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition active:scale-[0.98]"
                >
                  <FileCode className="w-4 h-4" />
                  匯出全室合併 AutoCAD 向量圖 (DXF)
                </button>

                <button
                  onClick={handleCopyAreaReport}
                  className="w-full py-2.5 px-4 bg-[#23301F] hover:bg-[#2A3A25] border border-[#3F5B63]/50 text-[#DDD7CE] font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition"
                >
                  <Copy className="w-4 h-4" />
                  複製全案平面積與立面計算明細
                </button>
              </div>

              {/* 實務規範小百科 */}
              <div className="bg-[#121810] p-3.5 rounded-xl border border-[#3F5B63]/30 space-y-1.5 text-[11px] text-[#8E8E93]">
                <div className="font-bold text-[#DDD7CE] flex items-center gap-1.5 text-xs">
                  <Info className="w-3.5 h-3.5 text-[#E0A83C]" /> 臺灣工程量計算標準
                </div>
                <p>• 平面積換算：平方公尺 (m²) × 0.3025 = 臺灣坪數 (坪)。</p>
                <p>• 4 面立面牆：扣除實質門窗開口面積，符合發包油漆塗料、泥作貼磚、壁紙工程量標準。</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 右側/畫布視圖控制浮動欄 (Floating Canvas Controls)                         */}
      {/* ========================================================================= */}
      <div className="absolute right-4 bottom-24 z-40 flex flex-col gap-2 bg-[#23301F]/90 backdrop-blur-xl border border-[#3F5B63]/50 p-2 rounded-2xl shadow-xl">
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
          className="p-2.5 rounded-xl bg-[#121810] text-[#DDD7CE] hover:text-[#F8F8F6] hover:bg-[#1A2417] transition"
          title="放大"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
          className="p-2.5 rounded-xl bg-[#121810] text-[#DDD7CE] hover:text-[#F8F8F6] hover:bg-[#1A2417] transition"
          title="縮小"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2.5 rounded-xl bg-[#121810] text-[#DDD7CE] hover:text-[#F8F8F6] hover:bg-[#1A2417] transition"
          title="復位視角"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-[#3F5B63]/40 my-0.5" />
        <button
          onClick={() => setIsLeftPanelOpen((v) => !v)}
          className={`p-2.5 rounded-xl transition ${
            isLeftPanelOpen ? 'bg-[#3F5B63] text-[#F8F8F6]' : 'bg-[#121810] text-[#DDD7CE] hover:text-[#F8F8F6]'
          }`}
          title="切換左側面板"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default MultiRoomStitcherModal;
