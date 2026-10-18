import React, { useState, useRef, useEffect } from 'react';
import { RoomData, VoiceMemo } from '../types';
import { StakingCanvas2D } from './StakingCanvas2D';
import {
  X,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Box,
  ShieldCheck,
  HelpCircle,
  Scissors,
  Sliders,
  Download,
  Settings,
  Plus,
  Compass,
  Check,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Volume2,
  Eye,
  EyeOff,
  SquareDashed,
  Ruler,
  FileCheck2,
} from 'lucide-react';

interface IpadZenMeasureLayoutProps {
  room: RoomData;
  allRooms: RoomData[];
  onSelectRoom: (roomId: string) => void;
  onAddRoom?: () => void;
  onUpdateRoom: (updated: RoomData) => void;
  activeViewMode: 'staking' | 'voice_match' | 'ceiling_drop' | 'mep';
  setActiveViewMode: (mode: 'staking' | 'voice_match' | 'ceiling_drop' | 'mep') => void;
  onSelectVoiceMemo: (memo: VoiceMemo) => void;
  onExitZenMode: () => void;
  onNotify: (msg: string) => void;
  onSwitchTo3D?: () => void;
  // Exact user screenshot buttons & main features
  onOpenDrawingHabits?: () => void;
  onOpenElevationBenchmark?: () => void;
  onOpenIpadHiddenMenu?: () => void;
  onOpenPanoramicGuide?: () => void;
  onOpenAuditDistribution?: () => void;
  onOpenSketchUp: () => void;
  onOpenComplianceReport: () => void;
  onOpenScanTutorial: () => void;
  onOpenDesignerExtractor: () => void;
  onOpenElevationSlice: () => void;
  onOpenCadStyleSync: () => void;
  onOpenStepPhotoNav: () => void;
  onOpenGoogleApiIde: () => void;
  onExportDxf: () => void;
}

