import React, { useState, useRef, useMemo } from 'react';
import { RoomData, VoiceMemo, ElectricalPoint, LightingPoint, Beam, VirtualAnnotationPoint, PlacedBlockItem, PersonalDetailBlockItem } from '../types';
import { downloadDxfFile } from '../utils/dxfExporter';
import { FieldMepStakingOverlay } from './FieldMepStakingOverlay';
import { FieldStakingControlBar, StakingToolType } from './FieldStakingControlBar';
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Mic,
  Volume2,
  AlertTriangle,
  Layers,
  Ruler,
  CheckCircle2,
  Sliders,
  MapPin,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  X,
  ChevronRight,
  Info,
  Check,
  RotateCcw,
  AlertCircle,
  SquareDashed,
  BoxSelect,
  Trash2,
  Edit3,
  PlusCircle,
  Plus,
  Eye,
  ArrowRight,
  Box,
  Columns3,
  Magnet,
  RotateCw,
  Move,
} from 'lucide-react';
import { WallElevationViewer, WallKey } from './WallElevationViewer';
import {
  calculateWallBeamDimensionChains,
  WallBeamDimensionChainResult,
  WallBeamDimensionSegment,
  snapRoomBeamsToRule5,
} from '../utils/autoDimensionEngine';
import { AutoDimensionChainModal } from './AutoDimensionChainModal';
import {
  getWallThickness,
  isExteriorWall,
  updateWallConfig,
  getColumnCoordinates,
} from '../utils/wallUtils';

export interface ClearanceViolation {
  id: string;
  type: 'beam' | 'ceiling_drop' | 'beam_drop_overlap';
  targetId: string;
  name: string;
  measuredHeight: number;
  standardHeight: number;
  diff: number; // standardHeight - measuredHeight
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  reason: string;
  solution: string;
  severity: 'CRITICAL' | 'WARNING';
}

interface StakingCanvas2DProps {
  room: RoomData;
  activeViewMode: 'staking' | 'voice_match' | 'ceiling_drop' | 'mep';
  setActiveViewMode: (mode: 'staking' | 'voice_match' | 'ceiling_drop' | 'mep') => void;
  onSelectVoiceMemo: (memo: VoiceMemo) => void;
  onUpdateRoom: (updated: RoomData) => void;
  onSwitchTo3D?: () => void;
  draggedBlock?: PersonalDetailBlockItem | null;
  onDropBlock?: (block: PersonalDetailBlockItem, x: number, y: number, snapTarget: string) => void;
  onDragCancel?: () => void;
  onNotify?: (msg: string) => void;
}