export const IpadZenMeasureLayout: React.FC<IpadZenMeasureLayoutProps> = ({
  room,
  allRooms,
  onSelectRoom,
  onAddRoom,
  onUpdateRoom,
  activeViewMode,
  setActiveViewMode,
  onSelectVoiceMemo,
  onExitZenMode,
  onNotify,
  onSwitchTo3D,
  onOpenDrawingHabits,
  onOpenElevationBenchmark,
  onOpenIpadHiddenMenu,
  onOpenPanoramicGuide,
  onOpenAuditDistribution,
  onOpenSketchUp,
  onOpenComplianceReport,
  onOpenScanTutorial,
  onOpenDesignerExtractor,
  onOpenElevationSlice,
  onOpenCadStyleSync,
  onOpenStepPhotoNav,
  onOpenGoogleApiIde,
  onExportDxf,
}) => {
  // === 4-Direction Hidden Drawer States ===
  const [isTopDrawerOpen, setIsTopDrawerOpen] = useState<boolean>(false);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(false);
  const [isBottomDrawerOpen, setIsBottomDrawerOpen] = useState<boolean>(false);

  // Ultra-clean canvas mode (hides even edge tabs)
  const [isUltraClean, setIsUltraClean] = useState<boolean>(false);

  // Quick Voice Recording state for field iPad
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-TW';

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          current += event.results[i][0].transcript;
        }
        setVoiceTranscript(current);

        // Auto-detect 5-multiple dimensions from speech
        if (current.includes('梁高') || current.includes('梁下')) {
          const match = current.match(/\d{2,3}/);
          if (match) {
            const h = parseInt(match[0], 10);
            if (!isNaN(h)) {
              onUpdateRoom({ ...room, beamHeight: h });
              onNotify(`🎙️ 語音更新梁下高程：${h} cm`);
            }
          }
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [room, onUpdateRoom, onNotify]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      if (voiceTranscript) {
        onNotify(`✅ 口說丈量紀錄已儲存：「${voiceTranscript}」`);
      }
    } else {
      setVoiceTranscript('');
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        onNotify('🎙️ 正在聆聽口說丈量...請說出梁下淨高、天花降板或空間開間！');
      } catch (err) {
        setIsRecording(true);
        onNotify('🎙️ 模擬口說丈量模式啟動中...');
      }
    }
  };

  // 5-multiple contract helpers
  const adjustHeight = (key: 'beamHeight' | 'ceilingDrop' | 'height', delta: number) => {
    const current = (room as any)[key] || 265;
    const next = Math.max(180, Math.min(360, current + delta));
    onUpdateRoom({ ...room, [key]: next });
    onNotify(`📐 已調整 ${key === 'beamHeight' ? '梁下' : '降板'} 高程至：${next} cm`);
  };

  const setPresetHeight = (key: 'beamHeight' | 'ceilingDrop', value: number) => {
    onUpdateRoom({ ...room, [key]: value });
    onNotify(`📐 已套用幾何契約高程：${value} cm`);
  };

  // Quick MEP point injection
  const handleAddQuickMepPoint = (
    type: 'socket_110v' | 'socket_220v' | 'switch',
    elevation: number,
    name: string
  ) => {
    const newPoint = {
      id: `ep-${Date.now()}`,
      type,
      name,
      x: Math.round(roomWidth / 2),
      y: Math.round(roomLength / 2),
      elevation,
      circuit: type === 'socket_220v' ? 'P-220V-AC' : type === 'switch' ? 'L-01' : 'P-01',
    };
    const updated = {
      ...room,
      electricalPoints: [...(room.electricalPoints || []), newPoint],
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    onUpdateRoom(updated);
    onNotify(`⚡ 已快速放樣水電點位：「${name} (FL+${elevation}cm)」！`);
  };

  // === Edge Swipe Touch Gesture Engine ===
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const [gestureNotice, setGestureNotice] = useState<string | null>(null);

  const triggerGestureNotice = (msg: string) => {
    setGestureNotice(msg);
    setTimeout(() => {
      setGestureNotice(null);
    }, 2200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const start = touchStartPos.current;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dt = Date.now() - start.time;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Minimum swipe threshold: 45px within 750ms
    if (dt < 750 && (absDx > 40 || absDy > 40)) {
      // 1. Swipe down from Top area -> Open Top Drawer
      if (dy > 45 && absDy > absDx && start.y < 120 && !isTopDrawerOpen) {
        setIsTopDrawerOpen(true);
        setIsBottomDrawerOpen(false);
        triggerGestureNotice('🖐️ 手勢向下滑動：展開頂部空間放樣資訊');
      }
      // Swipe up inside Top Drawer -> Close Top Drawer
      else if (dy < -45 && absDy > absDx && isTopDrawerOpen) {
        setIsTopDrawerOpen(false);
        triggerGestureNotice('🖐️ 手勢向上滑動：收合頂部空間資訊');
      }
      // 2. Swipe up from Bottom area -> Open Bottom Drawer
      else if (dy < -45 && absDy > absDx && start.y > winH - 150 && !isBottomDrawerOpen) {
        setIsBottomDrawerOpen(true);
        setIsTopDrawerOpen(false);
        triggerGestureNotice('🖐️ 手勢向上滑動：展開底部設計師快捷工具池');
      }
      // Swipe down inside Bottom Drawer -> Close Bottom Drawer
      else if (dy > 45 && absDy > absDx && isBottomDrawerOpen) {
        setIsBottomDrawerOpen(false);
        triggerGestureNotice('🖐️ 手勢向下滑動：收合快捷工具池');
      }
      // 3. Swipe right from Left Edge -> Open Left Drawer
      else if (dx > 45 && absDx > absDy && start.x < 110 && !isLeftDrawerOpen) {
        setIsLeftDrawerOpen(true);
        setIsRightDrawerOpen(false);
        triggerGestureNotice('🖐️ 手勢向右滑動：展開左側空間清單與圖層');
      }
      // Swipe left inside Left Drawer -> Close Left Drawer
      else if (dx < -45 && absDx > absDy && isLeftDrawerOpen) {
        setIsLeftDrawerOpen(false);
        triggerGestureNotice('🖐️ 手勢向左滑動：收合左側空間清單');
      }
      // 4. Swipe left from Right Edge -> Open Right Drawer
      else if (dx < -45 && absDx > absDy && start.x > winW - 110 && !isRightDrawerOpen) {
        setIsRightDrawerOpen(true);
        setIsLeftDrawerOpen(false);
        triggerGestureNotice('🖐️ 手勢向左滑動：展開右側 5 倍數契約速調');
      }
      // Swipe right inside Right Drawer -> Close Right Drawer
      else if (dx > 45 && absDx > absDy && isRightDrawerOpen) {
        setIsRightDrawerOpen(false);
        triggerGestureNotice('🖐️ 手勢向右滑動：收合右側契約速調');
      }
    }
    touchStartPos.current = null;
  };

  const roomDisplayName = room.roomName || (room as any).name || '放樣空間';
  const roomWidth = room.width || 480;
  const roomLength = room.length || (room as any).depth || 380;
  const roomCeilingDrop = room.ceilingDrop || (room as any).dropCeilingHeight || 230;
  const roomBeamHeight = room.beamHeight || 265;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-screen h-screen overflow-hidden bg-[#0a0d14] text-slate-100 select-none font-sans"
    >
      {/* Visual Gesture HUD Toast */}
      {gestureNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#121826]/90 border border-cyan-500/50 text-cyan-300 text-xs px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
          <span>{gestureNotice}</span>
        </div>
      )}

      {/* Top Edge Swipe Visual Handle (向下滑動展開) */}
      {!isUltraClean && !isTopDrawerOpen && (
        <div
          onClick={() => setIsTopDrawerOpen(true)}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pt-0.5 cursor-pointer group"
          title="向下滑動或點選展開空間放樣資訊"
        >
          <div className="w-16 h-1 bg-slate-600/70 group-hover:bg-cyan-400 rounded-full transition-all" />
        </div>
      )}

      {/* Bottom Edge Swipe Visual Handle (向上滑動展開) */}
      {!isUltraClean && !isBottomDrawerOpen && (
        <div
          onClick={() => setIsBottomDrawerOpen(true)}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pb-0.5 cursor-pointer group"
          title="向上滑動或點選展開設計師快捷工具池"
        >
          <div className="w-20 h-1 bg-slate-600/70 group-hover:bg-cyan-400 rounded-full transition-all" />
        </div>
      )}

      {/* Left Edge Swipe Visual Handle (向右滑動展開圖層與空間) */}
      {!isUltraClean && !isLeftDrawerOpen && (
        <div
          onClick={() => setIsLeftDrawerOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center pl-0.5 cursor-pointer group"
          title="向右滑動或點選展開左側空間清單"
        >
          <div className="w-1 h-16 bg-slate-600/70 group-hover:bg-cyan-400 rounded-r-full transition-all" />
        </div>
      )}

      {/* Right Edge Swipe Visual Handle (向左滑動展開高程契約) */}
      {!isUltraClean && !isRightDrawerOpen && (
        <div
          onClick={() => setIsRightDrawerOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center pr-0.5 cursor-pointer group"
          title="向左滑動或點選展開右側 5 倍數契約速調"
        >
          <div className="w-1 h-16 bg-slate-600/70 group-hover:bg-cyan-400 rounded-l-full transition-all" />
        </div>
      )}
      {/* ========================================================================= */}
      {/* 1. MAIN FULL-BLEED 2D CAD CANVAS (100% PURE VIEWPORT)                    */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full flex flex-col z-0">
        <StakingCanvas2D
          room={room}
          activeViewMode={activeViewMode}
          setActiveViewMode={setActiveViewMode}
          onSelectVoiceMemo={onSelectVoiceMemo}
          onUpdateRoom={onUpdateRoom}
          onSwitchTo3D={onSwitchTo3D}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP EDGE: FLOATING DYNAMIC ISLAND & DROPDOWN (上邊隱藏式抽屜)          */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        {/* Floating Top Capsule Button */}
        <div className="flex items-center gap-2 bg-[#141923]/90 hover:bg-[#1b2230] backdrop-blur-md border border-slate-700/80 px-4 py-1.5 rounded-full shadow-2xl transition-all">
          <button
            onClick={() => setIsTopDrawerOpen(!isTopDrawerOpen)}
            className="flex items-center gap-2 text-xs font-bold text-white group"
            title="點擊展開空間資訊與視圖切換"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide">室內設計 · {roomDisplayName}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({roomWidth} × {roomLength} cm)
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${
                isTopDrawerOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div className="h-3 w-px bg-slate-700 mx-0.5" />

          {/* Quick Exit Zen Mode Button */}
          <button
            onClick={onExitZenMode}
            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-0.5 rounded-full transition"
            title="返回全功能桌面儀表"
          >
            <Minimize2 className="w-3 h-3 text-cyan-400" />
            <span>退出純淨</span>
          </button>
        </div>

        {/* Top Dropdown Drawer Panel */}
        {isTopDrawerOpen && (
          <div
            onTouchStart={(e) => {
              const touch = e.touches[0];
              touchStartPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
            }}
            onTouchEnd={(e) => {
              if (!touchStartPos.current) return;
              const dy = e.changedTouches[0].clientY - touchStartPos.current.y;
              if (dy < -40) {
                setIsTopDrawerOpen(false);
                triggerGestureNotice('🖐️ 手勢向上滑動：收合頂部空間資訊');
              }
              touchStartPos.current = null;
            }}
            className="mt-2 w-[420px] max-w-[90vw] bg-[#121622]/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl p-4 text-xs space-y-3.5 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-slate-700/70 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>當前空間放樣資訊</span>
              </span>
              <button
                onClick={() => setIsTopDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#1a2130] p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">測量面積</div>
                <div className="text-sm font-bold font-mono text-cyan-300">
                  {((roomWidth * roomLength) / 10000).toFixed(2)} m²
                </div>
              </div>
              <div className="bg-[#1a2130] p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">大梁淨高 (FL)</div>
                <div className="text-sm font-bold font-mono text-emerald-400">
                  +{roomBeamHeight} cm
                </div>
              </div>
              <div className="bg-[#1a2130] p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">天花降板 (FL)</div>
                <div className="text-sm font-bold font-mono text-amber-400">
                  +{roomCeilingDrop} cm
                </div>
              </div>
            </div>

            {/* View Switching Pills */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 font-semibold">視圖切換</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setActiveViewMode('staking');
                    setIsTopDrawerOpen(false);
                  }}
                  className={`py-1.5 rounded-xl border text-center font-semibold transition ${
                    activeViewMode === 'staking'
                      ? 'bg-cyan-950/80 border-cyan-500 text-white'
                      : 'bg-[#181e2b] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  2D 尺寸放樣
                </button>
                <button
                  onClick={() => {
                    setActiveViewMode('ceiling_drop');
                    setIsTopDrawerOpen(false);
                  }}
                  className={`py-1.5 rounded-xl border text-center font-semibold transition ${
                    activeViewMode === 'ceiling_drop'
                      ? 'bg-amber-950/80 border-amber-500 text-white'
                      : 'bg-[#181e2b] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  天花降板投影
                </button>
                <button
                  onClick={() => {
                    setActiveViewMode('mep');
                    setIsTopDrawerOpen(false);
                  }}
                  className={`py-1.5 rounded-xl border text-center font-semibold transition ${
                    activeViewMode === 'mep'
                      ? 'bg-indigo-950/80 border-indigo-500 text-white'
                      : 'bg-[#181e2b] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  水電弱電點位
                </button>
              </div>
            </div>

            {/* 3D and Full Export */}
            <div className="flex items-center justify-between pt-1">
              {onSwitchTo3D && (
                <button
                  onClick={() => {
                    setIsTopDrawerOpen(false);
                    onSwitchTo3D();
                  }}
                  className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 font-semibold"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>進入 3D 即時空間走查</span>
                </button>
              )}
              <button
                onClick={onExportDxf}
                className="flex items-center gap-1 text-slate-300 hover:text-emerald-300 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>匯出當前 DXF</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. LEFT EDGE: SLIDE-OUT ROOM & LAYER DRAWER (左邊隱藏式抽屜)              */}
      {/* ========================================================================= */}
      {/* Left Edge Tab Trigger */}
      {!isUltraClean && !isLeftDrawerOpen && (
        <button
          onClick={() => setIsLeftDrawerOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#141923]/90 hover:bg-[#1e2536] backdrop-blur-md border-r border-y border-cyan-500/40 text-cyan-300 hover:text-white px-1.5 py-4 rounded-r-2xl shadow-2xl flex flex-col items-center gap-2 transition-all active:scale-95"
          title="展開空間清單與圖層"
        >
          <ChevronRight className="w-4 h-4" />
          <span
            className="text-[10px] font-bold tracking-widest text-slate-300"
            style={{ writingMode: 'vertical-rl' }}
          >
            空間 · 圖層
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </button>
      )}

      {/* Left Slide-out Drawer */}
      {isLeftDrawerOpen && (
        <>
          <div
            onClick={() => setIsLeftDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30"
          />
          <div
            onTouchStart={(e) => {
              const touch = e.touches[0];
              touchStartPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
            }}
            onTouchEnd={(e) => {
              if (!touchStartPos.current) return;
              const dx = e.changedTouches[0].clientX - touchStartPos.current.x;
              if (dx < -40) {
                setIsLeftDrawerOpen(false);
                triggerGestureNotice('🖐️ 手勢向左滑動：收合左側空間清單');
              }
              touchStartPos.current = null;
            }}
            className="absolute left-0 top-0 bottom-0 w-72 sm:w-80 bg-[#121622]/98 backdrop-blur-xl border-r border-slate-700/80 z-40 p-4 flex flex-col shadow-2xl animate-slideRight text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <span className="font-bold text-white flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>空間清單與放樣圖層</span>
              </span>
              <button
                onClick={() => setIsLeftDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Room Switcher List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                室內設計 全室空間
              </div>
              <div className="space-y-1.5">
                {allRooms.map((r) => {
                  const isSelected = r.id === room.id;
                  const rName = r.roomName || (r as any).name || '空間';
                  const rW = r.width || 480;
                  const rL = r.length || (r as any).depth || 380;
                  const rBH = r.beamHeight || 265;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        onSelectRoom(r.id);
                        setIsLeftDrawerOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-500 text-white font-bold shadow-md'
                          : 'bg-[#161c28] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs flex items-center gap-1.5">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                          <span>{rName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {rW} × {rL} cm · 梁高 {rBH}
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-1.5 py-0.5 rounded-md">
                        {r.voiceMemos?.length || 0} 標註
                      </span>
                    </div>
                  );
                })}
              </div>

              {onAddRoom && (
                <button
                  onClick={() => {
                    onAddRoom();
                    setIsLeftDrawerOpen(false);
                  }}
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-dashed border-slate-700 flex items-center justify-center gap-1.5 transition text-xs mt-2"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>新增丈量空間</span>
                </button>
              )}

              {/* Layer Toggles */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                  放樣圖層可視性
                </div>
                <div className="space-y-1.5">
                  {[
                    { id: 'staking', name: '2D 尺寸墨線放樣', color: 'text-cyan-400' },
                    { id: 'voice_match', name: '口說語音定錨點位', color: 'text-rose-400' },
                    { id: 'ceiling_drop', name: '天花降板投影與穿梁', color: 'text-amber-400' },
                    { id: 'mep', name: '水電強弱電插座標高', color: 'text-indigo-400' },
                  ].map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => {
                        setActiveViewMode(layer.id as any);
                        onNotify(`已切換至「${layer.name}」圖層`);
                      }}
                      className={`p-2 rounded-xl border cursor-pointer flex items-center justify-between ${
                        activeViewMode === layer.id
                          ? 'bg-slate-800 border-cyan-500/70 text-white font-semibold'
                          : 'bg-[#151a24] border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={layer.color}>{layer.name}</span>
                      {activeViewMode === layer.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. RIGHT EDGE: SLIDE-OUT GEOMETRY CONTRACT DRAWER (右邊隱藏式抽屜)        */}
      {/* ========================================================================= */}
      {/* Right Edge Tab Trigger */}
      {!isUltraClean && !isRightDrawerOpen && (
        <button
          onClick={() => setIsRightDrawerOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-[#141923]/90 hover:bg-[#1e2536] backdrop-blur-md border-l border-y border-emerald-500/40 text-emerald-300 hover:text-white px-1.5 py-4 rounded-l-2xl shadow-2xl flex flex-col items-center gap-2 transition-all active:scale-95"
          title="展開5 倍數契約快速微調"
        >
          <ChevronLeft className="w-4 h-4" />
          <span
            className="text-[10px] font-bold tracking-widest text-emerald-300"
            style={{ writingMode: 'vertical-rl' }}
          >
            幾何契約 · 5倍數
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Right Slide-out Drawer */}
      {isRightDrawerOpen && (
        <>
          <div
            onClick={() => setIsRightDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30"
          />
          <div
            onTouchStart={(e) => {
              const touch = e.touches[0];
              touchStartPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
            }}
            onTouchEnd={(e) => {
              if (!touchStartPos.current) return;
              const dx = e.changedTouches[0].clientX - touchStartPos.current.x;
              if (dx > 40) {
                setIsRightDrawerOpen(false);
                triggerGestureNotice('🖐️ 手勢向右滑動：收合右側契約速調');
              }
              touchStartPos.current = null;
            }}
            className="absolute right-0 top-0 bottom-0 w-80 sm:w-88 bg-[#121622]/98 backdrop-blur-xl border-l border-slate-700/80 z-40 p-4 flex flex-col shadow-2xl animate-slideLeft text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <span className="font-bold text-white flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>5 倍數契約速調</span>
              </span>
              <button
                onClick={() => setIsRightDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Geometry Steppers and Presets */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {/* 1. 大梁淨高 (Beam Height) */}
              <div className="bg-[#171d2b] p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">大梁淨高 (Beam Clearance)</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {roomBeamHeight} cm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustHeight('beamHeight', -5)}
                    className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono font-bold"
                  >
                    -5 cm
                  </button>
                  <button
                    onClick={() => adjustHeight('beamHeight', 5)}
                    className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono font-bold"
                  >
                    +5 cm
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[260, 265, 270, 275].map((val) => (
                    <button
                      key={val}
                      onClick={() => setPresetHeight('beamHeight', val)}
                      className={`py-1 rounded-lg text-center font-mono font-bold transition ${
                        roomBeamHeight === val
                          ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                          : 'bg-[#121620] text-slate-400 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. 天花降板 (Drop Ceiling) */}
              <div className="bg-[#171d2b] p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">天花降板 (Drop Ceiling)</span>
                  <span className="font-mono text-amber-400 font-bold text-sm">
                    {roomCeilingDrop} cm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustHeight('ceilingDrop', -5)}
                    className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono font-bold"
                  >
                    -5 cm
                  </button>
                  <button
                    onClick={() => adjustHeight('ceilingDrop', 5)}
                    className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono font-bold"
                  >
                    +5 cm
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[225, 230, 235].map((val) => (
                    <button
                      key={val}
                      onClick={() => setPresetHeight('ceilingDrop', val)}
                      className={`py-1 rounded-lg text-center font-mono font-bold transition ${
                        roomCeilingDrop === val
                          ? 'bg-amber-950 border border-amber-500 text-amber-300'
                          : 'bg-[#121620] text-slate-400 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 開間尺寸微調 (Width & Length) */}
              <div className="bg-[#171d2b] p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white">空間開間尺寸 (面寬 × 進深)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#121620] p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">面寬 (Width)</div>
                    <div className="flex items-center justify-between mt-1">
                      <button
                        onClick={() =>
                          onUpdateRoom({ ...room, width: Math.max(100, roomWidth - 5) })
                        }
                        className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold"
                      >
                        -5
                      </button>
                      <span className="font-mono font-bold text-cyan-300">{roomWidth}</span>
                      <button
                        onClick={() => onUpdateRoom({ ...room, width: roomWidth + 5 })}
                        className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#121620] p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">進深 (Length)</div>
                    <div className="flex items-center justify-between mt-1">
                      <button
                        onClick={() =>
                          onUpdateRoom({ ...room, length: Math.max(100, roomLength - 5) })
                        }
                        className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold"
                      >
                        -5
                      </button>
                      <span className="font-mono font-bold text-cyan-300">{roomLength}</span>
                      <button
                        onClick={() => onUpdateRoom({ ...room, length: roomLength + 5 })}
                        className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-Multiple Check Summary Badge */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-[11px] text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  所有高程均符合 5 倍數原則 (FL+265、FL+230、檯面+80)，可直接發單至一線 CAD 晶晶。
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 5. BOTTOM EDGE: FLOATING DOCK & SLIDE-UP DRAWER (下邊隱藏式抽屜)           */}
      {/* ========================================================================= */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        {/* Slide-Up Bottom Drawer (Adaptive Prioritized Tools) */}
        {isBottomDrawerOpen && (
          <>
            <div
              onClick={() => setIsBottomDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30"
            />
            <div
              onTouchStart={(e) => {
                const touch = e.touches[0];
                touchStartPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
              }}
              onTouchEnd={(e) => {
                if (!touchStartPos.current) return;
                const dy = e.changedTouches[0].clientY - touchStartPos.current.y;
                if (dy > 45) {
                  setIsBottomDrawerOpen(false);
                  triggerGestureNotice('🖐️ 手勢向下滑動：收合快捷工具池');
                }
                touchStartPos.current = null;
              }}
              className="relative mb-3 w-[740px] max-w-[94vw] max-h-[78vh] overflow-y-auto bg-[#121622]/98 backdrop-blur-xl border border-slate-700/90 rounded-3xl shadow-2xl p-4 sm:p-5 z-40 animate-slideUp text-xs space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5 sticky top-0 bg-[#121622]/95 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-cyan-600/20 text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-bold text-white text-sm">設計師快捷工具池</span>
                    <p className="text-[10px] text-slate-400">
                      根據當前丈量狀態「
                      {activeViewMode === 'staking'
                        ? '2D 尺寸放樣'
                        : activeViewMode === 'ceiling_drop'
                        ? '天花降板投影'
                        : activeViewMode === 'mep'
                        ? '水電弱電點位'
                        : '口說語音標註'}
                      」自動優先置頂關鍵工具
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBottomDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* === Adaptive State-Prioritized Staking Toolbar Block === */}
              <div className="p-3 rounded-2xl bg-[#141a27] border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      當前丈量優先工具 (
                      {activeViewMode === 'staking'
                        ? '2D 尺寸放樣'
                        : activeViewMode === 'ceiling_drop'
                        ? '天花與穿梁'
                        : activeViewMode === 'mep'
                        ? '水電開關插座'
                        : '語音定錨'}
                      )
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400">一鍵精準套用</span>
                </div>

                {/* Content according to activeViewMode */}
                {activeViewMode === 'staking' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => {
                        onUpdateRoom({ ...room, width: roomWidth + 5 });
                        onNotify('面寬增加 5 cm (符合5倍數)');
                      }}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-cyan-500/40 text-cyan-200 text-center font-bold transition active:scale-95"
                    >
                      面寬 +5cm ({roomWidth + 5})
                    </button>
                    <button
                      onClick={() => {
                        onUpdateRoom({ ...room, width: Math.max(100, roomWidth - 5) });
                        onNotify('面寬減少 5 cm (符合5倍數)');
                      }}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-cyan-500/40 text-cyan-200 text-center font-bold transition active:scale-95"
                    >
                      面寬 -5cm ({roomWidth - 5})
                    </button>
                    <button
                      onClick={() => {
                        onUpdateRoom({ ...room, length: roomLength + 5 });
                        onNotify('進深增加 5 cm (符合5倍數)');
                      }}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-cyan-500/40 text-cyan-200 text-center font-bold transition active:scale-95"
                    >
                      進深 +5cm ({roomLength + 5})
                    </button>
                    <button
                      onClick={() => {
                        onUpdateRoom({ ...room, length: Math.max(100, roomLength - 5) });
                        onNotify('進深減少 5 cm (符合5倍數)');
                      }}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-cyan-500/40 text-cyan-200 text-center font-bold transition active:scale-95"
                    >
                      進深 -5cm ({roomLength - 5})
                    </button>
                  </div>
                )}

                {activeViewMode === 'ceiling_drop' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => setPresetHeight('beamHeight', 265)}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-emerald-500/40 text-emerald-200 text-center font-bold transition active:scale-95"
                    >
                      梁底 265 cm (標準)
                    </button>
                    <button
                      onClick={() => setPresetHeight('ceilingDrop', 230)}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-amber-500/40 text-amber-200 text-center font-bold transition active:scale-95"
                    >
                      冷氣降板 230 cm
                    </button>
                    <button
                      onClick={() => {
                        onUpdateRoom({ ...room, bathKitchenDrop: 215 });
                        onNotify('已設定廚衛降板高程：215 cm');
                      }}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-cyan-500/40 text-cyan-200 text-center font-bold transition active:scale-95"
                    >
                      廚衛降板 215 cm
                    </button>
                    <button
                      onClick={() => {
                        setIsBottomDrawerOpen(false);
                        onOpenElevationSlice();
                      }}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-purple-500/40 text-purple-200 text-center font-bold transition active:scale-95"
                    >
                      固定 FL+80 立面切圖
                    </button>
                  </div>
                )}

                {activeViewMode === 'mep' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAddQuickMepPoint('socket_110v', 30, '一般插座 110V')}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-indigo-500/40 text-indigo-200 text-center font-bold transition active:scale-95"
                    >
                      + 110V 插座 (FL+30)
                    </button>
                    <button
                      onClick={() => handleAddQuickMepPoint('socket_220v', 30, '冷氣專用插座 220V')}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-rose-500/40 text-rose-200 text-center font-bold transition active:scale-95"
                    >
                      + 220V 專插 (FL+30)
                    </button>
                    <button
                      onClick={() => handleAddQuickMepPoint('switch', 120, '室內總切開關')}
                      className="p-2 rounded-xl bg-[#202738] hover:bg-[#2c364e] border border-amber-500/40 text-amber-200 text-center font-bold transition active:scale-95"
                    >
                      + 開關總切 (FL+120)
                    </button>
                  </div>
                )}

                {activeViewMode === 'voice_match' && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#1a2130]">
                    <span className="text-slate-300">
                      口說丈量語音辨識已啟用，點選底部麥克風即可單手定錨現場備忘。
                    </span>
                    <button
                      onClick={toggleRecording}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition active:scale-95"
                    >
                      {isRecording ? '停止錄音' : '立即錄音'}
                    </button>
                  </div>
                )}
              </div>

              {/* Exact User Screenshot Action Buttons Grid */}
              <div className="space-y-3 pt-1">
                {/* Highlighted 5 Features from User Screenshot */}
                <div className="p-2.5 rounded-2xl bg-[#141a27] border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>現場測驗必備功能 (New User Request)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">點擊隨時啟動測驗</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {onOpenDrawingHabits && (
                      <button
                        onClick={() => {
                          setIsBottomDrawerOpen(false);
                          onOpenDrawingHabits();
                        }}
                        className="p-2 rounded-xl bg-[#242936] hover:bg-[#32394c] border border-slate-700/80 text-white font-medium text-xs text-center transition active:scale-95"
                      >
                        繪製保存習慣
                      </button>
                    )}
                    {onOpenElevationBenchmark && (
                      <button
                        onClick={() => {
                          setIsBottomDrawerOpen(false);
                          onOpenElevationBenchmark();
                        }}
                        className="p-2 rounded-xl bg-[#242936] hover:bg-[#32394c] border border-slate-700/80 text-white font-medium text-xs text-center transition active:scale-95"
                      >
                        立面基準基準
                      </button>
                    )}
                    {onOpenIpadHiddenMenu && (
                      <button
                        onClick={() => {
                          setIsBottomDrawerOpen(false);
                          onOpenIpadHiddenMenu();
                        }}
                        className="p-2 rounded-xl bg-[#242936] hover:bg-[#32394c] border border-slate-700/80 text-white font-medium text-xs text-center transition active:scale-95"
                      >
                        iPad隱藏式選單
                      </button>
                    )}
                    {onOpenPanoramicGuide && (
                      <button
                        onClick={() => {
                          setIsBottomDrawerOpen(false);
                          onOpenPanoramicGuide();
                        }}
                        className="p-2 rounded-xl bg-[#242936] hover:bg-[#32394c] border border-slate-700/80 text-white font-medium text-xs text-center transition active:scale-95"
                      >
                        360度攝影視覺指引
                      </button>
                    )}
                    {onOpenAuditDistribution && (
                      <button
                        onClick={() => {
                          setIsBottomDrawerOpen(false);
                          onOpenAuditDistribution();
                        }}
                        className="p-2 rounded-xl bg-[#242936] hover:bg-[#32394c] border border-slate-700/80 text-white font-medium text-xs text-center transition active:scale-95"
                      >
                        審計分佈圖
                      </button>
                    )}
                  </div>
                </div>

                {/* Other Designer Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                {/* 1. 實作SketchUp自動轉檔 */}
                <button
                  onClick={() => {
                    setIsBottomDrawerOpen(false);
                    onOpenSketchUp();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#242936] hover:bg-[#32394c] text-white text-xs font-semibold border border-slate-700/80 hover:border-purple-400/80 shadow-md transition-all active:scale-95 text-left"
                >
                  <Box className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-bold">實作SketchUp自動轉檔</div>
                    <div className="text-[10px] text-slate-400">1:1 3D 放樣切圖 DXF 模型</div>
                  </div>
                </button>

                {/* 2. 自動化合規稽核分析 */}
                <button
                  onClick={() => {
                    setIsBottomDrawerOpen(false);
                    onOpenComplianceReport();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#242936] hover:bg-[#32394c] text-white text-xs font-semibold border border-slate-700/80 hover:border-emerald-400/80 shadow-md transition-all active:scale-95 text-left"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">自動化合規稽核分析</div>
                    <div className="text-[10px] text-slate-400">5倍數契約與法規檢核報告</div>
                  </div>
                </button>

                {/* 3. 創辦360攝影教學 */}
                <button
                  onClick={() => {
                    setIsBottomDrawerOpen(false);
                    onOpenScanTutorial();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#242936] hover:bg-[#32394c] text-white text-xs font-semibold border border-slate-700/80 hover:border-cyan-400/80 shadow-md transition-all active:scale-95 text-left"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold">創辦360攝影教學</div>
                    <div className="text-[10px] text-slate-400">iPad 超廣角全室丈量步驟指南</div>
                  </div>
                </button>

                {/* 4. 新增 CAD 擷取預覽 */}
                <button
                  onClick={() => {
                    setIsBottomDrawerOpen(false);
                    onOpenDesignerExtractor();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#242936] hover:bg-[#32394c] text-white text-xs font-semibold border border-slate-700/80 hover:border-indigo-400/80 shadow-md transition-all active:scale-95 text-left"
                >
                  <Scissors className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-bold">新增 CAD 擷取預覽</div>
                    <div className="text-[10px] text-slate-400">立面80cm基準切圖與樣式上傳</div>
                  </div>
                </button>

                {/* 5. 自動化立面片 (New User Screenshot 1) */}
                <button
                  onClick={() => {
                    setIsBottomDrawerOpen(false);
                    onOpenElevationSlice();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#242936] hover:bg-[#32394c] text-white text-xs font-semibold border border-slate-700/80 hover:border-amber-400/80 shadow-md transition-all active:scale-95 text-left"
                >
                  <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold">自動化立面片</div>
                    <div className="text-[10px] text-slate-400">直切A/B/C/D立面展開圖</div>
                  </div>
                </button>

                {/* 6. CAD樣式同步 (New User Screenshot 2) */}
                <button
                  onClick={() => {
                    setIsBottomDrawerOpen(false);
                    onOpenCadStyleSync();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#242936] hover:bg-[#32394c] text-white text-xs font-semibold border border-slate-700/80 hover:border-blue-400/80 shadow-md transition-all active:scale-95 text-left"
                >
                  <Sliders className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="font-bold">CAD樣式同步</div>
                    <div className="text-[10px] text-slate-400">7大圖層標準與文字線寬同步</div>
                  </div>
                </button>

                {/* 7. 步驟攝影導航 (New User Screenshot 3) */}
                <button
                  onClick={() => {
                    setIsBottomDrawerOpen(false);
                    onOpenStepPhotoNav();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#242936] hover:bg-[#32394c] text-white text-xs font-semibold border border-slate-700/80 hover:border-rose-400/80 shadow-md transition-all active:scale-95 text-left"
                >
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-bold">步驟攝影導航</div>
                    <div className="text-[10px] text-slate-400">空間順時針繞圈水平相機校正</div>
                  </div>
                </button>

                {/* 8. 匯出標準 DXF 施工圖 */}
                <button
                  onClick={() => {
                    setIsBottomDrawerOpen(false);
                    onExportDxf();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#242936] hover:bg-[#32394c] text-white text-xs font-semibold border border-slate-700/80 hover:border-emerald-400/80 shadow-md transition-all active:scale-95 text-left"
                >
                  <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">匯出 .DXF 施工圖</div>
                    <div className="text-[10px] text-slate-400">AutoCAD 2004/2018 格式</div>
                  </div>
                </button>

                {/* 9. Google API 派發台 */}
                <button
                  onClick={() => {
                    setIsBottomDrawerOpen(false);
                    onOpenGoogleApiIde();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/80 hover:to-indigo-800/80 text-white text-xs font-semibold border border-cyan-500/60 shadow-md transition-all active:scale-95 text-left"
                >
                  <Terminal className="w-4 h-4 text-cyan-300 shrink-0" />
                  <div>
                    <div className="font-bold">Google API 派發台</div>
                    <div className="text-[10px] text-cyan-300">Gemini 幾何契約與晶晶派圖</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
        )}

        {/* Dynamic Contextual Staking Micro-Bar (依當前丈量狀態自動優先呈現最關鍵放樣工具，保持畫面超純淨) */}
        {!isUltraClean && !isBottomDrawerOpen && (
          <div className="mb-2 flex items-center gap-1.5 bg-[#141923]/90 backdrop-blur-md border border-slate-700/80 px-3 py-1 rounded-full text-[11px] shadow-lg animate-fadeIn">
            <span className="font-bold text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {activeViewMode === 'staking' && '2D放樣'}
              {activeViewMode === 'ceiling_drop' && '天花高程'}
              {activeViewMode === 'mep' && '水電點位'}
              {activeViewMode === 'voice_match' && '語音定錨'}
            </span>
            <div className="h-2.5 w-px bg-slate-700 mx-0.5" />

            {/* Micro Quick Controls for Current State */}
            {activeViewMode === 'staking' && (
              <div className="flex items-center gap-1 text-slate-300 font-mono text-[10px]">
                <span>
                  {roomWidth}×{roomLength}
                </span>
                <button
                  onClick={() => onUpdateRoom({ ...room, width: roomWidth + 5 })}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-cyan-300 font-bold active:scale-95"
                  title="面寬 +5cm"
                >
                  寬+5
                </button>
                <button
                  onClick={() => onUpdateRoom({ ...room, length: roomLength + 5 })}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-cyan-300 font-bold active:scale-95"
                  title="進深 +5cm"
                >
                  長+5
                </button>
              </div>
            )}

            {activeViewMode === 'ceiling_drop' && (
              <div className="flex items-center gap-1 text-slate-300 font-mono text-[10px]">
                <span className="text-emerald-400">梁{roomBeamHeight}</span>
                <span className="text-amber-400">降{roomCeilingDrop}</span>
                <button
                  onClick={() => setPresetHeight('ceilingDrop', 230)}
                  className="px-1.5 py-0.5 bg-amber-950 border border-amber-600/50 rounded text-amber-300 font-bold active:scale-95"
                >
                  230
                </button>
                <button
                  onClick={() => setPresetHeight('beamHeight', 265)}
                  className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-600/50 rounded text-emerald-300 font-bold active:scale-95"
                >
                  265
                </button>
              </div>
            )}

            {activeViewMode === 'mep' && (
              <div className="flex items-center gap-1 text-slate-300 text-[10px]">
                <button
                  onClick={() => handleAddQuickMepPoint('socket_110v', 30, '插座 110V')}
                  className="px-1.5 py-0.5 bg-indigo-950 border border-indigo-500/50 rounded text-indigo-300 font-bold active:scale-95"
                >
                  +插座(+30)
                </button>
                <button
                  onClick={() => handleAddQuickMepPoint('switch', 120, '開關')}
                  className="px-1.5 py-0.5 bg-amber-950 border border-amber-500/50 rounded text-amber-300 font-bold active:scale-95"
                >
                  +開關(+120)
                </button>
              </div>
            )}

            {activeViewMode === 'voice_match' && (
              <span className="text-[10px] text-rose-300 font-medium">大拇指輕點錄音定錨</span>
            )}
          </div>
        )}

        {/* Floating Bottom Dock Pill Controls */}
        <div className="flex items-center gap-2 bg-[#141923]/95 hover:bg-[#19202e] backdrop-blur-md border border-slate-700/80 p-1.5 rounded-full shadow-2xl transition-all">
          {/* Main Thumb Voice Recording Button */}
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-95 shadow-md ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-900/50'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
            }`}
            title="點擊開始口說錄音丈量 (手指大拇指最順手位置)"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecording ? '聆聽中 (點擊完成)' : '口說丈量'}</span>
          </button>

          {/* Expand 7 Screenshot Actions Drawer */}
          <button
            onClick={() => setIsBottomDrawerOpen(!isBottomDrawerOpen)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#232938] hover:bg-[#30384c] text-white text-xs font-semibold border border-slate-700/80 transition-all active:scale-95"
            title="展開設計師 7 大自訂快捷選單 (實作SketchUp, 合規分析, 360攝影, CAD預覽, 立面片, 樣式同步, 步驟導航)"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>快捷選單 (7)</span>
            <ChevronUp
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                isBottomDrawerOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Ultra Clean Toggle */}
          <button
            onClick={() => {
              setIsUltraClean(!isUltraClean);
              onNotify(
                !isUltraClean
                  ? '✨ 已啟用「極致純淨畫布」：隱藏邊緣把手，點擊底座可隨時復原'
                  : '🌿 已還原四向邊緣操作把手'
              );
            }}
            className={`p-2 rounded-full border transition ${
              isUltraClean
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                : 'bg-[#1e2433] border-slate-700/80 text-slate-400 hover:text-white'
            }`}
            title="暫時隱藏左右把手，給予極致 100% 滿版畫布"
          >
            {isUltraClean ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