export const StakingCanvas2D: React.FC<StakingCanvas2DProps> = ({
  room,
  activeViewMode,
  setActiveViewMode,
  onSelectVoiceMemo,
  onUpdateRoom,
  onSwitchTo3D,
  draggedBlock,
  onDropBlock,
  onDragCancel,
  onNotify,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isAddingPin, setIsAddingPin] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const padding = 80;
  const viewBoxW = room.width + padding * 2;
  const viewBoxH = room.length + padding * 2;

  // Ceiling drop depth
  const dropDepth = Math.round(room.length * 0.35);

  // 自動檢測梁下淨高與降板空間規範標準
  const [autoDetectEnabled, setAutoDetectEnabled] = useState<boolean>(true);
  const [standardThreshold, setStandardThreshold] = useState<number>(230); // 預設 230 cm 舒適居室規範
  const [showInspectorPanel, setShowInspectorPanel] = useState<boolean>(false);
  const [highlightedViolationId, setHighlightedViolationId] = useState<string | null>(null);

  // 互動模式：直接在畫布上框選區域標註「特殊梁體位置」
  const [isMarkingSpecialBeam, setIsMarkingSpecialBeam] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingBeam, setIsDraggingBeam] = useState<boolean>(false);
  const [showBeamModal, setShowBeamModal] = useState<boolean>(false);
  const [editingBeam, setEditingBeam] = useState<Beam | null>(null);
  const [selectedBeamId, setSelectedBeamId] = useState<string | null>(null);
  const [showPresetsMenu, setShowPresetsMenu] = useState<boolean>(false);
  const [beamToast, setBeamToast] = useState<string | null>(null);

  // 自動生成牆面立面圖展開視圖狀態
  const [showWallElevations, setShowWallElevations] = useState<boolean>(false);
  const [elevationTargetWall, setElevationTargetWall] = useState<WallKey | 'all'>('all');

  // AI 智能識別並繪製虛擬標註點狀態
  const [showVirtualAnnotations, setShowVirtualAnnotations] = useState<boolean>(true);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // 🌟 星玥灣幾何契約：自動尺寸鏈 (牆面與梁間距自動計算與 5 倍數紅框檢核)
  const [showAutoDimensionChain, setShowAutoDimensionChain] = useState<boolean>(true);
  const [showDimensionChainModal, setShowDimensionChainModal] = useState<boolean>(false);
  const [selectedChainSegmentId, setSelectedChainSegmentId] = useState<string | null>(null);

  const dimensionChainResult: WallBeamDimensionChainResult = useMemo(() => {
    return calculateWallBeamDimensionChains(room);
  }, [room]);

  // 📐 牆面與窗戶尺寸直接輸入面板狀態 (任何標註牆面與窗戶處皆可直接輸入修改)
  const [showQuickDimDrawer, setShowQuickDimDrawer] = useState<boolean>(false);
  const [dimDrawerActiveTab, setDimDrawerActiveTab] = useState<'all' | 'walls' | 'windows'>('all');
  const [selectedWindowForQuickEdit, setSelectedWindowForQuickEdit] = useState<string | null>(null);

  // 直接更新全室牆面幾何尺寸 (面寬、進深、淨高、壁厚)
  const handleUpdateRoomWallDimensions = (newWidth?: number, newLength?: number, newHeight?: number, newThickness?: number) => {
    if (!onUpdateRoom) return;
    const updated: RoomData = {
      ...room,
      width: newWidth !== undefined && !isNaN(newWidth) && newWidth > 0 ? newWidth : room.width,
      length: newLength !== undefined && !isNaN(newLength) && newLength > 0 ? newLength : room.length,
      height: newHeight !== undefined && !isNaN(newHeight) && newHeight > 0 ? newHeight : room.height,
      wallThickness: newThickness !== undefined && !isNaN(newThickness) && newThickness > 0 ? newThickness : (room.wallThickness || 15),
    };
    onUpdateRoom(updated);
  };

  // 直接更新指定窗戶尺寸 (寬、高、台度、偏移、牆向、名稱)
  const handleUpdateWindowDimensions = (windowId: string, updates: Partial<{ name: string; width: number; height: number; sillHeight: number; offset: number; wall: 'north' | 'south' | 'east' | 'west' | 'top' | 'bottom' | 'left' | 'right' }>) => {
    if (!onUpdateRoom) return;
    const currentWindows = room.windows || [];
    const updatedWindows = currentWindows.map((w) => (w.id === windowId ? ({ ...w, ...updates } as any) : w));
    onUpdateRoom({
      ...room,
      windows: updatedWindows,
    });
  };

  // 直接新增窗戶
  const handleAddNewWindow = (wallDir: 'north' | 'south' | 'east' | 'west' = 'north') => {
    if (!onUpdateRoom) return;
    const newId = `win_${Date.now()}`;
    const newWin = {
      id: newId,
      name: `景觀氣密窗 ${((room.windows || []).length + 1)}`,
      width: 160,
      height: 150,
      sillHeight: 45,
      wall: wallDir as any,
      offset: 30,
    };
    onUpdateRoom({
      ...room,
      windows: [...(room.windows || []), newWin],
    });
    setSelectedWindowForQuickEdit(newId);
    setShowQuickDimDrawer(true);
    setDimDrawerActiveTab('windows');
  };

  // 直接刪除窗戶
  const handleDeleteWindow = (windowId: string) => {
    if (!onUpdateRoom) return;
    onUpdateRoom({
      ...room,
      windows: (room.windows || []).filter((w) => w.id !== windowId),
    });
    if (selectedWindowForQuickEdit === windowId) {
      setSelectedWindowForQuickEdit(null);
    }
  };

  // 現場水電與燈具即時放樣標示狀態 (iPad / 現場模式)
  const [activeStakingTool, setActiveStakingTool] = useState<StakingToolType>('select');
  const [snap5x, setSnap5x] = useState<boolean>(true);
  const [selectedMepId, setSelectedMepId] = useState<string | null>(null);
  const [selectedLightingId, setSelectedLightingId] = useState<string | null>(null);
  const [mepToast, setMepToast] = useState<string | null>(null);

  // -------------------------------------------------------------
  // USER REQUESTED: 圖塊拖拽 (Drag-and-Drop) 半透明縮圖鬼影 (Ghost) 與自動吸附
  // -------------------------------------------------------------
  const [ghostSnap, setGhostSnap] = useState<{
    roomX: number;
    roomY: number;
    snappedX: number;
    snappedY: number;
    snapLabel: string;
    snapGuide: {
      type: 'wall_top' | 'wall_bottom' | 'wall_left' | 'wall_right' | 'beam_h' | 'beam_v' | 'drop' | 'module';
      coord: number;
    } | null;
    block: PersonalDetailBlockItem;
  } | null>(null);

  const [selectedPlacedBlockId, setSelectedPlacedBlockId] = useState<string | null>(null);

  const computeSnap = (
    rx: number,
    ry: number,
    bw: number,
    bd: number,
    blockItem: PersonalDetailBlockItem
  ) => {
    let rawX = Math.round(rx - bw / 2);
    let rawY = Math.round(ry - bd / 2);

    let snappedX = rawX;
    let snappedY = rawY;
    let snapLabel = '';
    let snapGuide: {
      type: 'wall_top' | 'wall_bottom' | 'wall_left' | 'wall_right' | 'beam_h' | 'beam_v' | 'drop' | 'module';
      coord: number;
    } | null = null;

    let snappedWallOrLine = false;

    // 1. Check Wall snapping (threshold = 30cm)
    if (Math.abs(rawY) <= 30 || Math.abs(ry) <= 25) {
      snappedY = 0;
      snapLabel = '北向結構牆面 (Y: 0 cm)';
      snapGuide = { type: 'wall_top', coord: 0 };
      snappedWallOrLine = true;
    } else if (Math.abs(room.length - (rawY + bd)) <= 30 || Math.abs(room.length - ry) <= 25) {
      snappedY = room.length - bd;
      snapLabel = `南向結構牆面 (Y: ${room.length - bd} cm)`;
      snapGuide = { type: 'wall_bottom', coord: room.length };
      snappedWallOrLine = true;
    }

    if (Math.abs(rawX) <= 30 || Math.abs(rx) <= 25) {
      snappedX = 0;
      snapLabel = snapLabel ? `${snapLabel} · 西向牆面 (X: 0)` : '西向結構牆面 (X: 0 cm)';
      if (!snapGuide) snapGuide = { type: 'wall_left', coord: 0 };
      snappedWallOrLine = true;
    } else if (Math.abs(room.width - (rawX + bw)) <= 30 || Math.abs(room.width - rx) <= 25) {
      snappedX = room.width - bw;
      snapLabel = snapLabel ? `${snapLabel} · 東向牆面 (X: ${room.width - bw})` : `東向結構牆面 (X: ${room.width - bw} cm)`;
      if (!snapGuide) snapGuide = { type: 'wall_right', coord: room.width };
      snappedWallOrLine = true;
    }

    // 2. Check Beam snapping if not wall snapped on that axis
    if (snappedY === rawY && room.beams) {
      for (const b of room.beams) {
        if (b.orientation === 'horizontal' || !b.orientation) {
          if (Math.abs(rawY - b.y) <= 25) {
            snappedY = b.y;
            snapLabel = snapLabel ? `${snapLabel} · 結構樑 ${b.name}` : `結構橫樑 ${b.name} 軸線 (Y: ${b.y} cm)`;
            snapGuide = { type: 'beam_h', coord: b.y };
            snappedWallOrLine = true;
            break;
          } else if (Math.abs(rawY + bd - b.y) <= 25) {
            snappedY = b.y - bd;
            snapLabel = snapLabel ? `${snapLabel} · 結構樑下沿` : `結構橫樑 ${b.name} 下沿基準線 (Y: ${b.y} cm)`;
            snapGuide = { type: 'beam_h', coord: b.y };
            snappedWallOrLine = true;
            break;
          }
        }
      }
    }

    if (snappedX === rawX && room.beams) {
      for (const b of room.beams) {
        if (b.orientation === 'vertical' && b.x !== undefined) {
          if (Math.abs(rawX - b.x) <= 25) {
            snappedX = b.x;
            snapLabel = snapLabel ? `${snapLabel} · 縱向樑 ${b.name}` : `縱向穿心樑 ${b.name} 軸線 (X: ${b.x} cm)`;
            snapGuide = { type: 'beam_v', coord: b.x };
            snappedWallOrLine = true;
            break;
          }
        }
      }
    }

    // 3. Check Ceiling Drop line
    if (snappedY === rawY && Math.abs(rawY - dropDepth) <= 25) {
      snappedY = dropDepth;
      snapLabel = snapLabel ? `${snapLabel} · 空調降板線` : `空調天花降板交界線 (Y: ${dropDepth} cm)`;
      snapGuide = { type: 'drop', coord: dropDepth };
      snappedWallOrLine = true;
    }

    // 4. Default 5-multiple geometric contract grid snap if not snapped to wall/beam
    if (snappedX === rawX) {
      snappedX = Math.round(rawX / 5) * 5;
    }
    if (snappedY === rawY) {
      snappedY = Math.round(rawY / 5) * 5;
    }
    if (!snappedWallOrLine) {
      snapLabel = `5 倍數工程模數基準線 (X: ${snappedX}, Y: ${snappedY})`;
      snapGuide = { type: 'module', coord: 0 };
    }

    // Clamp inside room
    snappedX = Math.max(0, Math.min(Math.max(0, room.width - bw), snappedX));
    snappedY = Math.max(0, Math.min(Math.max(0, room.length - bd), snappedY));

    return {
      snappedX,
      snappedY,
      snapLabel,
      snapGuide,
    };
  };

  const handleSvgDragOver = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBoxW / rect.width;
    const scaleY = viewBoxH / rect.height;
    const rx = Math.round((e.clientX - rect.left) * scaleX - padding);
    const ry = Math.round((e.clientY - rect.top) * scaleY - padding);

    let targetBlock = draggedBlock;
    if (!targetBlock) {
      try {
        const json = e.dataTransfer.getData('application/json');
        if (json) targetBlock = JSON.parse(json);
      } catch (err) {}
    }
    if (!targetBlock && ghostSnap?.block) {
      targetBlock = ghostSnap.block;
    }
    if (!targetBlock) return;

    const bw = targetBlock.widthCm || 100;
    const bd = targetBlock.depthCm || 60;
    const snapResult = computeSnap(rx, ry, bw, bd, targetBlock);

    setGhostSnap({
      roomX: rx,
      roomY: ry,
      snappedX: snapResult.snappedX,
      snappedY: snapResult.snappedY,
      snapLabel: snapResult.snapLabel,
      snapGuide: snapResult.snapGuide,
      block: targetBlock,
    });
  };

  const handleSvgDragLeave = () => {
    setGhostSnap(null);
  };

  const handleSvgDrop = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    let blockToPlace: PersonalDetailBlockItem | null = draggedBlock || ghostSnap?.block || null;

    if (!blockToPlace) {
      try {
        const json = e.dataTransfer.getData('application/json');
        if (json) blockToPlace = JSON.parse(json);
      } catch (err) {}
    }

    if (!blockToPlace || !svgRef.current) {
      setGhostSnap(null);
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBoxW / rect.width;
    const scaleY = viewBoxH / rect.height;
    const rx = Math.round((e.clientX - rect.left) * scaleX - padding);
    const ry = Math.round((e.clientY - rect.top) * scaleY - padding);

    const bw = blockToPlace.widthCm || 100;
    const bd = blockToPlace.depthCm || 60;
    const { snappedX, snappedY, snapLabel } = computeSnap(rx, ry, bw, bd, blockToPlace);

    const newPlaced: PlacedBlockItem = {
      id: `placed-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      blockId: blockToPlace.id,
      name: blockToPlace.name,
      category: blockToPlace.category,
      subCategory: blockToPlace.subCategory,
      x: snappedX,
      y: snappedY,
      widthCm: bw,
      depthCm: bd,
      heightCm: blockToPlace.heightCm || 75,
      elevationCm: blockToPlace.elevationCm || 0,
      cadLayer: blockToPlace.cadLayer,
      colorIndex: blockToPlace.colorIndex,
      snappedTo: snapLabel,
      hatchData: blockToPlace.hatchData,
      tags: blockToPlace.tags,
      placedAt: new Date().toLocaleTimeString(),
    };

    const updatedPlacedBlocks = [...(room.placedBlocks || []), newPlaced];

    let updatedFurniture = room.furniture ? [...room.furniture] : [];
    if (blockToPlace.category === 'furniture') {
      const furnCategory: any = /sofa|沙發/i.test(blockToPlace.name)
        ? 'cabinet'
        : /bed|床/i.test(blockToPlace.name)
        ? 'bed'
        : /衣櫃|櫃/i.test(blockToPlace.name)
        ? 'wardrobe'
        : /桌|table|desk/i.test(blockToPlace.name)
        ? 'desk_table'
        : 'cabinet';

      updatedFurniture.push({
        id: `f-${Date.now()}`,
        name: blockToPlace.name,
        category: furnCategory,
        x: snappedX,
        y: snappedY,
        width: bw,
        depth: bd,
        height: blockToPlace.heightCm || 75,
        elevation: blockToPlace.elevationCm || 0,
        specNote: `來自專屬圖庫「${blockToPlace.name}」· ${snapLabel}`,
      });
    }

    onUpdateRoom({
      ...room,
      placedBlocks: updatedPlacedBlocks,
      furniture: updatedFurniture,
    });

    onDropBlock?.(blockToPlace, snappedX, snappedY, snapLabel);
    setBeamToast(`✓ 已成功吸附並置入「${blockToPlace.name}」於 ${snapLabel}！`);
    setTimeout(() => setBeamToast(null), 3500);

    setGhostSnap(null);
  };

  const handleRotatePlacedBlock = (blockId: string) => {
    const updated = (room.placedBlocks || []).map((pb) => {
      if (pb.id === blockId) {
        const newW = pb.depthCm;
        const newD = pb.widthCm;
        const newRot = ((pb.rotationDeg || 0) + 90) % 360;
        const clampedX = Math.min(pb.x, Math.max(0, room.width - newW));
        const clampedY = Math.min(pb.y, Math.max(0, room.length - newD));
        return {
          ...pb,
          widthCm: newW,
          depthCm: newD,
          x: clampedX,
          y: clampedY,
          rotationDeg: newRot,
        };
      }
      return pb;
    });
    onUpdateRoom({ ...room, placedBlocks: updated });
    setBeamToast('已旋轉圖塊 90 度！');
    setTimeout(() => setBeamToast(null), 2500);
  };

  const handleAlign5xPlacedBlock = (blockId: string) => {
    const updated = (room.placedBlocks || []).map((pb) => {
      if (pb.id === blockId) {
        const nx = Math.round(pb.x / 5) * 5;
        const ny = Math.round(pb.y / 5) * 5;
        return {
          ...pb,
          x: Math.max(0, Math.min(room.width - pb.widthCm, nx)),
          y: Math.max(0, Math.min(room.length - pb.depthCm, ny)),
          snappedTo: `5 倍數工程模數基準線 (X: ${nx}, Y: ${ny})`,
        };
      }
      return pb;
    });
    onUpdateRoom({ ...room, placedBlocks: updated });
    setBeamToast('已將圖塊位置對齊至 5 倍數工程基準模數！');
    setTimeout(() => setBeamToast(null), 2500);
  };

  const handleDeletePlacedBlock = (blockId: string) => {
    const target = (room.placedBlocks || []).find((b) => b.id === blockId);
    const updated = (room.placedBlocks || []).filter((b) => b.id !== blockId);
    let updatedFurniture = room.furniture || [];
    if (target) {
      updatedFurniture = updatedFurniture.filter((f) => f.name !== target.name);
    }
    onUpdateRoom({ ...room, placedBlocks: updated, furniture: updatedFurniture });
    setSelectedPlacedBlockId(null);
    setBeamToast('已自畫布移除該圖塊！');
    setTimeout(() => setBeamToast(null), 2500);
  };

  const renderGhostVectorGraphic = (
    item: { name: string; category?: string; subCategory?: string; hatchData?: any },
    bw: number,
    bd: number,
    isPlaced: boolean = false
  ) => {
    const strokeCol = isPlaced ? '#38BDF8' : '#67E8F9';
    const isSofa = /沙發|單椅|椅|sofa|chair/i.test(item.name) || /沙發|椅子/i.test(item.subCategory || '');
    const isBed = /床|臥室|bed/i.test(item.name) || /床/i.test(item.subCategory || '');
    const isTable = /桌|茶几|餐桌|中島|檯面|table|desk/i.test(item.name) || /桌/i.test(item.subCategory || '');
    const isWardrobe = /衣櫃|高櫃|電視櫃|玄關櫃|wardrobe|cabinet/i.test(item.name) || /櫃/i.test(item.subCategory || '');
    const isHatch = item.category === 'hatch_pattern' || Boolean(item.hatchData);
    const stairType = item.subCategory?.startsWith('stair:') ? item.subCategory.split(':')[1] : null;

    if (stairType === 'straight') {
      const treads = Math.max(4, Math.min(18, Math.round(bd / 22)));
      return (
        <g>
          <rect x="2" y="2" width={bw - 4} height={bd - 4} fill="#3F5B63" fillOpacity="0.2" stroke={strokeCol} strokeWidth="1.2" />
          {Array.from({ length: treads - 1 }).map((_, idx) => <line key={idx} x1="3" y1={(bd / treads) * (idx + 1)} x2={bw - 3} y2={(bd / treads) * (idx + 1)} stroke={strokeCol} strokeWidth="0.8" />)}
          <path d={`M ${bw / 2} ${bd - 8} L ${bw / 2} 10 M ${bw / 2} 10 l -4 7 M ${bw / 2} 10 l 4 7`} fill="none" stroke="#E0A83C" strokeWidth="1.5" />
        </g>
      );
    }

    if (stairType === 'l_shape') {
      const landing = Math.min(bw, bd) * 0.42;
      return (
        <g>
          <path d={`M2 2 H${landing} V${bd - landing} H${bw - 2} V${bd - 2} H2 Z`} fill="#3F5B63" fillOpacity="0.2" stroke={strokeCol} strokeWidth="1.2" />
          {Array.from({ length: 6 }).map((_, idx) => <line key={`v-${idx}`} x1="3" y1={4 + idx * Math.max(5, (bd - landing - 8) / 6)} x2={landing - 2} y2={4 + idx * Math.max(5, (bd - landing - 8) / 6)} stroke={strokeCol} strokeWidth="0.8" />)}
          {Array.from({ length: 6 }).map((_, idx) => <line key={`h-${idx}`} x1={landing + idx * Math.max(5, (bw - landing - 8) / 6)} y1={bd - landing + 2} x2={landing + idx * Math.max(5, (bw - landing - 8) / 6)} y2={bd - 3} stroke={strokeCol} strokeWidth="0.8" />)}
          <path d={`M ${landing / 2} 8 V ${bd - landing / 2} H ${bw - 8}`} fill="none" stroke="#E0A83C" strokeWidth="1.5" />
        </g>
      );
    }

    if (stairType === 'u_shape') {
      const half = bw / 2;
      const landingH = Math.max(16, bd * 0.22);
      return (
        <g>
          <rect x="2" y="2" width={bw - 4} height={bd - 4} fill="#3F5B63" fillOpacity="0.2" stroke={strokeCol} strokeWidth="1.2" />
          <line x1={half} y1="2" x2={half} y2={bd - landingH} stroke={strokeCol} strokeWidth="1.2" />
          <line x1="2" y1={bd - landingH} x2={bw - 2} y2={bd - landingH} stroke={strokeCol} strokeWidth="1.2" />
          {Array.from({ length: 7 }).map((_, idx) => <React.Fragment key={idx}><line x1="3" y1={4 + idx * (bd - landingH - 6) / 7} x2={half - 2} y2={4 + idx * (bd - landingH - 6) / 7} stroke={strokeCol} strokeWidth="0.75" /><line x1={half + 2} y1={4 + idx * (bd - landingH - 6) / 7} x2={bw - 3} y2={4 + idx * (bd - landingH - 6) / 7} stroke={strokeCol} strokeWidth="0.75" /></React.Fragment>)}
          <path d={`M ${half / 2} 8 V ${bd - landingH / 2} H ${half + half / 2} V 8`} fill="none" stroke="#E0A83C" strokeWidth="1.5" />
        </g>
      );
    }

    if (stairType === 'spiral') {
      const radius = Math.max(8, Math.min(bw, bd) / 2 - 3);
      const cx = bw / 2;
      const cy = bd / 2;
      return (
        <g>
          <circle cx={cx} cy={cy} r={radius} fill="#3F5B63" fillOpacity="0.2" stroke={strokeCol} strokeWidth="1.2" />
          {Array.from({ length: 12 }).map((_, idx) => { const angle = idx * Math.PI / 6; return <line key={idx} x1={cx} y1={cy} x2={cx + Math.cos(angle) * radius} y2={cy + Math.sin(angle) * radius} stroke={strokeCol} strokeWidth="0.75" />; })}
          <circle cx={cx} cy={cy} r="3" fill="#E0A83C" />
          <path d={`M ${cx + radius * 0.7} ${cy} A ${radius * 0.7} ${radius * 0.7} 0 1 0 ${cx} ${cy - radius * 0.7}`} fill="none" stroke="#E0A83C" strokeWidth="1.5" />
        </g>
      );
    }

    if (isSofa) {
      const backH = Math.max(6, bd * 0.28);
      const armW = Math.max(4, bw * 0.15);
      return (
        <g>
          <rect x="2" y="2" width={bw - 4} height={backH} rx="2" fill="#0284C7" fillOpacity="0.4" stroke={strokeCol} strokeWidth="1" />
          <rect x="2" y={backH + 1} width={armW} height={bd - backH - 3} rx="2" fill="#0284C7" fillOpacity="0.35" stroke={strokeCol} strokeWidth="1" />
          <rect x={bw - armW - 2} y={backH + 1} width={armW} height={bd - backH - 3} rx="2" fill="#0284C7" fillOpacity="0.35" stroke={strokeCol} strokeWidth="1" />
          {bw > 80 && (
            <line x1={bw / 2} y1={backH + 2} x2={bw / 2} y2={bd - 2} stroke={strokeCol} strokeWidth="1" strokeDasharray="3 2" />
          )}
        </g>
      );
    }

    if (isBed) {
      const headH = Math.max(6, bd * 0.16);
      return (
        <g>
          <rect x="0" y="0" width={bw} height={headH} rx="1" fill="#0284C7" fillOpacity="0.45" stroke={strokeCol} strokeWidth="1" />
          <rect x={bw * 0.12} y={headH + 2} width={bw * 0.32} height={bd * 0.22} rx="2" fill="#0369A1" fillOpacity="0.3" stroke={strokeCol} strokeWidth="1" />
          <rect x={bw * 0.56} y={headH + 2} width={bw * 0.32} height={bd * 0.22} rx="2" fill="#0369A1" fillOpacity="0.3" stroke={strokeCol} strokeWidth="1" />
          <line x1="4" y1={bd * 0.5} x2={bw - 4} y2={bd * 0.5} stroke={strokeCol} strokeWidth="1" strokeDasharray="3 2" />
        </g>
      );
    }

    if (isTable) {
      return (
        <g>
          <rect x="2" y="2" width={bw - 4} height={bd - 4} rx="3" fill="#0284C7" fillOpacity="0.25" stroke={strokeCol} strokeWidth="1.2" />
          <rect x={bw * 0.25} y={bd * 0.3} width={bw * 0.5} height={bd * 0.4} rx="2" fill="#0369A1" fillOpacity="0.3" stroke={strokeCol} strokeWidth="0.8" />
        </g>
      );
    }

    if (isWardrobe) {
      return (
        <g>
          <rect x="2" y="2" width={bw - 4} height={bd - 4} rx="1" fill="#0284C7" fillOpacity="0.25" stroke={strokeCol} strokeWidth="1.2" />
          <line x1="8" y1={bd / 2} x2={bw - 8} y2={bd / 2} stroke={strokeCol} strokeWidth="1" strokeDasharray="4 2" />
          <line x1={bw / 2} y1="2" x2={bw / 2} y2={bd - 2} stroke={strokeCol} strokeWidth="0.8" />
        </g>
      );
    }

    if (isHatch) {
      return (
        <g>
          {Array.from({ length: Math.min(10, Math.ceil(bw / 20)) }).map((_, idx) => (
            <line
              key={idx}
              x1={idx * 20}
              y1="0"
              x2={idx * 20 + bd}
              y2={bd}
              stroke={strokeCol}
              strokeWidth="0.8"
              strokeDasharray="4 2"
              opacity="0.6"
            />
          ))}
        </g>
      );
    }

    return (
      <g>
        <rect x="2" y="2" width={bw - 4} height={bd - 4} rx="2" fill="#0284C7" fillOpacity="0.2" stroke={strokeCol} strokeWidth="1" />
        <line x1="2" y1="2" x2={bw - 2} y2={bd - 2} stroke={strokeCol} strokeWidth="0.6" opacity="0.4" />
        <line x1="2" y1={bd - 2} x2={bw - 2} y2="2" stroke={strokeCol} strokeWidth="0.6" opacity="0.4" />
      </g>
    );
  };

  // 根據 currentRoom 的 beamHeight 和 ceilingDrop 值，自動檢查梁下空間是否低於規範標準
  const violations = useMemo<ClearanceViolation[]>(() => {
    if (!autoDetectEnabled) return [];
    const list: ClearanceViolation[] = [];

    // 1. 檢驗結構樑梁下淨高 (針對每支樑實測值及 currentRoom.beamHeight)
    room.beams.forEach((beam) => {
      const clearH = beam.clearHeight ?? room.beamHeight;
      if (clearH < standardThreshold) {
        const bx = beam.orientation === 'vertical' ? (beam.x ?? 0) : (beam.x ?? 0);
        const by = beam.y;
        const bw = beam.orientation === 'vertical' ? beam.width : (beam.depth || room.width);
        const bh = beam.orientation === 'vertical' ? (beam.depth || room.length) : beam.width;

        list.push({
          id: `viol-beam-${beam.id}`,
          type: 'beam',
          targetId: beam.id,
          name: beam.name,
          measuredHeight: clearH,
          standardHeight: standardThreshold,
          diff: standardThreshold - clearH,
          bounds: {
            x: bx,
            y: by,
            width: bw,
            height: bh,
          },
          reason: `實測梁下淨高 ${clearH} cm 低於規範標準 ${standardThreshold} cm (不足 ${standardThreshold - clearH} cm)，易造成空間壓迫與人體碰撞風險。`,
          solution: `依《降板裁決_v003》調整結構假樑包覆或調升高層至 230cm / 265cm (5倍數)。`,
          severity: clearH < 210 ? 'CRITICAL' : 'WARNING',
        });
      }

      // 檢查樑與空調天花降板交會之雙重壓迫區
      if (beam.y < dropDepth) {
        const overlapHeight = Math.min(beam.width, dropDepth - beam.y);
        const effectiveClearance = Math.min(clearH, room.ceilingDrop);
        if (effectiveClearance < standardThreshold) {
          list.push({
            id: `viol-overlap-${beam.id}`,
            type: 'beam_drop_overlap',
            targetId: beam.id,
            name: `${beam.name} × 空調降板複合干涉區`,
            measuredHeight: effectiveClearance,
            standardHeight: standardThreshold,
            diff: standardThreshold - effectiveClearance,
            bounds: {
              x: 0,
              y: beam.y,
              width: room.width,
              height: overlapHeight,
            },
            reason: `結構梁穿過降板區，空間淨高受雙重壓迫至 ${effectiveClearance} cm，低於規範 ${standardThreshold} cm！`,
            solution: `調整室內機吊裝位置或出風口迴風箱避讓橫樑，避免樑下降板重疊。`,
            severity: 'CRITICAL',
          });
        }
      }
    });

    // 2. 檢驗空間基準梁下高度 room.beamHeight
    if (room.beamHeight < standardThreshold && !room.beams.some((b) => (b.clearHeight ?? room.beamHeight) === room.beamHeight)) {
      list.push({
        id: `viol-room-beam-${room.id}`,
        type: 'beam',
        targetId: room.id,
        name: `${room.roomName} 空間基準大樑`,
        measuredHeight: room.beamHeight,
        standardHeight: standardThreshold,
        diff: standardThreshold - room.beamHeight,
        bounds: {
          x: 0,
          y: Math.round(room.length * 0.4),
          width: room.width,
          height: 35,
        },
        reason: `空間基準梁下淨高標高 ${room.beamHeight} cm 低於規範標準 ${standardThreshold} cm (不足 ${standardThreshold - room.beamHeight} cm)。`,
        solution: `重新檢視建築結構樑底標高，修正為符合室內設計規範之 265 cm。`,
        severity: room.beamHeight < 210 ? 'CRITICAL' : 'WARNING',
      });
    }

    // 3. 檢驗天花降板 room.ceilingDrop 值是否低於規範標準 (例如小於 215cm 衛廚標準或低於居室門檻)
    if (room.ceilingDrop < 215 || (room.ceilingDrop < standardThreshold && room.ceilingDrop < 230)) {
      list.push({
        id: `viol-drop-${room.id}`,
        type: 'ceiling_drop',
        targetId: room.id,
        name: '空調天花降板區',
        measuredHeight: room.ceilingDrop,
        standardHeight: Math.max(215, standardThreshold),
        diff: Math.max(215, standardThreshold) - room.ceilingDrop,
        bounds: {
          x: 0,
          y: 0,
          width: room.width,
          height: dropDepth,
        },
        reason: `空調降板標高 CH:${room.ceilingDrop} cm 低於降板規範底線，室內頭部活動淨空受限。`,
        solution: `改選超薄型吊隱室內機 (厚度 <= 20cm)，將天花降板回升至 230 cm。`,
        severity: room.ceilingDrop < 210 ? 'CRITICAL' : 'WARNING',
      });
    }

    return list;
  }, [autoDetectEnabled, room, standardThreshold, dropDepth]);

  // 測試模擬違規情境（快速將梁下設為 220 cm）
  const handleSimulateViolation = () => {
    if (room.beams.length > 0) {
      const updatedBeams = room.beams.map((b, idx) =>
        idx === 0 ? { ...b, clearHeight: 220 } : b
      );
      onUpdateRoom({
        ...room,
        beamHeight: 220,
        beams: updatedBeams,
      });
    } else {
      onUpdateRoom({
        ...room,
        beamHeight: 220,
        ceilingDrop: 210,
      });
    }
  };

  // 一鍵依5 倍數幾何契約規範修復至 265 cm / 230 cm
  const handleFixCompliance = () => {
    const updatedBeams = room.beams.map((b) => ({
      ...b,
      clearHeight: 265,
    }));
    onUpdateRoom({
      ...room,
      beamHeight: 265,
      ceilingDrop: 230,
      beams: updatedBeams,
    });
  };

  // 畫布座標轉換工具
  const getRoomCoords = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = viewBoxW / rect.width;
    const scaleY = viewBoxH / rect.height;
    const roomX = Math.round(clickX * scaleX - padding);
    const roomY = Math.round(clickY * scaleY - padding);

    return {
      x: Math.max(0, Math.min(room.width, roomX)),
      y: Math.max(0, Math.min(room.length, roomY)),
    };
  };

  // 互動框選特殊梁體事件處理
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isMarkingSpecialBeam) return;
    const coords = getRoomCoords(e);
    if (!coords) return;
    setDragStart(coords);
    setDragCurrent(coords);
    setIsDraggingBeam(true);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDraggingBeam || !dragStart) return;
    const coords = getRoomCoords(e);
    if (!coords) return;
    setDragCurrent(coords);
  };

  const handleMouseUp = () => {
    if (!isDraggingBeam || !dragStart || !dragCurrent) return;
    setIsDraggingBeam(false);

    const minX = Math.min(dragStart.x, dragCurrent.x);
    const minY = Math.min(dragStart.y, dragCurrent.y);
    const rawW = Math.abs(dragCurrent.x - dragStart.x);
    const rawH = Math.abs(dragCurrent.y - dragStart.y);

    const isHorizontal = rawW >= rawH;
    const widthVal = isHorizontal ? Math.max(25, rawH > 10 ? rawH : 35) : Math.max(25, rawW > 10 ? rawW : 35);
    const depthVal = isHorizontal ? Math.max(40, rawW > 15 ? rawW : room.width) : Math.max(40, rawH > 15 ? rawH : room.length);

    const nextIdx = room.beams.length + 1;
    const newDraft: Beam = {
      id: `b-spec-${Date.now().toString().slice(-4)}`,
      name: `特殊結構梁 SB-0${nextIdx}`,
      width: widthVal,
      depth: depthVal,
      clearHeight: 265, // 預設符合5 倍數契約
      orientation: isHorizontal ? 'horizontal' : 'vertical',
      x: isHorizontal && rawW <= 25 ? 0 : minX,
      y: !isHorizontal && rawH <= 25 ? 0 : minY,
    };

    setEditingBeam(newDraft);
    setShowBeamModal(true);
    setDragStart(null);
    setDragCurrent(null);
  };

  const handleSaveBeam = (beamToSave: Beam) => {
    const exists = room.beams.some((b) => b.id === beamToSave.id);
    let updatedBeams: Beam[];
    if (exists) {
      updatedBeams = room.beams.map((b) => (b.id === beamToSave.id ? beamToSave : b));
    } else {
      updatedBeams = [...room.beams, beamToSave];
    }

    onUpdateRoom({
      ...room,
      beams: updatedBeams,
    });

    setShowBeamModal(false);
    setEditingBeam(null);
    setSelectedBeamId(beamToSave.id);
    setBeamToast(`已更新特殊梁體「${beamToSave.name}」(淨高:${beamToSave.clearHeight}cm)，已即時同步至 beams 陣列與 3D 模擬！`);
    setTimeout(() => setBeamToast(null), 4000);
  };

  const handleDeleteBeam = (beamId: string) => {
    const updatedBeams = room.beams.filter((b) => b.id !== beamId);
    onUpdateRoom({
      ...room,
      beams: updatedBeams,
    });
    if (selectedBeamId === beamId) setSelectedBeamId(null);
    setBeamToast(`已移除特殊梁體，3D 幾何模型與 beams 陣列已同步更新！`);
    setTimeout(() => setBeamToast(null), 3000);
  };

  const handleApplyPresetBeam = (presetType: 'horizontal_main' | 'vertical_spine' | 'ac_duct' | 'plumbing_soffit') => {
    const nextIdx = room.beams.length + 1;
    let preset: Beam;

    if (presetType === 'horizontal_main') {
      preset = {
        id: `b-spec-${Date.now().toString().slice(-4)}`,
        name: `跨室特殊大梁 SB-0${nextIdx}`,
        width: 40,
        depth: room.width,
        clearHeight: 265,
        orientation: 'horizontal',
        x: 0,
        y: Math.round(room.length * 0.45),
      };
    } else if (presetType === 'vertical_spine') {
      preset = {
        id: `b-spec-${Date.now().toString().slice(-4)}`,
        name: `縱向特殊穿心梁 SB-0${nextIdx}`,
        width: 35,
        depth: room.length,
        clearHeight: 265,
        orientation: 'vertical',
        x: Math.round(room.width * 0.5),
        y: 0,
      };
    } else if (presetType === 'ac_duct') {
      preset = {
        id: `b-spec-${Date.now().toString().slice(-4)}`,
        name: `冷氣出風特殊穿孔假梁 SB-0${nextIdx}`,
        width: 45,
        depth: 140,
        clearHeight: 230,
        orientation: 'horizontal',
        x: Math.round(room.width * 0.1),
        y: Math.round(room.length * 0.2),
      };
    } else {
      preset = {
        id: `b-spec-${Date.now().toString().slice(-4)}`,
        name: `廚衛管線穿越特殊梁 SB-0${nextIdx}`,
        width: 35,
        depth: 180,
        clearHeight: 215,
        orientation: 'vertical',
        x: Math.round(room.width * 0.75),
        y: Math.round(room.length * 0.15),
      };
    }

    handleSaveBeam(preset);
    setShowPresetsMenu(false);
  };

  const handleDeleteSelectedMepOrLighting = () => {
    if (selectedMepId) {
      const updatedMep = (room.electricalPoints || []).filter((p) => p.id !== selectedMepId);
      onUpdateRoom({ ...room, electricalPoints: updatedMep });
      setSelectedMepId(null);
      setMepToast('已刪除水電放樣標示圖元');
      setTimeout(() => setMepToast(null), 2500);
    } else if (selectedLightingId) {
      const updatedLight = (room.lightingPoints || []).filter((p) => p.id !== selectedLightingId);
      onUpdateRoom({ ...room, lightingPoints: updatedLight });
      setSelectedLightingId(null);
      setMepToast('已刪除燈具放樣標示圖元');
      setTimeout(() => setMepToast(null), 2500);
    }
  };

  const handleLoadStandardMepPresets = () => {
    // 依據標準工程配置自動載入 5 倍數放樣矩陣
    const w = room.width;
    const l = room.length;

    const presetMep: ElectricalPoint[] = [
      { id: 'mep-sw-1', type: 'switch', name: '入口雙切開關', x: 25, y: l - 35, elevation: 120, circuit: 'SW1' },
      { id: 'mep-so-1', type: 'socket_110v', name: '電視櫃雙聯插座', x: Math.round((w * 0.3) / 5) * 5, y: 15, elevation: 30, circuit: 'E1' },
      { id: 'mep-so-2', type: 'socket_110v', name: '沙發側邊插座', x: 20, y: Math.round((l * 0.5) / 5) * 5, elevation: 30, circuit: 'E1' },
      { id: 'mep-so-3', type: 'socket_220v', name: '冷氣專用插座', x: w - 30, y: 25, elevation: 220, circuit: 'E2-SPEC' },
      { id: 'mep-net-1', type: 'network', name: 'Cat6 資訊插座', x: Math.round((w * 0.3) / 5) * 5 + 30, y: 15, elevation: 30, circuit: 'LAN' },
      { id: 'mep-wat-1', type: 'water_supply', name: '給水栓預留口', x: w - 25, y: l - 40, elevation: 50, circuit: 'P1' },
    ];

    const presetLighting: LightingPoint[] = [
      { id: 'lite-dw-1', type: 'downlight', name: '四角防眩崁燈 A', x: 90, y: 90, elevation: 265, colorTemp: '3000K', circuit: 'L1' },
      { id: 'lite-dw-2', type: 'downlight', name: '四角防眩崁燈 B', x: w - 90, y: 90, elevation: 265, colorTemp: '3000K', circuit: 'L1' },
      { id: 'lite-dw-3', type: 'downlight', name: '四角防眩崁燈 C', x: 90, y: l - 90, elevation: 265, colorTemp: '3000K', circuit: 'L1' },
      { id: 'lite-dw-4', type: 'downlight', name: '四角防眩崁燈 D', x: w - 90, y: l - 90, elevation: 265, colorTemp: '3000K', circuit: 'L1' },
      { id: 'lite-pd-1', type: 'pendant', name: '中島造型吊燈', x: Math.round((w / 2) / 5) * 5, y: Math.round((l / 2) / 5) * 5, elevation: 210, colorTemp: '2700K', circuit: 'L2' },
    ];

    onUpdateRoom({
      ...room,
      electricalPoints: presetMep,
      lightingPoints: presetLighting,
    });
    setSelectedLightingId('lite-dw-1');
    setMepToast('✓ 已一鍵載入室內設計水電與燈具 5 倍數標準放樣矩陣！');
    setTimeout(() => setMepToast(null), 3500);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isMarkingSpecialBeam) return;

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to SVG coordinates
    const scaleX = viewBoxW / rect.width;
    const scaleY = viewBoxH / rect.height;
    let roomX = Math.round(clickX * scaleX - padding);
    let roomY = Math.round(clickY * scaleY - padding);

    // 現場水電與燈具即時點選置入 (mep mode)
    if (activeViewMode === 'mep' && activeStakingTool !== 'select') {
      if (roomX >= 0 && roomX <= room.width && roomY >= 0 && roomY <= room.length) {
        if (snap5x) {
          roomX = Math.round(roomX / 5) * 5;
          roomY = Math.round(roomY / 5) * 5;
        }

        if (
          activeStakingTool === 'socket_110v' ||
          activeStakingTool === 'socket_220v' ||
          activeStakingTool === 'switch' ||
          activeStakingTool === 'network' ||
          activeStakingTool === 'water_supply'
        ) {
          const is220 = activeStakingTool === 'socket_220v';
          const isSw = activeStakingTool === 'switch';
          const isNet = activeStakingTool === 'network';
          const isWater = activeStakingTool === 'water_supply';

          const nextId = `mep-${Date.now().toString().slice(-4)}`;
          const newMep: ElectricalPoint = {
            id: nextId,
            type: activeStakingTool,
            name: is220
              ? '220V 專用插座'
              : isSw
              ? '雙切開關'
              : isNet
              ? 'Cat6 網路'
              : isWater
              ? '給水栓口'
              : '110V 雙聯插座',
            x: roomX,
            y: roomY,
            elevation: isSw ? 120 : isWater ? 50 : 30,
            circuit: is220 ? 'E2-SPEC' : isSw ? 'SW1' : isNet ? 'LAN' : isWater ? 'P1' : 'E1',
          };

          const updatedMepList = [...(room.electricalPoints || []), newMep];
          onUpdateRoom({
            ...room,
            electricalPoints: updatedMepList,
          });
          setSelectedMepId(nextId);
          setSelectedLightingId(null);
          setMepToast(`已放樣置入「${newMep.name}」[X:${roomX}, Y:${roomY}, H+${newMep.elevation}cm]！`);
          setTimeout(() => setMepToast(null), 3000);
          return;
        } else if (
          activeStakingTool === 'downlight' ||
          activeStakingTool === 'spotlight' ||
          activeStakingTool === 'pendant'
        ) {
          const nextId = `lite-${Date.now().toString().slice(-4)}`;
          const newLight: LightingPoint = {
            id: nextId,
            type: activeStakingTool,
            name:
              activeStakingTool === 'downlight'
                ? '7.5cm 防眩崁燈'
                : activeStakingTool === 'spotlight'
                ? '軌道聚光射燈'
                : '中島造型吊燈',
            x: roomX,
            y: roomY,
            elevation: activeStakingTool === 'pendant' ? 210 : 265,
            colorTemp: '3000K',
            circuit: 'L1',
          };

          const updatedLightingList = [...(room.lightingPoints || []), newLight];
          onUpdateRoom({
            ...room,
            lightingPoints: updatedLightingList,
          });
          setSelectedLightingId(nextId);
          setSelectedMepId(null);
          setMepToast(`已放樣置入「${newLight.name}」[X:${roomX}, Y:${roomY}, FL+${newLight.elevation}cm]！`);
          setTimeout(() => setMepToast(null), 3000);
          return;
        }
      }
    }

    if (!isAddingPin) return;

    if (roomX >= 0 && roomX <= room.width && roomY >= 0 && roomY <= room.length) {
      const newMemo: VoiceMemo = {
        id: `vm-${Date.now().toString().slice(-4)}`,
        text: `現場新增口說標記 [${roomX}, ${roomY}]：結構樑與開孔查驗`,
        timestamp: new Date().toTimeString().slice(0, 8),
        x: roomX,
        y: roomY,
        type: 'info',
        audioDurationSec: 4.5,
      };
      onUpdateRoom({
        ...room,
        voiceMemos: [...room.voiceMemos, newMemo],
      });
      setIsAddingPin(false);
      onSelectVoiceMemo(newMemo);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-b border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium text-slate-300">
            <Ruler className="w-3.5 h-3.5 text-blue-400" />
            <span>開間：{room.width} cm</span>
            <span className="text-slate-600">|</span>
            <span>進深：{room.length} cm</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-mono">淨高：{room.height} cm</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveViewMode('staking')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeViewMode === 'staking'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D 放樣尺寸
            </button>
            <button
              onClick={() => setActiveViewMode('voice_match')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                activeViewMode === 'voice_match'
                  ? 'bg-purple-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3 h-3 text-pink-300" />
              口說匹配圖
            </button>
            <button
              onClick={() => setActiveViewMode('ceiling_drop')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                activeViewMode === 'ceiling_drop'
                  ? 'bg-amber-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3 text-amber-300" />
              天花降板 (265/230/215)
            </button>
            <button
              onClick={() => {
                setActiveViewMode('mep');
                setActiveStakingTool('select');
              }}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                activeViewMode === 'mep'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3 h-3 text-cyan-300" />
              水電/燈具放樣
            </button>
          </div>

          {/* 🌟 星玥灣幾何契約：自動尺寸鏈工具按鈕 */}
          <button
            onClick={() => setShowAutoDimensionChain(!showAutoDimensionChain)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              !showAutoDimensionChain
                ? 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
                : dimensionChainResult.violationsCount > 0
                ? 'bg-red-950/90 text-red-200 border-2 border-red-500 shadow-md shadow-red-900/40 animate-pulse'
                : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
            }`}
            title="自動計算牆面與梁的間距尺寸鏈，產生星玥灣5倍數尺寸標註；非5倍數以紅框警示"
          >
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            <span>自動尺寸鏈</span>
            {dimensionChainResult.violationsCount > 0 ? (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold animate-pulse">
                {dimensionChainResult.violationsCount} 處紅框
              </span>
            ) : (
              <span className="bg-emerald-900/90 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                5X 合規
              </span>
            )}
          </button>

          <button
            onClick={() => setShowDimensionChainModal(true)}
            className="px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition"
            title="開啟星玥灣尺寸鏈放樣檢核總表與一鍵校正"
          >
            <span>尺寸鏈清冊</span>
          </button>

          {/* Auto Clearance Compliance Indicator & Inspector Button */}
          <button
            onClick={() => setShowInspectorPanel(!showInspectorPanel)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              !autoDetectEnabled
                ? 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
                : violations.length > 0
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse border border-red-400/60 shadow-lg shadow-red-600/30'
                : 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60'
            }`}
            title="點擊展開梁下空間淨高自動檢測與法規標準面板"
          >
            {!autoDetectEnabled ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>淨高檢測已停用</span>
              </>
            ) : violations.length > 0 ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                <span>⚠️ 梁下違規 ({violations.length} 處)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>梁下合規 (≥{standardThreshold}cm)</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Auto-generate Wall Elevations Button */}
          <button
            onClick={() => {
              setElevationTargetWall('all');
              setShowWallElevations(true);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/30 active:scale-95"
            title="自動生成四面牆立面展開圖：根據當前房間尺寸、梁高與窗戶位置自動演算四面牆立面展開視圖"
          >
            <Columns3 className="w-3.5 h-3.5 text-sky-200" />
            <span>自動生成牆面立面圖</span>
            <span className="bg-sky-950/80 text-sky-200 border border-sky-400/40 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              4面展開
            </span>
          </button>

          {/* Interactive Special Beam Marking Mode Button */}
          <button
            onClick={() => {
              setIsMarkingSpecialBeam(!isMarkingSpecialBeam);
              if (!isMarkingSpecialBeam) setIsAddingPin(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              isMarkingSpecialBeam
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 ring-2 ring-rose-400 animate-pulse'
                : 'bg-slate-800 text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 border border-rose-500/30'
            }`}
            title="啟動特殊梁體標註模式：直接在畫布上框選區域或置入特殊結構梁/造型假梁"
          >
            <BoxSelect className="w-3.5 h-3.5 text-rose-400" />
            <span>{isMarkingSpecialBeam ? '框選特殊梁中...' : '標註特殊梁體'}</span>
            <span className="bg-rose-950 text-rose-300 border border-rose-800/80 text-[10px] px-1 py-0.2 rounded font-mono">
              {room.beams.length}
            </span>
          </button>

          {/* Quick Beam Presets Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
              title="快速置入室內設計常見特殊梁體預設"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>快速置梁</span>
            </button>

            {showPresetsMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs backdrop-blur-md">
                <div className="text-[10px] text-slate-400 font-semibold px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                  <span>選擇特殊梁體類型</span>
                  <span className="text-emerald-400">5倍數規範</span>
                </div>
                <button
                  onClick={() => handleApplyPresetBeam('horizontal_main')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    全跨結構大梁 (40cm 橫跨)
                  </span>
                  <span className="text-[10px] text-slate-400">梁下淨高 265 cm · 貫穿全開間</span>
                </button>
                <button
                  onClick={() => handleApplyPresetBeam('vertical_spine')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    縱向穿心梁 (35cm 直向)
                  </span>
                  <span className="text-[10px] text-slate-400">梁下淨高 265 cm · 貫穿全進深</span>
                </button>
                <button
                  onClick={() => handleApplyPresetBeam('ac_duct')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    冷氣穿孔造型假梁 (45×140cm)
                  </span>
                  <span className="text-[10px] text-slate-400">梁下淨高 230 cm · 銜接降板區</span>
                </button>
                <button
                  onClick={() => handleApplyPresetBeam('plumbing_soffit')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    廚衛管線穿越假梁 (35×180cm)
                  </span>
                  <span className="text-[10px] text-slate-400">梁下淨高 215 cm · 管道避讓</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Switch to 3D Button */}
          {onSwitchTo3D && (
            <button
              onClick={onSwitchTo3D}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5 transition-all shadow-sm"
              title="前往 3D 一致性模擬渲染視圖即時檢視"
            >
              <Box className="w-3.5 h-3.5 text-indigo-400" />
              <span>3D 即時檢視</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsAddingPin(!isAddingPin);
              if (!isAddingPin) setIsMarkingSpecialBeam(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              isAddingPin
                ? 'bg-pink-600 text-white shadow-lg animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="點擊畫布置入新口說標記錨點"
          >
            <MapPin className="w-3.5 h-3.5" />
            {isAddingPin ? '點擊落點...' : '新增錨點'}
          </button>

          {/* AI 智能虛擬標註切換按鈕 */}
          <button
            onClick={() => setShowVirtualAnnotations(!showVirtualAnnotations)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              showVirtualAnnotations
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-cyan-900/40 border border-cyan-400/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
            title="切換顯示由語音備忘錄智能解析長度與高度建立的 AI 虛擬標註點"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>AI 虛擬標註</span>
            <span className="bg-cyan-950/80 text-cyan-200 text-[10px] px-1.5 py-0.2 rounded-full border border-cyan-700/60 font-mono font-bold">
              {room.virtualAnnotations?.length || 0}
            </span>
          </button>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="縮小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-400">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="放大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="適應視窗"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => downloadDxfFile(room, '室內設計_放樣圖')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-md transition-all active:scale-95"
            title="匯出符合 AutoCAD R12/2000 標準 DXF"
          >
            <Download className="w-3.5 h-3.5" />
            匯出 AutoCAD .DXF
          </button>
        </div>
      </div>

      {/* SVG Canvas Stage */}
      <div className="relative flex-1 overflow-auto flex items-center justify-center p-4 bg-[#0B1120]">
        {/* Special Beam Interactive Mode Floating Banner */}
        {isMarkingSpecialBeam && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border-2 border-rose-500/80 shadow-2xl shadow-rose-950/60 rounded-xl px-4 py-2 flex items-center gap-3 text-xs backdrop-blur-md">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <div className="text-slate-200">
              <strong className="text-rose-400 font-bold">特殊梁體標註模式中：</strong>
              在畫布上按住滑鼠左鍵並<span className="text-white underline">拖曳框選區域</span>，鬆開後即刻設定規格並同步至 3D 模擬！
            </div>
            <button
              onClick={() => setIsMarkingSpecialBeam(false)}
              className="ml-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold transition-all border border-slate-700"
            >
              離開模式
            </button>
          </div>
        )}

        {/* Action Feedback Toast */}
        {beamToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-emerald-500/70 shadow-2xl rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-white backdrop-blur-md animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{beamToast}</span>
            {onSwitchTo3D && (
              <button
                onClick={onSwitchTo3D}
                className="ml-2 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-bold flex items-center gap-1"
              >
                <span>查看 3D</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* MEP Staking Feedback Toast */}
        {mepToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-cyan-500/70 shadow-2xl rounded-xl px-4 py-2 flex items-center gap-2 text-xs text-white backdrop-blur-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{mepToast}</span>
          </div>
        )}

        {/* 現場水電與燈具即時放樣浮動控制列 (iPad / 現場水電模式) */}
        {(activeViewMode === 'mep' || activeStakingTool !== 'select') && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-4xl">
            <FieldStakingControlBar
              activeTool={activeStakingTool}
              setActiveTool={setActiveStakingTool}
              snap5x={snap5x}
              setSnap5x={setSnap5x}
              selectedMepId={selectedMepId}
              selectedLightingId={selectedLightingId}
              room={room}
              onDeleteSelected={handleDeleteSelectedMepOrLighting}
              onClearSelection={() => {
                setSelectedMepId(null);
                setSelectedLightingId(null);
              }}
              onLoadStandardPresets={handleLoadStandardMepPresets}
            />
          </div>
        )}

        {/* USER REQUESTED: 拖拽圖塊至畫布提示浮動列 */}
        {(draggedBlock || ghostSnap) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border-2 border-cyan-500/80 shadow-2xl shadow-cyan-950/60 rounded-xl px-4 py-2 flex items-center gap-3 text-xs backdrop-blur-md animate-in fade-in">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div className="text-slate-200">
              <strong className="text-cyan-400 font-bold">🧲 圖塊磁吸放樣中：</strong>
              拖曳「<span className="text-white font-bold">{ghostSnap?.block.name || draggedBlock?.name}</span>」在畫布上移動，自動吸附至最近牆面與施工基準線！
            </div>
            {ghostSnap && (
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono text-[11px]">
                {ghostSnap.snapLabel}
              </span>
            )}
          </div>
        )}

        {/* 🌟 星玥灣自動尺寸鏈：非 5 倍數紅框即時警示浮動列 */}
        {showAutoDimensionChain && dimensionChainResult.violationsCount > 0 && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-red-950/95 border-2 border-red-500 shadow-2xl shadow-red-950/80 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs text-red-100 backdrop-blur-md animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
            <div>
              <strong className="text-white font-bold">⚠️ 星玥灣幾何契約警示：</strong>
              偵測到 <span className="text-red-300 font-bold underline font-mono">{dimensionChainResult.violationsCount} 處非 5 倍數間距</span>，已在圖面以<strong>紅框警示</strong>標註！
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => {
                  const updated = snapRoomBeamsToRule5(room);
                  onUpdateRoom(updated);
                  setBeamToast('✨ 已一鍵將所有梁體間距對齊星玥灣 5 倍數幾何契約！');
                  setTimeout(() => setBeamToast(null), 3000);
                }}
                className="px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-lg text-[11px] shadow transition flex items-center gap-1 active:scale-95"
              >
                <Wrench className="w-3 h-3" />
                <span>一鍵 5 倍數校準</span>
              </button>
              <button
                onClick={() => setShowDimensionChainModal(true)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium rounded-lg text-[11px] border border-red-500/50 transition"
              >
                查看檢核表
              </button>
            </div>
          </div>
        )}

        <svg
          ref={svgRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          onDragOver={handleSvgDragOver}
          onDragLeave={handleSvgDragLeave}
          onDrop={handleSvgDrop}
          viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          className="w-full max-w-4xl h-auto select-none transition-transform duration-200"
          style={{
            transform: `scale(${zoom})`,
            cursor: (draggedBlock || ghostSnap) ? 'copy' : isMarkingSpecialBeam ? 'crosshair' : isAddingPin ? 'crosshair' : 'default',
          }}
        >
          <defs>
            {/* Ghost and Snap Guideline Glow */}
            <filter id="ghostGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#38BDF8" floodOpacity="0.85" />
            </filter>
            <filter id="snapGuideGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22D3EE" floodOpacity="0.95" />
            </filter>
            {/* Engineering Grid Pattern */}
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" />
            </pattern>
            {/* Beam Hatch Pattern */}
            <pattern id="beamHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.4" />
            </pattern>
            {/* Special Beam Hatch Pattern */}
            <pattern id="specialBeamHatch" width="8" height="8" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#F43F5E" strokeWidth="1.2" strokeOpacity="0.55" />
            </pattern>
            {/* Ceiling Drop Hatch */}
            <pattern id="dropHatch" width="10" height="10" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#F59E0B" strokeWidth="0.8" strokeOpacity="0.3" />
            </pattern>

            {/* Warning Hazard Stripe Pattern for Beam Clearance Violations */}
            <pattern
              id="violationHatchPattern"
              width="14"
              height="14"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="14" stroke="#EF4444" strokeWidth="4" strokeOpacity="0.85" />
              <line x1="7" y1="0" x2="7" y2="14" stroke="#7F1D1D" strokeWidth="3" strokeOpacity="0.6" />
            </pattern>

            {/* Overlap Double Conflict Grid Pattern */}
            <pattern
              id="conflictMeshPattern"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="10" y2="10" stroke="#F59E0B" strokeWidth="1.8" strokeOpacity="0.95" />
              <line x1="10" y1="0" x2="0" y2="10" stroke="#DC2626" strokeWidth="1.8" strokeOpacity="0.95" />
            </pattern>

            {/* Glowing filter for high-visibility alert boundaries */}
            <filter id="violationGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EF4444" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Grid background */}
          {showGrid && (
            <rect x="0" y="0" width={viewBoxW} height={viewBoxH} fill="url(#gridPattern)" />
          )}

          {/* Main Space Group */}
          <g transform={`translate(${padding}, ${padding})`}>
            {/* Floor Slab background */}
            <rect
              x="0"
              y="0"
              width={room.width}
              height={room.length}
              fill="#0F172A"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Ceiling Drop Zone (降板 230 / 215) */}
            {(activeViewMode === 'ceiling_drop' || activeViewMode === 'staking') && (
              <g>
                <rect
                  x="0"
                  y="0"
                  width={room.width}
                  height={dropDepth}
                  fill="url(#dropHatch)"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <rect
                  x="10"
                  y="10"
                  width="180"
                  height="26"
                  rx="4"
                  fill="#78350F"
                  fillOpacity="0.85"
                />
                <text x="18" y="27" fill="#FDE68A" fontSize="11" fontWeight="bold">
                  空調降板區 CH:{room.ceilingDrop} cm (5倍數)
                </text>
              </g>
            )}

            {/* Beams (梁體渲染層：支援橫向、縱向、局部特殊梁與互動選取) */}
            {room.beams.map((b) => {
              const isSpecial =
                b.id.includes('spec') ||
                b.name.includes('特殊') ||
                b.orientation === 'vertical' ||
                (b.depth !== undefined && b.depth < room.width);
              const isSelected = selectedBeamId === b.id;

              let bx = 0;
              let by = b.y;
              let bw = room.width;
              let bh = b.width;

              if (b.orientation === 'vertical') {
                bx = b.x ?? 0;
                by = b.y ?? 0;
                bw = b.width;
                bh = b.depth || room.length;
              } else {
                if (b.depth && b.depth < room.width && b.x !== undefined) {
                  bx = b.x;
                  by = b.y;
                  bw = b.depth;
                  bh = b.width;
                } else {
                  bx = 0;
                  by = b.y;
                  bw = room.width;
                  bh = b.width;
                }
              }

              return (
                <g
                  key={b.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBeamId(isSelected ? null : b.id);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Beam Outline & Hatch Infill */}
                  <rect
                    x={bx}
                    y={by}
                    width={bw}
                    height={bh}
                    fill={isSpecial ? 'url(#specialBeamHatch)' : 'url(#beamHatch)'}
                    stroke={isSelected ? '#38BDF8' : isSpecial ? '#F43F5E' : '#EF4444'}
                    strokeWidth={isSelected ? '2.5' : isSpecial ? '2' : '1.5'}
                    strokeDasharray={isSpecial ? '6 2' : undefined}
                    className="transition-all"
                  />

                  {/* Highlight Glow when selected */}
                  {isSelected && (
                    <rect
                      x={bx - 2}
                      y={by - 2}
                      width={bw + 4}
                      height={bh + 4}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Beam Information Label Badge */}
                  <rect
                    x={bx + bw / 2 - (isSpecial ? 115 : 95)}
                    y={by + bh / 2 - 11}
                    width={isSpecial ? 230 : 190}
                    height="22"
                    rx="4"
                    fill={isSpecial ? '#4C0519' : '#450A0A'}
                    fillOpacity="0.95"
                    stroke={isSpecial ? '#F43F5E' : '#DC2626'}
                    strokeWidth="0.8"
                  />
                  <text
                    x={bx + bw / 2}
                    y={by + bh / 2 + 4}
                    textAnchor="middle"
                    fill={isSpecial ? '#FECDD3' : '#FCA5A5'}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {isSpecial ? '★ ' : ''}
                    {b.name} 梁下:{b.clearHeight}cm ({bw}×{bh})
                  </text>

                  {/* Floating Action Pill on Selected Beam */}
                  {isSelected && (
                    <g transform={`translate(${bx + bw / 2}, ${by + bh / 2 + 20})`}>
                      <rect
                        x="-90"
                        y="-14"
                        width="180"
                        height="28"
                        rx="6"
                        fill="#0F172A"
                        stroke="#38BDF8"
                        strokeWidth="1"
                        className="shadow-2xl"
                      />
                      <text
                        x="-75"
                        y="4"
                        fill="#38BDF8"
                        fontSize="9.5"
                        fontWeight="bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBeam(b);
                          setShowBeamModal(true);
                        }}
                        className="hover:underline cursor-pointer"
                      >
                        ✎ 編輯幾何參數
                      </text>
                      <text x="-5" y="4" fill="#64748B" fontSize="10">|</text>
                      <text
                        x="10"
                        y="4"
                        fill="#F87171"
                        fontSize="9.5"
                        fontWeight="bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBeam(b.id);
                        }}
                        className="hover:underline cursor-pointer"
                      >
                        ✕ 刪除梁體
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* GHOST SELECTION DRAG BOX (拖曳框選特殊梁體即時視覺反饋) */}
            {isDraggingBeam && dragStart && dragCurrent && (
              <g>
                <rect
                  x={Math.min(dragStart.x, dragCurrent.x)}
                  y={Math.min(dragStart.y, dragCurrent.y)}
                  width={Math.max(2, Math.abs(dragCurrent.x - dragStart.x))}
                  height={Math.max(2, Math.abs(dragCurrent.y - dragStart.y))}
                  fill="#F43F5E"
                  fillOpacity="0.28"
                  stroke="#F43F5E"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                  className="animate-pulse"
                />
                <rect
                  x={Math.min(dragStart.x, dragCurrent.x) + 4}
                  y={Math.min(dragStart.y, dragCurrent.y) + 4}
                  width="180"
                  height="22"
                  rx="3"
                  fill="#0F172A"
                  fillOpacity="0.9"
                  stroke="#F43F5E"
                  strokeWidth="1"
                />
                <text
                  x={Math.min(dragStart.x, dragCurrent.x) + 8}
                  y={Math.min(dragStart.y, dragCurrent.y) + 19}
                  fill="#FECDD3"
                  fontSize="10"
                  fontWeight="bold"
                >
                  特殊梁框選：{Math.round(Math.abs(dragCurrent.x - dragStart.x))} × {Math.round(Math.abs(dragCurrent.y - dragStart.y))} cm
                </text>
              </g>
            )}

            {/* AUTOMATIC CLEARANCE VIOLATION HIGHLIGHT LAYER (梁下空間與降板違規高亮視覺層) */}
            {autoDetectEnabled &&
              violations.map((v) => {
                const isSelected = highlightedViolationId === v.id;
                const { x, y, width, height } = v.bounds;
                const isOverlap = v.type === 'beam_drop_overlap';

                return (
                  <g
                    key={v.id}
                    className="cursor-pointer transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHighlightedViolationId(isSelected ? null : v.id);
                      setShowInspectorPanel(true);
                    }}
                    onMouseEnter={() => setHighlightedViolationId(v.id)}
                    onMouseLeave={() => setHighlightedViolationId(null)}
                  >
                    {/* Outer Pulsing Glow Boundary (外圍動態警示發光光暈) */}
                    <rect
                      x={x - 4}
                      y={y - 4}
                      width={width + 8}
                      height={height + 8}
                      rx="4"
                      fill="none"
                      stroke={isOverlap ? '#F59E0B' : '#EF4444'}
                      strokeWidth={isSelected ? '3.5' : '2.5'}
                      strokeDasharray="8 4"
                      className="animate-pulse"
                      filter="url(#violationGlow)"
                    />

                    {/* Hazard Stripe Infill (斜紋警戒色填充) */}
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={isOverlap ? 'url(#conflictMeshPattern)' : 'url(#violationHatchPattern)'}
                      stroke="#DC2626"
                      strokeWidth="1.5"
                      opacity={isSelected ? 0.95 : 0.85}
                    />

                    {/* CAD Engineering Warning Corner Brackets (四角高光工程標記) */}
                    <path
                      d={`M ${x - 2} ${y + 12} L ${x - 2} ${y - 2} L ${x + 12} ${y - 2}`}
                      stroke="#FCA5A5"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      d={`M ${x + width - 12} ${y - 2} L ${x + width + 2} ${y - 2} L ${x + width + 2} ${y + 12}`}
                      stroke="#FCA5A5"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      d={`M ${x - 2} ${y + height - 12} L ${x - 2} ${y + height + 2} L ${x + 12} ${y + height + 2}`}
                      stroke="#FCA5A5"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      d={`M ${x + width - 12} ${y + height + 2} L ${x + width + 2} ${y + height + 2} L ${x + width + 2} ${y + height - 12}`}
                      stroke="#FCA5A5"
                      strokeWidth="2.5"
                      fill="none"
                    />

                    {/* Prominent Floating Warning Badge (中央浮動警告徽章) */}
                    <g transform={`translate(${x + width / 2}, ${y + height / 2})`}>
                      <rect
                        x="-140"
                        y="-18"
                        width="280"
                        height="36"
                        rx="6"
                        fill="#450A0A"
                        fillOpacity="0.95"
                        stroke={isSelected ? '#F87171' : '#EF4444'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        className="drop-shadow-2xl"
                      />
                      <text x="-124" y="5" fill="#EF4444" fontSize="14" fontWeight="bold">
                        ⚠️
                      </text>
                      <text x="-102" y="-1" fill="#FEF2F2" fontSize="10.5" fontWeight="bold">
                        {v.name} · 實測淨高 {v.measuredHeight} cm
                      </text>
                      <text x="-102" y="11" fill="#FCA5A5" fontSize="9">
                        低於規範 {v.standardHeight} cm (不足 {v.diff} cm · 點擊查看處置)
                      </text>
                    </g>
                  </g>
                );
              })}

            {/* External / Internal Walls with Individual Thickness */}
            {(() => {
              const nth = getWallThickness(room, 'north');
              const sth = getWallThickness(room, 'south');
              const eth = getWallThickness(room, 'east');
              const wth = getWallThickness(room, 'west');
              const nExt = isExteriorWall(room, 'north');
              const sExt = isExteriorWall(room, 'south');
              const eExt = isExteriorWall(room, 'east');
              const wExt = isExteriorWall(room, 'west');

              return (
                <g>
                  {/* North Wall */}
                  <line
                    x1={-wth}
                    y1={-nth / 2}
                    x2={room.width + eth}
                    y2={-nth / 2}
                    stroke={nExt ? '#475569' : '#94A3B8'}
                    strokeWidth={nth}
                    strokeLinecap="square"
                  />
                  {/* South Wall */}
                  <line
                    x1={-wth}
                    y1={room.length + sth / 2}
                    x2={room.width + eth}
                    y2={room.length + sth / 2}
                    stroke={sExt ? '#475569' : '#94A3B8'}
                    strokeWidth={sth}
                    strokeLinecap="square"
                  />
                  {/* West Wall */}
                  <line
                    x1={-wth / 2}
                    y1={-nth}
                    x2={-wth / 2}
                    y2={room.length + sth}
                    stroke={wExt ? '#475569' : '#94A3B8'}
                    strokeWidth={wth}
                    strokeLinecap="square"
                  />
                  {/* East Wall */}
                  <line
                    x1={room.width + eth / 2}
                    y1={-nth}
                    x2={room.width + eth / 2}
                    y2={room.length + sth}
                    stroke={eExt ? '#475569' : '#94A3B8'}
                    strokeWidth={eth}
                    strokeLinecap="square"
                  />
                  {/* Inner Boundary Line */}
                  <rect
                    x="0"
                    y="0"
                    width={room.width}
                    height={room.length}
                    fill="none"
                    stroke="#F8FAFC"
                    strokeWidth="2.5"
                  />
                </g>
              );
            })()}

            {/* Structural Columns (柱體渲染層) */}
            {(room.columns || []).map((col) => {
              const { x, y, width, depth } = getColumnCoordinates(room, col);
              return (
                <g key={col.id} transform={`translate(${x}, ${y})`}>
                  <rect
                    x="0"
                    y="0"
                    width={width}
                    height={depth}
                    fill="#1E293B"
                    stroke="#F1F5F9"
                    strokeWidth="2"
                    className="shadow-lg"
                  />
                  <line x1="0" y1="0" x2={width} y2={depth} stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1={width} y1="0" x2="0" y2={depth} stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
                  <rect
                    x={width / 2 - 28}
                    y={depth / 2 - 9}
                    width="56"
                    height="18"
                    rx="3"
                    fill="#0F172A"
                    fillOpacity="0.9"
                    stroke="#94A3B8"
                    strokeWidth="0.8"
                  />
                  <text
                    x={width / 2}
                    y={depth / 2 + 4}
                    fill="#E2E8F0"
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {col.name.split(' ')[0]} {width}×{depth}
                  </text>
                </g>
              );
            })}

            {/* Doors Opening */}
            {room.doors.map((door) => {
              if (door.wall === 'bottom') {
                return (
                  <g key={door.id} transform={`translate(${door.offset}, ${room.length})`}>
                    <line x1="0" y1="0" x2={door.width} y2="0" stroke="#0F172A" strokeWidth="12" />
                    <line x1="0" y1="0" x2="0" y2={-door.width} stroke="#60A5FA" strokeWidth="2" strokeDasharray="3 2" />
                    <path
                      d={`M 0 ${-door.width} A ${door.width} ${door.width} 0 0 1 ${door.width} 0`}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="1.5"
                    />
                    <text x={door.width / 2} y="18" fill="#93C5FD" fontSize="10" textAnchor="middle">
                      {door.name} ({door.width}cm)
                    </text>
                  </g>
                );
              }
              if (door.wall === 'right') {
                return (
                  <g key={door.id} transform={`translate(${room.width}, ${door.offset})`}>
                    <line x1="0" y1="0" x2="0" y2={door.width} stroke="#0F172A" strokeWidth="12" />
                    <line x1="0" y1="0" x2={-door.width} y2="0" stroke="#60A5FA" strokeWidth="2" strokeDasharray="3 2" />
                    <path
                      d={`M ${-door.width} 0 A ${door.width} ${door.width} 0 0 1 0 ${door.width}`}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="1.5"
                    />
                    <text x="24" y={door.width / 2 + 4} fill="#93C5FD" fontSize="10">
                      {door.name}
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {/* Windows Opening (點擊直接輸入與修改窗戶尺寸) */}
            {room.windows.map((win) => {
              const isWinSelected = selectedWindowForQuickEdit === win.id;
              const labelWidth = Math.max(140, win.name.length * 12 + 95);
              return (
                <g
                  key={win.id}
                  transform={`translate(${win.offset}, 0)`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWindowForQuickEdit(win.id);
                    setShowQuickDimDrawer(true);
                    setDimDrawerActiveTab('windows');
                  }}
                >
                  <line x1="0" y1="0" x2={win.width} y2="0" stroke="#0F172A" strokeWidth="14" />
                  <rect
                    x="0"
                    y="-5"
                    width={win.width}
                    height="10"
                    fill="#0284C7"
                    fillOpacity={isWinSelected ? 0.75 : 0.4}
                    stroke={isWinSelected ? '#FBBF24' : '#38BDF8'}
                    strokeWidth={isWinSelected ? 2.5 : 1.5}
                    className="group-hover:stroke-amber-400 group-hover:fill-sky-500/50 transition-all"
                  />
                  {/* Floating Dimension Callout Badge - 點擊即可直接修改尺寸 */}
                  <g transform={`translate(${win.width / 2}, -16)`}>
                    <rect
                      x={-labelWidth / 2}
                      y="-11"
                      width={labelWidth}
                      height="22"
                      rx="4"
                      fill="#082F49"
                      fillOpacity="0.95"
                      stroke={isWinSelected ? '#FBBF24' : '#0284C7'}
                      strokeWidth={1.2}
                      className="group-hover:stroke-amber-400 group-hover:fill-sky-950 transition-all shadow-md"
                    />
                    <text
                      x="0"
                      y="4"
                      fill={isWinSelected ? '#FDE68A' : '#7DD3FC'}
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="bold"
                      className="group-hover:fill-white select-none"
                    >
                      ✎ {win.name} ({win.width}×H{win.height} 台{win.sillHeight})
                    </text>
                  </g>
                </g>
              );
            })}

            {/* MEP / Electrical Points */}
            {(activeViewMode === 'mep' || activeViewMode === 'staking') &&
              room.electricalPoints.map((ep) => (
                <g key={ep.id} transform={`translate(${ep.x}, ${ep.y})`}>
                  <circle r="7" fill="#06B6D4" stroke="#E0F2FE" strokeWidth="1.5" />
                  <path d="M -3 0 L 3 0 M 0 -3 L 0 3" stroke="#FFFFFF" strokeWidth="1.5" />
                  <rect x="10" y="-10" width="115" height="18" rx="3" fill="#083344" fillOpacity="0.8" stroke="#06B6D4" strokeWidth="0.5" />
                  <text x="14" y="3" fill="#A5F3FC" fontSize="9">
                    {ep.name} FL+{ep.elevation}
                  </text>
                </g>
              ))}

            {/* Voice Memos Anchors (口說匹配圖錨點) */}
            {(activeViewMode === 'voice_match' || activeViewMode === 'staking') &&
              room.voiceMemos.map((memo, idx) => {
                const isSelected = selectedMemoId === memo.id;
                return (
                  <g
                    key={memo.id}
                    transform={`translate(${memo.x}, ${memo.y})`}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMemoId(memo.id);
                      onSelectVoiceMemo(memo);
                    }}
                  >
                    {/* Anchor Radar Pulse */}
                    <circle r="14" fill="#EC4899" fillOpacity="0.25" className="animate-ping" />
                    <circle
                      r="12"
                      fill={memo.type === 'warning' ? '#EF4444' : '#8B5CF6'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="shadow-lg"
                    />
                    <text x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {idx + 1}
                    </text>

                    {/* Popover Callout */}
                    <g transform="translate(18, -18)">
                      <rect
                        width="180"
                        height="40"
                        rx="6"
                        fill="#1E1B4B"
                        stroke={isSelected ? '#C084FC' : '#6366F1'}
                        strokeWidth={isSelected ? '2' : '1'}
                        className="shadow-xl"
                      />
                      <text x="8" y="16" fill="#E0E7FF" fontSize="9" fontWeight="bold">
                        口說錄音 #{idx + 1} [{memo.timestamp}]
                      </text>
                      <text x="8" y="30" fill="#CBD5E1" fontSize="8">
                        {memo.text.length > 20 ? memo.text.slice(0, 18) + '...' : memo.text}
                      </text>
                    </g>
                  </g>
                );
              })}

            {/* Virtual Annotation Points (AI 語音智能長度與高度虛擬標註點) */}
            {showVirtualAnnotations &&
              (room.virtualAnnotations || []).map((anno) => {
                const isSelected = selectedAnnotationId === anno.id;
                const targetX = anno.leaderLine?.x2 ?? (anno.x > room.width * 0.6 ? anno.x - 65 : anno.x + 45);
                const targetY = anno.leaderLine?.y2 ?? (anno.y > room.length * 0.6 ? anno.y - 35 : anno.y + 30);
                const is5Multiple = anno.rule5MultipleCompliant;

                return (
                  <g
                    key={anno.id}
                    className="cursor-pointer group transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnotationId(isSelected ? null : anno.id);
                    }}
                  >
                    {/* Leader Line to Callout Tag */}
                    <line
                      x1={anno.x}
                      y1={anno.y}
                      x2={targetX}
                      y2={targetY}
                      stroke={isSelected ? '#38BDF8' : '#06B6D4'}
                      strokeWidth={isSelected ? '2' : '1.2'}
                      strokeDasharray="3 3"
                    />

                    {/* Anchor Point Crosshair & Pulsing Circle */}
                    <g transform={`translate(${anno.x}, ${anno.y})`}>
                      <circle r="9" fill="#06B6D4" fillOpacity="0.25" className="animate-ping" />
                      <circle r="4.5" fill="#0891B2" stroke="#FFFFFF" strokeWidth="1.5" />
                      <line x1="-7" y1="0" x2="7" y2="0" stroke="#22D3EE" strokeWidth="1" />
                      <line x1="0" y1="-7" x2="0" y2="7" stroke="#22D3EE" strokeWidth="1" />
                    </g>

                    {/* Callout Tag / Dimension Box */}
                    <g transform={`translate(${targetX}, ${targetY})`}>
                      <rect
                        x="-6"
                        y="-16"
                        width={Math.max(130, anno.label.length * 9 + 40)}
                        height="32"
                        rx="5"
                        fill="#042F2E"
                        fillOpacity="0.95"
                        stroke={isSelected ? '#38BDF8' : is5Multiple ? '#0D9488' : '#F59E0B'}
                        strokeWidth={isSelected ? '2' : '1.2'}
                        className="shadow-xl"
                      />
                      {/* Icon indicator */}
                      <circle cx="6" cy="0" r="6" fill="#0891B2" />
                      <text x="6" y="3" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                        {anno.dimensionType === 'clearance'
                          ? 'H'
                          : anno.dimensionType === 'length'
                          ? 'L'
                          : anno.dimensionType === 'mep'
                          ? 'E'
                          : 'Z'}
                      </text>
                      {/* Title & Dimension */}
                      <text x="16" y="-3" fill="#E2E8F0" fontSize="9" fontWeight="bold">
                        {anno.label}
                      </text>
                      {/* Coordinates & 5x badge */}
                      <text x="16" y="9" fill="#5EEAD4" fontSize="7.5" fontFamily="monospace">
                        (X:{anno.x} Y:{anno.y} {anno.elevation !== undefined ? `FL+${anno.elevation}` : ''}){' '}
                        {is5Multiple ? '• 5x' : ''}
                      </text>

                      {/* Expanded Card when Selected */}
                      {isSelected && (
                        <g transform="translate(-10, 20)">
                          <rect
                            width="220"
                            height="66"
                            rx="6"
                            fill="#0F172A"
                            stroke="#38BDF8"
                            strokeWidth="1.5"
                            className="shadow-2xl"
                          />
                          <text x="10" y="15" fill="#38BDF8" fontSize="8.5" fontWeight="bold">
                            ✦ AI 智能長度/高度虛擬標註
                          </text>
                          <text x="10" y="29" fill="#94A3B8" fontSize="8">
                            對應構件：{anno.targetEntity || '室內放樣點'}
                          </text>
                          <text x="10" y="43" fill="#CBD5E1" fontSize="8">
                            口說依據：{anno.extractedFromText ? `「${anno.extractedFromText}」` : '語音備忘錄'}
                          </text>
                          <text x="10" y="57" fill="#2DD4BF" fontSize="8">
                            {anno.description.length > 22 ? anno.description.slice(0, 20) + '...' : anno.description}
                          </text>
                        </g>
                      )}
                    </g>
                  </g>
                );
              })}

            {/* 現場水電與燈具即時放樣標記與即時相對放樣尺寸線 (5倍數吸附與鄰近構件相對間距) */}
            <FieldMepStakingOverlay
              room={room}
              selectedMepId={selectedMepId}
              selectedLightingId={selectedLightingId}
              onSelectMep={setSelectedMepId}
              onSelectLighting={setSelectedLightingId}
              onUpdatePointPosition={(type, id, newX, newY) => {
                if (type === 'mep') {
                  const updated = (room.electricalPoints || []).map((p) =>
                    p.id === id ? { ...p, x: newX, y: newY } : p
                  );
                  onUpdateRoom({ ...room, electricalPoints: updated });
                } else {
                  const updated = (room.lightingPoints || []).map((p) =>
                    p.id === id ? { ...p, x: newX, y: newY } : p
                  );
                  onUpdateRoom({ ...room, lightingPoints: updated });
                }
              }}
              onDeletePoint={(type, id) => {
                if (type === 'mep') {
                  const updated = (room.electricalPoints || []).filter((p) => p.id !== id);
                  onUpdateRoom({ ...room, electricalPoints: updated });
                  if (selectedMepId === id) setSelectedMepId(null);
                } else {
                  const updated = (room.lightingPoints || []).filter((p) => p.id !== id);
                  onUpdateRoom({ ...room, lightingPoints: updated });
                  if (selectedLightingId === id) setSelectedLightingId(null);
                }
              }}
              activeTool={activeStakingTool}
            />

            {/* Pure Empty Slate Canvas Watermark & Indicator */}
            {(!room.beams || room.beams.length === 0) &&
              (!room.doors || room.doors.length === 0) &&
              (!room.windows || room.windows.length === 0) &&
              (!room.voiceMemos || room.voiceMemos.length === 0) &&
              (!room.electricalPoints || room.electricalPoints.length === 0) &&
              (!room.placedBlocks || room.placedBlocks.length === 0) && (
                <g transform={`translate(${room.width / 2}, ${room.length / 2})`} className="pointer-events-none select-none">
                  {/* Subtle engineering compass / target */}
                  <circle r="46" fill="#121810" fillOpacity="0.8" stroke="#3F5B63" strokeWidth="1.2" strokeDasharray="4 3" />
                  <circle r="22" fill="none" stroke="#E0A83C" strokeWidth="1" strokeOpacity="0.4" />
                  <line x1="-38" y1="0" x2="38" y2="0" stroke="#E0A83C" strokeWidth="1.2" strokeOpacity="0.7" />
                  <line x1="0" y1="-38" x2="0" y2="38" stroke="#E0A83C" strokeWidth="1.2" strokeOpacity="0.7" />
                  <circle r="3.5" fill="#E0A83C" />

                  {/* Clean Canvas Badge (點擊直接修改全室長寬高尺寸) */}
                  <g
                    className="cursor-pointer group pointer-events-auto"
                    onClick={() => {
                      setShowQuickDimDrawer(true);
                      setDimDrawerActiveTab('walls');
                    }}
                  >
                    <rect
                      x="-140"
                      y="54"
                      width="280"
                      height="48"
                      rx="8"
                      fill="#1A2417"
                      fillOpacity="0.95"
                      stroke="#3F5B63"
                      strokeWidth="1.2"
                      className="group-hover:stroke-amber-400 group-hover:fill-[#23301F] transition-all shadow-lg"
                    />
                    <text x="0" y="72" textAnchor="middle" fill="#F8F8F6" fontSize="11" fontWeight="bold" letterSpacing="0.5">
                      ✨ 純淨放樣畫布就緒 (點擊直接輸入修改尺寸)
                    </text>
                    <text x="0" y="89" textAnchor="middle" fill="#E0A83C" fontSize="10" fontWeight="bold">
                      ✎ 面寬 {room.width} × 進深 {room.length} cm · 淨高 {room.height} cm
                    </text>
                  </g>
                </g>
              )}

            {/* Dimension Lines (Outer - 點擊直接修改牆面面寬與進深) */}
            {/* Top dimension */}
            <g
              transform="translate(0, -35)"
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickDimDrawer(true);
                setDimDrawerActiveTab('walls');
              }}
            >
              <line x1="0" y1="0" x2={room.width} y2="0" stroke="#10B981" strokeWidth="1.5" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#10B981" strokeWidth="1.5" />
              <line x1={room.width} y1="-5" x2={room.width} y2="5" stroke="#10B981" strokeWidth="1.5" />
              <rect
                x={room.width / 2 - 50}
                y="-12"
                width="100"
                height="24"
                rx="5"
                fill="#064E3B"
                stroke="#059669"
                strokeWidth="1.2"
                className="group-hover:fill-emerald-800 group-hover:stroke-amber-400 shadow-md transition-all"
              />
              <text x={room.width / 2} y="4.5" fill="#6EE7B7" fontSize="11" fontWeight="bold" textAnchor="middle" className="group-hover:fill-white select-none">
                ✎ 面寬 {room.width} cm
              </text>
            </g>

            {/* Left dimension */}
            <g
              transform="translate(-40, 0)"
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickDimDrawer(true);
                setDimDrawerActiveTab('walls');
              }}
            >
              <line x1="0" y1="0" x2="0" y2={room.length} stroke="#10B981" strokeWidth="1.5" />
              <line x1="-5" y1="0" x2="5" y2="0" stroke="#10B981" strokeWidth="1.5" />
              <line x1="-5" y1={room.length} x2="5" y2={room.length} stroke="#10B981" strokeWidth="1.5" />
              <rect
                x="-58"
                y={room.length / 2 - 12}
                width="100"
                height="24"
                rx="5"
                fill="#064E3B"
                stroke="#059669"
                strokeWidth="1.2"
                className="group-hover:fill-emerald-800 group-hover:stroke-amber-400 shadow-md transition-all"
              />
              <text x="-8" y={room.length / 2 + 4.5} fill="#6EE7B7" fontSize="11" fontWeight="bold" textAnchor="middle" className="group-hover:fill-white select-none">
                ✎ 進深 {room.length} cm
              </text>
            </g>

            {/* 🌟 星玥灣幾何契約：牆面與梁自動尺寸鏈 (Wall-to-Beam Automatic Dimension Chains) */}
            {showAutoDimensionChain && (
              <g id="auto-dimension-chains">
                {/* 1. 非 5 倍數違規區間室內紅框半透明高亮標定 (紅框警示區域) */}
                {dimensionChainResult.yChainSegments
                  .filter((seg) => !seg.rule5Compliant)
                  .map((seg) => (
                    <g key={`highlight-${seg.id}`}>
                      {/* 紅框半透明填充與醒目雙線虛線紅邊 */}
                      <rect
                        x={2}
                        y={seg.fromCoord}
                        width={room.width - 4}
                        height={seg.distance}
                        fill="#EF4444"
                        fillOpacity="0.10"
                        stroke="#EF4444"
                        strokeWidth="2"
                        strokeDasharray="6 3"
                        pointerEvents="none"
                        className="animate-pulse"
                      />
                      {/* 紅框內部斜紋警示線 */}
                      <line
                        x1={12}
                        y1={seg.fromCoord + 6}
                        x2={Math.min(room.width - 12, 100)}
                        y2={Math.min(seg.toCoord - 6, seg.fromCoord + 50)}
                        stroke="#EF4444"
                        strokeWidth="1.5"
                        strokeOpacity="0.75"
                        strokeDasharray="3 3"
                        pointerEvents="none"
                      />
                    </g>
                  ))}

                {/* 2. 縱向 Y 軸尺寸鏈 (北牆 ➜ 橫梁 ➜ 南牆) 標註線、界線與尺寸卡片 */}
                {(() => {
                  const dimX = Math.min(room.width - 45, Math.max(50, room.width * 0.82));
                  return (
                    <g id="y-beam-dimension-chain">
                      {dimensionChainResult.yChainSegments.map((seg) => {
                        const midY = (seg.fromCoord + seg.toCoord) / 2;
                        const isNon5x = !seg.rule5Compliant;
                        const isSelected = selectedChainSegmentId === seg.id;

                        return (
                          <g
                            key={seg.id}
                            className="cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChainSegmentId(seg.id);
                              setShowDimensionChainModal(true);
                            }}
                          >
                            {/* 尺寸界線 (Extension lines) */}
                            <line
                              x1={dimX - 18}
                              y1={seg.fromCoord}
                              x2={dimX + 42}
                              y2={seg.fromCoord}
                              stroke={isNon5x ? '#F87171' : '#64748B'}
                              strokeWidth="0.9"
                              strokeDasharray="2 2"
                              strokeOpacity={0.85}
                            />
                            <line
                              x1={dimX - 18}
                              y1={seg.toCoord}
                              x2={dimX + 42}
                              y2={seg.toCoord}
                              stroke={isNon5x ? '#F87171' : '#64748B'}
                              strokeWidth="0.9"
                              strokeDasharray="2 2"
                              strokeOpacity={0.85}
                            />

                            {/* 尺寸線 (Dimension line) */}
                            <line
                              x1={dimX}
                              y1={seg.fromCoord}
                              x2={dimX}
                              y2={seg.toCoord}
                              stroke={isNon5x ? '#EF4444' : isSelected ? '#38BDF8' : '#10B981'}
                              strokeWidth={isNon5x ? '2.5' : '1.5'}
                            />

                            {/* 建築傾斜 45 度短斜線 (Ticks) */}
                            <line
                              x1={dimX - 4}
                              y1={seg.fromCoord + 4}
                              x2={dimX + 4}
                              y2={seg.fromCoord - 4}
                              stroke={isNon5x ? '#EF4444' : '#10B981'}
                              strokeWidth="2"
                            />
                            <line
                              x1={dimX - 4}
                              y1={seg.toCoord + 4}
                              x2={dimX + 4}
                              y2={seg.toCoord - 4}
                              stroke={isNon5x ? '#EF4444' : '#10B981'}
                              strokeWidth="2"
                            />

                            {/* 尺寸數值標籤卡片 */}
                            {isNon5x ? (
                              /* ⚠️ 非 5 倍數紅框警示 (Red Box Alert) */
                              <g transform={`translate(${dimX}, ${midY})`}>
                                <rect
                                  x="-66"
                                  y="-16"
                                  width="132"
                                  height="32"
                                  rx="5"
                                  fill="#450A0A"
                                  fillOpacity="0.96"
                                  stroke="#EF4444"
                                  strokeWidth="2.5"
                                  filter="url(#violationGlow)"
                                  className="animate-pulse shadow-lg"
                                />
                                <text
                                  x="0"
                                  y="-2"
                                  fill="#FCA5A5"
                                  fontSize="9.5"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                >
                                  ⚠️ {seg.distance} cm (非5X)
                                </text>
                                <text
                                  x="0"
                                  y="9.5"
                                  fill="#F87171"
                                  fontSize="8"
                                  textAnchor="middle"
                                  fontWeight="bold"
                                >
                                  建議校正: {seg.recommendedValue} cm
                                </text>
                              </g>
                            ) : (
                              /* 5 倍數合規綠色標籤 */
                              <g transform={`translate(${dimX}, ${midY})`}>
                                <rect
                                  x="-34"
                                  y="-9"
                                  width="68"
                                  height="18"
                                  rx="3"
                                  fill="#064E3B"
                                  fillOpacity="0.92"
                                  stroke="#059669"
                                  strokeWidth="1"
                                  className="group-hover:fill-emerald-800 transition"
                                />
                                <text
                                  x="0"
                                  y="3.5"
                                  fill="#6EE7B7"
                                  fontSize="9.5"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                >
                                  {seg.distance} cm
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}

                {/* 3. 橫向 X 軸尺寸鏈 (若有縱梁或特殊分段) */}
                {dimensionChainResult.xChainSegments.length > 1 && (() => {
                  const dimY = Math.min(room.length - 28, Math.max(30, room.length * 0.88));
                  return (
                    <g id="x-beam-dimension-chain">
                      {dimensionChainResult.xChainSegments.map((seg) => {
                        const midX = (seg.fromCoord + seg.toCoord) / 2;
                        const isNon5x = !seg.rule5Compliant;

                        return (
                          <g
                            key={seg.id}
                            className="cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChainSegmentId(seg.id);
                              setShowDimensionChainModal(true);
                            }}
                          >
                            {/* 尺寸線 */}
                            <line
                              x1={seg.fromCoord}
                              y1={dimY}
                              x2={seg.toCoord}
                              y2={dimY}
                              stroke={isNon5x ? '#EF4444' : '#10B981'}
                              strokeWidth={isNon5x ? '2.5' : '1.5'}
                            />

                            {/* 建築斜線 ticks */}
                            <line
                              x1={seg.fromCoord - 4}
                              y1={dimY + 4}
                              x2={seg.fromCoord + 4}
                              y2={dimY - 4}
                              stroke={isNon5x ? '#EF4444' : '#10B981'}
                              strokeWidth="2"
                            />
                            <line
                              x1={seg.toCoord - 4}
                              y1={dimY + 4}
                              x2={seg.toCoord + 4}
                              y2={dimY - 4}
                              stroke={isNon5x ? '#EF4444' : '#10B981'}
                              strokeWidth="2"
                            />

                            {/* 尺寸標籤 */}
                            {isNon5x ? (
                              <g transform={`translate(${midX}, ${dimY})`}>
                                <rect
                                  x="-60"
                                  y="-15"
                                  width="120"
                                  height="30"
                                  rx="5"
                                  fill="#450A0A"
                                  fillOpacity="0.96"
                                  stroke="#EF4444"
                                  strokeWidth="2.5"
                                  filter="url(#violationGlow)"
                                  className="animate-pulse"
                                />
                                <text x="0" y="-1.5" fill="#FCA5A5" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                                  ⚠️ {seg.distance} cm (非5X)
                                </text>
                                <text x="0" y="9.5" fill="#F87171" fontSize="7.5" textAnchor="middle">
                                  建議: {seg.recommendedValue} cm
                                </text>
                              </g>
                            ) : (
                              <g transform={`translate(${midX}, ${dimY})`}>
                                <rect
                                  x="-32"
                                  y="-9"
                                  width="64"
                                  height="18"
                                  rx="3"
                                  fill="#064E3B"
                                  fillOpacity="0.92"
                                  stroke="#059669"
                                  strokeWidth="1"
                                />
                                <text x="0" y="3.5" fill="#6EE7B7" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                                  {seg.distance} cm
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Interactive 4-Wall Elevation Badges on Canvas (包含該向牆面尺寸) */}
            {/* North Wall Elevation Trigger */}
            <g
              transform={`translate(${room.width / 2}, -58)`}
              className="cursor-pointer group"
              onClick={() => {
                setElevationTargetWall('top');
                setShowWallElevations(true);
              }}
            >
              <rect
                x="-70"
                y="-10"
                width="140"
                height="20"
                rx="5"
                fill="#0C4A6E"
                stroke="#38BDF8"
                strokeWidth="1.2"
                className="group-hover:fill-sky-700 group-hover:stroke-amber-400 transition-all shadow-lg"
              />
              <text x="0" y="3.5" textAnchor="middle" fill="#E0F2FE" fontSize="9.5" fontWeight="bold">
                ▲ 北牆 (N) 寬 {room.width}cm · 立面
              </text>
            </g>

            {/* East Wall Elevation Trigger */}
            <g
              transform={`translate(${room.width + 12}, ${room.length / 2})`}
              className="cursor-pointer group"
              onClick={() => {
                setElevationTargetWall('right');
                setShowWallElevations(true);
              }}
            >
              <rect
                x="0"
                y="-10"
                width="140"
                height="20"
                rx="5"
                fill="#0C4A6E"
                stroke="#38BDF8"
                strokeWidth="1.2"
                className="group-hover:fill-sky-700 group-hover:stroke-amber-400 transition-all shadow-lg"
              />
              <text x="70" y="3.5" textAnchor="middle" fill="#E0F2FE" fontSize="9.5" fontWeight="bold">
                ▶ 東牆 (E) 深 {room.length}cm · 立面
              </text>
            </g>

            {/* South Wall Elevation Trigger */}
            <g
              transform={`translate(${room.width / 2}, ${room.length + 24})`}
              className="cursor-pointer group"
              onClick={() => {
                setElevationTargetWall('bottom');
                setShowWallElevations(true);
              }}
            >
              <rect
                x="-70"
                y="-10"
                width="140"
                height="20"
                rx="5"
                fill="#0C4A6E"
                stroke="#38BDF8"
                strokeWidth="1.2"
                className="group-hover:fill-sky-700 group-hover:stroke-amber-400 transition-all shadow-lg"
              />
              <text x="0" y="3.5" textAnchor="middle" fill="#E0F2FE" fontSize="9.5" fontWeight="bold">
                ▼ 南牆 (S) 寬 {room.width}cm · 立面
              </text>
            </g>

            {/* West Wall Elevation Trigger */}
            <g
              transform={`translate(-152, ${room.length / 2})`}
              className="cursor-pointer group"
              onClick={() => {
                setElevationTargetWall('left');
                setShowWallElevations(true);
              }}
            >
              <rect
                x="0"
                y="-10"
                width="140"
                height="20"
                rx="5"
                fill="#0C4A6E"
                stroke="#38BDF8"
                strokeWidth="1.2"
                className="group-hover:fill-sky-700 group-hover:stroke-amber-400 transition-all shadow-lg"
              />
              <text x="70" y="3.5" textAnchor="middle" fill="#E0F2FE" fontSize="9.5" fontWeight="bold">
                ◀ 西牆 (W) 深 {room.length}cm · 立面
              </text>
            </g>

            {/* USER REQUESTED: 已置入專屬圖庫圖塊渲染與互動 (Placed Blocks) */}
            {(room.placedBlocks || []).map((pb) => {
              const isSelected = selectedPlacedBlockId === pb.id;
              const w = pb.widthCm;
              const d = pb.depthCm;
              return (
                <g
                  key={pb.id}
                  transform={`translate(${pb.x}, ${pb.y}) rotate(${pb.rotationDeg || 0}, ${w / 2}, ${d / 2})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlacedBlockId(isSelected ? null : pb.id);
                  }}
                >
                  {/* Background rect */}
                  <rect
                    width={w}
                    height={d}
                    rx="3"
                    fill={
                      isSelected
                        ? '#0369A1'
                        : pb.category === 'furniture'
                        ? '#1E293B'
                        : pb.category === 'hatch_pattern'
                        ? '#064E3B'
                        : '#1E1E2E'
                    }
                    fillOpacity={isSelected ? 0.5 : 0.3}
                    stroke={
                      isSelected
                        ? '#38BDF8'
                        : pb.category === 'furniture'
                        ? '#F59E0B'
                        : pb.category === 'hatch_pattern'
                        ? '#10B981'
                        : '#38BDF8'
                    }
                    strokeWidth={isSelected ? 2 : 1.2}
                    strokeDasharray={isSelected ? '4 2' : 'none'}
                  />

                  {/* Top-down graphic inside placed block */}
                  {renderGhostVectorGraphic(pb as any, w, d, isSelected)}

                  {/* Block Name & Dimension Label */}
                  <text
                    x={w / 2}
                    y={Math.max(12, d / 2)}
                    textAnchor="middle"
                    fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                    fontSize={Math.min(10, Math.max(7, w / 15))}
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {pb.name}
                  </text>
                  <text
                    x={w / 2}
                    y={Math.max(22, d / 2 + 10)}
                    textAnchor="middle"
                    fill={isSelected ? '#38BDF8' : '#94A3B8'}
                    fontSize={Math.min(8, Math.max(6, w / 20))}
                    fontFamily="monospace"
                    className="select-none pointer-events-none"
                  >
                    {w}×{d}cm · FL+{pb.elevationCm || 0}
                  </text>

                  {/* Selected Highlight & Floating Actions */}
                  {isSelected && (
                    <g transform="translate(0, -32)" className="select-none">
                      <rect
                        x="-10"
                        y="0"
                        width={Math.max(200, w + 20)}
                        height="28"
                        rx="6"
                        fill="#0F172A"
                        stroke="#38BDF8"
                        strokeWidth="1.2"
                        className="shadow-2xl"
                      />
                      {/* Rotate 90 Button */}
                      <g
                        transform="translate(4, 5)"
                        className="cursor-pointer hover:opacity-80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotatePlacedBlock(pb.id);
                        }}
                      >
                        <rect width="60" height="18" rx="4" fill="#0284C7" />
                        <text x="30" y="12" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                          🔄 旋轉90°
                        </text>
                      </g>
                      {/* Snap 5x Button */}
                      <g
                        transform="translate(68, 5)"
                        className="cursor-pointer hover:opacity-80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlign5xPlacedBlock(pb.id);
                        }}
                      >
                        <rect width="64" height="18" rx="4" fill="#047857" />
                        <text x="32" y="12" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                          📐 對齊5倍數
                        </text>
                      </g>
                      {/* Delete Button */}
                      <g
                        transform="translate(136, 5)"
                        className="cursor-pointer hover:opacity-80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlacedBlock(pb.id);
                        }}
                      >
                        <rect width="52" height="18" rx="4" fill="#BE123C" />
                        <text x="26" y="12" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                          🗑️ 刪除
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              );
            })}

            {/* USER REQUESTED: 縮圖鬼影 (Ghost) 與自動吸附施工基準線 */}
            {ghostSnap && (
              <g className="pointer-events-none transition-all duration-75">
                {/* Magnetic Snap Guidelines */}
                {ghostSnap.snapGuide?.type === 'wall_top' && (
                  <line
                    x1={-padding}
                    y1={0}
                    x2={room.width + padding}
                    y2={0}
                    stroke="#22D3EE"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    filter="url(#snapGuideGlow)"
                  />
                )}
                {ghostSnap.snapGuide?.type === 'wall_bottom' && (
                  <line
                    x1={-padding}
                    y1={room.length}
                    x2={room.width + padding}
                    y2={room.length}
                    stroke="#22D3EE"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    filter="url(#snapGuideGlow)"
                  />
                )}
                {ghostSnap.snapGuide?.type === 'wall_left' && (
                  <line
                    x1={0}
                    y1={-padding}
                    x2={0}
                    y2={room.length + padding}
                    stroke="#22D3EE"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    filter="url(#snapGuideGlow)"
                  />
                )}
                {ghostSnap.snapGuide?.type === 'wall_right' && (
                  <line
                    x1={room.width}
                    y1={-padding}
                    x2={room.width}
                    y2={room.length + padding}
                    stroke="#22D3EE"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    filter="url(#snapGuideGlow)"
                  />
                )}
                {ghostSnap.snapGuide?.type === 'beam_h' && (
                  <line
                    x1={-padding}
                    y1={ghostSnap.snapGuide.coord}
                    x2={room.width + padding}
                    y2={ghostSnap.snapGuide.coord}
                    stroke="#F43F5E"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    filter="url(#snapGuideGlow)"
                  />
                )}
                {ghostSnap.snapGuide?.type === 'beam_v' && (
                  <line
                    x1={ghostSnap.snapGuide.coord}
                    y1={-padding}
                    x2={ghostSnap.snapGuide.coord}
                    y2={room.length + padding}
                    stroke="#6366F1"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    filter="url(#snapGuideGlow)"
                  />
                )}
                {ghostSnap.snapGuide?.type === 'drop' && (
                  <line
                    x1={-padding}
                    y1={ghostSnap.snapGuide.coord}
                    x2={room.width + padding}
                    y2={ghostSnap.snapGuide.coord}
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    filter="url(#snapGuideGlow)"
                  />
                )}

                {/* Semi-transparent Ghost Box at Snapped Position */}
                <g transform={`translate(${ghostSnap.snappedX}, ${ghostSnap.snappedY})`} opacity="0.85">
                  {/* Outer Glow & Background */}
                  <rect
                    width={ghostSnap.block.widthCm}
                    height={ghostSnap.block.depthCm}
                    rx="4"
                    fill="#0284C7"
                    fillOpacity="0.25"
                    stroke="#38BDF8"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    filter="url(#ghostGlow)"
                  />

                  {/* CAD Precision L-Corner Brackets */}
                  {(() => {
                    const bw = ghostSnap.block.widthCm;
                    const bd = ghostSnap.block.depthCm;
                    const cornerLen = Math.min(14, Math.min(bw, bd) * 0.3);
                    return (
                      <>
                        <path
                          d={`M 0 ${cornerLen} L 0 0 L ${cornerLen} 0`}
                          stroke="#67E8F9"
                          strokeWidth="2.5"
                          fill="none"
                        />
                        <path
                          d={`M ${bw - cornerLen} 0 L ${bw} 0 L ${bw} ${cornerLen}`}
                          stroke="#67E8F9"
                          strokeWidth="2.5"
                          fill="none"
                        />
                        <path
                          d={`M 0 ${bd - cornerLen} L 0 ${bd} L ${cornerLen} ${bd}`}
                          stroke="#67E8F9"
                          strokeWidth="2.5"
                          fill="none"
                        />
                        <path
                          d={`M ${bw - cornerLen} ${bd} L ${bw} ${bd} L ${bw} ${bd - cornerLen}`}
                          stroke="#67E8F9"
                          strokeWidth="2.5"
                          fill="none"
                        />
                      </>
                    );
                  })()}

                  {/* Internal Architectural 2D Vector Graphic matching the block */}
                  {renderGhostVectorGraphic(ghostSnap.block, ghostSnap.block.widthCm, ghostSnap.block.depthCm)}

                  {/* Magnet Floating Badge (Top Callout) */}
                  <g transform={`translate(0, -22)`}>
                    <rect
                      x="0"
                      y="0"
                      width={Math.max(170, ghostSnap.snapLabel.length * 8 + 36)}
                      height="22"
                      rx="5"
                      fill="#082F49"
                      fillOpacity="0.95"
                      stroke="#38BDF8"
                      strokeWidth="1.2"
                      className="shadow-xl"
                    />
                    <circle cx="11" cy="11" r="5" fill="#0284C7" />
                    <text x="11" y="14" fill="#E0F2FE" fontSize="8" fontWeight="bold" textAnchor="middle">
                      🧲
                    </text>
                    <text x="22" y="14" fill="#BAE6FD" fontSize="8.5" fontWeight="bold">
                      {ghostSnap.snapLabel}
                    </text>
                  </g>

                  {/* Center Spec Callout */}
                  <g transform={`translate(${ghostSnap.block.widthCm / 2}, ${ghostSnap.block.depthCm / 2})`}>
                    <rect
                      x="-75"
                      y="-11"
                      width="150"
                      height="22"
                      rx="4"
                      fill="#0F172A"
                      fillOpacity="0.9"
                      stroke="#38BDF8"
                      strokeWidth="1"
                    />
                    <text x="0" y="4" fill="#F8FAFC" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {ghostSnap.block.name}
                    </text>
                    <text x="0" y="18" fill="#7DD3FC" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                      {ghostSnap.block.widthCm}×{ghostSnap.block.depthCm} cm · FL+{ghostSnap.block.elevationCm || 0}
                    </text>
                  </g>
                </g>
              </g>
            )}

            {/* Coordinate Staking Origin (0,0) */}
            <g transform="translate(0,0)">
              <circle r="4" fill="#F43F5E" />
              <text x="-15" y="-10" fill="#FDA4AF" fontSize="9" fontWeight="bold">
                (0,0)
              </text>
            </g>
          </g>
        </svg>

        {/* Floating Auto Clearance Inspector Panel (自動檢測與法規標準診斷控制台) */}
        {showInspectorPanel && (
          <div className="absolute top-4 right-4 z-30 w-96 max-w-[calc(100%-2rem)] bg-slate-950/95 border border-slate-700/80 backdrop-blur-xl rounded-xl shadow-2xl p-4 flex flex-col gap-3 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    violations.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {violations.length > 0 ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">梁下空間與淨高自動檢測</h3>
                  <p className="text-[10px] text-slate-400">依據實測 beamHeight / ceilingDrop 即時合規診斷</p>
                </div>
              </div>
              <button
                onClick={() => setShowInspectorPanel(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title="關閉面板"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Switch & Standard Threshold Selector */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-300">圖面違規高亮視覺提示</span>
                <button
                  onClick={() => setAutoDetectEnabled(!autoDetectEnabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    autoDetectEnabled ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      autoDetectEnabled ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400">檢驗規範標準門檻 (淨高下限)：</span>
                  <span className="font-mono font-bold text-blue-400">{standardThreshold} cm</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 210, label: '210 法定' },
                    { val: 230, label: '230 舒適' },
                    { val: 240, label: '240 優選' },
                    { val: 265, label: '265 契約' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setStandardThreshold(item.val)}
                      className={`py-1 px-1.5 rounded text-[11px] font-medium transition-all text-center ${
                        standardThreshold === item.val
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inspection Status Findings */}
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>空間實測標高：</span>
                <span className="font-mono text-slate-300">
                  梁下 <strong className="text-amber-300">{room.beamHeight}</strong> cm · 降板{' '}
                  <strong className="text-amber-300">{room.ceilingDrop}</strong> cm
                </span>
              </div>

              {violations.length === 0 ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-emerald-300">梁下空間完全合規</div>
                    <p className="text-[11px] text-emerald-400/80 mt-0.5 leading-relaxed">
                      全室結構橫梁與空調天花降板淨高實測值均在規範門檻 {standardThreshold} cm 以上，未檢出壓迫或違規區塊。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>檢出 {violations.length} 處空間淨高低於規範標準：</span>
                  </div>
                  {violations.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setHighlightedViolationId(v.id)}
                      className={`p-2.5 rounded-lg border text-[11px] cursor-pointer transition-all ${
                        highlightedViolationId === v.id
                          ? 'bg-red-950/90 border-red-500 shadow-md shadow-red-900/40'
                          : 'bg-red-950/40 border-red-800/40 hover:bg-red-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-red-300">
                        <span>{v.name}</span>
                        <span className="font-mono bg-red-900/60 text-red-200 px-1.5 py-0.5 rounded text-[10px]">
                          不足 {v.diff} cm
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1 leading-snug">{v.reason}</p>
                      <div className="mt-1.5 pt-1.5 border-t border-red-900/50 flex items-center justify-between text-[10px]">
                        <span className="text-amber-400 flex items-center gap-1">
                          <Wrench className="w-3 h-3" />
                          {v.solution}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Simulation & One-Click Fix Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={handleSimulateViolation}
                className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-medium text-amber-300 flex items-center justify-center gap-1 transition-colors"
                title="模擬梁下淨高降為 220cm 以測試圖面違規視覺提示"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>模擬違規情境</span>
              </button>
              <button
                onClick={handleFixCompliance}
                className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-[11px] font-semibold text-white flex items-center justify-center gap-1 shadow-md transition-all active:scale-95"
                title="一鍵將梁下調至 265cm、降板調至 230cm 5倍數規範"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span>一鍵依規範修復</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Status Badge */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-lg p-2.5 shadow-xl flex items-center gap-3 text-xs">
          {/* Clearance Compliance Quick Pill */}
          <button
            onClick={() => setShowInspectorPanel(true)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all font-medium ${
              violations.length > 0
                ? 'bg-red-950/80 border border-red-500/60 text-red-300 animate-pulse hover:bg-red-900/60'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
            title="點擊查看梁下空間自動檢測詳情"
          >
            {violations.length > 0 ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>⚠️ 梁下違規 ({violations.length} 處不足 {standardThreshold}cm)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>梁下空間合規 (≥{standardThreshold}cm)</span>
              </>
            )}
          </button>
          <span className="text-slate-600">|</span>
          <div className="text-slate-400">
            口說錨點：<span className="text-purple-300 font-semibold">{room.voiceMemos.length} 處</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-400">
            梁下：
            <span
              className={
                room.beamHeight < standardThreshold ? 'text-red-400 font-bold' : 'text-amber-300 font-semibold'
              }
            >
              {room.beamHeight} cm
            </span>
          </div>
          <div className="text-slate-400">
            降板：
            <span className={room.ceilingDrop < 215 ? 'text-red-400 font-bold' : 'text-amber-300 font-semibold'}>
              {room.ceilingDrop} cm
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => {
              setElevationTargetWall('all');
              setShowWallElevations(true);
            }}
            className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 hover:underline transition-colors"
            title="點擊展開四面牆立面圖"
          >
            <Columns3 className="w-3 h-3" />
            <span>立面圖展開 (4面已演算)</span>
          </button>
          <span className="text-slate-600">|</span>
          <div className="text-slate-400">
            特殊梁體：
            <span className="text-rose-400 font-semibold">
              {room.beams.filter(b => b.id.includes('spec') || b.orientation === 'vertical' || (b.depth && b.depth < room.width)).length} 處
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => {
              setShowQuickDimDrawer(true);
              setDimDrawerActiveTab('all');
            }}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 hover:underline transition-colors px-1 py-0.5 rounded bg-amber-950/40 border border-amber-500/40"
            title="點擊直接修改牆面與窗戶尺寸"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>📐 尺寸直接輸入修改 ({room.width}×{room.length} · {room.windows?.length || 0}窗)</span>
          </button>
        </div>

        {/* Special Beam Modal (特殊梁體位置與幾何規格標註對話框) */}
        {showBeamModal && editingBeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-200">
              {/* Modal Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border-b border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
                    <BoxSelect className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      標註特殊梁體幾何參數
                      <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800/80 px-2 py-0.5 rounded-full font-mono">
                        室內設計 5倍數契約
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">自動更新 beams 陣列並即時反映在 3D 模擬與 DXF 幾何圖層中</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBeamModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body Form */}
              <div className="p-5 flex flex-col gap-4 text-xs">
                {/* Beam Name */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">梁體編號與名稱：</label>
                  <input
                    type="text"
                    value={editingBeam.name}
                    onChange={(e) => setEditingBeam({ ...editingBeam, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500 font-medium"
                    placeholder="例如：客廳跨室特殊結構大梁 SB-02"
                  />
                </div>

                {/* Beam Orientation */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">梁體走向配置：</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingBeam({ ...editingBeam, orientation: 'horizontal' })}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                        editingBeam.orientation !== 'vertical'
                          ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="text-left">
                        <div className="text-xs">橫向梁 (水平橫跨)</div>
                        <div className="text-[10px] text-slate-500 font-normal">X 軸跨越開間</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingBeam({ ...editingBeam, orientation: 'vertical' })}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                        editingBeam.orientation === 'vertical'
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <div className="text-left">
                        <div className="text-xs">縱向梁 (垂直進深)</div>
                        <div className="text-[10px] text-slate-500 font-normal">Y 軸跨越進深</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Beam Clearance Height (5-multiple compliance) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-400 font-medium">梁下淨高 (clearHeight cm)：</label>
                    <span className="font-mono font-bold text-amber-300">{editingBeam.clearHeight} cm</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[
                      { val: 265, label: '265 cm 契約標高', desc: '室內設計大梁' },
                      { val: 230, label: '230 cm 降板天花', desc: '客廳/臥室舒適' },
                      { val: 215, label: '215 cm 廚衛法規', desc: '管線穿越低限' },
                      { val: 240, label: '240 cm 造型假梁', desc: '美化包覆梁' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setEditingBeam({ ...editingBeam, clearHeight: item.val })}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          editingBeam.clearHeight === item.val
                            ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-[11px] font-mono">{item.label}</div>
                        <div className="text-[9px] text-slate-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step="5"
                    value={editingBeam.clearHeight}
                    onChange={(e) => setEditingBeam({ ...editingBeam, clearHeight: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    placeholder="請輸入 5 的倍數高度 (例如 265, 230, 215)"
                  />
                  {editingBeam.clearHeight % 5 !== 0 && (
                    <div className="text-[10px] text-red-400 mt-1 flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      警示：當前高層 {editingBeam.clearHeight} cm 不符合室內設計「5 倍數」幾何契約規範 (265、230、215)！
                    </div>
                  )}
                </div>

                {/* Dimensions (Width, Depth/Length, X, Y) */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1">
                      梁寬 (Width cm)：
                    </label>
                    <input
                      type="number"
                      value={editingBeam.width}
                      onChange={(e) => setEditingBeam({ ...editingBeam, width: Math.max(10, Number(e.target.value)) })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1">
                      梁長 / 深度 (Depth cm)：
                    </label>
                    <input
                      type="number"
                      value={editingBeam.depth || (editingBeam.orientation === 'vertical' ? room.length : room.width)}
                      onChange={(e) => setEditingBeam({ ...editingBeam, depth: Math.max(10, Number(e.target.value)) })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1">
                      定位 X (cm)：
                    </label>
                    <input
                      type="number"
                      value={editingBeam.x ?? 0}
                      onChange={(e) => setEditingBeam({ ...editingBeam, x: Math.max(0, Number(e.target.value)) })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1">
                      定位 Y (cm)：
                    </label>
                    <input
                      type="number"
                      value={editingBeam.y}
                      onChange={(e) => setEditingBeam({ ...editingBeam, y: Math.max(0, Number(e.target.value)) })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <div>
                  {room.beams.some((b) => b.id === editingBeam.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteBeam(editingBeam.id);
                        setShowBeamModal(false);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      刪除此梁體
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBeamModal(false)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveBeam(editingBeam)}
                    className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    確認標註並同步 3D 模擬
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Automatic Wall Elevation Unfolded Viewer Modal (自動生成牆面立面圖展開視圖) */}
        {showWallElevations && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div className="w-full max-w-6xl max-h-[94vh] flex flex-col my-auto">
              <WallElevationViewer
                room={room}
                onUpdateRoom={onUpdateRoom}
                onClose={() => setShowWallElevations(false)}
                initialWall={elevationTargetWall}
              />
            </div>
          </div>
        )}

        {/* 📐 牆面與窗戶尺寸直接輸入區懸浮快捷按鈕 */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setShowQuickDimDrawer(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-sky-950/90 to-slate-900/90 hover:from-sky-900 hover:to-slate-800 border border-sky-500/70 hover:border-amber-400 text-sky-200 hover:text-white rounded-xl text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 group"
            title="開啟牆面與窗戶尺寸直接輸入區 (可直接修改長寬高與窗戶尺寸)"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span>📐 尺寸直接輸入區</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-amber-300 font-mono border border-sky-800">
              {room.width}×{room.length} · {room.windows?.length || 0}窗
            </span>
          </button>
        </div>

        {/* 📐 牆面與窗戶尺寸直接輸入與修改面板 (Direct Dimensions Input Modal) */}
        {showQuickDimDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
            <div className="w-full max-w-4xl max-h-[92vh] flex flex-col my-auto bg-slate-950 border border-sky-500/50 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
              {/* Header */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border-b border-sky-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-600/20 border border-sky-500/40 text-sky-400">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      📐 牆面與窗戶尺寸直接輸入區
                      <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-mono">
                        即時連動 2D 放樣 / 3D 模擬 / 立面出圖
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      當前空間：【<strong className="text-amber-300">{room.roomName}</strong>】· 任何尺寸備注均可直接輸入數值立即修改
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setElevationTargetWall('all');
                      setShowWallElevations(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-950 border border-sky-700 hover:bg-sky-900 text-sky-300 text-xs font-semibold flex items-center gap-1 transition"
                    title="檢視四面牆立面展開圖"
                  >
                    <Columns3 className="w-3.5 h-3.5" />
                    <span>立面展開圖</span>
                  </button>
                  <button
                    onClick={() => setShowQuickDimDrawer(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setDimDrawerActiveTab('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      dimDrawerActiveTab === 'all'
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📋 雙向全覽
                  </button>
                  <button
                    onClick={() => setDimDrawerActiveTab('walls')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      dimDrawerActiveTab === 'walls'
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🧱 牆面尺寸 (4 面牆長寬高)
                  </button>
                  <button
                    onClick={() => setDimDrawerActiveTab('windows')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      dimDrawerActiveTab === 'windows'
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🪟 窗戶開口尺寸 ({room.windows?.length || 0} 樘)
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => handleAddNewWindow('north')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shadow transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增窗戶開口</span>
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 overflow-y-auto space-y-5 text-xs">
                {/* 1. 牆面尺寸直接輸入區 */}
                {(dimDrawerActiveTab === 'all' || dimDrawerActiveTab === 'walls') && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                        <Ruler className="w-4 h-4 text-amber-400" />
                        4 個面向牆體尺寸直接修改
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        地坪實積: {((room.width * room.length) / 33058).toFixed(2)} 坪 ({((room.width * room.length) / 10000).toFixed(2)} m²)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {/* 北面牆 (向北·頂牆) */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-sky-900/50 space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded bg-blue-600 text-white text-[10px] flex items-center justify-center">N</span>
                            北面牆 (頂牆)
                          </span>
                          <span className="text-[10px] text-slate-400">面寬</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={room.width}
                            onChange={(e) => handleUpdateRoomWallDimensions(Number(e.target.value), room.length)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center text-sm font-bold focus:border-amber-400 outline-none"
                          />
                          <span className="text-slate-400 font-mono">cm</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(room.width - 5, room.length)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(room.width + 5, room.length)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(Math.round(room.width / 5) * 5, room.length)}
                            className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/80 hover:bg-amber-900"
                          >
                            5X對齊
                          </button>
                        </div>
                      </div>

                      {/* 南面牆 (向南·底牆) */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-sky-900/50 space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded bg-blue-600 text-white text-[10px] flex items-center justify-center">S</span>
                            南面牆 (底牆)
                          </span>
                          <span className="text-[10px] text-slate-400">面寬</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={room.width}
                            onChange={(e) => handleUpdateRoomWallDimensions(Number(e.target.value), room.length)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center text-sm font-bold focus:border-amber-400 outline-none"
                          />
                          <span className="text-slate-400 font-mono">cm</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(room.width - 5, room.length)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(room.width + 5, room.length)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(Math.round(room.width / 5) * 5, room.length)}
                            className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/80 hover:bg-amber-900"
                          >
                            5X對齊
                          </button>
                        </div>
                      </div>

                      {/* 東面牆 (向東·右牆) */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-sky-900/50 space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded bg-indigo-600 text-white text-[10px] flex items-center justify-center">E</span>
                            東面牆 (右牆)
                          </span>
                          <span className="text-[10px] text-slate-400">進深</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={room.length}
                            onChange={(e) => handleUpdateRoomWallDimensions(room.width, Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center text-sm font-bold focus:border-amber-400 outline-none"
                          />
                          <span className="text-slate-400 font-mono">cm</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(room.width, room.length - 5)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(room.width, room.length + 5)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(room.width, Math.round(room.length / 5) * 5)}
                            className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/80 hover:bg-amber-900"
                          >
                            5X對齊
                          </button>
                        </div>
                      </div>

                      {/* 西面牆 (向西·左牆) */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-sky-900/50 space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded bg-indigo-600 text-white text-[10px] flex items-center justify-center">W</span>
                            西面牆 (左牆)
                          </span>
                          <span className="text-[10px] text-slate-400">進深</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={room.length}
                            onChange={(e) => handleUpdateRoomWallDimensions(room.width, Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center text-sm font-bold focus:border-amber-400 outline-none"
                          />
                          <span className="text-slate-400 font-mono">cm</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(room.width, room.length - 5)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(room.width, room.length + 5)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleUpdateRoomWallDimensions(room.width, Math.round(room.length / 5) * 5)}
                            className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/80 hover:bg-amber-900"
                          >
                            5X對齊
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 高度與壁厚微調 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <label className="text-slate-400 text-[11px] block mb-1">樓板淨高 (Slab Height)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={room.height}
                            onChange={(e) => handleUpdateRoomWallDimensions(room.width, room.length, Number(e.target.value))}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white font-mono font-bold"
                          />
                          <span className="text-slate-500 font-mono">cm</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <label className="text-slate-400 text-[11px] block mb-1">梁下淨高 (Beam Clearance)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={room.beamHeight}
                            onChange={(e) => onUpdateRoom?.({ ...room, beamHeight: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-amber-300 font-mono font-bold"
                          />
                          <span className="text-slate-500 font-mono">cm</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <label className="text-slate-400 text-[11px] block mb-1">天花降板 (Ceiling Drop)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={room.ceilingDrop}
                            onChange={(e) => onUpdateRoom?.({ ...room, ceilingDrop: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-amber-300 font-mono font-bold"
                          />
                          <span className="text-slate-500 font-mono">cm</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <label className="text-slate-400 text-[11px] block mb-1">丈量預設壁厚 (Default)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={room.wallThickness || 10}
                            onChange={(e) => handleUpdateRoomWallDimensions(room.width, room.length, room.height, Number(e.target.value))}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white font-mono font-bold"
                          />
                          <span className="text-slate-500 font-mono">cm</span>
                        </div>
                      </div>
                    </div>

                    {/* 各牆面獨立外牆 (15cm) / 內牆 (10cm) 切換 */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">各向牆體屬性 (外牆 15cm · 內牆 10cm)：</span>
                        <span className="text-[10px] text-slate-500">點擊即可切換</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {(['north', 'south', 'east', 'west'] as const).map((dir) => {
                          const isExt = isExteriorWall(room, dir);
                          const th = getWallThickness(room, dir);
                          const label = dir === 'north' ? '北牆 (頂)' : dir === 'south' ? '南牆 (底)' : dir === 'east' ? '東牆 (右)' : '西牆 (左)';
                          return (
                            <button
                              key={dir}
                              type="button"
                              onClick={() => {
                                if (!onUpdateRoom) return;
                                const updated = updateWallConfig(room, dir, isExt ? 'interior' : 'exterior', isExt ? 10 : 15);
                                onUpdateRoom(updated);
                              }}
                              className={`p-2 rounded-lg border text-left transition ${
                                isExt
                                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="text-[10px] text-slate-400">{label}</div>
                              <div className="font-bold mt-0.5 font-mono flex items-center justify-between">
                                <span>{isExt ? '外牆' : '內牆'}</span>
                                <span className="text-slate-400 text-[10px]">{th}cm</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 結構柱體 (Columns) 快速管理 */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300 text-xs flex items-center gap-1">
                          <span>🏛️ 結構柱體 ({room.columns?.length || 0} 處)</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!onUpdateRoom) return;
                              const cols = room.columns || [];
                              const newCol = {
                                id: `col_${Date.now()}`,
                                name: `C${cols.length + 1} 西北角柱`,
                                width: 50,
                                depth: 50,
                                positionType: 'corner' as const,
                                corner: 'top-left' as const,
                              };
                              onUpdateRoom({ ...room, columns: [...cols, newCol] });
                            }}
                            className="px-2 py-0.5 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-black rounded text-[10px] font-bold transition"
                          >
                            + 西北角柱 (50×50)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!onUpdateRoom) return;
                              const cols = room.columns || [];
                              const newCol = {
                                id: `col_${Date.now()}`,
                                name: `C${cols.length + 1} 東北角柱`,
                                width: 50,
                                depth: 50,
                                positionType: 'corner' as const,
                                corner: 'top-right' as const,
                              };
                              onUpdateRoom({ ...room, columns: [...cols, newCol] });
                            }}
                            className="px-2 py-0.5 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-black rounded text-[10px] font-bold transition"
                          >
                            + 東北角柱 (50×50)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. 窗戶開口尺寸直接輸入清單 */}
                {(dimDrawerActiveTab === 'all' || dimDrawerActiveTab === 'windows') && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-sky-300 text-sm flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-sky-400" />
                        窗戶尺寸直接輸入清單 ({room.windows?.length || 0} 樘開口部)
                      </span>
                      <button
                        onClick={() => handleAddNewWindow('north')}
                        className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> 新增一樘開窗
                      </button>
                    </div>

                    {(!room.windows || room.windows.length === 0) ? (
                      <div className="p-6 text-center bg-slate-950 rounded-xl border border-slate-800/80">
                        <p className="text-slate-400 mb-2">目前此空間尚未配置窗戶開口</p>
                        <button
                          onClick={() => handleAddNewWindow('north')}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 shadow"
                        >
                          <Plus className="w-3.5 h-3.5" /> 立即新增一樘採光窗
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {room.windows.map((win, idx) => {
                          const isHighlighted = selectedWindowForQuickEdit === win.id;
                          return (
                            <div
                              key={win.id}
                              className={`p-3 rounded-xl border transition-all ${
                                isHighlighted
                                  ? 'bg-slate-950 border-amber-400/80 ring-1 ring-amber-400/40 shadow-lg'
                                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-2.5">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={win.name}
                                    onChange={(e) => handleUpdateWindowDimensions(win.id, { name: e.target.value })}
                                    className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs focus:border-sky-400 outline-none w-48"
                                    placeholder="窗戶名稱"
                                  />
                                  <select
                                    value={win.wall}
                                    onChange={(e) => handleUpdateWindowDimensions(win.id, { wall: e.target.value as any })}
                                    className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-bold text-xs focus:border-sky-400 outline-none"
                                  >
                                    <option value="north">北牆 (頂)</option>
                                    <option value="south">南牆 (底)</option>
                                    <option value="east">東牆 (右)</option>
                                    <option value="west">西牆 (左)</option>
                                  </select>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    窗頂: FL+{win.sillHeight + win.height}cm
                                  </span>
                                  <button
                                    onClick={() => handleDeleteWindow(win.id)}
                                    className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-950/50"
                                    title="刪除此窗戶"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* 4 欄數值直接輸入 */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                                  <label className="text-slate-400 text-[10px] block mb-0.5">窗戶寬度 (Width)</label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={win.width}
                                      onChange={(e) => handleUpdateWindowDimensions(win.id, { width: Number(e.target.value) })}
                                      className="w-full px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono font-bold focus:border-amber-400 outline-none"
                                    />
                                    <span className="text-slate-500 font-mono text-[10px]">cm</span>
                                  </div>
                                </div>

                                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                                  <label className="text-slate-400 text-[10px] block mb-0.5">窗戶高度 (Height)</label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={win.height}
                                      onChange={(e) => handleUpdateWindowDimensions(win.id, { height: Number(e.target.value) })}
                                      className="w-full px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono font-bold focus:border-amber-400 outline-none"
                                    />
                                    <span className="text-slate-500 font-mono text-[10px]">cm</span>
                                  </div>
                                </div>

                                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                                  <label className="text-slate-400 text-[10px] block mb-0.5">窗台標高 (Sill)</label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={win.sillHeight}
                                      onChange={(e) => handleUpdateWindowDimensions(win.id, { sillHeight: Number(e.target.value) })}
                                      className="w-full px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono font-bold focus:border-amber-400 outline-none"
                                    />
                                    <span className="text-slate-500 font-mono text-[10px]">cm</span>
                                  </div>
                                </div>

                                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                                  <label className="text-slate-400 text-[10px] block mb-0.5">離牆偏移 (Offset)</label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={win.offset}
                                      onChange={(e) => handleUpdateWindowDimensions(win.id, { offset: Number(e.target.value) })}
                                      className="w-full px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono font-bold focus:border-amber-400 outline-none"
                                    />
                                    <span className="text-slate-500 font-mono text-[10px]">cm</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  💡 數值變更即時存入空間契約，自動同步至 2D 放樣畫布、3D 空間與 AutoCAD DXF 圖層。
                </span>
                <button
                  onClick={() => setShowQuickDimDrawer(false)}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold shadow text-xs transition"
                >
                  完成修改
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 星玥灣幾何契約：自動尺寸鏈放樣檢核總表與一鍵校正 Modal */}
        {showDimensionChainModal && (
          <AutoDimensionChainModal
            room={room}
            onUpdateRoom={onUpdateRoom}
            onClose={() => setShowDimensionChainModal(false)}
            onHighlightSegment={(segId) => setSelectedChainSegmentId(segId)}
          />
        )}
      </div>
    </div>
  );
};
